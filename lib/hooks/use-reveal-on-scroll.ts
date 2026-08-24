'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Port of the Angular `soReveal` directive. Returns a ref to attach to the
 * element and a `visible` flag; the caller applies its own scoped `so-reveal`
 * / `is-visible` classes, because those rules live in a CSS Module.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
