import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Export supabase client helper, returns null if keys are not defined
export const supabase = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabase) {
  if (typeof window !== 'undefined') {
    console.warn(
      'Streamix: Supabase configuration is missing. Operating in local storage / demo fallback mode.'
    );
  }
}
