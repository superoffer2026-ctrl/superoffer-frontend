'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import { useNextStepPath } from '@/lib/forms/use-profile-steps';
import styles from '@/styles/CoApplicant.module.css';
import wizardStyles from '@/styles/student/Wizard.module.css';
import { LOAN_COPY } from '@/lib/models/loan-journey-copy';
import { WizardGuide, WizardIllustration } from './wizard/WizardIllustration';

const cx = classNames(styles);
const wz = classNames(wizardStyles);

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
 * Three tones rather than six, so neighbouring bands do not read as different
 * kinds of answer.
 */
const SCORE_READS: { from: number; label: string; tone: string; colour: string; reads: string }[] = [
  /*
   * `reads` is the sentence under the gauge. It describes the credit profile and
   * nothing beyond it: what a lender will do with the number is theirs to decide,
   * so none of these promises or implies an outcome.
   */
  { from: 800, label: 'Excellent', tone: 'good', colour: '#047857', reads: 'Your credit profile is excellent.' },
  { from: 750, label: 'Strong', tone: 'good', colour: '#2e9b63', reads: 'Your credit profile looks strong.' },
  { from: 700, label: 'Good', tone: 'good', colour: '#5d9f46', reads: 'Your credit profile looks good.' },
  { from: 650, label: 'Fair', tone: 'fair', colour: '#c2912f', reads: 'Your credit profile is fair.' },
  { from: 550, label: 'Weak', tone: 'fair', colour: '#cb7a3a', reads: 'Your credit profile has some weak points.' },
  { from: 300, label: 'Poor', tone: 'poor', colour: '#b4453c', reads: 'Your credit profile needs attention.' }
];

const SCORE_FLOOR = 300;
const SCORE_CEILING = 900;
/** The drawn arc: a semicircle of radius 84, so its length is πr. */
const ARC_LENGTH = Math.PI * 84;

const readingFor = (score: number) =>
  SCORE_READS.find(entry => score >= entry.from) ?? SCORE_READS[SCORE_READS.length - 1];

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

const icon = (paths: string) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: paths }} />
);

