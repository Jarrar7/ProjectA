import { supabase } from "../../../../lib/supabaseClient";
import { NextResponse } from "next/server";
import { supabaseService } from "../../../../lib/supabaseServiceClient";
import FormData from "form-data"; // Required for sending form-data
import axios from "axios"; // For making the request to the Python service

const API_URL = process.env.NEXT_PUBLIC_API_URL;


export async function POST(request) {
    const { firstName, lastName, human_id, role, email, password, photo_url } = await request.json();

    try {
        // Step 1: Sign up the user
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: `${firstName} ${lastName}`,
                    academic_role: role,
                    human_id: human_id,
                },
            },
        });

        if (signupError) {
            console.error("Signup Error:", signupError);
            return NextResponse.json({ message: signupError.message }, { status: 400 });
        }

        const userId = signupData.user.id; // Get the user ID from the signup response

        // Step 2: Fetch the photo from Supabase storage
        const { data: photoData, error: photoFetchError } = await supabaseService.storage
            .from("student-photos")
            .download(photo_url);

        if (photoFetchError) {
            console.error("Photo Fetch Error:", photoFetchError);
            return NextResponse.json({ message: "Failed to fetch student photo" }, { status: 400 });
        }

        const photoBuffer = Buffer.from(await photoData.arrayBuffer());

        // Step 3: Send the photo to the Python face encoding service
        let faceEncoding = null;
        try {
            const formData = new FormData();
            formData.append("image", photoBuffer, { filename: "photo.jpg" }); // Add photo buffer as form-data

            const response = await axios.post(`${API_URL}/encode`, formData, {
                headers: formData.getHeaders(),
            });

            faceEncoding = response.data.encodings[0]; // Get the face encoding from the response
        } catch (faceEncodingError) {
            console.error("Face Encoding Service Error:", faceEncodingError);
            return NextResponse.json({ message: "Failed to generate face encoding" }, { status: 400 });
        }

        // Step 4: Insert user metadata into the `profiles` table
        const { error: profileError } = await supabaseService
            .from("profiles")
            .insert({
                id: userId, // Use the user ID as the profile ID
                human_id,
                photo_url,
                firstName,
                lastName,
                role,
                face_encoding: faceEncoding, // Store the face encoding
            });

        if (profileError) {
            console.error("Profile Insertion Error:", profileError);
            return NextResponse.json({ message: profileError.message }, { status: 400 });
        }

        // Step 5: Return success response
        return NextResponse.json({ message: "User created successfully!", session: signupData.session });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
