import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
function initializeFirebaseAdmin(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    // When using Application Default Credentials, we can call initializeApp without parameters
    // or with a config object that does not contain a 'credential' property.
    return initializeApp({
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
