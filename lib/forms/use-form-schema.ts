'use client';

import { useEffect, useState } from 'react';
import { authApi } from '../api/auth-api';

export type FieldType =
  | 'text' | 'email' | 'tel' | 'number' | 'textarea'
  | 'select' | 'multiselect' | 'checkbox' | 'date' | 'composite';

export interface FormFieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  enabled: boolean;
  order: number;
  options?: string[];
  optionsSource?: string;
  validation?: { min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string; message?: string };
  visibleWhen?: { field: string; equals: string[] };
  composite?: string;
  /** For a composite: the fields of one row, editable like any other. */
  itemFields?: FormFieldDef[];
  /** For a select: lets someone type a value the option list does not carry. */
  allowCustom?: boolean;
  /** The heading this field sits under, by group key. */
  group?: string;
  /** A line of explanation under one option, keyed by the option itself. */
  optionHints?: Record<string, string>;
  wide?: boolean;
}

/** A heading within a section, above the fields assigned to it. */
export interface FormGroupDef {
  key: string;
  label: string;
  order: number;
}

export interface FormSectionDef {
  key: string;
  label: string;
  groups?: FormGroupDef[];
  description?: string;
  route: string;
  column: string;
  order: number;
  enabled: boolean;
  fields: FormFieldDef[];
}

export interface FormSchemaDef {
  variant: string;
  label: string;
  sections: FormSectionDef[];
}

/**
 * The published schema, fetched once per page load and shared.
 *
 * It changes only when an admin publishes, so a module-level promise is enough —
 * every section that mounts reuses the same request rather than each fetching
 * the whole form.
 */
/** One entry per form and variant, because the portal now renders several. */
const cache = new Map<string, Promise<FormSchemaDef>>();

const cacheKey = (form: string, variant: string) => `${form}:${variant}`;

export function loadFormSchema(force = false, form = 'STUDENT_PROFILE', variant = 'DEFAULT'): Promise<FormSchemaDef> {
  const key = cacheKey(form, variant);
  if (force) cache.delete(key);

  const existing = cache.get(key);
  if (existing) return existing;

  const pending = authApi.formSchema(variant, form).catch(error => {
    /** A failed fetch must not be cached, or the page never recovers. */
    cache.delete(key);
    throw error;
  });
  cache.set(key, pending);
  return pending;
}

export interface UseFormSection {
  section?: FormSectionDef;
  fields: FormFieldDef[];
  loading: boolean;
  error: string;
}

/**
 * The definition for one section of the student form.
 *
 * Returns only enabled fields in the admin's order, so a component renders what
 * is published rather than what was coded.
 */
export function useFormSection(
  sectionKey: string,
  /** Which form the section belongs to. Defaults to the student profile. */
  form = 'STUDENT_PROFILE',
  variant = 'DEFAULT'
): UseFormSection {
  const [section, setSection] = useState<FormSectionDef | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadFormSchema(false, form, variant)
      .then(schema => {
        if (cancelled) return;
        setSection(schema.sections.find(entry => entry.key === sectionKey));
      })
      .catch(e => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'The form could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [sectionKey, form, variant]);

  const fields = (section?.fields || [])
    .filter(field => field.enabled)
    .sort((a, b) => a.order - b.order);

  return { section, fields, loading, error };
}

/** Whether a field's condition is met by the answers so far. */
export function isFieldVisible(field: FormFieldDef, values: Record<string, unknown>): boolean {
  if (!field.visibleWhen) return true;
  const actual = values[field.visibleWhen.field];
  const wanted = field.visibleWhen.equals || [];
  if (!wanted.length) return true;
  if (Array.isArray(actual)) return actual.some(entry => wanted.includes(String(entry)));
  return wanted.includes(String(actual ?? ''));
}

/**
 * Client-side mirror of the server's field rules, so a student sees the problem
 * as they type rather than after a round trip. The server re-checks everything.
 */
export function validateField(field: FormFieldDef, value: unknown): string {
  const blank = value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);

  if (blank) return field.required ? `${field.label} is required` : '';
  if (field.type === 'checkbox') return field.required && value !== true ? `${field.label} must be accepted` : '';
  if (field.type === 'multiselect') return '';

  const text = String(value);

  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return `${field.label} must be a valid email address`;
  }
  if (field.type === 'number') {
    const numeric = Number(text.replace(/,/g, ''));
    if (Number.isNaN(numeric)) return `${field.label} must be a number`;
    if (field.validation?.min !== undefined && numeric < field.validation.min) {
      return `${field.label} must be at least ${field.validation.min}`;
    }
    if (field.validation?.max !== undefined && numeric > field.validation.max) {
      return `${field.label} must be at most ${field.validation.max}`;
    }
    return '';
  }
  if (field.validation?.minLength !== undefined && text.length < field.validation.minLength) {
    return `${field.label} must be at least ${field.validation.minLength} characters`;
  }
  if (field.validation?.maxLength !== undefined && text.length > field.validation.maxLength) {
    return `${field.label} must be at most ${field.validation.maxLength} characters`;
  }
  if (field.validation?.pattern) {
    try {
      if (!new RegExp(field.validation.pattern).test(text)) {
        return field.validation.message || `${field.label} is not in the expected format`;
      }
    } catch {
      /** An uncompilable pattern is ignored here; the builder refuses to save one. */
    }
  }
  return '';
}
