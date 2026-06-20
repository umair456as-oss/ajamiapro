
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || '';

// Initialize with a dummy if keys are missing to prevent crash, 
// but log a clear warning so the user knows why sync isn't working.
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY) are missing in environment variables. Real-time sync and cloud auth will be disabled.');
}

// Fallback to null if keys are missing
export const supabase = (() => {
  try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
      return createClient(supabaseUrl, supabaseAnonKey);
    }
    return null as any;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null as any;
  }
})();
