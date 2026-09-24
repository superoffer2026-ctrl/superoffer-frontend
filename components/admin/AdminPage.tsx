'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { readSession, removeSession, writeSession } from '@/lib/storage';
import styles from '@/styles/AdminPage.module.css';
import { AdminAutomation } from './AdminAutomation';
import { AdminAdmissions } from './AdminAdmissions';
import { AdminBilling } from './AdminBilling';
import { AdminFormBuilder } from './AdminFormBuilder';

const cx = classNames(styles);

type AdminView = 'dashboard' | 'queue' | 'audit' | 'auth-logs' | 'form-builder' | 'automation' | 'admissions' | 'billing';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'ALL'];

const TYPES = [
  { label: 'All organisations', value: 'ALL' },
  { label: 'Universities', value: 'UNIVERSITY' },
  { label: 'Banks', value: 'BANK' },
];

interface PlatformStats {
  students: number;
  submittedProfiles: number;
  universities: number;
  banks: number;
  pendingVerifications: number;
  invitationVolume: number;
  acceptanceRate: number;
  roleBreakdown: Array<{ label: string; count: number }>;
  subscription: { tiers: Array<{ name: string; orgs: number }> };
  recentSubmissions: Array<{ id: string; initial: string; name: string; type: string; submittedAt: string; status: string }>;
}

const EMPTY_STATS: PlatformStats = {
  students: 0, submittedProfiles: 0, universities: 0, banks: 0,
  pendingVerifications: 0, invitationVolume: 0, acceptanceRate: 0,
  roleBreakdown: [], subscription: { tiers: [] }, recentSubmissions: []
};

/** One authentication attempt, as `/admin/auth-logs` records it. */
interface AuthLogEntry {
  id: string;
  userName: string;
  email: string;
  role: string;
  outcome: 'SUCCESS' | 'FAILED' | 'LOCKED';
  ip: string;
  userAgent: string;
  occurredAt: string;
}

const AUTH_SORT_COLUMNS = ['occurredAt', 'email', 'role', 'outcome'] as const;
type AuthSortColumn = (typeof AUTH_SORT_COLUMNS)[number];

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  UNIVERSITY_OFFICER: 'University Officer',
  LOAN_OFFICER: 'Loan Officer'
};

const OUTCOME_LABELS: Record<string, string> = { SUCCESS: 'Success', FAILED: 'Failed', LOCKED: 'Locked' };

/** The login event stores the raw user-agent; the table wants the two parts of it people read. */
function deviceOf(userAgent: string): string {
  if (/iPhone|iPad/i.test(userAgent)) return 'iOS';
  if (/Android/i.test(userAgent)) return 'Android';
  if (/Mac OS X/i.test(userAgent)) return 'macOS';
  if (/Windows NT/i.test(userAgent)) return 'Windows';
  if (/Linux/i.test(userAgent)) return 'Linux';
  return userAgent === '—' ? '—' : 'Unknown device';
}

function browserOf(userAgent: string): string {
  const match =
    /(Edg|OPR|Firefox|Chrome|Safari)\/(\d+)/.exec(userAgent) || /(curl|python-requests|HeadlessChrome)\/?([\d.]*)/i.exec(userAgent);
  if (!match) return userAgent === '—' ? '—' : 'Unknown browser';
  const name = { Edg: 'Edge', OPR: 'Opera' }[match[1] as 'Edg' | 'OPR'] || match[1];
  return match[2] ? `${name} ${match[2]}` : name;
}

const number = (value: number) => value.toLocaleString('en-IN');
const percentOf = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0);
const mediumDate = (value?: string) => (value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '');
const mediumDateTime = (value?: string) => (value ? new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '');

/** Free mailboxes prove nothing about belonging to an institution. */
const PUBLIC_MAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com',
  'hotmail.com', 'live.com', 'icloud.com', 'proton.me', 'protonmail.com',
  'rediffmail.com', 'aol.com', 'zoho.com', 'mail.com', 'yandex.com'
];

