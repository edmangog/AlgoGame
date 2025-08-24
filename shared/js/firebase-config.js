// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqJWaspNep7J5G0uNR6yn0FY-VyBEzIb0",
  authDomain: "algogame-e210a.firebaseapp.com",
  projectId: "algogame-e210a",
  storageBucket: "algogame-e210a.firebasestorage.app",
  messagingSenderId: "332718976071",
  appId: "1:332718976071:web:a24e2e81aa138cbd23d562",
  measurementId: "G-Q8CP0PLTXG"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
