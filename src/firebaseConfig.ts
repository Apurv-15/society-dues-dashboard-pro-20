// Firebase configuration using environment variables with fallbacks
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Validate required environment variables in production
if (import.meta.env.PROD) {
  const missingVariables = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key.replace('VITE_', ''));

  if (missingVariables.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVariables.join(', ')}`);
  }
}
