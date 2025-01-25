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
            .select("id, face_encoding, firstName, lastName");

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
        const boundingBoxData = {};
        const processedImages = [];
        const lenientMatchesLog = [];

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
            let detectedFaceLocations = [];
            const studentNames = []; // Collect names for the current photo

            try {
                const formData = new FormData();
                formData.append("image", photoBuffer, { filename: "photo.jpg" });

                const response = await axios.post("http://127.0.0.1:5001/encode", formData, {
                    headers: formData.getHeaders(),
                });

                detectedEncodings = response.data.encodings || [];
                detectedFaceLocations = response.data.face_locations || [];

                if (detectedEncodings.length !== detectedFaceLocations.length) {
                    console.warn(`Mismatch between encodings and face locations for ${photoUrl}`);
                    continue;
                }

                if (detectedEncodings.length === 0) {
                    console.warn(`No face encodings detected in photo: ${photoUrl}`);
                    continue;
                }

                console.log(`Detected Faces in Photo ${photoUrl}:`, detectedFaceLocations);

                const assignedStudents = new Set(); // Tracks students already matched in this photo

                for (let i = 0; i < detectedEncodings.length; i++) {
                    const detectedEncoding = detectedEncodings[i];
                    const detectedFaceLocation = detectedFaceLocations[i];
                    let bestMatch = null;
                    let bestDistance = Infinity;

                    for (const profile of validProfiles) {
                        const distance = calculateDistance(profile.face_encoding, detectedEncoding);

                        if (distance < bestDistance && !assignedStudents.has(profile.id)) {
                            bestMatch = {
                                studentId: profile.id,
                                distance,
                                faceLocation: detectedFaceLocation,
                                name: `${profile.firstName || "Unknown"} ${profile.lastName || "Unknown"}`,
                            };
                            bestDistance = distance;
                        }
                    }

                    if (bestMatch && bestDistance < 0.60) {
                        const { studentId, faceLocation, name } = bestMatch;
                        assignedStudents.add(studentId);

                        const currentAttendance = attendanceMap.get(studentId) || 0;
                        attendanceMap.set(studentId, currentAttendance + 1);

                        if (!boundingBoxData[studentId]) {
                            boundingBoxData[studentId] = [];
                        }
                        boundingBoxData[studentId].push({ photoUrl, faceLocation });

                        studentNames.push(name); // Add name for this bounding box

                        console.log(`Strict Match: Student ${studentId}, Distance: ${bestDistance}`);
                    } else if (bestMatch && bestDistance >= 0.60 && bestDistance <= 0.65) {
                        const { studentId, faceLocation, name } = bestMatch;
                        assignedStudents.add(studentId);

                        const currentAttendance = attendanceMap.get(studentId) || 0;
                        attendanceMap.set(studentId, currentAttendance + 1);

                        if (!boundingBoxData[studentId]) {
                            boundingBoxData[studentId] = [];
                        }
                        boundingBoxData[studentId].push({
                            photoUrl,
                            faceLocation,
                            confidence: "lenient",
                        });

                        studentNames.push(name); // Add name for this bounding box

                        lenientMatchesLog.push({
                            photoUrl,
                            faceLocation,
                            studentId,
                            distance: bestDistance,
                        });

                        console.log(`Lenient Match: Student ${studentId}, Distance: ${bestDistance}`);
                    } else {
                        console.warn(`No suitable match found for face in photo ${photoUrl}`);
                        studentNames.push("Unknown"); // Add "Unknown" for unmatched faces
                    }
                }

                // After processing all faces in the current photo, call /draw
                const drawFormData = new FormData();
                drawFormData.append("image", photoBuffer, { filename: "photo.jpg" });
                drawFormData.append("bounding_boxes", JSON.stringify(detectedFaceLocations));
                drawFormData.append("names", JSON.stringify(studentNames)); // Add names

                try {
                    const drawResponse = await axios.post("http://127.0.0.1:5001/draw", drawFormData, {
                        headers: drawFormData.getHeaders(),
                        responseType: "arraybuffer",
                    });

                    const processedImageBuffer = Buffer.from(drawResponse.data);

                    const processedFileName = `processed/${session_id}/${photoUrl.split("/").pop()}`;
                    const { data: uploadData, error: uploadError } = await supabaseService.storage
                        .from("processed-attendance-photos")
                        .upload(processedFileName, processedImageBuffer, {
                            contentType: "image/jpeg",
                            upsert: true,
                        });

                    if (uploadError) {
                        console.error(`Error uploading processed image for ${photoUrl}:`, uploadError);
                        continue;
                    }

                    processedImages.push(uploadData.path);
                    console.log(`Processed image uploaded: ${uploadData.path}`);
                } catch (drawError) {
                    console.error(`Error generating bounding box visualization for ${photoUrl}:`, drawError);
                }
            } catch (encodingError) {
                console.error("Face Encoding Service Error:", encodingError);
                continue;
            }
        }

        console.log("Final Attendance Map:", Array.from(attendanceMap.entries()));
        console.log("Lenient Matches Log:", lenientMatchesLog);

        for (const [studentId, attendedHours] of attendanceMap.entries()) {
            const totalHours = photo_urls.length;

            const { data: existingRecord, error: fetchError } = await supabaseService
                .from("attendance_records")
                .select("*")
                .eq("session_id", session_id)
                .eq("student_id", studentId)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                console.error(`Error fetching attendance for student ${studentId}:`, fetchError);
                continue;
            }

            if (!existingRecord) {
                const { error: insertError } = await supabaseService
                    .from("attendance_records")
                    .insert({
                        session_id,
                        student_id: studentId,
                        attended_hours: Math.min(attendedHours, totalHours),
                        total_hours: totalHours,
                    });

                if (insertError) {
                    console.error(`Error inserting attendance for student ${studentId}:`, insertError);
                }
            } else {
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
        }

        return NextResponse.json({
            message: "Attendance updated successfully!",
            attendanceMap: Array.from(attendanceMap.entries()),
            processedImages,
        });
    } catch (error) {
        console.error("Error during attendance update:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

function calculateDistance(encoding1, encoding2) {
    if (!Array.isArray(encoding1) || !Array.isArray(encoding2)) return Number.MAX_VALUE;
    return Math.sqrt(encoding1.reduce((sum, val, idx) => sum + Math.pow(val - encoding2[idx], 2), 0));
}
