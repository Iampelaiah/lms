
'use client';

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
let app: FirebaseApp;
if (getApps().length === 0) {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully with projectId:", firebaseConfig.projectId);
  } else {
    // In a server-side context or if env vars are not available,
    // this can prevent the app from crashing.
    console.error("Firebase API Key is missing. App cannot be initialized.");
  }
} else {
  app = getApp();
}

// It's safer to get auth and db instances only when the app is initialized.
// This prevents errors if initialization fails.
const auth = app! ? getAuth(app) : null;
const db = app! ? getFirestore(app) : null;

// Re-exporting auth and db, but now they can be null if initialization failed.
// The consuming code should handle this possibility.
export { app, auth, db };
