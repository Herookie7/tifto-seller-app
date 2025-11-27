import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA-Arn9vDqHen1EJimV8lJfNsYOBLNcIfg",
  authDomain: "tifto.firebaseapp.com",
  projectId: "tifto",
  storageBucket: "tifto.appspot.com",
  messagingSenderId: "650001300965",
  appId: "1:650001300965:android:e027e6c5c2074a426bc30c",
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

