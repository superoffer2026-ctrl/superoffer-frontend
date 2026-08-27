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

const NUDGE_RING_RADIUS = 27;
const NUDGE_RING_LENGTH = 2 * Math.PI * NUDGE_RING_RADIUS;

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

  /** Nudges an incomplete profile once per session — dismissing it (or continuing) shouldn't re-pop on every dashboard visit.
   *  Delayed so the dashboard itself is visible first, rather than popping over a blank page. */
  useEffect(() => {
    if (!profile.loaded || isSubmitted) return;
    if (readSession(PROFILE_NUDGE_SEEN_KEY)) return;
    const timer = setTimeout(() => setShowProfileNudge(true), 1500);
    return () => clearTimeout(timer);
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

  const { needsLoan } = profile.completion.loanDocuments;

  const bankOffersState: 'ask' | 'progress' | 'declined' = (() => {
    if (!needsLoan) return 'ask';
    if (needsLoan === 'no') return 'declined';
    return 'progress';
  })();

  /** One click: say yes, then go straight to the parent/guardian details — no separate gate to click through. */
  const startLoanApplication = async () => {
    const token = readAccessToken();
    if (!token) return;
    await authApi.saveStudentFinancial(token, { needsLoan: 'yes' });
    await profile.refresh();
    router.push('/student/loan-eligibility');
  };

  /** The whole card is the tap target; only a fresh "yes" needs saving first. */
  const openLoanCard = () => {
    if (bankOffersState === 'progress') {
      router.push('/student/loan-eligibility');
      return;
    }
    void startLoanApplication();
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
    ...(needsLoan === 'yes'
      ? [{
          key: 'loan-application',
          title: 'Finish your loan application',
          description: 'Add your parent or guardian’s details so lenders can confirm your eligibility',
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
            <div className={cx('nudge-hero')}>
              <img src="/students-campus.png" alt="" />
              <div className={cx('nudge-hero-fade')} />
              <button type="button" className={cx('profile-nudge-close')} onClick={dismissNudge} aria-label="Close">×</button>
              <div className={cx('nudge-ring')} role="img" aria-label={`Profile strength ${completionPercent} percent`}>
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r={NUDGE_RING_RADIUS} className={cx('nudge-ring-track')} />
                  <circle
                    cx="32" cy="32" r={NUDGE_RING_RADIUS}
                    className={cx('nudge-ring-value')}
                    strokeDasharray={NUDGE_RING_LENGTH}
                    strokeDashoffset={NUDGE_RING_LENGTH - (NUDGE_RING_LENGTH * Math.min(100, Math.max(0, completionPercent))) / 100}
                  />
                </svg>
                <strong>{completionPercent}<i>%</i></strong>
              </div>
            </div>

            <div className={cx('nudge-body')}>
              <span className={cx('nudge-kicker')}>YOU&rsquo;RE ON YOUR WAY 🚀</span>
              <h2>Let&rsquo;s get you discovered, {firstName}!</h2>
              <p>A few minutes now and universities and banks can start finding you.</p>

              <div className={cx('profile-nudge-actions')}>
                <Link className={cx('profile-nudge-primary')} href="/student/personal-information" onClick={dismissNudge}>
                  Continue profile <b>→</b>
                </Link>
                <button type="button" className={cx('profile-nudge-secondary')} onClick={dismissNudge}>Maybe later</button>
              </div>
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

        {/* Finance is the one place amber appears, so it reads as its own track. The whole card is the tap target. */}
        <button type="button" className={cx('loan-card', `loan-${bankOffersState}`)} onClick={openLoanCard}>
          <div className={cx('loan-icon')}>⚡</div>
          <div className={cx('loan-copy')}>
            <span>BANK OFFERS <b className={cx('loan-badge')}>24 HRS</b></span>
            {bankOffersState === 'ask' && (
              <>
                <h2>Get bank loans within 24 hours</h2>
                <p>Tell us about your parent or guardian and we&apos;ll match you with lenders ready to fund your studies abroad.</p>
              </>
            )}
            {bankOffersState === 'progress' && (
              <>
                <h2>Your loan application is in progress</h2>
                <p>Pick up where you left off — we&apos;re matching you with lenders once your details are in.</p>
              </>
            )}
            {bankOffersState === 'declined' && (
              <>
                <h2>Not looking for a loan right now</h2>
                <p>Changed your mind? Get bank loans within 24 hours, anytime.</p>
              </>
            )}
          </div>
          <span className={cx('loan-arrow')} aria-hidden="true">→</span>
        </button>

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
