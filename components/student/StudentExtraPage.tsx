'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { readAccessToken } from '@/lib/storage';
import { offerWalletStore } from '@/lib/stores/offer-wallet.store';
import { useStore } from '@/lib/stores/observable-store';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import { useRouter } from 'next/navigation';
import styles from '@/styles/StudentExtraPage.module.css';
import { CoApplicantPanel } from './CoApplicantPanel';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';

const cx = classNames(styles);

export type ExtraPageKey = 'saved-universities' | 'scholarships' | 'loan-eligibility' | 'notifications';

const TITLES: Record<ExtraPageKey, string> = {
  'saved-universities': 'Saved universities',
  scholarships: 'Scholarships',
  'loan-eligibility': 'Loan eligibility',
  notifications: 'Notifications'
};

const DESCRIPTIONS: Record<ExtraPageKey, string> = {
  'saved-universities': 'Compare universities you want to revisit.',
  scholarships: 'Explore awards matched to your profile and goals.',
  'loan-eligibility': 'Get matched with verified banks for an education loan.',
  notifications: 'Stay on top of offers, documents, and deadlines.'
};

interface Notification {
  id: string;
  icon: string;
  title: string;
  detail: string;
  occurredAt: string;
  read: boolean;
}

const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
};

/** Each destination gets its own sky, so the rail's pages feel like different places. */
const SKY: Record<ExtraPageKey, [string, string, string]> = {
  'loan-eligibility': ['#e2fbef', '#e4efff', '#f3e8ff'],
  'saved-universities': ['#fde7c8', '#e6e3ff', '#cfeeff'],
  scholarships: ['#fbe7ff', '#e3ecff', '#ffefd8'],
  notifications: ['#e6ecff', '#f1e8ff', '#ffe9ec']
};

