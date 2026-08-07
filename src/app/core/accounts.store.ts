import { PortalKey } from './auth-api.service';

/**
 * There's no live signup/login backend wired into the frontend yet, so sign up
 * vs log in would otherwise behave identically (any input "succeeds"). This
 * keeps a local directory of accounts created on this device so registration
 * can reject duplicates and login can reject unknown/incorrect credentials,
 * matching normal auth UX. Replace with real API calls once the backend is wired in.
 */
export interface StoredAccount {
  identifier: string;
  password?: string;
  fullName: string;
  organization?: string;
}

const ACCOUNTS_KEY = 'superoffer_accounts';

function readAccounts(): Record<string, StoredAccount> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAccounts(accounts: Record<string, StoredAccount>): void {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch { /* storage unavailable */ }
}

function accountKey(portal: PortalKey, identifier: string): string {
  return `${portal}:${identifier.trim().toLowerCase()}`;
}

export function findAccount(portal: PortalKey, identifier: string): StoredAccount | undefined {
  return readAccounts()[accountKey(portal, identifier)];
}

export function createAccount(portal: PortalKey, identifier: string, account: StoredAccount): void {
  const accounts = readAccounts();
  accounts[accountKey(portal, identifier)] = account;
  writeAccounts(accounts);
}
