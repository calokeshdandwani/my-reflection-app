import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log the loaded environment variables for debugging
console.log('Supabase URL:', supabaseUrl ? 'Loaded' : 'Not Loaded');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Loaded' : 'Not Loaded');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is not set in environment variables. Please check your .env file.');
  // You might want to throw an error or handle this more gracefully in a production app
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);