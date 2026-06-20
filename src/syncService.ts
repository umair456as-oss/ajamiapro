import { db } from './lib/firebase';
import { doc, setDoc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

// Safe JSON parser helper 
const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error parsing localStorage key "${key}":`, e);
    return defaultValue;
  }
};

// List of all keys we sync between localStorage and Firestore
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
 * Update a specific key in the central Firestore dataset.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Update local storage first
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  window.dispatchEvent(new Event('storage_updated'));

  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    const docId = `${tenantId}_${key}`;
    await setDoc(doc(db, 'madrassa_data', docId), {
      key,
      tenantId,
      value: value,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (err) {
    console.error(`Could not update centralized key "${key}" in Firestore:`, err);
    return false;
  }
}

async function syncToFirestore(payload: Record<string, any>) {
  try {
    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    
    // Save each key as a separate document in madrassa_data to bypass the 1MB limit for single files
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
 * Push all local changes to Firestore.
 */
export async function syncToServer(): Promise<boolean> {
  console.log('Initiating Strict Push Sync to Firestore...');
  
  // Construct the payload of all synchronized keys
  const payload: Record<string, any> = {};
  SYNC_KEYS.forEach(key => {
    payload[key] = safeParse(key, key === 'system_settings' || key === 'website_settings' ? {} : []);
  });

  try {
    await syncToFirestore(payload);
    console.log('Strict Push Sync completed to Firestore successfully.');
    return true;
  } catch (err) {
    console.error('Error during Push sync to Firestore:', err);
    return false;
  }
}

// Store the active unsubscribe function so we don't start duplicate listeners
let unsubscribeRealTime: (() => void) | null = null;
let isLocalUpdateFromFirestore = false;

// Preserve the original local storage function
const originalSetItem = localStorage.setItem;

// Monkey-patch localStorage.setItem globally to automatically sync all changes to Firestore
localStorage.setItem = function(key: string, value: string): void {
  // Always write locally first to keep the page snappy
  originalSetItem.call(localStorage, key, value);

  // If this update comes from our real-time snapshot pull, skip pushing it back!
  if (isLocalUpdateFromFirestore) {
    return;
  }

  // If the key is in our sync keys list, send it to Firestore in the background
  if (SYNC_KEYS.includes(key)) {
    let parsedValue = value;
    try {
      parsedValue = JSON.parse(value);
    } catch (_) {
      // Keep as string if it is not valid JSON
    }

    const tenantId = (typeof window !== 'undefined' ? localStorage.getItem('madrassaId') : null) || 'master';
    const docId = `${tenantId}_${key}`;

    setDoc(doc(db, 'madrassa_data', docId), {
      key,
      tenantId,
      value: parsedValue,
      updatedAt: new Date().toISOString()
    }).then(() => {
      console.log(`[Real-time Monkeypatch] Synced key "${key}" to Firestore.`);
    }).catch((err) => {
      console.warn(`[Real-time Monkeypatch] Could not sync key "${key}" to Firestore:`, err);
    });

    // Notify other parts of the UI on this page
    window.dispatchEvent(new Event('storage_updated'));
  }
};

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
    
    // Set the flag to true so our monkey-patch knows this write comes from Firestore and won't loop
    isLocalUpdateFromFirestore = true;

    try {
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
              originalSetItem.call(localStorage, key, remoteValStr);
              console.log(`[Real-time Sync Info] Saved updated "${key}" from Firestore`);
              updatedAny = true;
            }
          }
        }
      });
    } finally {
      // Reset the flag
      isLocalUpdateFromFirestore = false;
    }

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
