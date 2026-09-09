'use client';

import { useEffect, useState } from 'react';
import { LiveDot } from '../primitives';
import { HERO } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Hero.module.css';

const cx = classNames(styles);

const ITEMS = HERO.activity;
const INTERVAL = 3600;

/** Rotating "an organisation just found you" state above the hero visual. */
export function HeroActivity() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => setIndex(i => (i + 1) % ITEMS.length), INTERVAL);
    return () => clearInterval(id);
  }, []);

  const item = ITEMS[index];

  return (
    <div className={cx('activity')} aria-live="polite">
      <LiveDot />
      {/* Keying on the index restarts the swap animation for each new state. */}
      <span key={index} className={cx('swap')}>
        <b>{item.org}</b> {item.action}
      </span>
    </div>
  );
}
