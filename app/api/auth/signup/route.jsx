import { supabase } from "../../../../lib/supabaseClient";
import { supabaseService } from "../../../../lib/supabaseServiceClient";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { firstName, lastName, human_id, role, email, password } = await request.json();

    try {
        // Step 1: Create the user in Supabase Auth
        const { data, error: signupError } = await supabaseService.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                name: firstName + ' ' + lastName,
                academic_role: role,
                human_id: human_id
            }

        });

        if (signupError) {
            console.error("Signup Error:", signupError);
            return NextResponse.json({ message: signupError.message }, { status: 400 });
        }

        const userId = data.user.id; // Get the user ID from the signup response

        // Step 2: Insert user metadata into the `profiles` table using the service client
        const { error: profileError } = await supabaseService
            .from("profiles")
            .insert({
                id: userId, // Use the user ID as the profile ID
                human_id,
                picture: null,
                firstName,
                lastName,
                role,
            });

        if (profileError) {
            console.error("Profile Insertion Error:", profileError);
            return NextResponse.json({ message: profileError.message }, { status: 400 });
        }

        return NextResponse.json({ message: "User created successfully!" });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
