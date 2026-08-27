'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/CoApplicant.module.css';

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

/** The six finance questions. `existingEmi` only counts once `hasExistingLoan` is "Yes". */
const FINANCE_KEYS = ['relationship', 'employmentType', 'monthlyIncome', 'hasExistingLoan', 'existingEmi', 'loanAmountRequested'] as const;
type FinanceKey = typeof FINANCE_KEYS[number];

const IDENTITY_KEYS = ['name', 'panNumber', 'dateOfBirth', 'mobileNumber'] as const;
type IdentityKey = typeof IDENTITY_KEYS[number];

const CODED_KEYS = [...FINANCE_KEYS, ...IDENTITY_KEYS];

const hasAnswer = (values: Record<string, unknown>, key: string) => String(values[key] ?? '').trim() !== '';

/**
 * Financial eligibility for an education loan, and an optional credit check on
 * whoever is supporting it — one page, not a multi-step quiz, so a student can
 * see the whole shape of what's being asked and fill it in any order.
 *
 * The student stays the user throughout. Reached from the dashboard's loan flow
 * rather than as an onboarding step, since filling this in is opt-in.
 */
export function CoApplicantPanel() {
  const profile = useStudentProfile();
  const router = useRouter();

  const fields = useSectionFields('coApplicant', CODED_KEYS);
  const fieldByKey = useMemo(() => new Map(fields.fields.map(f => [f.key, f])), [fields.fields]);

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
        const [savedValues, consents, summary] = await Promise.all([
          authApi.coApplicant(token),
          authApi.creditConsents(token),
          authApi.loanEligibility(token)
        ]);
        setValues((savedValues as Record<string, unknown>) || {});

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

  const emiApplies = values.hasExistingLoan === 'Yes';
  const activeFinanceKeys = FINANCE_KEYS.filter(key => key !== 'existingEmi' || emiApplies);

  const missingFinance = activeFinanceKeys.filter(key => !hasAnswer(values, key));

  const setField = (key: FinanceKey | IdentityKey, raw: unknown) => {
    setValues(v => {
      const next = { ...v, [key]: raw };
      /** "No" retires the question, not just its answer — a stale EMI from an earlier "Yes" must not linger. */
      if (key === 'hasExistingLoan' && raw === 'No') next.existingEmi = 0;
      return next;
    });
    setSaved(false);
  };

  const saveFinance = async () => {
    setTouched(t => ({ ...t, ...Object.fromEntries(activeFinanceKeys.map(key => [key, true])) }));
    setError('');
    setSaved(false);
    if (missingFinance.length) return;

    const token = readAccessToken();
    if (!token) return handleUnauthorized();

    setSaving(true);
    try {
      await authApi.saveCoApplicant(token, values);
      await profile.refresh();
      setSaved(true);
    } catch (e) {
      if ((e as ApiError).status === 401) return handleUnauthorized();
      setError(e instanceof Error ? e.message : 'Those details could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const identityFilled = IDENTITY_KEYS.every(key => hasAnswer(values, key));

  /** Consent first, then the look-up — never both behind one button. */
  const agreeAndCheck = async () => {
    const token = readAccessToken();
    if (!token) return handleUnauthorized();

    setTouched(t => ({ ...t, ...Object.fromEntries(IDENTITY_KEYS.map(key => [key, true])) }));
    if (!identityFilled) return;

    setChecking(true);
    setError('');
    try {
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

  /** "your Parent's", "your Guardian's", "your own" — read naturally whoever answered the first question. */
  const supporterPhrase = (() => {
    const who = String(values.relationship || '');
    if (who === 'Self') return 'your own';
    if (who) return `your ${who.toLowerCase()}'s`;
    return 'their';
  })();

  const verdict = eligibility ? VERDICT_COPY[eligibility.verdict] : null;

  const renderField = (key: FinanceKey | IdentityKey) => {
    const def = fieldByKey.get(key);
    if (!def) return null;
    const invalid = touched[key] && !hasAnswer(values, key);

    if (def.type === 'select') {
      return (
        <div key={key} className={cx('form-field', 'wide')}>
          <span className={cx('field-label')}>{def.label}</span>
          <div className={cx('quiz-pills')}>
            {(def.options || []).map(option => (
              <button
                key={option}
                type="button"
                className={cx('quiz-pill', values[key] === option && 'is-selected')}
                onClick={() => setField(key, option)}
              >
                {option}
                {values[key] === option && <span className={cx('quiz-pill-check')}>✓</span>}
              </button>
            ))}
          </div>
          {invalid && <small className={cx('field-error')}>This is needed</small>}
        </div>
      );
    }

    const isAmount = def.type === 'number';
    return (
      <label key={key} className={cx('form-field', invalid && 'field-invalid')}>
        <span className={cx('field-label')}>{def.label}</span>
        {isAmount ? (
          <div className={cx('quiz-amount')}>
            <span>₹</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={def.placeholder}
              value={String(values[key] ?? '')}
              onChange={event => setField(key, event.target.value)}
              onBlur={() => setTouched(t => ({ ...t, [key]: true }))}
            />
          </div>
        ) : (
          <input
            type={def.type === 'date' ? 'date' : def.type === 'tel' ? 'tel' : 'text'}
            placeholder={def.placeholder}
            value={String(values[key] ?? '')}
            onChange={event => setField(key, key === 'panNumber' ? event.target.value.toUpperCase() : event.target.value)}
            onBlur={() => setTouched(t => ({ ...t, [key]: true }))}
          />
        )}
        {def.helpText && <small className={cx('field-hint')}>{def.helpText}</small>}
        {invalid && <small className={cx('field-error')}>This is needed</small>}
      </label>
    );
  };

  return (
    <section className={cx('co-applicant')}>
      <header className={cx('page-head')}>
        <span className={cx('quiz-kicker')}>FINANCIAL ELIGIBILITY</span>
        <h2>Tell us who's funding your education</h2>
        <p className={cx('quiz-hint')}>
          A lender reads this person's income and credit record, not yours — a few details here is what lets
          them tell you whether they can help.
        </p>
      </header>

      <div className={cx('form-grid')}>
        {FINANCE_KEYS.filter(key => key !== 'existingEmi' || emiApplies).map(renderField)}
      </div>

      {error && <p className={cx('error')} role="alert">{error}</p>}

      <div className={cx('foot')}>
        <small className={cx('muted')}>{saved ? 'Saved.' : ''}</small>
        <button type="button" className={cx('primary')} disabled={saving} onClick={() => void saveFinance()}>
          {saving ? 'Saving…' : 'Save details'}
        </button>
      </div>

      <hr className={cx('divider')} />

      <section className={cx('credit')}>
        <h3>Check {supporterPhrase} CIBIL score</h3>
        <p className={cx('credit-explainer')}>
          Want to understand the credit profile better? This is a <strong>soft check — it does not affect the
          score.</strong> A lender still runs its own formal check later, and only once invited to.
        </p>

        <div className={cx('form-grid')}>
          {IDENTITY_KEYS.map(renderField)}
        </div>

        {check?.band && (
          <div className={cx('band')}>
            <small>CREDIT BAND</small>
            <strong>{check.band}</strong>
            <em>Checked {new Date(check.pulledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</em>
          </div>
        )}

        {check && check.outcome === 'NO_HISTORY' && (
          <div className={cx('band', 'neutral')}>
            <small>NO CREDIT HISTORY</small>
            <strong>Nothing on file</strong>
            <em>Normal for someone who has never borrowed. Lenders will look at income and documents instead.</em>
          </div>
        )}

        <div className={cx('credit-actions')}>
          <button type="button" className={cx('secondary')} onClick={() => void agreeAndCheck()} disabled={checking}>
            {checking ? 'Checking…' : consented ? 'Run the check again' : 'Check CIBIL Score'}
          </button>
          {consented && (
            <button type="button" className={cx('plain')} onClick={() => void withdraw()}>
              Withdraw permission
            </button>
          )}
        </div>

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
      </section>
    </section>
  );
}
