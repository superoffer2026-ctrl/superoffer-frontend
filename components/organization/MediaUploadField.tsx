'use client';

import { useId, useRef, useState, type DragEvent } from 'react';
import { classNames } from '@/lib/cx';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

/** How the frame is proportioned — a mark, a banner, or the full column. */
export type MediaShape = 'logo' | 'cover' | 'wide';

const SHAPE_HINT: Record<MediaShape, string> = {
  logo: 'Square works best',
  cover: 'Landscape, 16:9',
  wide: 'Landscape, 16:9'
};

export interface MediaUploadFieldProps {
  label: string;
  /** What this image is for, in the officer's terms. */
  hint: string;
  /** The image currently stored, or null/undefined when there is none yet. */
  url?: string | null;
  alt: string;
  shape: MediaShape;
  accept: string;
  maxMb?: number;
  /** Called once the file has passed type and size checks. */
  onSelect: (file: File) => Promise<void> | void;
  /** Full-width in the settings grid. */
  wide?: boolean;
}

/**
 * One image on the organisation's public face — its logo, its cover, a
 * programme photo.
 *
 * These used to be a bare `<input type="file">` under an `<img>`. Two things
 * were wrong with that. A stored image the browser cannot fetch rendered as a
 * broken-image glyph with its alt text spilling out of the frame, which reads
 * as a corrupted upload rather than a URL that did not resolve — so a load
 * failure falls back to the same empty state as no image at all. And the native
 * control put "Choose file / No file chosen" in the middle of a styled form,
 * saying nothing about what is wanted; the frame now shows the aspect ratio the
 * image will be cropped to, and the button says what it will do.
 *
 * The file can also be dropped straight onto the frame, which is how anyone who
 * has the logo open in a folder will reach for it first.
 */
export function MediaUploadField({
  label, hint, url, alt, shape, accept, maxMb = 5, onSelect, wide = true
}: MediaUploadFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  /** The one URL known to be unfetchable, so a later upload gets a fresh try. */
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);

  const hasImage = !!url && brokenUrl !== url;

  const take = async (file: File | undefined) => {
    if (!file) return;
    setError('');

    /** `accept` is only a filter on the picker, and drag-and-drop bypasses it. */
    const allowed = accept.split(',').map(type => type.trim()).filter(Boolean);
    if (allowed.length && !allowed.includes(file.type)) {
      setError(`${file.type || 'That file'} is not an accepted image format.`);
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${maxMb} MB.`);
      return;
    }

    setBusy(true);
    try {
      await onSelect(file);
      setBrokenUrl(null);
    } finally {
      setBusy(false);
      /** Re-picking the same file must still fire a change event. */
      if (input.current) input.current.value = '';
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void take(event.dataTransfer.files?.[0]);
  };

  return (
    <div className={cx('media-field', wide && 'wide')}>
      <span className={cx('media-label')} id={`${fieldId}-label`}>{label}</span>

      <div className={cx('media-row', shape === 'wide' && 'media-row-stacked')}>
        <div
          className={cx('media-frame', `media-frame-${shape}`, dragging && 'dragging', busy && 'busy')}
          onDragOver={event => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {hasImage ? (
            <img src={url!} alt={alt} onError={() => setBrokenUrl(url!)} />
          ) : (
            <span className={cx('media-empty')} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.6" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <b>{SHAPE_HINT[shape]}</b>
            </span>
          )}
          {busy && <span className={cx('media-busy')} aria-hidden="true"><i /></span>}
        </div>

        <div className={cx('media-side')}>
          <div className={cx('media-actions')}>
            <button
              type="button"
              className={cx('uni-secondary', 'media-btn')}
              onClick={() => input.current?.click()}
              disabled={busy}
              aria-describedby={`${fieldId}-label`}
            >
              {busy ? 'Uploading…' : hasImage ? `Replace ${label.toLowerCase()}` : `Upload ${label.toLowerCase()}`}
            </button>
            <span className={cx('media-drop-hint')}>or drop a file here</span>
          </div>
          <p className={cx('media-hint')}>{hint}</p>
          <p className={cx('media-spec')}>
            {accept.split(',').map(type => type.trim().replace('image/', '').replace('svg+xml', 'svg').toUpperCase()).join(' · ')}
            {' · up to '}{maxMb} MB
          </p>
          {!!error && <p className={cx('media-error')} role="alert">{error}</p>}
          {/* A stored image that will not load is the organisation's problem to
              see, not something to hide behind an empty frame. */}
          {!!url && brokenUrl === url && !error && (
            <p className={cx('media-error')} role="status">The image on file could not be loaded. Upload it again to replace it.</p>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        className={cx('media-input')}
        accept={accept}
        onChange={event => void take(event.target.files?.[0])}
      />
    </div>
  );
}
