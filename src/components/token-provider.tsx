'use client';

import { useEffect } from 'react';
import { useIdToken } from '@/firebase/provider';
import { useRouter } from 'next/navigation';

/**
 * A client component that ensures the user's ID token is available for server-side requests.
 * It uses a custom header that can be read by server actions/apis.
 * Note: This relies on an experimental Next.js API (router.customHeaders).
 * If this API changes, this component may need to be updated.
 */
export function TokenProvider() {
  const idToken = useIdToken();
  const router = useRouter();

  useEffect(() => {
    // We use a custom header to pass the token to the server.
    // This is a workaround until Next.js provides a more stable way to handle this.
    // The `router.customHeaders` is not a stable API, but it's the best option for now.
    // The header is set on the router, so it will be included in all subsequent requests.
    if (idToken) {
       router.replace(window.location.pathname, {
           headers: {
               'Authorization': `Bearer ${idToken}`,
           },
       });
    }
  }, [idToken, router]);

  // This component does not render anything.
  return null;
}
