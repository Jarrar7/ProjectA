import { supabase } from '../../../../lib/supabaseClient';
import bcrypt from 'bcrypt';


export async function POST(request) {
    try {
        const { email, password } = await request.json();
        //console.log('Received Email:', email);

        // Trim and normalize email
        const trimmedEmail = email.trim();
        //console.log('Trimmed Email:', trimmedEmail);

        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .ilike('email', trimmedEmail)
            .maybeSingle();

        //console.log('Supabase Query Result:', { user, error });


        if (error || !user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Ensure the user has a valid password
        if (!user.password) {
            console.error('No password found for the user.');
            return new Response(
                JSON.stringify({ error: 'Password is missing for the user.' }),
                { status: 400 }
            );
        }

        // Compare entered password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
        }

        // Return successful response
        return new Response(JSON.stringify({ message: 'Login successful', user }), { status: 200 });
    } catch (err) {
        console.error('Unexpected Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
