export type OrganizationType = 'UNIVERSITY' | 'BANK';

export interface OrganizationTypeOption {
  value: OrganizationType;
  label: string;
}

export const ORG_TYPE_OPTIONS: OrganizationTypeOption[] = [
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'BANK', label: 'Bank' }
];

export function organizationRole(orgType: OrganizationType): string {
  return orgType === 'BANK' ? 'LOAN_OFFICER' : 'UNIVERSITY_OFFICER';
}

export function organizationTypeFromRole(role: string): OrganizationType {
  return role === 'LOAN_OFFICER' ? 'BANK' : 'UNIVERSITY';
}

/**
 * The backend does not yet expose a unified organization type on login, only on
 * registration. This directory bridges that gap on the frontend: it remembers
 * which organization type an email registered as, so login can resolve the same
 * type without a backend change. Remove once /auth/login returns organization type.
 */
const DIRECTORY_KEY = 'superoffer_org_directory';

function readDirectory(): Record<string, OrganizationType> {
  try {
    const raw = localStorage.getItem(DIRECTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function rememberOrganizationType(email: string, orgType: OrganizationType): void {
  const directory = readDirectory();
  directory[email.trim().toLowerCase()] = orgType;
  localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory));
}

export function lookupOrganizationType(email: string): OrganizationType {
  const directory = readDirectory();
  return directory[email.trim().toLowerCase()] || 'UNIVERSITY';
}