export function StudentExtraPage({ page }: { page: ExtraPageKey }) {
  const profile = useStudentProfile();
  const router = useRouter();
  const wallet = useStore(offerWalletStore);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All destinations');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { needsLoan } = profile.completion.loanDocuments;
  const wantsLoan: boolean | null = needsLoan === 'yes' ? true : needsLoan === 'no' ? false : null;

  const loadNotifications = useCallback(async () => {
    const token = readAccessToken();
    if (!token) return;
    const response = await authApi.studentNotifications(token);
    setNotifications((response?.notifications || []) as Notification[]);
  }, []);

  useEffect(() => {
    if (page === 'saved-universities' || page === 'scholarships') void wallet.load();
    if (page === 'notifications') void loadNotifications();
  }, [page, wallet, loadNotifications]);

  /** Both answers live in the profile's financial section — the same place the
   *  Financial Information step writes them, so there is one copy of each. */
  const writeFinancial = async (payload: Record<string, unknown>) => {
    const token = readAccessToken();
    if (!token) return;
    await authApi.saveStudentFinancial(token, payload);
    await profile.refresh();
  };

  const chooseWantsLoan = async (value: boolean) => {
    await writeFinancial({ needsLoan: value ? 'yes' : 'no' });
    if (value) router.push('/student/co-applicant');
  };

  const title = TITLES[page] || 'Student workspace';
  const description = DESCRIPTIONS[page] || '';
  const actionRoute = page === 'saved-universities' ? '/student/offers' : page === 'scholarships' ? '/student/study-preferences' : '';
  const actionLabel = page === 'saved-universities' ? 'Explore offers' : 'Update preferences';

  const isCardPage = page === 'saved-universities' || page === 'scholarships';

  /** Saved universities are the offers the student starred; scholarships are the scholarship offers they hold. */
  const cardOffers = wallet.offers.filter(offer => {
    if (page === 'saved-universities' ? !offer.saved : offer.category !== 'Scholarship') return false;
    if (filter !== 'All destinations' && offer.location !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || `${offer.institution} ${offer.program}`.toLowerCase().includes(q);
  });

  const destinations = Array.from(new Set(wallet.offers.map(offer => offer.location).filter(Boolean)));

  /** An offer counts as read once it has been opened, so marking read is the same call the inbox makes. */
  const markRead = async (id: string) => {
    const token = readAccessToken();
    if (!token) return;
    await authApi.viewOffer(token, id);
    await loadNotifications();
  };

  const markAll = async () => {
    const token = readAccessToken();
    if (!token) return;
    await Promise.all(notifications.filter(note => !note.read).map(note => authApi.viewOffer(token, note.id)));
    await loadNotifications();
  };

  return (
    <StudentWorkspaceShell
      backdrop="scene"
      sky={SKY[page]}
      /* The loan journey draws the wizard's own frame, so the shell must not
         put it inside a second card. */
      frame={page === 'loan-eligibility' ? 'bare' : 'card'}
    >
      <main className={cx('student-extra')}>
        {page !== 'loan-eligibility' && (
          <header>
            <div><span>STUDENT WORKSPACE</span><h1>{title}</h1><p>{description}</p></div>
            {actionRoute && <Link href={actionRoute}>{actionLabel}</Link>}
          </header>
        )}

        {isCardPage && (
          <div className={cx('search')}>
            <label>
              ⌕
              <input value={query} placeholder="Search universities or programmes" onChange={event => setQuery(event.target.value)} />
            </label>
            <select value={filter} onChange={event => setFilter(event.target.value)}>
              <option>All destinations</option>
              {destinations.map(place => <option key={place}>{place}</option>)}
            </select>
          </div>
        )}

        {isCardPage && (
          <section className={cx('grid')}>
            {cardOffers.map(offer => (
              <article key={offer.id}>
                <div className={cx('logo')}>{offer.initial}</div>
                <span>{`${offer.location} · ${offer.intake}`.toUpperCase()}</span>
                <h2>{offer.institution}</h2>
                <p>{offer.program}</p>
                <div className={cx('terms')}><small>{offer.valueLabel}</small><strong>{offer.value}</strong></div>
                <footer>
                  <button onClick={() => wallet.toggleSaved(offer.id)}>{offer.saved ? '✓ Saved' : '☆ Save'}</button>
                  <Link href="/student/offers">View details →</Link>
                </footer>
              </article>
            ))}
            {!cardOffers.length && (
              <p className={cx('section-subtitle')}>
                {page === 'saved-universities'
                  ? 'You haven’t saved any offers yet — star one from My Offers to keep it here.'
                  : 'No scholarship offers yet. Complete your profile so providers can match you.'}
              </p>
            )}
          </section>
        )}

        {page === 'loan-eligibility' && (
          <section className={cx('loan-page')}>
            {wantsLoan === null && (
              <div className={cx('loan-gate')}>
                <span>EDUCATION FINANCE</span>
                <h2>Do you need an education loan?</h2>
                <p>
                  Tell us if you&apos;re planning to fund part of your education with a loan — we&apos;ll only ask for
                  verification documents if you do.
                </p>
                <div className={cx('loan-gate-actions')}>
                  <button type="button" onClick={() => chooseWantsLoan(true)}>Yes, I need a loan</button>
                  <button type="button" className={cx('ghost')} onClick={() => chooseWantsLoan(false)}>No, I&apos;m self-funded</button>
                </div>
              </div>
            )}

            {wantsLoan === false && (
              <div className={cx('loan-declined')}>
                <span>EDUCATION FINANCE</span>
                <h2>No problem</h2>
                <p>You can come back here anytime if your funding plans change.</p>
                <button type="button" onClick={() => chooseWantsLoan(true)}>Actually, I do need a loan</button>
              </div>
            )}

            {wantsLoan === true && <CoApplicantPanel />}
          </section>
        )}

        {page === 'notifications' && (
          <section className={cx('notifications')}>
            <header><h2>Recent updates</h2><button onClick={() => void markAll()}>Mark all read</button></header>
            {notifications.map(note => (
              <article key={note.id} className={cx(!note.read && 'unread')}>
                <i>{note.icon}</i>
                <div><strong>{note.title}</strong><p>{note.detail}</p><small>{relativeTime(note.occurredAt)}</small></div>
                <button onClick={() => void markRead(note.id)}>{note.read ? 'Read' : 'Mark read'}</button>
              </article>
            ))}
            {!notifications.length && <p className={cx('section-subtitle')}>Nothing new yet — offers and replies appear here.</p>}
          </section>
        )}

      </main>
    </StudentWorkspaceShell>
  );
}
