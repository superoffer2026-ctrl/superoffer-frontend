'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/CoApplicant.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

interface Eligibility {
  verdict: 'LIKELY' | 'POSSIBLE' | 'UNLIKELY' | 'UNKNOWN';
  affordableEmi: number;
  indicativeAmount: number;
  obligationRatio: number;
  reasons: string[];
}

interface CreditCheck {
  band?: string | null;
  outcome: string;
  pulledAt: string;
  staleAfter: string;
}

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;

const VERDICT_COPY: Record<Eligibility['verdict'], { label: string; tone: string }> = {
  LIKELY: { label: 'A lender is likely to consider this', tone: 'good' },
  POSSIBLE: { label: 'A lender may consider this', tone: 'fair' },
  UNLIKELY: { label: 'A lender is unlikely to lend on this alone', tone: 'poor' },
  UNKNOWN: { label: 'Not enough yet to say', tone: 'unknown' }
};

/**
 * The parent or guardian who stands as co-applicant, and the credit check they
 * can choose to run.
 *
 * The form itself is whatever the published section says it is, so an admin can
 * change what is asked without a deploy. What this page owns is the part that
 * cannot be a field: explaining plainly what a credit check is, getting a real
 * decision rather than a pre-ticked box, and showing what it means afterwards.
 */
