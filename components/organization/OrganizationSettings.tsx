'use client';

import { classNames } from '@/lib/cx';
import { SETTINGS_TABS, type useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

export function OrganizationSettings({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, settingsTab, setSettingsTab, orgName, setOrgName, orgDomain, setOrgDomain, orgCity, setOrgCity,
    orgDescription, setOrgDescription, saveOrgProfile, currentPlan, planQuotaLabel, profilesViewed, quotaPercent, remainingCredits,
    planOptions, advancedFeatures, choosePlan, teamMembers, openInviteModal, resendInvite, removeOfficer,
    notificationPrefs, persistNotificationPrefs, passwordForm, setPasswordForm, changePassword, logout, notify
  } = workspace;

  return (
    <section className={cx('uni-view')}>
      <header className={cx('uni-page-title')}>
        <div>
          <span>ORGANISATION</span>
          <h1>{cfg.profileTabLabel} &amp; Settings</h1>
          <p>Manage your organisation profile, subscription plans, team and account preferences.</p>
        </div>
        <span className={cx('org-verified')}>✓ Verified organisation</span>
      </header>

      <div className={cx('settings-rail')}>
        {SETTINGS_TABS.map(tab => (
          <button key={tab.id} type="button" className={cx(settingsTab === tab.id && 'active')} onClick={() => setSettingsTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {settingsTab === 'org' && (
        <section className={cx('uni-card', 'uni-org-settings')}>
          <header><h2>{cfg.profileTabLabel}</h2><p>Manage your organisation profile details.</p></header>
          <div className={cx('settings-form')}>
            <label>{cfg.orgFieldLabel}<input value={orgName} onChange={event => setOrgName(event.target.value)} /></label>
            <label>Official domain<input value={orgDomain} onChange={event => setOrgDomain(event.target.value)} /></label>
            <label>
              Organisation type
              <select>{cfg.orgTypeOptions.map((type: string) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Head office / campus<input value={orgCity} onChange={event => setOrgCity(event.target.value)} /></label>
            <label className={cx('wide')}>
              Organisation description
              <textarea value={orgDescription} onChange={event => setOrgDescription(event.target.value)} />
            </label>
          </div>
          <footer><button className={cx('uni-primary')} onClick={() => void saveOrgProfile()}>Save changes</button></footer>
        </section>
      )}

      {settingsTab === 'subscription' && (
        <section className={cx('uni-card', 'uni-org-settings')}>
          <header><h2>Subscription &amp; Plans</h2><p>{cfg.subscriptionIntro}</p></header>
          <div className={cx('current-usage')}>
            <div>
              <span>CURRENT PLAN</span>
              <strong>{currentPlan}</strong>
              <small>{profilesViewed} of {planQuotaLabel} student profiles viewed</small>
            </div>
            <div>
              <b>{quotaPercent}%</b>
              <i><span style={{ width: `${quotaPercent}%` }}></span></i>
              <small>{remainingCredits} profile views available</small>
            </div>
          </div>
          <div className={cx('plan-options')}>
            {planOptions.map(plan => (
              <article key={plan.name} className={cx(plan.recommended && 'recommended')}>
                {plan.recommended && <span>RECOMMENDED</span>}
                <h3>{plan.name}</h3>
                <strong>{plan.profiles}</strong>
                <small>student profile views / cycle</small>
                <ul className={cx('plan-feature-list')}>
                  {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
                  {advancedFeatures.map(feature => (
                    <li key={feature} className={cx(plan.unlocks.includes(feature) ? 'plan-feature-unlocked' : 'plan-feature-locked')}>
                      {plan.unlocks.includes(feature) ? '✓' : '🔒'} {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={cx(plan.name !== currentPlan ? 'uni-primary' : 'uni-secondary')}
                  disabled={plan.name === currentPlan}
                  onClick={() => choosePlan(plan.name)}
                >
                  {plan.name === currentPlan ? 'Current plan' : `Choose ${plan.name}`}
                </button>
              </article>
            ))}
          </div>
          <p className={cx('subscription-note')}>Your plan and quota are stored on your organisation record. Billing is not connected yet.</p>
        </section>
      )}

      {settingsTab === 'accreditation' && (
        <section className={cx('uni-card', 'uni-org-settings')}>
          <header>
            <h2>Accreditation</h2>
            <p>{role === 'BANK' ? 'License and registration documents on file.' : 'Accreditation documents on file.'}</p>
          </header>
          <div className={cx('accreditation-row')}>
            <span>✓</span>
            <div>
              <strong>{role === 'BANK' ? 'NBFC registration certificate' : 'University accreditation certificate'}</strong>
              <p>Verified · on file with SuperOffer</p>
            </div>
            <button type="button" onClick={() => notify('Re-upload flow is not connected in this preview')}>Re-upload</button>
          </div>
        </section>
      )}

      {settingsTab === 'team' && (
        <section className={cx('uni-card', 'uni-org-settings')}>
          <header>
            <div><h2>Team</h2><p>Officers under {orgName}.</p></div>
            <button type="button" onClick={openInviteModal}>+ Invite officer</button>
          </header>
          {teamMembers.map(member => (
            <div key={member.email} className={cx('team-row')}>
              <span>{member.initials}</span>
              <p>
                <strong>{member.name}{member.isSelf ? ' (you)' : ''}</strong>
                <small>{member.email} · {member.role}</small>
              </p>
              <b className={cx(member.status === 'Invited' && 'status-invited')}>{member.status}</b>
              <div className={cx('team-row-actions')}>
                {member.status === 'Invited' && <button type="button" onClick={() => resendInvite(member)}>Resend</button>}
                {!member.isSelf && <button type="button" onClick={() => removeOfficer(member)}>Remove</button>}
              </div>
            </div>
          ))}
        </section>
      )}

      {settingsTab === 'notifications' && (
        <section className={cx('uni-card', 'uni-org-settings')}>
          <header><h2>Notification preferences</h2><p>Choose how you&apos;re notified about invitation and account activity.</p></header>
          {notificationPrefs.map((pref, index) => (
            <div key={pref.key} className={cx('notification-setting')}>
              <p><strong>{pref.label}</strong><small>{pref.detail}</small></p>
              <select
                value={pref.frequency}
                onChange={event =>
                  persistNotificationPrefs(notificationPrefs.map((item, i) => (i === index ? { ...item, frequency: event.target.value } : item)))
                }
              >
                <option>Instant</option>
                <option>Daily digest</option>
                <option>Off</option>
              </select>
            </div>
          ))}
        </section>
      )}

      {settingsTab === 'security' && (
        <>
          <section className={cx('uni-card', 'uni-org-settings')}>
            <header><h2>Change Password</h2><p>Update the password used to sign in to your workspace.</p></header>
            <div className={cx('settings-form')}>
              <label>
                Current password
                <input type="password" placeholder="••••••••" value={passwordForm.current}
                  onChange={event => setPasswordForm({ ...passwordForm, current: event.target.value })} />
              </label>
              <label></label>
              <label>
                New password
                <input type="password" placeholder="••••••••" value={passwordForm.next}
                  onChange={event => setPasswordForm({ ...passwordForm, next: event.target.value })} />
              </label>
              <label>
                Confirm new password
                <input type="password" placeholder="••••••••" value={passwordForm.confirm}
                  onChange={event => setPasswordForm({ ...passwordForm, confirm: event.target.value })} />
              </label>
            </div>
            <footer><button className={cx('uni-primary')} onClick={changePassword}>Update password</button></footer>
          </section>

          <section className={cx('uni-card', 'security-action', 'logout-card')}>
            <span>⎋</span>
            <p><strong>Log out of SuperOffer</strong><small>End your current session on this device.</small></p>
            <button type="button" onClick={() => void logout()}>Log out</button>
          </section>
        </>
      )}
    </section>
  );
}
