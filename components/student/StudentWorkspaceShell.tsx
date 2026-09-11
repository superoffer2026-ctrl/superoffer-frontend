'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { BrandMark } from '@/components/landing/BrandMark';
import { Icon, type IconName } from '@/components/landing/Icon';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/student/Shell.module.css';
import { WizardScene } from './wizard/WizardScene';

const cx = classNames(styles);

/** Sidebar navigation — every destination is a real student route. Messages
 *  live inside Applications & Offers (each offer carries its own thread), so
 *  the unread count sits on that item rather than on a page of its own. */
const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: '/student/dashboard', label: 'Dashboard', icon: 'grid' },
  { href: '/student/offers', label: 'Applications & Offers', icon: 'award' },
  { href: '/student/loan-eligibility', label: 'Loan & Funding', icon: 'payments' },
  { href: '/student/profile', label: 'Profile & Documents', icon: 'badge' },
  { href: '/student/saved-universities', label: 'Discover', icon: 'compass' },
  { href: '/student/settings', label: 'Settings', icon: 'sliders' }
];

/** How often the header bell refreshes its unread count. */
const UNREAD_POLL_MS = 15000;

/**
 * The chrome every student page shares: the labeled sidebar, the top header,
 * and the main column the page renders into. One component, so clicking any
 * sidebar item lands on a screen dressed exactly like the dashboard.
 *
 * `layout="page"` gives the content the padded, centred column the dashboard
 * uses. `layout="workspace"` hands over the whole column with no padding, for
 * the viewport-filling pane layouts (offers, messages) that scroll internally.
 *
 * `backdrop="scene"` puts the profile wizard's sky and landmarks behind the
 * page instead of the flat canvas, tinted by `sky`, so the dashboard and the
 * journey it points at read as one world.
 */
export function StudentWorkspaceShell({
  children,
  layout = 'page',
  backdrop = 'canvas',
  sky = ['#e8e6ff', '#e0f2ff', '#ffe9dc']
}: {
  children: ReactNode;
  layout?: 'page' | 'workspace';
  backdrop?: 'canvas' | 'scene';
  sky?: [string, string, string];
}) {
  const profile = useStudentProfile();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const isSubmitted = profile.isSubmitted;

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const token = readAccessToken();
      if (!token) return;
      try {
        const res = await authApi.studentUnreadMessages(token);
        if (!cancelled) setUnread(res?.total || 0);
      } catch {
        /* a failed count must never break the page */
      }
    };
    void refresh();
    const timer = window.setInterval(refresh, UNREAD_POLL_MS);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, []);

  /** Route changes close the mobile drawer. */
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const onSearch = (e: FormEvent) => { e.preventDefault(); setMenuOpen(false); router.push('/student/offers'); };

  const skyStyle = backdrop === 'scene'
    ? ({ '--sky-a': sky[0], '--sky-b': sky[1], '--sky-c': sky[2] } as CSSProperties)
    : undefined;

  return (
    <div className={cx('host', backdrop === 'scene' && 'scene')} style={skyStyle}>
      {backdrop === 'scene' && <div className={cx('sky')} aria-hidden="true"><WizardScene /></div>}
      {/* ---------------------------------------------------------- sidebar */}
      <div className={cx('scrim', menuOpen && 'show')} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen} />
      <aside className={cx('sidebar', menuOpen && 'open')}>
        <Link className={cx('brand')} href="/student/dashboard">
          <span className={cx('brandMark')}><BrandMark size={34} wordmark={false} /></span>
          <span className={cx('brandText')}><b>SuperOffer</b><small>Candidate Portal</small></span>
        </Link>

        <nav className={cx('nav')} aria-label="Student navigation">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={cx('navItem', pathname.startsWith(item.href) && 'active')}
              aria-current={pathname.startsWith(item.href) ? 'page' : undefined}
              aria-label={item.label}
              data-label={item.label}
            >
              <Icon name={item.icon} size={20} />
              <span className={cx('navLabel')}>{item.label}</span>
              {item.href === '/student/offers' && unread > 0 && <span className={cx('navBadge')}>{unread > 99 ? '99+' : unread}</span>}
            </Link>
          ))}
        </nav>

        <div className={cx('sideSpacer')} />

        <Link className={cx('userCard')} href="/student/profile" aria-label="Your profile" title={profile.fullName}>
          <span className={cx('userAvatar')}>
            {profile.initials}
            {isSubmitted && <i><Icon name="check" size={9} /></i>}
          </span>
          <div>
            <b>{profile.fullName}</b>
            <span><i />{isSubmitted ? 'Verified candidate' : 'Draft profile'}</span>
          </div>
          <Icon name="unfold" size={16} />
        </Link>
      </aside>

      {/* ----------------------------------------------------------- header */}
      <header className={cx('header')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className={cx('iconBtn', 'menuBtn')} onClick={() => setMenuOpen(v => !v)} aria-label="Toggle menu">
            <Icon name={menuOpen ? 'close' : 'menu'} size={20} />
          </button>
          <form className={cx('search')} onSubmit={onSearch} role="search">
            <Icon name="search" size={17} />
            <input placeholder="Search offers, institutions…" aria-label="Search" />
          </form>
        </div>
        <div className={cx('headRight')}>
          <Link className={cx('iconBtn')} href="/student/notifications" aria-label="Notifications">
            <Icon name="bell" size={20} />
            {unread > 0 && <span className={cx('dot')} />}
          </Link>
          <span className={cx('statusPill', isSubmitted && 'live')}>
            <i />{isSubmitted ? 'Profile live' : 'Draft'}
          </span>
          <Link className={cx('headAvatar')} href="/student/profile" aria-label="Your profile">{profile.initials}</Link>
        </div>
      </header>

      {/* ------------------------------------------------------------- main */}
      <main className={cx('main', layout === 'workspace' && 'workspace')}>
        <div className={cx('wrap')}>{children}</div>
      </main>
    </div>
  );
}