export function CoApplicant() {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';

  const fields = useSectionFields('coApplicant', []);

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [consented, setConsented] = useState(false);
  const [consentId, setConsentId] = useState('');
  const [check, setCheck] = useState<CreditCheck | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [checking, setChecking] = useState(false);

  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student');
  };

  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    void (async () => {
      try {
        const [saved, consents, summary] = await Promise.all([
          authApi.coApplicant(token),
          authApi.creditConsents(token),
          authApi.loanEligibility(token)
        ]);
        if (saved) setValues(saved as Record<string, unknown>);

        const live = (consents.consents || []).find((c: { kind: string; live: boolean }) => c.kind === 'SELF_PULL' && c.live);
        setConsented(!!live);
        setConsentId(live?.id || '');
        setCheck(summary.check || null);
        setEligibility(summary.eligibility || null);
      } catch (e) {
        if ((e as ApiError).status === 401) return handleUnauthorized();
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setValue = (key: string, value: unknown) => setValues(current => ({ ...current, [key]: value }));

  /** Only what the published form still asks for holds the student here. */
  const missing = fields.fields
    .filter(field => field.required && !String(values[field.key] ?? '').trim())
    .map(field => field.key);

  const save = async () => {
    setTouched(Object.fromEntries(fields.fields.map(f => [f.key, true])));
    setError('');
    if (missing.length) return;

    const token = readAccessToken();
    if (!token) return handleUnauthorized();

    setSaving(true);
    try {
      await authApi.saveCoApplicant(token, values);
      await profile.refresh();
      router.push(returnToReview ? '/student/review' : '/student/projects');
    } catch (e) {
      if ((e as ApiError).status === 401) return handleUnauthorized();
      setError(e instanceof Error ? e.message : 'Those details could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  /** Consent first, then the look-up — never both behind one button. */
  const agreeAndCheck = async () => {
    const token = readAccessToken();
    if (!token) return handleUnauthorized();

    setTouched(Object.fromEntries(fields.fields.map(f => [f.key, true])));
    if (missing.length) return;

    setChecking(true);
    setError('');
    try {
      /** The bureau is sent what is stored, so store it before asking. */
      await authApi.saveCoApplicant(token, values);

      if (!consented) {
        const granted = await authApi.grantSelfCreditConsent(token);
        setConsented(true);
        setConsentId(granted.id);
      }
      await authApi.runSelfCreditCheck(token);
      const summary = await authApi.loanEligibility(token);
      setCheck(summary.check || null);
      setEligibility(summary.eligibility || null);
    } catch (e) {
      if ((e as ApiError).status === 401) return handleUnauthorized();
      setError(e instanceof Error ? e.message : 'That check could not be run.');
    } finally {
      setChecking(false);
    }
  };

  const withdraw = async () => {
    const token = readAccessToken();
    if (!token || !consentId) return;
    try {
      await authApi.revokeCreditConsent(token, consentId);
      setConsented(false);
      setConsentId('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That could not be withdrawn.');
    }
  };

  if (!loaded) {
    return <section className={cx('co-applicant')}><p className={cx('muted')}>Loading…</p></section>;
  }

  const verdict = eligibility ? VERDICT_COPY[eligibility.verdict] : null;

  return (
    <section className={cx('co-applicant')}>
      <header className={cx('head')}>
        <div>
          <h2>{fields.title || 'Parent or Guardian'} details</h2>
          <p>{fields.description || 'The co-applicant on an education loan'}</p>
        </div>
      </header>

      {/* Why a student is being asked for someone else's details at all. */}
      <p className={cx('why')}>
        An education loan is almost always taken in a parent or guardian&rsquo;s name, with you as the student.
        Lenders look at their income and credit record, not yours — so these details are what let a lender tell you
        whether they can help.
      </p>

      <div className={cx('grid')}>
        <SchemaFields
          fields={fields.fields}
          values={values}
          errors={Object.fromEntries(missing.map(key => [key, 'This is needed']))}
          touched={touched}
          cx={cx}
          onChange={setValue}
          onBlur={key => setTouched(current => ({ ...current, [key]: true }))}
        />
      </div>

      {error && <p className={cx('error')} role="alert">{error}</p>}

      {/* ── The credit check ─────────────────────────────────────────────── */}
      <section className={cx('credit')}>
        <h3>Credit check</h3>
        <p className={cx('credit-explainer')}>
          With their permission we can check your parent or guardian&rsquo;s credit record to show which loans they are
          likely to qualify for. <strong>This is a soft check — it does not affect their credit score.</strong> A lender
          runs its own formal check later, and only once you have asked them to.
        </p>

        {check?.band && (
          <div className={cx('band')}>
            <small>CREDIT BAND</small>
            <strong>{check.band}</strong>
            <em>Checked {new Date(check.pulledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</em>
          </div>
        )}

        {/* A thin file is normal, and saying so stops it reading as a rejection. */}
        {check && check.outcome === 'NO_HISTORY' && (
          <div className={cx('band', 'neutral')}>
            <small>NO CREDIT HISTORY</small>
            <strong>Nothing on file</strong>
            <em>Normal for someone who has never borrowed. Lenders will look at income and documents instead.</em>
          </div>
        )}

        <div className={cx('credit-actions')}>
          <button type="button" className={cx('secondary')} onClick={() => void agreeAndCheck()} disabled={checking || !!missing.length}>
            {checking ? 'Checking…' : consented ? 'Run the check again' : 'Agree and run the check'}
          </button>
          {consented && (
            <button type="button" className={cx('plain')} onClick={() => void withdraw()}>
              Withdraw permission
            </button>
          )}
        </div>
        {!!missing.length && <small className={cx('muted')}>Fill in the details above first.</small>}
      </section>

      {/* ── What it means ────────────────────────────────────────────────── */}
      {eligibility && verdict && (
        <section className={cx('verdict', verdict.tone)}>
          <h3>{verdict.label}</h3>
          <div className={cx('verdict-figures')}>
            <div>
              <small>COULD REPAY EACH MONTH</small>
              <strong>{money(eligibility.affordableEmi)}</strong>
            </div>
            <div>
              <small>WHICH SUPPORTS ABOUT</small>
              <strong>{money(eligibility.indicativeAmount)}</strong>
            </div>
          </div>
          <ul>
            {eligibility.reasons.map(reason => <li key={reason}>{reason}</li>)}
          </ul>
          <small className={cx('muted')}>
            An estimate to help you plan, not an offer. Every lender applies its own rules before it decides.
          </small>
        </section>
      )}

      <footer className={cx('foot')}>
        <Link className={cx('plain')} href="/student/financial-information">Previous</Link>
        <button type="button" className={cx('primary')} onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </footer>
    </section>
  );
}
