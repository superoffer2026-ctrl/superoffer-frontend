'use client';

import { useRef, type ReactNode } from 'react';
import { classNames } from '@/lib/cx';
import styles from '@/styles/StudyPreferences.module.css';

const cx = classNames(styles);

export interface MultiComboFieldProps {
  label: ReactNode;
  placeholder: string;
  toggleLabel: string;
  emptyText: string;
  options: string[];
  selected: string[];
  open: boolean;
  query: string;
  invalid: boolean;
  error: string;
  hint?: ReactNode;
  onOpen(): void;
  onClose(): void;
  onQueryChange(value: string): void;
  onToggleOption(value: string): void;
}

/**
 * The five Study Preferences fields are the same multi-select combo box with
 * different labels and option lists, so the markup lives here once instead of
 * being repeated five times as it was in the Angular template.
 */
export function MultiComboField({
  label, placeholder, toggleLabel, emptyText, options, selected, open, query,
  invalid, error, hint, onOpen, onClose, onQueryChange, onToggleOption
}: MultiComboFieldProps) {
  const input = useRef<HTMLInputElement>(null);

  /** Lets the dropdown arrow open/close the list without needing to click into the text box first. */
  const toggleOpen = () => {
    if (open) {
      onClose();
      input.current?.blur();
    } else {
      onOpen();
      input.current?.focus();
    }
  };

  return (
    <div className={cx('combo-field', 'wide', invalid && 'field-invalid')}>
      <span className={cx('field-label')}>{label}</span>
      <div className={cx('combo-input-wrap')}>
        {selected.map(item => (
          <span key={item} className={cx('tag-chip')}>
            {item}
            <button
              type="button"
              onMouseDown={event => event.preventDefault()}
              onClick={() => onToggleOption(item)}
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={input}
          type="text"
          placeholder={placeholder}
          value={open ? query : ''}
          onFocus={onOpen}
          onChange={event => onQueryChange(event.target.value)}
          onBlur={onClose}
        />
        <button
          type="button"
          className={cx('combo-arrow', open && 'open')}
          onMouseDown={event => event.preventDefault()}
          onClick={toggleOpen}
          aria-label={toggleLabel}
        >
          ▾
        </button>
      </div>
      {open && (
        <ul className={cx('combo-list')} onMouseDown={event => event.preventDefault()}>
          {options.map(option => (
            <li key={option} onClick={() => onToggleOption(option)}>
              <span className={cx('option-check', selected.includes(option) && 'checked')}>✓</span>
              {option}
            </li>
          ))}
          {!options.length && <li className={cx('combo-empty')}>{emptyText}</li>}
        </ul>
      )}
      {hint}
      {invalid && <small className={cx('field-error')}>{error}</small>}
    </div>
  );
}
