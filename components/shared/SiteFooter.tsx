import Link from 'next/link';
import { classNames } from '@/lib/cx';
import styles from '@/styles/SiteFooter.module.css';

const cx = classNames(styles);

export function SiteFooter() {
  return (
    <div className={cx('host')}>
      <footer>
        <div className={cx('top')}>
          <div className={cx('about')}>
            <Link className={cx('brand')} href="/">
              <img src="/superoffer-brand-mark.png" alt="" />
              <span>SuperOffer</span>
            </Link>
            <p>One verified profile connecting students with the right universities, education finance and trusted guidance.</p>
            <span className={cx('status')}><i></i> Building a better education marketplace</span>
          </div>
          <div>
            <h4>Explore</h4>
            <nav>
              <Link href="/students">For students</Link>
              <Link href="/organization">For organizations</Link>
            </nav>
          </div>
          <div>
            <h4>Company</h4>
            <nav>
              <Link href="/">About SuperOffer</Link>
              <a href="mailto:hello@superoffer.net">Contact us</a>
              <a href="mailto:partners@superoffer.net">Partner with us</a>
              <Link href="/auth/login/student">Log in</Link>
            </nav>
          </div>
          <div>
            <h4>Get started</h4>
            <nav>
              <Link href="/auth/register/student">Create student profile</Link>
              <Link href="/organization/signup">Join as an organization</Link>
            </nav>
          </div>
        </div>
        <div className={cx('bottom')}>
          <span>© 2026 SuperOffer. All rights reserved.</span>
          <div>
            <a href="mailto:support@superoffer.net">Support</a>
            <Link href="/">Privacy</Link>
            <Link href="/">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
