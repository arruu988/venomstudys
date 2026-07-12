import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCmJAVblRsmjeDbJuSklUUn4NSDHp851LI",
  authDomain: "website-f1792.firebaseapp.com",
  projectId: "website-f1792",
  storageBucket: "website-f1792.firebasestorage.app",
  messagingSenderId: "833090181424",
  appId: "1:833090181424:web:3d49fe6f501665494410f5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function createAdmin() {
  try {
    await createUserWithEmailAndPassword(auth, "nottmeeeeeeeee@gmail.com", "NeetAdmin@2026!");
    console.log("Admin created");
  } catch (err) {
    console.log("Admin creation error:", err.message);
  }
}

createAdmin();
