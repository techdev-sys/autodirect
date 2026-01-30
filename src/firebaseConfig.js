import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration
export const firebaseConfig = {
    apiKey: "AIzaSyDhHixkLeoyOAhiR2M-fk-ZKHkCX-7Oi6w",
    authDomain: "autodirect-5320e.firebaseapp.com",
    projectId: "autodirect-5320e",
    storageBucket: "autodirect-5320e.firebasestorage.app",
    messagingSenderId: "88578597656",
    appId: "1:88578597656:web:184fc8e29b515a0a71b46d",
    measurementId: "G-T0L41Q58VX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
