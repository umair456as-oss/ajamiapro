import { db } from './lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

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

let isLocalUpdateFromFirestore = false;
let activeListeners: (() => void)[] = [];

function getMadrassaId() {
  return localStorage.getItem('madrassaId') || 'master';
}

/**
 * Update a specific key in both local storage and Firestore.
 */
export async function updateCentralKey(key: string, value: any): Promise<boolean> {
  // Always update local storage first for instant UI response
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  window.dispatchEvent(new Event('storage_updated'));

  try {
    const madrassaId = getMadrassaId();
    const docRef = doc(db, 'institutions', madrassaId, 'system_data', key);
    
    await setDoc(docRef, {
      value: value,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    return true;
  } catch (err) {
    console.error(`Could not update centralized key "${key}" in Firestore:`, err);
    // Even if cloud sync fails, we return true if local succeeded
    return true; 
  }
}

/**
 * Pull all data for the current institution from Firestore.
 */
export async function pullGlobalData(): Promise<void> {
  try {
    const madrassaId = getMadrassaId();
    const collRef = collection(db, 'institutions', madrassaId, 'system_data');
    const snapshot = await getDocs(collRef);

    isLocalUpdateFromFirestore = true;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const key = docSnap.id;
      if (SYNC_KEYS.includes(key)) {
        localStorage.setItem(key, JSON.stringify(data.value));
      }
    });
    isLocalUpdateFromFirestore = false;
    window.dispatchEvent(new Event('storage_updated'));
    console.log('Successfully pulled all global data from Firestore.');
  } catch (err) {
    console.error('Failed to pull global data from Firestore:', err);
  }
}

/**
 * Start real-time listeners for all synced keys.
 */
export function startRealTimeSync() {
  if (activeListeners.length > 0) return;
  console.log('Starting Real-time Firestore Sync...');

  const madrassaId = getMadrassaId();
  const collRef = collection(db, 'institutions', madrassaId, 'system_data');

  const unsubscribe = onSnapshot(collRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      // Only process changes not made locally (though onSnapshot usually handles this, we be careful)
      if (isLocalUpdateFromFirestore) return;

      const key = change.doc.id;
      const data = change.doc.data();

      if (SYNC_KEYS.includes(key)) {
        const localValue = localStorage.getItem(key);
        const remoteValueString = JSON.stringify(data.value);

        if (localValue !== remoteValueString) {
          isLocalUpdateFromFirestore = true;
          localStorage.setItem(key, remoteValueString);
          isLocalUpdateFromFirestore = false;
          window.dispatchEvent(new Event('storage_updated'));
        }
      }
    });
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `institutions/${madrassaId}/system_data`);
  });

  activeListeners.push(unsubscribe);
}

/**
 * Stop all active real-time listeners.
 */
export function stopRealTimeSync() {
  activeListeners.forEach(unsubscribe => unsubscribe());
  activeListeners = [];
  console.log('Stopped Real-time Firestore Sync.');
}

/**
 * Monkey-patch localStorage.setItem to auto-sync to Firestore.
 */
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key: string, value: string): void {
  // Write locally
  originalSetItem.call(localStorage, key, value);

  // Skip cloud sync if the update is coming from Firestore listener
  if (isLocalUpdateFromFirestore) return;

  // Sync to Firestore if key is in allowlist
  if (SYNC_KEYS.includes(key)) {
    let parsedValue = value;
    try {
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        parsedValue = JSON.parse(value);
      }
    } catch (_) {}

    const madrassaId = getMadrassaId();
    const docRef = doc(db, 'institutions', madrassaId, 'system_data', key);
    
    setDoc(docRef, {
      value: parsedValue,
      updatedAt: serverTimestamp()
    }, { merge: true }).catch((err) => {
      console.warn(`[Sync Monkeypatch] Could not sync key "${key}" to Firestore:`, err);
    });
  }
};

export async function syncToServer(): Promise<boolean> {
  // This is now redundant but kept for compatibility
  return true;
}
