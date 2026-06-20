
export interface User {
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
}

export const googleSignIn = async (): Promise<{ user: any; session: any } | null> => {
  console.log("Google Sign-In is disabled (Supabase removed).");
  return null;
};

export const getAccessToken = (): string | null => {
  return null;
};
