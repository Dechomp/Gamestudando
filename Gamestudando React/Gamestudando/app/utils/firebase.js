import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
