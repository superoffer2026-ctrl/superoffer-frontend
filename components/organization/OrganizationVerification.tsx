'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import styles from '@/styles/OrganizationVerification.module.css';

const cx = classNames(styles);

interface VerificationStatus {
  organization: {
    name: string;
    organizationType: string;
    registrationNumber: string | null;
    licenseReference: string | null;
    website: string | null;
    country: string | null;
    city: string | null;
    description: string | null;
  };
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejection_reason: string | null;
  missing: string[];
  complete: boolean;
  notes: string[];
}

/**
 * What an organisation does while it waits.
 *
 * It exists because locking a pending organisation out gave a registrar a
 * password, no way to supply what was asked for, and nothing to do but email
 * support. They can sign in and work on this; they cannot see a student until
 * an admin approves them, and that is enforced on the server, not here.
 */
export function OrganizationVerification() {
  const router = useRouter();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/organization');
      return;
    }
    const payload = (await authApi.organizationVerification(token)) as VerificationStatus;
    setStatus(payload);
    setDraft({
      website: payload.organization.website || '',
      country: payload.organization.country || '',
      city: payload.organization.city || ''
    });
  }, [router]);

  useEffect(() => {
    void load().catch(e => setError(e instanceof Error ? e.message : 'Could not load your verification.'));
  }, [load]);

  const set = (key: string, value: string) => setDraft(current => ({ ...current, [key]: value }));

  const save = async (submit: boolean) => {
    const token = readAccessToken();
    if (!token) return;
    setBusy(true);
    setError('');
    setNote('');
    try {
      const payload = (await authApi.saveOrganizationVerification(token, { ...draft, submit })) as VerificationStatus;
      setStatus(payload);
      setNote(submit
        ? 'Sent for review. We will email you when an admin has looked at it.'
        : 'Saved. You can come back and finish this at any time.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your details.');
    } finally {
      setBusy(false);
    }
  };

  const signOut = () => {
    clearAccessToken();
    router.push('/auth/login/organization');
  };

  if (!status) {
    return (
      <div className={cx('host')}>
        <p className={cx('loading')}>{error || 'Loading your verification…'}</p>
      </div>
    );
  }

  const rejected = status.approval_status === 'REJECTED';

  return (
    <div className={cx('host')}>
      <header className={cx('bar')}>
        <div>
          <span className={cx('mark')}>S</span>
          <strong>SuperOffer</strong>
          <small>{status.organization.name}</small>
        </div>
        <button type="button" onClick={signOut}>Sign out</button>
      </header>

      <main className={cx('page')}>
        <section className={cx('intro')}>
          <span className={cx('eyebrow')}>VERIFICATION</span>
          <h1>Finish verifying {status.organization.name}</h1>
          <p>
            Your workspace opens as soon as an admin approves this. Until then you can sign in and
            work on it — no student profiles are visible to anyone who has not been verified.
          </p>
        </section>

        {rejected && (
          <section className={cx('panel', 'rejected')}>
            <strong>This submission was not approved</strong>
            <p>{status.rejection_reason || 'No reason was recorded.'}</p>
            <small>Correct what was raised and send it again.</small>
          </section>
        )}

        {!rejected && status.complete && status.approval_status === 'PENDING' && (
          <section className={cx('panel', 'waiting')}>
            <strong>With the admin team</strong>
            <p>Everything needed is here. We will email you when it has been reviewed.</p>
          </section>
        )}

        {/* Not a blocker, but the reviewer will see it, so say so now. */}
        {!!status.notes.length && (
          <section className={cx('panel', 'note')}>
            <strong>Worth knowing</strong>
            <ul>{status.notes.map(item => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        <form
          className={cx('form')}
          onSubmit={event => { event.preventDefault(); void save(true); }}
        >
          <label className={cx('field', 'wide')}>
            <span>Official website</span>
            <input
              name="website"
              value={draft.website || ''}
              placeholder="www.example.edu"
              onChange={event => set('website', event.target.value)}
            />
            <small>A reviewer checks that your sign-in address belongs to this domain.</small>
          </label>

          <label className={cx('field')}>
            <span>Country</span>
            <input name="country" value={draft.country || ''} onChange={event => set('country', event.target.value)} />
          </label>

          <label className={cx('field')}>
            <span>City</span>
            <input name="city" value={draft.city || ''} onChange={event => set('city', event.target.value)} />
          </label>


          {!!error && <p className={cx('error')}>{error}</p>}
          {!!note && <p className={cx('ok')}>{note}</p>}

          <footer className={cx('actions')}>
            <button type="button" className={cx('ghost')} disabled={busy} onClick={() => void save(false)}>
              Save and finish later
            </button>
            <button type="submit" className={cx('primary')} disabled={busy}>
              {status.approval_status === 'REJECTED' ? 'Send again for review' : 'Send for review'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}
