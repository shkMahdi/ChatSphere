// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAHEpxSPf5JIgTMR9zvk6ODPhImaMDtFWY",
  authDomain: "chat-app-36a12.firebaseapp.com",
  projectId: "chat-app-36a12",
  storageBucket: "chat-app-36a12.firebasestorage.app",
  messagingSenderId: "545422597139",
  appId: "1:545422597139:web:650720af6c6b9d637973e6",
  measurementId: "G-7HT88JRSCP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
