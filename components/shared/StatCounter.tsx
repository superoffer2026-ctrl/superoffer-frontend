'use client';

import { useEffect, useRef, useState } from 'react';
import { classNames } from '@/lib/cx';
import styles from '@/styles/StatCounter.module.css';

const cx = classNames(styles);

export interface StatCounterProps {
  value: number;
  label: string;
  suffix?: string;
  compact?: boolean;
}

/** Counts up to `value` the first time the element scrolls into view. */
export function StatCounter({ value, label, suffix = '', compact = false }: StatCounterProps) {
  const host = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const animate = () => {
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - started) / 1100, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        animate();
        observer.disconnect();
      },
      { threshold: 0.5 }
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div ref={host} className={cx('host', compact && 'compact')}>
      <strong>{display}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}
