import { initializeApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const firebaseConfig = {
  apiKey: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as unknown as ImportMeta).env.VITE_FIREBASE_APP_ID
};

// Inicializacija aplikacije
export const app = initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
