'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BrandMark } from './BrandMark';
import { Icon } from './Icon';
import { Button } from './primitives';
import { NAV } from './content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Header.module.css';

const cx = classNames(styles);

/** Right-hand actions swap with the audience the visitor selects. */
const ACTIONS = {
  student: {
    secondary: { label: 'Institution Login', href: '/auth/login/organization' },
    cta: { label: 'Create Profile', href: '/auth/register/student' }
  },
  organization: {
    secondary: { label: 'Student Login', href: '/auth/login/student' },
    cta: { label: 'Join as Organization', href: '/auth/register/organization' }
  }
} as const;

type Audience = keyof typeof ACTIONS;

export function LandingHeader() {
  const [audience, setAudience] = useState<Audience>('student');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const actions = ACTIONS[audience];

  return (
    <header className={cx('host', scrolled && 'scrolled')}>
      <div className={cx('bar')}>
        <Link className={cx('brand')} href="/" aria-label="SuperOffer home">
          <BrandMark size={31} gradientId="so-mark-nav" />
        </Link>

        <div className={cx('toggle')} role="tablist" aria-label="Choose your audience">
          <span className={cx('indicator', audience === 'organization' && 'right')} aria-hidden="true" />
          {NAV.audiences.map(item => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={audience === item.key}
              className={cx(audience === item.key && 'on')}
              onClick={() => setAudience(item.key as Audience)}
            >
              <i aria-hidden="true" />
              {item.label}
            </button>
          ))}
        </div>

        <div className={cx('actions')}>
          <Link className={cx('ghost')} href={actions.secondary.href}>
            {actions.secondary.label}
          </Link>
          <span className={cx('headerCta')}>
            <Button href={actions.cta.href} variant="dark" size="small">
              {actions.cta.label}
            </Button>
          </span>
          <button
            type="button"
            className={cx('burger')}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setMenuOpen(open => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
        </div>
      </div>

      <div className={cx('drawer', menuOpen && 'open')}>
        {NAV.links.map(item => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
        <Link href={actions.secondary.href} onClick={() => setMenuOpen(false)}>
          {actions.secondary.label}
        </Link>
        <span className={cx('drawerCta')} onClick={() => setMenuOpen(false)}>
          <Button href={actions.cta.href} variant="dark" block>
            {actions.cta.label}
          </Button>
        </span>
      </div>
    </header>
  );
}
