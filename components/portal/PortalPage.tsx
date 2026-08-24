'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { clearAccessToken, readAccessToken } from '@/lib/storage';

const CARDS = [
  { icon: '⌕', title: 'Student discovery', text: 'Find students with genuine study-abroad intent.' },
  { icon: '▤', title: 'Pipeline', text: 'Track engagement opportunities.' },
  { icon: '↗', title: 'Engagements', text: 'Guide accepted students.' }
];

/** Generic workspace shell for portals that don't have a dedicated one yet.
 *  Student and organization are redirected to their real workspaces. */
export function PortalPage({ portal }: { portal: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [cards, setCards] = useState<typeof CARDS>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (portal === 'student') {
        router.replace('/student/dashboard');
        return;
      }
      if (portal === 'organization') {
        router.replace('/organization/dashboard');
        return;
      }

      const token = readAccessToken();
      if (!token) {
        router.push(`/auth/login/${portal}`);
        return;
      }
      try {
        const current = await authApi.currentUser(token);
        if (cancelled) return;
        setUser(current);
        setCards(CARDS);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Could not load portal data.');
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [portal, router]);

  const logout = async () => {
    const token = readAccessToken();
    if (token) await authApi.logout(token).catch(() => {});
    clearAccessToken();
    router.push('/');
  };

  return (
    <main className="workspace">
      <aside>
        <Link className="brand light-brand" href="/"><span>S</span>SuperOffer</Link>
        <nav>
          <a className="active">Overview</a>
          <a>Profile</a>
          <a>Activity</a>
          <a>Reports</a>
          <a>Settings</a>
        </nav>
        <button onClick={() => void logout()}>Sign out</button>
      </aside>
      <section>
        <header>
          <div>
            <span className="eyebrow">{portal} portal</span>
            <h1>Welcome{user?.full_name ? `, ${user.full_name}` : ''}.</h1>
          </div>
          <span className="account-pill">Account active</span>
        </header>
        {error && <p className="form-message error">{error}</p>}
        <div className="workspace-banner">
          <div>
            <small>AUTHENTICATION MODULE</small>
            <h2>Your secure {portal} portal is connected.</h2>
            <p>
              Registration, role validation, login, and portal routing are working. Detailed portal tools will be
              developed module by module.
            </p>
          </div>
          <b>✓</b>
        </div>
        <div className="workspace-cards">
          {cards.map(item => (
            <article key={item.title}>
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
