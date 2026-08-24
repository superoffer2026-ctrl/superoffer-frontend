'use client';

import { classNames } from '@/lib/cx';
import type { JourneyStage } from '@/lib/stores/offer-wallet.store';
import styles from '@/styles/OfferJourneyTracker.module.css';

const cx = classNames(styles);

const STAGE_ORDER: JourneyStage[] = ['Received', 'Viewed', 'Compared', 'Shortlisted', 'Accepted'];

export function OfferJourneyTracker({ stage, compact = false }: { stage: JourneyStage; compact?: boolean }) {
  const isTerminal = stage === 'Accepted' || stage === 'Declined';

  const steps = stage === 'Declined'
    ? ['Received', 'Viewed', 'Compared', 'Shortlisted', 'Declined']
    : STAGE_ORDER;

  const activeIndex = (() => {
    if (isTerminal) return steps.length - 1;
    const index = STAGE_ORDER.indexOf(stage);
    return index === -1 ? 0 : index;
  })();

  const dotContent = (index: number): string => {
    if (index < activeIndex) return '✓';
    if (index === activeIndex && isTerminal) return stage === 'Declined' ? '✕' : '✓';
    return String(index + 1);
  };

  return (
    <div className={cx('host')}>
      <div className={cx('otrack-stepper', compact && 'otrack-compact')}>
        {steps.map((step, i) => (
          <div
            key={step}
            className={cx(
              'otrack-step',
              i < activeIndex && 'done',
              i === activeIndex && !isTerminal && 'current',
              i === activeIndex && stage === 'Declined' && 'otrack-declined-dot',
              i === activeIndex && stage === 'Accepted' && 'otrack-accepted-dot'
            )}
          >
            <span className={cx('otrack-dot')}>{dotContent(i)}</span>
            {!compact && <small>{step}</small>}
          </div>
        ))}
      </div>
    </div>
  );
}
