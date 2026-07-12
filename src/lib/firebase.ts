import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmJAVblRsmjeDbJuSklUUn4NSDHp851LI",
  authDomain: "website-f1792.firebaseapp.com",
  projectId: "website-f1792",
  storageBucket: "website-f1792.firebasestorage.app",
  messagingSenderId: "833090181424",
  appId: "1:833090181424:web:3d49fe6f501665494410f5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Explicitly set persistence
setPersistence(auth, browserLocalPersistence).catch(console.error);
