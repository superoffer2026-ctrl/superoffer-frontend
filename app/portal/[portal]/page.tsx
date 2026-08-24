import type { Metadata } from 'next';
import { PortalPage } from '@/components/portal/PortalPage';

export const metadata: Metadata = { title: 'Portal | SuperOffer' };

export default async function PortalRoute({ params }: { params: Promise<{ portal: string }> }) {
  const { portal } = await params;
  return <PortalPage portal={portal} />;
}
