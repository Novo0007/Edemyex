'use client';

import { useEffect } from 'react';
import { useIdToken } from '@/firebase/provider';

/**
 * A client component that ensures the user's ID token is available for server-side requests.
 * It persists the token in a secure cookie so that server actions and API routes can read it.
 */
export function TokenProvider() {
  const idToken = useIdToken();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const maxAgeSeconds = 60 * 60; // 1 hour
    const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';

    if (idToken) {
      document.cookie = `session-token=${encodeURIComponent(
        idToken
      )}; path=/; max-age=${maxAgeSeconds}; sameSite=lax${isSecureContext ? '; secure' : ''}`;
    } else {
      document.cookie = 'session-token=; path=/; max-age=0; sameSite=lax';
    }
  }, [idToken]);

  // This component does not render anything.
  return null;
}
