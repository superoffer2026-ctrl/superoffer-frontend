'use client';

import { useEffect } from 'react';
import { authApi } from '../api/auth-api';
import { isSessionExpired, readAccessToken, reportSessionExpired } from '../storage';
import { ObservableStore, useStore } from './observable-store';

export interface StudentDocument {
  id: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

export interface CompletionSection {
  key: string;
  label: string;
  done: boolean;
}

export interface StudentProfile {
  status: string;
  submittedAt: string | null;
  discoverable: boolean;
  settings: Record<string, unknown>;
  personal: Record<string, string>;
  studyPreferences: Record<string, string[]>;
  academic: Record<string, unknown>;
  entranceExams: Record<string, unknown>;
  workExperience: Record<string, unknown>;
  financial: Record<string, unknown>;
  projects: Record<string, unknown>;
  documents: StudentDocument[];
}

export interface LoanDocumentField {
  key: string;
  label: string;
  uploaded: boolean;
}

/** Which verification documents a lender needs, resolved server-side. */
export interface LoanDocuments {
  needsLoan: string;
  employmentCategory: string;
  required: LoanDocumentField[];
  complete: boolean;
}

export interface Completion {
  completionPercent: number;
  status: string;
  sections: CompletionSection[];
  missing: string[];
  loanDocuments: LoanDocuments;
}

export interface AccountUser {
  user_id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  password_changed_at?: string | null;
}

const EMPTY_PROFILE: StudentProfile = {
  status: 'DRAFT',
  submittedAt: null,
  discoverable: true,
  settings: {},
  personal: {},
  studyPreferences: {},
  academic: {},
  entranceExams: {},
  workExperience: {},
  financial: {},
  projects: {},
  documents: []
};

const EMPTY_COMPLETION: Completion = {
  completionPercent: 0,
  status: 'DRAFT',
  sections: [],
  missing: [],
  loanDocuments: { needsLoan: '', employmentCategory: '', required: [], complete: false }
};

/**
 * The student's profile as the server holds it. There is no local mirror and
 * nothing is persisted in the browser — every screen renders this, and every
 * write goes through the API and refreshes it.
 */
class StudentProfileStore extends ObservableStore {
  profile: StudentProfile = EMPTY_PROFILE;
  completion: Completion = EMPTY_COMPLETION;
  user: AccountUser | null = null;

  loading = false;
  loaded = false;
  error = '';

  async load(force = false): Promise<void> {
    if (this.loading || (this.loaded && !force)) return;
    const token = readAccessToken();
    if (!token) return;

    this.loading = true;
    this.emit();
    try {
      const [profile, completion, user] = await Promise.all([
        authApi.studentProfile(token),
        authApi.studentCompletion(token),
        authApi.currentUser(token)
      ]);
      this.profile = { ...EMPTY_PROFILE, ...profile };
      this.completion = { ...EMPTY_COMPLETION, ...completion };
      this.user = user;
      this.loaded = true;
      this.error = '';
    } catch (e) {
      if (isSessionExpired(e)) {
        this.reset();
        reportSessionExpired();
        return;
      }
      this.error = e instanceof Error ? e.message : 'Could not load your profile.';
    } finally {
      this.loading = false;
      this.emit();
    }
  }

  /** Called after any write so every screen sees the server's version. */
  refresh(): Promise<void> {
    return this.load(true);
  }

  /** Cleared on sign-out so the next account doesn't inherit this one's data. */
  reset(): void {
    this.profile = EMPTY_PROFILE;
    this.completion = EMPTY_COMPLETION;
    this.user = null;
    this.loaded = false;
    this.error = '';
    this.emit();
  }

  get isSubmitted(): boolean {
    return this.profile.status === 'SUBMITTED';
  }

  get fullName(): string {
    return this.profile.personal['fullName'] || this.user?.full_name || 'Student';
  }

  get initials(): string {
    return this.fullName
      .split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}

export const studentProfileStore = new StudentProfileStore();

/** Subscribes to the profile and loads it on first mount. */
export function useStudentProfile() {
  const store = useStore(studentProfileStore);
  useEffect(() => {
    void store.load();
  }, [store]);
  return store;
}
