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
        <header className={cx('student-home-header')}>
          <div>
            <span className={cx('student-kicker')}>MY STUDY JOURNEY</span>
            <h1>Good afternoon, {firstName}</h1>
            <p>Here&rsquo;s what needs your attention today.</p>
          </div>
          <div className={cx('student-header-actions')}>
            {isSubmitted && <span className={cx('submitted-chip')}>✓ Submitted — visible to universities</span>}
            <Link className={cx('header-secondary')} href="/student/profile">View profile</Link>
            <Link className={cx('header-primary')} href="/student/offers">My offers <b>{walletStore.totalCount}</b></Link>
          </div>
        </header>

        <Reveal className={cx('wallet-stat-row')} visibleClassName={cx('is-visible')}>
          <article><StatCounter compact value={walletStore.totalCount} label="Total offers" /></article>
          <article><StatCounter compact value={walletStore.newCount} label="New offers" /></article>
          <article><StatCounter compact value={walletStore.universityCount} label="University offers" /></article>
          <article><StatCounter compact value={walletStore.bankCount} label="Loan offers" /></article>
          <article><StatCounter compact value={walletStore.scholarshipCount} label="Scholarship offers" /></article>
          <article><StatCounter compact value={walletStore.consultancyCount} label="Consultancy offers" /></article>
          <article><StatCounter compact value={walletStore.savedCount} label="Saved offers" /></article>
          <article><StatCounter compact value={walletStore.acceptedCount} label="Accepted offers" /></article>
        </Reveal>

        <section className={cx('journey-banner')}>
          <div className={cx('journey-main')}>
            <div className={cx('journey-icon')}>✓</div>
            <div>
              <span>YOUR NEXT STEP</span>
              <h2>
                {isSubmitted
                  ? 'Your profile is live with our partner universities'
                  : 'Finish your profile to improve your matches'}
              </h2>
              <p>
                {isSubmitted
                  ? `Submitted ${submittedAtLabel}. Universities and lenders can now discover and match you with offers.`
                  : 'Complete every section and submit from Review Profile so universities can discover you.'}
              </p>
            </div>
            {isSubmitted
              ? <Link href="/student/review">View submission <b>→</b></Link>
              : <Link href="/student/personal-information">Continue profile <b>→</b></Link>}
          </div>
          <div className={cx('journey-progress')}>
            <div><span>Profile strength</span><strong>{completionPercent}%</strong></div>
            <div className={cx('journey-track')}><i style={{ width: `${completionPercent}%` }}></i></div>
            <small>
              {isSubmitted
                ? 'All required sections complete'
                : `${missingSectionCount} section${missingSectionCount === 1 ? '' : 's'} need attention`}
            </small>
          </div>
        </section>

        <section className={cx('loan-nudge-banner')}>
          <div className={cx('loan-nudge-icon')}>₹</div>
          <div className={cx('loan-nudge-copy')}>
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
            <div className={cx('loan-nudge-actions')}>
              <button type="button" onClick={() => void answerLoanQuestion(true)}>Yes, get bank offers</button>
              <button type="button" className={cx('ghost')} onClick={() => void answerLoanQuestion(false)}>No, not now</button>
            </div>
          )}
          {bankOffersState === 'upload' && <Link href="/student/loan-eligibility">Upload documents <b>→</b></Link>}
          {bankOffersState === 'complete' && <Link href="/student/offers">View offers <b>→</b></Link>}
          {bankOffersState === 'declined' && (
            <div className={cx('loan-nudge-actions')}>
              <button type="button" onClick={() => void answerLoanQuestion(true)}>Get bank offers</button>
            </div>
          )}
        </section>

        <section className={cx('student-stage-row')} aria-label="Your opportunity journey">
          <article className={cx('done')}><span>1</span><div><strong>Profile created</strong><small>Your basic details are ready</small></div></article>
          <i></i>
          <article className={cx('current')}><span>2</span><div><strong>Get discovered</strong><small>Complete your profile</small></div></article>
          <i></i>
          <article><span>3</span><div><strong>Compare offers</strong><small>Review the best matches</small></div></article>
          <i></i>
          <article><span>4</span><div><strong>Choose your path</strong><small>Accept when you&rsquo;re ready</small></div></article>
        </section>

        <div className={cx('student-home-grid')}>
          <section className={cx('student-tasks')}>
            <header>
              <div><span>TO DO</span><h2>Your action list</h2></div>
              <small>{tasks.length} remaining</small>
            </header>
            {tasks.map(task => (
              <Link key={task.key} href={task.route}>
                <span className={cx('task-check')}></span>
                <div><strong>{task.title}</strong><small>{task.description}</small></div>
                <time>{task.time}</time>
                <b>→</b>
              </Link>
            ))}
            {!tasks.length && (
              <p style={{ padding: '18px 4px', color: '#6b7871', fontSize: 13 }}>
                Nothing needs your attention right now.
              </p>
            )}
          </section>

          <aside className={cx('student-upcoming')}>
            <header><span>UPCOMING</span><h2>Dates to remember</h2></header>
            {upcoming.map(item => (
              <div key={item.id} className={cx('upcoming-item', item.urgent && 'urgent')}>
                <time><b>{item.day}</b><small>{item.month}</small></time>
                <div><span>OFFER DEADLINE</span><strong>{item.institution}</strong><small>{item.note}</small></div>
              </div>
            ))}
            {!upcoming.length && (
              <p style={{ padding: '14px 4px', color: '#6b7871', fontSize: 13 }}>No offer deadlines yet.</p>
            )}
            <Link href="/student/offers">View all deadlines →</Link>
          </aside>
        </div>

        <section className={cx('student-opportunities')}>
          <header>
            <div>
              <span>JUST FOR YOU</span>
              <h2>Recent opportunities</h2>
              <p>Matches based on your goals and academic profile.</p>
            </div>
            <Link href="/student/offers">See all offers →</Link>
          </header>
          <div className={cx('opportunity-row', 'opportunity-row-market')}>
            {walletStore.offers.slice(0, 4).map(offer => (
              <OfferMarketplaceCard key={offer.id} offer={offer} compact onViewDetails={goToOffers} />
            ))}
          </div>
        </section>

        <section className={cx('student-shortcuts')}>
          {ACTIONS.map(action => (
            <Link key={action.title} href={action.route}>
              <span>{action.icon}</span>
              <div><strong>{action.title}</strong><small>{action.description}</small></div>
              <b>→</b>
            </Link>
          ))}
        </section>
      </section>
    </div>
  );
}
