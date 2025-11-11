import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // Check for service account credentials in environment variables
    const serviceAccount: ServiceAccount | undefined = process.env.SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
        : undefined;

    if (serviceAccount) {
        // Initialize with explicit service account credentials
        return initializeApp({
            credential: cert(serviceAccount),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            projectId: firebaseConfig.projectId,
        });
    } else {
        // Fallback to Application Default Credentials (for deployed environments)
        return initializeApp({
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            projectId: firebaseConfig.projectId,
        });
    }
}

export function getFirebaseAdmin() {
    const app = initializeFirebaseAdmin();
    return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
}
