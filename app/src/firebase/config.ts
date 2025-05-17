import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// Replace these with your actual Firebase config values
const firebaseConfig = {
    apiKey: "AIzaSyB9qXiJoHTRocPkH3MZLODpJCuuuLfQ5DE",
    authDomain: "snapbuy-ae03d.firebaseapp.com",
    projectId: "snapbuy-ae03d",
    storageBucket: "snapbuy-ae03d.firebasestorage.app",
    messagingSenderId: "969339141220",
    appId: "1:969339141220:web:a1b3e88d28dc8ff5d4b371",
    measurementId: "G-M4XJSWGFKP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export default app; 