import { supabase } from '../../../../lib/supabaseClient';

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Sign in the user using email and password
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            if (error.code === 'email_not_confirmed') {
                return new Response(
                    JSON.stringify({ error: 'Your email is not confirmed. Please check your inbox to confirm your email.' }),
                    { status: 401 }
                );
            }
            console.error('Login Error:', error);
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
        }


        const userId = data.user.id; // Authenticated user's ID

        // Fetch the user's role from the `profiles` table
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single(); // Fetch a single row

        if (profileError || !profileData) {
            console.error('Profile Fetch Error:', profileError);
            return new Response(JSON.stringify({ error: 'Failed to fetch user role' }), { status: 400 });
        }

        // Send the role and user data to the client
        return new Response(
            JSON.stringify({ message: 'Login successful', user: { ...data.user, role: profileData.role } }),
            { status: 200 }
        );
    } catch (err) {
        console.error('Unexpected Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
