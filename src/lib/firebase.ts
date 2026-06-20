import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const firebaseConfig = {
  apiKey: "AIzaSyBqQJhfnsrnn6sEtygVwRUOJjhpiFoqEro",
  authDomain: "aphapk-8160f.firebaseapp.com",
  databaseURL: "https://aphapk-8160f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aphapk-8160f",
  storageBucket: "aphapk-8160f.firebasestorage.app",
  messagingSenderId: "228781765171",
  appId: "1:228781765171:web:515385b0dfab31a5856946",
  measurementId: "G-6NQ3VLVN8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe logging of Firestore errors as instructed in the firebase-integration skill
export interface FirestoreErrorInfo {
  error: string;
  operationType: string;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: string, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
    }
  };
  console.error('Firestore Operation Failed:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { firebaseConfig, app };
