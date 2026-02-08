// Firebase 초기화 - Analytics, Firestore 사용
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgqnNTimA9ePcjYvhhV3bwpBrInFf4CCQ",
  authDomain: "hogwan.firebaseapp.com",
  projectId: "hogwan",
  storageBucket: "hogwan.firebasestorage.app",
  messagingSenderId: "675288273376",
  appId: "1:675288273376:web:6e9cade0b3f27edb201b85",
  measurementId: "G-HGZWRX3ZSD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, analytics, db };
