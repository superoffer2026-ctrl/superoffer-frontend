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

/** Roles allowed inside the organization workspace. */
export const ORGANIZATION_ROLES = ['UNIVERSITY_OFFICER', 'LOAN_OFFICER', 'CONSULTANT'];

/**
 * The home each role belongs to. Used to bounce someone who has landed in the
 * wrong portal — signing in as a student and opening /organization/... would
 * otherwise fire organization API calls that can only ever return 403.
 */
export function homeForRole(role: string): string {
  if (ORGANIZATION_ROLES.includes(role)) return '/organization/dashboard';
  if (role === 'STUDENT') return '/student/dashboard';
  return '/';
}

/** Pages served by the organization workspace shell (`/organization/[page]`). */
export const ORGANIZATION_PAGES = [
  'dashboard', 'students', 'shortlists', 'invitations', 'catalog', 'templates',
  'criteria', 'reports', 'notifications', 'subscription', 'profile', 'settings'
] as const;

export type OrganizationView = (typeof ORGANIZATION_PAGES)[number];
