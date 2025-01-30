import { supabaseService } from "../../../../lib/supabaseServiceClient";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import FormData from "form-data"; // For sending form-data
import axios from "axios"; // For calling the Python face encoding service

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function POST(request) {
    try {
        const formData = await request.formData();
        const users = JSON.parse(formData.get("users"));
        const zipFile = formData.get("zipFile");

        if (!users || users.length === 0) {
            return NextResponse.json({ message: "No users to sign up" }, { status: 400 });
        }

        if (!zipFile) {
            return NextResponse.json({ message: "ZIP file containing photos is required" }, { status: 400 });
        }

        const errors = [];
        const results = [];
        const photoURLs = {};
        const faceEncodings = {};

        // Process the ZIP file with JSZip
        const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
        const zipEntries = Object.keys(zip.files);

        if (!zipEntries || zipEntries.length === 0) {
            return NextResponse.json({ message: "Uploaded ZIP file is empty" }, { status: 400 });
        }

        for (const entryName of zipEntries) {
            const entry = zip.files[entryName];

            if (entry.dir) continue; // Skip directories

            const human_id = entryName.split(".")[0]; // Extract human_id from filename
            const filePath = `${human_id}/${entryName}`;

            // Infer MIME type
            const fileExtension = entryName.split(".").pop().toLowerCase();
            const mimeType = {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
            }[fileExtension] || "application/octet-stream";

            const fileContent = await entry.async("nodebuffer");

            // Upload photo to Supabase storage
            const { error: uploadError } = await supabaseService.storage
                .from("student-photos")
                .upload(filePath, fileContent, { contentType: mimeType, upsert: true });

            if (uploadError) {
                errors.push({ human_id, error: uploadError.message });
                continue;
            }

            photoURLs[human_id] = filePath; // Save the photo URL

            // Send the photo to the Python face encoding service
            try {
                const formData = new FormData();
                formData.append("image", fileContent, { filename: entryName });

                const response = await axios.post(`${API_URL}/encode`, formData, {
                    headers: formData.getHeaders(),
                });


                // Save the face encoding
                if (response.data && response.data.encodings && response.data.encodings.length > 0) {
                    faceEncodings[human_id] = response.data.encodings[0]; // Save the first encoding
                    console.log("Face Encoding for Human ID:", human_id, faceEncodings[human_id]);
                } else {
                    console.error(`No encoding found for Human ID: ${human_id}`);
                }

            } catch (encodingError) {
                console.error("Failed to Fetch Encoding for:", human_id, "Error:", encodingError.message);
                errors.push({ human_id, error: "Failed to generate face encoding" });
                continue;
            }
        }

        // Bulk signup users
        for (const user of users) {
            const { firstName, lastName, human_id, role, email, password } = user;

            try {
                // Create user in Supabase Auth
                const { data, error: signupError } = await supabaseService.auth.admin.createUser({
                    email,
                    password,
                    email_confirm: true,
                    user_metadata: {
                        name: `${firstName} ${lastName}`,
                        academic_role: role,
                        human_id,
                    },
                });

                if (signupError) {
                    errors.push({ email, error: signupError.message });
                    continue;
                }

                const userId = data.user.id;

                // Insert user metadata into profiles
                const { error: profileError } = await supabaseService
                    .from("profiles")
                    .insert({
                        id: userId,
                        human_id,
                        photo_url: photoURLs[human_id] || null, // Assign photo URL
                        firstName,
                        lastName,
                        role,
                        face_encoding: faceEncodings[human_id] || null, // Assign face encoding
                    });

                if (profileError) {
                    errors.push({ email, error: profileError.message });
                    continue;
                }

                results.push({ email, status: "success" });
            } catch (err) {
                console.error("Unexpected Error for User:", email, "Error:", err.message);
                errors.push({ email, error: "Unexpected error occurred" });
            }
        }

        return NextResponse.json({
            message: "Bulk signup completed",
            results,
            errors,
        });
    } catch (error) {
        console.error("Bulk Signup Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
