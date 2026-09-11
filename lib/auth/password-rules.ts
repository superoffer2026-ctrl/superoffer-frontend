/**
 * Mirrors the server's rule in `src/auth/password.util.ts`, so a password can be
 * refused with a readable reason before a round trip. The server remains the
 * authority — change one, change both.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 64;

/** "a and b" for two, "a, b, and c" for more — the Oxford comma reads better mid-sentence. */
const asList = (items: string[]): string => {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

/**
 * One sentence naming only what is still missing, or `''` once the password
 * passes. Naming just the gap keeps the form quiet: nothing is shown before
 * they type, and each clause disappears the moment it is satisfied, rather than
 * a standing checklist of rules they have already met.
 *
 * The two halves are phrased to join cleanly in any combination — "must be at
 * least 8 characters", "must contain at least 1 number", or both at once.
 */
export function passwordProblems(value: string): string {
  if (!value) return '';

  const clauses: string[] = [];
  if (value.length < PASSWORD_MIN_LENGTH) clauses.push(`be at least ${PASSWORD_MIN_LENGTH} characters`);
  else if (value.length > PASSWORD_MAX_LENGTH) clauses.push(`be ${PASSWORD_MAX_LENGTH} characters or fewer`);

  const missing = ([
    [/[A-Z]/, '1 uppercase letter'],
    [/[a-z]/, '1 lowercase letter'],
    [/\d/, '1 number'],
    [/[^A-Za-z0-9]/, '1 special character']
  ] as const)
    .filter(([pattern]) => !pattern.test(value))
    .map(([, label]) => label);

  if (missing.length) clauses.push(`contain at least ${asList(missing)}`);

  return clauses.length ? `Password must ${clauses.join(', ')}.` : '';
}

export const isPasswordValid = (value: string) => Boolean(value) && !passwordProblems(value);

/** The ten national digits typed after the fixed +91. */
export const MOBILE_DIGITS = 10;
export const INDIA_DIAL_CODE = '+91';

/** Keeps only digits and caps at ten, so the field cannot hold anything else. */
export const toMobileDigits = (value: string) => value.replace(/\D/g, '').slice(0, MOBILE_DIGITS);

export const isMobileComplete = (digits: string) => digits.length === MOBILE_DIGITS;

/** What the API stores and what every screen should display. */
export const toE164 = (digits: string) => `${INDIA_DIAL_CODE}${digits}`;
