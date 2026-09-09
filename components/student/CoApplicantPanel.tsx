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
  /** The CIBIL score itself, 300-900. Null when the bureau returned no reading. */
  score?: number | null;
  band?: string | null;
  outcome: string;
  pulledAt: string;
  staleAfter: string;
  /** Why there is no score, in words the student can act on. */
  detail?: string;
}

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;

/**
 * How a score reads, and in what colour.
 *
 * 300-900 is a range almost nobody holds in their head, so the number alone
 * says little — "742" means something once it is placed on the scale and named.
 * The tones are the same three the eligibility verdict already uses, so a strong
 * score and a strong verdict do not disagree visually.
 */
const SCORE_READS: { from: number; label: string; tone: string; colour: string }[] = [
  { from: 800, label: 'Excellent', tone: 'good', colour: '#087a50' },
  { from: 750, label: 'Strong', tone: 'good', colour: '#2e9b63' },
  { from: 700, label: 'Good', tone: 'good', colour: '#5d9f46' },
  { from: 650, label: 'Fair', tone: 'fair', colour: '#c2912f' },
  { from: 550, label: 'Weak', tone: 'fair', colour: '#cb7a3a' },
  { from: 300, label: 'Poor', tone: 'poor', colour: '#b4453c' }
];

const SCORE_FLOOR = 300;
const SCORE_CEILING = 900;
/** The drawn arc: a semicircle of radius 84, so its length is πr. */
const ARC_LENGTH = Math.PI * 84;

const readingFor = (score: number) =>
  SCORE_READS.find(entry => score >= entry.from) ?? SCORE_READS[SCORE_READS.length - 1];

const VERDICT_COPY: Record<Eligibility['verdict'], { label: string; tone: string }> = {
  LIKELY: { label: 'A lender is likely to consider this', tone: 'good' },
  POSSIBLE: { label: 'A lender may consider this', tone: 'fair' },
  UNLIKELY: { label: 'A lender is unlikely to lend on this alone', tone: 'poor' },
  UNKNOWN: { label: 'Not enough yet to say', tone: 'unknown' }
};

/** The finance questions. `existingEmi` only counts once `hasExistingLoan` is "Yes". */
const FINANCE_KEYS = [
  'relationship', 'employmentType', 'monthlyIncome', 'hasExistingLoan', 'existingEmi',
  'familyContribution', 'loanAmountRequested'
] as const;
type FinanceKey = typeof FINANCE_KEYS[number];

/** The CIBIL form: exactly what the bureau matches a person on. */
const IDENTITY_KEYS = ['name', 'panNumber', 'mobileNumber', 'gender'] as const;
type IdentityKey = typeof IDENTITY_KEYS[number];

/**
 * Asked here rather than during profile onboarding: confirming the figures and
 * agreeing to share them only means something at the point a lender is about to
 * read them.
 */
const DECLARATION_KEYS = ['declarationAccurate', 'declarationConsent'] as const;
type DeclarationKey = typeof DECLARATION_KEYS[number];

