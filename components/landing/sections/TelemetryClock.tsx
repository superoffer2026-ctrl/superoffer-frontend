'use client';

import { useEffect, useState } from 'react';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Dossier.module.css';

const cx = classNames(styles);

/** Honest "last updated" stamp: counts real minutes since the panel mounted. */
export function TelemetryClock() {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setMinutes(m => m + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={cx('clock')}>
      {minutes === 0 ? 'Updated just now' : `Updated ${minutes}m ago`}
    </span>
  );
}