const hostOf = (value: string) =>
  (value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

/**
 * What a reviewer cannot confirm from this submission.
 *
 * Registration now requires every one of these, so a gap here means the row was
 * submitted before that rule existed. Naming the gaps is more use than
 * repeating the instruction to check them.
 */
function evidenceGaps(row: {
  email?: string;
  organization?: {
    website?: string | null;
    country?: string | null;
  } | null;
}) {
  const org = row.organization;
  const missing = [
    !org?.website && 'official website',
    !org?.country && 'country'
  ].filter(Boolean) as string[];

  const emailDomain = hostOf((row.email || '').split('@')[1] || '');
  const siteDomain = hostOf(org?.website || '');
  const publicMailbox = !!emailDomain && PUBLIC_MAIL_DOMAINS.includes(emailDomain);
  /** Only a real mismatch counts — a subdomain of the site is still the site. */
  const domainMismatch =
    !!emailDomain && !!siteDomain && !publicMailbox &&
    !emailDomain.endsWith(siteDomain) && !siteDomain.endsWith(emailDomain);

  return { missing, emailDomain, siteDomain, publicMailbox, domainMismatch };
}

/**
 * What each section is, in its own words.
 *
 * Held here rather than inside the views so the rail and the heading can never
 * disagree about which page you are on.
 */
const PAGES: Record<AdminView, { eyebrow: string; title: string; describes: string }> = {
  billing: {
    eyebrow: 'REVENUE',
    title: 'Subscriptions',
    describes: 'What each organisation is on, and whether the money has arrived.'
  },
  dashboard: {
    eyebrow: 'OVERVIEW',
    title: 'Platform dashboard',
    describes: 'Who is using SuperOffer, and what is waiting on an admin.'
  },
  queue: {
    eyebrow: 'TRUST & VERIFICATION',
    title: 'Institution registrations',
    describes: 'Review universities and education lenders before unlocking login.'
  },
  audit: {
    eyebrow: 'ACCOUNTABILITY',
    title: 'Audit log',
    describes: 'Every verification decision, who made it, and when.'
  },
  'auth-logs': {
    eyebrow: 'ACCOUNTABILITY',
    title: 'Authentication log',
    describes: 'Sign-ins and sign-in attempts across every role.'
  },
  admissions: {
    eyebrow: 'AFTER THE OFFER',
    title: 'Admissions follow-up',
    describes: 'Students who accepted. Verify the admission, and they become an alumnus.'
  },
  'form-builder': {
    eyebrow: 'CONFIGURATION',
    title: 'Form builder',
    describes: 'The questions each form asks, and the lists its answers come from.'
  },
  automation: {
    eyebrow: 'CONFIGURATION',
    title: 'Message automation',
    describes: 'What a thread says on its own, and which channels it says it on.'
  }
};

/** Grouped, because six flat items give an admin no sense of what sits where. */
const NAV_GROUPS: Array<{ title: string; items: Array<{ view: AdminView; label: string; describes: string }> }> = [
  {
    title: 'Operate',
    items: [
      { view: 'dashboard', label: 'Dashboard', describes: 'Health and what needs attention' },
      { view: 'queue', label: 'Verification queue', describes: 'Organisations awaiting review' },
      { view: 'admissions', label: 'Admissions', describes: 'Accepted offers to verify' },
      { view: 'billing', label: 'Subscriptions', describes: 'Plans sold, and money received' }
    ]
  },
  {
    title: 'Accountability',
    items: [
      { view: 'audit', label: 'Audit log', describes: 'Decisions and who made them' },
      { view: 'auth-logs', label: 'Auth logs', describes: 'Sign-ins across every role' }
    ]
  },
  {
    title: 'Configure',
    items: [
      { view: 'form-builder', label: 'Form builder', describes: 'Questions and option lists' },
      { view: 'automation', label: 'Automation', describes: 'Rules, channels and messages' }
    ]
  }
];

export function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [view, setView] = useState<AdminView>('dashboard');

  const [status, setStatus] = useState('PENDING');
  const [orgType, setOrgType] = useState('ALL');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [summary, setSummary] = useState<any>({});
  const [decision, setDecision] = useState<'' | 'approve' | 'reject'>('');
  const [reviewReason, setReviewReason] = useState('');
  const [auditEntries, setAuditEntries] = useState<any[]>([]);

  const [stats, setStats] = useState<PlatformStats>(EMPTY_STATS);

  const [authSearch, setAuthSearch] = useState('');
  const [authRoleFilter, setAuthRoleFilter] = useState('');
  const [authStatusFilter, setAuthStatusFilter] = useState('');
  const [authSortCol, setAuthSortCol] = useState<AuthSortColumn>('occurredAt');
  const [authSortDir, setAuthSortDir] = useState<'asc' | 'desc'>('desc');
  const [authPage, setAuthPage] = useState(1);
  const [authLogs, setAuthLogs] = useState<AuthLogEntry[]>([]);
  const [authTotal, setAuthTotal] = useState(0);
  const [authTotalPages, setAuthTotalPages] = useState(1);
  const [exported, setExported] = useState(false);
  const authPageSize = 10;

  const refreshTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async (key = adminKey, nextStatus = status, nextType = orgType) => {
    /** The dashboard shows the latest verification decisions, so the audit log loads with it. */
    const [result, platform, audit] = await Promise.all([
      authApi.adminRegistrations(key, nextStatus, nextType),
      authApi.adminStats(key),
      authApi.adminAuditLog(key)
    ]);
    setStats({ ...EMPTY_STATS, ...platform });
    setAuditEntries(audit.entries || []);
    setRegistrations(result.registrations || []);
    setSummary(result.summary || {});
    setSelected((current: any) =>
      current ? (result.registrations || []).find((item: any) => item.user_id === current.user_id) || null : null
    );
  }, [adminKey, status, orgType]);

  const connect = useCallback(async (existingToken?: string) => {
    setLoading(true);
    setError('');
    try {
      const token = existingToken || adminKey;
      if (!token) throw new Error('An approval key is required');
      await load(token);
      setAuthenticated(true);
      writeSession('superoffer_admin_key', token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Admin access failed.');
      setAuthenticated(false);
      writeSession('superoffer_admin_key', '');
    } finally {
      setLoading(false);
    }
  }, [adminKey, load]);

  useEffect(() => {
    const saved = readSession('superoffer_admin_key') || '';
    if (!saved) return;
    setAdminKey(saved);
    void connect(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** The queue refreshes itself so new institution submissions appear without a manual reload. */
  useEffect(() => {
    if (!authenticated) return;
    refreshTimer.current = window.setInterval(() => {
      if (view === 'queue' && !reviewing) void load().catch(() => {});
    }, 15000);
    return () => {
      if (refreshTimer.current) window.clearInterval(refreshTimer.current);
      refreshTimer.current = undefined;
    };
  }, [authenticated, view, reviewing, load]);

  const refresh = async (nextStatus = status, nextType = orgType) => {
    setLoading(true);
    setError('');
    try {
      await load(adminKey, nextStatus, nextType);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (value: string) => {
    setStatus(value);
    setSelected(null);
    await refresh(value, orgType);
  };

  const changeType = async (value: string) => {
    setOrgType(value);
    setSelected(null);
    await refresh(status, value);
  };

  const submitReview = async () => {
    if (!selected) return;
    setReviewing(true);
    setError('');
    try {
      const rejected = decision === 'reject';
      await authApi.reviewRegistration(
        adminKey,
        selected.user_id,
        rejected ? 'REJECTED' : 'APPROVED',
        rejected ? reviewReason : '',
        rejected ? '' : reviewReason
      );
      setDecision('');
      setReviewReason('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review could not be saved.');
    } finally {
      setReviewing(false);
    }
  };

  const openAudit = async () => {
    setView('audit');
    setError('');
    try {
      const result = await authApi.adminAuditLog(adminKey);
      setAuditEntries(result.entries || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load audit log.');
    }
  };

  const signOut = () => {
    if (refreshTimer.current) window.clearInterval(refreshTimer.current);
    removeSession('superoffer_admin_key');
    setAdminKey('');
    setAuthenticated(false);
    setRegistrations([]);
    setSelected(null);
  };

  const roleLabel = (role: string) =>
    role === 'UNIVERSITY_OFFICER' ? 'University' : role === 'LOAN_OFFICER' ? 'Education lender' : 'Unknown';
  const orgInitial = (item: any) => String(item.organization?.name || item.full_name || '?')[0].toUpperCase();
  const location = (item: any) => [item.organization?.city, item.organization?.country].filter(Boolean).join(', ') || 'Not provided';

  // ── Auth logs ─────────────────────────────────────────────────────────────

  /** Filtering, sorting and paging all happen server-side; this renders what it is given. */
  const loadAuthLogs = useCallback(async () => {
    if (!adminKey) return;
    try {
      const result = await authApi.adminAuthLogs(adminKey, {
        search: authSearch,
        role: authRoleFilter,
        outcome: authStatusFilter,
        sort: authSortCol,
        direction: authSortDir,
        page: String(authPage),
        pageSize: String(authPageSize)
      });
      setAuthLogs((result.rows || []) as AuthLogEntry[]);
      setAuthTotal(result.total || 0);
      setAuthTotalPages(result.totalPages || 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load authentication logs.');
    }
  }, [adminKey, authSearch, authRoleFilter, authStatusFilter, authSortCol, authSortDir, authPage]);

  useEffect(() => {
    if (!authenticated || view !== 'auth-logs') return;
    void loadAuthLogs();
  }, [authenticated, view, loadAuthLogs]);

  const totalOrganizations = stats.universities + stats.banks;
  const largestRoleCount = Math.max(1, ...stats.roleBreakdown.map(row => row.count));

  const authPageStart = authTotal ? (authPage - 1) * authPageSize + 1 : 0;
  const authPageEnd = Math.min(authPage * authPageSize, authTotal);
  const authPageNums = Array.from({ length: authTotalPages }, (_, i) => i + 1);

  const sortAuth = (col: AuthSortColumn) => {
    if (authSortCol === col) setAuthSortDir(current => (current === 'asc' ? 'desc' : 'asc'));
    else {
      setAuthSortCol(col);
      setAuthSortDir('desc');
    }
    setAuthPage(1);
  };

  /** Exports every row that matches the current filters, not just the visible page. */
  const exportLogs = async () => {
    if (!adminKey) return;
    const result = await authApi.adminAuthLogs(adminKey, {
      search: authSearch,
      role: authRoleFilter,
      outcome: authStatusFilter,
      sort: authSortCol,
      direction: authSortDir,
      page: '1',
      pageSize: '100'
    });
    const headers = ['ID', 'Name', 'Role', 'Email', 'Time', 'Outcome', 'IP', 'Device', 'Browser'];
    const rows = ((result.rows || []) as AuthLogEntry[]).map(r =>
      [r.id, r.userName, ROLE_LABELS[r.role] || r.role, r.email, r.occurredAt, OUTCOME_LABELS[r.outcome] || r.outcome, r.ip, deviceOf(r.userAgent), browserOf(r.userAgent)]
    );
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `superoffer_auth_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const sortIcon = (col: AuthSortColumn) => (authSortDir === 'asc' && authSortCol === col ? '▲' : '▼');

  return (
    <div className={cx('host')}>
      <main className={cx('admin-shell')}>
        <header className={cx('topbar')}>
          <Link className={cx('brand')} href="/"><span>S</span>SuperOffer</Link>
          <small>Platform administration</small>
          {authenticated && <button onClick={signOut}>Sign out</button>}
        </header>

        {!authenticated && (
          <section className={cx('admin-login')}>
            <span className={cx('eyebrow')}>RESTRICTED ACCESS</span>
            <h1>Super Admin panel</h1>
            <p>Connect using the protected approval key configured for platform operations.</p>
            <form onSubmit={event => { event.preventDefault(); void connect(); }}>
              <label>
                Admin Approval Key
                <input type="password" required autoFocus
                  value={adminKey} onChange={event => setAdminKey(event.target.value)} />
              </label>
              {error && <p className={cx('message', 'error')}>{error}</p>}
              <button className={cx('primary', 'wide')} disabled={loading}>
                {loading ? 'Connecting…' : 'Sign in as Admin'}
              </button>
            </form>
          </section>
        )}

        {authenticated && (
          <section className={cx('admin-main')}>
            {/*
              * The rail, and a heading that belongs to the page under it.
              *
              * Every view used to sit beneath one fixed title, so the form
              * builder and the automation panel both announced themselves as
              * "Institution registrations". A sidebar makes room for each page
              * to say what it is, and leaves the full width of the screen for
              * the detail views that needed it.
              */}
            <nav className={cx('side-nav')} aria-label="Admin sections">
              {NAV_GROUPS.map(group => (
                <div className={cx('nav-group')} key={group.title}>
                  <span className={cx('nav-group-title')}>{group.title}</span>
                  {group.items.map(item => (
                    <button
                      key={item.view}
                      type="button"
                      className={cx('nav-item', view === item.view && 'active')}
                      aria-current={view === item.view ? 'page' : undefined}
                      onClick={() => (item.view === 'audit' ? openAudit() : setView(item.view))}
                    >
                      <i className={cx('nav-dot')} aria-hidden="true" />
                      <span>
                        <b>{item.label}</b>
                        <em>{item.describes}</em>
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </nav>

            <div className={cx('page-body')}>
              <header className={cx('page-head')}>
                <span className={cx('eyebrow')}>{PAGES[view].eyebrow}</span>
                <h1>{PAGES[view].title}</h1>
                <p>{PAGES[view].describes}</p>
              </header>

            {view === 'dashboard' && (
              <>
                <section className={cx('metrics')}>
                  <article className={cx('metric')}><small>Total students</small><strong>{number(stats.students)}</strong></article>
                  <article className={cx('metric')}><small>Verified universities</small><strong>{stats.universities}</strong></article>
                  <article className={cx('metric')}><small>Verified banks</small><strong>{stats.banks}</strong></article>
                  <article className={cx('metric', 'pending')}><small>Pending verifications</small><strong>{stats.pendingVerifications}</strong></article>
                  <article className={cx('metric', 'approved')}><small>Submitted profiles</small><strong>{number(stats.submittedProfiles)}</strong></article>
                </section>

                <div className={cx('dash-grid')}>
                  <section className={cx('dash-card')}>
                    <header><h2>Platform health</h2><small>Active users by role · this cycle</small></header>
                    {stats.roleBreakdown.map(row => (
                      <div key={row.label} className={cx('health-row')}>
                        <span>{row.label}</span>
                        <i><b style={{ width: `${percentOf(row.count, largestRoleCount)}%` }}></b></i>
                        <strong>{number(row.count)}</strong>
                      </div>
                    ))}
                    <footer className={cx('dash-card-footer')}>
                      <span><b>{number(stats.invitationVolume)}</b> invitations sent</span>
                      <span><b>{stats.acceptanceRate}%</b> acceptance rate</span>
                    </footer>
                  </section>

                  <section className={cx('dash-card')}>
                    <header><h2>Subscription overview</h2><small>Plan distribution across organisations</small></header>
                    {stats.subscription.tiers.map(tier => (
                      <div key={tier.name} className={cx('tier-row')}>
                        <span>{tier.name}</span>
                        <i><b style={{ width: `${percentOf(tier.orgs, totalOrganizations)}%` }}></b></i>
                        <strong>{tier.orgs} orgs</strong>
                      </div>
                    ))}
                    <footer className={cx('dash-card-footer')}>
                      <span><b>{totalOrganizations}</b> verified organisations</span>
                      <span><b>{stats.pendingVerifications}</b> awaiting verification</span>
                    </footer>
                  </section>
                </div>

                <div className={cx('dash-grid')}>
                  <section className={cx('dash-card')}>
                    <header><h2>Recent verification submissions</h2><small>Latest organisation sign-ups</small></header>
                    {stats.recentSubmissions.map(item => (
                      <div key={item.id} className={cx('feed-row')}>
                        <span className={cx('org-icon')}>{item.initial}</span>
                        <div><strong>{item.name}</strong><small>{item.type} · submitted {mediumDate(item.submittedAt)}</small></div>
                        <em className={cx('status', item.status === 'Verified' && 'approved')}>{item.status}</em>
                      </div>
                    ))}
                    {!stats.recentSubmissions.length && <div className={cx('empty')}>No organisations have registered yet.</div>}
                    <button className={cx('dash-link')} onClick={() => setView('queue')}>Open verification queue →</button>
                  </section>

                  <section className={cx('dash-card')}>
                    <header><h2>Recent admin actions</h2><small>Verification decisions from the audit log</small></header>
                    {auditEntries.slice(0, 4).map(entry => (
                      <div key={entry.id} className={cx('feed-row')}>
                        <span className={cx('org-icon', entry.action === 'REJECTED' && 'warn')}>
                          {entry.action === 'REJECTED' ? '!' : '✓'}
                        </span>
                        <div>
                          <strong>{entry.organizationName || entry.entityId}</strong>
                          <small>{entry.action}{entry.reason ? ` · ${entry.reason}` : ''}</small>
                        </div>
                        <em className={cx('status')}>{mediumDate(entry.occurredAt)}</em>
                      </div>
                    ))}
                    {!auditEntries.length && <div className={cx('empty')}>No verification actions recorded yet.</div>}
                    <button className={cx('dash-link')} onClick={openAudit}>Open audit log →</button>
                  </section>
                </div>

                <section className={cx('dash-card', 'quick-links')}>
                  <header><h2>Quick actions</h2></header>
                  <div className={cx('quick-links-row')}>
                    <button onClick={() => setView('queue')}>Review verification queue</button>
                    <button onClick={openAudit}>View audit log</button>
                    <button onClick={() => setView('auth-logs')}>View auth logs</button>
                  </div>
                </section>
              </>
            )}

            {view === 'queue' && (
              <>
                <section className={cx('metrics')}>
                  <article className={cx('metric', 'pending')}><small>Pending review</small><strong>{summary.pending || 0}</strong></article>
                  <article className={cx('metric', 'approved')}><small>Approved</small><strong>{summary.approved || 0}</strong></article>
                  <article className={cx('metric')}><small>Rejected</small><strong>{summary.rejected || 0}</strong></article>
                  <article className={cx('metric')}><small>Universities waiting</small><strong>{summary.universities || 0}</strong></article>
                  <article className={cx('metric')}><small>Banks waiting</small><strong>{summary.banks || 0}</strong></article>
                </section>

                <nav className={cx('filters')}>
                  {STATUSES.map(item => (
                    <button key={item} className={cx(status === item && 'active')} onClick={() => changeStatus(item)}>{item}</button>
                  ))}
                  <span className={cx('separator')}></span>
                  {TYPES.map(item => (
                    <button key={item.value} className={cx(orgType === item.value && 'active')} onClick={() => changeType(item.value)}>
                      {item.label}
                    </button>
                  ))}
                  <button className={cx('refresh')} onClick={() => void refresh()}>↻ Refresh</button>
                </nav>

                {error && <p className={cx('message', 'error')}>{error}</p>}

                <div className={cx('queue-layout')}>
                  <section className={cx('queue')}>
                    {!loading && !registrations.length && <div className={cx('empty')}>No matching registration requests.</div>}
                    {registrations.map(item => (
                      <button
                        key={item.user_id}
                        className={cx('request', selected?.user_id === item.user_id && 'selected')}
                        onClick={() => { setSelected(item); setDecision(''); }}
                      >
                        <span className={cx('org-icon')}>{orgInitial(item)}</span>
                        <div>
                          <small>{roleLabel(item.role)}</small>
                          <strong>{item.organization?.name || item.full_name}</strong>
                          <span>{[item.full_name, item.email].filter(Boolean).join(' · ')} · Submitted {mediumDate(item.submitted_at)}</span>
                        </div>
                        <span
                          className={cx(
                            'status',
                            item.approval_status === 'APPROVED' && 'approved',
                            item.approval_status === 'REJECTED' && 'rejected'
                          )}
                        >
                          {item.approval_status}
                        </span>
                      </button>
                    ))}
                  </section>

                  {selected && (
                    <aside className={cx('detail')}>
                      <header className={cx('detail-head')}>
                        <span className={cx('org-icon')}>{orgInitial(selected)}</span>
                        <div>
                          <small>{roleLabel(selected.role)}</small>
                          <h2>{selected.organization?.name}</h2>
                          <p>{selected.full_name} · {selected.email}</p>
                        </div>
                      </header>
                      <dl>
                        <div><dt>Organisation type</dt><dd>{selected.organization?.organizationType || roleLabel(selected.role)}</dd></div>
                        <div><dt>Website</dt><dd>{selected.organization?.website || 'Not provided'}</dd></div>
                        <div><dt>Location</dt><dd>{location(selected)}</dd></div>
                        <div><dt>Phone</dt><dd>{selected.phone || 'Not provided'}</dd></div>
                        <div><dt>Submitted</dt><dd>{mediumDateTime(selected.submitted_at)}</dd></div>
                      </dl>
                      {(() => {
                        const gaps = evidenceGaps(selected);
                        const unverifiable = gaps.missing.length || gaps.publicMailbox || gaps.domainMismatch;
                        if (!unverifiable) {
                          return (
                            <section className={cx('evidence')}>
                              <strong>Verification evidence</strong>
                              <p>Confirm the organization details against the official website before approval.</p>
                            </section>
                          );
                        }
                        return (
                          <section className={cx('evidence', 'evidence-warning')}>
                            <strong>⚠ Cannot be verified from this submission</strong>
                            <ul>
                              {!!gaps.missing.length && (
                                <li>Missing: {gaps.missing.join(', ')}.</li>
                              )}
                              {gaps.publicMailbox && (
                                <li>
                                  <code>{gaps.emailDomain}</code> is a public mailbox, not the organisation&rsquo;s own domain.
                                </li>
                              )}
                              {gaps.domainMismatch && (
                                <li>
                                  The email domain <code>{gaps.emailDomain}</code> does not match the website{' '}
                                  <code>{gaps.siteDomain}</code>.
                                </li>
                              )}
                            </ul>
                            <p>Approving unlocks access to submitted student profiles. Confirm this organisation by another route first.</p>
                          </section>
                        );
                      })()}

                      {selected.approval_status === 'PENDING' && (
                        <>
                          <div className={cx('review-actions')}>
                            <button className={cx('danger')} onClick={() => setDecision('reject')}>Reject</button>
                            <button className={cx('primary')} onClick={() => setDecision('approve')}>Approve &amp; unlock login</button>
                          </div>
                          {decision && (
                            <form className={cx('review-form')} onSubmit={event => { event.preventDefault(); void submitReview(); }}>
                              <label>
                                {decision === 'reject' ? 'Rejection reason (required)' : 'Internal approval note (optional)'}
                                <textarea
                                  name="reason" required={decision === 'reject'} value={reviewReason}
                                  onChange={event => setReviewReason(event.target.value)}
                                />
                              </label>
                              <footer>
                                <button type="button" className={cx('secondary')} onClick={() => setDecision('')}>Cancel</button>
                                <button
                                  className={cx(decision === 'reject' ? 'danger' : 'primary')}
                                  disabled={reviewing || (decision === 'reject' && !reviewReason.trim())}
                                >
                                  {reviewing ? 'Saving…' : decision === 'reject' ? 'Confirm rejection' : 'Confirm approval'}
                                </button>
                              </footer>
                            </form>
                          )}
                        </>
                      )}

                      {selected.approval_status !== 'PENDING' && (
                        <p className={cx('message')}>
                          Reviewed {mediumDateTime(selected.reviewed_at)}
                          <br />
                          {selected.rejection_reason || 'Organisation approved and login unlocked.'}
                        </p>
                      )}
                    </aside>
                  )}
                </div>
              </>
            )}

            {view === 'audit' && (
              <section className={cx('audit-table')}>
                <div className={cx('audit-row', 'header')}>
                  <span>Occurred</span><span>Action</span><span>Organisation</span><span>Actor</span>
                </div>
                {auditEntries.map(entry => (
                  <div key={entry.id} className={cx('audit-row')}>
                    <small>{mediumDateTime(entry.occurredAt)}</small>
                    <b>{entry.action}</b>
                    <span>
                      {entry.organizationName || entry.entityId}
                      {entry.reason && <small> · {entry.reason}</small>}
                    </span>
                    <span>{entry.actorUserId}</span>
                  </div>
                ))}
                {!auditEntries.length && <div className={cx('empty')}>No verification actions recorded yet.</div>}
              </section>
            )}

            {view === 'admissions' && <AdminAdmissions adminKey={adminKey} />}
            {view === 'billing' && <AdminBilling adminKey={adminKey} />}

            {view === 'form-builder' && <AdminFormBuilder adminKey={adminKey} />}

            {view === 'automation' && <AdminAutomation adminKey={adminKey} />}

            {view === 'auth-logs' && (
              <>
                <div className={cx('auth-toolbar')}>
                  <input
                    className={cx('auth-search')} type="search" placeholder="Search by name, email or IP address…"
                    value={authSearch}
                    onChange={event => { setAuthSearch(event.target.value); setAuthPage(1); }}
                  />
                  <select
                    className={cx('auth-select')} value={authRoleFilter}
                    onChange={event => { setAuthRoleFilter(event.target.value); setAuthPage(1); }}
                  >
                    <option value="">All roles</option>
                    <option value="STUDENT">Student</option>
                    <option value="UNIVERSITY_OFFICER">University Officer</option>
                    <option value="LOAN_OFFICER">Loan Officer</option>
                  </select>
                  <select
                    className={cx('auth-select')} value={authStatusFilter}
                    onChange={event => { setAuthStatusFilter(event.target.value); setAuthPage(1); }}
                  >
                    <option value="">All statuses</option>
                    <option value="SUCCESS">Success</option>
                    <option value="FAILED">Failed</option>
                    <option value="LOCKED">Locked</option>
                  </select>
                  <button className={cx('auth-export', exported && 'exported')} onClick={() => void exportLogs()}>
                    {exported ? '✓ Exported' : '↓ Export CSV'}
                  </button>
                </div>

                <div className={cx('auth-table-wrap')}>
                  <table className={cx('auth-table')}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th onClick={() => sortAuth('role')} className={cx(authSortCol === 'role' && 'sorted')}>Role <span className={cx('sort-icon')}>{sortIcon('role')}</span></th>
                        <th onClick={() => sortAuth('email')} className={cx(authSortCol === 'email' && 'sorted')}>Email <span className={cx('sort-icon')}>{sortIcon('email')}</span></th>
                        <th onClick={() => sortAuth('occurredAt')} className={cx(authSortCol === 'occurredAt' && 'sorted')}>Attempted at <span className={cx('sort-icon')}>{sortIcon('occurredAt')}</span></th>
                        <th>IP address</th>
                        <th>Device / Browser</th>
                        <th onClick={() => sortAuth('outcome')} className={cx(authSortCol === 'outcome' && 'sorted')}>Outcome <span className={cx('sort-icon')}>{sortIcon('outcome')}</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {authLogs.map(row => (
                        <tr key={row.id}>
                          <td><strong style={{ fontSize: 14 }}>{row.userName}</strong></td>
                          <td><span className={cx('auth-role')}>{ROLE_LABELS[row.role] || row.role}</span></td>
                          <td style={{ color: '#5a6d76', fontSize: 13 }}>{row.email}</td>
                          <td style={{ fontSize: 13 }}>{mediumDateTime(row.occurredAt)}</td>
                          <td><span className={cx('auth-ip')}>{row.ip}</span></td>
                          <td style={{ fontSize: 13, color: '#5a6d76' }} title={row.userAgent}>
                            {deviceOf(row.userAgent)}<br /><span style={{ color: '#8a9e94' }}>{browserOf(row.userAgent)}</span>
                          </td>
                          <td>
                            <span
                              className={cx(
                                'auth-status',
                                row.outcome === 'SUCCESS' && 'success',
                                row.outcome === 'FAILED' && 'failed',
                                row.outcome === 'LOCKED' && 'locked'
                              )}
                            >
                              {OUTCOME_LABELS[row.outcome] || row.outcome}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {!authLogs.length && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#8a9e94' }}>
                            No sign-in attempts match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <div className={cx('auth-pagination')}>
                    <span className={cx('auth-pagination-info')}>
                      Showing {authPageStart}–{authPageEnd} of {authTotal} records
                    </span>
                    <div className={cx('auth-page-btns')}>
                      <button className={cx('auth-page-btn')} disabled={authPage === 1} onClick={() => setAuthPage(page => page - 1)}>‹</button>
                      {authPageNums.map(page => (
                        <button key={page} className={cx('auth-page-btn', authPage === page && 'active')} onClick={() => setAuthPage(page)}>
                          {page}
                        </button>
                      ))}
                      <button className={cx('auth-page-btn')} disabled={authPage === authTotalPages} onClick={() => setAuthPage(page => page + 1)}>›</button>
                    </div>
                  </div>
                </div>
              </>
            )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
