"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { authApi, ApiError, PortalKey } from '@/lib/api/auth-api';
import { organizationRole, ORG_TYPE_OPTIONS, type OrganizationType } from '@/lib/models/organization';
import { isPasswordValid, passwordProblems } from '@/lib/auth/password-rules';
import { clearAccessToken, writeLocal, writeSession } from '@/lib/storage';
import { PasswordInput } from '@/components/shared/PasswordInput';

interface AuthFormState {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  password: string;
  confirmPassword: string;
  orgType: OrganizationType;
  country: string;
  remember: boolean;
}

const EMPTY_FORM: AuthFormState = {
  fullName: '', email: '', phone: '', organization: '',
  password: '', confirmPassword: '', orgType: 'UNIVERSITY', country: '',
  remember: true
};

type Step = 'credentials' | 'newPassword' | 'otp';

export function AuthPage({ mode, portal }: { mode: string; portal: PortalKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<AuthFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [step, setStep] = useState<Step>('credentials');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [registerToken, setRegisterToken] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' });

  const set = <K extends keyof AuthFormState>(key: K, value: AuthFormState[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (searchParams.get('sessionExpired') === '1') setError('Your session has expired. Please log in again.');
    if (searchParams.get('passwordReset') === '1') {
      setMessage('Your password has been changed. Log in with your new password.');
    }
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
      setStep('newPassword');
    }
  }, [searchParams]);

  const portalLabel = portal.charAt(0).toUpperCase() + portal.slice(1);
  const isStudent = portal === 'student';
  const isOrganization = portal === 'organization';

  const buttonLabel = (() => {
    if (step === 'newPassword') return 'Save new password';
    if (forgotPassword) return 'Send reset link';
    return mode === 'login' ? 'Log in securely' : 'Create account';
  })();

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
    return ['Comparable invitations and offers', 'Direct university connections', 'Visibility controls'];
  })();

  const role = () => {
    if (isStudent) return 'STUDENT';
    return organizationRole(form.orgType);
  };

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

    if (isOrganization) {
      router.push('/organization/dashboard');
      return;
    }
    router.push(isStudent ? '/student/dashboard' : `/portal/${portal}`);
  };

  const backToCredentials = () => {
    setStep('credentials');
    setForgotPassword(false);
    setError('');
    setMessage('');
    setResetToken('');
    setNewPassword({ password: '', confirm: '' });
  };

  const submitForm = async () => {
    if (step === 'newPassword') {
      if (!isPasswordValid(newPassword.password)) return;
      if (newPassword.password !== newPassword.confirm) {
        setError('Passwords do not match.');
        return;
      }
      try {
        await authApi.resetPassword(resetToken, newPassword.password);
        router.replace(`/auth/login/${portal}?passwordReset=1`);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not save your new password.');
      }
      return;
    }

    if (forgotPassword) {
      if (!form.email) {
        setError('Please enter your email address.');
        return;
      }
      try {
        await authApi.forgotPassword(form.email);
        setMessage(`If an account exists for ${form.email}, a password reset link has been sent.`);
        setForgotPassword(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not request a password reset.');
      }
      return;
    }

        if (step === 'otp' && mode === 'register' && isStudent) {
      if (otp.length < 6) {
        setError('Please enter the 6-digit code.');
        return;
      }
      try {
        await authApi.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          role: role(),
          token: registerToken,
          otp
        });
        
        setMessage('Account created and verified. You can now log in.');
        setForm(current => ({ ...current, password: '', confirmPassword: '' }));
        setStep('credentials');
        router.push('/auth/login/student');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'OTP verification failed.');
      }
      return;
    }

    if (mode === 'register') {
      if (!isPasswordValid(form.password)) return;
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      try {
        if (isStudent) {
          const res = await authApi.sendRegistrationOtp({ email: form.email, fullName: form.fullName || '' });
          setRegisterToken(res.token);
          setStep('otp');
          setMessage(`An OTP has been sent to ${form.email}.`);
          return;
        }

        const session = await authApi.register({
          email: form.email,
          password: form.password,
          fullName: form.fullName || undefined,
          phone: form.phone || undefined,
          role: role(),
          ...(isOrganization ? {
            organization: {
              name: form.organization,
              country: form.country || undefined,
              registrationNumber: undefined,
              licenseReference: undefined,
              website: undefined,
              city: undefined
            }
          } : {})
        });
        
        if (!isStudent) {
          setMessage('Account created. Sign in to finish your verification — student data unlocks once an admin approves it.');
          setForm(current => ({ ...current, password: '', confirmPassword: '' }));
          router.push(`/auth/login/${portal}`);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not submit your registration.');
      }
      return;
    }

    // Login
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

  const handleAction = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await submitForm();
    } finally {
      setLoading(false);
    }
  };

  const heading = (() => {
    if (step === 'newPassword') return 'Choose a new password';
    if (forgotPassword) return 'Reset your password';
    return isStudent ? 'Your opportunities await.' : `${portalLabel} portal.`;
  })();

  const subheading = (() => {
    if (step === 'newPassword') return 'Enter a strong password you haven\'t used before.';
    if (forgotPassword) return 'Enter the email address for your account. We\'ll send a reset link.';
    if (step === 'otp') return 'We have sent a verification code to your email.';
    if (mode === 'register') {
      return isStudent ? 'Fill in your details below to create your profile.' : 'Set up your organization account.';
    }
    return isStudent ? 'Welcome back. Log in to check your offers.' : 'Welcome back to your workspace.';
  })();

  const rememberField = (
    <label className="checkbox-field checkbox-field-tight remember-device">
      <input type="checkbox" checked={form.remember} onChange={e => set('remember', e.target.checked)} />
      Stay signed in on this device
    </label>
  );

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
        <form onSubmit={handleAction} noValidate>
          <Link className="back-link" href={`/${portal === 'student' ? 'students' : portal}`}>← Back to {portalLabel}</Link>
          <span className="eyebrow">
            {step === 'otp' ? 'Verify your email' : (step === 'credentials' && mode === 'register' ? 'Account registration' : 'Secure sign in')}
          </span>
          <h2>{heading}</h2>
          <p>{subheading}</p>

          {step === 'credentials' && mode === 'register' && isOrganization && (
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
                <PasswordInput name="password" value={form.password} required
                  autoComplete="new-password" placeholder="Choose a password"
                  onChange={event => set('password', event.target.value)} />
              </label>
              <label>
                Confirm password
                <PasswordInput name="confirmPassword" value={form.confirmPassword} required
                  autoComplete="new-password" placeholder="Re-enter your password"
                  onChange={event => set('confirmPassword', event.target.value)} />
              </label>
              <div className="full">{passwordProblems(form.password)}</div>
            </div>
          )}

          {step === 'otp' && mode === 'register' && isStudent && (
            <div className="form-grid">
              <label className="full">
                Verification Code (OTP)
                <input name="otp" type="text" value={otp} required placeholder="6-digit code" maxLength={6}
                  onChange={event => setOtp(event.target.value)} style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: '1.25rem' }} />
              </label>
            </div>
          )}

          {step === 'credentials' && mode === 'register' && isStudent && (
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
                <PasswordInput name="password" value={form.password} required
                  autoComplete="new-password" placeholder="Choose a password"
                  onChange={event => set('password', event.target.value)} />
              </label>
              <label className="full">
                Confirm password
                <PasswordInput name="confirmPassword" value={form.confirmPassword} required
                  autoComplete="new-password" placeholder="Re-enter your password"
                  onChange={event => set('confirmPassword', event.target.value)} />
              </label>
              <div className="full">{passwordProblems(form.password)}</div>
            </div>
          )}

          {step === 'credentials' && mode === 'login' && (
            <div>
              <label>
                Email address
                <input name="email" type="email" autoComplete="username" value={form.email} required placeholder="you@example.com"
                  onChange={event => set('email', event.target.value)} />
              </label>
              {!forgotPassword && (
                <>
                  <label>
                    Password
                    <PasswordInput name="password" value={form.password} required
                      autoComplete="current-password" placeholder="Enter your password"
                      onChange={event => set('password', event.target.value)} />
                  </label>
                  {rememberField}
                </>
              )}
              <p className="switch">
                {forgotPassword ? (
                  <button type="button" className="link-button" onClick={backToCredentials}>
                    ← Back to log in
                  </button>
                ) : (
                  <button type="button" className="link-button"
                    onClick={() => { setForgotPassword(true); setError(''); setMessage(''); }}>
                    Forgot your password?
                  </button>
                )}
              </p>
            </div>
          )}

          {step === 'newPassword' && (
            <div>
              <label>
                New password
                <PasswordInput name="newPassword" required autoComplete="new-password"
                  value={newPassword.password} placeholder="Choose a password"
                  onChange={event => setNewPassword(current => ({ ...current, password: event.target.value }))} />
              </label>
              {passwordProblems(newPassword.password)}
              <label>
                Confirm new password
                <PasswordInput name="confirmNewPassword" required autoComplete="new-password"
                  value={newPassword.confirm} placeholder="Re-enter your new password"
                  onChange={event => setNewPassword(current => ({ ...current, confirm: event.target.value }))} />
              </label>
            </div>
          )}

          {message && <p className="form-message success">{message}</p>}
          {error && <p className="form-message error">{error}</p>}

          <button type="submit" className="button primary wide-button" disabled={loading}>
            {loading ? 'Please wait…' : buttonLabel}
          </button>

          {step === 'credentials' && !forgotPassword && (
            <p className="switch">
              {mode === 'login' ? 'New to SuperOffer?' : 'Already registered?'}{' '}
              <Link href={`/auth/${mode === 'login' ? 'register' : 'login'}/${portal}`}>
                {mode === 'login' ? 'Create an account' : 'Log in'}
              </Link>
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
