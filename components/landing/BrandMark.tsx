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
      <img 
        src="/superoffer-brand-mark.png" 
        alt="SuperOffer" 
        width={size} 
        height={size} 
        style={{ display: 'block' }} 
      />
      {wordmark ? (
        <b className={cx('word')} aria-hidden="true">
          Super<em>Offer</em>
        </b>
      ) : null}
    </span>
  );
}
