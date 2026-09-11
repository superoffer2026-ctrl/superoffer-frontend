'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { readAccessToken } from '@/lib/storage';
import styles from '@/styles/StudentMessages.module.css';
import { StudentWorkspaceShell } from './StudentWorkspaceShell';

const cx = classNames(styles);

/** How often an open thread checks for replies. */
const POLL_MS = 8000;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

interface Attachment {
  fileName: string;
  mimeType: string;
  size: number;
}

interface Message {
  id: string;
  /** 'system' is the platform speaking for neither side — a notice, not a reply. */
  from: 'institution' | 'student' | 'system';
  author: string;
  body: string;
  sentAt: string;
  /** Written by an automation rule rather than typed by a person. */
  automatic?: boolean;
  attachment: Attachment | null;
}

interface Conversation {
  offerId: string;
  institution: string;
  initial: string;
  contact: string;
  contactRole: string;
  program: string;
  headline: string;
  status: string;
  closedToNegotiation: boolean;
  unread: number;
  lastMessageAt: string;
  preview: string;
  messages: Message[];
}

const clockTime = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

const fileSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * The student's side of the conversation with an organization.
 *
 * A thread belongs to an offer, which is what opens the channel. It stays usable
 * after a decision — an accepted offer still needs questions about visas and
 * documents — but a settled offer can no longer be re-negotiated, and the header
 * says so rather than letting the student expect otherwise.
 */
