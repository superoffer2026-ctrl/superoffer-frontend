import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { Button, LiveDot, Section, SectionHead } from '../primitives';
import { FINANCE } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Finance.module.css';

const cx = classNames(styles);

/**
 * Banks as a first-class side of the marketplace: how a verified profile turns
 * into a pre-approved education loan offer inside 24 hours.
 */
export function FinanceSection() {
  const { offer } = FINANCE;

  return (
    <Section id="finance">
      <SectionHead
        eyebrow={FINANCE.eyebrow}
        title={FINANCE.headline}
        intro={FINANCE.intro}
        width="wide"
        accentLast
      />

      <div className={cx('grid')}>
        <div>
          <ol className={cx('steps')}>
            {FINANCE.steps.map((step, i) => (
              <li
                key={step.title}
                className={cx('step', 'accent' in step && step.accent && 'accent')}
                data-stagger
                style={{ '--i': i } as CSSProperties}
              >
                <span className={cx('time')}>{step.time}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={cx('actions')}>
            <Button href={FINANCE.cta.href} variant="emerald">
              {FINANCE.cta.label}
            </Button>
            <Button href={FINANCE.bankCta.href} variant="outline">
              {FINANCE.bankCta.label}
            </Button>
          </div>
        </div>

        <div className={cx('aside')}>
          <article className={cx('offer')} data-stagger style={{ '--i': 1 } as CSSProperties}>
            <div className={cx('offerTop')}>
              <span className={cx('tag')}>
                <Icon name="check-circle" size={13} />
                {offer.tag}
              </span>
              <span className={cx('speed')}>
                <LiveDot />
                {offer.speed}
              </span>
            </div>

            <div className={cx('bank')}>
              <i>{offer.initials}</i>
              <div>
                <b>{offer.bank}</b>
                <small>Education loan offer</small>
              </div>
              <strong>{offer.amount}</strong>
            </div>

            <div className={cx('rows')}>
              {offer.rows.map(row => (
                <div key={row.label}>
                  <span>{row.label}</span>
                  <b>{row.value}</b>
                </div>
              ))}
            </div>

            <div className={cx('offerAction')}>
              {offer.action}
              <Icon name="arrow-right" size={14} />
            </div>
          </article>

          <div className={cx('highlights')}>
            {FINANCE.highlights.map((item, i) => (
              <div key={item.title} className={cx('highlight')} data-stagger style={{ '--i': i + 2 } as CSSProperties}>
                <span>
                  <Icon name={item.icon} size={17} />
                </span>
                <div>
                  <b>{item.title}</b>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
