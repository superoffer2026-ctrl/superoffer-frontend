import type { Metadata } from 'next';
import { OrganizationWorkspace } from '@/components/organization/OrganizationWorkspace';

export const metadata: Metadata = { title: 'Organization Workspace | SuperOffer' };

/** Deep link to one candidate — the workspace opens on the candidates view. */
export default async function OrganizationStudentRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrganizationWorkspace page="students" studentId={id} />;
}
