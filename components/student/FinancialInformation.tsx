'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { useNextStepPath, useStepBadge } from '@/lib/forms/use-profile-steps';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { studentProfileStore, useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/FinancialInformation.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

type IncomeField = 'fatherIncome' | 'motherIncome' | 'guardianIncome';

const EARNER_INCOME_FIELDS: Record<string, IncomeField> = {
  Father: 'fatherIncome',
  Mother: 'motherIncome',
  Guardian: 'guardianIncome'
};

const INCOME_LABELS: Record<IncomeField, { label: string; placeholder: string; error: string }> = {
  fatherIncome: { label: "Father's Annual Income", placeholder: 'e.g. 10,00,000', error: "Enter father's annual income" },
  motherIncome: { label: "Mother's Annual Income", placeholder: 'e.g. 8,00,000', error: "Enter mother's annual income" },
  guardianIncome: { label: "Guardian's Annual Income", placeholder: 'e.g. 8,00,000', error: "Enter guardian's annual income" }
};

const parseAmount = (value: string) => Number((value || '').replace(/[^0-9.]/g, '')) || 0;

/** Single-select combo box shared by the funding-source and employment-category fields. */
function SingleComboField({
  label, placeholder, toggleLabel, emptyText, options, selected, open, query, invalid, error,
  onOpen, onClose, onQueryChange, onSelect
}: {
  label: string;
  placeholder: string;
  toggleLabel: string;
  emptyText: string;
  options: string[];
  selected: string;
  open: boolean;
  query: string;
  invalid: boolean;
  error: string;
  onOpen(): void;
  onClose(): void;
  onQueryChange(value: string): void;
  onSelect(value: string): void;
}) {
  const input = useRef<HTMLInputElement>(null);

  return (
    <label className={cx('combo-field', 'wide', invalid && 'field-invalid')}>
      <span className={cx('field-label')}>{label} <span className={cx('required-mark')}>*</span></span>
      <div className={cx('combo-input-wrap')}>
        <input
          ref={input}
          type="text"
          placeholder={placeholder}
          value={open ? query || selected : selected}
          onFocus={onOpen}
          onChange={event => onQueryChange(event.target.value)}
          onBlur={onClose}
        />
        <button
          type="button"
          className={cx('combo-arrow', open && 'open')}
          onMouseDown={event => event.preventDefault()}
          onClick={() => {
            if (open) {
              onClose();
              input.current?.blur();
            } else {
              onOpen();
              input.current?.focus();
            }
          }}
          aria-label={toggleLabel}
        >
          ▾
        </button>
      </div>
      {open && (
        <ul className={cx('combo-list')} onMouseDown={event => event.preventDefault()}>
          {options.map(option => (
            <li key={option} onClick={() => onSelect(option)}>
              <span className={cx('option-check', selected === option && 'checked')}>✓</span>{option}
            </li>
          ))}
          {!options.length && <li className={cx('combo-empty')}>{emptyText}</li>}
        </ul>
      )}
      {invalid && <small className={cx('field-error')}>{error}</small>}
    </label>
  );
}

