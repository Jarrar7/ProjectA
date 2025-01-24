import { supabaseService } from "../../../../lib/supabaseServiceClient";
import axios from "axios";
import FormData from "form-data";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { session_id, photo_urls } = await request.json();

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

        const validProfiles = profiles.filter((profile) => Array.isArray(profile.face_encoding));
        if (validProfiles.length === 0) {
            console.warn("No valid profiles with face encodings found.");
            return NextResponse.json({ message: "No valid student profiles found" }, { status: 400 });
        }

        console.log("Valid profiles for matching:", validProfiles);

        const attendanceMap = new Map();
        const lenientMatches = [];
        const studentMaxHours = {};

        // Fetch attendance records to populate total_hours for each student
        const { data: attendanceRecords, error: attendanceFetchError } = await supabaseService
            .from("attendance_records")
            .select("student_id, total_hours, attended_hours")
            .eq("session_id", session_id);

        if (attendanceFetchError) {
            console.error("Attendance Records Fetch Error:", attendanceFetchError);
            return NextResponse.json({ message: "Failed to fetch attendance records" }, { status: 400 });
        }

        attendanceRecords.forEach((record) => {
            studentMaxHours[record.student_id] = record.total_hours || 0;
        });

        console.log("Student Max Hours Map:", studentMaxHours);

        for (const photoUrl of photo_urls) {
            const { data: photoData, error: photoFetchError } = await supabaseService.storage
                .from("attendance-photos")
                .download(photoUrl);

            if (photoFetchError) {
                console.error(`Photo Fetch Error for ${photoUrl}:`, photoFetchError);
                continue;
            }

            const photoBuffer = Buffer.from(await photoData.arrayBuffer());
            let detectedEncodings = [];
            try {
                const formData = new FormData();
                formData.append("image", photoBuffer, { filename: "photo.jpg" });

                const response = await axios.post("http://127.0.0.1:5000/encode", formData, {
                    headers: formData.getHeaders(),
                });

                detectedEncodings = response.data.encodings;

                if (!detectedEncodings || detectedEncodings.length === 0) {
                    console.warn(`No face encodings detected in photo: ${photoUrl}`);
                    continue;
                }
            } catch (encodingError) {
                console.error("Face Encoding Service Error:", encodingError);
                continue;
            }

            const matchedStudents = new Set();

            // Strict Matching
            for (const detectedEncoding of detectedEncodings) {
                let bestMatchId = null;
                let bestDistance = Infinity;

                for (const profile of validProfiles) {
                    const storedEncoding = profile.face_encoding;

                    const distance = calculateDistance(storedEncoding, detectedEncoding);

                    if (distance < 0.60 && distance < bestDistance) {
                        bestMatchId = profile.id;
                        bestDistance = distance;
                    }

                    // Lenient match collection
                    if (distance >= 0.60 && distance <= 0.65) {
                        lenientMatches.push({
                            student_id: profile.id,
                            distance,
                            photoUrl,
                        });
                    }
                }

                if (bestMatchId && !matchedStudents.has(bestMatchId)) {
                    const maxHours = photo_urls.length; // Use uploaded photos as total hours
                    const currentAttendance = attendanceMap.get(bestMatchId) || 0;

                    if (currentAttendance < maxHours) {
                        attendanceMap.set(bestMatchId, currentAttendance + 1);
                        matchedStudents.add(bestMatchId);
                    }
                }
            }
        }

        console.log("Attendance Map (before lenient review):", Array.from(attendanceMap.entries()));
        console.log("Lenient Matches for Review:", lenientMatches);

        // Process lenient matches
        lenientMatches.forEach(({ student_id, distance, photoUrl }) => {
            const maxHours = photo_urls.length; // Use uploaded photos as total hours
            const currentAttendance = attendanceMap.get(student_id) || 0;

            if (currentAttendance < maxHours) {
                console.log(
                    `Adding lenient match: Student ${student_id}, Distance: ${distance}, Photo: ${photoUrl}`
                );
                attendanceMap.set(student_id, currentAttendance + 1);
            }
        });

        // Update attendance records in Supabase
        for (const [studentId, attendedHours] of attendanceMap.entries()) {
            try {
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
                    const totalHours = photo_urls.length; // Set total hours dynamically

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
                    const totalHours = photo_urls.length; // Set total hours dynamically
                    const newAttendedHours = Math.min(existingRecord.attended_hours + attendedHours, totalHours);

                    const { error: updateError } = await supabaseService
                        .from("attendance_records")
                        .update({
                            attended_hours: newAttendedHours,
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

        return NextResponse.json({
            message: "Attendance updated successfully!",
            lenient_matches: lenientMatches,
        });
    } catch (error) {
        console.error("Error during attendance update:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// Utility function to calculate distance
function calculateDistance(encoding1, encoding2) {
    if (!Array.isArray(encoding1) || !Array.isArray(encoding2)) return Number.MAX_VALUE;
    if (encoding1.length !== encoding2.length) return Number.MAX_VALUE;

    return Math.sqrt(
        encoding1.reduce((sum, val, idx) => sum + Math.pow(val - encoding2[idx], 2), 0)
    );
}
