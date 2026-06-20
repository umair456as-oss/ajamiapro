import { User } from 'firebase/auth';

let cachedToken: string | null = "mock_token_123";

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  // External Auth integrations are disabled as requested.
  // Sign in with developer mock user for safety and offline-first use.
  alert("گوگل سائن ان عارضی طور پر آف لائن/غیر فعال ہے۔ ٹیسٹ کے طور پر آپ کو براہ راست پرائمری ایڈمن اکاونٹ سے لاگ ان کیا جا رہا ہے۔");
  const mockUser = {
    email: "abdulrehmanhabib.com@gmail.com",
    displayName: "Primary Admin",
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    providerId: "google.com",
    refreshToken: "mock_refresh",
    tenantId: null,
    uid: "mock-uid-123456",
    delete: async () => {},
    getIdToken: async () => "mock_id_token",
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({})
  };
  return { user: mockUser as unknown as User, accessToken: "mock_token_123" };
};

export const getAccessToken = (): string | null => {
  return cachedToken;
};
