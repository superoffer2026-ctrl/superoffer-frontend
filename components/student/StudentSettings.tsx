'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { isPasswordValid, passwordProblems } from '@/lib/auth/password-rules';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { studentProfileStore, useStudentProfile } from '@/lib/stores/student-profile.store';
import pageStyles from '@/styles/StudentWorkspacePages.module.css';
import settingsStyles from '@/styles/StudentSettings.module.css';
import { StudentSupportChat, OPEN_SUPPORT_CHAT_EVENT } from './StudentSupportChat';
import { StudentWorkspaceRail } from './StudentWorkspaceRail';

/** The component draws on both its own stylesheet and the shared workspace one. */
const cx = classNames({ ...pageStyles, ...settingsStyles });

const SECTIONS = [
  { id: 'account', label: 'Account', description: 'WhatsApp number and password', icon: '○' },
  { id: 'preferences', label: 'Notifications & Privacy', description: 'Offers, messages and visibility', icon: '◉' },
  { id: 'help', label: 'Help & support', description: 'FAQs and contact', icon: '?' }
];

const FAQS = [
  { question: 'How do I update my student profile?', answer: 'Open your profile from the navigation rail and choose the section you want to update.' },
  { question: 'Where can I upload missing documents?', answer: 'Open Documents from your dashboard action list or student profile.' },
  { question: 'Who can see my profile?', answer: 'Only authorised universities and funding providers permitted by your discovery settings.' }
];

