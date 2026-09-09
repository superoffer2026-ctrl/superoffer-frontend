import type { CSSProperties } from 'react';
import { DeskFilters } from './DeskFilters';
import { Icon } from '../Icon';
import { Button, CapabilityStrip, Section, SectionHead } from '../primitives';
import { INSTITUTION_DESK } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/InstitutionDesk.module.css';

const cx = classNames(styles);

/** The other side of the marketplace: how organisations find and reach students. */
export function InstitutionDeskSection() {
  return (
    <Section id="for-organizations">
      <SectionHead
        eyebrow={INSTITUTION_DESK.eyebrow}
        title={INSTITUTION_DESK.headline}
        intro={INSTITUTION_DESK.intro}
        width="wide"
      />

      <div className={cx('console')}>
        <DeskFilters />

        <div className={cx('rows')}>
          {INSTITUTION_DESK.candidates.map((candidate, i) => (
            <div key={candidate.ref} className={cx('row')} data-stagger style={{ '--i': i } as CSSProperties}>
              <div className={cx('who')}>
                <span className={cx('mono', candidate.tone === 'ink' && 'ink')}>{candidate.initials}</span>
                <div>
                  <div className={cx('ref')}>
                    <b>{candidate.ref}</b>
                    <span>{candidate.match}</span>
                  </div>
                  <p>{candidate.detail}</p>
                </div>
              </div>
              <div className={cx('act')}>
                <div>
                  <span>{candidate.metaLabel}</span>
                  <b>{candidate.metaValue}</b>
                </div>
                <Button
                  href={INSTITUTION_DESK.cta.href}
                  variant={candidate.action.primary ? 'emerald' : 'outline'}
                  size="small"
                >
                  {candidate.action.label}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className={cx('ribbon')}>
          <div>
            <Icon name="trending-up" size={19} />
            <b>{INSTITUTION_DESK.ribbon.text}</b>
          </div>
          <span>{INSTITUTION_DESK.ribbon.note}</span>
        </div>
      </div>

      <CapabilityStrip items={INSTITUTION_DESK.capabilities} />

      <div className={cx('cta')}>
        <Button href={INSTITUTION_DESK.cta.href} variant="dark">
          {INSTITUTION_DESK.cta.label}
        </Button>
      </div>
    </Section>
  );
}
