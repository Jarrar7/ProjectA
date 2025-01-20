import { supabaseService } from "../../../../lib/supabaseServiceClient";
import axios from "axios"; // For calling the Python face encoding service
import FormData from "form-data";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { session_id, photo_urls } = await request.json(); // Expect session_id and photo URLs

        if (!session_id || !photo_urls || photo_urls.length === 0) {
            console.error("Invalid input: session_id or photo_urls missing.");
            return NextResponse.json({ message: "Invalid input" }, { status: 400 });
        }

        // Fetch all face encodings from the profiles table
        const { data: profiles, error: profilesFetchError } = await supabaseService
            .from("profiles")
            .select("id, face_encoding");

        if (profilesFetchError) {
            console.error("Profiles Fetch Error:", profilesFetchError);
            return NextResponse.json({ message: "Failed to fetch student profiles" }, { status: 400 });
        }

        // Filter out profiles with null or invalid face encodings
        const validProfiles = profiles.filter((profile) => Array.isArray(profile.face_encoding));
        if (validProfiles.length === 0) {
            console.warn("No valid profiles with face encodings found.");
            return NextResponse.json({ message: "No valid student profiles found" }, { status: 400 });
        }

        console.log("Valid profiles for matching:", validProfiles);

        // Prepare to track attendance
        const attendanceMap = new Map(); // Map to track attendance: student_id => attended_hours
        let totalHours = 0; // Track total hours based on the number of photos processed

        for (const photoUrl of photo_urls) {
            // Step 1: Download the photo from Supabase storage
            const { data: photoData, error: photoFetchError } = await supabaseService.storage
                .from("attendance-photos")
                .download(photoUrl);

            if (photoFetchError) {
                console.error(`Photo Fetch Error for ${photoUrl}:`, photoFetchError);
                totalHours++; // Increment total hours even if the photo failed to process
                continue; // Skip this photo
            }

            const photoBuffer = Buffer.from(await photoData.arrayBuffer());
            console.log(`Photo Buffer Length for ${photoUrl}:`, photoBuffer.length);

            // Step 2: Send the photo to the Python face encoding service
            let detectedEncodings = [];
            try {
                const formData = new FormData();
                formData.append("image", photoBuffer, { filename: "photo.jpg" });

                const response = await axios.post("http://127.0.0.1:5000/encode", formData, {
                    headers: formData.getHeaders(),
                });

                detectedEncodings = response.data.encodings; // Get detected face encodings
                console.log(`Python Service Raw Response for ${photoUrl}:`, response.data);

                if (!detectedEncodings || detectedEncodings.length === 0) {
                    console.warn(`No face encodings detected in photo: ${photoUrl}`);
                    totalHours++; // Increment total hours even if no faces are detected
                    continue; // Skip this photo
                }
            } catch (encodingError) {
                console.error("Face Encoding Service Error:", encodingError);
                totalHours++; // Increment total hours even if the encoding service fails
                continue; // Skip this photo
            }

            // Step 3: Match detected encodings with stored profiles
            for (const detectedEncoding of detectedEncodings) {
                if (!Array.isArray(detectedEncoding)) {
                    console.error("Invalid detected encoding:", detectedEncoding);
                    continue;
                }

                for (const profile of validProfiles) {
                    const storedEncoding = profile.face_encoding;

                    if (!Array.isArray(storedEncoding)) {
                        console.error(`Invalid stored encoding for profile ID ${profile.id}`);
                        continue;
                    }

                    const distance = calculateDistance(storedEncoding, detectedEncoding);
                    console.log(`Distance between stored and detected encoding: ${distance}`);

                    if (distance < 0.6) {
                        // Increment attended_hours for this student
                        attendanceMap.set(
                            profile.id,
                            (attendanceMap.get(profile.id) || 0) + 1
                        );
                    }
                }
            }

            totalHours++; // Increment total hours for successfully processed photo
        }

        console.log("Attendance Map (before updates):", Array.from(attendanceMap.entries()));
        console.log("Total Hours:", totalHours);

        // Step 4: Update attendance records
        for (const [studentId, attendedHours] of attendanceMap.entries()) {
            try {
                // Fetch or create an attendance record
                const { data: existingRecord, error: fetchError } = await supabaseService
                    .from("attendance_records")
                    .select("*")
                    .eq("session_id", session_id)
                    .eq("student_id", studentId)
                    .single();

                if (fetchError && fetchError.code !== "PGRST116") {
                    console.error(`Error fetching attendance record for student ${studentId}:`, fetchError);
                    continue;
                }

                if (!existingRecord) {
                    // Insert a new record if none exists
                    const { error: insertError } = await supabaseService
                        .from("attendance_records")
                        .insert({
                            session_id,
                            student_id: studentId,
                            attended_hours: attendedHours,
                            total_hours: totalHours,
                        });

                    if (insertError) {
                        console.error(`Error inserting attendance record for student ${studentId}:`, insertError);
                        continue;
                    }
                } else {
                    // Update attended_hours and total_hours for the existing record
                    const { error: updateError } = await supabaseService
                        .from("attendance_records")
                        .update({
                            attended_hours: existingRecord.attended_hours + attendedHours,
                            total_hours: totalHours,
                        })
                        .eq("session_id", session_id)
                        .eq("student_id", studentId);

                    if (updateError) {
                        console.error(`Error updating attendance for student ${studentId}:`, updateError);
                    }
                }
            } catch (error) {
                console.error(`Unexpected error while updating attendance for student ${studentId}:`, error);
            }
        }

        return NextResponse.json({ message: "Attendance updated successfully!" });
    } catch (error) {
        console.error("Error during attendance update:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Utility function to calculate distance between two encodings
function calculateDistance(encoding1, encoding2) {
    if (!Array.isArray(encoding1) || !Array.isArray(encoding2)) {
        console.error("Invalid encoding passed to calculateDistance:", { encoding1, encoding2 });
        return Number.MAX_VALUE; // High distance to avoid matching
    }
    if (encoding1.length !== encoding2.length) {
        console.error("Encoding lengths do not match:", { encoding1, encoding2 });
        return Number.MAX_VALUE;
    }
    return Math.sqrt(
        encoding1.reduce((sum, val, idx) => sum + Math.pow(val - encoding2[idx], 2), 0)
    );
}
