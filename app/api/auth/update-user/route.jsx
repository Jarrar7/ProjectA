import { supabaseService } from "@/lib/supabaseServiceClient";

export async function POST(req) {
    try {
        const { userId, email, password } = await req.json();

        if (!userId || (!email && !password)) {
            return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400 });
        }

        // ✅ Update the student's email and/or password using Supabase Admin API
        const { error } = await supabaseService.auth.admin.updateUserById(userId, {
            email: email || undefined,
            password: password || undefined,
        });

        if (error) {
            console.error("Error updating user:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });

    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
}
