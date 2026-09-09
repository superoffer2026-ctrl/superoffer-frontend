import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { Reveal } from './Reveal';
import { classNames } from '@/lib/cx';
import shared from '@/styles/landing/Landing.module.css';

const cx = classNames(shared);

/* ------------------------------------------------------------------ layout */

export interface SectionProps {
  id?: string;
  /** Extra classes from the section's own CSS Module. */
  className?: string;
  spacing?: 'tight' | 'default' | 'roomy';
  /** Set false for sections that manage their own reveal timing (e.g. the hero). */
  reveal?: boolean;
  /** Set false when the section paints edge-to-edge and shells its own content. */
  shell?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

export function Section({
  id,
  className,
  spacing = 'default',
  reveal = true,
  shell = true,
  style,
  children
}: SectionProps) {
  const body = shell ? <div className={cx('shell')}>{children}</div> : children;
  const classes = cx('section', spacing === 'tight' && 'tight', spacing === 'roomy' && 'roomy', className);

  if (!reveal) {
    return (
      <section id={id} className={classes} style={style}>
        {body}
      </section>
    );
  }
  return (
    <Reveal as="section" id={id} className={classes} style={style}>
      {body}
    </Reveal>
  );
}

/** Constrained content row, for sections that opt out of `Section`'s shell. */
export function Shell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('shell', className)}>{children}</div>;
}

/* ---------------------------------------------------------------- heading */

export interface SectionHeadProps {
  eyebrow?: string;
  /** A string, or an array rendered as separate lines. */
  title: ReactNode | readonly string[];
  intro?: string;
  /** Renders the last line of a multi-line title in the emerald accent. */
  accentLast?: boolean;
  align?: 'start' | 'center';
  width?: 'default' | 'wide';
  className?: string;
  children?: ReactNode;
}

export function SectionHead({
  eyebrow,
  title,
  intro,
  accentLast = false,
  align = 'start',
  width = 'default',
  className,
  children
}: SectionHeadProps) {
  return (
    <div className={cx('head', align === 'center' && 'centered', width === 'wide' && 'wide', className)}>
      {eyebrow ? <span className={cx('eyebrow')}>{eyebrow}</span> : null}
      <h2>
        {Array.isArray(title) ? (
          <Lines lines={title as readonly string[]} accentLast={accentLast} />
        ) : (
          (title as ReactNode)
        )}
      </h2>
      {intro ? <p>{intro}</p> : null}
      {children}
    </div>
  );
}

/** Renders an array of strings as `<br>`-separated lines, last line optionally accented. */
export function Lines({ lines, accentLast = false }: { lines: readonly string[]; accentLast?: boolean }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={line}>
          {accentLast && i === lines.length - 1 ? <em>{line}</em> : line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

/* ---------------------------------------------------------------- actions */

export interface ButtonProps {
  href: string;
  variant?: 'dark' | 'emerald' | 'outline' | 'glass';
  size?: 'default' | 'small';
  block?: boolean;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

export function Button({
  href,
  variant = 'dark',
  size = 'default',
  block = false,
  arrow = true,
  className,
  children
}: ButtonProps) {
  const classes = cx('btn', variant, size === 'small' && 'small', block && 'block', className);
  const body = (
    <>
      <span>{children}</span>
      {arrow ? <Icon name="arrow-right" size={16} /> : null}
    </>
  );
  return href.startsWith('/') ? (
    <Link className={classes} href={href}>
      {body}
    </Link>
  ) : (
    <a className={classes} href={href}>
      {body}
    </a>
  );
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const body = (
    <>
      <span>{children}</span>
      <Icon name="arrow-right" size={15} />
    </>
  );
  return href.startsWith('/') ? (
    <Link className={cx('textLink')} href={href}>
      {body}
    </Link>
  ) : (
    <a className={cx('textLink')} href={href}>
      {body}
    </a>
  );
}

/* ------------------------------------------------------- capability strip */

export interface CapabilityItem {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
}

/**
 * Closes a section with three short capability notes.
 *
 * Used at the foot of the student and organisation sections so each side's key
 * features are stated without breaking the page into separate audience blocks.
 */
export function CapabilityStrip({ items }: { items: readonly CapabilityItem[] }) {
  return (
    <div className={cx('strip')}>
      {items.map((item, i) => (
        <div key={item.title} data-stagger style={{ '--i': i } as CSSProperties}>
          <i>
            <Icon name={item.icon} size={17} />
          </i>
          <div>
            <b>{item.title}</b>
            <p>{item.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ chips */

export function Pill({
  tone = 'emerald',
  dot = false,
  className,
  children
}: {
  tone?: 'emerald' | 'neutral' | 'dark';
  dot?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={cx('pill', tone !== 'emerald' && tone, className)}>
      {dot ? <LiveDot /> : null}
      {children}
    </span>
  );
}

/** Emerald status dot with a soft outward ping. */
export function LiveDot({ className }: { className?: string }) {
  return <i className={cx('dot', className)} aria-hidden="true" />;
}
