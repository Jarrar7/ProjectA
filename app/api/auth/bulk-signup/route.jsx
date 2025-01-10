import { supabaseService } from "../../../../lib/supabaseServiceClient";
import { NextResponse } from "next/server";
import JSZip from "jszip"; // Ensure this is installed

export async function POST(request) {
    try {
        const formData = await request.formData();
        const users = JSON.parse(formData.get("users")); // Parse users JSON
        const zipFile = formData.get("zipFile"); // Get the uploaded ZIP file

        console.log("ZIP file received:", zipFile); // Log to check if the file is received

        if (!users || users.length === 0) {
            return NextResponse.json({ message: "No users to sign up" }, { status: 400 });
        }

        if (!zipFile) {
            return NextResponse.json({ message: "ZIP file containing photos is required" }, { status: 400 });
        }

        const errors = [];
        const results = [];
        const photoURLs = {};

        // Process the ZIP file with JSZip
        const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
        const zipEntries = Object.keys(zip.files);

        if (!zipEntries || zipEntries.length === 0) {
            console.error("ZIP file is empty or contains no valid entries.");
            return NextResponse.json({ message: "Uploaded ZIP file is empty" }, { status: 400 });
        }

        console.log(`Number of entries in ZIP: ${zipEntries.length}`);

        for (const entryName of zipEntries) {
            const entry = zip.files[entryName];

            if (entry.dir) {
                console.log(`Skipping directory: ${entryName}`);
                continue; // Skip directories
            }

            const human_id = entryName.split(".")[0]; // Extract human_id from filename
            const filePath = `${human_id}/${entryName}`;

            // Infer MIME type based on file extension
            const fileExtension = entryName.split(".").pop().toLowerCase();
            const mimeType = {
                png: "image/png",
                jpg: "image/jpeg",
                jpeg: "image/jpeg",
                gif: "image/gif",
            }[fileExtension] || "application/octet-stream";

            console.log(
                `Attempting to upload photo: ${entryName} to path: ${filePath} with MIME type: ${mimeType}`
            );

            const fileContent = await entry.async("nodebuffer"); // Read file as Buffer
            const { data: uploadData, error: uploadError } = await supabaseService.storage
                .from("student-photos")
                .upload(filePath, fileContent, { contentType: mimeType, upsert: true });

            if (uploadError) {
                console.error(`Upload error for ${filePath}:`, uploadError.message);
                errors.push({ human_id, error: uploadError.message });
                continue;
            }

            console.log(`Successfully uploaded: ${filePath}`);
            photoURLs[human_id] = filePath; // Save the file path
        }

        // Bulk signup users
        for (const user of users) {
            const { firstName, lastName, human_id, role, email, password } = user;

            try {
                console.log(`Creating user with email: ${email}, human_id: ${human_id}`);

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
                    console.error("Signup Error:", signupError);
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
                        photo_url: photoURLs[human_id] || null, // Assign photo URL or null
                        firstName,
                        lastName,
                        role,
                    });

                if (profileError) {
                    console.error("Profile Insertion Error:", profileError);
                    errors.push({ email, error: profileError.message });
                    continue;
                }

                console.log(`User created successfully: ${email}`);
                results.push({ email, status: "success" });
            } catch (err) {
                console.error("Unexpected Error:", err);
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
