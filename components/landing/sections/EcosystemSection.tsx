import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { Section, SectionHead } from '../primitives';
import { ECOSYSTEM } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Ecosystem.module.css';

const cx = classNames(styles);

/** The four kinds of organisation that reach students through SuperOffer. */
export function EcosystemSection() {
  return (
    <Section id="ecosystem">
      <SectionHead
        eyebrow={ECOSYSTEM.eyebrow}
        title={ECOSYSTEM.headline}
        intro={ECOSYSTEM.intro}
        align="center"
        width="wide"
      />

      <div className={cx('grid')}>
        {ECOSYSTEM.pillars.map((pillar, i) => (
          <article key={pillar.title} className={cx('pillar')} data-stagger style={{ '--i': i } as CSSProperties}>
            <div>
              <span className={cx('icon')}>
                <Icon name={pillar.icon} size={22} />
              </span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </div>
            <div className={cx('foot')}>
              <span>{pillar.foot}</span>
              <Icon name="arrow-right" size={14} />
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
