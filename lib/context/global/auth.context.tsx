// Apollo
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";

// Core
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

// Constants
import { STORE_FIREBASE_TOKEN, STORE_TOKEN } from "@/lib/utils/constants";

// Interfaces
import { IAuthContext, IAuthProviderProps } from "@/lib/utils/interfaces";

// Expo
import * as Localization from "expo-localization";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

// I18n
import { changeLanguage } from "i18next";
import { firebaseAuth } from "@/lib/services";
import { setCachedAuthToken } from "@/lib/utils/auth-token";

export const AuthContext = React.createContext<IAuthContext>(
  {} as IAuthContext,
);

export const AuthProvider: React.FC<IAuthProviderProps> = ({
  client,
  children,
}) => {
  // States
  const [isSelected, setIsSelected] = useState("");
  const [token, setToken] = useState<string>("");
  const [firebaseToken, setFirebaseToken] = useState<string>("");

  const hydrateFromStorage = useCallback(async () => {
    try {
      const storedFirebaseToken = await SecureStore.getItemAsync(STORE_FIREBASE_TOKEN);
      if (storedFirebaseToken) {
        setFirebaseToken(storedFirebaseToken);
        setCachedAuthToken(storedFirebaseToken);
        return;
      }

      const storedLegacyToken = await SecureStore.getItemAsync(STORE_TOKEN);
      if (storedLegacyToken) {
        setToken(storedLegacyToken);
        setCachedAuthToken(storedLegacyToken);
      }
    } catch (error) {
      console.log("Failed to hydrate auth tokens", error);
    }
  }, []);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);
  
  const setTokenAsync = useCallback(
    async (value: string) => {
      await SecureStore.setItemAsync(STORE_TOKEN, value);
      client.clearStore();
      setToken(value);
      if (!firebaseToken) {
        setCachedAuthToken(value);
      }
    },
    [client, firebaseToken],
  );

  const setFirebaseTokenAsync = useCallback(
    async (value: string | null) => {
      if (value) {
        await SecureStore.setItemAsync(STORE_FIREBASE_TOKEN, value);
        setFirebaseToken(value);
        setCachedAuthToken(value);
      } else {
        await SecureStore.deleteItemAsync(STORE_FIREBASE_TOKEN);
        setFirebaseToken("");
        setCachedAuthToken(token);
      }
    },
    [token],
  );

  const clearAuthState = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORE_TOKEN),
      SecureStore.deleteItemAsync(STORE_FIREBASE_TOKEN),
      AsyncStorage.removeItem("store-id"),
    ]);
    setToken("");
    setFirebaseToken("");
    setCachedAuthToken(null);
  }, []);

  // Handlers
  const handleSetCurrentLanguage = async () => {
    try {
      const lng = await AsyncStorage.getItem("lang");
      console.log("🚀 ~ handleSetCurrentLanguage ~ lng:", lng);
      
      // Safe handling of Localization.locale
      let systemLanguage = "en"; // default fallback
      
      if (Localization.locale && typeof Localization.locale === 'string') {
        systemLanguage = Localization.locale.split("-")[0];
      } else if (Localization.locales && Array.isArray(Localization.locales) && Localization.locales.length > 0) {
        const firstLocale = Localization.locales[0];
        if (firstLocale && typeof firstLocale === 'string') {
          systemLanguage = firstLocale.split("-")[0];
        }
      }
      
      console.log("🚀 ~ handleSetCurrentLanguage ~ systemLanguage:", systemLanguage);

      // Use stored language preference or fall back to system language
      const selectedLanguage = lng || systemLanguage;
      
      await changeLanguage(selectedLanguage);
      setIsSelected(selectedLanguage);
      
    } catch (error) {
      console.error("Language setting error:", error);
      // Ultimate fallback
      try {
        await changeLanguage("en");
        setIsSelected("en");
      } catch (fallbackError) {
        console.error("Fallback language setting failed:", fallbackError);
      }
    }
  };

  const logout = useCallback(async () => {
    try {
      client.stop();
      await client.clearStore();
      await clearAuthState();
      router.replace("/(un-protected)/login");
    } catch (e) {
      console.error("Logout Error: ", { e });
    }
  }, [clearAuthState, client]);

  const checkAuth = useCallback(async () => {
    try {
      const [storedToken, storeId] = await Promise.all([
        SecureStore.getItemAsync(STORE_TOKEN),
        AsyncStorage.getItem("store-id"),
      ]);

      if (!storeId || (!storedToken && !firebaseToken)) {
        await logout();
        return;
      }

      if (storedToken) {
        setToken(storedToken);
        setCachedAuthToken(storedToken);
      } else if (firebaseToken) {
        setCachedAuthToken(firebaseToken);
      }
    } catch (error) {
      console.error("error getting store id & token", error);
      await logout();
    }
  }, [firebaseToken, logout]);

  // UseEffects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      if (user) {
        try {
          const refreshedToken = await user.getIdToken(true);
          await setFirebaseTokenAsync(refreshedToken);
        } catch (error) {
          console.log("Failed to refresh Firebase auth token", error);
        }
      } else {
        await setFirebaseTokenAsync(null);
      }
    });

    return unsubscribe;
  }, [setFirebaseTokenAsync]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    handleSetCurrentLanguage();
  }, []);

  useEffect(() => {
    if (__DEV__) {
      loadDevMessages();
      loadErrorMessages();
    }
  }, []);

  const values: IAuthContext = useMemo(
    () => ({
      token: token ?? "",
      firebaseToken,
      logout,
      setTokenAsync,
      setFirebaseTokenAsync,
      clearAuthState,
      isSelected,
      setIsSelected,
    }),
    [clearAuthState, firebaseToken, isSelected, setFirebaseTokenAsync, setTokenAsync, token],
  );

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};