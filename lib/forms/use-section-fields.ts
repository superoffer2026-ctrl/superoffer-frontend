'use client';

import { useMemo } from 'react';
import { isFieldVisible, useFormSection, validateField, type FormFieldDef } from './use-form-schema';

export interface SectionFields {
  /** The section's own title, as published. */
  title: string;
  /** The line under the title, as published. */
  description: string;
  /** A heading within the section, falling back to the coded one. */
  groupLabel: (key: string, fallback: string) => string;
  /** The line under one option of a field, if the admin wrote one. */
  hintFor: (key: string, option: string, fallback?: string) => string | undefined;
  /** Every enabled field the admin has published for this section, in order. */
  fields: FormFieldDef[];
  /** Whether a coded field is still published. An unknown key stays visible. */
  shows: (key: string) => boolean;
  /** The admin's label for a coded field, falling back to the coded one. */
  labelOf: (key: string, fallback: string) => string;
  /** Whether the admin marked a coded field required. */
  isRequired: (key: string, fallback?: boolean) => boolean;
  /** The admin's placeholder, falling back to the coded one. */
  placeholderOf: (key: string, fallback?: string) => string | undefined;
  /** Help text the admin added, if any. */
  helpOf: (key: string) => string | undefined;
  /** Fields the admin added beyond the ones the step draws by hand. */
  added: FormFieldDef[];
  /** First problem across the added fields, or empty when they all pass. */
  validateAdded: (values: Record<string, unknown>) => string;
  loading: boolean;
}

/**
 * What the published form says about the fields a step draws by hand.
 *
 * The step keeps its layout — a combo box that filters one list by another, a
 * conditional block, a composite — and asks this what the admin changed: a field
 * hidden, relabelled, made required, given a different placeholder.
 *
 * A key the schema has never heard of stays visible. Silence means "no opinion",
 * not "remove it": an admin who has not touched a form should never find that
 * opening the builder emptied it.
 */
export function useSectionFields(
  sectionKey: string,
  /** The keys this step draws itself; anything else published is an addition. */
  codedKeys: string[],
  form = 'STUDENT_PROFILE',
  variant = 'DEFAULT'
): SectionFields {
  const { section, fields, loading } = useFormSection(sectionKey, form, variant);
  /** A stable identity, so passing an inline array does not re-run the memo. */
  const coded = codedKeys.join(',');

  return useMemo(() => {
    const byKey = new Map(fields.map(field => [field.key, field]));
    const drawnByHand = coded.split(',');
    const added = fields.filter(field => !field.composite && !drawnByHand.includes(field.key));

    const groups = new Map((section?.groups || []).map(group => [group.key, group.label]));

    return {
      title: section?.label || '',
      description: section?.description || '',
      groupLabel: (key: string, fallback: string) => groups.get(key) || fallback,
      hintFor: (key: string, option: string, fallback?: string) =>
        byKey.get(key)?.optionHints?.[option] ?? fallback,
      fields,
      /** Before the schema arrives, nothing is hidden — the form must not flicker. */
      shows: (key: string) => (loading || !fields.length ? true : byKey.has(key)),
      labelOf: (key: string, fallback: string) => byKey.get(key)?.label || fallback,
      isRequired: (key: string, fallback = false) => byKey.get(key)?.required ?? fallback,
      placeholderOf: (key: string, fallback?: string) => byKey.get(key)?.placeholder || fallback,
      helpOf: (key: string) => byKey.get(key)?.helpText,
      added,
      validateAdded: (values: Record<string, unknown>) => {
        for (const field of added) {
          if (!isFieldVisible(field, values)) continue;
          const problem = validateField(field, values[field.key]);
          if (problem) return `${field.label}: ${problem}`;
        }
        return '';
      },
      loading
    };
  }, [section, fields, loading, coded]);
}
