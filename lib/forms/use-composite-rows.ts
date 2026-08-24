'use client';

import { useMemo } from 'react';
import { useReferenceOptions } from '@/components/student/SchemaFields';
import { isFieldVisible, useFormSection, type FormFieldDef } from './use-form-schema';

export interface CompositeRows {
  /** Every enabled row field, in the admin's order. */
  all: FormFieldDef[];
  /**
   * The fields one row should show, given that row's own values.
   *
   * A row's condition points at another value in the same row — the qualification
   * level, the exam status — so visibility is decided per row, not per section.
   */
  forRow: (values: Record<string, unknown>) => FormFieldDef[];
  /** Options for a field, with any `reference:` pointer already resolved. */
  optionsFor: (field: FormFieldDef) => string[];
  /** Every visible field in a row that is required and still blank. */
  missingIn: (values: Record<string, unknown>) => string[];
  loading: boolean;
}

const isBlank = (value: unknown) =>
  value === undefined || value === null || (typeof value === 'string' && !value.trim());

/**
 * The row definition of a repeating block, as published.
 *
 * The block's own behaviour stays in the component that owns it — how many rows
 * there are, what drives them, what the server derives from them. What each row
 * *asks for* comes from here, so an admin can relabel, reorder, hide, or add a
 * field inside a repeating block without a code change.
 */
export function useCompositeRows(
  sectionKey: string,
  fieldKey: string,
  form = 'STUDENT_PROFILE',
  variant = 'DEFAULT'
): CompositeRows {
  const { fields, loading } = useFormSection(sectionKey, form, variant);
  const reference = useReferenceOptions();

  return useMemo(() => {
    const composite = fields.find(field => field.key === fieldKey);
    const all = (composite?.itemFields || [])
      .filter(field => field.enabled)
      .sort((a, b) => a.order - b.order);

    const optionsFor = (field: FormFieldDef): string[] => {
      if (field.optionsSource?.startsWith('reference:')) {
        return reference[field.optionsSource.slice('reference:'.length)] || [];
      }
      return field.options || [];
    };

    const forRow = (values: Record<string, unknown>) => all.filter(field => isFieldVisible(field, values));

    return {
      all,
      forRow,
      optionsFor,
      missingIn: (values: Record<string, unknown>) =>
        forRow(values).filter(field => field.required && isBlank(values[field.key])).map(field => field.key),
      loading
    };
  }, [fields, fieldKey, reference, loading]);
}
