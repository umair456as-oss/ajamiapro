export interface User {
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  uid: string;
}

let cachedToken: string | null = "mock_token_123";

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  // External Auth integrations are disabled as requested.
  // Sign in with developer mock user for safety and offline-first use.
  alert("گوگل سائن ان عارضی طور پر آف لائن/غیر فعال ہے۔ ٹیسٹ کے طور پر آپ کو براہ راست پرائمری ایڈمن اکاونٹ سے لاگ ان کیا جا رہا ہے۔");
  const mockUser: User = {
    email: "abdulrehmanhabib.com@gmail.com",
    displayName: "Primary Admin",
    emailVerified: true,
    uid: "mock-uid-123456"
  };
  return { user: mockUser, accessToken: "mock_token_123" };
};

export const getAccessToken = (): string | null => {
  return cachedToken;
};
