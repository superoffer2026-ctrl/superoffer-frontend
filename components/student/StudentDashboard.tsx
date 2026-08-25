'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Reveal } from '@/components/shared/Reveal';
import { StatCounter } from '@/components/shared/StatCounter';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { STUDENT_PROFILE_STEPS } from '@/lib/models/student-portal';
import { readAccessToken, readSession, writeSession } from '@/lib/storage';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { useStore } from '@/lib/stores/observable-store';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudentWorkspacePages.module.css';
import { OfferMarketplaceCard } from './OfferMarketplaceCard';
import { StudentWorkspaceRail } from './StudentWorkspaceRail';

const cx = classNames(styles);

const PROFILE_NUDGE_SEEN_KEY = 'superoffer_profile_nudge_seen';

/** Days between now and a deadline, floored at zero. */
const daysUntil = (iso: string) => {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
};

/** Which wizard step each completion section belongs to. */
const STEP_ROUTES: Record<string, string> = Object.fromEntries(
  STUDENT_PROFILE_STEPS.filter(step => step.completionKey).map(step => [step.completionKey as string, `/student/${step.path}`])
);

const ACTIONS = [
  { title: 'Update preferences', description: 'Countries, courses, and intake', icon: '◎', route: '/student/study-preferences' },
  { title: 'Manage documents', description: 'View uploads and verification', icon: '▤', route: '/student/documents' },
  { title: 'Account settings', description: 'Privacy and notifications', icon: '⚙', route: '/student/settings' }
];

const STAGES = [
  { title: 'Profile created', note: 'Your basic details are ready' },
  { title: 'Get discovered', note: 'Complete your profile' },
  { title: 'Compare offers', note: 'Review the best matches' },
  { title: 'Choose your path', note: 'Accept when you’re ready' }
];

/** Greets by the reader's own clock rather than assuming an afternoon. */
const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  return hour < 17 ? 'Good afternoon' : 'Good evening';
};

