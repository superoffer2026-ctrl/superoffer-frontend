'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { classNames } from '@/lib/cx';
import { NAVIGATION, useOrganizationWorkspace, type WorkspaceOptions } from '@/lib/organization/use-organization-workspace';
import type { OrganizationView } from '@/lib/organization/workspace-data';
import styles from '@/styles/OrganizationWorkspace.module.css';
import { CandidateFilters } from './CandidateFilters';
import { OrganizationDashboard } from './OrganizationDashboard';
import { OrganizationNotifications } from './OrganizationNotifications';
import { OrganizationProducts } from './OrganizationProducts';
import { OrganizationSettings } from './OrganizationSettings';
import { WorkspaceModals } from './WorkspaceModals';

const cx = classNames(styles);

/** What a screening verdict means, in an officer's words rather than an enum. */
const VERDICT_LABEL: Record<string, string> = {
  LIKELY: 'Likely to qualify',
  POSSIBLE: 'May qualify',
  UNLIKELY: 'Unlikely on this alone',
  UNKNOWN: 'Not enough to say'
};

const money = (value: number) => `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value || 0)}`;

const NAV_ICONS: Record<string, ReactElement> = {
  dashboard: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  students: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  templates: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  ),
  notifications: (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
};

const microLabel = { fontSize: 10, color: '#6b7871', fontWeight: 700, display: 'block', marginBottom: 3 } as const;
const microValue = { fontSize: 13, color: '#172019' } as const;

