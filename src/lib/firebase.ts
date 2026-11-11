import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCcNe2c4iE29uvEwp0ARAUX11iOMKOMAjQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "olimpik-kurban-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "olimpik-kurban-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "olimpik-kurban-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "39896786674",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:39896786674:web:cbfa80cc557131296cd26b"
};

// Initialize Firebase (singleton pattern for Next.js SSR/client)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = typeof window !== "undefined" ? getFirestore(app) : (null as any);

