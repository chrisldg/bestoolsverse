// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Configuration Firebase
const firebaseConfig = window.FIREBASE_CONFIG || {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: "bestoolsverse-storage", // VOTRE BUCKET EXISTANT
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

// Storage avec votre bucket personnalisé
export const storage = getStorage(app, "gs://bestoolsverse-storage");

// Analytics
export const analytics = firebaseConfig.measurementId ? getAnalytics(app) : null;

console.log('✅ Firebase initialisé avec bucket:', "bestoolsverse-storage");

export default app;