export function StudentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);

  const threadRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const token = readAccessToken();
    if (!token) return;
    try {
      const response = await authApi.studentMessages(token);
      setConversations((response?.conversations || []) as Conversation[]);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Your messages could not be loaded.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Polling stands in for push; it is cheap and needs no extra infrastructure. */
  useEffect(() => {
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const selected = conversations.find(c => c.offerId === selectedId) || conversations[0];

  /** Opening a thread clears this side's badge only. */
  useEffect(() => {
    if (!selected || !selected.unread) return;
    const token = readAccessToken();
    if (!token) return;
    void authApi.markOfferThreadRead(token, selected.offerId).then(() => {
      setConversations(current =>
        current.map(c => (c.offerId === selected.offerId ? { ...c, unread: 0 } : c))
      );
    });
  }, [selected]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [selected?.messages.length, selected?.offerId]);

  const chooseFile = (chosen?: File) => {
    if (!chosen) return;
    if (chosen.size > MAX_ATTACHMENT_BYTES) {
      setError('Attachments are limited to 10 MB.');
      return;
    }
    setError('');
    setFile(chosen);
  };

  const send = async () => {
    const body = draft.trim();
    const token = readAccessToken();
    if ((!body && !file) || !selected || !token) return;

    setSending(true);
    setError('');
    try {
      await authApi.messageOffer(token, selected.offerId, body || `Sent ${file?.name}`, file || undefined);
      setDraft('');
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  /** Attachments are behind bearer auth, so they open through a blob URL. */
  const openAttachment = async (message: Message) => {
    const token = readAccessToken();
    if (!token || !selected) return;
    try {
      const url = await authApi.studentAttachmentUrl(token, selected.offerId, message.id);
      window.open(url, '_blank', 'noopener');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That attachment could not be opened.');
    }
  };

  return (
    <StudentWorkspaceShell layout="workspace" backdrop="scene" sky={['#e6f7ff', '#e9e6ff', '#fff0d6']}>
      <main className={cx('messages-page')}>
        <section className={cx('messages-workspace')}>
          <aside className={cx('messages-list')}>
            <header>
              <strong>Messages</strong>
              <small>{conversations.length} conversation{conversations.length === 1 ? '' : 's'}</small>
            </header>

            {conversations.map(conversation => (
              <button
                key={conversation.offerId}
                type="button"
                className={cx('messages-list-item', conversation.offerId === selected?.offerId && 'selected')}
                onClick={() => setSelectedId(conversation.offerId)}
              >
                <span className={cx('messages-avatar')}>{conversation.initial}</span>
                <span className={cx('messages-list-main')}>
                  <span className={cx('messages-list-head')}>
                    <strong>{conversation.institution}</strong>
                    <time>{clockTime(conversation.lastMessageAt)}</time>
                  </span>
                  <small>{conversation.program}</small>
                  <p>{conversation.preview || 'No messages yet'}</p>
                </span>
                {!!conversation.unread && <i className={cx('messages-unread')}>{conversation.unread}</i>}
              </button>
            ))}

            {loaded && !conversations.length && (
              <p className={cx('messages-empty-note')}>
                No conversations yet. A thread opens when an organization sends you an offer.
              </p>
            )}
          </aside>

          {!selected && (
            <section className={cx('messages-thread', 'messages-thread-empty')}>
              <div className={cx('messages-empty-state')}>
                <span>✉</span>
                <h2>No conversation selected</h2>
                <p>
                  Universities and lenders message you here once they send an offer. Complete and submit
                  your profile so they can find you.
                </p>
              </div>
            </section>
          )}

          {selected && (
            <section className={cx('messages-thread')}>
              <header className={cx('messages-thread-head')}>
                <span className={cx('messages-avatar')}>{selected.initial}</span>
                <div>
                  <h2>{selected.contact}</h2>
                  <p>{selected.contactRole || selected.institution} · {selected.program}</p>
                </div>
                <span className={cx('messages-status', selected.closedToNegotiation && 'settled')}>{selected.status}</span>
              </header>

              {selected.closedToNegotiation && (
                <div className={cx('messages-notice')}>
                  This offer is settled, so its terms can no longer be negotiated — but you can still message
                  {' '}{selected.institution} about next steps.
                </div>
              )}

              <div className={cx('messages-thread-body')} ref={threadRef}>
                {selected.messages.map(message =>
                  /** A platform notice belongs to neither side, so it is not given a bubble. */
                  message.from === 'system' ? (
                    <p key={message.id} className={cx('messages-notice')}>
                      {message.body}
                      <time>{clockTime(message.sentAt)}</time>
                    </p>
                  ) : (
                  <article key={message.id} className={cx('messages-bubble', message.from === 'student' && 'mine')}>
                    <small>
                      {message.from === 'student' ? 'You' : message.author}
                      {/* Named, but not typed by that person — say so rather than let it pass as written. */}
                      {message.automatic && <span className={cx('messages-auto-tag')}>Automatic</span>}
                    </small>
                    <p>{message.body}</p>
                    {message.attachment && (
                      <button type="button" className={cx('messages-attachment')} onClick={() => void openAttachment(message)}>
                        <span>📎</span>
                        <span className={cx('messages-attachment-name')}>{message.attachment.fileName}</span>
                        <em>{fileSize(message.attachment.size)}</em>
                      </button>
                    )}
                    <time>{clockTime(message.sentAt)}</time>
                  </article>
                  )
                )}
                {!selected.messages.length && (
                  <p className={cx('messages-empty-note')}>No messages yet — say hello.</p>
                )}
              </div>

              {error && <p className={cx('messages-error')}>{error}</p>}

              {file && (
                <div className={cx('messages-pending-file')}>
                  <span>📎 {file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileInput.current) fileInput.current.value = ''; }}>
                    Remove
                  </button>
                </div>
              )}

              <form className={cx('messages-composer')} onSubmit={event => { event.preventDefault(); void send(); }}>
                <label className={cx('messages-attach-btn')} title="Attach a file">
                  ＋
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
                    onChange={event => chooseFile(event.target.files?.[0])}
                  />
                </label>
                <input
                  name="messageDraft"
                  value={draft}
                  placeholder={`Message ${selected.institution}…`}
                  autoComplete="off"
                  onChange={event => setDraft(event.target.value)}
                />
                <button type="submit" disabled={sending || (!draft.trim() && !file)}>
                  {sending ? 'Sending…' : 'Send'}
                </button>
              </form>
            </section>
          )}
        </section>
      </main>
    </StudentWorkspaceShell>
  );
}
