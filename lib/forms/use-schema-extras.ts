'use client';

import { useEffect, useRef, useState } from 'react';
import { useFormSection, validateField, type FormFieldDef } from './use-form-schema';

export interface SchemaExtras {
  /** Admin-added fields for this section, in the published order. */
  fields: FormFieldDef[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  /** True when every added field passes its own rules. */
  valid: boolean;
  setValue: (key: string, value: unknown) => void;
  setTouched: (key: string) => void;
  /** Reveals every error at once, for the moment the student presses Continue. */
  touchAll: () => void;
  /** Merge into the payload so the added answers save with the rest. */
  values0: Record<string, unknown>;
}

/**
 * The fields an admin has added to a section, on top of the ones the step draws
 * by hand.
 *
 * Each wizard step still owns its bespoke layout and its composite blocks; this
 * supplies whatever the published schema declares beyond them, already seeded
 * from the saved profile and validated by the same rules the server applies.
 * That is what lets an admin extend a form without a code change, while the
 * carefully built steps keep their design.
 */
export function useSchemaExtras(
  sectionKey: string,
  codedKeys: string[],
  saved: Record<string, unknown> | undefined,
  loaded: boolean
): SchemaExtras {
  const { fields: schemaFields } = useFormSection(sectionKey);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const seeded = useRef(false);

  const fields = schemaFields.filter(field => !field.composite && !codedKeys.includes(field.key));

  /** Seeded once, so the server's answers appear without fighting typing. */
  useEffect(() => {
    if (seeded.current || !loaded) return;
    seeded.current = true;
    if (saved) setValues(current => ({ ...saved, ...current }));
  }, [loaded, saved]);

  const errors = Object.fromEntries(
    fields.map(field => [field.key, validateField(field, values[field.key])])
  );

  return {
    fields,
    values,
    errors,
    touched,
    valid: Object.values(errors).every(message => !message),
    setValue: (key, value) => setValues(current => ({ ...current, [key]: value })),
    setTouched: key => setTouchedState(current => ({ ...current, [key]: true })),
    touchAll: () => setTouchedState(Object.fromEntries(fields.map(field => [field.key, true]))),
    /** Only the keys this section's schema declares, never stray state. */
    get values0() {
      return Object.fromEntries(
        fields.filter(field => values[field.key] !== undefined).map(field => [field.key, values[field.key]])
      );
    }
  };
}
