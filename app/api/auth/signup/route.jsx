import { supabase } from "../../../../lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { firstName, lastName, human_id, role, email, password } = await request.json();

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

        // Step 2: Insert user metadata into the `profiles` table
        const { error: profileError } = await supabase
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

        // Step 3: Return success response
        return NextResponse.json({ message: "User created successfully!", session: signupData.session });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}