import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmiC7sAVx5DjMPACwci-L74qww3uNxna4",
  authDomain: "tifto-prod.firebaseapp.com",
  projectId: "tifto-prod",
  storageBucket: "tifto-prod.firebasestorage.app",
  messagingSenderId: "253211113708",
  appId: "1:253211113708:android:95736dc4af620e46698dc9",
};

let firebaseApp;
let firebaseAuth;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  firebaseAuth = getAuth(firebaseApp);
  console.log("Firebase initialized successfully");
  console.log("Firebase project:", firebaseConfig.projectId);
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.error("Firebase config used:", JSON.stringify(firebaseConfig, null, 2));
  // Initialize with fallback to prevent app crash
  try {
    firebaseApp = getApps()[0] || initializeApp(firebaseConfig);
    firebaseAuth = getAuth(firebaseApp);
  } catch (fallbackError) {
    console.error("Firebase fallback initialization also failed:", fallbackError);
  }
}

export { firebaseApp, firebaseAuth };

