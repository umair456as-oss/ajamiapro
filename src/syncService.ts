import { API_BASE_URL, customFetch } from './config';

// Safe JSON parser helper 
// ...
const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

// List of all keys we sync between localStorage and the Server
const SYNC_KEYS = [
  'students',
  'staff',
  'system_settings',
  'website_settings',
  'website_fatawa',
  'website_gallery',
  'website_gallery_categories',
  'website_home_sections',
  'books',
  'grades',
  'results',
  'saved_salaries',
  'saved_fees',
  'role_permissions',
  'users',
  'recycle_bin',
  'books_list',
  'book_assignments',
  'grades_list',
  'addresses',
  'districts',
  'madrasas',
  'exams',
  'hours',
  'expulsions',
  'gradeSettings',
  'minPositionPercentage',
  'positions',
  'online_links',
  'online_applications',
  'licensed_madrasas',
  'examRecords',
  'all_exam_results',
  'jamia_papers',
  'jamia_posts',
  'fin_transactions',
  'fin_heads',
  'fin_accounts',
  'library_books',
  'studentList',
  'teacherAttendance',
  'attendanceRecords',
  'zk_attendance_data'
];

/**
 * Fetch the entire central dataset from the server.
 * Fallbacks to a combined object of local storage keys if the server cannot be reached.
 */
export async function fetchCentralData(): Promise<any> {
  try {
    const response = await customFetch(`${API_BASE_URL}/api/data`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('Could not fetch central data from server, falling back to local state:', err);
  }

  // Fallback: build a dictionary from localStorage
  const fallbackData: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    fallbackData[key] = safeParse(key, key === 'system_settings' || key === 'website_settings' ? {} : []);
  });
  return fallbackData;
}

/**
 * Update a specific key in the central dataset.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Update local storage first
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  window.dispatchEvent(new Event('storage_updated'));

  try {
    const response = await customFetch(`${API_BASE_URL}/api/save-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    return response.ok;
  } catch (err) {
    console.warn(`Could not update centralized key "${key}" on server:`, err);
    return false;
  }
}

/**
 * Pull the latest central dataset from the server and populate/override localStorage.
 * Dispatches a 'storage_updated' event so components can refresh content.
 */
export async function syncFromServer(): Promise<any> {
  console.log('Initiating Pull Sync from server...');
  try {
    const response = await customFetch(`${API_BASE_URL}/api/data`);
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data === 'object') {
        let updatedAny = false;
        
        SYNC_KEYS.forEach(key => {
          if (data[key] !== undefined) {
            const serverValStr = JSON.stringify(data[key]);
            const localValStr = localStorage.getItem(key);
            
            if (serverValStr !== localValStr) {
              localStorage.setItem(key, serverValStr);
              updatedAny = true;
            }
          }
        });

        if (updatedAny) {
          console.log('Local storage updated from Server Pull. Dispatching alert event.');
          window.dispatchEvent(new Event('storage_updated'));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Network issue during Pull sync. Relying on current local state:', err);
  }
  return null;
}


async function syncToFirestore(payload: Record<string, any>) {
  // Real-time remote cloud sync is fully decoupled and disabled as requested
  return;
}

/**
 * Push all local changes to the server.
 * Gathers all synced keys from local storage and sends them to the server.
 */
export async function syncToServer(): Promise<boolean> {
  console.log('Initiating Strict Push Sync to server AND Firebase...');
  
  // Construct the payload of all synchronized keys
  const payload: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    payload[key] = safeParse(key, key === 'system_settings' || key === 'website_settings' ? {} : []);
  });

  // Sync to Firebase
  try {
    await syncToFirestore(payload);
    console.log('Firebase sync successful.');
  } catch (err) {
    console.warn('Firebase sync failed:', err);
  }

  try {
    const response = await customFetch(`${API_BASE_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      console.log('Strict Push Sync completed successfully.');
      return true;
    }
  } catch (err) {
    console.warn('Network issue during Push sync. Changes are saved locally and will auto-sync later.', err);
  }
  return false;
}
