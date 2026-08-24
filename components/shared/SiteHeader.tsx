'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { classNames } from '@/lib/cx';
import styles from '@/styles/SiteHeader.module.css';

const cx = classNames(styles);

export interface SiteHeaderProps {
  context?: 'student' | 'organization';
}

export function SiteHeader({ context = 'student' }: SiteHeaderProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const active = (href: string) => (pathname?.startsWith(href) ? 'active' : '');

  return (
    <div className={cx('host')}>
      <nav className={cx('nav', scrolled && 'scrolled')} aria-label="Primary navigation">
        <Link className={cx('brand')} href="/" aria-label="SuperOffer home">
          <img src="/superoffer-brand-mark.png" alt="SuperOffer" />
        </Link>
        <div className={cx('links')}>
          <Link href="/students" className={cx(active('/students'))}>Student</Link>
          <Link href="/organization" className={cx(active('/organization'))}>Organizations</Link>
        </div>
        <div className={cx('actions')}>
          <Link className={cx('login')} href={`/auth/login/${context}`}>Log in</Link>
          <Link className={cx('start')} href={`/auth/register/${context}`}>Sign up</Link>
        </div>
        <button
          className={cx('menu')}
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
        </button>
      </nav>
      <div className={cx('drawer', menuOpen && 'open')}>
        <Link href="/students" onClick={() => setMenuOpen(false)}>Student</Link>
        <Link href="/organization" onClick={() => setMenuOpen(false)}>Organizations</Link>
        <Link href={`/auth/login/${context}`} onClick={() => setMenuOpen(false)}>Log in</Link>
        <Link className={cx('start')} href={`/auth/register/${context}`} onClick={() => setMenuOpen(false)}>Sign up</Link>
      </div>
    </div>
  );
}
