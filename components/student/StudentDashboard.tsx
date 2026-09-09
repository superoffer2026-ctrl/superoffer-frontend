'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { BrandMark } from '@/components/landing/BrandMark';
import { Icon, type IconName } from '@/components/landing/Icon';
import { Reveal } from '@/components/landing/Reveal';
import { AnimatedMetric } from '@/components/landing/sections/AnimatedMetric';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { STUDENT_PROFILE_STEPS } from '@/lib/models/student-portal';
import { readAccessToken, readSession, writeSession } from '@/lib/storage';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { useStore } from '@/lib/stores/observable-store';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/student/Dashboard.module.css';

const cx = classNames(styles);

const PROFILE_NUDGE_SEEN_KEY = 'superoffer_profile_nudge_seen';

/** Sidebar navigation — every destination is a real student route. */
const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/student/offers', label: 'Applications & Offers', icon: 'award' },
  { href: '/student/loan-eligibility', label: 'Loan & Funding', icon: 'payments' },
  { href: '/student/profile', label: 'Profile & Documents', icon: 'badge' },
  { href: '/student/saved-universities', label: 'Discover', icon: 'compass' },
  { href: '/student/settings', label: 'Settings', icon: 'sliders' }
];

/** The wizard sections that count toward completion. */
const WIZARD_STEPS = STUDENT_PROFILE_STEPS.filter(step => step.completionKey);

const daysUntil = (iso: string) => {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / 86400000));
};

const NUDGE_R = 27;
const NUDGE_LEN = 2 * Math.PI * NUDGE_R;

