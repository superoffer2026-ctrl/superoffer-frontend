import type { CSSProperties } from 'react';
import { Section, SectionHead } from '../primitives';
import { FAQ } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Faq.module.css';

const cx = classNames(styles);

/**
 * Combined questions from the student and organization overviews, plus the
 * finance ones. Built on `<details>` so it stays keyboard- and screen-reader
 * friendly without any client-side state.
 */
export function FaqSection() {
  return (
    <Section id="faq">
      <SectionHead eyebrow={FAQ.eyebrow} title={FAQ.headline} intro={FAQ.intro} align="center" />

      <div className={cx('groups')}>
        {FAQ.groups.map((group, i) => (
          <div key={group.title} className={cx('group')} data-stagger style={{ '--i': i } as CSSProperties}>
            <h3>{group.title}</h3>
            <div className={cx('list')}>
              {group.items.map(item => (
                <details key={item.q} className={cx('item')}>
                  <summary>
                    {item.q}
                    <i aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
