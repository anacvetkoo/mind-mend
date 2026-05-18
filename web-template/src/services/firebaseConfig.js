import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mindmend-a8839.firebaseapp.com",
  projectId: "mindmend-a8839",
  storageBucket: "mindmend-a8839.firebasestorage.app",
  messagingSenderId: "163326676496",
  appId: "1:163326676496:web:25eee9a0cc64ef52150495"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
