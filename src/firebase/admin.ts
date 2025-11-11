// lib/firebaseAdmin.ts
import { initializeApp, getApps, App, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";
import serviceAccount from '@/lib/firebase-service-account.json';

// Type assertion to match the expected ServiceAccount structure
const serviceAccountCredentials = serviceAccount as {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
};


function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: cert(serviceAccountCredentials),
    projectId: firebaseConfig.projectId,
  });
}

export function getFirebaseAdmin() {
  const app = initializeFirebaseAdmin();
  return {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
  };
}
