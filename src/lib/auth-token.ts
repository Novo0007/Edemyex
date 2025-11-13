
import { cookies } from 'next/headers';

/**
 * Extracts the Firebase ID token from the 'session-token' cookie.
 * This function is designed to work in Server Components and API Routes.
 * @returns The token string, or null if not found.
 */
export function extractAuthToken(): string | null {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('session-token');
  return tokenCookie?.value || null;
}
