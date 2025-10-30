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
  } else {
    // In a server-side context or if env vars are not available,
    // this can prevent the app from crashing.
    console.error("Firebase API Key is missing. App cannot be initialized.");
    // A mock app could be created here for testing if necessary, but for now we'll throw an error.
    // This part of the code will likely not be executed on the client-side in Next.js
    // if the environment variables are correctly configured.
    throw new Error("Firebase API Key is missing.");
  }
} else {
  app = getApp();
}


export const auth = getAuth(app);
export const db = getFirestore(app);