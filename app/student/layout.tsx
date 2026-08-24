import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import { SessionGuard } from '@/components/shared/SessionGuard';
import { StudentPortalShell } from '@/components/student/StudentPortalShell';

export const metadata: Metadata = { title: 'Student Profile | SuperOffer' };

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <SessionGuard portal="student" />
      <StudentPortalShell>{children}</StudentPortalShell>
    </Suspense>
  );
}
