export const API_HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
export const API_BASE_URL = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : 'http://localhost:3000';
export const API_DATA_URL = `${API_BASE_URL}/api/data`;

export const resolveApiUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url; // Base64
  if (url.startsWith('http')) {
    // If it's a full URL with an old IP, fix it
    try {
      const u = new URL(url);
      if (u.hostname !== API_HOST) {
        u.hostname = API_HOST;
        return u.toString();
      }
    } catch (e) {
      return url;
    }
    return url;
  }
  // If it's a relative path, prepend the base URL
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return `${API_BASE_URL}/${url}`;
};

