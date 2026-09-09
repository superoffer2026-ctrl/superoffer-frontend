import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { Section, SectionHead } from '../primitives';
import { HOW_IT_WORKS } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/HowItWorks.module.css';

const cx = classNames(styles);

type Panel = (typeof HOW_IT_WORKS.steps)[number]['panel'];

/** Small product preview under each step, shaped by the stage it illustrates. */
function StepPanel({ panel }: { panel: Panel }) {
  if (panel.kind === 'progress') {
    return (
      <div className={cx('panel')}>
        <div className={cx('panelHead')}>
          <span>
            <Icon name="shield-check" size={15} />
            {panel.title}
          </span>
        </div>
        <div className={cx('track')}>
          <i />
        </div>
        <div className={cx('panelFoot')}>
          <span>{panel.footLeft}</span>
          <em>{panel.footRight}</em>
        </div>
      </div>
    );
  }

  if (panel.kind === 'matches') {
    return (
      <div className={cx('panel')}>
        <div className={cx('panelHead')}>
          <span>
            <Icon name="eye" size={15} />
            {panel.title}
          </span>
        </div>
        <div className={cx('rows')}>
          {panel.rows.map(row => (
            <div key={row.name}>
              <b>{row.name}</b>
              <em>{row.value}</em>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cx('panel', 'accent')}>
      <div className={cx('panelHead')}>
        <b>{panel.title}</b>
        <span className={cx('chip')}>{panel.badge}</span>
      </div>
      <p>{panel.text}</p>
      <div className={cx('panelFoot')}>
        <span>{panel.footLeft}</span>
        <span className={cx('go')}>
          {panel.footRight}
          <Icon name="arrow-right" size={13} />
        </span>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <Section id="how-it-works">
      <SectionHead eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.headline} intro={HOW_IT_WORKS.intro} />

      <div className={cx('grid')}>
        {HOW_IT_WORKS.steps.map((step, i) => (
          <article key={step.number} className={cx('step')} data-stagger style={{ '--i': i } as CSSProperties}>
            <div>
              <div className={cx('stepTop')}>
                <span className={cx('num')}>{step.number}</span>
                <span className={cx('stage', i === 2 && 'on')}>{step.stage}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
            <StepPanel panel={step.panel} />
          </article>
        ))}
      </div>
    </Section>
  );
}
