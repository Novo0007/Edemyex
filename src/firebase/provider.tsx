'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

// Define the shape of the user data stored in Firestore.
// This is kept separate from lib/types.ts to avoid client->server dependency.
export interface AppUser {
  id: string;
  name: string;
  email: string;
  profileImageUrl: string;
  purchasedCourseIds: string[];
  favoriteCreatorIds: string[];
  role: 'user' | 'creator' | 'admin';
  creatorStatus: 'none' | 'pending' | 'approved' | 'rejected';
  payoutDetails?: {
    name: string;
    email: string;
    phone: string;
    upiId?: string;
    bank?: {
      accountNumber: string;
      ifsc: string;
    };
  };
}

// The user object available in the context will be a combination of Firebase Auth's user and our app's user data.
export type CombinedUser = FirebaseAuthUser & AppUser;


interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// Internal state for user authentication
interface UserAuthState {
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  // User authentication state
  user: CombinedUser | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
  areServicesAvailable: boolean;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data() as AppUser;
                    setUserAuthState({
                        user: { ...firebaseUser, ...userData }, // Combine auth user and firestore user data
                        isUserLoading: false,
                        userError: null,
                    });
                } else {
                     // User doc doesn't exist yet, might be in the process of creation
                     // We'll provide the basic auth user for now.
                     const defaultAppUser: AppUser = { 
                        id: firebaseUser.uid,
                        role: 'user', 
                        creatorStatus: 'none', 
                        purchasedCourseIds: [], 
                        favoriteCreatorIds: [], 
                        profileImageUrl: firebaseUser.photoURL || '', 
                        name: firebaseUser.displayName || '', 
                        email: firebaseUser.email || '' 
                     };
                     setUserAuthState({ user: { ...firebaseUser, ...defaultAppUser }, isUserLoading: false, userError: null });
                }
            }, (error) => {
                console.error("FirebaseProvider: User doc snapshot error:", error);
                setUserAuthState({ user: null, isUserLoading: false, userError: error });
            });
            return () => unsubDoc();
        } else {
             setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
    }, (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    // This error should not be thrown in normal use, as the provider should be at the root.
    // However, returning nulls allows components to handle the lack of services gracefully.
    return {
        firebaseApp: null,
        firestore: null,
        auth: null,
        user: null,
        isUserLoading: true,
        userError: new Error('useFirebase must be used within a FirebaseProvider.'),
        areServicesAvailable: false,
    }
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
    areServicesAvailable: context.areServicesAvailable,
  };
};

/** Hook to access Firebase Auth instance. Returns null if not available. */
export const useAuth = (): Auth | null => {
  const { auth, areServicesAvailable } = useFirebase();
  return areServicesAvailable ? auth : null;
};

/** Hook to access Firestore instance. Returns null if not available. */
export const useFirestore = (): Firestore | null => {
  const { firestore, areServicesAvailable } = useFirebase();
  return areServicesAvailable ? firestore : null;
};

/** Hook to access Firebase App instance. Returns null if not available. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

export function useMemoFirebase<T>(factory: () => T | null, deps: DependencyList): T | null {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(() => {
    // Check if any dependency is explicitly null or undefined. If so, don't run the factory.
    if (deps.some(dep => dep === null || typeof dep === 'undefined')) {
        return null;
    }
    return factory();
  }, deps);
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
