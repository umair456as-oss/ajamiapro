import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCoUGlo1F53R3YMGxL2GiAU8sebxiyemzo",
  authDomain: "gen-lang-client-0459240900.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0459240900-default-rtdb.firebaseio.com",
  projectId: "gen-lang-client-0459240900",
  storageBucket: "gen-lang-client-0459240900.firebasestorage.app",
  messagingSenderId: "711881759609",
  appId: "1:711881759609:web:23e225d450e63526f2ada8",
  measurementId: "G-RF510YF9DV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
