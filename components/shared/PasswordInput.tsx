'use client';

import { useState, type InputHTMLAttributes } from 'react';

/**
 * A password box you can look inside.
 *
 * Typing a password you cannot see is how typos become failed logins and
 * pointless resets, so every password field in SuperOffer gets the same toggle
 * rather than each screen inventing its own. The surrounding stylesheet still
 * dresses the `input` — module rules like `.password-form input` and global
 * ones like `.auth-panel form input` both match through the wrapper — so this
 * changes behaviour without disturbing any screen's look.
 *
 * `type` is owned by the component and deliberately not accepted from callers.
 */
export function PasswordInput({
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [revealed, setRevealed] = useState(false);
  const action = revealed ? 'Hide password' : 'Show password';

  return (
    <span className="password-field">
      <input {...props} type={revealed ? 'text' : 'password'} />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setRevealed(current => !current)}
        aria-label={action}
        aria-pressed={revealed}
        title={action}
      >
        {revealed ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 3l18 18" strokeLinecap="round" />
            <path d="M10.6 5.1A9.9 9.9 0 0 1 12 5c5 0 9 4.5 10 7a15.6 15.6 0 0 1-3.4 4.3M6.5 7.1C4.3 8.6 2.7 10.8 2 12c1 2.5 5 7 10 7a10.4 10.4 0 0 0 4.2-.9" strokeLinecap="round" />
            <path d="M9.9 10a3 3 0 0 0 4.2 4.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </span>
  );
}