export function FinancialInformation() {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';
  /** Numbered against the steps this student actually has. */
  const stepBadge = useStepBadge('financial-information');
  /** Continue follows the published order, not a name typed in here. */
  const nextStep = useNextStepPath('financial-information');

  const [fundingOptions, setFundingOptions] = useState<string[]>([]);
  const [currencyOptions, setCurrencyOptions] = useState<string[]>([]);
  const [earningOptions, setEarningOptions] = useState<string[]>([]);

  const [fundingSource, setFundingSource] = useState('');
  const [earningMembers, setEarningMembers] = useState<string[]>([]);
  const [incomes, setIncomes] = useState<Record<IncomeField, string>>({ fatherIncome: '', motherIncome: '', guardianIncome: '' });
  const [currency, setCurrency] = useState('');
  const [needsLoan, setNeedsLoan] = useState('');

  const [openField, setOpenField] = useState<'funding' | 'earning' | null>(null);
  const [queries, setQueries] = useState({ funding: '', earning: '' });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const seeded = useRef(false);

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  const FIN_CODED = ['fundingSource', 'earningMembers', 'earnerIncomes', 'fatherIncome', 'motherIncome', 'guardianIncome', 'annualHouseholdIncome', 'currency', 'needsLoan'];

  /** What the published form says about the fields drawn by hand below. */
  const fields = useSectionFields('financialInformation', FIN_CODED);

  const extras = useSchemaExtras(
    'financialInformation',
    FIN_CODED,
    profile.profile.financial,
    profile.loaded
  );


  const earningInput = useRef<HTMLInputElement>(null);

  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student?sessionExpired=1');
  };

  /** Seed once from the section the server already holds. */
  useEffect(() => {
    if (seeded.current || !profile.loaded) return;
    seeded.current = true;
    const saved = profile.profile.financial || {};
    if (!saved['fundingSource']) return;
    setFundingSource(String(saved['fundingSource'] || ''));
    setCurrency(String(saved['currency'] || ''));
    setNeedsLoan(String(saved['needsLoan'] || ''));
    setIncomes({
      fatherIncome: String(saved['fatherIncome'] || ''),
      motherIncome: String(saved['motherIncome'] || ''),
      guardianIncome: String(saved['guardianIncome'] || '')
    });
    setEarningMembers((saved['earningMembers'] as string[]) || []);
  }, [profile.loaded, profile.profile.financial]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/student');
        return;
      }
      try {
        const options = await authApi.getFinancialInformationReferenceData();
        if (cancelled) return;
        setFundingOptions(options.fundingSourceOptions);
        setCurrencyOptions(options.currencyOptions);
        setEarningOptions(options.earningMemberOptions);
      } catch {
        // Reference data endpoint unreachable — dropdowns stay empty.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = (options: string[], query: string) => {
    const q = query.trim().toLowerCase();
    return !q ? options : options.filter(option => option.toLowerCase().includes(q));
  };

  const isEarningSelected = (value: string) => earningMembers.includes(value);

  const toggleEarning = (value: string) => {
    setEarningMembers(current => {
      const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
      /** An earner that is deselected loses its income; one that is selected requires it. */
      const field = EARNER_INCOME_FIELDS[value];
      if (field && !next.includes(value)) setIncomes(prev => ({ ...prev, [field]: '' }));
      return next;
    });
    setTouched(current => ({ ...current, earningMembers: true }));
    setQueries(current => ({ ...current, earning: '' }));
  };

  const householdIncomeTotal = () =>
    earningMembers.reduce((sum, earner) => {
      const field = EARNER_INCOME_FIELDS[earner];
      return sum + (field ? parseAmount(incomes[field]) : 0);
    }, 0);

  const markTouched = (key: string) => setTouched(current => ({ ...current, [key]: true }));

  /**
   * Only what the published form still asks for is enforced. A field the admin
   * has hidden or made optional cannot hold a student on this step.
   *
   * The per-earner incomes hang off `earnerIncomes`, since that is the block the
   * builder shows them under.
   */
  const stillAsks = (key: string, under = key) =>
    fields.shows(under) && fields.isRequired(key === under ? key : under, true);

  const invalidFields: Record<string, boolean> = {
    fundingSource: stillAsks('fundingSource') && !fundingSource,
    earningMembers: stillAsks('earningMembers') && !earningMembers.length,
    currency: stillAsks('currency') && !currency,
    needsLoan: stillAsks('needsLoan') && !needsLoan,
    fatherIncome: fields.shows('earnerIncomes') && isEarningSelected('Father') && !incomes.fatherIncome.trim(),
    motherIncome: fields.shows('earnerIncomes') && isEarningSelected('Mother') && !incomes.motherIncome.trim(),
    guardianIncome: fields.shows('earnerIncomes') && isEarningSelected('Guardian') && !incomes.guardianIncome.trim()
  };

  const showError = (key: string) => (touched[key] || submitted) && invalidFields[key];
  const formInvalid = Object.values(invalidFields).some(Boolean);

  const saveAndContinue = async () => {
    setSubmitted(true);
    extras.touchAll();
    setSaveError('');
    if (formInvalid) return;

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    const annualHouseholdIncome = String(householdIncomeTotal());

    setSaving(true);
    try {
      await authApi.saveStudentFinancialInformation(token, {
        ...extras.values0,
        fundingSource,
        earningMembers,
        fatherIncome: incomes.fatherIncome || undefined,
        motherIncome: incomes.motherIncome || undefined,
        guardianIncome: incomes.guardianIncome || undefined,
        annualHouseholdIncome,
        currency,
        needsLoan,
      });

      await profile.refresh();

      /* The answer just written decides where Continue goes. */
      router.push(returnToReview ? '/student/review' : nextStep({ needsLoan }));
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your financial details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const incomeField = (earner: string) => {
    const field = EARNER_INCOME_FIELDS[earner];
    if (!field || !isEarningSelected(earner)) return null;
    const copy = INCOME_LABELS[field];
    return (
      <label key={field} className={cx(showError(field) && 'field-invalid')}>
        <span className={cx('field-label')}>{copy.label} <span className={cx('required-mark')}>*</span></span>
        <input
          type="text"
          placeholder={copy.placeholder}
          value={incomes[field]}
          onChange={event => setIncomes(current => ({ ...current, [field]: event.target.value }))}
          onBlur={() => markTouched(field)}
        />
        {showError(field) && <small className={cx('field-error')}>{copy.error}</small>}
      </label>
    );
  };

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <form className={cx('profile-form-card')} onSubmit={event => { event.preventDefault(); void saveAndContinue(); }}>
          <div className={cx('card-head')}>
            <div className={cx('placeholder-copy')}>
              <div>
                <h2>{fields.title || 'Financial Information'} details</h2>
                <p>{fields.description || 'Your information is securely saved to your student profile.'}</p>
              </div>
            </div>
            <span className={cx('step-badge')}>{stepBadge}</span>
          </div>

          <h3 className={cx('section-title')}>{fields.groupLabel('funding', 'Education Funding')}</h3>
          <div className={cx('field-grid')}>
            {!!extras.fields.length && (
              <SchemaFields
                fields={extras.fields}
                values={extras.values}
                errors={extras.errors}
                touched={extras.touched}
                cx={cx}
                onChange={extras.setValue}
                onBlur={extras.setTouched}
              />
            )}


            <SingleComboField
              label={fields.labelOf('fundingSource', 'How do you plan to fund your education?')}
              placeholder="Search funding sources"
              toggleLabel="Toggle funding sources"
              emptyText="No matching option"
              options={filtered(fundingOptions, queries.funding)}
              selected={fundingSource}
              open={openField === 'funding'}
              query={queries.funding}
              invalid={!!showError('fundingSource')}
              error="Select how you plan to fund your education"
              onOpen={() => { setOpenField('funding'); setQueries(c => ({ ...c, funding: '' })); }}
              onClose={() => setOpenField(current => (current === 'funding' ? null : current))}
              onQueryChange={value => setQueries(c => ({ ...c, funding: value }))}
              onSelect={value => {
                setFundingSource(current => (current === value ? '' : value));
                markTouched('fundingSource');
                setQueries(c => ({ ...c, funding: '' }));
                setOpenField(null);
              }}
            />
          </div>

          <h3 className={cx('section-title')}>{fields.groupLabel('background', 'Financial Background')}</h3>
          <div className={cx('field-grid')}>
            <label className={cx('combo-field', 'wide', showError('earningMembers') && 'field-invalid')}>
              <span className={cx('field-label')}>{fields.labelOf('earningMembers', 'Who is currently earning in your family?')}{fields.isRequired('earningMembers', true) && <span className={cx('required-mark')}> *</span>}</span>
              <div className={cx('combo-input-wrap')}>
                <input
                  ref={earningInput}
                  type="text"
                  placeholder="Search"
                  value={openField === 'earning' ? queries.earning || earningMembers.join(', ') : earningMembers.join(', ')}
                  onFocus={() => { setOpenField('earning'); setQueries(c => ({ ...c, earning: '' })); }}
                  onChange={event => setQueries(c => ({ ...c, earning: event.target.value }))}
                  onBlur={() => setOpenField(current => (current === 'earning' ? null : current))}
                />
                <button
                  type="button"
                  className={cx('combo-arrow', openField === 'earning' && 'open')}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    if (openField === 'earning') {
                      setOpenField(null);
                      earningInput.current?.blur();
                    } else {
                      setOpenField('earning');
                      setQueries(c => ({ ...c, earning: '' }));
                      earningInput.current?.focus();
                    }
                  }}
                  aria-label="Toggle earning members"
                >
                  ▾
                </button>
              </div>
              {openField === 'earning' && (
                <ul className={cx('combo-list')} onMouseDown={event => event.preventDefault()}>
                  {filtered(earningOptions, queries.earning).map(option => (
                    <li key={option} onClick={() => toggleEarning(option)}>
                      <span className={cx('option-check', isEarningSelected(option) && 'checked')}>✓</span>{option}
                    </li>
                  ))}
                  {!filtered(earningOptions, queries.earning).length && (
                    <li className={cx('combo-empty')}>No matching option</li>
                  )}
                </ul>
              )}
              {showError('earningMembers') && <small className={cx('field-error')}>Select who is currently earning</small>}
            </label>

            {['Father', 'Mother', 'Guardian'].map(incomeField)}

            {fields.shows('currency') && (
              <label className={cx(showError('currency') && 'field-invalid')}>
                <span className={cx('field-label')}>{fields.labelOf('currency', 'Currency')}{fields.isRequired('currency', true) && <span className={cx('required-mark')}> *</span>}</span>
                <select
                  value={currency}
                  onChange={event => { setCurrency(event.target.value); markTouched('currency'); }}
                  onBlur={() => markTouched('currency')}
                >
                  <option value="" disabled>Select currency</option>
                  {currencyOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
                {showError('currency') && <small className={cx('field-error')}>Select a currency</small>}
              </label>
            )}

            {earningMembers.length > 1 && (
              <div className={cx('wide')}>
                <span className={cx('field-label')}>{fields.labelOf('annualHouseholdIncome', 'Annual Household Income')}</span>
                <div className={cx('computed-income')}>
                  {householdIncomeTotal().toLocaleString('en-US')} {currency}
                </div>
              </div>
            )}
          </div>

          <h3 className={cx('section-title')}>{fields.groupLabel('loan', 'Education Loan')}</h3>
          <div className={cx('declaration-group')}>
            <label className={cx('declaration-item')}>
              <input
                type="radio" name="needsLoan" value="yes"
                checked={needsLoan === 'yes'}
                onChange={() => { setNeedsLoan('yes'); markTouched('needsLoan');
                  studentProfileStore.previewNeedsLoan('yes'); }}
              />
              <span>Yes, I&apos;ll need an education loan to fund part of my studies.</span>
            </label>
            <label className={cx('declaration-item')}>
              <input
                type="radio" name="needsLoan" value="no"
                checked={needsLoan === 'no'}
                onChange={() => { setNeedsLoan('no'); markTouched('needsLoan');
                  studentProfileStore.previewNeedsLoan('no'); }}
              />
              <span>No, I&apos;m self-funded or already have funding arranged.</span>
            </label>
            {needsLoan === 'yes' && (
              <small className={cx('field-hint')}>
                You can check your CIBIL score and get loans from banks once you enter the dashboard.
              </small>
            )}
            {showError('needsLoan') && <small className={cx('field-error')}>Let us know if you&apos;ll need an education loan</small>}
          </div>

          {submitted && formInvalid && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </form>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/work-experience">Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
