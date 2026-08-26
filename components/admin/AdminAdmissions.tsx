'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import styles from '@/styles/AdminAdmissions.module.css';

const cx = classNames(styles);

interface Admission {
  offerId: string;
  acceptedAt: string;
  program: string;
  headline: string;
  value: string | null;
  valueLabel: string | null;
  intake: string | null;
  organization: { id: string; name: string; organizationType: string; country: string | null };
  student: { id: string | null; name: string | null; email: string | null; phone: string | null };
  segment: 'STUDENT' | 'ALUMNI';
  alumniSince: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'NOT_ADMITTED';
  note: string | null;
  checkedBy: string | null;
  confirmedAt: string | null;
  purgedAt: string | null;
}

interface Detail {
  offerId: string;
  acceptedAt: string;
  offer: Record<string, unknown>;
  organization: Record<string, string | null>;
  student: Record<string, unknown> & { purged: boolean };
  thread: Array<{ sender: string; authorName: string; body: string; sentAt: string }>;
  followUp: { status: string; note: string | null; purgedAt: string | null };
}

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'PENDING', label: 'To check' },
  { key: 'CONFIRMED', label: 'Alumni' },
  { key: 'NOT_ADMITTED', label: 'Not admitted' },
  { key: 'purged', label: 'Erased' },
  { key: 'all', label: 'All' }
];

const OUTCOMES: Array<{ value: string; label: string; describes: string }> = [
  { value: 'PENDING', label: 'Still checking', describes: 'Stays a student, visible to organisations' },
  { value: 'CONFIRMED', label: 'Admission confirmed', describes: 'Becomes an alumnus and is hidden from institutions' },
  { value: 'NOT_ADMITTED', label: 'Not admitted after all', describes: 'Stays a student and goes back into discovery' }
];

const asDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export function AdminAdmissions({ adminKey }: { adminKey: string }) {
  const [rows, setRows] = useState<Admission[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState('PENDING');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('PENDING');
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const payload = await authApi.adminAdmissions(adminKey, filter);
    setRows(payload.admissions || []);
    setCounts(payload.counts || {});
    return payload.admissions as Admission[];
  }, [adminKey, filter]);

  useEffect(() => {
    void load().catch(e => setError(e instanceof Error ? e.message : 'Admissions could not be loaded.'));
  }, [load]);

  const open = async (row: Admission) => {
    setSelectedId(row.offerId);
    setError('');
    setMessage('');
    setConfirmText('');
    try {
      const payload = await authApi.adminAdmissionDetail(adminKey, row.offerId);
      setDetail(payload as Detail);
      setOutcome(row.status);
      setNote(row.note || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That admission could not be opened.');
    }
  };

  const record = async () => {
    if (!selectedId) return;
    setBusy(true);
    setError('');
    try {
      await authApi.adminRecordAdmission(adminKey, selectedId, { status: outcome, note });
      await load();
      /*
       * Refetched directly rather than through the list.
       *
       * Confirming an admission moves it out of "to check", so the row an admin
       * was just working on vanishes from the filtered list — and reading the
       * pane back from that list left it showing the outcome from before the
       * save, with the removal step still hidden behind it.
       */
      const payload = await authApi.adminAdmissionDetail(adminKey, selectedId);
      setDetail(payload as Detail);
      setMessage(
        outcome === 'CONFIRMED'
          ? 'Recorded. They are now an alumnus — hidden from institutions, but their account and history are kept.'
          : 'Recorded. They are a student again and visible to institutions.'
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  const purge = async () => {
    if (!selectedId) return;
    setBusy(true);
    setError('');
    try {
      const result = await authApi.adminPurgeAdmission(adminKey, selectedId);
      await load();
      const payload = await authApi.adminAdmissionDetail(adminKey, selectedId);
      setDetail(payload as Detail);
      setConfirmText('');
      setMessage(`Student data erased. ${result?.documentsRemoved ?? 0} document(s) deleted. The admission itself is kept.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The data could not be removed.');
    } finally {
      setBusy(false);
    }
  };

  const selected = useMemo(() => rows.find(row => row.offerId === selectedId) || null, [rows, selectedId]);
  const purged = !!detail?.student?.purged;
  const canPurge = detail?.followUp?.status === 'CONFIRMED' && !purged;
  const personal = (detail?.student?.personal || {}) as Record<string, string>;
  const academic = (detail?.student?.academic || {}) as Record<string, unknown>;
  const history = Array.isArray(academic.history) ? (academic.history as Record<string, string>[]) : [];

  return (
    <div className={cx('admissions')}>
      <div className={cx('filters')}>
        {FILTERS.map(entry => (
          <button
            key={entry.key}
            type="button"
            className={cx(filter === entry.key && 'active')}
            onClick={() => { setFilter(entry.key); setSelectedId(null); setDetail(null); }}
          >
            {entry.label}
            {counts[entry.key] !== undefined && <i>{counts[entry.key]}</i>}
          </button>
        ))}
        <button type="button" className={cx('refresh')} onClick={() => void load()} disabled={busy}>Reload</button>
      </div>

      {error && <p className={cx('message', 'error')} role="alert">{error}</p>}
      {message && !error && <p className={cx('message', 'good')}>{message}</p>}

      <div className={cx('body')}>
        <aside className={cx('rail')}>
          {!rows.length && <p className={cx('empty')}>Nothing here.</p>}
          {rows.map(row => (
            <button
              key={row.offerId}
              type="button"
              className={cx('row', row.offerId === selectedId && 'selected', row.purgedAt && 'purged')}
              onClick={() => void open(row)}
            >
              <strong>{row.student.name || 'Unnamed student'}</strong>
              <span>{row.program}</span>
              <em>{row.organization.name}</em>
              <div className={cx('row-tags')}>
                <i className={cx('tag', row.purgedAt ? 'removed' : row.segment === 'ALUMNI' ? 'alumni' : row.status.toLowerCase())}>
                  {row.purgedAt ? 'Data erased' : row.segment === 'ALUMNI' ? 'Alumnus' : OUTCOMES.find(o => o.value === row.status)?.label}
                </i>
                <i className={cx('tag', 'when')}>Accepted {asDate(row.acceptedAt)}</i>
              </div>
            </button>
          ))}
        </aside>

        <section className={cx('pane')}>
          {!detail && <p className={cx('empty')}>Pick a student to follow up.</p>}

          {detail && (
            <>
              <header className={cx('pane-head')}>
                <div>
                  <h2>{selected?.student.name || 'Student'}</h2>
                  <p>Accepted {asDate(detail.acceptedAt)} · {String(detail.offer.program ?? '')}</p>
                </div>
                {purged && <span className={cx('tag', 'removed')}>Data removed</span>}
              </header>

              {/*
                * The offer and who sent it, together — the credibility check is
                * whether this organisation really made this offer, so the two
                * belong on one screen rather than a click apart.
                */}
              <div className={cx('cards')}>
                <article>
                  <h3>The offer</h3>
                  <dl>
                    <div><dt>Programme</dt><dd>{String(detail.offer.program ?? '—')}</dd></div>
                    <div><dt>{String(detail.offer.valueLabel ?? 'Value')}</dt><dd>{String(detail.offer.value ?? '—')}</dd></div>
                    <div><dt>Intake</dt><dd>{String(detail.offer.intake ?? '—')}</dd></div>
                    <div><dt>Named contact</dt><dd>{String(detail.offer.contactName ?? '—')}</dd></div>
                    <div><dt>Conditions</dt><dd>{String(detail.offer.conditions ?? '—')}</dd></div>
                  </dl>
                </article>

                <article>
                  <h3>Who offered it</h3>
                  <dl>
                    <div><dt>Organisation</dt><dd>{detail.organization.name}</dd></div>
                    <div><dt>Type</dt><dd>{detail.organization.type}</dd></div>
                    <div><dt>Registered</dt><dd>{detail.organization.registrationNumber || '—'}</dd></div>
                    <div><dt>Where</dt><dd>{[detail.organization.city, detail.organization.country].filter(Boolean).join(', ') || '—'}</dd></div>
                    <div><dt>Website</dt><dd>{detail.organization.website || '—'}</dd></div>
                  </dl>
                </article>

                <article>
                  <h3>The student</h3>
                  {purged ? (
                    <p className={cx('gone')}>
                      This student asked to be erased. The offer above is kept as the record of the
                      admission; nothing personal remains.
                    </p>
                  ) : (
                    <dl>
                      <div><dt>Name</dt><dd>{personal.fullName || String(detail.student.name ?? '—')}</dd></div>
                      <div><dt>Email</dt><dd>{String(detail.student.email ?? '—')}</dd></div>
                      <div><dt>Mobile</dt><dd>{personal.mobileNumber || String(detail.student.phone ?? '—')}</dd></div>
                      <div><dt>Where</dt><dd>{[personal.city, personal.country].filter(Boolean).join(', ') || '—'}</dd></div>
                      <div>
                        <dt>Last qualification</dt>
                        <dd>{history.length ? `${history[history.length - 1].degreeName || ''} · ${history[history.length - 1].institutionName || ''}` : '—'}</dd>
                      </div>
                    </dl>
                  )}
                </article>
              </div>

              {!!detail.thread.length && (
                <details className={cx('thread')}>
                  <summary>The conversation ({detail.thread.length})</summary>
                  <ul>
                    {detail.thread.map((line, index) => (
                      <li key={index}>
                        <b>{line.authorName}</b>
                        <span>{line.body}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {!purged && (
                <section className={cx('outcome')}>
                  <h3>What did the university say?</h3>
                  <div className={cx('outcome-picks')}>
                    {OUTCOMES.map(option => (
                      <label key={option.value} className={cx('pick', outcome === option.value && 'on')}>
                        <input
                          type="radio"
                          name="outcome"
                          value={option.value}
                          checked={outcome === option.value}
                          onChange={() => setOutcome(option.value)}
                        />
                        <span>
                          <b>{option.label}</b>
                          <em>{option.describes}</em>
                        </span>
                      </label>
                    ))}
                  </div>

                  <label className={cx('field')}>
                    <span>What you were told</span>
                    <textarea
                      name="note"
                      rows={3}
                      value={note}
                      placeholder="Who you spoke to, and what they confirmed"
                      onChange={event => setNote(event.target.value)}
                    />
                  </label>

                  <button type="button" className={cx('primary')} onClick={() => void record()} disabled={busy}>
                    Save what we found
                  </button>
                </section>
              )}

              {/*
                * Kept apart from everything else and behind a typed word.
                * Removing a student is the one action on this page that cannot
                * be undone, and it should not sit a mis-click away from the
                * notes field.
                */}
              {canPurge && (
                <details className={cx('danger')}>
                  <summary>Erase this student&rsquo;s data instead</summary>
                  <p>
                    Not needed to stop the recommendations — being an alumnus already does that, and keeps
                    their account in case they come back for a postgraduate place or a loan. This is for
                    when a student asks to be erased.
                  </p>
                  <p>
                    Their profile, contact details, uploaded documents and credit consents are erased, they
                    are dropped from every shortlist, and their name is taken out of the conversation.
                    <b> This cannot be undone.</b>
                  </p>
                  <label className={cx('field')}>
                    <span>Type REMOVE to confirm</span>
                    <input
                      type="text"
                      name="confirm"
                      value={confirmText}
                      placeholder="REMOVE"
                      onChange={event => setConfirmText(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    className={cx('destructive')}
                    onClick={() => void purge()}
                    disabled={busy || confirmText.trim().toUpperCase() !== 'REMOVE'}
                  >
                    Erase student data
                  </button>
                </details>
              )}

              {detail.followUp?.status !== 'CONFIRMED' && !purged && (
                <p className={cx('hint')}>
                  Confirming an admission makes the student an alumnus and hides them from institutions.
                  Nothing is deleted.
                </p>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
