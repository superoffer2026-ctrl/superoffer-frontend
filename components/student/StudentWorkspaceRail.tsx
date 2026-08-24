'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/cx';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { readAccessToken } from '@/lib/storage';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudentWorkspaceRail.module.css';

const cx = classNames(styles);

/** How often the rail refreshes its unread count. */
const POLL_MS = 15000;

const LINKS = [
  {
    href: '/student/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    href: '/student/offers',
    label: 'Offers',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    )
  },
  {
    href: '/student/messages',
    label: 'Messages',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    )
  },
  {
    href: '/student/profile',
    label: 'Profile',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  },
  {
    href: '/student/settings',
    label: 'Settings',
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  }
];

export function StudentWorkspaceRail() {
  const profile = useStudentProfile();
  const pathname = usePathname() || '';
  const [unread, setUnread] = useState(0);

  /**
   * Polled rather than pushed: an interval is cheap, needs no extra
   * infrastructure, and a badge is not worth a socket.
   */
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const token = readAccessToken();
      if (!token) return;
      try {
        const response = await authApi.studentUnreadMessages(token);
        if (!cancelled) setUnread(response?.total || 0);
      } catch {
        /* A failed count must never break the navigation. */
      }
    };

    void refresh();
    const timer = window.setInterval(refresh, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [pathname]);

  return (
    <div className={cx('host')}>
      <nav className={cx('workspace-rail')} aria-label="Student workspace navigation">
        <img className={cx('workspace-logo')} src="/superoffer-brand-mark.png" alt="SuperOffer" />
        <div className={cx('workspace-links')}>
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cx(pathname.startsWith(link.href) && 'active')}
              title={link.label}
              aria-label={link.label}
            >
              <span>
                {link.icon}
                {link.href === '/student/messages' && unread > 0 && (
                  <i className={cx('rail-unread')} aria-label={`${unread} unread messages`}>{unread}</i>
                )}
              </span>
              <small>{link.label}</small>
            </Link>
          ))}
        </div>
        <Link className={cx('workspace-avatar')} href="/student/profile" aria-label="Open complete student profile">
          <span>{profile.initials}</span>
        </Link>
      </nav>
    </div>
  );
}
