'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { classNames } from '@/lib/cx';
import { useProfileSteps } from '@/lib/forms/use-profile-steps';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudentPortalShell.module.css';

const cx = classNames(styles);

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
    const current = stepperNav.current?.querySelector<HTMLElement>(`.${styles['stepper-node']}.${styles.current}`);
    if (current) {
      current.scrollIntoView({ block: 'nearest', inline: 'center' });
      lastScrolledIndex.current = currentIndex;
    }
  });

  /** Once a step has been reached, editing an earlier one must not re-lock it — gate on the
   *  furthest step ever reached, not the current one. */
  const isAccessible = (index: number) => isDashboard || isOffers || index <= furthestIndex;

  return (
    <div className={cx('host')}>
      <div className={cx('student-portal', isOffers && 'offers-mode')}>
        {!isOffers && (
          <>
            <header className={cx('wizard-header')}>
              <Link className={cx('portal-brand')} href="/student/personal-information">
                <img src="/superoffer-brand-mark.png" alt="SuperOffer" />
                <strong>SuperOffer</strong>
              </Link>
            </header>

            <nav className={cx('wizard-stepper')} ref={stepperNav} aria-label="Profile creation steps">
              {steps.map((item, i) => {
                const accessible = isAccessible(i);
                const complete = isComplete(i);
                const nodeClass = cx(
                  'stepper-node',
                  currentIndex === i && 'current',
                  complete && 'complete',
                  !accessible && 'disabled'
                );
                const dot = <span className={cx('stepper-dot')}>{complete ? '✓' : i + 1}</span>;
                const label = <span className={cx('stepper-label')}>{item.title}</span>;

                return (
                  <span key={item.path} style={{ display: 'contents' }}>
                    {accessible ? (
                      <Link
                        className={nodeClass}
                        href={`/student/${item.path}${fromReview ? '?from=review' : ''}`}
                        aria-current={currentIndex === i ? 'step' : undefined}
                        title={item.title}
                      >
                        {dot}
                        {label}
                      </Link>
                    ) : (
                      <a className={nodeClass} aria-disabled="true" title={item.title} onClick={event => event.preventDefault()}>
                        {dot}
                        {label}
                      </a>
                    )}
                    {i < steps.length - 1 && <span className={cx('stepper-line', complete && 'filled')}></span>}
                  </span>
                );
              })}
            </nav>
          </>
        )}

        <main className={cx('student-content')}>{children}</main>
      </div>
    </div>
  );
}
