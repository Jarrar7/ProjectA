import { supabase } from '../../../../lib/supabaseClient';
import bcrypt from 'bcrypt';

export async function POST(request) {
    try {
        const { email, newPassword } = await request.json();

        console.log('Received Email:', email);
        const trimmedEmail = email.trim().toLowerCase();
        console.log('Trimmed Email:', trimmedEmail);

        // Fetch user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', trimmedEmail)
            .single();

        console.log('Supabase Query Result:', { user, error });

        if (error || !user) {
            console.error('User not found:', error);
            return new Response(JSON.stringify({ error: 'No user found with the provided email' }), { status: 404 });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('Hashed Password:', hashedPassword);

        // Update user's password
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashedPassword })
            .eq('email', trimmedEmail);

        if (updateError) {
            console.error('Password Update Error:', updateError);
            return new Response(JSON.stringify({ error: 'Failed to update password' }), { status: 500 });
        }

        return new Response(JSON.stringify({ message: 'Password updated successfully' }), { status: 200 });
    } catch (err) {
        console.error('Unexpected Error:', err);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}
