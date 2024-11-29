import { supabaseService } from "../../../../lib/supabaseServiceClient";
import { NextResponse } from "next/server";

export async function POST(request) {
    const { users } = await request.json();

    if (!users || users.length === 0) {
        return NextResponse.json({ message: "No users to sign up" }, { status: 400 });
    }

    const errors = [];
    const results = [];

    for (const user of users) {
        const { firstName, lastName, human_id, role, email, password } = user;

        try {
            // Step 1: Create user in Supabase Auth
            const { data, error: signupError } = await supabaseService.auth.admin.createUser({
                email: email,
                password: password,
                email_confirm: true,
                user_metadata: {
                    name: firstName + " " + lastName,
                    academic_role: role,
                    human_id: human_id,
                },
            });

            if (signupError) {
                console.error("Signup Error:", signupError);
                errors.push({ email, error: signupError.message });
                continue;
            }

            const userId = data.user.id;

            // Step 2: Insert user metadata into the `profiles` table
            const { error: profileError } = await supabaseService
                .from("profiles")
                .insert({
                    id: userId,
                    human_id,
                    picture: null,
                    firstName,
                    lastName,
                    role,
                });

            if (profileError) {
                console.error("Profile Insertion Error:", profileError);
                errors.push({ email, error: profileError.message });
                continue;
            }

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
}
