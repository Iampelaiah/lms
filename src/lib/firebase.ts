
'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, getDoc, updateDoc, onSnapshot, query, where } from "firebase/firestore";

// Your web app's Firebase configuration is read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: any = null;
let db: any = null;

if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        if (firebaseConfig.apiKey) {
            app = initializeApp(firebaseConfig);
            console.log("Firebase initialized successfully with projectId:", firebaseConfig.projectId);
        } else {
            console.error("Firebase API Key is missing. App cannot be initialized.");
        }
    } else {
        app = getApp();
    }

    if (app) {
        auth = getAuth(app);
        db = getFirestore(app);
    }
}

// Re-exporting auth and db, but now they can be null if initialization failed or on server.
export { app, auth, db };

export { collection, doc, addDoc, getDoc, updateDoc, onSnapshot, query, where };
