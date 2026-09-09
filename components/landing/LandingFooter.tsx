import Link from 'next/link';
import { BrandMark } from './BrandMark';
import { LiveDot } from './primitives';
import { FOOTER } from './content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Footer.module.css';

const cx = classNames(styles);

export function LandingFooter() {
  return (
    <footer className={cx('host')}>
      <div className={cx('inner')}>
        <div className={cx('top')}>
          <Link className={cx('brand')} href="/">
            <BrandMark size={32} gradientId="so-mark-footer" />
            <small>{FOOTER.tagline}</small>
          </Link>
          <span className={cx('status')}>
            <LiveDot />
            {FOOTER.status}
          </span>
        </div>

        <div className={cx('columns')}>
          {FOOTER.columns.map(column => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              <nav>
                {column.links.map(link =>
                  link.href.startsWith('/') ? (
                    <Link key={link.label} href={link.href}>
                      {link.label}
                    </Link>
                  ) : (
                    <a key={link.label} href={link.href}>
                      {link.label}
                    </a>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        <div className={cx('bottom')}>
          <span>{FOOTER.copyright}</span>
          <div>
            <span>
              <LiveDot />
              Secure by default
            </span>
            <span>{FOOTER.locations}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
