// app/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Your Supabase API credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single instance of Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
