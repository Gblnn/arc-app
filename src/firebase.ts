import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDF-LunWl8azw6nismldvd8OvE22qyMgBg",
  authDomain: "arc-db-9ecfd.firebaseapp.com",
  projectId: "arc-db-9ecfd",
  storageBucket: "arc-db-9ecfd.firebasestorage.app",
  messagingSenderId: "746593642808",
  appId: "1:746593642808:web:ddab0bc2bd422ad30579cd",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage();
export const auth = getAuth();
