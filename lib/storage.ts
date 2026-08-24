/**
 * localStorage/sessionStorage helpers that are safe to call while rendering on
 * the server, where neither exists. Every store in `lib/stores` reads through
 * these so a server-rendered shell never throws before hydration.
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';

export function readLocal(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export function removeLocal(key: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export function readSession(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSession(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

export function removeSession(key: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

/** The access token is written to localStorage or sessionStorage depending on "remember me". */
export function readAccessToken(): string {
  return readLocal('superoffer_access_token') || readSession('superoffer_access_token') || '';
}

export function clearAccessToken(): void {
  removeLocal('superoffer_access_token');
  removeSession('superoffer_access_token');
}

/**
 * Broadcast when the API rejects a token — the session was revoked (a password
 * change elsewhere), expired, or the account was deleted. The app shell listens
 * and sends the user back to sign in rather than rendering an empty workspace.
 */
export const SESSION_EXPIRED_EVENT = 'superoffer:session-expired';

/** True for the one error that means "this token is no longer any good". */
export function isSessionExpired(error: unknown): boolean {
  return (error as { status?: number })?.status === 401;
}

/** Clears the dead token and tells the shell to redirect. Safe to call repeatedly. */
export function reportSessionExpired(): void {
  if (!isBrowser()) return;
  clearAccessToken();
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}
