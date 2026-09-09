import type { CSSProperties } from 'react';
import { Icon } from '../Icon';
import { Section } from '../primitives';
import { EDITORIAL } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Editorial.module.css';

const cx = classNames(styles);

/** Staccato statement of the promise, one line at a time. */
export function EditorialSection() {
  return (
    <Section spacing="roomy">
      <div className={cx('lines')}>
        {EDITORIAL.lines.map((line, i) => (
          <div
            key={line.text}
            className={cx('line', line.tone, 'isLast' in line && line.isLast && 'last')}
            data-stagger
            style={{ '--i': i } as CSSProperties}
          >
            <b>{line.text}</b>
            <span>
              {line.note}
              {'isLast' in line && line.isLast ? <Icon name="arrow-right" size={16} /> : null}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}
