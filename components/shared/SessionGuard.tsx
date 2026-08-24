'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SESSION_EXPIRED_EVENT } from '@/lib/storage';

/**
 * Sends the user back to sign in when the API rejects their token.
 *
 * A session can die while the app is open — a password change revokes every other
 * session, tokens expire, an account can be deleted. Without this the screens
 * would just render empty, which reads as "you have no data" rather than "you are
 * signed out". Mounted once per portal shell.
 */
export function SessionGuard({ portal }: { portal: string }) {
  const router = useRouter();

  useEffect(() => {
    const onExpired = () => router.replace(`/auth/login/${portal}?sessionExpired=1`);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [router, portal]);

  return null;
}
