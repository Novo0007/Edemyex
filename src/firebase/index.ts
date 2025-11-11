'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

// This ensures we only initialize Firebase once on the client
if (!getApps().length) {
  try {
    // Attempt to initialize via Firebase App Hosting environment variables if available
    // This is the recommended way for production.
    firebaseApp = initializeApp();
  } catch (e) {
    // Fallback to the explicit config object if auto-init fails.
    // This is expected during local development.
    firebaseApp = initializeApp(firebaseConfig);
  }
} else {
  // If the app is already initialized, get the existing instance.
  firebaseApp = getApp();
}

auth = getAuth(firebaseApp);
firestore = getFirestore(firebaseApp);


// Export the initialized instances
export { firebaseApp, auth, firestore };

// Export hooks and providers
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// This is a legacy export that some components might still be using.
// It is kept for backward compatibility but new code should import the instances directly.
export function initializeFirebase() {
  return {
    firebaseApp,
    auth,
    firestore,
  };
}
