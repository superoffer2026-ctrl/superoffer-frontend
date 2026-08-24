import type { Metadata } from 'next';
import { AdminPage } from '@/components/admin/AdminPage';

export const metadata: Metadata = { title: 'Institution approvals | SuperOffer' };

export default function AdminRoute() {
  return <AdminPage />;
}
