import type { CSSProperties } from 'react';
import { AnimatedMetric } from './AnimatedMetric';
import { Section, SectionHead } from '../primitives';
import { GLOBAL_REACH } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/GlobalReach.module.css';

const cx = classNames(styles);

/** Abstract corridors between the regions SuperOffer connects. */
const ARCS = ['M 150 140 Q 320 44 480 120 T 780 148', 'M 210 182 Q 420 220 620 110 T 830 122', 'M 380 92 Q 520 30 690 100'];
const NODES: ReadonlyArray<{ x: number; y: number; r: number; pulse?: boolean }> = [
  { x: 150, y: 140, r: 5, pulse: true },
  { x: 280, y: 120, r: 4 },
  { x: 460, y: 95, r: 5.5, pulse: true },
  { x: 500, y: 118, r: 4 },
  { x: 690, y: 168, r: 5.5, pulse: true },
  { x: 780, y: 120, r: 4 },
  { x: 826, y: 214, r: 4 }
];

export function GlobalReachSection() {
  return (
    <Section id="global">
      <SectionHead
        eyebrow={GLOBAL_REACH.eyebrow}
        title={GLOBAL_REACH.headline}
        intro={GLOBAL_REACH.intro}
        align="center"
      />

      <div className={cx('panel')}>
        <div className={cx('map')}>
          <svg viewBox="0 0 900 280" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            {ARCS.map((d, i) => (
              <path
                key={d}
                d={d}
                stroke={i === 1 ? 'rgba(17,17,19,.18)' : 'rgba(4,120,87,.55)'}
                strokeWidth={i === 1 ? 1.1 : 1.4}
                strokeDasharray={i === 1 ? '4 6' : '6 7'}
              />
            ))}
            {NODES.map(node => (
              <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r={node.r} fill="#047857" />
            ))}
            {NODES.filter(node => node.pulse).map(node => (
              <circle
                key={`pulse-${node.x}`}
                className={cx('pulse')}
                cx={node.x}
                cy={node.y}
                r={node.r * 2.6}
                fill="none"
                stroke="#047857"
                strokeWidth="1.4"
              />
            ))}
          </svg>

          {GLOBAL_REACH.hubs.map(hub => (
            <span
              key={hub.label}
              className={cx('hub', hub.primary && 'primary')}
              style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
            >
              {hub.label}
            </span>
          ))}
        </div>

        <div className={cx('metrics')}>
          {GLOBAL_REACH.metrics.map((metric, i) => (
            <div
              key={metric.label}
              className={cx('metric', metric.accent && 'accent')}
              data-stagger
              style={{ '--i': i } as CSSProperties}
            >
              <span>{metric.label}</span>
              <strong>
                <AnimatedMetric
                  value={metric.value}
                  prefix={'prefix' in metric ? metric.prefix : ''}
                  suffix={metric.suffix}
                />
              </strong>
              <small>{metric.caption}</small>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
