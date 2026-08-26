import type { Metadata } from 'next';
import { OrganizationVerification } from '@/components/organization/OrganizationVerification';

export const metadata: Metadata = { title: 'Verification | SuperOffer' };

export default function OrganizationVerificationRoute() {
  return <OrganizationVerification />;
}
