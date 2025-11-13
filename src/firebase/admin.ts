
import { initializeApp, getApps, App, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";

let cachedServiceAccount: ServiceAccount | null = null;

function resolveServiceAccount(): ServiceAccount {
  if (cachedServiceAccount) {
    return cachedServiceAccount;
  }

  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!rawCredentials) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set. Provide the service account JSON (optionally base64 encoded) to initialise the Firebase Admin SDK.'
    );
  }

  const parseJson = (input: string) => JSON.parse(input) as ServiceAccount;

  try {
    cachedServiceAccount = parseJson(rawCredentials);
    return cachedServiceAccount;
  } catch (error) {
    try {
      const decoded = Buffer.from(rawCredentials, 'base64').toString('utf8');
      cachedServiceAccount = parseJson(decoded);
      return cachedServiceAccount;
    } catch (decodeError) {
      throw new Error(
        'Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure it is valid JSON or a base64-encoded JSON string.'
      );
    }
  }
}

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: cert(resolveServiceAccount()),
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

export async function getAdminUser(idToken: string): Promise<any> {
    const { auth } = getFirebaseAdmin();
    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const userRecord = await auth.getUser(decodedToken.uid);
        return userRecord;
    } catch (error) {
        console.error('Error verifying token or fetching user data:', error);
        return null;
    }
}