export function StudentDashboard() {
  const profile = useStudentProfile();
  const walletStore = useStore(offerWalletStore);
  const router = useRouter();
  const pathname = usePathname() || '';
  const [showNudge, setShowNudge] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const isSubmitted = profile.isSubmitted;
  const { completionPercent, sections } = profile.completion;
  const firstName = profile.fullName.split(/\s+/)[0];
  const { needsLoan } = profile.completion.loanDocuments;

  useEffect(() => {
    void walletStore.load();
  }, [walletStore]);

  /** Unread badge on the header bell, polled like the old rail did. */
  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const token = readAccessToken();
      if (!token) return;
      try {
        const res = await authApi.studentUnreadMessages(token);
        if (!cancelled) setUnread(res?.total || 0);
      } catch {
        /* a failed count must never break the page */
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  /** One-per-session nudge for an unfinished profile. */
  useEffect(() => {
    if (!profile.loaded || isSubmitted) return;
    if (readSession(PROFILE_NUDGE_SEEN_KEY)) return;
    const timer = setTimeout(() => setShowNudge(true), 1500);
    return () => clearTimeout(timer);
  }, [profile.loaded, isSubmitted]);

  const dismissNudge = () => {
    setShowNudge(false);
    writeSession(PROFILE_NUDGE_SEEN_KEY, '1');
  };

  const bankState: 'ask' | 'progress' | 'declined' = !needsLoan ? 'ask' : needsLoan === 'no' ? 'declined' : 'progress';

  const startLoan = async () => {
    const token = readAccessToken();
    if (!token) return;
    await authApi.saveStudentFinancial(token, { needsLoan: 'yes' });
    await profile.refresh();
    router.push('/student/loan-eligibility');
  };
  const openLoan = () => {
    if (bankState === 'progress') { router.push('/student/loan-eligibility'); return; }
    void startLoan();
  };

  /** Incomplete profile sections, in wizard order, as the roadmap. */
  const doneOf = (key: string) => sections.find(s => s.key === key)?.done ?? false;
  const doneCount = WIZARD_STEPS.filter(s => doneOf(s.completionKey as string)).length;
  const pending = WIZARD_STEPS.length - doneCount;

  const roadmap = WIZARD_STEPS
    .filter(step => !doneOf(step.completionKey as string))
    .slice(0, 3)
    .map((step, i) => ({
      key: step.path,
      order: String(WIZARD_STEPS.indexOf(step) + 1).padStart(2, '0'),
      title: step.title,
      description: step.description,
      route: `/student/${step.path}`,
      unlocksBank: step.completionKey === 'financialInformation',
      priority: i === 0,
      est: `Est. ${Math.max(2, 5 - i)} mins`
    }));

  /** The primary CTA points at the next unfinished step. */
  const nextRoute = roadmap[0]?.route || '/student/personal-information';

  /** Offer response deadlines, soonest first. */
  const upcoming = walletStore.offers
    .filter(o => o.status === 'Pending' || o.status === 'Shortlisted')
    .slice()
    .sort((a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime())
    .slice(0, 3)
    .map(o => ({
      id: o.id,
      day: new Date(o.deadlineAt).toLocaleDateString('en-GB', { day: '2-digit' }),
      month: new Date(o.deadlineAt).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
      urgent: daysUntil(o.deadlineAt) <= 7,
      institution: o.institution,
      note: `${o.valueLabel || 'Offer'} response due`
    }));

  const go = (href: string) => { setMenuOpen(false); router.push(href); };
  const onSearch = (e: FormEvent) => { e.preventDefault(); go('/student/offers'); };

  return (
    <div className={cx('host')}>
      {/* ---------------------------------------------------------- sidebar */}
      <div className={cx('scrim', menuOpen && 'show')} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen} />
      <aside className={cx('sidebar', menuOpen && 'open')}>
        <Link className={cx('brand')} href="/student/dashboard">
          <span className={cx('brandMark')}><BrandMark size={30} wordmark={false} /></span>
          <span className={cx('brandText')}><b>SuperOffer</b><small>Candidate Portal</small></span>
        </Link>

        <nav className={cx('nav')} aria-label="Student navigation">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cx('navItem', pathname.startsWith(item.href) && 'active')}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={cx('sideSpacer')} />

        <Link className={cx('userCard')} href="/student/profile">
          <span className={cx('userAvatar')}>
            {profile.initials}
            {isSubmitted && <i><Icon name="check" size={9} /></i>}
          </span>
          <div>
            <b>{profile.fullName}</b>
            <span><i />{isSubmitted ? 'Verified candidate' : 'Draft profile'}</span>
          </div>
          <Icon name="unfold" size={16} />
        </Link>
      </aside>

      {/* ----------------------------------------------------------- header */}
      <header className={cx('header')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className={cx('iconBtn', 'menuBtn')} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
          <form className={cx('search')} onSubmit={onSearch} role="search">
            <Icon name="search" size={17} />
            <input placeholder="Search offers, institutions…" aria-label="Search" />
          </form>
        </div>
        <div className={cx('headRight')}>
          <Link className={cx('iconBtn')} href="/student/notifications" aria-label="Notifications">
            <Icon name="bell" size={20} />
            {unread > 0 && <span className={cx('dot')} />}
          </Link>
          <span className={cx('statusPill', isSubmitted && 'live')}>
            <i />{isSubmitted ? 'Profile live' : 'Draft'}
          </span>
          <Link className={cx('headAvatar')} href="/student/profile" aria-label="Your profile">{profile.initials}</Link>
        </div>
      </header>

      {/* ------------------------------------------------------------- main */}
      <main className={cx('main')}>
        <div className={cx('wrap')}>

          {/* hero */}
          <Reveal className={cx('hero')}>
            <div>
              <span className={cx('eyebrow')} data-i style={{ '--i': 0 } as React.CSSProperties}>
                <i />{isSubmitted ? 'Your profile is live' : 'Candidate profile'}
              </span>
              <h1 data-i style={{ '--i': 1 } as React.CSSProperties}>
                {isSubmitted ? <>You&rsquo;re discoverable, {firstName}.</> : <>Your journey starts here. Finish your profile.</>}
              </h1>
              <p className={cx('heroLede')} data-i style={{ '--i': 2 } as React.CSSProperties}>
                {isSubmitted
                  ? 'Verified universities and banks can now find you and send admission offers, scholarships and pre-approved loans directly.'
                  : 'Complete your profile to unlock pre-approved 24-hour loan offers, direct admission offers and automated matching with verified universities and banks.'}
              </p>
              <div className={cx('heroActions')} data-i style={{ '--i': 3 } as React.CSSProperties}>
                {isSubmitted ? (
                  <Link className={cx('btn', 'dark')} href="/student/review">View your profile <Icon name="arrow-right" size={17} /></Link>
                ) : (
                  <Link className={cx('btn', 'dark')} href={nextRoute}>Complete next step <Icon name="arrow-right" size={17} /></Link>
                )}
                <span className={cx('unlockChip')}>
                  <Icon name="lock" size={14} />
                  {isSubmitted ? 'Bank offers unlocked' : 'Unlocks bank offers at 100%'}
                </span>
              </div>
            </div>

            <div className={cx('heroSide')} data-i style={{ '--i': 4 } as React.CSSProperties}>
              <div className={cx('progress')}>
                <div className={cx('progressTop')}>
                  <span><Icon name="gauge" size={17} /> Profile readiness</span>
                  <strong><AnimatedMetric value={completionPercent} suffix="%" /><small> / 100%</small></strong>
                </div>
                <div className={cx('bar')}>
                  <i style={{ '--p': `${Math.min(100, Math.max(0, completionPercent))}%` } as React.CSSProperties} />
                  <span className={cx('barMark')} style={{ left: '100%' }} />
                </div>
                <div className={cx('progressMeta')}>
                  <span><i />{isSubmitted ? 'Discoverable' : 'Get discovered at 100%'}</span>
                  <span><Icon name="clock" size={14} /> ~{Math.max(1, pending * 3)} min left</span>
                </div>
                <div className={cx('progressFoot')}>
                  <span>{doneCount} of {WIZARD_STEPS.length} sections completed</span>
                  <b>{pending} pending</b>
                </div>
              </div>

              {bankState !== 'declined' && (
                <button type="button" className={cx('promo')} onClick={openLoan}>
                  <div className={cx('promoTop')}>
                    <b><Icon name="bolt" size={16} />{bankState === 'progress' ? 'Your loan application' : 'Get bank offers in 24h'}</b>
                    <span className={cx('promoTag')}>{bankState === 'progress' ? 'IN PROGRESS' : 'PRE-APPROVED'}</span>
                  </div>
                  <p>{bankState === 'progress'
                    ? 'Pick up where you left off — lenders match once your details are in.'
                    : 'Add your details to unlock instant pre-approved lender matching.'}</p>
                  <div className={cx('promoFoot')}>
                    <span><Icon name="check-circle" size={14} /> No credit impact</span>
                    <span className={cx('btn', 'mint', 'sm')}>{bankState === 'progress' ? 'Resume' : 'Unlock now'} <Icon name="arrow-right" size={15} /></span>
                  </div>
                </button>
              )}
            </div>
          </Reveal>

          {/* roadmap */}
          {roadmap.length > 0 && (
            <Reveal>
              <div className={cx('blockHead')}>
                <div>
                  <span className={cx('eyebrow')}>Immediate roadmap</span>
                  <h2>Next critical steps</h2>
                </div>
                <span className={cx('note')}>Each step accelerates institutional discovery</span>
              </div>
              <div className={cx('steps')}>
                {roadmap.map((step, i) => (
                  <div key={step.key} className={cx('step')} data-i style={{ '--i': i } as React.CSSProperties}>
                    <span className={cx('stepNum')}>{step.order}</span>
                    <div className={cx('stepBody')}>
                      <div className={cx('stepTitleRow')}>
                        <h3>{step.title}</h3>
                        {step.unlocksBank && <span className={cx('tag', 'em')}><Icon name="bolt" size={12} /> Unlocks bank offers</span>}
                        {step.priority
                          ? <span className={cx('tag', 'grey')}>High priority</span>
                          : <span className={cx('tag', 'grey')}>Recommended</span>}
                      </div>
                      <p>{step.description}</p>
                    </div>
                    <span className={cx('stepEst')}>{step.est}</span>
                    <Link className={cx('btn', step.priority ? 'dark' : 'ghost', 'sm')} href={step.route}>
                      {step.priority ? 'Begin now' : 'Continue'} <Icon name="arrow-right" size={15} />
                    </Link>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {/* 24-hour bank offers */}
          <Reveal className={cx('bank')}>
            <div className={cx('bankMain')}>
              <span className={cx('bankEyebrow')}><Icon name="bolt" size={13} /> Priority funding corridor</span>
              <div className={cx('bankHead')}>
                <b>24-hour offers</b>
                <span>Pre-approved education loans</span>
              </div>
              <p>
                Complete your financial details to trigger matches with verified partner banks — decisions in 24 hours,
                with no collateral required for eligible profiles.
              </p>
              <div className={cx('bankChips')}>
                <span className={cx('bankChip')}><Icon name="shield-check" size={14} /> No collateral for eligible profiles</span>
                <span className={cx('bankChip')}><Icon name="payments" size={14} /> Competitive rates</span>
                <span className={cx('bankChip')}><Icon name="bolt" size={14} /> Instant in-principle decision</span>
              </div>
            </div>
            <div className={cx('bankSide')}>
              <button type="button" className={cx('btn', 'mint')} onClick={openLoan}>
                {bankState === 'progress' ? 'Resume application' : bankState === 'declined' ? 'Get bank offers' : 'Unlock bank offers'}
                <Icon name="arrow-right" size={17} />
              </button>
              <span className={cx('fine')}>
                <b><Icon name="check-circle" size={13} /> Zero credit-score impact to check</b><br />
                Matched with verified partner banks
              </span>
            </div>
          </Reveal>

          {/* deadlines */}
          <Reveal>
            <div className={cx('blockHead')}>
              <div>
                <span className={cx('eyebrow')}>Upcoming</span>
                <h2>Dates to remember</h2>
              </div>
              {!!upcoming.length && <span className={cx('note')}>Offer response windows</span>}
            </div>
            {upcoming.length ? (
              <div className={cx('dates')}>
                {upcoming.map((d, i) => (
                  <div key={d.id} className={cx('date', d.urgent && 'urgent')} data-i style={{ '--i': i } as React.CSSProperties}>
                    <span className={cx('dateChip')}><small>{d.month}</small><b>{d.day}</b></span>
                    <div className={cx('dateBody')}>
                      <strong>{d.institution}</strong>
                      <small>{d.note}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cx('emptyNote')}>
                <strong>No deadlines yet</strong>
                <small>{isSubmitted
                  ? 'Response dates appear here as offers arrive.'
                  : 'Finish your profile and offer deadlines will show up here.'}</small>
              </div>
            )}
          </Reveal>
        </div>
      </main>

      {/* ------------------------------------------------------ nudge modal */}
      {showNudge && (
        <div className={cx('nudgeBackdrop')} onClick={dismissNudge}>
          <div className={cx('nudgeCard')} onClick={e => e.stopPropagation()}>
            <div className={cx('nudgeHero')}>
              <img src="/students-campus.png" alt="" />
              <button type="button" className={cx('nudgeClose')} onClick={dismissNudge} aria-label="Close"><Icon name="close" size={17} /></button>
              <div className={cx('nudgeRing')} role="img" aria-label={`Profile ${completionPercent}% ready`}>
                <svg viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r={NUDGE_R} className={cx('t')} />
                  <circle cx="32" cy="32" r={NUDGE_R} className={cx('v')} strokeDasharray={NUDGE_LEN}
                    strokeDashoffset={NUDGE_LEN - (NUDGE_LEN * Math.min(100, Math.max(0, completionPercent))) / 100} />
                </svg>
                <strong>{completionPercent}<i>%</i></strong>
              </div>
            </div>
            <div className={cx('nudgeBody')}>
              <span className={cx('k')}>You&rsquo;re on your way 🚀</span>
              <h2>Let&rsquo;s get you discovered, {firstName}!</h2>
              <p>A few minutes now and verified universities and banks can start finding you.</p>
              <div className={cx('nudgeActions')}>
                <Link className={cx('btn', 'dark', 'sm')} href={nextRoute} onClick={dismissNudge}>Continue profile <Icon name="arrow-right" size={15} /></Link>
                <button type="button" className={cx('nudgeSecondary')} onClick={dismissNudge}>Maybe later</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
