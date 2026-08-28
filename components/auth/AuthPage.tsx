'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type ApiError, type PortalKey } from '@/lib/api/auth-api';
import {
  ORG_TYPE_OPTIONS,
  organizationRole,
  organizationTypeFromRole,
  type OrganizationType
} from '@/lib/models/organization';
import { clearAccessToken, writeLocal, writeSession } from '@/lib/storage';

interface AuthFormState {
  fullName: string;
  phone: string;
  email: string;
  organization: string;
  password: string;
  confirmPassword: string;
  orgType: OrganizationType;
  country: string;
  remember: boolean;
}

const EMPTY_FORM: AuthFormState = {
  fullName: '', phone: '', email: '', organization: '',
  password: '', confirmPassword: '', orgType: 'UNIVERSITY', country: '',
  remember: true
};

/** Toggles a password input between hidden and plain text. */
function PasswordVisibilityToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="password-toggle"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={visible ? 'Hide password' : 'Show password'}
      aria-pressed={visible}
    >
      {visible ? (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.8 21.8 0 0 1 5.06-6.06" />
          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.22 4.44" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      ) : (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

export function AuthPage({ mode, portal }: { mode: string; portal: PortalKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<AuthFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = <K extends keyof AuthFormState>(key: K, value: AuthFormState[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (searchParams.get('sessionExpired') === '1') setError('Your session has expired. Please log in again.');
  }, [searchParams]);

  const portalLabel = portal.charAt(0).toUpperCase() + portal.slice(1);
  const isStudent = portal === 'student';
  const isOrganization = portal === 'organization';

  const buttonLabel = mode === 'login' ? 'Log in securely' : 'Create account';

  const authTitle = isStudent ? 'Build your opportunity profile.' : `Register your ${portal} securely.`;

  const authCopy = (() => {
    if (isOrganization) {
      if (mode === 'register' && form.orgType === 'BANK') {
        return 'Submit official lender and licence details for verification before finance tools are unlocked.';
      }
      if (mode === 'register') {
        return 'Create your account, then complete verification from inside. Student data unlocks once an admin approves it.';
      }
      return 'Log in to your verified university or bank workspace.';
    }
    return 'Create one structured profile and receive relevant education opportunities.';
  })();

  const benefits = (() => {
    if (isOrganization) {
      return mode === 'register' && form.orgType === 'BANK'
        ? ['Creditworthy student discovery', 'Clear indicative loan offers', 'Conversion and funnel reporting']
        : ['AI-ranked student discovery', 'Shortlists and admission offers', 'Programme-level funnel reporting'];
    }
    return ['Private verified profile', 'Comparable invitations and offers', 'Visibility controls'];
  })();

  const role = () => {
    if (isStudent) return 'STUDENT';
    return organizationRole(form.orgType);
  };

  /** The API returns the session flat (`access_token`, `role`), not wrapped in a `user` object. */
  const openPortal = async (
    session: {
      role: string;
      access_token: string;
      full_name?: string;
      organization?: { name?: string; organizationType?: OrganizationType } | null;
    },
    trustBackend = false
  ) => {
    if (!trustBackend && session.role !== role()) {
      throw new Error('This account belongs to a different SuperOffer portal.');
    }

    clearAccessToken();
    if (form.remember) writeLocal('superoffer_access_token', session.access_token);
    else writeSession('superoffer_access_token', session.access_token);

    /** Only the token is kept — name, role and organization are read from /auth/me. */

    if (isOrganization) {
      /** The workspace reads the organization type back from /auth/me. */
      router.push('/organization/dashboard');
      return;
    }
    router.push(isStudent ? '/student/dashboard' : `/portal/${portal}`);
  };

  const submitOrganization = async () => {
    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await authApi.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          role: organizationRole(form.orgType),
          /*
           * An account, and nothing more. The evidence a reviewer checks is
           * gathered on the verification page after signing in, where the
           * registrar can see what is still outstanding.
           */
          organization: {
            name: form.organization,
            country: form.country || undefined
          }
        });
        setMessage('Account created. Sign in to finish your verification — student data unlocks once an admin approves it.');
        setForm(current => ({ ...current, password: '', confirmPassword: '' }));
        router.push(`/auth/login/${portal}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not submit your registration.');
      }
      return;
    }

    try {
      const session = await authApi.login(form.email, form.password);
      await openPortal(session, true);
    } catch (e) {
      const apiError = e as ApiError;
      if (apiError.code === 'ACCOUNT_PENDING_APPROVAL' || apiError.code === 'ACCOUNT_REJECTED') {
        setError(apiError.message);
        return;
      }
      setError(e instanceof Error ? e.message : 'Could not log in.');
    }
  };

  /** Students: plain email + password, with no approval step. */
  const submitAccount = async () => {
    if (mode === 'register') {
      try {
        await authApi.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          role: role()
        });
        setMessage('Account created. Please log in to continue.');
        setForm(current => ({ ...current, password: '' }));
        router.push(`/auth/login/${portal}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not complete the request.');
      }
      return;
    }

    try {
      const session = await authApi.login(form.email, form.password);
      await openPortal(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not complete the request.');
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    await (isOrganization ? submitOrganization() : submitAccount());
    setLoading(false);
  };

  return (
    <main className="auth-layout">
      <aside className="auth-aside">
        <Link className="brand light-brand" href="/"><span>S</span>SuperOffer</Link>
        <div>
          <span className="eyebrow light">{portalLabel} account</span>
          <h1>{mode === 'login' ? 'Welcome back to your workspace.' : authTitle}</h1>
          <p>{authCopy}</p>
          <ul>{benefits.map(item => <li key={item}>✓ {item}</li>)}</ul>
        </div>
        <small>Role-based access • Secure sessions • Privacy by design</small>
      </aside>

      <section className="auth-panel">
        <form onSubmit={onSubmit}>
          <Link className="back-link" href={`/${portal === 'student' ? 'students' : portal}`}>← Back to {portalLabel}</Link>
          <span className="eyebrow">{mode === 'login' ? 'Secure sign in' : 'Account registration'}</span>
          <h2>{mode === 'login' ? 'Log in to SuperOffer' : 'Create your account'}</h2>
          <p>
            {mode === 'login'
              ? 'Enter the details associated with your account.'
              : 'Use accurate information to create your role-specific access.'}
          </p>

          {mode === 'register' && isOrganization && (
            <div className="form-grid">
              <label className="full">
                Organization name
                <input name="organization" autoComplete="organization" value={form.organization} required placeholder="Your organization's legal name"
                  onChange={event => set('organization', event.target.value)} />
              </label>
              <label>
                Organization type
                <select name="orgType" value={form.orgType} required
                  onChange={event => set('orgType', event.target.value as OrganizationType)}>
                  {ORG_TYPE_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <label>
                Country
                <input name="country" autoComplete="country-name" value={form.country} placeholder="Country"
                  onChange={event => set('country', event.target.value)} />
              </label>
              <label className="full">
                Official email
                <input name="email" type="email" autoComplete="username" value={form.email} required placeholder="you@example.com"
                  onChange={event => set('email', event.target.value)} />
              </label>
              <label>
                Phone number
                <input name="phone" autoComplete="tel" value={form.phone} required placeholder="+91 00000 00000"
                  onChange={event => set('phone', event.target.value)} />
              </label>
              <label>
                Password
                <div className="password-field">
                  <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} minLength={8} required
                    placeholder="8+ characters with a letter and number"
                    onChange={event => set('password', event.target.value)} />
                  <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </label>
              <label>
                Confirm password
                <div className="password-field">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} minLength={8} required
                    placeholder="Re-enter your password"
                    onChange={event => set('confirmPassword', event.target.value)} />
                  <PasswordVisibilityToggle visible={showConfirmPassword} onToggle={() => setShowConfirmPassword(v => !v)} />
                </div>
              </label>
            </div>
          )}

          {mode === 'register' && isStudent && (
            <div className="form-grid">
              <label className="full">
                Full name
                <input name="fullName" autoComplete="name" value={form.fullName} required placeholder="Your full name"
                  onChange={event => set('fullName', event.target.value)} />
              </label>
              <label className="full">
                Email address
                <input name="email" type="email" autoComplete="username" value={form.email} required placeholder="you@example.com"
                  onChange={event => set('email', event.target.value)} />
              </label>
              <label className="full">
                Password
                <div className="password-field">
                  <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={form.password} minLength={8} required
                    placeholder="8+ characters with a letter and number"
                    onChange={event => set('password', event.target.value)} />
                  <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </label>
            </div>
          )}

          {mode === 'login' && (
            <div>
              <label>
                Email address
                <input name="email" type="email" autoComplete="username" value={form.email} required placeholder="you@example.com"
                  onChange={event => set('email', event.target.value)} />
              </label>
              <label>
                Password
                <div className="password-field">
                  <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} required placeholder="Enter your password"
                    onChange={event => set('password', event.target.value)} />
                  <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword(v => !v)} />
                </div>
              </label>
              <label className="remember">
                <input type="checkbox" name="remember" checked={form.remember}
                  onChange={event => set('remember', event.target.checked)} /> Keep me signed in
              </label>
            </div>
          )}

          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}

          <button type="submit" className="button primary wide-button" disabled={loading}>
            {loading ? 'Please wait…' : buttonLabel}
          </button>

          <p className="switch">
            {mode === 'login' ? 'New to SuperOffer?' : 'Already registered?'}{' '}
            <Link href={`/auth/${mode === 'login' ? 'register' : 'login'}/${portal}`}>
              {mode === 'login' ? 'Create an account' : 'Log in'}
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
