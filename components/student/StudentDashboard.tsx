'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Icon } from '@/components/landing/Icon';
import { Reveal } from '@/components/landing/Reveal';
import { classNames } from '@/lib/cx';
import { STUDENT_PROFILE_STEPS } from '@/lib/models/student-portal';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { useStore } from '@/lib/stores/observable-store';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/student/Dashboard.module.css';

const cx = classNames(styles);

const WIZARD_STEPS = STUDENT_PROFILE_STEPS.filter(step => step.completionKey).slice(0, 4); // Show top 4 steps for layout

export function StudentDashboard() {
  const profile = useStudentProfile();
  const walletStore = useStore(offerWalletStore);
  const router = useRouter();

  const isSubmitted = profile.isSubmitted;
  const { completionPercent, sections } = profile.completion;
  const firstName = profile.fullName.split(/\s+/)[0] || 'Student';

  useEffect(() => {
    void walletStore.load();
  }, [walletStore]);

  const doneOf = (key: string) => sections.find(s => s.key === key)?.done ?? false;
  const doneCount = WIZARD_STEPS.filter(s => doneOf(s.completionKey as string)).length;

  const roadmap = WIZARD_STEPS
    .filter(step => !doneOf(step.completionKey as string))
    .map(step => ({ route: `/student/${step.path}` }));
  const nextRoute = roadmap[0]?.route || '/student/personal-information';
  
  const circumference = 2 * Math.PI * 28;
  const dashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <StudentWorkspaceShell backdrop="canvas" frame="bare">
      <div className={cx('content')}>
        
        {/* Soft Premium Header */}
        <Reveal className={cx('header')}>
          <div className={cx('headerBg')} />
          <div className={cx('headerContent')}>
            <h1 className={cx('greeting')}>Welcome back, <span>{firstName}</span> ✌️</h1>
            <p className={cx('subtitle')}>
              {completionPercent < 100 
                ? `You are ${100 - completionPercent}% away from unlocking top university matches.` 
                : 'Your profile is ready. Universities are reviewing your details.'}
            </p>
            <div className={cx('headerActions')}>
              {!isSubmitted && (
                <Link className={cx('btn', 'em')} href={nextRoute}>
                  Complete Profile <Icon name="arrow-right" size={18} />
                </Link>
              )}
              <Link className={cx('btn', 'outline')} href="/student/offers">
                View Wallet ({walletStore.totalCount})
              </Link>
            </div>
          </div>
          <img src="/dashboard/hero-bg-teal.jpg" className={cx('illustration')} style={{ clipPath: 'circle(40% at 50% 50%)' }} alt="Student" />
        </Reveal>

        {/* Bento Box Grid */}
        <Reveal className={cx('bentoGrid')}>
          
          {/* Card 1: Profile Journey (8 cols) */}
          <div className={cx('bentoCard', 'cardProfile')}>
            <div className={cx('cardHeader')}>
              <h3><Icon name="badge" size={24} color="#0d9488" /> Your Profile Journey</h3>
              <div className={cx('progressRing')}>
                <svg viewBox="0 0 64 64">
                  <circle className={cx('bg')} cx="32" cy="32" r="28" />
                  <circle className={cx('fg')} cx="32" cy="32" r="28" style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset }} />
                </svg>
                <span>{completionPercent}%</span>
              </div>
            </div>
            
            <div className={cx('journeySteps')}>
              {WIZARD_STEPS.map((step, idx) => {
                const isDone = doneOf(step.completionKey as string);
                const isNext = !isDone && (idx === 0 || doneOf(WIZARD_STEPS[idx - 1].completionKey as string));
                const stateClass = isDone ? 'done' : isNext ? 'next' : 'pending';
                
                return (
                  <Link key={step.path} href={`/student/${step.path}`} style={{ textDecoration: 'none' }} className={cx('stepBox', stateClass)}>
                    <div>
                      <div className={cx('stepIcon')}>
                        <Icon name={isDone ? 'check-circle' : step.icon as any} size={20} />
                      </div>
                      <h4>{step.title}</h4>
                      <p>{isDone ? 'Completed' : isNext ? 'Up next' : 'Pending'}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
            {!isSubmitted && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link href={nextRoute} className={cx('btn', 'em')} style={{ height: 40, padding: '0 20px' }}>
                  Continue <Icon name="arrow-right" size={16} />
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Recent Offers (4 cols, tall) */}
          <div className={cx('bentoCard', 'cardOffers')}>
            <div className={cx('cardHeader')}>
              <h3><Icon name="mail" size={22} color="#0f172a" /> Inbox</h3>
              <Link href="/student/offers" style={{ fontSize: 13, color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>View all</Link>
            </div>
            <div className={cx('cardBody')}>
              {walletStore.offers.length > 0 ? (
                walletStore.offers.slice(0, 4).map(offer => (
                  <Link key={offer.id} href={`/student/offers/${offer.id}`} className={cx('offerItem')}>
                    <img src={offer.snapshot?.university?.logoUrl || '/icon.png'} className={cx('offerLogo')} alt="Logo" />
                    <div className={cx('offerText')}>
                      <h4>{offer.snapshot?.university?.name || 'SuperOffer'}</h4>
                      <p>{offer.snapshot?.program?.name || offer.category}</p>
                    </div>
                    <span className={cx('offerBadge', offer.viewed ? 'viewed' : 'new')}>
                      {walletStore.stage(offer)}
                    </span>
                  </Link>
                ))
              ) : (
                <div className={cx('emptyOffers')}>
                  <Icon name="mail-out" size={48} />
                  <p>No offers yet. Complete your profile to get matched!</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Finance Banner (8 cols) */}
          <div className={cx('bentoCard', 'cardFinance')}>
            <div className={cx('financeLeft')}>
              <h3>Bank Loans in 24 Hours</h3>
              <p>Get pre-approved instantly. Focus on your dreams, we handle the funds.</p>
              <Link href="/student/loan-eligibility" className={cx('btn')} style={{ background: 'white', color: '#0f172a' }}>
                Check Eligibility
              </Link>
            </div>
            <div className={cx('financeIcon')}>
              <Icon name="bank" size={100} />
            </div>
          </div>

        </Reveal>
      </div>
    </StudentWorkspaceShell>
  );
}
