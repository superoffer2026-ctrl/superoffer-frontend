'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import type { ClassValue } from '@/lib/cx';
import { isFieldVisible, type FormFieldDef } from '@/lib/forms/use-form-schema';
import { MultiComboField } from './MultiComboField';

/**
 * Renders the flat fields of a section from the published schema.
 *
 * The markup and class names match what the hand-written steps used, so a form
 * driven by the schema is indistinguishable from the one that was coded — the
 * definition moved, the design did not. Composite blocks are not handled here;
 * the step that owns them renders those itself.
 */

/** Reference lists a field can borrow, fetched once and shared across fields. */
let referenceCache: Promise<Record<string, string[]>> | null = null;

function loadReferenceOptions(): Promise<Record<string, string[]>> {
  if (!referenceCache) {
    referenceCache = Promise.all([
      authApi.getGeoReferenceData(),
      authApi.getStudyPreferencesReferenceData(),
      authApi.getAcademicInformationReferenceData(),
      authApi.getFinancialInformationReferenceData(),
      authApi.getEnglishExamReferenceData(),
      authApi.getCompetitiveExamReferenceData(),
      authApi.getWorkExperienceReferenceData()
    ])
      .then(([geo, study, academic, financial, english, competitive, work]) => ({
        countries: geo.countries.map(country => country.name),
        dialCodes: geo.countries.map(country => country.iso2),
        indiaCities: geo.indiaCities,
        studyCountries: study.studyCountries,
        fieldsOfStudy: study.fieldsOfStudy,
        intakeOptions: study.intakeOptions,
        startYears: study.startYears,
        qualificationOptions: academic.qualificationOptions,
        curriculumOptions: academic.curriculumOptions,
        educationGapOptions: academic.educationGapOptions,
        educationYears: academic.educationYears,
        universityOptions: academic.universityOptions,
        englishExamOptions: english.englishExamOptions,
        competitiveExamOptions: competitive.competitiveExamOptions,
        examStatusOptions: english.examStatusOptions,
        employmentTypes: work.employmentTypes,
        fundingSourceOptions: financial.fundingSourceOptions,
        earningMemberOptions: financial.earningMemberOptions,
        currencyOptions: financial.currencyOptions,
        employmentCategoryOptions: financial.employmentCategoryOptions
      }))
      .catch(error => {
        referenceCache = null;
        throw error;
      });
  }
  return referenceCache;
}

export function useReferenceOptions() {
  const [options, setOptions] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let cancelled = false;
    loadReferenceOptions()
      .then(loaded => { if (!cancelled) setOptions(loaded); })
      .catch(() => { /* Dropdowns stay empty; free-text entry still works. */ });
    return () => { cancelled = true; };
  }, []);

  return options;
}

/**
 * The multi-select combo box, with its open/query state owned here so the schema
 * renderer stays declarative. It renders its own label, so it is not wrapped in
 * the generic one.
 */
function SchemaMultiSelect({
  field, options, selected, error, cx, onChange
}: {
  field: FormFieldDef;
  options: string[];
  selected: string[];
  error: string;
  cx: (...names: ClassValue[]) => string;
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter(entry => entry !== value) : [...selected, value]);

  return (
    <MultiComboField
      label={
        <span className={cx('field-label')}>
          {field.label}
          {field.required && <span className={cx('required-mark')}> *</span>}
        </span>
      }
      placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`}
      toggleLabel={`Toggle ${field.label.toLowerCase()} options`}
      emptyText="No matches"
      options={options}
      selected={selected}
      open={open}
      query={query}
      invalid={!!error}
      error={error}
      hint={field.helpText}
      onOpen={() => setOpen(true)}
      onClose={() => { setOpen(false); setQuery(''); }}
      onQueryChange={setQuery}
      onToggleOption={toggle}
    />
  );
}

interface SchemaFieldsProps {
  fields: FormFieldDef[];
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  cx: (...names: ClassValue[]) => string;
  onChange: (key: string, value: unknown) => void;
  onBlur: (key: string) => void;
  /** Keys the owning step renders itself, usually because they are composites. */
  skip?: string[];
}

export function SchemaFields({ fields, values, errors, touched, cx, onChange, onBlur, skip = [] }: SchemaFieldsProps) {
  const options = useReferenceOptions();

  const optionsFor = (field: FormFieldDef): string[] => {
    if (field.optionsSource?.startsWith('reference:')) {
      return options[field.optionsSource.slice('reference:'.length)] || [];
    }
    return field.options || [];
  };

  const invalid = (key: string) => Boolean(errors[key]) && touched[key];

  return (
    <>
      {fields
        .filter(field => !field.composite && !skip.includes(field.key))
        .filter(field => isFieldVisible(field, values))
        .map(field => {
          const value = values[field.key];
          const list = optionsFor(field);

          if (field.type === 'multiselect') {
            return (
              <SchemaMultiSelect
                key={field.key}
                field={field}
                options={list}
                selected={(value as string[]) || []}
                error={invalid(field.key) ? errors[field.key] : ''}
                cx={cx}
                onChange={next => onChange(field.key, next)}
              />
            );
          }

          return (
            <label key={field.key} className={cx(field.wide && 'wide', invalid(field.key) && 'field-invalid')}>
              <span className={cx('field-label')}>
                {field.label}
                {field.required && <span className={cx('required-mark')}> *</span>}
              </span>

              {field.type === 'select' ? (
                <select
                  name={field.key}
                  value={String(value ?? '')}
                  onChange={event => onChange(field.key, event.target.value)}
                  onBlur={() => onBlur(field.key)}
                >
                  <option value="" disabled>{field.placeholder || `Select ${field.label.toLowerCase()}`}</option>
                  {list.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.key}
                  placeholder={field.placeholder}
                  value={String(value ?? '')}
                  onChange={event => onChange(field.key, event.target.value)}
                  onBlur={() => onBlur(field.key)}
                />
              ) : field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  name={field.key}
                  checked={value === true}
                  onChange={event => onChange(field.key, event.target.checked)}
                  onBlur={() => onBlur(field.key)}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type}
                  name={field.key}
                  placeholder={field.placeholder}
                  value={String(value ?? '')}
                  onChange={event => onChange(field.key, event.target.value)}
                  onBlur={() => onBlur(field.key)}
                />
              )}

              {field.helpText && !invalid(field.key) && <small className={cx('field-hint')}>{field.helpText}</small>}
              {invalid(field.key) && <small className={cx('field-error')}>{errors[field.key]}</small>}
            </label>
          );
        })}
    </>
  );
}
