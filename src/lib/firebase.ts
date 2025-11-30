// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Your web app's Firebase configuration is automatically populated
// by the hosting environment.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
// We check if the app is already initialized to avoid errors during hot-reloads.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
// Initialize Storage with a robust bucket selection.
// If the configured bucket looks like a hosting domain (e.g. *.firebasestorage.app)
// fall back to the conventional storage bucket name: <projectId>.appspot.com
const configuredBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';
let storageBucket = configuredBucket;
if (configuredBucket && configuredBucket.includes('firebasestorage.app')) {
  storageBucket = `${firebaseConfig.projectId}.appspot.com`;
}

export const storage = storageBucket ? getStorage(app, `gs://${storageBucket}`) : getStorage(app);
// Export the resolved storage bucket name for runtime debugging.
export const storageBucketName = storageBucket;

// Dev helper: connect to the local Storage emulator when requested via env var.
// Set `NEXT_PUBLIC_USE_STORAGE_EMULATOR=true` in `.env.local` to enable.
export const usingStorageEmulator = (process.env.NEXT_PUBLIC_USE_STORAGE_EMULATOR === 'true');
if (usingStorageEmulator) {
  try {
    // default emulator host/port: localhost:9199
    connectStorageEmulator(storage, '127.0.0.1', 9499);
    // eslint-disable-next-line no-console
    console.info('Connected Firebase Storage to local emulator at localhost:9199');
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Could not connect to Storage emulator:', e);
  }
}
