import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthPage } from '@/components/auth/AuthPage';
import type { PortalKey } from '@/lib/api/auth-api';

export const metadata: Metadata = { title: 'Account | SuperOffer' };

/** `/auth/login/student`, `/auth/register/organization`, … */
export default async function AuthRoute({ params }: { params: Promise<{ mode: string; portal: string }> }) {
  const { mode, portal } = await params;
  return (
    <Suspense>
      <AuthPage mode={mode === 'register' ? 'register' : 'login'} portal={(portal as PortalKey) || 'student'} />
    </Suspense>
  );
}
