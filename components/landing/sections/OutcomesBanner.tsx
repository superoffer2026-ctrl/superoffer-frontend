import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { LiveDot, Section } from '../primitives';
import { OUTCOMES } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Outcomes.module.css';

const cx = classNames(styles);

/** Dark emerald banner summarising what arrives once a profile is discoverable. */
export function OutcomesBanner() {
  return (
    <Section id="outcomes" spacing="tight">
      <div className={cx('banner')}>
        <div className={cx('top')}>
          <div>
            <span className={cx('tagline')}>
              <LiveDot />
              {OUTCOMES.tagline}
            </span>
            <h2>
              {OUTCOMES.headline[0]}
              <br />
              <em>{OUTCOMES.headline[1]}</em>
            </h2>
          </div>
          <p>{OUTCOMES.intro}</p>
        </div>

        <div className={cx('grid')}>
          {OUTCOMES.cards.map((card, i) => (
            <article key={card.title} className={cx('card', card.tone)} data-stagger style={{ '--i': i } as CSSProperties}>
              <div>
                <span className={cx('icon')}>
                  <Icon name={card.icon} size={19} />
                </span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
              <div className={cx('foot')}>
                <span>{card.foot}</span>
                <Icon name="arrow-right" size={14} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}
