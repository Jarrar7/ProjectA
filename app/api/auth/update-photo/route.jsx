import { supabaseService } from "../../../../lib/supabaseServiceClient";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request) {
    try {
        const formData = await request.formData();
        const userId = formData.get("userId");
        const humanId = formData.get("humanId");
        const file = formData.get("file");
        const fileExt = file.name.split(".").pop(); // Get file extension
        const newFilePath = `${humanId}/${humanId}.${fileExt}`; // New image name

        //Remove the previous photo
        const { error: removeError } = await supabaseService.storage
            .from("student-photos")
            .remove([`${humanId}/${humanId}.png`, `${humanId}/${humanId}.jpg`, `${humanId}/${humanId}.jpeg`]);

        if (removeError) {
            console.warn("Could not remove previous profile photo:", removeError.message);
        }

        //Upload the new photo
        const { error: uploadError } = await supabaseService.storage
            .from("student-photos")
            .upload(newFilePath, file, { upsert: true });

        if (uploadError) {
            return NextResponse.json({ error: uploadError.message }, { status: 400 });
        }

        //Get signed URL for the uploaded file
        const { data, error: urlError } = await supabaseService.storage
            .from("student-photos")
            .createSignedUrl(newFilePath, 3600);

        if (urlError) {
            return NextResponse.json({ error: urlError.message }, { status: 400 });
        }

        //Send the image to the face_service for encoding
        const faceFormData = new FormData();
        faceFormData.append("image", file, newFilePath);

        // const faceResponse = await fetch(`${API_URL}/encode`, {
        //     method: "POST",
        //     body: faceFormData,
        // });

        const faceResponse = await fetch("http://127.0.0.1:5001/encode", {
            method: "POST",
            body: faceFormData,
        });


        const faceData = await faceResponse.json();
        if (!faceData.encodings || faceData.encodings.length === 0) {
            return NextResponse.json({ error: "Face detected but no encoding generated." }, { status: 400 });
        }

        //Update the `profiles` table with the new encoding and photo URL
        const { error: updateError } = await supabaseService
            .from("profiles")
            .update({ face_encoding: faceData.encodings[0], photo_url: newFilePath })
            .eq("id", userId);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 400 });
        }

        return NextResponse.json({ message: "Profile photo updated successfully!", signedUrl: data.signedUrl });
    } catch (error) {
        return NextResponse.json({ error: "Server error: " + error.message }, { status: 500 });
    }
}
