'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// This ensures we only initialize Firebase once on the client
const firebaseApp: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth: Auth = getAuth(firebaseApp);
const firestore: Firestore = getFirestore(firebaseApp);

// Export the initialized instances
export { firebaseApp, auth, firestore };

// Export hooks and providers
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';


// This is a legacy export that some components might still be using.
// It is kept for backward compatibility but new code should import the instances directly.
export function initializeFirebase() {
  return {
    firebaseApp,
    auth,
    firestore,
  };
}
