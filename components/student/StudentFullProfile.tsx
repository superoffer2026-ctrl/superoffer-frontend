'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { studentProfileStore, useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudentFullProfile.module.css';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';

const cx = classNames(styles);

export function StudentFullProfile() {
  const profile = useStudentProfile();
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  /** The checklist comes from `/reference/documents`; each row is a `documentType`. */
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);

  useEffect(() => {
    void authApi
      .getDocumentReferenceData()
      .then(reference => setDocumentTypes(reference.profileDocumentTypes))
      .catch(() => setDocumentTypes([]));
  }, []);

  const { personal, studyPreferences, academic, projects, documents } = profile.profile;

  const list = (value?: string[]) => (value || []).join(', ');

  const sections = [
    {
      eyebrow: 'PERSONAL', title: 'Personal information', route: '/student/personal-information',
      items: [
        { label: 'Email', value: personal['email'] },
        { label: 'Phone', value: personal['phone'] || personal['mobileNumber'] },
        { label: 'Location', value: personal['location'] }
      ]
    },
    {
      eyebrow: 'ACADEMIC', title: 'Academic information', route: '/student/academic-information',
      items: [
        { label: 'Institution', value: academic['institution'] as string },
        { label: 'Qualification', value: academic['qualification'] as string },
        { label: 'Academic score', value: academic['score'] as string }
      ]
    },
    {
      eyebrow: 'PREFERENCES', title: 'Study preferences', route: '/student/study-preferences',
      items: [
        { label: 'Field', value: list(studyPreferences['fieldOfInterest']) },
        { label: 'Countries', value: list(studyPreferences['countries']) },
        { label: 'Intake', value: list(studyPreferences['intake']) }
      ]
    },
    {
      eyebrow: 'PROFILE', title: 'Skills and achievements', route: '/student/projects',
      items: [
        { label: 'Achievements', value: ((projects['achievements'] as string[]) || []).join(', ') },
        { label: 'Links', value: ((projects['links'] as string[]) || []).join(', ') },
        { label: 'Featured project', value: projects['projectTitle'] as string }
      ]
    }
  ];

  const documentFor = (type: string) => documents.find(document => document.documentType === type);

  /** Uploads replace any existing file of the same type, so the checklist stays one-per-row. */
  const upload = async (documentType: string, file?: File) => {
    if (!file) return;
    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    setBusy(documentType);
    setError('');
    try {
      const existing = documentFor(documentType);
      if (existing) await authApi.replaceStudentDocument(token, existing.id, file);
      else await authApi.uploadStudentDocument(token, documentType, file);
      await profile.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That file could not be uploaded.');
    } finally {
      setBusy('');
    }
  };

  const remove = async (documentType: string) => {
    const existing = documentFor(documentType);
    const token = readAccessToken();
    if (!existing || !token) return;

    setBusy(documentType);
    setError('');
    try {
      await authApi.deleteStudentDocument(token, existing.id);
      await profile.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That file could not be removed.');
    } finally {
      setBusy('');
    }
  };

  /** Ends the session on the server too, so the token cannot be reused. */
  const logout = async () => {
    const token = readAccessToken();
    if (token) await authApi.logout(token).catch(() => {});
    clearAccessToken();
    studentProfileStore.reset();
    offerWalletStore.reset();
    router.push('/');
  };

  return (
    <StudentWorkspaceShell backdrop="scene" sky={['#ffe9d6', '#ffe3ec', '#e6e3ff']}>
      <main className={cx('full-profile-page')}>
        <header className={cx('profile-top')}>
          <Link href="/student/offers">← Back to offers</Link>
          <button type="button" onClick={() => void logout()}>Logout</button>
        </header>

        <section className={cx('profile-hero')}>
          <div className={cx('large-avatar')}><span>{profile.initials}</span></div>
          <div>
            <small>STUDENT PROFILE</small>
            <h1>{profile.fullName}</h1>
            <p>
              {(academic['qualification'] as string) || 'Qualification'} · {personal['location'] || 'Location'}
            </p>
          </div>
          <span className={cx('completion-badge')}>{profile.completion.completionPercent}% complete</span>
        </section>

        <div className={cx('profile-layout')}>
          <section className={cx('profile-sections')}>
            {sections.map(section => (
              <article key={section.title}>
                <div><small>{section.eyebrow}</small><h2>{section.title}</h2></div>
                <dl>
                  {section.items.map(item => (
                    <div key={item.label} style={{ display: 'contents' }}>
                      <dt>{item.label}</dt>
                      <dd>{item.value || 'Not added'}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={section.route}>Edit section</Link>
              </article>
            ))}
          </section>

          <aside className={cx('documents-panel')}>
            <span>DOCUMENT CHECKLIST</span>
            <h2>Complete your documents</h2>
            <p>Files are uploaded to your profile and visible only to you and SuperOffer.</p>
            {error && <p className={cx('field-error')}>{error}</p>}
            {documentTypes.map(documentType => {
              const uploaded = documentFor(documentType);
              return (
                <label key={documentType} className={cx(uploaded && 'complete')}>
                  <div>
                    <strong>{documentType}</strong>
                    <small>{busy === documentType ? 'Uploading…' : uploaded?.fileName || 'Not uploaded'}</small>
                  </div>
                  {uploaded ? (
                    <b
                      onClick={event => {
                        event.preventDefault();
                        void remove(documentType);
                      }}
                      title="Remove this file"
                    >
                      ✓
                    </b>
                  ) : (
                    <b>＋</b>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={event => void upload(documentType, event.target.files?.[0])}
                  />
                </label>
              );
            })}
            <Link href="/student/review">Open review step</Link>
          </aside>
        </div>
      </main>
    </StudentWorkspaceShell>
  );
}
