import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OrganizationWorkspace } from '@/components/organization/OrganizationWorkspace';
import { ORGANIZATION_PAGES, type OrganizationView } from '@/lib/models/organization';

export const metadata: Metadata = { title: 'Organization Workspace | SuperOffer' };

export default async function OrganizationWorkspaceRoute({
  params,
  searchParams
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { page } = await params;
  const { tab } = await searchParams;
  if (!ORGANIZATION_PAGES.includes(page as OrganizationView)) notFound();
  return <OrganizationWorkspace page={page as OrganizationView} tab={tab ?? null} />;
}
