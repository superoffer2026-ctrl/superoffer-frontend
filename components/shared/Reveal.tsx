'use client';

import type { ElementType, ReactNode } from 'react';
import { useRevealOnScroll } from '@/lib/hooks/use-reveal-on-scroll';

export interface RevealProps {
  as?: ElementType;
  className?: string;
  /** Scoped class added once the element scrolls into view (CSS Modules hash it, so the caller supplies it). */
  visibleClassName: string;
  id?: string;
  children: ReactNode;
}

/** Client wrapper replacing the Angular `soReveal` directive, so the page around it can stay a server component. */
export function Reveal({ as: Tag = 'section', className = '', visibleClassName, id, children }: RevealProps) {
  const { ref, visible } = useRevealOnScroll<HTMLElement>();
  return (
    <Tag ref={ref} id={id} className={[className, visible ? visibleClassName : ''].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  );
}
