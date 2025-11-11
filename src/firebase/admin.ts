
import { initializeApp, getApps, App, cert, ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { firebaseConfig } from "./config";
import serviceAccountKey from '@/lib/firebase-service-account.json';

// Cast the imported JSON to the ServiceAccount type
const serviceAccount = serviceAccountKey as ServiceAccount;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

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
