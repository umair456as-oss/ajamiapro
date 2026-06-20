import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export interface User {
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
}

let cachedToken: string | null = "mock_token_123";

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken || "mock_token_123";
    const user = result.user;
    
    return {
      user: {
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        uid: user.uid,
      },
      accessToken
    };
  } catch (err) {
    console.error("Firebase Google Sign-In Error: ", err);
    throw err;
  }
};

export const getAccessToken = (): string | null => {
  return cachedToken;
};
