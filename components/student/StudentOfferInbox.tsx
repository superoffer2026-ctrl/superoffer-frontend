'use client';

import { useEffect, useState } from 'react';
import { classNames } from '@/lib/cx';
import { offerWalletStore, type OfferCategory, type OfferDecisionStatus, type StudentOffer } from '@/lib/stores/offer-wallet.store';
import { useStore } from '@/lib/stores/observable-store';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/OfferWorkspace.module.css';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';

const cx = classNames(styles);

type OfferFilter = 'All' | OfferDecisionStatus;
type CategoryFilter = 'All' | OfferCategory;

/** A fixed order, so the chips keep their places as new offers arrive. */
const CATEGORY_ORDER: OfferCategory[] = ['University', 'Bank', 'Scholarship'];

export function StudentOfferInbox() {
  const profile = useStudentProfile();
  const walletStore = useStore(offerWalletStore);

  const [filter, setFilter] = useState<OfferFilter>('All');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [draft, setDraft] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error] = useState('');

  useEffect(() => {
    void walletStore.load();
  }, [walletStore]);

  const offers = walletStore.offers;

  /** Only the kinds the student actually has — an empty chip filters nothing. */
  const presentCategories = CATEGORY_ORDER.filter(kind => offers.some(offer => offer.category === kind));

  const filteredOffers = offers
    .filter(offer => filter === 'All' || offer.status === filter)
    .filter(offer => category === 'All' || offer.category === category);

  const clearFilters = () => {
    setFilter('All');
    setCategory('All');
  };

  /** The reading pane follows the visible list, so a filter never leaves it
   *  showing an offer the list has just excluded. */
  const selected: StudentOffer | undefined =
    filteredOffers.find(offer => offer.id === selectedId) || filteredOffers[0];

  const count = (status: OfferDecisionStatus) => offers.filter(offer => offer.status === status).length;

  const studentInitials = profile.initials;

  const select = (offer: StudentOffer) => {
    walletStore.markViewed(offer.id);
    setSelectedId(offer.id);
  };

  const setStatus = (status: OfferDecisionStatus) => {
    if (!selected) return;
    walletStore.setStatus(selected.id, status);
  };

  const sendMessage = () => {
    const body = draft.trim();
    if (!body || !selected) return;
    walletStore.addMessage(selected.id, body);
    setDraft('');
  };

  const logo = (offer: StudentOffer) => (
    <span className={cx('logo', 'institution-logo', offer.category === 'Bank' && 'bank-logo')}>
      {offer.logo ? <img src={offer.logo} alt={offer.institution} /> : offer.initial}
    </span>
  );

  /** Days between now and the deadline, floored at zero. */
  const daysLeft = (iso: string) => {
    const target = new Date(iso).getTime();
    if (Number.isNaN(target)) return null;
    return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
  };

  /** The server sends a dash for an offer that never stated a figure. A labelled
   *  blank is worse than no row, so the term is dropped rather than drawn. */
  const isStated = (value: string | undefined) =>
    !!value && !['—', '-', '–', 'N/A', 'TBD'].includes(value.trim());

  /** Every category-specific figure an organisation can attach to an offer, beyond
   *  the headline value already shown above — a lender's or university's terms are
   *  rarely just one number, and the rest were being collected and simply dropped. */
  const DETAIL_FIELDS: Array<{ key: keyof StudentOffer; label: string; format?: (raw: string) => string }> = [
    { key: 'location', label: 'LOCATION' },
    { key: 'tuitionFee', label: 'TUITION FEE' },
    { key: 'scholarshipPct', label: 'SCHOLARSHIP', format: raw => `${raw}%` },
    { key: 'durationYears', label: 'DURATION', format: raw => `${raw} ${raw === '1' ? 'year' : 'years'}` },
    { key: 'qsRanking', label: 'QS RANKING' },
    { key: 'placementHighlights', label: 'PLACEMENT HIGHLIGHTS' },
    { key: 'loanAmount', label: 'LOAN AMOUNT' },
    { key: 'interestRate', label: 'INTEREST RATE' },
    { key: 'emi', label: 'EMI' },
    { key: 'moratorium', label: 'MORATORIUM' },
    { key: 'processingFee', label: 'PROCESSING FEE' },
    { key: 'tenure', label: 'TENURE' },
    { key: 'amount', label: 'AMOUNT' },
    { key: 'coverage', label: 'COVERAGE' },
    { key: 'eligibility', label: 'ELIGIBILITY' },
    { key: 'visaServices', label: 'VISA SERVICES' },
    { key: 'accommodationSupport', label: 'ACCOMMODATION SUPPORT' },
    { key: 'supportServices', label: 'SUPPORT SERVICES' }
  ];

  const offerDetails = (offer: StudentOffer) =>
    DETAIL_FIELDS
      .map(field => {
        const raw = offer[field.key];
        const stringValue = raw === undefined || raw === null ? '' : String(raw);
        return { ...field, value: stringValue };
      })
      .filter(field => isStated(field.value))
      .map(field => ({ ...field, value: field.format ? field.format(field.value) : field.value }));

  const heroLabel =
    selected?.category === 'Bank' ? 'FINANCE PROPOSAL'
      : selected?.category === 'Scholarship' ? 'SCHOLARSHIP AWARD'
        : selected?.category === 'Consultancy' ? 'SERVICE PROPOSAL'
          : 'ADMISSION OPPORTUNITY';

  return (
    <StudentWorkspaceShell layout="workspace" backdrop="scene" sky={['#d9ecff', '#e6e3ff', '#ffe9dc']}>
      {error && <p className={cx('mailbox-error')}>{error}</p>}

      <main className={cx('offer-workspace-page')}>
        <section className={cx('offer-workspace')}>
          <aside className={cx('offer-mailbox')}>
            <header className={cx('mailbox-toolbar')}>
              <button className={cx('all-offers-reset')} onClick={() => setFilter('All')}>
                <strong>My offers</strong>
                <small>
                  {!offers.length ? 'Nothing here yet'
                    : offers.length === 1 ? '1 offer to review'
                      : `${offers.length} offers to review`}
                </small>
              </button>
              <div className={cx('compact-offer-filters')}>
                <button className={cx(filter === 'Accepted' && 'active')} onClick={() => setFilter('Accepted')}>Accepted <b>{count('Accepted')}</b></button>
                <button className={cx(filter === 'Shortlisted' && 'active')} onClick={() => setFilter('Shortlisted')}>Shortlisted <b>{count('Shortlisted')}</b></button>
                <button className={cx(filter === 'Rejected' && 'active')} onClick={() => setFilter('Rejected')}>Rejected <b>{count('Rejected')}</b></button>
                <button className={cx('filter-all', filter === 'All' && 'active')} onClick={() => setFilter('All')}>All <b>{offers.length}</b></button>
              </div>

              {presentCategories.length > 1 && (
                <div className={cx('mailbox-kinds')} role="group" aria-label="Filter by offer type">
                  <button
                    className={cx(category === 'All' && 'active')}
                    onClick={() => setCategory('All')}
                  >
                    All types
                  </button>
                  {presentCategories.map(kind => (
                    <button
                      key={kind}
                      className={cx(category === kind && 'active')}
                      onClick={() => setCategory(kind)}
                    >
                      {kind} <b>{offers.filter(offer => offer.category === kind).length}</b>
                    </button>
                  ))}
                </div>
              )}

            </header>

            {filteredOffers.map(offer => (
              <button
                key={offer.id}
                className={cx('offer-mail-item', offer.id === selected?.id && 'selected')}
                onClick={() => select(offer)}
              >
                {logo(offer)}
                <span className={cx('mail-offer-main')}>
                  <div><small>{offer.category} offer</small><time>{offer.received}</time></div>
                  <strong>{offer.institution}</strong>
                  <p>{offer.program}</p>
                  <b>{offer.headline}</b>
                </span>
                {offer.status === 'Pending' && <i></i>}
              </button>
            ))}

            {/* With no offers at all the reading pane carries the explanation, so this
                only speaks up when a filter is what emptied the list. */}
            {!filteredOffers.length && !!offers.length && (
              <div className={cx('mailbox-empty')}>
                <strong>No offers match</strong>
                <small>Nothing matches these filters.</small>
                <button type="button" onClick={clearFilters}>Clear filters</button>
              </div>
            )}
          </aside>

          {!selected && (
            <section className={cx('offer-reading-pane', 'offer-reading-pane-empty')}>
              <div className={cx('offer-empty-state')}>
                <span>{offers.length ? '⌗' : '✉'}</span>
                <h2>{offers.length ? 'No offers match' : 'Nothing to review yet'}</h2>
                <p>
                  {offers.length
                    ? 'No offer matches these filters. Clear them to see everything again.'
                    : profile.isSubmitted
                      ? 'Your profile is with our verified universities and lenders. The offers they send you land here.'
                      : 'Complete and submit your profile so verified universities and lenders can discover you. Their offers land here.'}
                </p>
                {!!offers.length && (
                  <button type="button" className={cx('primary-btn')} onClick={clearFilters}>Clear filters</button>
                )}
              </div>
            </section>
          )}

          {selected && (
          <section className={cx('offer-reading-pane')}>
            <div className={cx('offer-details-column')}>
              <header className={cx('reading-pane-header')}>
                <div className={cx('reading-institution')}>
                  {logo(selected)}
                  <div>
                    <small>{selected.category.toUpperCase()} OFFER</small>
                    <h2>{selected.institution}</h2>
                    <p className={cx('reading-course')}>{selected.program}</p>
                    {isStated(selected.institutionWebsite) && (
                      <a className={cx('reading-institution-link')} href={selected.institutionWebsite} target="_blank" rel="noreferrer">
                        {selected.institutionWebsite.replace(/^https?:\/\//, '')} ↗
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={cx(
                    'header-offer-status',
                    selected.status === 'Shortlisted' && 'shortlisted-status',
                    selected.status === 'Accepted' && 'accepted-status',
                    selected.status === 'Rejected' && 'rejected-status'
                  )}
                >
                  {selected.status}
                </span>
              </header>

              <div className={cx('reading-pane-scroll')}>
                <section className={cx('offer-detail-hero')}>
                  <small>{heroLabel}</small>
                  <h1>{selected.headline}</h1>
                  {isStated(selected.description) && <p className={cx('offer-hero-description')}>{selected.description}</p>}
                  <div className={cx('offer-key-terms')}>
                    <div><small>{selected.category === 'Bank' ? 'PRODUCT' : 'PROGRAMME'}</small><strong>{selected.program}</strong></div>
                    {isStated(selected.value) && (
                      <div><small>{selected.valueLabel.toUpperCase()}</small><strong>{selected.value}</strong></div>
                    )}
                    {isStated(selected.intake) && (
                      <div><small>{selected.category === 'Bank' ? 'ELIGIBLE INTAKE' : 'INTAKE'}</small><strong>{selected.intake}</strong></div>
                    )}
                    {(() => {
                      const left = daysLeft(selected.deadlineAt);
                      const urgent = left !== null && left <= 7;
                      return (
                        <div className={cx(urgent && 'term-urgent')}>
                          <small>RESPOND BY</small>
                          <strong>{selected.deadline}</strong>
                          {left !== null && (
                            <span className={cx('term-countdown')}>
                              {left === 0 ? 'Due today' : left === 1 ? '1 day left' : `${left} days left`}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </section>

                {/*
                  * The university and the programme, as they were when this offer
                  * was sent. Comparing three offers means comparing tuition,
                  * duration and intake side by side — a headline and a value alone
                  * left a student guessing at everything that actually differs.
                  */}
                {(() => {
                  const uni = selected.snapshot?.university;
                  const prog = selected.snapshot?.program;
                  if (!uni?.name && !prog?.name) return null;

                  const facts = [
                    prog?.degreeLevel && { label: 'DEGREE LEVEL', value: prog.degreeLevel },
                    prog?.fieldOfStudy && { label: 'FIELD OF STUDY', value: prog.fieldOfStudy },
                    prog?.durationMonths && {
                      label: 'DURATION',
                      value: prog.durationMonths % 12 === 0
                        ? `${prog.durationMonths / 12} year${prog.durationMonths === 12 ? '' : 's'}`
                        : `${prog.durationMonths} months`
                    },
                    prog?.studyMode && { label: 'STUDY MODE', value: prog.studyMode },
                    prog?.intakes?.length && { label: 'INTAKES', value: prog.intakes.join(', ') },
                    prog?.tuitionFee && { label: 'TUITION FEE', value: `${prog.currency || ''} ${prog.tuitionFee}`.trim() },
                    prog?.scholarshipInfo && { label: 'SCHOLARSHIP', value: prog.scholarshipInfo }
                  ].filter(Boolean) as { label: string; value: string }[];

                  return (
                    <section className={cx('offer-university')}>
                      <header className={cx('offer-university-head')}>
                        {uni?.logoUrl ? (
                          <img src={uni.logoUrl} alt={`${uni.name || 'University'} logo`} className={cx('offer-university-logo')} />
                        ) : (
                          <span className={cx('offer-university-logo', 'offer-university-initial')}>
                            {(uni?.name || '?').slice(0, 1)}
                          </span>
                        )}
                        <div>
                          <h3>{uni?.name}</h3>
                          <p>{[prog?.campusLocation || uni?.city, uni?.country].filter(Boolean).join(', ')}</p>
                          {uni?.website && (
                            <a href={uni.website} target="_blank" rel="noreferrer noopener">{uni.website}</a>
                          )}
                        </div>
                      </header>

                      {prog?.imageUrl && (
                        <img src={prog.imageUrl} alt={prog.name || 'Programme'} className={cx('offer-programme-image')} />
                      )}

                      {!!facts.length && (
                        <div className={cx('offer-university-grid')}>
                          {facts.map(fact => (
                            <div key={fact.label}><small>{fact.label}</small><strong>{fact.value}</strong></div>
                          ))}
                        </div>
                      )}
                    </section>
                  );
                })()}

                {!!offerDetails(selected).length && (
                  <section className={cx('offer-more-details')}>
                    <h3>More details</h3>
                    <div className={cx('offer-more-details-grid')}>
                      {offerDetails(selected).map(field => (
                        <div key={field.key}><small>{field.label}</small><strong>{field.value}</strong></div>
                      ))}
                    </div>
                  </section>
                )}

                {isStated(selected.conditions) && (
                  <section className={cx('offer-conditions')}>
                    <div><h3>Offer details</h3><p>{selected.conditions}</p></div>
                  </section>
                )}

                {!!selected.nextSteps.length && (
                  <section className={cx('offer-next-steps')}>
                    <div><small>NEXT STEPS</small><strong>To progress this offer</strong></div>
                    <ul>{selected.nextSteps.map(step => <li key={step}>{step}</li>)}</ul>
                  </section>
                )}
              </div>

              <footer className={cx('offer-decision-bar')}>
                <button
                  className={cx('secondary-btn', 'shortlist-action', selected.status === 'Shortlisted' && 'chosen')}
                  onClick={() => setStatus('Shortlisted')}
                >
                  ☆ Shortlist
                </button>
                <button
                  className={cx('secondary-btn', 'reject-action', selected.status === 'Rejected' && 'chosen')}
                  onClick={() => setStatus('Rejected')}
                >
                  Decline
                </button>
                <button className={cx('primary-btn')} onClick={() => setStatus('Accepted')}>
                  {selected.status === 'Accepted' ? '✓ Accepted' : 'Accept offer'}
                </button>
              </footer>
            </div>

            <section className={cx('offer-conversation')}>
              <header className={cx('conversation-head')}>
                <div className={cx('chat-contact')}>
                  <span className={cx('logo', selected.category === 'Bank' && 'bank-logo')}>{selected.initial}</span>
                  <div>
                    <h3>{selected.contact}</h3>
                    <p>{selected.contactRole}</p>
                    <small><i></i> Available to help</small>
                  </div>
                </div>
                <button className={cx('conversation-options')} type="button" aria-label="Conversation options">•••</button>
              </header>
              <div className={cx('message-thread')}>
                {selected.messages.map((message, index) =>
                  message.from === 'system' ? (
                    <p key={index} className={cx('thread-notice')}>{message.body}</p>
                  ) : (
                  <div key={index} className={cx(message.from === 'student' && 'student-message')}>
                    <span>{message.from === 'student' ? studentInitials : selected.initial}</span>
                    <div>
                      <strong>
                        {message.author}
                        {message.automatic && <span className={cx('thread-auto-tag')}>Automatic</span>}
                      </strong>
                      <p>{message.body}</p>
                      <small>{message.time}</small>
                    </div>
                  </div>
                  )
                )}
              </div>
              <form className={cx('message-composer')} onSubmit={event => { event.preventDefault(); sendMessage(); }}>
                <button type="button" aria-label="Attach file">＋</button>
                <input
                  name="message"
                  value={draft}
                  placeholder={`Message ${selected.contact}…`}
                  autoComplete="off"
                  onChange={event => setDraft(event.target.value)}
                />
                <button className={cx('primary-btn')} disabled={!draft.trim()}>Send</button>
              </form>
            </section>
          </section>
          )}
        </section>
      </main>
    </StudentWorkspaceShell>
  );
}
