// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

let firebaseConfig;

// Attempt to load local configuration for development
try {
  const { firebaseConfigLocal } = await import('./firebase-config.local.js');
  firebaseConfig = firebaseConfigLocal;
  console.log("Using local Firebase configuration.");
} catch (e) {
  // Fallback to placeholder configuration for GitHub Pages deployment
  console.log("Using placeholder Firebase configuration (for deployment).");
  firebaseConfig = {
    apiKey: "VITE_FIREBASE_API_KEY",
    authDomain: "VITE_FIREBASE_AUTH_DOMAIN",
    projectId: "VITE_FIREBASE_PROJECT_ID",
    storageBucket: "VITE_FIREBASE_STORAGE_BUCKET",
    messagingSenderId: "VITE_FIREBASE_MESSAGING_SENDER_ID",
    appId: "VITE_FIREBASE_APP_ID",
    measurementId: "VITE_FIREBASE_MEASUREMENT_ID"
  };
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
