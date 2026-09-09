import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Brand.module.css';

const cx = classNames(styles);

export interface BrandMarkProps {
  size?: number;
  /** Set false for the symbol on its own (favicon-style contexts). */
  wordmark?: boolean;
  /** Inverts the wordmark for dark backgrounds. */
  tone?: 'light' | 'dark';
  /** Unique per instance: SVG gradient ids share the document namespace. */
  gradientId?: string;
}

/**
 * SuperOffer identity for the landing page.
 *
 * Drawn inline rather than loaded from `/superoffer-brand-mark.png`: the raster
 * mark is a blue app icon with a baked-in shadow, which clashes with the white
 * and emerald palette. The symbol is a beacon — a student at the centre with
 * signals radiating outward — the same idea the hero visual is built on.
 */
export function BrandMark({ size = 32, wordmark = true, tone = 'light', gradientId = 'so-mark' }: BrandMarkProps) {
  return (
    <span className={cx('brand', tone === 'dark' && 'onDark')}>
      <svg
        className={cx('mark')}
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        role="img"
        aria-label="SuperOffer"
      >
        <defs>
          <linearGradient id={gradientId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#065F46" />
            <stop offset="1" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
        <circle cx="16" cy="21" r="3" fill="#fff" />
        <path d="M10.46 17.8a6.4 6.4 0 0 1 11.08 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        <path
          d="M6.82 15.7a10.6 10.6 0 0 1 18.36 0"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
      {wordmark ? (
        <b className={cx('word')} aria-hidden="true">
          Super<em>Offer</em>
        </b>
      ) : null}
    </span>
  );
}
