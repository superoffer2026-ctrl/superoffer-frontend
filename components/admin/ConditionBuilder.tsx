'use client';

import { useMemo } from 'react';
import type { ClassValue } from '@/lib/cx';

/**
 * Composes the tests that decide whether a rule speaks.
 *
 * The catalogue of fields, and which comparisons each allows, comes from the
 * server rather than a copy kept here — so a field added on the server appears
 * in this editor without a release, and the editor can never offer a comparison
 * the engine would refuse.
 *
 * One deliberate limit: this edits a single flat group, all tests joined by AND
 * or OR. The engine nests, but a nested builder is a tree editor, and a rule
 * nobody can read at a glance is a rule nobody trusts.
 */

export interface FieldDescriptor {
  key: string;
  label: string;
  type: 'text' | 'number' | 'enum';
  options?: string[];
  describes: string;
}

export interface ConditionCatalogue {
  fields: FieldDescriptor[];
  operatorsByType: Record<string, string[]>;
  operatorLabels: Record<string, string>;
}

export interface Predicate {
  field: string;
  operator: string;
  value?: string | number | string[];
}

export type ConditionValue = { all?: Predicate[]; any?: Predicate[] } | null;

const VALUELESS = ['isSet', 'isEmpty'];

/** Whatever is stored, as the flat list this editor edits. */
export function toRows(condition: unknown): { join: 'all' | 'any'; rows: Predicate[] } {
  if (!condition || typeof condition !== 'object') return { join: 'all', rows: [] };
  const value = condition as Record<string, unknown>;
  if (Array.isArray(value.any)) return { join: 'any', rows: value.any.filter(Boolean) as Predicate[] };
  if (Array.isArray(value.all)) return { join: 'all', rows: value.all.filter(Boolean) as Predicate[] };
  if (typeof value.field === 'string') return { join: 'all', rows: [value as unknown as Predicate] };
  /* The two-key shape rules were written in before conditions composed. */
  const legacy: Predicate[] = [];
  if (typeof value.organizationType === 'string' && value.organizationType) {
    legacy.push({ field: 'organization.type', operator: 'is', value: value.organizationType });
  }
  if (typeof value.category === 'string' && value.category) {
    legacy.push({ field: 'offer.category', operator: 'is', value: value.category });
  }
  return { join: 'all', rows: legacy };
}

/** An empty builder means no narrowing, which the engine reads as "every time". */
export function fromRows(join: 'all' | 'any', rows: Predicate[]): ConditionValue {
  const usable = rows.filter(row => row.field && row.operator);
  if (!usable.length) return null;
  return join === 'any' ? { any: usable } : { all: usable };
}

export function ConditionBuilder({
  catalogue, join, rows, onChange, cx, emptyLabel
}: {
  catalogue: ConditionCatalogue | null;
  join: 'all' | 'any';
  rows: Predicate[];
  onChange: (join: 'all' | 'any', rows: Predicate[]) => void;
  cx: (...names: ClassValue[]) => string;
  emptyLabel: string;
}) {
  const byKey = useMemo(
    () => new Map((catalogue?.fields || []).map(field => [field.key, field])),
    [catalogue]
  );

  if (!catalogue) return <p className={cx('condition-empty')}>Loading what a rule can read…</p>;

  const setRow = (index: number, next: Predicate) => {
    onChange(join, rows.map((row, i) => (i === index ? next : row)));
  };

  const addRow = () => {
    const first = catalogue.fields[0];
    const operator = catalogue.operatorsByType[first.type]?.[0] || 'is';
    onChange(join, [...rows, { field: first.key, operator, value: '' }]);
  };

  const removeRow = (index: number) => onChange(join, rows.filter((_, i) => i !== index));

  return (
    <div className={cx('condition-builder')}>
      {!rows.length && <p className={cx('condition-empty')}>{emptyLabel}</p>}

      {rows.map((row, index) => {
        const field = byKey.get(row.field);
        const operators = field ? catalogue.operatorsByType[field.type] || [] : [];
        const needsValue = !VALUELESS.includes(row.operator);

        return (
          <div key={index} className={cx('condition-row')}>
            <span className={cx('condition-join')}>
              {index === 0 ? 'When' : join === 'all' ? 'and' : 'or'}
            </span>

            <select
              value={row.field}
              onChange={event => {
                const next = byKey.get(event.target.value);
                const allowed = next ? catalogue.operatorsByType[next.type] || [] : [];
                /* Keep the comparison only if the new field still allows it. */
                const operator = allowed.includes(row.operator) ? row.operator : allowed[0] || 'is';
                setRow(index, { field: event.target.value, operator, value: '' });
              }}
            >
              {catalogue.fields.map(option => (
                <option key={option.key} value={option.key}>{option.label}</option>
              ))}
            </select>

            <select
              value={row.operator}
              onChange={event => {
                const operator = event.target.value;
                setRow(index, {
                  ...row,
                  operator,
                  value: VALUELESS.includes(operator) ? undefined : (row.value ?? '')
                });
              }}
            >
              {operators.map(operator => (
                <option key={operator} value={operator}>{catalogue.operatorLabels[operator] || operator}</option>
              ))}
            </select>

            {needsValue && field?.type === 'enum' && field.options?.length ? (
              <select
                value={String(row.value ?? '')}
                onChange={event => setRow(index, { ...row, value: event.target.value })}
              >
                <option value="">Choose…</option>
                {field.options.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            ) : needsValue ? (
              <input
                type={field?.type === 'number' ? 'number' : 'text'}
                value={String(row.value ?? '')}
                placeholder={field?.type === 'number' ? 'e.g. 2000000' : 'Value'}
                onChange={event => setRow(index, { ...row, value: event.target.value })}
              />
            ) : (
              <span className={cx('condition-novalue')}>—</span>
            )}

            <button type="button" className={cx('condition-remove')} onClick={() => removeRow(index)} aria-label="Remove this test">
              ×
            </button>

            {field && <small className={cx('condition-help')}>{field.describes}</small>}
          </div>
        );
      })}

      <div className={cx('condition-actions')}>
        <button type="button" onClick={addRow}>+ Add a test</button>
        {rows.length > 1 && (
          <label className={cx('condition-join-toggle')}>
            Match
            <select value={join} onChange={event => onChange(event.target.value as 'all' | 'any', rows)}>
              <option value="all">every test</option>
              <option value="any">any test</option>
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
