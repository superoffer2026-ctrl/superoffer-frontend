'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type CSSProperties } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/ReviewProfile.module.css';

const cx = classNames(styles);

interface ExamEntry {
  exam: string;
  status: string;
  score: string;
  expectedScore: string;
  currentScore: string;
}

interface ProjectEntry {
  title: string;
  role: string;
  description: string;
}

/** Which completion sections each card on this page corresponds to. */
const SECTION_KEYS = {
  personal: 'personalInformation',
  study: 'studyPreferences',
  academic: 'academicInformation'
} as const;

export function ReviewProfile() {
  const profile = useStudentProfile();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { personal, studyPreferences, academic, entranceExams, projects } = profile.profile;
  const { completionPercent, sections, missing } = profile.completion;

  const done = (key: string) => sections.find(section => section.key === key)?.done ?? false;

  const list = (value?: string[]) => (value || []).join(', ');
  const englishExams = (entranceExams['englishExams'] as ExamEntry[]) || [];
  const competitiveExams = (entranceExams['competitiveExams'] as ExamEntry[]) || [];
  const projectList = (projects['projects'] as ProjectEntry[]) || [];
  const achievements = (projects['achievements'] as string[]) || [];

  const examScoreSummary = (entry: ExamEntry): string => {
    if (entry.status === 'I have the score') return `Score: ${entry.score}`;
    if (entry.status === 'Retake') return `Current ${entry.currentScore} → Target ${entry.expectedScore}`;
    if (entry.expectedScore) return `Expected: ${entry.expectedScore}`;
    return entry.status;
  };

  const submitProfile = async () => {
    setSubmitError('');
    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.submitStudentProfile(token);
      await profile.refresh();
      router.push('/student/dashboard');
    } catch (e) {
      if ((e as ApiError).status === 401) {
        clearAccessToken();
        router.push('/auth/login/student?sessionExpired=1');
        return;
      }
      setSubmitError(e instanceof Error ? e.message : 'Could not submit your profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusPill = (complete: boolean) => (
    <span className={cx('section-status', complete ? 'ok' : 'warn')}>
      {complete ? '✓ Complete' : '⚠ Incomplete'}
    </span>
  );

  const summaryItem = (label: string, value?: string) => (
    <div className={cx('summary-item')} key={label}>
      <span>{label}</span>
      <strong className={cx(!value && 'empty')}>{value || 'Not added'}</strong>
    </div>
  );

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <div className={cx('completion-banner')}>
          <div className={cx('completion-ring')} style={{ '--pct': completionPercent } as CSSProperties}>
            <b>{completionPercent}%</b>
          </div>
          <div className={cx('completion-copy')}>
            <span>Profile Completion</span>
            <strong>{completionPercent}% Complete</strong>
            <p>
              {completionPercent === 100
                ? "Every required section is filled in — you're ready to submit."
                : 'Finish the sections below to unlock submission.'}
            </p>
            {!!missing.length && (
              <div className={cx('completion-missing')}>
                {missing.map(name => <span key={name}>{name}</span>)}
              </div>
            )}
          </div>
        </div>

        <div className={cx('section-grid')}>
          <div className={cx('section-card', !done(SECTION_KEYS.personal) && 'incomplete')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>PI</span>
              <div className={cx('section-title-block')}>
                <h2>Personal Information</h2>
                {statusPill(done(SECTION_KEYS.personal))}
              </div>
              <Link className={cx('edit-btn')} href="/student/personal-information?from=review">Edit</Link>
            </div>
            <div className={cx('summary-list')}>
              {summaryItem('Full Name', personal['fullName'])}
              {summaryItem('Email', personal['email'])}
              {summaryItem('Mobile', personal['mobileNumber'])}
              {summaryItem('Country', personal['country'])}
              {summaryItem('City', personal['city'])}
            </div>
          </div>

          <div className={cx('section-card', !done(SECTION_KEYS.study) && 'incomplete')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>SP</span>
              <div className={cx('section-title-block')}>
                <h2>Study Preferences</h2>
                {statusPill(done(SECTION_KEYS.study))}
              </div>
              <Link className={cx('edit-btn')} href="/student/study-preferences?from=review">Edit</Link>
            </div>
            <div className={cx('summary-list')}>
              {summaryItem('Countries', list(studyPreferences['countries']))}
              {summaryItem('Field of Study', list(studyPreferences['fieldOfInterest']))}
              {summaryItem('Program', list(studyPreferences['studyLevel']))}
              {summaryItem('Start Year', list(studyPreferences['startYear']))}
              {summaryItem('Preferred Intake', list(studyPreferences['intake']))}
            </div>
          </div>

          <div className={cx('section-card', !done(SECTION_KEYS.academic) && 'incomplete')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>AC</span>
              <div className={cx('section-title-block')}>
                <h2>Academic Information</h2>
                {statusPill(done(SECTION_KEYS.academic))}
              </div>
              <Link className={cx('edit-btn')} href="/student/academic-information?from=review">Edit</Link>
            </div>
            <div className={cx('summary-list')}>
              {summaryItem('Highest Qualification', academic['qualificationLevel'] as string)}
              {summaryItem('Institution', academic['institution'] as string)}
              {summaryItem('CGPA / Percentage', academic['score'] as string)}
              {summaryItem('Completion Year', academic['graduationYear'] as string)}
            </div>
          </div>

          <div className={cx('section-card')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>EN</span>
              <div className={cx('section-title-block')}>
                <h2>English Language Tests</h2>
                {!!englishExams.length && <span className={cx('section-status', 'ok')}>✓ {englishExams.length} added</span>}
              </div>
              <Link className={cx('edit-btn')} href="/student/english-exam?from=review">Edit</Link>
            </div>
            {!!englishExams.length && (
              <div className={cx('entry-list')}>
                {englishExams.map(entry => (
                  <div key={entry.exam} className={cx('entry-row')}>
                    <div><strong>{entry.exam}</strong><small>{entry.status}</small></div>
                    <span className={cx('entry-badge')}>{examScoreSummary(entry)}</span>
                  </div>
                ))}
              </div>
            )}
            {!englishExams.length && (
              <div className={cx('empty-state')}>
                <span className={cx('empty-icon')}>📝</span>
                <p>No English test recorded yet.</p>
                <Link className={cx('empty-cta')} href="/student/english-exam?from=review">+ Add now</Link>
              </div>
            )}
          </div>

          <div className={cx('section-card')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>CE</span>
              <div className={cx('section-title-block')}>
                <h2>Standardized Tests</h2>
                {!!competitiveExams.length && <span className={cx('section-status', 'ok')}>✓ {competitiveExams.length} added</span>}
              </div>
              <Link className={cx('edit-btn')} href="/student/competitive-exam?from=review">Edit</Link>
            </div>
            {!!competitiveExams.length && (
              <div className={cx('entry-list')}>
                {competitiveExams.map(entry => (
                  <div key={entry.exam} className={cx('entry-row')}>
                    <div><strong>{entry.exam}</strong><small>{entry.status}</small></div>
                    <span className={cx('entry-badge')}>{examScoreSummary(entry)}</span>
                  </div>
                ))}
              </div>
            )}
            {!competitiveExams.length && (
              <div className={cx('empty-state')}>
                <span className={cx('empty-icon')}>🧮</span>
                <p>No standardized test recorded yet.</p>
                <Link className={cx('empty-cta')} href="/student/competitive-exam?from=review">+ Add now</Link>
              </div>
            )}
          </div>

          <div className={cx('section-card')}>
            <div className={cx('section-head')}>
              <span className={cx('section-icon')}>PA</span>
              <div className={cx('section-title-block')}>
                <h2>Projects &amp; Achievements</h2>
              </div>
              <Link className={cx('edit-btn')} href="/student/projects?from=review">Edit</Link>
            </div>
            {!!projectList.length && (
              <div className={cx('entry-list')}>
                {projectList.map((project, index) => (
                  <div key={`${project.title}-${index}`} className={cx('entry-row')}>
                    <div><strong>{project.title}</strong><small>{project.role}</small></div>
                  </div>
                ))}
              </div>
            )}
            {!!achievements.length && (
              <div className={cx('chip-row')}>
                {achievements.map(item => <span key={item} className={cx('chip')}>{item}</span>)}
              </div>
            )}
            {!projectList.length && !achievements.length && (
              <div className={cx('empty-state')}>
                <span className={cx('empty-icon')}>🏆</span>
                <p>No projects or achievements added yet.</p>
                <Link className={cx('empty-cta')} href="/student/projects?from=review">+ Add now</Link>
              </div>
            )}
          </div>
        </div>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/projects">Back</Link>
          {submitError && <p className={cx('save-message', 'error')}>{submitError}</p>}
          <button
            className={cx('button', 'primary')}
            type="button"
            disabled={completionPercent < 100 || submitting}
            onClick={submitProfile}
          >
            {submitting ? 'Submitting…' : 'Submit Profile'}
          </button>
        </div>
      </section>
    </div>
  );
}
