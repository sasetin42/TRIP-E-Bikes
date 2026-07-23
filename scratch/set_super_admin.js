import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3CmcJjZP3-iM1okn4yjEnmzuFC3-UHaU",
  authDomain: "trip-e-bikes.firebaseapp.com",
  projectId: "trip-e-bikes",
  storageBucket: "trip-e-bikes.firebasestorage.app",
  messagingSenderId: "1064564056164",
  appId: "1:1064564056164:web:a68996a4bb6b9e3df0bf71"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const uid = "bfndQVV5k8dnpXMvRCMjF3Cio5E2";
const email = "admin@gmail.com";

console.log(`Authenticating as ${email}...`);

try {
  await signInWithEmailAndPassword(auth, email, "123456#");
  console.log("Authentication successful! Writing profile document...");

  await setDoc(doc(db, "profiles", uid), {
    email: email,
    role: "super_admin",
    username: "Super Admin",
    avatar: "",
    updated_at: new Date().toISOString()
  }, { merge: true });
  console.log("Super Admin role successfully set in Firestore!");
  process.exit(0);
} catch (err) {
  console.error("Error setting role:", err);
  process.exit(1);
}
