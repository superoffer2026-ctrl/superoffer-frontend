'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { classNames } from '@/lib/cx';
import { useProfileSteps } from '@/lib/forms/use-profile-steps';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import { wizardCopyFor } from '@/lib/models/wizard-copy';
import styles from '@/styles/StudentPortalShell.module.css';
import wizardStyles from '@/styles/student/Wizard.module.css';
import { WizardScene } from './wizard/WizardScene';
import { WizardGuide, WizardIllustration } from './wizard/WizardIllustration';

const cx = classNames(styles);
const wz = classNames(wizardStyles);

export function StudentPortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const stepperNav = useRef<HTMLElement>(null);
  const lastScrolledIndex = useRef(-1);

  /** The published sections are the steps; the coded list is only the first paint. */
  const steps = useProfileSteps();
  const fromReview = searchParams.get('from') === 'review';
  const isDashboard = pathname.includes('/student/dashboard');

  const stepIndex = steps.findIndex(step => pathname.includes(`/student/${step.path}`));
  /** Any page outside the wizard steps (dashboard, offers, profile, settings, loan-eligibility,
   *  saved-universities, etc.) uses its own workspace-rail layout, so the step sidebar must stay
   *  hidden there — derive it from the step list itself rather than an allowlist that silently
   *  goes stale whenever a new non-wizard page is added. */
  const isOffers = stepIndex < 0;
  const currentIndex = stepIndex >= 0 ? stepIndex : 0;

  const profile = useStudentProfile();

  /** A step is complete when the server says its section is. */
  const isComplete = (index: number) => {
    const key = steps[index].completionKey;
    return !!key && (profile.completion.sections.find(section => section.key === key)?.done ?? false);
  };

  /** The next unfinished step is always reachable, and so is whichever step is open. */
  const completedCount = steps.filter((_, index) => isComplete(index)).length;
  const furthestIndex = Math.max(Math.min(completedCount, steps.length - 1), currentIndex);

  /** On narrow viewports the stepper scrolls horizontally, so the active step can start off-screen —
   *  keep it in view without fighting manual scroll. */
  useEffect(() => {
    if (isOffers || currentIndex === lastScrolledIndex.current) return;
    const current = stepperNav.current?.querySelector<HTMLElement>('[aria-current="step"]');
    if (current) {
      current.scrollIntoView({ block: 'nearest', inline: 'center' });
      lastScrolledIndex.current = currentIndex;
    }
  });

  /** Once a step has been reached, editing an earlier one must not re-lock it — gate on the
   *  furthest step ever reached, not the current one. */
  const isAccessible = (index: number) => isDashboard || isOffers || index <= furthestIndex;

  /**
   * Non-wizard pages bring their own chrome (StudentWorkspaceShell), so this
   * shell steps aside for them. For a wizard step it draws the whole scene:
   * the sky and landmarks behind, and the card the conversation happens in.
   */
  if (isOffers) {
    return <div className={cx('host')}>{children}</div>;
  }

  const copy = wizardCopyFor(steps[currentIndex]?.path || '');
  const stepTitle = steps[currentIndex]?.title || 'Your profile';
  const skyStyle = { '--sky-a': copy.sky[0], '--sky-b': copy.sky[1], '--sky-c': copy.sky[2] } as CSSProperties;

  return (
    <div className={wz('scene')} style={skyStyle}>
      <div className={wz('sky')} aria-hidden="true"><WizardScene /></div>

      <div className={wz('stage')}>
        <section className={wz('frame')} aria-labelledby="wizard-step-title">
          <header className={wz('frameHead')}>
            <h1 id="wizard-step-title">{stepTitle}</h1>
            <div className={wz('headRight')}>
              <span className={wz('counter')}>{currentIndex + 1}/{steps.length}</span>
              {/*
                * A way out. Every step saves on Continue, so leaving mid-wizard
                * keeps whatever was already saved and loses only the step in
                * progress — the same as closing the tab, but findable.
                */}
              <Link className={wz('exit')} href="/student/dashboard" title="Back to dashboard" aria-label="Exit to dashboard">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </Link>
            </div>
          </header>

          {/* One segment per step: filled once done, bright for the one open now. */}
          <nav className={wz('segments')} ref={stepperNav} aria-label="Profile creation steps">
            {steps.map((item, i) => {
              const accessible = isAccessible(i);
              const complete = isComplete(i);
              const segmentClass = wz('segment', currentIndex === i && 'current', complete && 'complete', !accessible && 'disabled');
              return accessible ? (
                <Link
                  key={item.path}
                  className={segmentClass}
                  href={`/student/${item.path}${fromReview ? '?from=review' : ''}`}
                  aria-current={currentIndex === i ? 'step' : undefined}
                  title={item.title}
                  aria-label={item.title}
                />
              ) : (
                <span key={item.path} className={segmentClass} title={item.title} aria-label={item.title} />
              );
            })}
          </nav>

          <div className={wz('ask')}>
            <span className={wz('guide')}><WizardGuide /></span>
            <div className={wz('bubble')}>
              <p className={wz('question')}>{copy.question}</p>
              <p className={wz('lede')}>{copy.lede}</p>
            </div>
          </div>

          <div className={wz('body', pathname === '/student/review' && 'is-review')}>
            {pathname !== '/student/review' && (
              <aside className={wz('side')}>
                <div className={wz('picture')}><WizardIllustration name={copy.illustration} /></div>
              </aside>
            )}
            <main className={wz('form')}>{children}</main>
          </div>
        </section>
      </div>
    </div>
  );
}