const FIELD_ICON: Record<FinanceKey, ReturnType<typeof icon>> = {
  relationship: icon('<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>'),
  employmentType: icon('<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
  monthlyIncome: icon('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
  hasExistingLoan: icon('<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'),
  existingEmi: icon('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  familyContribution: icon('<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  loanAmountRequested: icon('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>')
};

const SHIELD_ICON = icon('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>');

/**
 * Financial eligibility for an education loan, and an optional credit check on
 * whoever is supporting it — asked one question at a time, in the same frame as
 * the profile wizard.
 *
 * It used to be one long page, on the reasoning that seeing the whole shape of
 * what is asked helps. In practice it read as a form about somebody else's
 * money and was abandoned partway; a single question with a Continue button is
 * the same seven answers, without the wall. The questions, their order and what
 * is saved are unchanged — only how many are on screen at once.
 *
 * The student stays the user throughout. Reached from the dashboard's loan flow
 * rather than as an onboarding step, since filling this in is opt-in.
 */
export function CoApplicantPanel({ wizard }: { wizard?: boolean } = {}) {
  const nextStep = useNextStepPath('co-applicant');
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

  /**
   * The journey: every live finance question, then the declarations, then the
   * result. Recomputed each render, because answering "No" to an existing loan
   * retires its EMI question — so Continue moves to whatever is genuinely next.
   */
  const stepIds = [...activeFinanceKeys, 'declarations', 'result'] as const;
  const [stepIndex, setStepIndex] = useState(0);
  const stepAt = Math.min(stepIndex, stepIds.length - 1);
  const stepId = stepIds[stepAt];

  /**
   * A student coming back lands on the first thing still unanswered rather than
   * at the top — the whole point of saving as you go is not having to walk past
   * your own answers again.
   */
  const resumed = useRef(false);
  useEffect(() => {
    if (!loaded || resumed.current) return;
    resumed.current = true;
    const firstGap = activeFinanceKeys.findIndex(key => !hasAnswer(values, key));
    if (firstGap >= 0) setStepIndex(firstGap);
    else setStepIndex(declarationsAccepted ? stepIds.length - 1 : activeFinanceKeys.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

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


  /** Just the control — pills or input, no label/wrapper. Shared by the quiz cards and the plain identity fields. */
  const renderControl = (key: FinanceKey | IdentityKey | DeclarationKey, def: NonNullable<ReturnType<typeof fieldByKey.get>>) => {
    if (def.type === 'select') {
      return (
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
      );
    }

    if (def.type === 'number') {
      return (
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
      );
    }

    return (
      <input
        type={def.type === 'date' ? 'date' : def.type === 'tel' ? 'tel' : 'text'}
        placeholder={def.placeholder}
        value={String(values[key] ?? '')}
        onChange={event => setField(key, key === 'panNumber' ? event.target.value.toUpperCase() : event.target.value)}
        onBlur={() => setTouched(t => ({ ...t, [key]: true }))}
      />
    );
  };

  /** Plain labelled field — used for the identity block, which stays a simple grid, not a quiz card. */
  const renderField = (key: FinanceKey | IdentityKey | DeclarationKey) => {
    const def = fieldByKey.get(key);
    if (!def) return null;
    const invalid = touched[key] && !hasAnswer(values, key);
    const wide = def.type === 'select';

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

    return (
      <label key={key} className={cx('form-field', wide && 'wide', invalid && 'field-invalid')}>
        <span className={cx('field-label')}>{def.label}</span>
        {renderControl(key, def)}
        {def.helpText && <small className={cx('field-hint')}>{def.helpText}</small>}
        {invalid && <small className={cx('field-error')}>This is needed</small>}
      </label>
    );
  };

  /**
   * The funding details are complete and stored — every live question answered
   * and both declarations accepted. Deliberately independent of the credit
   * check: a lender screens on income and obligations, and a CIBIL reading only
   * refines that, so the student has finished without it.
   */
  const financeSubmitted = !missingFinance.length && declarationsAccepted;

  const copy = LOAN_COPY[stepId] || LOAN_COPY.result;

  /** Whether this step has what it needs before Continue will move on. */
  const stepReady = (() => {
    if (stepId === 'result') return true;
    if (stepId === 'declarations') return declarationsAccepted;
    return hasAnswer(values, stepId);
  })();

  const goBack = () => setStepIndex(index => Math.max(0, index - 1));

  /**
   * Continue. Every step but the last simply advances; the declarations step
   * saves first, because that is the point the student has confirmed the
   * figures and there is a complete set of answers to send.
   */
  const goNext = async () => {
    if (stepId === 'result') return;

    if (!stepReady) {
      setTouched(t => ({
        ...t,
        ...(stepId === 'declarations'
          ? Object.fromEntries(DECLARATION_KEYS.map(key => [key, true]))
          : { [stepId]: true })
      }));
      return;
    }

    if (stepId === 'declarations') {
      await saveFinance();
      /** A failed save keeps the student here rather than showing a result built on nothing. */
      if (missingFinance.length) return;
    }
    setStepIndex(index => Math.min(index + 1, stepIds.length - 1));
  };

  return (
    <div className={`${wz('embedded')} ${cx('journey')}`}>
      <section className={wz('frame')} aria-labelledby="loan-step-title">
        <header className={wz('frameHead')}>
          <h1 id="loan-step-title">Loan &amp; Funding</h1>
          <div className={wz('headRight')}>
            <span className={wz('counter')}>{stepAt + 1}/{stepIds.length}</span>
          </div>
        </header>

        {/* One segment per step: filled once passed, bright for the one open now. */}
        <nav className={wz('segments')} aria-label="Loan questions">
          {stepIds.map((id, index) => {
            const reachable = index <= stepAt;
            const className = wz('segment', index === stepAt && 'current', index < stepAt && 'complete');
            /* A step already passed is a way back to that answer. One not yet
               reached is not clickable — the questions build on each other. */
            return reachable ? (
              <button
                key={id}
                type="button"
                className={className}
                onClick={() => setStepIndex(index)}
                aria-current={index === stepAt ? 'step' : undefined}
                aria-label={`Go to question ${index + 1}`}
              />
            ) : (
              <span key={id} className={className} />
            );
          })}
        </nav>

        {/*
          * The result step is not a question, so it drops the wizard's
          * furniture — no guide, no illustration, no tip. Those left a 300px
          * picture beside an empty column, and on the one screen where a
          * lender's actual answer appears, nothing should compete with it.
          */}
        {stepId === 'result' ? (
          <section className={cx('cibil')} aria-labelledby="cibil-title">
            {(() => {
              const scored = check?.outcome === 'SCORED' && typeof check.score === 'number';
              const reading = scored ? readingFor(check!.score as number) : null;
              const progress = scored ? ((check!.score as number) - SCORE_FLOOR) / (SCORE_CEILING - SCORE_FLOOR) : 0;
              const filled = ARC_LENGTH * Math.min(1, Math.max(0, progress));

              return (
                <>
                  {/* The gauge is the screen. Before a check it is drawn empty at
                      the same size, so the student can see what they are about to
                      get rather than a button that promises something unseen. */}
                  <div
                    className={cx('cibil-dial', scored && reading!.tone, !scored && 'is-empty')}
                    style={scored ? ({ ['--cibil-colour' as string]: reading!.colour }) : undefined}
                  >
                    <svg viewBox="0 0 240 150" role="img" aria-label={scored ? `CIBIL score ${check!.score} out of ${SCORE_CEILING}` : 'CIBIL score not checked yet'}>
                      <path d="M 24 124 A 96 96 0 0 1 216 124" fill="none" stroke="#eceff0" strokeWidth="18" strokeLinecap="round" />
                      {scored && (
                        <path
                          className={cx('cibil-arc')}
                          d="M 24 124 A 96 96 0 0 1 216 124"
                          fill="none"
                          stroke={reading!.colour}
                          strokeWidth="18"
                          strokeLinecap="round"
                          strokeDasharray={`${filled} ${ARC_LENGTH}`}
                        />
                      )}
                      <text x="24" y="146" textAnchor="middle" className={cx('cibil-end')}>{SCORE_FLOOR}</text>
                      <text x="216" y="146" textAnchor="middle" className={cx('cibil-end')}>{SCORE_CEILING}</text>
                    </svg>

                    <div className={cx('cibil-centre')}>
                      {scored ? (
                        <>
                          <strong className={cx('cibil-number')}>{check!.score}</strong>
                          <span className={cx('cibil-band')}>{reading!.label}</span>
                        </>
                      ) : (
                        <>
                          <span className={cx('cibil-shield')} aria-hidden="true">{SHIELD_ICON}</span>
                          <span className={cx('cibil-band')}>Not checked yet</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/*
                    * The funding details stand on their own. They are saved and
                    * a lender can screen on them without any credit reading —
                    * `assessEligibility` takes the band as optional — so the
                    * student is told they are finished *before* being offered
                    * something extra. Otherwise the check reads as a wall.
                    */}
                  {!scored && financeSubmitted && (
                    <p className={cx('cibil-saved')}>
                      <strong>✓ Your funding details are saved.</strong> A lender can already screen you on them. A
                      credit check is not needed for that — it only firms up the read.
                    </p>
                  )}

                  <h2 id="cibil-title" className={cx('cibil-title')}>
                    {scored ? reading!.reads : `Check ${supporterPhrase} CIBIL score`}
                    {!scored && <span className={cx('cibil-optional')}>Optional</span>}
                  </h2>

                  {scored ? (
                    <>
                      {/* Date and freshness, kept deliberately quiet — it is
                          provenance, not the news. */}
                      <p className={cx('cibil-sub')}>
                        Checked on{' '}
                        {new Date(check!.pulledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}current for about three months
                      </p>

                      {/*
                        * What the number is for, and who sees it. No affordability
                        * figures and no suggestion of approval: this screen is the
                        * credit profile, and what a lender does with it is a
                        * separate question the page does not answer.
                        */}
                      <p className={cx('cibil-explain')}>
                        Your CIBIL score helps lenders understand your credit history when they consider funding
                        opportunities. Banks may read your credit profile when evaluating one — they are shown the
                        band, never the exact score.
                      </p>
                    </>
                  ) : (
                    <p className={cx('cibil-sub')}>
                      A soft enquiry — it does not affect the score. It needs the consent of the person being checked,
                      so only run it with them. You can skip it and come back any time.
                    </p>
                  )}

                  {/* An outcome that is not a score is still an answer, and a
                      short one — no history is normal, a mismatch is fixable. */}
                  {check && !scored && (
                    <p className={cx('cibil-note', check.outcome === 'NO_HISTORY' && 'is-neutral')}>
                      <strong>
                        {check.outcome === 'NO_HISTORY' ? 'Nothing on file yet.'
                          : check.outcome === 'IDENTITY_MISMATCH' ? 'Could not be matched.'
                            : 'The check did not complete.'}
                      </strong>{' '}
                      {check.outcome === 'NO_HISTORY'
                        ? 'Normal for someone who has never borrowed — lenders will read income and documents instead.'
                        : check.detail || 'Please try again in a moment.'}
                    </p>
                  )}

                  {/* What the bureau matches a person on. Hidden once a score is
                      in, so the screen is the score and nothing else. */}
                  {!scored && (
                    <div className={cx('cibil-form')}>
                      <div className={cx('form-grid')}>
                        {IDENTITY_KEYS.map(renderField)}
                      </div>
                      <label className={cx('form-field', 'wide', 'declaration-item')}>
                        <input
                          type="checkbox"
                          checked={creditConsent}
                          onChange={event => { setCreditConsent(event.target.checked); setCreditError(''); }}
                        />
                        {/* Not written with `supporterPhrase`: it is possessive —
                            "your parent's" — and reads as a heading, not a subject. */}
                        <span>The person named above agrees to this check.</span>
                      </label>
                      {touched.creditConsent && !creditConsent && (
                        <small className={cx('field-error')}>Their consent is required before a check can run</small>
                      )}
                    </div>
                  )}

                  {creditError && <p className={cx('error')} role="alert">{creditError}</p>}

                  {/*
                    * Once there is a score, the useful next move is forward — to
                    * the funding a lender might offer on it. Re-running the check
                    * is not: a reading under ninety days old is reused rather
                    * than pulled again, so it would usually change nothing.
                    */}
                  <div className={cx('cibil-actions')}>
                    {scored ? (
                      <button
                        type="button"
                        className={cx('journey-btn', 'primary')}
                        onClick={() => router.push(wizard ? nextStep() : '/student/offers')}
                      >
                        {wizard ? 'Continue to next step' : 'View funding opportunities'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={cx('journey-btn', 'primary')}
                        onClick={() => void runCreditCheck()}
                        disabled={checking}
                      >
                        {checking ? 'Checking…' : 'Check CIBIL score'}
                      </button>
                    )}
                    {/* Skipping is a finished state, not an abandoned one. */}
                    {!scored && (
                      <button
                        type="button"
                        className={cx('journey-btn', 'quiet')}
                        onClick={() => router.push(wizard ? nextStep() : '/student/dashboard')}
                      >
                        {wizard ? 'Skip and continue' : 'Skip for now'}
                      </button>
                    )}
                  </div>

                  <div className={cx('cibil-minor')}>
                    {scored && (
                      <button
                        type="button"
                        className={cx('journey-btn', 'secondary')}
                        onClick={() => void runCreditCheck()}
                        disabled={checking}
                      >
                        {checking ? 'Checking…' : 'Check again'}
                      </button>
                    )}
                    <button type="button" className={cx('journey-btn', 'secondary')} onClick={goBack}>
                      Back to Loan &amp; Funding
                    </button>
                  </div>
                </>
              );
            })()}
          </section>
        ) : (
          <>
            <div className={wz('ask')}>
              <span className={wz('guide')}><WizardGuide /></span>
              <div className={wz('bubble')}>
                <p className={wz('question')}>{copy.question}</p>
                <p className={wz('lede')}>{copy.lede}</p>
              </div>
            </div>

            <div className={wz('body')}>

              <main className={wz('form')}>
                <div className={cx('journey-step')}>
                  {stepId === 'declarations' ? (
                    <>
                      {/*
                        * What is about to be confirmed, and a way to change any
                        * of it. Confirming figures you cannot see is not
                        * confirming anything — each row goes back to the
                        * question that produced it, and Continue brings you
                        * straight back here.
                        */}
                      <ul className={cx('review-list')}>
                        {activeFinanceKeys.map((key, index) => {
                          const def = fieldByKey.get(key);
                          const raw = String(values[key] ?? '').trim();
                          const isMoney = def?.type === 'number';
                          return (
                            <li key={key}>
                              <span className={cx('review-label')}>{def?.label || key}</span>
                              <span className={cx('review-value')}>
                                {raw ? (isMoney ? money(Number(raw) || 0) : raw) : '—'}
                              </span>
                              <button type="button" className={cx('review-edit')} onClick={() => setStepIndex(index)}>
                                Edit
                              </button>
                            </li>
                          );
                        })}
                      </ul>

                      <div className={cx('form-grid', 'declaration-group')}>
                        {DECLARATION_KEYS.map(renderField)}
                        {DECLARATION_KEYS.some(key => touched[key]) && !declarationsAccepted && (
                          <small className={cx('field-error')}>Please accept both declarations to continue</small>
                        )}
                      </div>
                    </>
                  ) : (
                    (() => {
                      const def = fieldByKey.get(stepId);
                      if (!def) return null;
                      const invalid = touched[stepId] && !hasAnswer(values, stepId);
                      return (
                        <div className={cx('journey-question', invalid && 'field-invalid')}>
                          <span className={cx('journey-question-label')}>
                            <i className={cx('journey-question-icon')}>{FIELD_ICON[stepId as FinanceKey]}</i>
                            {def.label}
                          </span>
                          {renderControl(stepId, def)}
                          {def.helpText && <small className={cx('field-hint')}>{def.helpText}</small>}
                          {invalid && <small className={cx('field-error')}>This is needed</small>}
                        </div>
                      );
                    })()
                  )}

                  {error && <p className={cx('error')} role="alert">{error}</p>}
                </div>

              </main>
            </div>

            {/* Below both columns, not inside the form one.
                It used to live in the form column and reach out with negative
                margins to span the card — which works only while the form is
                the taller side. On a one-field question the illustration and
                tip are taller, so the bar rode up over them. */}
            <div className={cx('step-actions')}>
              <button
                type="button"
                className={cx('journey-btn', 'secondary')}
                onClick={goBack}
                disabled={stepAt === 0}
              >
                Back
              </button>
              <button
                type="button"
                className={cx('journey-btn', 'primary')}
                disabled={saving}
                onClick={() => void goNext()}
              >
                {saving ? 'Saving…' : stepId === 'declarations' ? 'Save & see result' : 'Continue'}
              </button>
              <small className={cx('save-message')}>{saved ? 'Saved.' : ''}</small>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