export function OrganizationWorkspace(options: WorkspaceOptions) {
  const workspace = useOrganizationWorkspace(options);
  const {
    role, cfg, view, workspaceFilter, setWorkspaceFilter, toast, go, navLabel,
    selectedOfferItem, setSelectedOfferId, filteredWorkspaceOffers, countWorkspaceOffers,
    setOfferStatus, sendCandidateInvite, chatDraft, setChatDraft, sendChatMessage,
    openProductInviteModal, notify, user, chatFile, setChatFile, openAttachment, selectThread
  } = workspace;

  const fileSize = (bytes: number) =>
    bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

  const userInitials = (user?.full_name || '')
    .split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || cfg.orgInitials;

  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [selectedOfferItem?.messages.length]);

  const isCandidateView = view === 'students' || view === 'shortlists' || view === 'invitations';
  const candidate = selectedOfferItem;

  return (
    <div className={cx('host')}>
      <div className={cx('uni-shell')}>
        <aside className={cx('uni-sidebar')}>
          <button className={cx('uni-brand', 'workspace-logo')} type="button" onClick={() => go('dashboard')} aria-label="SuperOffer">S</button>
          <nav>
            {NAVIGATION.map(item => (
              <button
                key={item.id}
                type="button"
                className={cx(view === item.id && 'active')}
                onClick={() => go(item.id as OrganizationView)}
                title={navLabel(item.id)}
                aria-label={navLabel(item.id)}
              >
                <span className={cx('nav-icon')}>{NAV_ICONS[item.id]}</span>
                <strong>{navLabel(item.id)}</strong>
              </button>
            ))}
          </nav>
          <button
            className={cx('uni-user', 'workspace-avatar')}
            type="button"
            onClick={() => go('profile')}
            title="Organisation profile"
            aria-label="Organisation profile"
          >
            <span>{userInitials}</span>
          </button>
        </aside>

        {/* Unified three-column workspace, matching the student offers layout. */}
        {isCandidateView && (
          <main className={cx('offer-workspace-page')}>
            <section className={cx('offer-workspace')}>
              <aside className={cx('offer-mailbox')}>
                <header className={cx('mailbox-toolbar')}>
                  <button className={cx('all-offers-reset')} type="button" onClick={() => setWorkspaceFilter('All')}>
                    <strong>{role === 'BANK' ? 'Student Loan Applicants' : 'Candidates & Offers'}</strong>
                    <small>{workspace.candidates.length} candidates to review</small>
                  </button>
                  <div className={cx('compact-offer-filters')}>
                    <button type="button" className={cx(workspaceFilter === 'All' && 'active')} onClick={() => setWorkspaceFilter('All')}>All <b>{workspace.candidates.length}</b></button>
                    <button type="button" className={cx(workspaceFilter === 'Accepted' && 'active')} onClick={() => setWorkspaceFilter('Accepted')}>Invited <b>{countWorkspaceOffers('Accepted')}</b></button>
                    <button type="button" className={cx(workspaceFilter === 'Shortlisted' && 'active')} onClick={() => setWorkspaceFilter('Shortlisted')}>Shortlisted <b>{countWorkspaceOffers('Shortlisted')}</b></button>
                    <button type="button" className={cx(workspaceFilter === 'Rejected' && 'active')} onClick={() => setWorkspaceFilter('Rejected')}>Rejected <b>{countWorkspaceOffers('Rejected')}</b></button>
                  </div>
                </header>

                <CandidateFilters workspace={workspace} />

                {!filteredWorkspaceOffers.length && (
                  <p className={cx('mailbox-empty')}>
                    {workspace.candidates.length
                      ? `No ${workspaceFilter.toLowerCase()} candidates.`
                      : 'No candidates match your search yet.'}
                  </p>
                )}

                {filteredWorkspaceOffers.map(item => (
                  <button
                    key={item.id}
                    className={cx('offer-mail-item', item.id === candidate?.id && 'selected')}
                    onClick={() => setSelectedOfferId(item.id)}
                  >
                    <span className={cx('logo', 'candidate-avatar-badge')} style={{ background: item.avatarColor }}>{item.initials}</span>
                    <span className={cx('mail-offer-main')}>
                      <div><small>{item.matchBadge}</small><time>{item.received}</time></div>
                      <strong>{item.name}</strong>
                      <p>{item.course} · {item.targetCountry}</p>
                      <b>{item.headline}</b>
                    </span>
                    {!!item.unread && <em className={cx('candidate-unread')}>{item.unread}</em>}
                    {item.status === 'Pending' && !item.unread && <i></i>}
                  </button>
                ))}
              </aside>

              {!candidate && (
                <section className={cx('offer-reading-pane', 'offer-reading-pane-empty')}>
                  <div className={cx('offer-empty-state')}>
                    <span>⌕</span>
                    <h2>{workspace.candidates.length ? 'Nothing matches this filter' : 'No candidates to review yet'}</h2>
                    <p>
                      {workspace.candidates.length
                        ? 'Clear the filter to see every candidate again.'
                        : 'Students appear here once they submit their profile and leave discovery switched on. Narrow the list with the search filters when there are more of them.'}
                    </p>
                  </div>
                </section>
              )}

              {candidate && (
                <section className={cx('offer-reading-pane')}>
                  <div className={cx('offer-details-column')}>
                    <header className={cx('reading-pane-header')}>
                      <div className={cx('reading-institution')}>
                        {candidate.avatarUrl ? (
                          <img src={candidate.avatarUrl} alt="Profile" className={cx('logo', 'candidate-avatar-badge')} style={{ objectFit: 'cover' }} />
                        ) : (
                          <span className={cx('logo', 'candidate-avatar-badge')} style={{ background: candidate.avatarColor }}>{candidate.initials}</span>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h2 style={{ margin: '0 0 4px 0', lineHeight: 1 }}>{candidate.name}</h2>
                          <p className={cx('reading-course')} style={{ fontSize: 14, margin: 0, color: '#3f4d46', lineHeight: 1 }}>{candidate.course}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
                        <button
                          type="button"
                          className={cx('secondary-btn', 'shortlist-action', candidate.status === 'Shortlisted' && 'chosen')}
                          title="Shortlist"
                          style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                          onClick={() => setOfferStatus(candidate, candidate.status === 'Shortlisted' ? 'Pending' : 'Shortlisted')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={cx('secondary-btn', 'reject-action', candidate.status === 'Rejected' && 'chosen')}
                          title="Reject"
                          style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: '#a13d3d' }}
                          onClick={() => setOfferStatus(candidate, 'Rejected')}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={cx('secondary-btn')}
                          style={{ padding: '6px 16px', height: 32, fontSize: 13, fontWeight: 700, color: '#087a50', borderColor: '#087a50' }}
                          onClick={openProductInviteModal}
                        >
                          Product Invite
                        </button>
                        <button
                          type="button"
                          className={cx('primary-btn')}
                          style={{ padding: '6px 16px', height: 32, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => sendCandidateInvite(candidate)}
                        >
                          {candidate.status !== 'Accepted' && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                          )}
                          <span>{candidate.status === 'Accepted' ? '✓ Invite Sent' : 'Invite'}</span>
                        </button>
                      </div>
                    </header>

                    <div className={cx('reading-pane-scroll')}>
                      <section className={cx('offer-detail-hero')}>
                        <small>{role === 'BANK' ? 'FINANCIAL ASSESSMENT & LOAN PROPOSAL' : 'ACADEMIC & SCHOLARSHIP EVALUATION'}</small>
                        <h1>{candidate.headline}</h1>
                        <div className={cx('offer-key-terms')}>
                          <div><small>{role === 'BANK' ? 'TARGET COURSE' : 'PRODUCT'}</small><strong>{candidate.course}</strong></div>
                          <div><small>{candidate.offerValueLabel.toUpperCase()}</small><strong>{candidate.offerValue}</strong></div>
                          <div><small>TARGET INTAKE</small><strong>{candidate.intake}</strong></div>
                          <div><small>DECISION BY</small><strong>{candidate.deadline}</strong></div>
                        </div>
                      </section>

                      <section className={cx('offer-conditions')} style={{ marginTop: 0, paddingBottom: 8 }}>
                        <h3 style={{ marginBottom: 12, color: '#172019' }}>Study Intent &amp; Preferences</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                          <div><small style={{ ...microLabel, textTransform: 'uppercase' }}>Which country to study in?</small><strong style={microValue}>{candidate.targetCountry}</strong></div>
                          <div><small style={{ ...microLabel, textTransform: 'uppercase' }}>What to study / Product</small><strong style={microValue}>{candidate.course}</strong></div>
                          <div><small style={{ ...microLabel, textTransform: 'uppercase' }}>When / Intake</small><strong style={microValue}>{candidate.intake}</strong></div>
                          <div><small style={{ ...microLabel, textTransform: 'uppercase' }}>Future Study Interests</small><strong style={microValue}>{candidate.futureInterests}</strong></div>
                        </div>
                      </section>

                      <section
                        className={cx('candidate-academic-grid')}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, padding: '12px 14px', background: '#f6f9f7', border: '1px solid #dfe6e1', borderRadius: 10, marginTop: 2 }}
                      >
                        <div><small style={microLabel}>CGPA / MARKS</small><strong style={{ fontSize: 14, color: '#172019' }}>{candidate.cgpa}</strong></div>
                        <div><small style={microLabel}>TEST SCORES</small><strong style={{ fontSize: 14, color: '#172019' }}>{candidate.examScore}</strong></div>
                        <div><small style={microLabel}>BUDGET</small><strong style={{ fontSize: 14, color: '#172019' }}>{candidate.budget}</strong></div>
                        <div><small style={microLabel}>VERIFIED DOCS</small><strong style={{ fontSize: 14, color: '#087a50' }}>{candidate.documentsVerified}/5 Verified</strong></div>
                      </section>

                      {/*
                        * Whether the household can carry a loan at all. Shown only to a
                        * lender, and only once the co-applicant has agreed to a check —
                        * the absence of this block is a real answer, not a gap.
                        */}
                      {candidate.loanReadiness && (
                        <section className={cx('readiness-panel', `verdict-${candidate.loanReadiness.verdict.toLowerCase()}`)}>
                          <header>
                            <div>
                              <h3>Can this household carry a loan?</h3>
                              <small>
                                {candidate.loanReadiness.coApplicantRelationship || 'Co-applicant'} ·{' '}
                                {candidate.loanReadiness.employmentType}
                              </small>
                            </div>
                            <div className={cx('readiness-verdict')}>
                              <small>SCREENING</small>
                              <strong>{VERDICT_LABEL[candidate.loanReadiness.verdict] || candidate.loanReadiness.verdict}</strong>
                            </div>
                          </header>

                          <div className={cx('readiness-figures')}>
                            <div>
                              <small>CO-APPLICANT INCOME</small>
                              <strong>{money(candidate.loanReadiness.monthlyIncome)}/mo</strong>
                            </div>
                            <div>
                              <small>ALREADY REPAYING</small>
                              <strong>{money(candidate.loanReadiness.existingEmi)}/mo</strong>
                            </div>
                            <div>
                              <small>CREDIT BAND</small>
                              <strong>
                                {candidate.loanReadiness.creditBand
                                  || (candidate.loanReadiness.creditOutcome === 'NO_HISTORY' ? 'No history' : 'Not checked')}
                              </strong>
                              {/* A band that has aged is worse than none, because it invites reliance. */}
                              {candidate.loanReadiness.stale && <em className={cx('stale')}>Needs a refresh</em>}
                            </div>
                            <div>
                              <small>SUPPORTS ABOUT</small>
                              <strong>{money(candidate.loanReadiness.indicativeAmount)}</strong>
                            </div>
                            <div>
                              <small>DOCUMENTS</small>
                              <strong>
                                {candidate.loanReadiness.documentsVerified}/{candidate.loanReadiness.documentsExpected} verified
                              </strong>
                            </div>
                          </div>

                          {!!candidate.loanReadiness.reasons.length && (
                            <ul className={cx('readiness-reasons')}>
                              {candidate.loanReadiness.reasons.map(reason => <li key={reason}>{reason}</li>)}
                            </ul>
                          )}

                          <small className={cx('readiness-note')}>
                            A screening estimate from a soft check the family agreed to. Run your own formal check before
                            you decide.
                          </small>
                        </section>
                      )}

                      {/*
                        * The strongest signal on this page: what the other side of the
                        * deal has already committed to. A lender reads it as collateral,
                        * a university as proof the seat will be funded.
                        */}
                      {!!candidate.counterparty?.count && (
                        <section className={cx('counterparty-panel')}>
                          <header>
                            <div>
                              <h3>{candidate.counterparty.heading}</h3>
                              <small>{candidate.counterparty.blurb}</small>
                            </div>
                            {!!candidate.counterparty.maxAmountLabel && (
                              <div className={cx('counterparty-max')}>
                                <small>{candidate.counterparty.maxAmountCaption}</small>
                                <strong>{candidate.counterparty.maxAmountLabel}</strong>
                                <em>{candidate.counterparty.maxAmountFrom}</em>
                              </div>
                            )}
                          </header>
                          <ul className={cx('counterparty-list')}>
                            {/* One organisation may send several offers for the same
                                programme, so the position is part of the identity. */}
                            {candidate.counterparty.offers.map((entry, index) => (
                              <li key={`${entry.organization}-${entry.program}-${index}`}>
                                <div>
                                  <strong>{entry.organization}</strong>
                                  <small>{[entry.program, entry.country].filter(Boolean).join(' · ')}</small>
                                </div>
                                <div className={cx('counterparty-terms')}>
                                  <b>{entry.value}</b>
                                  {/* Accepted outranks 'offer sent' — say which it is. */}
                                  <span className={cx(entry.accepted && 'accepted')}>
                                    {entry.accepted ? 'Accepted' : entry.status}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}

                      <section className={cx('offer-conditions')}>
                        <div>
                          <h3 style={{ marginBottom: 8 }}>Experience &amp; Recognition</h3>
                          <p>{candidate.bio}</p>
                          <h3 style={{ marginTop: 16, marginBottom: 8 }}>Skills &amp; Communication</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {candidate.skills.map(skill => (
                              <span key={skill} style={{ background: '#eef5f1', color: '#087a50', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999, border: '1px solid #d5e5dc' }}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button type="button" onClick={() => notify('Opening verified student documents')}>View verified dossier →</button>
                      </section>

                      <section className={cx('offer-conditions')} style={{ marginTop: 0 }}>
                        <div>
                          <h3>Terms &amp; Requirements</h3>
                          <p>{candidate.conditions}</p>
                        </div>
                        <button type="button" onClick={() => notify('Viewing full terms')}>Edit offer terms →</button>
                      </section>

                      <section className={cx('offer-next-steps')}>
                        <div><small>ACTION CHECKLIST</small><strong>To progress this candidate</strong></div>
                        <ul>{candidate.nextSteps.map(step => <li key={step}>{step}</li>)}</ul>
                      </section>
                    </div>
                  </div>

                  <section className={cx('offer-conversation')}>
                    <header className={cx('conversation-head')}>
                      <div className={cx('chat-contact')}>
                        <span className={cx('logo', 'candidate-avatar-badge')} style={{ background: candidate.avatarColor }}>{candidate.initials}</span>
                        <div>
                          <h3>{candidate.name}</h3>
                          <p>Candidate · {candidate.course}</p>
                          <small><i></i> Online &amp; Active</small>
                        </div>
                      </div>
                      {candidate.offers.length > 1 && (
                        <label className={cx('thread-picker')}>
                          <span>Thread</span>
                          <select
                            value={candidate.offerId || ''}
                            onChange={event => selectThread(event.target.value)}
                            title="This candidate holds more than one offer"
                          >
                            {candidate.offers.map(offer => (
                              <option key={offer.id} value={offer.id}>
                                {offer.headline}{offer.unread ? ` (${offer.unread} new)` : ''}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      <button className={cx('conversation-options')} type="button" aria-label="Conversation options" onClick={() => notify('Conversation options')}>•••</button>
                    </header>
                    <div className={cx('message-thread')} ref={threadRef}>
                      {candidate.messages.map(message =>
                        message.from === 'system' ? (
                          <p key={message.id} className={cx('thread-notice')}>{message.body}</p>
                        ) : (
                        <div key={message.id} className={cx(message.from === 'institution' && 'student-message')}>
                          <span>{message.from === 'institution' ? 'YOU' : candidate.initials}</span>
                          <div>
                            <strong>
                              {message.author}
                              {/* Sent under this officer's name by a rule — they did not write it. */}
                              {message.automatic && <span className={cx('thread-auto-tag')}>Automatic</span>}
                            </strong>
                            <p>{message.body}</p>
                            {message.attachment && (
                              <button
                                type="button"
                                className={cx('thread-attachment')}
                                onClick={() => void openAttachment(message.id)}
                              >
                                <span>📎</span>
                                <span className={cx('thread-attachment-name')}>{message.attachment.fileName}</span>
                                <em>{fileSize(message.attachment.size)}</em>
                              </button>
                            )}
                            <small>{message.time}</small>
                          </div>
                        </div>
                        )
                      )}
                    </div>
                    {chatFile && (
                      <div className={cx('composer-pending-file')}>
                        <span>📎 {chatFile.name}</span>
                        <button type="button" onClick={() => setChatFile(null)}>Remove</button>
                      </div>
                    )}
                    <form className={cx('message-composer')} onSubmit={event => { event.preventDefault(); void sendChatMessage(); }}>
                      <label className={cx('composer-attach')} title="Attach a file">
                        ＋
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                          onChange={event => {
                            const chosen = event.target.files?.[0];
                            if (!chosen) return;
                            if (chosen.size > 10 * 1024 * 1024) {
                              notify('Attachments are limited to 10 MB.');
                              return;
                            }
                            setChatFile(chosen);
                          }}
                        />
                      </label>
                      <input
                        name="chatDraft"
                        value={chatDraft}
                        placeholder={`Message ${candidate.name}…`}
                        autoComplete="off"
                        onChange={event => setChatDraft(event.target.value)}
                      />
                      <button className={cx('primary-btn')} disabled={!chatDraft.trim() && !chatFile} type="submit">Send</button>
                    </form>
                  </section>
                </section>
              )}
            </section>
          </main>
        )}

        {!isCandidateView && (
          <main className={cx('uni-main')}>
            {(view === 'dashboard' || view === 'reports') && <OrganizationDashboard workspace={workspace} />}
            {(view === 'templates' || view === 'catalog' || view === 'criteria') && <OrganizationProducts workspace={workspace} />}
            {view === 'notifications' && <OrganizationNotifications workspace={workspace} />}
            {(view === 'profile' || view === 'settings' || view === 'subscription') && <OrganizationSettings workspace={workspace} />}
          </main>
        )}

        {toast && <div className={cx('uni-toast')}>{toast}</div>}

        <WorkspaceModals workspace={workspace} />
      </div>
    </div>
  );
}
