'use client';

import { classNames } from '@/lib/cx';
import { SETTINGS_TABS, type useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';
import { PasswordInput } from '@/components/shared/PasswordInput';
import { MediaUploadField } from './MediaUploadField';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

export function OrganizationSettings({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, settingsTab, setSettingsTab, orgName, setOrgName, orgDomain, setOrgDomain, orgCity, setOrgCity,
    orgDescription, setOrgDescription, saveOrgProfile, currentPlan, planQuotaLabel, profilesViewed, quotaPercent, remainingCredits,
    planOptions, advancedFeatures, billing, fmtDate, profile, uploadOrganizationImage,
    teamMembers, openInviteModal, resendInvite, removeOfficer,
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
            {/*
              * Asked once, here, and never again. Every offer this organisation
              * sends resolves the link from this field as it stands on the day a
              * student opens it, so changing it here reaches offers already sent
              * without anything being resent.
              *
              * Validated against the same pattern the verification page uses, which
              * accepts a bare domain as well as a full URL — existing records were
              * entered as `www.example.edu`, and `type="url"` would reject them and
              * block the form on data the organisation never got to fix.
              */}
            <label>
              Official Website
              <input
                name="orgWebsite"
                inputMode="url"
                value={orgDomain}
                placeholder="https://www.university.edu"
                pattern="(https?:\/\/)?([\w-]+\.)+[A-Za-z]{2,}(\/\S*)?"
                title="Enter a valid website, for example https://www.university.edu"
                onChange={event => setOrgDomain(event.target.value)}
              />
              <small className={cx('field-note')}>Students see this on every offer you send.</small>
            </label>
            <label>
              Organisation type
              <select>{cfg.orgTypeOptions.map((type: string) => <option key={type}>{type}</option>)}</select>
            </label>
            <label>Head office / campus<input value={orgCity} onChange={event => setOrgCity(event.target.value)} /></label>
            <label className={cx('wide')}>
              Organisation description
              <textarea value={orgDescription} onChange={event => setOrgDescription(event.target.value)} />
            </label>

            {/*
              * The logo and cover a student sees on every offer.
              *
              * Uploaded here because they are the organisation's to maintain —
              * once an admin has approved them, what they look like is not
              * something SuperOffer should be researching on their behalf.
              * Uploads save immediately; there is nothing to lose by not pressing
              * Save afterwards.
              */}
            <MediaUploadField
              label="Logo"
              hint="Shown beside your name on every offer a student receives."
              url={profile?.logoUrl}
              alt="Organisation logo"
              shape="logo"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onSelect={file => uploadOrganizationImage('logo', file)}
            />

            <MediaUploadField
              label="Cover image"
              hint={role === 'BANK' ? 'A branch or office photo, used where the offer has room for one.' : 'A campus photo, used where the offer has room for one.'}
              url={profile?.coverUrl}
              alt="Campus cover"
              shape="cover"
              accept="image/png,image/jpeg,image/webp"
              onSelect={file => uploadOrganizationImage('cover', file)}
            />
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
                {/* No button: plans are agreed with the SuperOffer team and paid offline. */}
                <span className={cx('plan-marker', plan.name === currentPlan && 'plan-marker-current')}>
                  {plan.name === currentPlan ? 'Your current plan' : 'Available'}
                </span>
              </article>
            ))}
          </div>
          {billing && (
            <>
              <div className={cx('billing-summary')}>
                <div>
                  <span>BILLING PERIOD</span>
                  <strong>
                    {billing.subscription.periodStart
                      ? `${fmtDate(billing.subscription.periodStart)} — ${fmtDate(billing.subscription.periodEnd)}`
                      : 'No active subscription'}
                  </strong>
                  {billing.subscription.invoiceNumber && <small>Invoice {billing.subscription.invoiceNumber}</small>}
                </div>
                <div>
                  <span>PAYMENT</span>
                  <strong className={cx('pay-' + billing.subscription.paymentStatus.toLowerCase())}>
                    {billing.subscription.paymentStatus === 'NONE' ? 'Not billed' : billing.subscription.paymentStatus}
                  </strong>
                </div>
              </div>

              {/* Unpaid never blocks anything on its own — it asks, and a person decides. */}
              {billing.subscription.suspended ? (
                <p className={cx('billing-alert', 'billing-alert-stop')}>
                  Your account is suspended. {billing.subscription.suspensionReason || ''} Please contact the SuperOffer team.
                </p>
              ) : billing.subscription.overdue ? (
                <p className={cx('billing-alert', 'billing-alert-stop')}>
                  Payment is overdue for invoice {billing.subscription.invoiceNumber}. Your access continues for now —
                  please settle it to avoid interruption.
                </p>
              ) : billing.subscription.unpaid ? (
                <p className={cx('billing-alert')}>
                  Payment pending for invoice {billing.subscription.invoiceNumber}. Once our team records your transfer,
                  it will show as paid here.
                </p>
              ) : null}

              <h3 className={cx('billing-heading')}>Billing history</h3>
              {billing.invoices.length === 0 ? (
                <p className={cx('subscription-note')}>No invoices yet.</p>
              ) : (
                <div className={cx('invoice-table-wrap')}>
                  <table className={cx('invoice-table')}>
                    <thead>
                      <tr>
                        <th>Invoice</th><th>Plan</th><th>Period</th><th>Amount</th>
                        <th>Status</th><th>Paid on</th><th>Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.invoices.map(inv => (
                        <tr key={inv.invoiceNumber}>
                          <td>{inv.invoiceNumber}</td>
                          <td>{inv.plan}</td>
                          <td>{fmtDate(inv.periodStart)} — {fmtDate(inv.periodEnd)}</td>
                          <td className={cx('invoice-amount')}>{inv.currency} {inv.amount}</td>
                          <td><span className={cx('pay-' + inv.status.toLowerCase())}>{inv.status}</span></td>
                          <td>{inv.paidAt ? fmtDate(inv.paidAt) : '—'}</td>
                          <td>{inv.paymentRef || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          <p className={cx('subscription-note')}>
            Plans are arranged with the SuperOffer team and paid offline. This page shows what you are on and what has
            been received — to change plan, talk to us.
          </p>
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
                <PasswordInput placeholder="••••••••" autoComplete="current-password" value={passwordForm.current}
                  onChange={event => setPasswordForm({ ...passwordForm, current: event.target.value })} />
              </label>
              <label></label>
              <label>
                New password
                <PasswordInput placeholder="••••••••" autoComplete="new-password" value={passwordForm.next}
                  onChange={event => setPasswordForm({ ...passwordForm, next: event.target.value })} />
              </label>
              <label>
                Confirm new password
                <PasswordInput placeholder="••••••••" autoComplete="new-password" value={passwordForm.confirm}
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
