
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyASU0VrxcAwR2UA7OZFLNFWHCIwGXz6jdk",
  authDomain: "highland-cultural-committee.firebaseapp.com",
  projectId: "highland-cultural-committee",
  storageBucket: "highland-cultural-committee.firebasestorage.app",
  messagingSenderId: "607152118757",
  appId: "1:607152118757:web:63490fb2e2e341d976ad0c",
  measurementId: "G-Y84CDDBP9Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, analytics, auth, storage, googleProvider };
export default app;
