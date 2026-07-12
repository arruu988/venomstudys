import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, addDoc, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmJAVblRsmjeDbJuSklUUn4NSDHp851LI",
  authDomain: "website-f1792.firebaseapp.com",
  projectId: "website-f1792",
  storageBucket: "website-f1792.firebasestorage.app",
  messagingSenderId: "833090181424",
  appId: "1:833090181424:web:3d49fe6f501665494410f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seed() {
  try {
    // Create settings document
    await setDoc(doc(db, "settings", "general"), {
      isLocked: false,
      categories: ["Aakash", "Allen", "PW"]
    });

    // Add PDFs to Aakash
    await addDoc(collection(db, "tests"), {
      title: "Aakash Test 1",
      type: "Aakash",
      driveLink: "https://drive.google.com/file/d/16J7xuFAxNXk3KAFU1rmr2OVcsDpNI2cE/view?usp=drivesdk",
      createdAt: new Date().toISOString()
    });

    await addDoc(collection(db, "tests"), {
      title: "Aakash Test 2",
      type: "Aakash",
      driveLink: "https://drive.google.com/file/d/1YSUN95sQ3Zdo2MyrRPlyWeBCyso-8A7S/view?usp=drivesdk",
      createdAt: new Date().toISOString()
    });

    console.log("Seeding complete!");
  } catch (err) {
    console.error("Error seeding:", err);
  }
}
seed();