export function StudentSettings() {
  const profile = useStudentProfile();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('account');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [discoveryFlash, setDiscoveryFlash] = useState('');
  const [saving, setSaving] = useState(false);

  const settings = profile.profile.settings as Record<string, unknown>;
  /** The account identifier, not the contact address on the profile — a student has no account email. */
  const whatsappNumber = profile.user?.phone || '';
  const fullName = profile.user?.full_name || profile.profile.personal['fullName'] || '';

  /** Notification toggles default to on until the student turns one off. */
  const flag = (key: string, defaultValue = true) => {
    const raw = settings[key];
    return raw === undefined ? defaultValue : Boolean(raw);
  };

  const passwordChangedLabel = (() => {
    const changedAt = profile.user?.password_changed_at;
    return changedAt ? `Last changed ${new Date(changedAt).toLocaleDateString()}` : 'Never changed';
  })();

  const flash = (message: string) => {
    setFlashMessage(message);
    setTimeout(() => setFlashMessage(''), 3000);
  };

  /** Every toggle is a write to `/students/me/settings`; the server stays the source of truth. */
  const writeSettings = async (payload: Record<string, unknown>) => {
    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }
    await authApi.saveStudentSettings(token, payload);
    await profile.refresh();
  };

  const setPreference = (key: string, value: boolean) => void writeSettings({ [key]: value });

  const setDiscoverable = async (value: boolean) => {
    await writeSettings({ discoverable: value });
    setDiscoveryFlash(
      value
        ? 'Your profile is visible to universities and lenders again.'
        : 'Your profile is hidden from university and lender discovery.'
    );
    setTimeout(() => setDiscoveryFlash(''), 3500);
  };

  const saveName = async () => {
    const value = nameDraft.trim();
    if (value.length < 2) {
      setNameError('Enter your full name');
      return;
    }
    const token = readAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      await authApi.updateAccount(token, { fullName: value });
      await profile.refresh();
      setEditingName(false);
      flash('Full name updated.');
    } catch (e) {
      setNameError(e instanceof Error ? e.message : 'That name could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const cancelPassword = () => {
    setEditingPassword(false);
    setPasswordForm({ current: '', next: '', confirm: '' });
    setPasswordError('');
  };

  /** The server revokes every other session on success, so this one keeps its token and the rest are cut. */
  const savePassword = async () => {
    const { current, next, confirm } = passwordForm;
    if (!current.trim()) { setPasswordError('Enter your current password'); return; }
    if (!isPasswordValid(next)) { setPasswordError(''); return; }
    if (next !== confirm) { setPasswordError('New password and confirmation do not match'); return; }

    const token = readAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      await authApi.changePassword(token, current, next);
      await profile.refresh();
      cancelPassword();
      flash('Password updated.');
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Your password could not be changed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    const token = readAccessToken();
    if (!token) return;

    setSaving(true);
    try {
      await authApi.deleteStudentAccount(token);
    } finally {
      setSaving(false);
      clearAccessToken();
      studentProfileStore.reset();
      offerWalletStore.reset();
      setConfirmingDelete(false);
      router.push('/');
    }
  };

  const openChat = () => window.dispatchEvent(new CustomEvent(OPEN_SUPPORT_CHAT_EVENT));

  return (
    <div className={cx('host')}>
      <StudentWorkspaceRail />
      <main className={cx('professional-settings')}>
        <header className={cx('settings-page-header')}>
          <div><span>SETTINGS</span><h1>Account settings</h1><p>Manage your account and preferences.</p></div>
        </header>

        <div className={cx('settings-shell')}>
          <nav className={cx('settings-menu')} aria-label="Settings sections">
            {SECTIONS.map(item => (
              <button
                key={item.id}
                type="button"
                className={cx(activeSection === item.id && 'active')}
                onClick={() => setActiveSection(item.id)}
              >
                <span>{item.icon}</span>
                <div><strong>{item.label}</strong><small>{item.description}</small></div>
                <b>›</b>
              </button>
            ))}
          </nav>

          {activeSection === 'account' && (
            <section className={cx('settings-panel')}>
              <header><h2>Account</h2><p>Your sign-in details and account access.</p></header>
              {flashMessage && <p className={cx('settings-flash')}>{flashMessage}</p>}

              {/* Read-only: the number is the account, so changing it means proving the new one with a code. */}
              <div className={cx('professional-setting-row')}>
                <div>
                  <strong>WhatsApp number</strong>
                  <small>{whatsappNumber || 'Not set'}</small>
                </div>
                <span className={cx('account-pill')}>Sign-in number</span>
              </div>

              {!editingPassword && (
                <div className={cx('professional-setting-row')}>
                  <div><strong>Password</strong><small>{passwordChangedLabel}</small></div>
                  <button type="button" onClick={() => setEditingPassword(true)}>Change password</button>
                </div>
              )}
              {editingPassword && (
                <form className={cx('password-form')} onSubmit={event => { event.preventDefault(); void savePassword(); }}>
                  <PasswordInput
                    name="currentPassword" placeholder="Current password" autoComplete="current-password"
                    value={passwordForm.current}
                    onChange={event => setPasswordForm(current => ({ ...current, current: event.target.value }))}
                  />
                  <PasswordInput
                    name="newPassword" placeholder="New password" autoComplete="new-password"
                    value={passwordForm.next}
                    onChange={event => setPasswordForm(current => ({ ...current, next: event.target.value }))}
                  />
                  {passwordProblems(passwordForm.next) && (
                    <p className={cx('field-error')}>{passwordProblems(passwordForm.next)}</p>
                  )}

                  <PasswordInput
                    name="confirmPassword" placeholder="Confirm new password" autoComplete="new-password"
                    value={passwordForm.confirm}
                    onChange={event => setPasswordForm(current => ({ ...current, confirm: event.target.value }))}
                  />
                  {passwordError && <p className={cx('field-error')}>{passwordError}</p>}
                  <div className={cx('password-actions')}>
                    <button type="submit" disabled={saving}>Update password</button>
                    <button type="button" onClick={cancelPassword}>Cancel</button>
                  </div>
                </form>
              )}

              {!editingName && (
                <div className={cx('professional-setting-row')}>
                  <div><strong>Full name</strong><small>{fullName || 'Not set'}</small></div>
                  <button type="button" onClick={() => { setNameDraft(fullName); setNameError(''); setEditingName(true); }}>
                    Edit profile
                  </button>
                </div>
              )}
              {editingName && (
                <div className={cx('professional-setting-row')}>
                  <div style={{ flex: 1 }}>
                    <strong>Full name</strong>
                    <div className={cx('inline-edit')} style={{ marginTop: 6 }}>
                      <input
                        type="text" value={nameDraft} placeholder="Your full name" autoComplete="name"
                        onChange={event => setNameDraft(event.target.value)}
                      />
                      <button type="button" disabled={saving} onClick={() => void saveName()}>Save</button>
                      <button type="button" onClick={() => setEditingName(false)}>Cancel</button>
                    </div>
                    {nameError && <p className={cx('field-error')}>{nameError}</p>}
                  </div>
                </div>
              )}

              {!confirmingDelete && (
                <div className={cx('settings-danger-row')}>
                  <div><strong>Delete account</strong><small>Permanently delete your account and student profile.</small></div>
                  <button type="button" onClick={() => setConfirmingDelete(true)}>Delete account</button>
                </div>
              )}
              {confirmingDelete && (
                <div className={cx('danger-confirm')}>
                  <p>
                    <strong>This can&apos;t be undone.</strong> Your profile, submitted applications, and offers will be
                    permanently deleted.
                  </p>
                  <div className={cx('password-actions')}>
                    <button type="button" disabled={saving} onClick={() => void deleteAccount()}>Yes, delete my account</button>
                    <button type="button" onClick={() => setConfirmingDelete(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeSection === 'preferences' && (
            <section className={cx('settings-panel')}>
              <header><h2>Notifications &amp; Privacy</h2><p>Choose what you hear about and who can find your profile.</p></header>
              <label className={cx('toggle-row')}>
                <div><strong>University offers</strong><small>Admission and scholarship opportunities</small></div>
                <input
                  className={cx('mini-toggle')} type="checkbox" checked={flag('notifyUniversity')}
                  onChange={event => setPreference('notifyUniversity', event.target.checked)}
                />
              </label>
              <label className={cx('toggle-row')}>
                <div><strong>Funding offers</strong><small>Education loan and finance opportunities</small></div>
                <input
                  className={cx('mini-toggle')} type="checkbox" checked={flag('notifyLoan')}
                  onChange={event => setPreference('notifyLoan', event.target.checked)}
                />
              </label>
              <label className={cx('toggle-row')}>
                <div><strong>Messages</strong><small>Replies from universities and finance advisers</small></div>
                <input
                  className={cx('mini-toggle')} type="checkbox" checked={flag('notifyMessages')}
                  onChange={event => setPreference('notifyMessages', event.target.checked)}
                />
              </label>
              <label className={cx('toggle-row')}>
                <div>
                  <strong>Profile discovery</strong>
                  <small>Allow verified universities and funding providers to discover your profile.</small>
                </div>
                <input
                  className={cx('mini-toggle')} type="checkbox" checked={profile.profile.discoverable}
                  onChange={event => void setDiscoverable(event.target.checked)}
                />
              </label>
              {discoveryFlash && <p className={cx('settings-flash')}>{discoveryFlash}</p>}
              <div className={cx('settings-note')}>
                <span>i</span>
                <p>
                  Your contact details are never displayed publicly. Only authorised partners can access information
                  permitted by your visibility settings.
                </p>
              </div>
            </section>
          )}

          {activeSection === 'help' && (
            <section className={cx('settings-panel')}>
              <header><h2>Help &amp; support</h2><p>Find answers or contact the SuperOffer team.</p></header>
              <a className={cx('support-setting-row')} href="mailto:support@superoffer.net">
                <span>✉</span><div><strong>Email support</strong><small>support@superoffer.net</small></div><b>›</b>
              </a>
              <button className={cx('support-setting-row')} type="button" onClick={openChat}>
                <span>◌</span><div><strong>Chat with us</strong><small>Start a conversation with support</small></div><b>›</b>
              </button>
              {FAQS.map(item => (
                <details key={item.question}>
                  <summary>{item.question}<b>＋</b></summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </section>
          )}
        </div>
      </main>
      <StudentSupportChat />
    </div>
  );
}
