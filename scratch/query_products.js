import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

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

console.log("Querying products_cms anonymously...");
try {
  const q = query(collection(db, "products_cms"), orderBy("created_at", "desc"));
  const snapshot = await getDocs(q);
  console.log("Success! Found documents:", snapshot.size);
} catch (err) {
  console.error("Error querying products_cms:", err);
}
