import { API_BASE_URL, customFetch } from './config';
import { db } from './lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

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
  console.log('Initiating Pull Sync from server & Firestore...');
  
  // 1. Try pulling from Firestore first to keep everything truly online and backed up
  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    const fireData: Record<string, any> = {};
    let matchedAny = false;
    
    // Fetch all docs for this tenant in Firestore in parallel
    const fetchPromises = SYNC_KEYS.map(async (key) => {
      const docId = `${tenantId}_${key}`;
      const docRef = doc(db, 'madrassa_data', docId);
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const docPayload = docSnap.data();
          if (docPayload && docPayload.value !== undefined) {
            fireData[key] = docPayload.value;
            matchedAny = true;
          }
        }
      } catch (err) {
        // Soft fail per key
      }
    });
    
    await Promise.all(fetchPromises);
    
    if (matchedAny) {
      console.log('Successfully pulled latest dataset from Firestore!');
      let updatedAny = false;
      
      SYNC_KEYS.forEach(key => {
        if (fireData[key] !== undefined) {
          const fireValStr = JSON.stringify(fireData[key]);
          const localValStr = localStorage.getItem(key);
          
          if (fireValStr !== localValStr) {
            localStorage.setItem(key, fireValStr);
            updatedAny = true;
          }
        }
      });
      
      if (updatedAny) {
        console.log('Local storage updated with fresh data from Firestore. Dispatching updated event.');
        window.dispatchEvent(new Event('storage_updated'));
      }
      
      // Silently mirror Firestore data back to the Node Express server so they exist in container DB
      try {
        await customFetch(`${API_BASE_URL}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fireData)
        });
      } catch (err) {
        console.warn('Silently bypassed mirroring Firestore data to server container DB:', err);
      }
      
      return fireData;
    }
  } catch (err) {
    console.warn('Could not complete pull sync from Firebase Firestore:', err);
  }
  
  // 2. Fallback to Express backend `/api/data`
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
  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    
    // Save each key as a separate document in Madrid_data to bypass the 1MB limit for single files
    const writePromises = Object.keys(payload).map(async (key) => {
      const dataToSave = payload[key];
      if (dataToSave !== undefined && dataToSave !== null) {
        const docId = `${tenantId}_${key}`;
        await setDoc(doc(db, 'madrassa_data', docId), {
          key,
          tenantId,
          value: dataToSave,
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    await Promise.all(writePromises);
    console.log('Successfully pushed dataset to Firebase Firestore!');
  } catch (err) {
    console.error('Error synchronizing data to Firestore:', err);
    throw err;
  }
}

/**
 * Push all local changes to the server.
 * Gathers all synced keys from local storage and sends them to the server.
 */
export async function syncToServer(): Promise<boolean> {
  console.log('Initiating Strict Push Sync to backend server...');
  
  // Construct the payload of all synchronized keys
  const payload: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    payload[key] = safeParse(key, key === 'system_settings' || key === 'website_settings' ? {} : []);
  });

  // Sync locally or with standard server
  try {
    await syncToFirestore(payload);
  } catch (err) {
    console.warn('Local Firestore sync simulation bypassed.');
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

// Store the active unsubscribe function so we don't start duplicate listeners
let unsubscribeRealTime: (() => void) | null = null;

export function startRealTimeSync() {
  if (unsubscribeRealTime) {
    console.log('Real-time sync already active.');
    return unsubscribeRealTime;
  }

  console.log('Starting Real-time Firestore Sync...');
  const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
  
  // Create a query on 'madrassa_data' where tenantId equals the current tenantId
  const q = query(
    collection(db, 'madrassa_data'),
    where('tenantId', '==', tenantId)
  );

  unsubscribeRealTime = onSnapshot(q, (snapshot) => {
    let updatedAny = false;
    
    snapshot.docChanges().forEach((change) => {
      // We only care about added or modified documents
      if (change.type === 'added' || change.type === 'modified') {
        const docData = change.doc.data();
        const key = docData.key;
        const value = docData.value;

        if (key && SYNC_KEYS.includes(key)) {
          const remoteValStr = JSON.stringify(value);
          const localValStr = localStorage.getItem(key);

          // Only write if the remote value differs from current local value
          if (remoteValStr !== localValStr) {
            localStorage.setItem(key, remoteValStr);
            console.log(`[Real-time Sync Info] Saved updated "${key}" from Firestore`);
            updatedAny = true;
          }
        }
      }
    });

    if (updatedAny) {
      // Dispatch event so components can automatically refresh
      console.log('Real-time updates pulled from Firestore. Dispatching storage_updated event.');
      window.dispatchEvent(new Event('storage_updated'));
    }
  }, (error) => {
    console.error('Real-time sync snapshot error:', error);
  });

  return unsubscribeRealTime;
}

export function stopRealTimeSync() {
  if (unsubscribeRealTime) {
    unsubscribeRealTime();
    unsubscribeRealTime = null;
    console.log('Stopped Real-time Firestore Sync.');
  }
}
