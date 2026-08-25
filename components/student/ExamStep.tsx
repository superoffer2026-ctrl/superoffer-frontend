'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { useCompositeRows } from '@/lib/forms/use-composite-rows';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useStore } from '@/lib/stores/observable-store';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/EntranceExams.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

export interface ExamEntry {
  exam: string;
  status: string;
  /** Whatever the published row definition asks for, keyed by its field. */
  [key: string]: string;
}

export interface ExamStepConfig {
  /** Which published section this step renders, so admin-added fields land here. */
  sectionKey: string;
  /** The keys the step draws itself; everything else in the section is added. */
  codedKeys: string[];
  /** The repeating block in that section whose rows this step renders. */
  compositeKey: string;
  heading: string;
  stepBadge: string;
  question: string;
  yesHint: string;
  noHint: string;
  noOptionCopy: string;
  previousHref: string;
  nextHref: string;
  loadOptions(): Promise<{ examOptions: string[]; statusOptions: string[] }>;
  readSaved(profile: any): Array<Record<string, string>>;
  save(token: string, exams: ExamEntry[], attended: string): Promise<unknown>;
  saveErrorMessage: string;
}

const emptyEntry = (exam: string): ExamEntry => ({ exam, status: '' });

/**
 * The English and Competitive exam steps are the same screen with different
 * option sources and payload keys, so both share this implementation — see
 * EnglishExam.tsx and CompetitiveExam.tsx for the two configurations.
 */
