'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type ApiError, type OtpPurpose, type PortalKey } from '@/lib/api/auth-api';
import { ORG_TYPE_OPTIONS, organizationRole, type OrganizationType } from '@/lib/models/organization';
import {
  INDIA_DIAL_CODE, isMobileComplete, isPasswordValid, MOBILE_DIGITS,
  passwordProblems, toE164, toMobileDigits
} from '@/lib/auth/password-rules';
import { clearAccessToken, writeLocal, writeSession } from '@/lib/storage';
import { PasswordInput } from '@/components/shared/PasswordInput';

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

/**
 * Which panel the student is looking at.
 *
 * `credentials` is the plain form. `otp` and `newPassword` are the two extra
 * stops a WhatsApp identity adds: confirming a number at signup, and choosing a
 * replacement password after a forgotten one. Institutions never leave
 * `credentials` — they still sign in with an email address.
 */
type Step = 'credentials' | 'otp' | 'newPassword';

const RESEND_COOLDOWN_SECONDS = 30;

export function AuthPage({ mode, portal }: { mode: string; portal: PortalKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<AuthFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [step, setStep] = useState<Step>('credentials');
  /** Set when the student has asked to reset a forgotten password, on the login screen. */
  const [forgotPassword, setForgotPassword] = useState(false);
  const [otp, setOtp] = useState({ code: '', phone: '', purpose: 'REGISTER' as OtpPurpose });
  const [resendIn, setResendIn] = useState(0);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState({ password: '', confirm: '' });

  const set = <K extends keyof AuthFormState>(key: K, value: AuthFormState[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  useEffect(() => {
    if (searchParams.get('sessionExpired') === '1') setError('Your session has expired. Please log in again.');
    if (searchParams.get('passwordReset') === '1') {
      setMessage('Your password has been changed. Log in with your new password.');
    }
  }, [searchParams]);

  /** Counts the resend link back in after a code goes out. */
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn(seconds => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const portalLabel = portal.charAt(0).toUpperCase() + portal.slice(1);
  const isStudent = portal === 'student';
  const isOrganization = portal === 'organization';

  const buttonLabel = (() => {
    if (step === 'otp') return 'Verify code';
    if (step === 'newPassword') return 'Save new password';
    if (forgotPassword) return 'Send WhatsApp code';
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
    return ['Sign in with your WhatsApp number', 'Comparable invitations and offers', 'Visibility controls'];
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

  /** Moves to the code panel and starts the resend cooldown. */
  const openOtpStep = (phone: string, purpose: OtpPurpose) => {
    setOtp({ code: '', phone, purpose });
    setStep('otp');
    setResendIn(RESEND_COOLDOWN_SECONDS);
    setMessage(`We sent a 6-digit code to ${phone} on WhatsApp.`);
  };

  const backToCredentials = () => {
    setStep('credentials');
    setForgotPassword(false);
    setError('');
    setMessage('');
    setOtp({ code: '', phone: '', purpose: 'REGISTER' });
    setResetToken('');
    setNewPassword({ password: '', confirm: '' });
  };

  const submitOrganization = async () => {
    if (mode === 'register') {
      if (!isPasswordValid(form.password)) return;
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

  /**
   * Students: WhatsApp number and password, with no approval step. Registering
   * hands off to the code panel, because the number is not theirs until a code
   * sent to it comes back.
   */
  const submitStudentCredentials = async () => {
    if (!isMobileComplete(form.phone)) {
      setError(`Enter all ${MOBILE_DIGITS} digits of your WhatsApp number.`);
      return;
    }
    const phone = toE164(form.phone);

    /** No banner: the field already carries the reason, right where the fix is. */
    if (mode === 'register' && !isPasswordValid(form.password)) return;

    if (forgotPassword) {
      try {
        const sent = await authApi.requestOtp(phone, 'PASSWORD_RESET');
        openOtpStep(sent.phone || phone, 'PASSWORD_RESET');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not send a code to that number.');
      }
      return;
    }

    if (mode === 'register') {
      try {
        const registration = await authApi.register({
          fullName: form.fullName,
          phone,
          password: form.password,
          role: role()
        });
        setForm(current => ({ ...current, password: '' }));
        openOtpStep(registration.phone || phone, 'REGISTER');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not create your account.');
      }
      return;
    }

    try {
      const session = await authApi.login(phone, form.password);
      await openPortal(session);
    } catch (e) {
      const apiError = e as ApiError;
      /** A signup that never confirmed its code: pick it up where it stopped. */
      if (apiError.code === 'PHONE_NOT_VERIFIED') {
        try {
          const sent = await authApi.requestOtp(phone, 'REGISTER');
          openOtpStep(sent.phone || phone, 'REGISTER');
        } catch (resend) {
          setError(resend instanceof Error ? resend.message : 'Could not send a code to that number.');
        }
        return;
      }
      setError(e instanceof Error ? e.message : 'Could not log in.');
    }
  };

  const submitOtp = async () => {
    try {
      const verified = await authApi.verifyOtp(otp.phone, otp.code.trim());
      /** A reset code buys the password form; a registration code signs them in. */
      if (verified.reset_token) {
        setResetToken(verified.reset_token);
        setNewPassword({ password: '', confirm: '' });
        setStep('newPassword');
        setMessage('Number confirmed. Choose a new password.');
        return;
      }
      await openPortal(verified);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code could not be verified.');
    }
  };

  const resendOtp = async () => {
    setError('');
    try {
      await authApi.requestOtp(otp.phone, otp.purpose);
      setResendIn(RESEND_COOLDOWN_SECONDS);
      setMessage(`We sent a new code to ${otp.phone} on WhatsApp.`);
    } catch (e) {
      const apiError = e as ApiError;
      if (apiError.code === 'OTP_ALREADY_SENT' && apiError.body?.retry_after_seconds) {
        setResendIn(Number(apiError.body.retry_after_seconds));
      }
      setError(e instanceof Error ? e.message : 'Could not send another code.');
    }
  };

  const submitNewPassword = async () => {
    if (!isPasswordValid(newPassword.password)) return;
    if (newPassword.password !== newPassword.confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await authApi.resetPassword(resetToken, newPassword.password);
      backToCredentials();
      router.push(`/auth/login/${portal}?passwordReset=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your password could not be changed.');
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (step === 'otp') await submitOtp();
    else if (step === 'newPassword') await submitNewPassword();
    else if (isOrganization) await submitOrganization();
    else await submitStudentCredentials();

    setLoading(false);
  };

  const heading = (() => {
    if (step === 'otp') return 'Confirm your WhatsApp number';
    if (step === 'newPassword') return 'Choose a new password';
    if (forgotPassword) return 'Reset your password';
    return mode === 'login' ? 'Log in to SuperOffer' : 'Create your account';
  })();

  const subheading = (() => {
    if (step === 'otp') return `Enter the 6-digit code we sent to ${otp.phone} on WhatsApp.`;
    if (step === 'newPassword') return 'Then log in with your WhatsApp number and this password.';
    if (forgotPassword) return 'We will send a code to your WhatsApp number so you can set a new password.';
    return mode === 'login'
      ? 'Enter the details associated with your account.'
      : 'Use accurate information to create your role-specific access.';
  })();

  /**
   * Names only what is still missing, and only once there is something to judge.
   * Each clause clears itself as the password grows, so an empty box says
   * nothing and a good password says nothing.
   */
  const passwordProblem = (value: string) => {
    const problem = passwordProblems(value);
    return problem ? <p className="field-error">{problem}</p> : null;
  };

  /**
   * The dial code is fixed, so the student types only the ten national digits.
   * `username` autocomplete lets the browser offer to save the number with the
   * password, exactly as it would for an email sign-in.
   */
  const whatsAppField = (
    <label className="full">
      WhatsApp number
      <span className="phone-field">
        <span className="dial-code">{INDIA_DIAL_CODE}</span>
        <input
          name="phone" type="tel" inputMode="numeric" autoComplete="username"
          value={form.phone} required maxLength={MOBILE_DIGITS} placeholder="9876543210"
          onChange={event => set('phone', toMobileDigits(event.target.value))}
        />
      </span>
    </label>
  );

  const rememberField = (
    <label className="remember">
      <input type="checkbox" name="remember" checked={form.remember}
        onChange={event => set('remember', event.target.checked)} /> Keep me signed in
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
        <form onSubmit={onSubmit}>
          <Link className="back-link" href={`/${portal === 'student' ? 'students' : portal}`}>← Back to {portalLabel}</Link>
          <span className="eyebrow">
            {step === 'credentials' && mode === 'register' ? 'Account registration' : 'Secure sign in'}
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
              <div className="full">{passwordProblem(form.password)}</div>
            </div>
          )}

          {step === 'credentials' && mode === 'register' && isStudent && (
            <div className="form-grid">
              <label className="full">
                Full name
                <input name="fullName" autoComplete="name" value={form.fullName} required placeholder="Your full name"
                  onChange={event => set('fullName', event.target.value)} />
              </label>
              {whatsAppField}
              <p className="field-note full">We send a confirmation code here, so use the number on your WhatsApp.</p>
              <label className="full">
                Password
                <PasswordInput name="password" value={form.password} required
                  autoComplete="new-password" placeholder="Choose a password"
                  onChange={event => set('password', event.target.value)} />
              </label>
              <div className="full">{passwordProblem(form.password)}</div>
            </div>
          )}

          {step === 'credentials' && mode === 'login' && isStudent && (
            <div>
              {whatsAppField}
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

          {step === 'credentials' && mode === 'login' && !isStudent && (
            <div>
              <label>
                Email address
                <input name="email" type="email" autoComplete="username" value={form.email} required placeholder="you@example.com"
                  onChange={event => set('email', event.target.value)} />
              </label>
              <label>
                Password
                <PasswordInput name="password" value={form.password} required
                  autoComplete="current-password" placeholder="Enter your password"
                  onChange={event => set('password', event.target.value)} />
              </label>
              {rememberField}
            </div>
          )}

          {step === 'otp' && (
            <div>
              <label>
                6-digit code
                <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required
                  value={otp.code} placeholder="000000"
                  onChange={event => setOtp(current => ({ ...current, code: event.target.value.replace(/\D/g, '') }))} />
              </label>
              <p className="switch">
                {resendIn > 0
                  ? <span>You can request another code in {resendIn}s.</span>
                  : <button type="button" className="link-button" onClick={() => void resendOtp()}>Send another code</button>}
              </p>
              <p className="switch">
                <button type="button" className="link-button" onClick={backToCredentials}>
                  ← Use a different number
                </button>
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
              {passwordProblem(newPassword.password)}
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
