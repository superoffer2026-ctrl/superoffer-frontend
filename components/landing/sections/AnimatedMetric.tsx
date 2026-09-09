'use client';

import { useEffect, useRef, useState } from 'react';

export interface AnimatedMetricProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Counts a metric up the first time it scrolls into view.
 *
 * Kept separate from the shared portal `StatCounter` because the landing page
 * has its own typography and needs a prefix as well as a suffix.
 */
export function AnimatedMetric({ value, prefix = '', suffix = '' }: AnimatedMetricProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const started = performance.now();
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1200, 1);
          setShown(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
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
    <span ref={ref}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
