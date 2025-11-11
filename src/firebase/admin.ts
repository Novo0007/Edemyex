// lib/firebaseAdmin.ts
import { initializeApp, getApps, App, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  const rawKey = process.env.SERVICE_ACCOUNT_KEY;
  if (!rawKey) {
    throw new Error("❌ SERVICE_ACCOUNT_KEY is missing. Set it in your environment.");
  }

  let serviceAccount: ServiceAccount;
  try {
    serviceAccount = JSON.parse(rawKey);
  } catch (e) {
    console.error("❌ Failed to parse SERVICE_ACCOUNT_KEY", e);
    throw e;
  }

  return initializeApp({
    credential: cert(serviceAccount),
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
