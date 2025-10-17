
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from '../firebaseConfig';

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
const googleProvider = new GoogleAuthProvider();

// Check if Firebase app is already initialized to prevent duplicate initialization
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  
  // Initialize analytics only in the browser and if supported
  if (typeof window !== 'undefined') {
    isAnalyticsSupported().then(supported => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });
  }
  
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
} else {
  app = getApp();
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
}

export { db, analytics, auth, storage, googleProvider };
export default app;
