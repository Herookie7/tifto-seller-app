import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyA-Arn9vDqHen1EJimV8lJfNsYOBLNcIfg",
  authDomain: "tifto.firebaseapp.com",
  projectId: "tifto",
  storageBucket: "tifto.appspot.com",
  messagingSenderId: "650001300965",
  appId: "1:650001300965:android:e027e6c5c2074a426bc30c",
};

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let firebaseAuth;

try {
  firebaseAuth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  firebaseAuth = getAuth(firebaseApp);
}

export { firebaseApp, firebaseAuth };

