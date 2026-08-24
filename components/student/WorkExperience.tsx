'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useCompositeRows } from '@/lib/forms/use-composite-rows';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/WorkExperience.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

interface Experience {
  companyName: string;
  role: string;
  type: string;
  durationMonths: string;
  description: string;
}

const emptyExperience = (entry?: Record<string, string>): Experience => ({
  companyName: entry?.['companyName'] || '',
  role: entry?.['role'] || '',
  type: entry?.['type'] || '',
  durationMonths: entry?.['durationMonths'] || '',
  description: entry?.['description'] || ''
});

export function WorkExperience() {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';

  const [employmentTypes, setEmploymentTypes] = useState<string[]>([]);
  const [workStatus, setWorkStatus] = useState('');
  const [relevantYears, setRelevantYears] = useState('');
  const [nonRelevantYears, setNonRelevantYears] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const seeded = useRef(false);

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  /** What the published form says about the fields drawn by hand below. */
  const fields = useSectionFields('workExperience', ['workStatus', 'relevantYears', 'nonRelevantYears', 'experiences']);

  /** What each role row asks for, as published. */
  const rows = useCompositeRows('workExperience', 'experiences');

  const extras = useSchemaExtras(
    'workExperience',
    ['workStatus', 'relevantYears', 'nonRelevantYears', 'experiences', 'companyName', 'jobRole'],
    profile.profile.workExperience,
    profile.loaded
  );


  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student?sessionExpired=1');
  };

  /** Seed once from the section the server already holds. */
  useEffect(() => {
    if (seeded.current || !profile.loaded) return;
    seeded.current = true;
    const work = profile.profile.workExperience || {};
    const status = String(work['workStatus'] || '');
    setWorkStatus(status);
    setRelevantYears(String(work['relevantYears'] || ''));
    setNonRelevantYears(String(work['nonRelevantYears'] || ''));
    if (status === 'Yes') {
      const saved = (work['experiences'] as Record<string, string>[]) || [];
      setExperiences(saved.length ? saved.map(emptyExperience) : [emptyExperience()]);
    }
  }, [profile.loaded, profile.profile.workExperience]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/student');
        return;
      }
      try {
        const options = await authApi.getWorkExperienceReferenceData();
        if (!cancelled) setEmploymentTypes(options.employmentTypes);
      } catch {
        // Reference data endpoint unreachable — the type dropdown stays empty.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onWorkStatusChange = (value: string) => {
    setWorkStatus(value);
    setTouched(current => ({ ...current, workStatus: true }));
    if (value === 'Yes') {
      setExperiences(current => (current.length ? current : [emptyExperience()]));
    } else {
      setExperiences([]);
      setRelevantYears('');
      setNonRelevantYears('');
      setTouched(current => ({ ...current, relevantYears: false, nonRelevantYears: false }));
    }
  };

  const addExperience = () => setExperiences(current => [...current, emptyExperience()]);
  const removeExperience = (index: number) => setExperiences(current => current.filter((_, i) => i !== index));
  const setExperienceValue = (index: number, key: keyof Experience, value: string) =>
    setExperiences(current => current.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry)));

  const markTouched = (key: string) => setTouched(current => ({ ...current, [key]: true }));

  const yearsRequired = workStatus === 'Yes';
  /** A field the admin has hidden or relaxed cannot block the step. */
  const fieldInvalid = (key: 'relevantYears' | 'nonRelevantYears') => {
    if (!fields.shows(key) || !fields.isRequired(key, true)) return false;
    return yearsRequired && !(key === 'relevantYears' ? relevantYears : nonRelevantYears).trim();
  };
  const showError = (key: 'relevantYears' | 'nonRelevantYears') => (touched[key] || submitted) && fieldInvalid(key);

  /**
   * Which fields a role must carry comes from the published row definition, so an
   * admin making one optional actually makes it optional.
   */
  const rowErrors = (index: number, entry: Experience) => {
    const errors: Record<string, string> = {};
    for (const key of rows.missingIn(entry as unknown as Record<string, unknown>)) {
      errors[key] = `${rows.all.find(field => field.key === key)?.label || key} is required`;
    }
    void index;
    return errors;
  };

  const rowTouched = (index: number) => {
    const marks: Record<string, boolean> = {};
    for (const field of rows.all) marks[field.key] = touched[`exp.${index}.${field.key}`] || submitted;
    return marks;
  };

  const formInvalid =
    fieldInvalid('relevantYears') ||
    fieldInvalid('nonRelevantYears') ||
    experiences.some(entry => !!rows.missingIn(entry as unknown as Record<string, unknown>).length);

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

    const first = experiences[0];
    const companyName = first ? first.companyName : '';
    const jobRole = first ? first.role : '';

    setSaving(true);
    try {
      await authApi.saveStudentWorkExperience(token, {
        ...extras.values0,
        workStatus: workStatus || undefined,
        relevantYears: relevantYears || undefined,
        nonRelevantYears: nonRelevantYears || undefined,
        experiences,
        companyName,
        jobRole
      });

      await profile.refresh();

      router.push(returnToReview ? '/student/review' : '/student/financial-information');
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your work experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
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
                <h2>Work Experience details</h2>
                <p>Your information is securely saved to your student profile.</p>
              </div>
            </div>
            <span className={cx('step-badge')}>STEP 6 OF 9</span>
          </div>

          <h3 className={cx('section-title')}>Do you have any work experience?</h3>
          <div className={cx('toggle-group')}>
            <label className={cx('toggle-option', workStatus === 'Fresher' && 'active')}>
              <input
                type="radio" name="workStatus" value="Fresher"
                checked={workStatus === 'Fresher'}
                onChange={() => onWorkStatusChange('Fresher')}
              /> I am a Fresher
            </label>
            <label className={cx('toggle-option', workStatus === 'Yes' && 'active')}>
              <input
                type="radio" name="workStatus" value="Yes"
                checked={workStatus === 'Yes'}
                onChange={() => onWorkStatusChange('Yes')}
              /> Yes
            </label>
          </div>

          <div className={cx('reveal-section', workStatus === 'Yes' && 'open')}>
            <div className={cx('dynamic-fields')}>
              {fields.shows('relevantYears') && (
                <label className={cx(showError('relevantYears') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('relevantYears', 'Relevant Experience (Years)')}{fields.isRequired('relevantYears', true) && <span className={cx('required-mark')}> *</span>}</span>
                  <input
                    type="number" min="0" placeholder="e.g. 2"
                    value={relevantYears}
                    onChange={event => setRelevantYears(event.target.value)}
                    onBlur={() => markTouched('relevantYears')}
                  />
                  {showError('relevantYears') && <small className={cx('field-error')}>Enter your relevant experience</small>}
                </label>
              )}
              {fields.shows('nonRelevantYears') && (
                <label className={cx(showError('nonRelevantYears') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('nonRelevantYears', 'Non-Relevant Experience (Years)')}{fields.isRequired('nonRelevantYears', true) && <span className={cx('required-mark')}> *</span>}</span>
                  <input
                    type="number" min="0" placeholder="e.g. 1"
                    value={nonRelevantYears}
                    onChange={event => setNonRelevantYears(event.target.value)}
                    onBlur={() => markTouched('nonRelevantYears')}
                  />
                  {showError('nonRelevantYears') && <small className={cx('field-error')}>Enter your non-relevant experience</small>}
                </label>
              )}
            </div>

            <h3 className={cx('section-title')}>Experience details</h3>
            <p className={cx('section-hint')}>Add each job or internship — company, role and how long you were there.</p>

            {experiences.map((entry, index) => (
              <div key={index} className={cx('experience-entry')}>
                <div className={cx('experience-entry-head')}>
                  <strong>Experience {index + 1}</strong>
                  <button
                    type="button" className={cx('experience-remove')}
                    onClick={() => removeExperience(index)}
                    aria-label="Remove experience"
                  >
                    ×
                  </button>
                </div>
                {/* The row asks for whatever the published definition says it does. */}
                <div className={cx('dynamic-fields')}>
                  <SchemaFields
                    fields={rows.all}
                    values={entry as unknown as Record<string, unknown>}
                    errors={rowErrors(index, entry)}
                    touched={rowTouched(index)}
                    cx={cx}
                    onChange={(key, value) => setExperienceValue(index, key as keyof Experience, String(value ?? ''))}
                    onBlur={key => markTouched(`exp.${index}.${key}`)}
                  />
                </div>
              </div>
            ))}

            <button type="button" className={cx('add-experience-btn')} onClick={addExperience}>
              + Add {experiences.length ? 'another' : 'an'} experience
            </button>
          </div>

          {submitted && formInvalid && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </form>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/competitive-exam">Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
