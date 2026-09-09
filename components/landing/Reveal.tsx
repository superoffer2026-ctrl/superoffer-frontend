'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useRevealOnScroll } from '@/lib/hooks/use-reveal-on-scroll';

export interface RevealProps {
  as?: ElementType;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * Marks an element as a scroll-reveal root.
 *
 * The animation itself lives in `styles/landing/Landing.module.css` and keys off
 * `[data-reveal]` / `[data-visible]`, so section modules stay free of duplicated
 * transition rules and any `[data-stagger]` descendant animates in sequence once
 * its section becomes visible.
 */
export function Reveal({ as: Tag = 'div', className, id, style, children }: RevealProps) {
  const { ref, visible } = useRevealOnScroll<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={className} style={style} data-reveal data-visible={visible ? 'true' : 'false'}>
      {children}
    </Tag>
  );
}
