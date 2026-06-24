
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, onSnapshot } from 'firebase/firestore';
import { Auth, User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged, getIdToken } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

export interface AppUser {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
  role: 'developer' | 'admin';
}

export type CombinedUser = FirebaseAuthUser & AppUser;

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface UserAuthState {
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: CombinedUser | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    if (!auth || !firestore) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Services missing") });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            const userDocRef = doc(firestore, 'users', firebaseUser.uid);
            const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data() as AppUser;
                    setUserAuthState({
                        user: { ...firebaseUser, ...userData },
                        isUserLoading: false,
                        userError: null,
                    });
                } else {
                     const defaultAppUser: AppUser = { 
                        id: firebaseUser.uid,
                        role: 'developer',
                        name: firebaseUser.displayName || '', 
                        email: firebaseUser.email || '' 
                     };
                     setUserAuthState({ user: { ...firebaseUser, ...defaultAppUser }, isUserLoading: false, userError: null });
                }
            }, (error) => {
                setUserAuthState({ user: null, isUserLoading: false, userError: error });
            });
            return () => unsubDoc();
        } else {
             setUserAuthState({ user: null, isUserLoading: false, userError: null });
        }
    }, (error) => {
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

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    return { firebaseApp: null, firestore: null, auth: null, user: null, isUserLoading: true, userError: null, areServicesAvailable: false };
  }
  return context;
};

export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useUser = () => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};

export function useMemoFirebase<T>(factory: () => T | null, deps: DependencyList): T | null {
  return useMemo(() => {
    if (deps.some(dep => dep === null || typeof dep === 'undefined')) return null;
    return factory();
  }, deps);
}

export const useIdToken = (): string | null => {
    const { auth } = useFirebase();
    const [idToken, setIdToken] = useState<string | null>(null);
    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) user.getIdToken().then(setIdToken);
            else setIdToken(null);
        });
        return () => unsubscribe();
    }, [auth]);
    return idToken;
}
