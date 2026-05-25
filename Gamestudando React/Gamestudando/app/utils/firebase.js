import { initializeApp, getApp, getApps } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  browserLocalPersistence,
  getAuth,
  initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyCfOK9KqhO80KeHkb_-Lcsj0woptMCUg3o",
  authDomain: "gamestudando-6615c.firebaseapp.com",
  projectId: "gamestudando-6615c",
  storageBucket: "gamestudando-6615c.firebasestorage.app",
  messagingSenderId: "333774592267",
  appId: "1:333774592267:web:f71383c881da88f65c2a0e",
  measurementId: "G-3BN661DFNT",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function criarAuthPersistente() {
  try {
    if (Platform.OS === "web") {
      return initializeAuth(app, {
        persistence: browserLocalPersistence,
      });
    }

    const { getReactNativePersistence } = require("@firebase/auth");

    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (_error) {
    return getAuth(app);
  }
}

export const auth = criarAuthPersistente();
export const db = getFirestore(app);
export const cloudFunctions = getFunctions(app);
export { app };
