'use client';

import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import styles from '@/styles/AdminPage.module.css';

const cx = classNames(styles);

interface Invoice {
  id: string; invoiceNumber: string; plan: string; amount: string; currency: string;
  status: string; periodStart: string; periodEnd: string; paidAt: string | null;
  paymentRef: string | null; profilesViewed: number; note: string | null;
}

interface Row {
  organizationId: string; name: string; organizationType: string; plan: string;
  paymentStatus: string; periodEnd: string | null; profilesViewed: number;
  outstandingInvoices: number; outstandingMinor: number;
  suspended: boolean; suspensionReason: string | null; invoices: Invoice[];
}

const PLANS = ['Basic', 'Professional', 'Enterprise'];

/** Payment states borrow the pill tones the auth log already uses. */
const payTone = (status: string) =>
  status === 'PAID' ? 'success' : status === 'OVERDUE' || status === 'CANCELLED' ? 'locked' : 'failed';

const money = (minor: number) => `₹${(minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const day = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/**
 * Selling, invoicing and chasing — by hand, because the money moves by hand.
 *
 * Nothing here charges anybody. An admin records what was agreed, and later
 * records that it arrived. The one deliberate omission is automation: an overdue
 * invoice never switches a customer off on its own, because cutting off a paying
 * university over a slow transfer costs more than the invoice. Suspension is a
 * button someone has to press.
 */
export function AdminBilling({ adminKey }: { adminKey: string }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState('');

  const [draft, setDraft] = useState({ plan: 'Professional', periodStart: '', periodEnd: '', amount: '', note: '' });

  const load = useCallback(async () => {
    try {
      setRows((await authApi.adminBilling(adminKey)) as Row[]);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Billing could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => { void load(); }, [load]);

  const guard = async (key: string, run: () => Promise<unknown>) => {
    setBusy(key);
    setError('');
    try {
      await run();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That could not be saved.');
    } finally {
      setBusy('');
    }
  };

  const createFor = (organizationId: string) =>
    guard('create', async () => {
      await authApi.adminCreateSubscription(adminKey, {
        organizationId,
        plan: draft.plan,
        periodStart: draft.periodStart,
        periodEnd: draft.periodEnd,
        amount: Number(draft.amount)
      });
      setDraft({ plan: 'Professional', periodStart: '', periodEnd: '', amount: '', note: '' });
    });

  const markPaid = (id: string) =>
    guard(id, async () => {
      const paymentRef = window.prompt('Payment reference (NEFT number, cheque number)?') || undefined;
      if (paymentRef === undefined) return;
      await authApi.adminMarkSubscriptionPaid(adminKey, id, { paymentRef, recordedBy: 'admin' });
    });

  const toggleSuspension = (row: Row) =>
    guard(row.organizationId, async () => {
      if (row.suspended) return authApi.adminSetOrganizationSuspension(adminKey, row.organizationId, false);
      const reason = window.prompt('Why is this organisation being suspended?') || '';
      if (!reason) return;
      return authApi.adminSetOrganizationSuspension(adminKey, row.organizationId, true, reason);
    });

  if (loading) return <p className={cx('bill-muted')}>Loading billing…</p>;

  return (
    <section className={cx('bill-panel')}>
      <header className={cx('page-head')}>
        <h2>Subscriptions</h2>
        <p>Plans are agreed and paid offline. Record what was sold, and record the money when it lands.</p>
      </header>

      {error && <p className={cx('bill-error')}>{error}</p>}

      <div className={cx('auth-table-wrap')}>
        <table className={cx('auth-table')}>
          <thead>
            <tr>
              <th>Organisation</th><th>Plan</th><th>Views used</th><th>Period ends</th>
              <th>Payment</th><th>Outstanding</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.organizationId} className={cx(row.suspended && 'bill-suspended')}>
                <td>
                  <strong>{row.name}</strong>
                  <small className={cx('bill-sub')}>{row.organizationType}</small>
                  {row.suspended && <span className={cx('auth-status', 'locked')}>Suspended</span>}
                </td>
                <td>{row.plan}</td>
                <td>{row.profilesViewed}</td>
                <td>{day(row.periodEnd)}</td>
                <td><span className={cx('auth-status', payTone(row.paymentStatus))}>{row.paymentStatus}</span></td>
                <td>{row.outstandingInvoices ? money(row.outstandingMinor) : '—'}</td>
                <td className={cx('bill-actions')}>
                  <button type="button" onClick={() => setOpen(open === row.organizationId ? null : row.organizationId)}>
                    {open === row.organizationId ? 'Close' : 'Manage'}
                  </button>
                  <button
                    type="button"
                    className={cx(row.suspended ? '' : 'bill-danger')}
                    disabled={busy === row.organizationId}
                    onClick={() => void toggleSuspension(row)}
                  >
                    {row.suspended ? 'Lift suspension' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.filter(row => row.organizationId === open).map(row => (
        <div key={row.organizationId} className={cx('bill-drawer')}>
          <h3>{row.name} — invoices</h3>

          {row.invoices.length === 0 ? (
            <p className={cx('bill-muted')}>Nothing billed yet.</p>
          ) : (
            <div className={cx('auth-table-wrap')}>
              <table className={cx('auth-table')}>
                <thead>
                  <tr><th>Invoice</th><th>Plan</th><th>Period</th><th>Amount</th><th>Status</th><th>Paid</th><th>Reference</th><th></th></tr>
                </thead>
                <tbody>
                  {row.invoices.map(inv => (
                    <tr key={inv.id}>
                      <td>{inv.invoiceNumber}</td>
                      <td>{inv.plan}</td>
                      <td>{day(inv.periodStart)} — {day(inv.periodEnd)}</td>
                      <td>{inv.currency} {inv.amount}</td>
                      <td><span className={cx('auth-status', payTone(inv.status))}>{inv.status}</span></td>
                      <td>{day(inv.paidAt)}</td>
                      <td>{inv.paymentRef || '—'}</td>
                      <td>
                        {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                          <button type="button" disabled={busy === inv.id} onClick={() => void markPaid(inv.id)}>
                            {busy === inv.id ? 'Saving…' : 'Mark paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3>New billing period</h3>
          <div className={cx('bill-form')}>
            <label>
              Plan
              <select value={draft.plan} onChange={e => setDraft({ ...draft, plan: e.target.value })}>
                {PLANS.map(plan => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </label>
            <label>
              Starts
              <input type="date" value={draft.periodStart} onChange={e => setDraft({ ...draft, periodStart: e.target.value })} />
            </label>
            <label>
              Ends
              <input type="date" value={draft.periodEnd} onChange={e => setDraft({ ...draft, periodEnd: e.target.value })} />
            </label>
            <label>
              Amount (₹)
              <input type="number" min={0} value={draft.amount} placeholder="60000"
                onChange={e => setDraft({ ...draft, amount: e.target.value })} />
            </label>
            <button
              type="button"
              className={cx('bill-primary')}
              disabled={busy === 'create' || !draft.periodStart || !draft.periodEnd || !draft.amount}
              onClick={() => void createFor(row.organizationId)}
            >
              {busy === 'create' ? 'Saving…' : 'Create invoice'}
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
