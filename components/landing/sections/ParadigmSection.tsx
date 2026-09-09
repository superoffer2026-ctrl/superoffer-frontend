import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { LiveDot, Section, SectionHead } from '../primitives';
import { PARADIGM } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Paradigm.module.css';

const cx = classNames(styles);

/** Side-by-side comparison: students chasing versus opportunities arriving. */
export function ParadigmSection() {
  return (
    <Section id="why">
      <SectionHead
        eyebrow={PARADIGM.eyebrow}
        title={PARADIGM.headline}
        align="center"
        width="wide"
      />

      <div className={cx('grid')}>
        <article className={cx('panel')} data-stagger style={{ '--i': 0 } as CSSProperties}>
          <div>
            <div className={cx('panelTop')}>
              <span className={cx('tag')}>{PARADIGM.old.tag}</span>
              <span className={cx('meta')}>{PARADIGM.old.meta}</span>
            </div>
            <h3>{PARADIGM.old.title}</h3>
            <p>{PARADIGM.old.intro}</p>
            <ul className={cx('items', 'old')}>
              {PARADIGM.old.items.map(item => (
                <li key={item.text}>
                  <i>
                    <Icon name={item.icon} size={17} />
                  </i>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={cx('metric')}>
            <span>{PARADIGM.old.metricLabel}</span>
            <strong>{PARADIGM.old.metricValue}</strong>
          </div>
        </article>

        <article className={cx('panel', 'now')} data-stagger style={{ '--i': 1 } as CSSProperties}>
          <div>
            <div className={cx('panelTop')}>
              <span className={cx('tag', 'on')}>{PARADIGM.next.tag}</span>
              <span className={cx('meta', 'on')}>
                <LiveDot />
                {PARADIGM.next.meta}
              </span>
            </div>
            <h3>{PARADIGM.next.title}</h3>
            <p>{PARADIGM.next.intro}</p>
            <ul className={cx('items', 'next')}>
              {PARADIGM.next.items.map(item => (
                <li key={item.text}>
                  <i>
                    <Icon name={item.icon} size={17} />
                  </i>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={cx('metric', 'on')}>
            <span>{PARADIGM.next.metricLabel}</span>
            <strong>{PARADIGM.next.metricValue}</strong>
          </div>
        </article>
      </div>
    </Section>
  );
}
