'use client';

import { useEffect, useState } from 'react';
import { classNames } from '@/lib/cx';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudentWorkspacePages.module.css';

const cx = classNames(styles);

const SUPPORT_EMAIL = 'support@superoffer.net';

interface SupportMessage {
  from: 'support' | 'student';
  text: string;
  time: string;
}

/** Settings' "Chat with us" row opens this panel by dispatching the same window event Angular used. */
export const OPEN_SUPPORT_CHAT_EVENT = 'open-student-support-chat';

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/**
 * Support composer.
 *
 * There is no ticketing or live-chat service behind this yet, so the panel does
 * not pretend a message has been received: what the student types is turned into
 * a pre-filled email to the support address, which is the channel that actually
 * reaches someone. Swap `handoff` for a real endpoint when one exists.
 */
export function StudentSupportChat() {
  const profile = useStudentProfile();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, show);
    return () => window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, show);
  }, []);

  const handoff = (text: string) => {
    const subject = encodeURIComponent(`SuperOffer support — ${profile.fullName}`);
    const body = encodeURIComponent(`${text}\n\n—\nSent from the SuperOffer student workspace\nAccount: ${profile.user?.email || ''}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(current => [
      ...current,
      { from: 'student', text, time: now() },
      {
        from: 'support',
        text: `Live chat isn't connected yet, so this hasn't reached anyone. We've opened an email to ${SUPPORT_EMAIL} with your message — send that and the team will reply there.`,
        time: now()
      }
    ]);
    setDraft('');
    handoff(text);
  };

  return (
    <>
      <button
        className={cx('floating-chat-button')}
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        aria-label="Contact SuperOffer Support"
      >
        <span>{open ? '×' : '◌'}</span>
        {!open && <strong>Contact us</strong>}
      </button>

      {open && (
        <section className={cx('floating-chat-panel')}>
          <header className={cx('support-chat-head')}>
            <span className={cx('support-agent')}>S</span>
            <div>
              <h2>SuperOffer Support</h2>
              <p>Email support · replies within one working day</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close support">×</button>
          </header>

          <div className={cx('support-chat-notice')}>
            Live chat isn&apos;t available yet. Write your message here and we&apos;ll open an email to{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with it ready to send.
          </div>

          <div className={cx('support-chat-thread')}>
            {!messages.length && (
              <div>
                <small>SuperOffer Support</small>
                <p>
                  Tell us what you need help with — your profile, your offers, or your documents — and we&apos;ll pick it
                  up by email.
                </p>
                <time>{now()}</time>
              </div>
            )}
            {messages.map((message, index) => (
              <div key={index} className={cx(message.from === 'student' && 'student-chat-message')}>
                <small>{message.from === 'student' ? 'You' : 'SuperOffer Support'}</small>
                <p>{message.text}</p>
                <time>{message.time}</time>
              </div>
            ))}
          </div>

          <form className={cx('support-chat-composer')} onSubmit={event => { event.preventDefault(); send(); }}>
            <input
              name="supportMessage"
              value={draft}
              placeholder="What do you need help with?"
              autoComplete="off"
              onChange={event => setDraft(event.target.value)}
            />
            <button className={cx('send-chat')} type="submit" disabled={!draft.trim()} aria-label="Compose email to support">➤</button>
          </form>
        </section>
      )}
    </>
  );
}