export function ExamStep({ config }: { config: ExamStepConfig }) {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';

  const [examOptions, setExamOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [attended, setAttended] = useState('');
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [attendedTouched, setAttendedTouched] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  const extras = useSchemaExtras(
    config.sectionKey,
    /*
     * 'attended' is drawn by hand as the Yes/No cards below, so it must be
     * declared here too. Without it the hook treats the published field as an
     * admin addition and draws it a second time as a plain select — and because
     * it is required, Continue silently refused to save until that phantom
     * control was filled in as well.
     */
    [...config.codedKeys, 'attended'],
    profile.profile.entranceExams as Record<string, unknown> | undefined,
    profile.loaded
  );

  /**
   * What each exam row asks for comes from the published form, keyed on the
   * status of the row itself. Which exams there are still comes from the picker.
   */
  const rows = useCompositeRows(config.sectionKey, config.compositeKey);
  /** The section's own copy, as published. */
  const fields = useSectionFields(config.sectionKey, [...config.codedKeys, 'attended']);
  /** The status pill is drawn by hand; the rest of the row is not. */
  const scoreRows = (entry: ExamEntry) => rows.forRow(entry).filter(field => field.key !== 'status');

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
      try {
        const options = await config.loadOptions();
        if (cancelled) return;
        setExamOptions(options.examOptions);
        setStatusOptions(options.statusOptions);
      } catch {
        // Reference data endpoint unreachable — pickers stay empty; existing selections still load below.
      }
      try {
        const { authApi } = await import('@/lib/api/auth-api');
        const profile = await authApi.studentProfile(token);
        if (cancelled) return;
        const saved = config.readSaved(profile);
        if (saved.length) {
          setExams(current => {
            if (current.length) return current;
            setAttended('Yes');
            return saved.map(entry => ({
              exam: entry['exam'],
              status: entry['status'] || '',
              score: entry['score'] || '',
              expectedScore: entry['expectedScore'] || '',
              currentScore: entry['currentScore'] || ''
            }));
          });
        }
      } catch (e) {
        if ((e as ApiError).status === 401) {
          handleUnauthorized();
          return;
        }
        // No saved exams yet, or the server is unreachable — the student can still fill the form from scratch.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPicked = (examName: string) => exams.some(entry => entry.exam === examName);
  const pickedNames = () => exams.map(entry => entry.exam);

  const filteredExamOptions = () => {
    const q = pickerQuery.trim().toLowerCase();
    return !q ? examOptions : examOptions.filter(option => option.toLowerCase().includes(q));
  };

  const toggleExam = (examName: string) =>
    setExams(current =>
      current.some(entry => entry.exam === examName)
        ? current.filter(entry => entry.exam !== examName)
        : [...current, emptyEntry(examName)]
    );

  /**
   * Switching status clears every score box, then the published row definition
   * decides which ones come back — a retake asks for two, a booked test for one.
   */
  const setExamStatus = (examName: string, status: string) => {
    setExams(current =>
      current.map(entry => {
        if (entry.exam !== examName) return entry;
        const cleared: ExamEntry = { exam: entry.exam, status };
        return cleared;
      })
    );
    setTouched(current => ({ ...current, [`${examName}.status`]: true }));
  };

  const setScore = (examName: string, key: string, value: string) =>
    setExams(current => current.map(entry => (entry.exam === examName ? { ...entry, [key]: value } : entry)));

  const onAttendedClick = (value: string) => {
    const next = attended === value ? '' : value;
    setAttended(next);
    setAttendedTouched(true);
    if (next !== 'Yes') setExams([]);
  };

  const entryInvalid = (entry: ExamEntry, key: string): boolean => {
    if (key === 'status') return !entry.status;
    return !String(entry[key] || '').trim();
  };

  const showGroupError = (entry: ExamEntry, key: string) =>
    (touched[`${entry.exam}.${key}`] || submitted) && entryInvalid(entry, key);

  const formInvalid =
    !attended || exams.some(entry => !entry.status || !!rows.missingIn(entry).length);

  const saveAndContinue = async () => {
    setSubmitted(true);
    extras.touchAll();
    setSaveError('');
    if (formInvalid || !extras.valid) return;

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    setSaving(true);
    try {
      await config.save(token, exams, attended);
      await profile.refresh();
      router.push(returnToReview ? '/student/review' : config.nextHref);
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : config.saveErrorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <form className={cx('profile-form-card')} onSubmit={event => { event.preventDefault(); void saveAndContinue(); }}>
          <div className={cx('card-head')}>
            <div className={cx('placeholder-copy')}>
              <div>
                <h2>{fields.title ? `${fields.title} details` : config.heading}</h2>
                <p>Your information is securely saved to your student profile.</p>
              </div>
            </div>
            <span className={cx('step-badge')}>{config.stepBadge}</span>
          </div>

          {!!extras.fields.length && (
            <div className={cx('field-grid')}>
              <SchemaFields
                fields={extras.fields}
                values={extras.values}
                errors={extras.errors}
                touched={extras.touched}
                cx={cx}
                onChange={extras.setValue}
                onBlur={extras.setTouched}
              />
            </div>
          )}

          {!attended && (
            <div className={cx('qualification-question')}>
              <h2>
                {fields.labelOf('attended', config.question)}
                {fields.isRequired('attended', true) && <span className={cx('required-mark')}> *</span>}
              </h2>
              <div className={cx('choice-grid')}>
                <button type="button" className={cx('choice-card')} onClick={() => onAttendedClick('Yes')}>
                  <span className={cx('choice-icon')}>✓</span>
                  <span><strong>Yes</strong><small>{fields.hintFor('attended', 'Yes', config.yesHint)}</small></span>
                </button>
                <button type="button" className={cx('choice-card')} onClick={() => onAttendedClick('No')}>
                  <span className={cx('choice-icon')}>–</span>
                  <span><strong>No</strong><small>{fields.hintFor('attended', 'No', config.noHint)}</small></span>
                </button>
              </div>
              {(attendedTouched || submitted) && !attended && <small className={cx('field-error')}>Select an option</small>}
            </div>
          )}

          <div className={cx('reveal-section', attended === 'Yes' && 'open')}>
            <div className={cx('exam-category-card')}>
              <div className={cx('exam-pick-block')}>
                <span className={cx('field-label')}>
                  {fields.labelOf(config.compositeKey, 'Which exam(s) have you taken or are preparing for?')}
                </span>
                <div className={cx('combo-field')}>
                  <input
                    type="text"
                    placeholder="Search exams"
                    value={pickerOpen ? pickerQuery : pickedNames().join(', ')}
                    onFocus={() => { setPickerOpen(true); setPickerQuery(''); }}
                    onChange={event => setPickerQuery(event.target.value)}
                    onBlur={() => setPickerOpen(false)}
                  />
                  <button
                    type="button"
                    className={cx('combo-arrow', pickerOpen && 'open')}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => { setPickerOpen(open => !open); setPickerQuery(''); }}
                    aria-label="Toggle exam list"
                  >
                    ▾
                  </button>
                  {pickerOpen && (
                    <ul className={cx('combo-list')} onMouseDown={event => event.preventDefault()}>
                      {filteredExamOptions().map(option => (
                        <li key={option} onClick={() => toggleExam(option)}>
                          <span className={cx('option-check', isPicked(option) && 'checked')}>✓</span>{option}
                        </li>
                      ))}
                      {!filteredExamOptions().length && <li className={cx('combo-empty')}>No matching exam</li>}
                    </ul>
                  )}
                </div>
              </div>

              {exams.map(entry => (
                <div key={entry.exam} className={cx('exam-entry-card')}>
                  <div className={cx('exam-entry-head')}>
                    <strong>{entry.exam}</strong>
                    <button
                      type="button"
                      className={cx('exam-entry-remove')}
                      onClick={() => toggleExam(entry.exam)}
                      aria-label="Remove exam"
                    >
                      ×
                    </button>
                  </div>
                  <div className={cx('status-pill-row')}>
                    {statusOptions.map(status => (
                      <button
                        key={status}
                        type="button"
                        className={cx('status-pill', entry.status === status && 'active')}
                        onClick={() => setExamStatus(entry.exam, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                  {showGroupError(entry, 'status') && <small className={cx('field-error')}>Select a status</small>}

                  <div className={cx('score-fields', scoreRows(entry).length === 1 && 'single')}>
                    {scoreRows(entry).map(field => (
                      <label
                        key={field.key}
                        className={cx('field-block', showGroupError(entry, field.key) && 'field-invalid')}
                      >
                        <span className={cx('field-label')}>
                          {field.label}
                          {field.required && <span className={cx('required-mark')}>*</span>}
                        </span>
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          /* IELTS is scored out of 9 and TOEFL out of 120, so one
                             shared "e.g. 7.5" is wrong for most exams. The hint
                             comes from the published form, keyed on the exam. */
                          placeholder={fields.hintFor(config.compositeKey, entry.exam, field.placeholder || '')}
                          value={entry[field.key] || ''}
                          onChange={event => setScore(entry.exam, field.key, event.target.value)}
                          onBlur={() => setTouched(current => ({ ...current, [`${entry.exam}.${field.key}`]: true }))}
                        />
                        {showGroupError(entry, field.key) && (
                          <small className={cx('field-error')}>Enter your {field.label.toLowerCase()}</small>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {!exams.length && (
                <p className={cx('exam-note')}>{fields.helpOf('attended') || config.noOptionCopy}</p>
              )}
            </div>
          </div>

          {submitted && formInvalid && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </form>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href={config.previousHref}>Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