const CODED_KEYS = [...FINANCE_KEYS, ...DECLARATION_KEYS, ...IDENTITY_KEYS];

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

  /** Ticked on the CIBIL form itself; the backend records it before it looks anything up. */
  const [creditConsent, setCreditConsent] = useState(false);
  const [creditError, setCreditError] = useState('');
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
        const [savedValues, summary] = await Promise.all([
          authApi.coApplicant(token),
          authApi.loanEligibility(token)
        ]);
        setValues((savedValues as Record<string, unknown>) || {});
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

  /** A ticked box, not merely a stored value — `false` is an answer, and not the one required. */
  const declarationsAccepted = DECLARATION_KEYS.every(key => values[key] === true);
  const missingFinance = activeFinanceKeys.filter(key => !hasAnswer(values, key));

  const setField = (key: FinanceKey | IdentityKey | DeclarationKey, raw: unknown) => {
    setValues(v => {
      const next = { ...v, [key]: raw };
      /** "No" retires the question, not just its answer — a stale EMI from an earlier "Yes" must not linger. */
      if (key === 'hasExistingLoan' && raw === 'No') next.existingEmi = 0;
      return next;
    });
    setSaved(false);
  };

  const saveFinance = async () => {
    setTouched(t => ({
      ...t,
      ...Object.fromEntries([...activeFinanceKeys, ...DECLARATION_KEYS].map(key => [key, true]))
    }));
    setError('');
    setSaved(false);
    if (missingFinance.length || !declarationsAccepted) return;

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

  /**
   * The CIBIL check: one call carrying the identity and the consent together.
   *
   * The backend records the consent, saves these details against the
   * co-applicant and calls the bureau — the browser never reaches SurePass, and
   * never holds a token that could.
   */
  const runCreditCheck = async () => {
    const token = readAccessToken();
    if (!token) return handleUnauthorized();

    setTouched(t => ({ ...t, ...Object.fromEntries([...IDENTITY_KEYS, 'creditConsent'].map(key => [key, true])) }));
    setCreditError('');
    if (!identityFilled || !creditConsent) return;

    setChecking(true);
    try {
      const result = await authApi.runCreditCheck(token, {
        fullName: String(values.name ?? ''),
        panNumber: String(values.panNumber ?? ''),
        mobileNumber: String(values.mobileNumber ?? ''),
        gender: String(values.gender ?? '').toLowerCase(),
        consent: true
      });
      setCheck(result);
      /** A reading changes what a lender would make of this household. */
      const summary = await authApi.loanEligibility(token);
      setEligibility(summary.eligibility || null);
      await profile.refresh();
    } catch (e) {
      if ((e as ApiError).status === 401) return handleUnauthorized();
      setCreditError(e instanceof Error ? e.message : 'That check could not be run.');
    } finally {
      setChecking(false);
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

  const renderField = (key: FinanceKey | IdentityKey | DeclarationKey) => {
    const def = fieldByKey.get(key);
    if (!def) return null;
    const invalid = touched[key] && !hasAnswer(values, key);

    if (def.type === 'checkbox') {
      const accepted = values[key] === true;
      return (
        <label key={key} className={cx('form-field', 'wide', 'declaration-item')}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={event => setField(key, event.target.checked)}
          />
          <span>{def.label}</span>
        </label>
      );
    }

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

      <div className={cx('form-grid', 'declaration-group')}>
        {DECLARATION_KEYS.map(renderField)}
        {DECLARATION_KEYS.some(key => touched[key]) && !declarationsAccepted && (
          <small className={cx('field-error')}>Please accept both declarations to continue</small>
        )}
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

        <label className={cx('form-field', 'wide', 'declaration-item')}>
          <input
            type="checkbox"
            checked={creditConsent}
            onChange={event => { setCreditConsent(event.target.checked); setCreditError(''); }}
          />
          {/*
            * Written without `supporterPhrase`: that phrase is possessive — "your
            * parent's", "their" — so it reads as a heading and not as the subject
            * of a sentence, which produced "their agrees that…".
            */}
          <span>
            I confirm the person named above agrees that SuperOffer may check their credit record, to show
            which education loans this family is likely to qualify for. This is a soft enquiry and does not
            affect their score.
          </span>
        </label>
        {touched.creditConsent && !creditConsent && (
          <small className={cx('field-error')}>Their consent is required before a credit check can run</small>
        )}

        {check?.outcome === 'SCORED' && typeof check.score === 'number' && (() => {
          const reading = readingFor(check.score);
          const progress = (check.score - SCORE_FLOOR) / (SCORE_CEILING - SCORE_FLOOR);
          const filled = ARC_LENGTH * Math.min(1, Math.max(0, progress));

          return (
            <div className={cx('score-card', reading.tone)}>
              <div className={cx('score-gauge')}>
                <svg viewBox="0 0 200 122" role="img" aria-label={`CIBIL score ${check.score} out of ${SCORE_CEILING}`}>
                  {/* The whole scale, then how far along it this score sits. */}
                  <path d="M 16 100 A 84 84 0 0 1 184 100" fill="none" stroke="#e7ece9" strokeWidth="15" strokeLinecap="round" />
                  <path
                    d="M 16 100 A 84 84 0 0 1 184 100"
                    fill="none"
                    stroke={reading.colour}
                    strokeWidth="15"
                    strokeLinecap="round"
                    strokeDasharray={`${filled} ${ARC_LENGTH}`}
                  />
                  <text x="100" y="86" textAnchor="middle" className={cx('gauge-score')} fill={reading.colour}>
                    {check.score}
                  </text>
                  <text x="100" y="102" textAnchor="middle" className={cx('gauge-reads')}>{reading.label}</text>
                  <text x="14" y="119" textAnchor="middle" className={cx('gauge-end')}>{SCORE_FLOOR}</text>
                  <text x="186" y="119" textAnchor="middle" className={cx('gauge-end')}>{SCORE_CEILING}</text>
                </svg>
              </div>

              <div className={cx('score-meta')}>
                <small>CIBIL SCORE</small>
                <p className={cx('score-headline')}>
                  {check.score} out of {SCORE_CEILING}
                  {check.band ? <span className={cx('score-band')}>{check.band} band</span> : null}
                </p>
                <p className={cx('score-note')}>
                  Checked{' '}
                  {new Date(check.pulledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  Lenders treat a reading as current for about three months.
                </p>
              </div>
            </div>
          );
        })()}

        {check?.outcome === 'NO_HISTORY' && (
          <div className={cx('band', 'neutral')}>
            <small>NO CREDIT HISTORY</small>
            <strong>Nothing on file</strong>
            <em>Normal for someone who has never borrowed. Lenders will look at income and documents instead.</em>
          </div>
        )}

        {/* A bureau that could not match the person is a different answer from one that broke. */}
        {check && (check.outcome === 'IDENTITY_MISMATCH' || check.outcome === 'PROVIDER_ERROR') && (
          <div className={cx('band', 'neutral')}>
            <small>{check.outcome === 'IDENTITY_MISMATCH' ? 'COULD NOT BE MATCHED' : 'CHECK DID NOT COMPLETE'}</small>
            <strong>No score yet</strong>
            <em>{check.detail || 'Please try again in a moment.'}</em>
          </div>
        )}

        {creditError && <p className={cx('error')} role="alert">{creditError}</p>}

        <div className={cx('credit-actions')}>
          <button type="button" className={cx('secondary')} onClick={() => void runCreditCheck()} disabled={checking}>
            {checking ? 'Checking…' : check ? 'Run the check again' : 'Check CIBIL Score'}
          </button>
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
