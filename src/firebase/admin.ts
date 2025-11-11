import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    return initializeApp({
        credential: undefined, // Use Application Default Credentials
        databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
        projectId: firebaseConfig.projectId,
    });
}

export function getFirebaseAdmin() {
    const app = initializeFirebaseAdmin();
    return {
        app,
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
}
