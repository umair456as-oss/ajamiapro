import { supabase } from './supabaseClient';

export interface User {
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
}

export const googleSignIn = async (): Promise<{ user: any; session: any } | null> => {
  try {
    if (!supabase) throw new Error("Supabase is not initialized.");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return { user: data, session: null }; // Supabase redirect handles the session
  } catch (err) {
    console.error("Supabase Google Sign-In Error: ", err);
    throw err;
  }
};

export const getAccessToken = (): string | null => {
  return null; // Managed by Supabase internally
};
