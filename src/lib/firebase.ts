"use client";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtWtxhEvAxh_SE39JcYSFulUTLVCqvx8g",
  authDomain: "sample-firebase-ai-app-43207.firebaseapp.com",
  projectId: "sample-firebase-ai-app-43207",
  storageBucket: "sample-firebase-ai-app-43207.firebasestorage.app",
  messagingSenderId: "302144570429",
  appId: "1:302144570429:web:7b03c51e9eea9417025654"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
