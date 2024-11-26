import { supabase } from '../../../../lib/supabaseClient';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        // Fetch user from Supabase
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !user) {
            return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
        }

        // Compare entered password with stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user.user_id, email: user.email, role: user.role },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        console.log('Generated token:', token);

        // Set the token as an HttpOnly cookie
        return new Response(JSON.stringify({ message: 'Login successful' }), {
            status: 200,
            headers: {
                'Set-Cookie': `token=${token}; Path=/; Secure=${process.env.NODE_ENV === 'production'}; SameSite=Lax`,
                'Content-Type': 'application/json',
            },
        });


    } catch (err) {
        console.error('Unexpected Error:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
