'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import type { Qualification } from '@/lib/options/education';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useCompositeRows } from '@/lib/forms/use-composite-rows';
import { useNextStepPath, useStepBadge } from '@/lib/forms/use-profile-steps';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import type { FormFieldDef } from '@/lib/forms/use-form-schema';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/AcademicInformation.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

type LevelValues = Record<string, Record<string, string>>;

/**
 * Reconstructs the same field-set-per-qualification-level structure that used to be
 * hardcoded, but built from the option lists fetched from the backend.
 */
/** The keys this step draws itself; anything else published is an addition. */
const ACADEMIC_CODED = ['history', 'educationGap', 'qualificationLevel', 'institution', 'score', 'graduationYear', 'qualification'];

export function AcademicInformation() {
  const profile = useStudentProfile();

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  const extras = useSchemaExtras(
    'academicInformation',
    ACADEMIC_CODED,
    profile.profile.academic,
    profile.loaded
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';
  /** Numbered against the steps this student actually has. */
  const stepBadge = useStepBadge('academic-information');
  /** Continue follows the published order, not a name typed in here. */
  const nextStep = useNextStepPath('academic-information');

  const [loaded, setLoaded] = useState(false);
  const [levels, setLevels] = useState<Qualification[]>([]);
  const [educationGapOptions, setEducationGapOptions] = useState<string[]>([]);
  /**
   * What each academic row asks for comes from the published form, keyed on the
   * qualification level of the row itself. How many rows there are still comes
   * from which levels the student ticked.
   */
  const rows = useCompositeRows('academicInformation', 'history');

  /** The section's own title and the fields it draws by hand, as published. */
  const fields = useSectionFields('academicInformation', ACADEMIC_CODED);

  const [selected, setSelected] = useState<Partial<Record<Qualification, boolean>>>({});
  const [levelValues, setLevelValues] = useState<LevelValues>({});
  const [educationGap, setEducationGap] = useState('');
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student?sessionExpired=1');
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/student');
        return;
      }

      let levelList: Qualification[] = [];
      try {
        const options = await authApi.getAcademicInformationReferenceData();
        if (cancelled) return;
        levelList = options.qualificationOptions as Qualification[];
        setLevels(levelList);
        setEducationGapOptions(options.educationGapOptions);
      } catch (e) {
        if ((e as ApiError).status === 401) {
          handleUnauthorized();
          return;
        }
        // Reference data unreachable — fall back to an empty qualification list; the student can retry later.
      }
      setLoaded(true);

      try {
        const profile = await authApi.studentProfile(token);
        if (cancelled) return;
        const academic = (profile?.academic as { history?: Array<Record<string, string>>; educationGap?: string }) || {};
        const history = academic.history || [];
        if (history.length) {
          const nextSelected: Partial<Record<Qualification, boolean>> = {};
          const nextValues: LevelValues = {};
          for (const entry of history) {
            const level = entry['level'] as Qualification;
            if (!levelList.includes(level)) continue;
            nextSelected[level] = true;
            /** Every saved value is kept, including fields an admin added later. */
            nextValues[level] = {};
            for (const [key, value] of Object.entries(entry)) {
              if (key !== 'level' && value !== undefined) nextValues[level][key] = String(value);
            }
          }
          setSelected(current => (Object.keys(current).length ? current : nextSelected));
          setLevelValues(current => (Object.keys(current).length ? current : nextValues));
          if (academic.educationGap) setEducationGap(academic.educationGap);
        }
      } catch (e) {
        if ((e as ApiError).status === 401) {
          handleUnauthorized();
          return;
        }
        // No saved academic info yet, or the server is unreachable — the student can still fill the form from scratch.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Labels come worded for the row: `labelWhen` in the schema renames the score
   *  field to "Percentage" for 11th and 12th, where there is no CGPA to give. */
  const fieldsFor = (level: Qualification) => rows.forRow({ level, ...(levelValues[level] || {}) });
  const isSelected = (level: Qualification) => !!selected[level];
  const selectedLevels = (): Qualification[] => levels.filter(level => selected[level]);
  const hasAboveSchoolLevel = () => selectedLevels().some(level => level !== '11th' && level !== '12th');

  const valueOf = (level: Qualification, key: string) => levelValues[level]?.[key] ?? '';

  const setFieldValue = (level: Qualification, key: string, value: string) =>
    setLevelValues(current => ({ ...current, [level]: { ...(current[level] || {}), [key]: value } }));

  const toggleLevel = (level: Qualification) => {
    setSelected(current => ({ ...current, [level]: !current[level] }));
    setLevelValues(current => {
      if (!current[level]) return { ...current, [level]: {} };
      const next = { ...current };
      next[level] = {};
      return next;
    });
  };

  const markLevelFieldTouched = (level: Qualification, key: string) =>
    setFieldTouched(current => ({ ...current, [`${level}.${key}`]: true }));

  const showLevelFieldError = (level: Qualification, key: string) =>
    (fieldTouched[`${level}.${key}`] || submitted) && !valueOf(level, key).trim();

  const showSelectionError = () => submitted && !selectedLevels().length;

  const formInvalid = selectedLevels().some(level =>
    !!rows.missingIn({ level, ...(levelValues[level] || {}) }).length);

  const saveAndContinue = async () => {
    setSubmitted(true);
    extras.touchAll();
    setSaveError('');
    if (formInvalid || !selectedLevels().length) return;

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    const selectedList = selectedLevels();
    const highest = selectedList[selectedList.length - 1];
    const highestFields = levelValues[highest] || {};

    const institution = highestFields['institutionName'] || '';
    const score = highestFields['cgpa'] || '';
    const graduationYear = highestFields['completionYear'] || '';
    const degreeSummary = [highestFields['degreeName'], highestFields['specialization']].filter(Boolean).join(' ');
    const qualification = degreeSummary || highest || '';
    const history = selectedList.map(level => ({ level, ...(levelValues[level] || {}) }));

    const payload = {
      ...extras.values0,
      qualificationLevel: highest,
      institution,
      score,
      graduationYear,
      qualification,
      educationGap: educationGap || undefined,
      history
    };

    setSaving(true);
    try {
      await authApi.saveStudentAcademicInformation(token, payload);

      await profile.refresh();

      router.push(returnToReview ? '/student/review' : nextStep());
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your academic details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderControl = (level: Qualification, field: FormFieldDef) => {
    const shared = {
      value: valueOf(level, field.key),
      onBlur: () => markLevelFieldTouched(level, field.key),
      onChange: (event: { target: { value: string } }) => setFieldValue(level, field.key, event.target.value)
    };
    const options = rows.optionsFor(field);

    if (field.type === 'select' && !field.allowCustom) {
      return (
        <select {...shared}>
          <option value="" disabled>Select {field.label}</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      );
    }
    /** A list the student may add to: a datalist keeps both the suggestions and free text. */
    if (field.type === 'select') {
      const listId = `${level}-${field.key}-list`;
      return (
        <>
          <input type="text" list={listId} placeholder={field.placeholder || 'Select or type your own'} {...shared} />
          <datalist id={listId}>
            {options.map(option => <option key={option} value={option}></option>)}
          </datalist>
        </>
      );
    }
    if (field.type === 'number') {
      return <input type="number" min={field.validation?.min ?? 0} placeholder={field.placeholder || ''} {...shared} />;
    }
    if (field.type === 'textarea') {
      return <textarea rows={3} placeholder={field.placeholder || ''} {...shared} />;
    }
    return <input type="text" placeholder={field.placeholder || ''} {...shared} />;
  };

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        {!loaded && (
          <div className={cx('profile-form-card')}>
            <p>Loading…</p>
          </div>
        )}

        {loaded && (
          <form className={cx('profile-form-card')} onSubmit={event => { event.preventDefault(); void saveAndContinue(); }}>
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


            <div className={cx('card-head')}>
              <div className={cx('placeholder-copy')}>
                <div>
                  <h2>{fields.title || 'Academic Information'} details</h2>
                  <p>{fields.description || 'Your information is securely saved to your student profile.'}</p>
                </div>
              </div>
              <span className={cx('step-badge')}>{stepBadge}</span>
            </div>

            <div className={cx('qualification-question')}>
              <h2>Select your appropriate qualification(s) <span className={cx('required-mark')}>*</span></h2>
              <div className={cx('qualification-grid')}>
                {levels.map(level => (
                  <button
                    key={level}
                    type="button"
                    className={cx('qualification-card', isSelected(level) && 'selected')}
                    onClick={() => toggleLevel(level)}
                  >
                    <span className={cx('qual-check')}>✓</span>
                    <strong>{level}</strong>
                  </button>
                ))}
              </div>
              {showSelectionError() && <small className={cx('field-error')}>Select at least one qualification</small>}
            </div>

            <div className={cx('reveal-section', selectedLevels().length > 0 && 'open')}>
              {selectedLevels().map(level => (
                <div key={level} className={cx('level-section')}>
                  <h3 className={cx('section-title')}>{level} details</h3>
                  <div className={cx('dynamic-fields')}>
                    {fieldsFor(level).map(field => (
                      <label
                        key={field.key}
                        className={cx(field.wide && 'wide', showLevelFieldError(level, field.key) && 'field-invalid')}
                      >
                        <span className={cx('field-label')}>
                          {field.label}
                          {field.required && <span className={cx('required-mark')}>*</span>}
                        </span>
                        {renderControl(level, field)}
                        {showLevelFieldError(level, field.key) && (
                          <small className={cx('field-error')}>This field is required</small>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {!!selectedLevels().length && hasAboveSchoolLevel() && (
                <>
                  <h3 className={cx('section-title')}>{fields.labelOf('educationGap', 'Do you have an education gap?')}</h3>
                  <div className={cx('field-grid')}>
                    <label className={cx('wide')}>
                      <select value={educationGap} onChange={event => setEducationGap(event.target.value)}>
                        <option value="" disabled>Select</option>
                        {educationGapOptions.map(option => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                  </div>
                </>
              )}
            </div>

            {submitted && (formInvalid || !selectedLevels().length) && (
              <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
            )}
            {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
          </form>
        )}

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/study-preferences">Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving || !loaded} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
