'use client';

import { useState } from 'react';
import { Icon } from '../Icon';
import { INSTITUTION_DESK } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/InstitutionDesk.module.css';

const cx = classNames(styles);

/** Toggleable search filters, so the console reads as a live product surface. */
export function DeskFilters() {
  const [active, setActive] = useState<string[]>([INSTITUTION_DESK.filters[0]]);

  const toggle = (filter: string) =>
    setActive(current => (current.includes(filter) ? current.filter(f => f !== filter) : [...current, filter]));

  return (
    <div className={cx('bar')}>
      <div className={cx('filters')}>
        <Icon name="filter" size={17} />
        <span>{INSTITUTION_DESK.filterLabel}</span>
        {INSTITUTION_DESK.filters.map(filter => (
          <button
            key={filter}
            type="button"
            aria-pressed={active.includes(filter)}
            className={cx('chip', active.includes(filter) && 'on')}
            onClick={() => toggle(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <span className={cx('search')}>
        <Icon name="eye" size={16} />
        {INSTITUTION_DESK.searchPlaceholder}
      </span>
    </div>
  );
}