const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export function StudentDashboard() {
  const profile = useStudentProfile();
  const walletStore = useStore(offerWalletStore);
  const router = useRouter();
  const [showProfileNudge, setShowProfileNudge] = useState(false);

  const isSubmitted = profile.isSubmitted;
  const { completionPercent, sections } = profile.completion;

  /** The dashboard summarises only the three sections it links to. */
  const missingSectionCount = ['personalInformation', 'studyPreferences', 'academicInformation']
    .filter(key => !sections.find(section => section.key === key)?.done).length;

  useEffect(() => {
    void walletStore.load();
  }, [walletStore]);

  /** Nudges an incomplete profile once per session — dismissing it (or continuing) shouldn't re-pop on every dashboard visit. */
  useEffect(() => {
    if (!profile.loaded || isSubmitted) return;
    if (!readSession(PROFILE_NUDGE_SEEN_KEY)) setShowProfileNudge(true);
  }, [profile.loaded, isSubmitted]);

  const dismissNudge = () => {
    setShowProfileNudge(false);
    writeSession(PROFILE_NUDGE_SEEN_KEY, '1');
  };

  const firstName = profile.fullName.split(/\s+/)[0];

  const submittedAtLabel = (() => {
    const raw = profile.profile.submittedAt;
    if (!raw) return '';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '' : `on ${date.toLocaleDateString()}`;
  })();

  /** Which loan documents are needed, and whether they are all in, is decided server-side. */
  const { needsLoan, complete: loanDocumentsComplete } = profile.completion.loanDocuments;

  const bankOffersState: 'ask' | 'upload' | 'complete' | 'declined' = (() => {
    if (!needsLoan) return 'ask';
    if (needsLoan === 'no') return 'declined';
    return loanDocumentsComplete ? 'complete' : 'upload';
  })();

  const answerLoanQuestion = async (wantsLoan: boolean) => {
    const token = readAccessToken();
    if (!token) return;
    await authApi.saveStudentFinancial(token, { needsLoan: wantsLoan ? 'yes' : 'no' });
    await profile.refresh();
  };

  const goToOffers = () => router.push('/student/offers');

  /**
   * The action list is the profile sections the server says are unfinished, the
   * loan paperwork it is still waiting on, and every offer awaiting a decision.
   */
  const tasks = [
    ...sections
      .filter(section => !section.done)
      .map(section => ({
        key: `section-${section.key}`,
        title: `Finish ${section.label}`,
        description: 'Required before you can submit your profile',
        time: 'Profile',
        route: STEP_ROUTES[section.key] || '/student/review'
      })),
    ...(needsLoan === 'yes' && !loanDocumentsComplete
      ? [{
          key: 'loan-documents',
          title: 'Upload your loan documents',
          description: 'Lenders need these before they can confirm your eligibility',
          time: 'Finance',
          route: '/student/loan-eligibility'
        }]
      : []),
    ...walletStore.offers
      .filter(offer => offer.status === 'Pending')
      .map(offer => ({
        key: `offer-${offer.id}`,
        title: `Respond to ${offer.institution}`,
        description: `${offer.program} · ${offer.valueLabel || 'Offer'} ${offer.value}`.trim(),
        time: `${daysUntil(offer.deadlineAt)} days`,
        route: '/student/offers'
      }))
  ];

  /** Every open offer's response deadline, soonest first. */
  const upcoming = walletStore.offers
    .filter(offer => offer.status === 'Pending' || offer.status === 'Shortlisted')
    .slice()
    .sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
    .map(offer => ({
      id: offer.id,
      day: new Date(offer.deadlineAt).toLocaleDateString('en-GB', { day: 'numeric' }),
      month: new Date(offer.deadlineAt).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      urgent: daysUntil(offer.deadlineAt) <= 7,
      institution: offer.institution,
      note: `${offer.valueLabel || 'Offer'} response due`
    }));

  const breakdown = [
    { value: walletStore.newCount, label: 'New' },
    { value: walletStore.universityCount, label: 'University' },
    { value: walletStore.bankCount, label: 'Loan' },
    { value: walletStore.scholarshipCount, label: 'Scholarship' },
    { value: walletStore.consultancyCount, label: 'Consultancy' },
    { value: walletStore.savedCount, label: 'Saved' },
    { value: walletStore.acceptedCount, label: 'Accepted' }
  ];

  /** A wall of zeros tells a new student nothing; say what will fill it instead. */
  const walletIsEmpty = walletStore.totalCount === 0 && breakdown.every(item => !item.value);

  /** Stage 2 until the profile is submitted, stage 3 once offers start arriving. */
  const currentStage = !isSubmitted ? 1 : walletStore.totalCount ? 2 : 1;

  return (
    <div className={cx('host')}>
      <StudentWorkspaceRail />

      {showProfileNudge && (
        <div className={cx('profile-nudge-backdrop')} onClick={dismissNudge}>
          <div className={cx('profile-nudge-card')} onClick={event => event.stopPropagation()}>
            <button type="button" className={cx('profile-nudge-close')} onClick={dismissNudge} aria-label="Close">×</button>
            <div className={cx('profile-nudge-icon')}>✓</div>
            <h2>Complete your profile</h2>
            <p>
              Your profile is {completionPercent}% complete. Finish every section so universities, banks and consultants can
              discover and match you with the right offers.
            </p>
            <div className={cx('profile-nudge-actions')}>
              <Link className={cx('profile-nudge-primary')} href="/student/personal-information" onClick={dismissNudge}>
                Continue profile <b>→</b>
              </Link>
              <button type="button" className={cx('profile-nudge-secondary')} onClick={dismissNudge}>Maybe later</button>
            </div>
          </div>
        </div>
      )}

      <section className={cx('student-home')}>
        {/*
          Greeting, progress and the one action that matters, in a single
          statement. Split across a heading and a separate banner, they used to
          compete; together they answer "where am I and what now" at a glance.
        */}
        <header className={cx('hero')}>
          <div className={cx('hero-copy')}>
            <span className={cx('hero-kicker')}>MY STUDY JOURNEY</span>
            <h1>{greeting()}, {firstName}</h1>
            <p>
              {isSubmitted
                ? `Your profile is live with our partner universities. Submitted ${submittedAtLabel}.`
                : 'Finish your profile so universities, banks and consultants can discover you.'}
            </p>
            <div className={cx('hero-actions')}>
              {isSubmitted
                ? <Link className={cx('hero-primary')} href="/student/review">View submission <b>→</b></Link>
                : <Link className={cx('hero-primary')} href="/student/personal-information">Continue profile <b>→</b></Link>}
              <Link className={cx('hero-ghost')} href="/student/offers">
                My offers <b>{walletStore.totalCount}</b>
              </Link>
              <Link className={cx('hero-quiet')} href="/student/profile">View profile</Link>
            </div>
            {isSubmitted && <span className={cx('hero-chip')}>✓ Submitted — visible to universities</span>}
          </div>

          <div className={cx('hero-ring')} role="img" aria-label={`Profile strength ${completionPercent} percent`}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r={RING_RADIUS} className={cx('ring-track')} />
              <circle
                cx="60" cy="60" r={RING_RADIUS}
                className={cx('ring-value')}
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH - (RING_LENGTH * Math.min(100, Math.max(0, completionPercent))) / 100}
              />
            </svg>
            <div className={cx('ring-label')}>
              <strong>{completionPercent}<i>%</i></strong>
            </div>
            <span className={cx('ring-caption')}>Profile strength</span>
            <small>
              {isSubmitted
                ? 'All required sections complete'
                : `${missingSectionCount} section${missingSectionCount === 1 ? '' : 's'} need attention`}
            </small>
          </div>
        </header>

        {/* The offer wallet: one figure that matters, then the breakdown beneath it. */}
        <Reveal className={cx('wallet')} visibleClassName={cx('is-visible')}>
          {walletIsEmpty ? (
            <div className={cx('wallet-empty')}>
              <span className={cx('wallet-empty-mark')}>◇</span>
              <div>
                <strong>No offers yet</strong>
                <small>
                  {isSubmitted
                    ? 'Your profile is with our partners — matched offers will appear here.'
                    : 'Complete and submit your profile, and matched offers will land here.'}
                </small>
              </div>
              {isSubmitted && <Link href="/student/offers">Browse offers →</Link>}
            </div>
          ) : (
            <>
              <article className={cx('wallet-total')}>
                <StatCounter compact value={walletStore.totalCount} label="Total offers" />
                <Link href="/student/offers">View all →</Link>
              </article>
              <div className={cx('wallet-breakdown')}>
                {breakdown.map(item => (
                  <article key={item.label} className={cx(!item.value && 'is-zero')}>
                    <StatCounter compact value={item.value} label={item.label} />
                  </article>
                ))}
              </div>
            </>
          )}
        </Reveal>

        {/* Finance is the one place amber appears, so it reads as its own track. */}
        <section className={cx('loan-card', `loan-${bankOffersState}`)}>
          <div className={cx('loan-mark')}>₹</div>
          <div className={cx('loan-copy')}>
            <span>BANK OFFERS</span>
            {bankOffersState === 'ask' && (
              <>
                <h2>Get bank offers by filling your documents</h2>
                <p>Tell us if you&apos;d like an education loan — we&apos;ll match you with lenders once your documents are in.</p>
              </>
            )}
            {bankOffersState === 'upload' && (
              <>
                <h2>Upload your documents to get bank offers</h2>
                <p>Complete your verification documents so our lending partners can send you matched loan offers.</p>
              </>
            )}
            {bankOffersState === 'complete' && (
              <>
                <h2>Your documents are with our lending partners</h2>
                <p>We&apos;ve shared your details with verified banks — check My Offers for matched loan offers.</p>
              </>
            )}
            {bankOffersState === 'declined' && (
              <>
                <h2>Not looking for a loan right now</h2>
                <p>Changed your mind? You can still get matched with bank offers anytime.</p>
              </>
            )}
          </div>
          {bankOffersState === 'ask' && (
            <div className={cx('loan-actions')}>
              <button type="button" onClick={() => void answerLoanQuestion(true)}>Yes, get bank offers</button>
              <button type="button" className={cx('ghost')} onClick={() => void answerLoanQuestion(false)}>No, not now</button>
            </div>
          )}
          {bankOffersState === 'upload' && (
            <div className={cx('loan-actions')}>
              <Link href="/student/loan-eligibility">Upload documents <b>→</b></Link>
            </div>
          )}
          {bankOffersState === 'complete' && (
            <div className={cx('loan-actions')}>
              <Link href="/student/offers">View offers <b>→</b></Link>
            </div>
          )}
          {bankOffersState === 'declined' && (
            <div className={cx('loan-actions')}>
              <button type="button" onClick={() => void answerLoanQuestion(true)}>Get bank offers</button>
            </div>
          )}
        </section>

        <section className={cx('stage-track')} aria-label="Your opportunity journey">
          {STAGES.map((stage, index) => (
            <article
              key={stage.title}
              className={cx(index < currentStage && 'done', index === currentStage && 'current')}
            >
              <span>{index < currentStage ? '✓' : index + 1}</span>
              <div><strong>{stage.title}</strong><small>{stage.note}</small></div>
            </article>
          ))}
        </section>

        <div className={cx('home-grid')}>
          <section className={cx('tasks')}>
            <header>
              <div><span>TO DO</span><h2>Your action list</h2></div>
              {!!tasks.length && <small>{tasks.length} remaining</small>}
            </header>
            {tasks.map((task, index) => (
              <Link key={task.key} href={task.route} className={cx(index === 0 && 'is-next')}>
                <span className={cx('task-index')}>{index + 1}</span>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.description}</small>
                </div>
                {index === 0 && <em className={cx('task-next')}>NEXT</em>}
                <time>{task.time}</time>
                <b>→</b>
              </Link>
            ))}
            {!tasks.length && (
              <div className={cx('empty-note')}>
                <strong>You&rsquo;re all caught up</strong>
                <small>Nothing needs your attention right now.</small>
              </div>
            )}
          </section>

          <aside className={cx('rail')}>
            <section className={cx('upcoming')}>
              <header><span>UPCOMING</span><h2>Dates to remember</h2></header>
              {upcoming.map(item => (
                <div key={item.id} className={cx('upcoming-item', item.urgent && 'urgent')}>
                  <time><b>{item.day}</b><small>{item.month}</small></time>
                  <div><span>OFFER DEADLINE</span><strong>{item.institution}</strong><small>{item.note}</small></div>
                </div>
              ))}
              {!upcoming.length && (
                <div className={cx('empty-note')}>
                  <strong>No deadlines yet</strong>
                  <small>Response dates appear here once an offer arrives.</small>
                </div>
              )}
              {!!upcoming.length && <Link href="/student/offers">View all deadlines →</Link>}
            </section>

            <section className={cx('shortcuts')}>
              {ACTIONS.map(action => (
                <Link key={action.title} href={action.route}>
                  <span>{action.icon}</span>
                  <div><strong>{action.title}</strong><small>{action.description}</small></div>
                  <b>→</b>
                </Link>
              ))}
            </section>
          </aside>
        </div>

        <section className={cx('opportunities')}>
          <header>
            <div>
              <span>JUST FOR YOU</span>
              <h2>Recent opportunities</h2>
              <p>Matches based on your goals and academic profile.</p>
            </div>
            {!!walletStore.offers.length && <Link href="/student/offers">See all offers →</Link>}
          </header>
          {walletStore.offers.length ? (
            <div className={cx('opportunity-row', 'opportunity-row-market')}>
              {walletStore.offers.slice(0, 4).map(offer => (
                <OfferMarketplaceCard key={offer.id} offer={offer} compact onViewDetails={goToOffers} />
              ))}
            </div>
          ) : (
            <div className={cx('empty-note', 'empty-wide')}>
              <strong>Nothing matched yet</strong>
              <small>
                {isSubmitted
                  ? 'Partners are reviewing your profile — new matches show up here first.'
                  : 'The more of your profile you finish, the better your matches will be.'}
              </small>
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
