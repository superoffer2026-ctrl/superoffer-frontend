'use client';

import { useCallback, useEffect, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import styles from '@/styles/AdminFormBuilder.module.css';

const cx = classNames(styles);

/**
 * Values a row carries because of what it is, not because an admin added them:
 * the qualification a level row is for, the test an exam row is for. A row
 * condition may point at these as well as at a sibling field.
 */
const ROW_IDENTITY = [
  { value: 'level', label: 'Qualification level (row identity)' },
  { value: 'exam', label: 'Exam name (row identity)' }
];

const FIELD_TYPES = ['text', 'email', 'tel', 'number', 'textarea', 'select', 'multiselect', 'checkbox', 'date'] as const;

/** Option lists the reference endpoints already serve, offered instead of retyping them. */
const OPTION_SOURCES = [
  { value: '', label: 'Custom list (typed below)' },
  { value: 'reference:countries', label: 'Countries' },
  { value: 'reference:indiaCities', label: 'Indian cities' },
  { value: 'reference:studyCountries', label: 'Study destinations' },
  { value: 'reference:fieldsOfStudy', label: 'Fields of study' },
  { value: 'reference:intakeOptions', label: 'Intakes' },
  { value: 'reference:startYears', label: 'Start years' },
  { value: 'reference:qualificationOptions', label: 'Qualifications' },
  { value: 'reference:educationGapOptions', label: 'Education gap' },
  { value: 'reference:fundingSourceOptions', label: 'Funding sources' },
  { value: 'reference:earningMemberOptions', label: 'Earning members' },
  { value: 'reference:currencyOptions', label: 'Currencies' },
  { value: 'reference:employmentCategoryOptions', label: 'Employment categories' },
  { value: 'reference:dialCodes', label: 'Dial codes' }
];

interface FormField {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  enabled: boolean;
  order: number;
  options?: string[];
  optionsSource?: string;
  validation?: { min?: number; max?: number; minLength?: number; maxLength?: number; pattern?: string };
  visibleWhen?: { field: string; equals: string[] };
  composite?: string;
  /** For a composite: the fields of one row, editable like any other. */
  itemFields?: FormField[];
  allowCustom?: boolean;
  /** The heading this field sits under, by group key. */
  group?: string;
  /** A line of explanation under one option, keyed by the option itself. */
  optionHints?: Record<string, string>;
  wide?: boolean;
}

interface FormGroup {
  key: string;
  label: string;
  order: number;
}

interface FormSection {
  key: string;
  label: string;
  description?: string;
  /** Headings within the section; fields point at one by key. */
  groups?: FormGroup[];
  route: string;
  column: string;
  order: number;
  enabled: boolean;
  fields: FormField[];
}

interface FormSchema {
  variant: string;
  label: string;
  sections: FormSection[];
}

interface Impact {
  safe: boolean;
  warnings: string[];
  missing: Array<{ section: string; field: string; usedBy: string[] }>;
  removedSections: string[];
}

const move = <T,>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next.map((entry, index) => ({ ...entry, order: index + 1 }));
};

const slug = (label: string) =>
  label.trim().replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/)
    .map((word, index) => (index ? word[0].toUpperCase() + word.slice(1) : word.toLowerCase()))
    .join('').slice(0, 40) || 'newField';

/**
 * The student form, editable.
 *
 * Everything is edited against a draft and only reaches students on publish, and
 * the publish step names anything the matching engine would lose — removing a
 * field is allowed, but never by accident.
 */
interface FormChoice {
  key: string;
  label: string;
  describes: string;
  owner: 'student' | 'organization';
  variants: Array<{ variant: string; label: string }>;
  variantsAreFixed: boolean;
}

export function AdminFormBuilder({ adminKey }: { adminKey: string }) {
  const [formKey, setFormKey] = useState('STUDENT_PROFILE');
  const [forms, setForms] = useState<FormChoice[]>([]);
  const [variant, setVariant] = useState('DEFAULT');
  const [variants, setVariants] = useState<Array<{ variant: string; label: string }>>([]);
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [openSection, setOpenSection] = useState('');
  const [editingField, setEditingField] = useState<{ section: string; key: string } | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [impact, setImpact] = useState<Impact | null>(null);
  const [health, setHealth] = useState<{ healthy: boolean; missing: any[] } | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = useCallback(async (which = variant, form = formKey) => {
    setError('');
    try {
      const [draft, list, allVariants, currentHealth, formChoices] = await Promise.all([
        authApi.adminFormDraft(adminKey, which, form),
        authApi.adminFormVersions(adminKey, which, form),
        authApi.formSchemaVariants(form),
        authApi.adminFormHealth(adminKey, which, form),
        authApi.formList()
      ]);
      setSchema(draft.definition);
      setVersions(list.versions || []);
      setVariants(allVariants || []);
      setHealth(currentHealth);
      setForms(formChoices.forms || []);
      setDirty(false);
      /** A different form has different sections, so the open one cannot carry over. */
      setOpenSection(draft.definition.sections[0]?.key || '');
      setEditingField(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The form builder could not be loaded.');
    }
  }, [adminKey, variant, formKey]);

  useEffect(() => {
    void load(variant, formKey);
  }, [load, variant, formKey]);

  /** Switching form also switches to a variant that form actually has. */
  const chooseForm = (next: string) => {
    const choice = forms.find(entry => entry.key === next);
    setFormKey(next);
    setVariant(choice?.variants[0]?.variant || 'DEFAULT');
  };

  const flash = (message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 3000);
  };

  const update = (next: FormSchema) => {
    setSchema(next);
    setDirty(true);
  };

  const patchSection = (key: string, patch: Partial<FormSection>) => {
    if (!schema) return;
    update({ ...schema, sections: schema.sections.map(s => (s.key === key ? { ...s, ...patch } : s)) });
  };

  const groupsOf = (sectionKey: string) =>
    schema?.sections.find(s => s.key === sectionKey)?.groups || [];

  const patchGroup = (sectionKey: string, groupKey: string, patch: Partial<FormGroup>) =>
    patchSection(sectionKey, {
      groups: groupsOf(sectionKey).map(g => (g.key === groupKey ? { ...g, ...patch } : g))
    });

  const addGroup = (sectionKey: string) => {
    const groups = groupsOf(sectionKey);
    let key = 'newGroup';
    let n = 1;
    while (groups.some(g => g.key === key)) key = `newGroup${++n}`;
    patchSection(sectionKey, { groups: [...groups, { key, label: 'New heading', order: groups.length + 1 }] });
  };

  /** Removing a heading frees the fields under it rather than hiding them. */
  const removeGroup = (sectionKey: string, groupKey: string) => {
    if (!schema) return;
    update({
      ...schema,
      sections: schema.sections.map(s =>
        s.key !== sectionKey
          ? s
          : {
              ...s,
              groups: (s.groups || []).filter(g => g.key !== groupKey),
              fields: s.fields.map(f => (f.group === groupKey ? { ...f, group: undefined } : f))
            }
      )
    });
  };

  const fieldAt = (sectionKey: string, fieldKey: string) =>
    schema?.sections.find(s => s.key === sectionKey)?.fields.find(f => f.key === fieldKey);

  const patchField = (sectionKey: string, fieldKey: string, patch: Partial<FormField>) => {
    if (!schema) return;
    update({
      ...schema,
      sections: schema.sections.map(section =>
        section.key !== sectionKey
          ? section
          : { ...section, fields: section.fields.map(f => (f.key === fieldKey ? { ...f, ...patch } : f)) }
      )
    });
  };

  const addField = (sectionKey: string) => {
    if (!schema) return;
    const section = schema.sections.find(s => s.key === sectionKey);
    if (!section) return;
    let key = 'newField';
    let n = 1;
    while (section.fields.some(f => f.key === key)) key = `newField${++n}`;
    const field: FormField = {
      key, label: 'New field', type: 'text', required: false, enabled: true, order: section.fields.length + 1
    };
    update({
      ...schema,
      sections: schema.sections.map(s => (s.key === sectionKey ? { ...s, fields: [...s.fields, field] } : s))
    });
    setEditingField({ section: sectionKey, key });
  };

  const removeField = (sectionKey: string, fieldKey: string) => {
    if (!schema) return;
    update({
      ...schema,
      sections: schema.sections.map(s =>
        s.key === sectionKey ? { ...s, fields: s.fields.filter(f => f.key !== fieldKey) } : s
      )
    });
    setEditingField(null);
  };

  /**
   * The fields inside a composite are edited through the same operations as any
   * other field; only the list they live in differs.
   */
  const patchRows = (sectionKey: string, fieldKey: string, next: FormField[]) =>
    patchField(sectionKey, fieldKey, { itemFields: next });

  const patchRowField = (sectionKey: string, fieldKey: string, rowKey: string, patch: Partial<FormField>) => {
    const rows = fieldAt(sectionKey, fieldKey)?.itemFields || [];
    patchRows(sectionKey, fieldKey, rows.map(row => (row.key === rowKey ? { ...row, ...patch } : row)));
  };

  const addRowField = (sectionKey: string, fieldKey: string) => {
    const rows = fieldAt(sectionKey, fieldKey)?.itemFields || [];
    let key = 'newField';
    let n = 1;
    while (rows.some(row => row.key === key)) key = `newField${++n}`;
    patchRows(sectionKey, fieldKey, [
      ...rows,
      { key, label: 'New field', type: 'text', required: false, enabled: true, order: rows.length + 1 }
    ]);
    setEditingRow(key);
  };

  const removeRowField = (sectionKey: string, fieldKey: string, rowKey: string) => {
    const rows = fieldAt(sectionKey, fieldKey)?.itemFields || [];
    patchRows(sectionKey, fieldKey, rows.filter(row => row.key !== rowKey));
    setEditingRow(null);
  };

  const reorderRowField = (sectionKey: string, fieldKey: string, index: number, delta: number) => {
    const rows = fieldAt(sectionKey, fieldKey)?.itemFields || [];
    patchRows(sectionKey, fieldKey, move(rows, index, index + delta));
  };

  const reorderField = (sectionKey: string, index: number, delta: number) => {
    if (!schema) return;
    update({
      ...schema,
      sections: schema.sections.map(s =>
        s.key === sectionKey ? { ...s, fields: move(s.fields, index, index + delta) } : s
      )
    });
  };

  const reorderSection = (index: number, delta: number) => {
    if (!schema) return;
    update({ ...schema, sections: move(schema.sections, index, index + delta) });
  };

  const save = async () => {
    if (!schema) return;
    setError('');
    try {
      await authApi.adminSaveFormDraft(adminKey, variant, schema, schema.label, formKey);
      setDirty(false);
      flash('Draft saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The draft could not be saved.');
    }
  };

  /** Always shows the consequences before anything reaches students. */
  const reviewPublish = async () => {
    setError('');
    try {
      if (dirty) await authApi.adminSaveFormDraft(adminKey, variant, schema, schema?.label, formKey);
      setDirty(false);
      setImpact(await authApi.adminFormImpact(adminKey, variant, formKey));
      setConfirming(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The impact check failed.');
    }
  };

  const publish = async () => {
    setError('');
    try {
      await authApi.adminPublishForm(adminKey, variant, !impact?.safe, formKey);
      setConfirming(false);
      setImpact(null);
      await load(variant);
      flash('Published — students see this now.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publishing failed.');
    }
  };

  const restore = async (version: number) => {
    setError('');
    try {
      await authApi.adminRestoreForm(adminKey, variant, version, formKey);
      await load(variant);
      flash(`Version ${version} restored as the draft.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That version could not be restored.');
    }
  };

  const discard = async () => {
    setError('');
    try {
      await authApi.adminResetFormDraft(adminKey, variant, formKey);
      await load(variant);
      flash('Draft discarded.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The draft could not be discarded.');
    }
  };

  const createVariant = () => {
    const name = window.prompt('New variant key (letters and numbers, e.g. UG or PG):');
    if (!name) return;
    const key = name.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!key) return;
    setVariant(key);
    flash(`Editing "${key}" — it starts as a copy of the published DEFAULT form.`);
  };

  if (!schema) {
    return (
      <section className={cx('builder')}>
        {error ? <p className={cx('builder-error')}>{error}</p> : <p className={cx('builder-muted')}>Loading the form…</p>}
      </section>
    );
  }

  const currentForm = forms.find(entry => entry.key === formKey);
  const section = schema.sections.find(s => s.key === openSection) || schema.sections[0];
  const field = editingField ? section?.fields.find(f => f.key === editingField.key) : undefined;

  return (
    <section className={cx('builder')}>
      <header className={cx('builder-bar')}>
        <div className={cx('builder-bar-left')}>
          <label>
            <span>Form</span>
            <select name="formKey" value={formKey} onChange={event => chooseForm(event.target.value)}>
              {forms.map(entry => <option key={entry.key} value={entry.key}>{entry.label}</option>)}
            </select>
          </label>
          <label>
            <span>{currentForm?.owner === 'organization' ? 'Organisation type' : 'Variant'}</span>
            <select name="variant" value={variant} onChange={event => setVariant(event.target.value)}>
              {variants.map(v => <option key={v.variant} value={v.variant}>{v.label || v.variant}</option>)}
              {!variants.some(v => v.variant === variant) && <option value={variant}>{variant}</option>}
            </select>
          </label>
          {/* An organisation form has one document per organisation type and no others. */}
          {!currentForm?.variantsAreFixed && (
            <button type="button" className={cx('ghost')} onClick={createVariant}>+ New variant</button>
          )}
          {currentForm && <span className={cx('builder-describes')}>{currentForm.describes}</span>}
          {health && (
            <span className={cx('builder-health', health.healthy ? 'ok' : 'warn')}>
              {health.healthy
                ? '✓ Live form supports every filter'
                : `⚠ Live form is missing ${health.missing.length} field${health.missing.length === 1 ? '' : 's'} the engine uses`}
            </span>
          )}
        </div>

        <div className={cx('builder-bar-right')}>
          {status && <span className={cx('builder-flash')}>{status}</span>}
          {dirty && <span className={cx('builder-dirty')}>Unsaved changes</span>}
          <button type="button" className={cx('ghost')} onClick={() => setPreview(!preview)}>
            {preview ? 'Hide preview' : 'Preview'}
          </button>
          <button type="button" className={cx('ghost')} onClick={() => void discard()}>Discard draft</button>
          <button type="button" className={cx('secondary')} disabled={!dirty} onClick={() => void save()}>Save draft</button>
          <button type="button" className={cx('primary')} onClick={() => void reviewPublish()}>Review &amp; publish</button>
        </div>
      </header>

      {error && <p className={cx('builder-error')}>{error}</p>}

      <div className={cx('builder-body')}>
        <aside className={cx('builder-sections')}>
          <h3>Sections</h3>
          {schema.sections.map((entry, index) => (
            <div key={entry.key} className={cx('builder-section-row', entry.key === section?.key && 'active')}>
              <button type="button" className={cx('builder-section-open')} onClick={() => { setOpenSection(entry.key); setEditingField(null); }}>
                <strong>{entry.label}</strong>
                <small>{entry.fields.filter(f => f.enabled).length} of {entry.fields.length} fields shown</small>
              </button>
              <div className={cx('builder-section-tools')}>
                <button type="button" title="Move up" disabled={index === 0} onClick={() => reorderSection(index, -1)}>↑</button>
                <button type="button" title="Move down" disabled={index === schema.sections.length - 1} onClick={() => reorderSection(index, 1)}>↓</button>
                <label title={entry.enabled ? 'Shown to students' : 'Hidden from students'}>
                  <input type="checkbox" checked={entry.enabled} onChange={e => patchSection(entry.key, { enabled: e.target.checked })} />
                </label>
              </div>
            </div>
          ))}
        </aside>

        {section && (
          <div className={cx('builder-fields')}>
            <header className={cx('builder-section-head')}>
              <label className={cx('builder-inline')}>
                <span>Section title</span>
                <input value={section.label} onChange={e => patchSection(section.key, { label: e.target.value })} />
              </label>
              <label className={cx('builder-inline')}>
                <span>Description</span>
                <input value={section.description || ''} onChange={e => patchSection(section.key, { description: e.target.value })} />
              </label>
              <button type="button" className={cx('secondary')} onClick={() => addField(section.key)}>+ Add field</button>
            </header>

            {/* Headings within the section. Fields point at one, so renaming is a single edit. */}
            <div className={cx('builder-groups')}>
              <header>
                <span>Headings in this section</span>
                <button type="button" onClick={() => addGroup(section.key)}>+ Add heading</button>
              </header>
              {!groupsOf(section.key).length && (
                <p className={cx('builder-muted')}>No headings — every field renders in one list.</p>
              )}
              {groupsOf(section.key).map(group => (
                <div key={group.key} className={cx('builder-group-row')}>
                  <input
                    value={group.label}
                    aria-label={`Heading ${group.key}`}
                    onChange={e => patchGroup(section.key, group.key, { label: e.target.value })}
                  />
                  <code>{group.key}</code>
                  <button
                    type="button"
                    title="Remove this heading; its fields stay"
                    onClick={() => removeGroup(section.key, group.key)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {!section.enabled && (
              <p className={cx('builder-notice')}>
                This section is hidden from students. Answers already given are kept and reappear if you switch it back on.
              </p>
            )}

            <ul className={cx('builder-field-list')}>
              {section.fields.map((entry, index) => (
                <li key={entry.key} className={cx('builder-field', !entry.enabled && 'off', editingField?.key === entry.key && 'editing')}>
                  <div className={cx('builder-field-main')}>
                    <button type="button" onClick={() => setEditingField({ section: section.key, key: entry.key })}>
                      <strong>{entry.label}</strong>
                      <small>
                        {entry.composite ? `composite · ${entry.composite}` : entry.type}
                        {entry.required && ' · required'}
                        {entry.visibleWhen && ` · shown when ${entry.visibleWhen.field} = ${entry.visibleWhen.equals.join('/')}`}
                      </small>
                      <code>{entry.key}</code>
                    </button>
                  </div>
                  <div className={cx('builder-field-tools')}>
                    <button type="button" title="Move up" disabled={index === 0} onClick={() => reorderField(section.key, index, -1)}>↑</button>
                    <button type="button" title="Move down" disabled={index === section.fields.length - 1} onClick={() => reorderField(section.key, index, 1)}>↓</button>
                    <label title={entry.enabled ? 'Shown' : 'Hidden'}>
                      <input type="checkbox" checked={entry.enabled} onChange={e => patchField(section.key, entry.key, { enabled: e.target.checked })} />
                    </label>
                    <button type="button" className={cx('danger')} title="Remove" onClick={() => removeField(section.key, entry.key)}>✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {field && section && (
          <aside className={cx('builder-inspector')}>
            <header>
              <h3>{field.label}</h3>
              <button type="button" onClick={() => setEditingField(null)} aria-label="Close">×</button>
            </header>

            {field.composite && (
              <p className={cx('builder-notice')}>
                This is a repeating block. Its rows are listed below and edit exactly like any other field — a row
                condition points at another field in the same row. What stays in code is what drives the row set: one
                academic row per level the student ticks, one income per earner they name.
              </p>
            )}

            <label><span>Label</span>
              <input value={field.label} onChange={e => patchField(section.key, field.key, { label: e.target.value })} />
            </label>

            <label><span>Key</span>
              <input
                value={field.key}
                onChange={e => patchField(section.key, field.key, { key: slug(e.target.value) })}
              />
            </label>

            {!field.composite && (
              <label><span>Type</span>
                <select value={field.type} onChange={e => patchField(section.key, field.key, { type: e.target.value })}>
                  {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
            )}

            <label><span>Help text</span>
              <input value={field.helpText || ''} onChange={e => patchField(section.key, field.key, { helpText: e.target.value })} />
            </label>

            <label><span>Under which heading</span>
              <select
                name="group"
                value={field.group || ''}
                onChange={e => patchField(section.key, field.key, { group: e.target.value || undefined })}
              >
                <option value="">No heading</option>
                {groupsOf(section.key).map(group => (
                  <option key={group.key} value={group.key}>{group.label}</option>
                ))}
              </select>
            </label>

            {!field.composite && (
              <label><span>Placeholder</span>
                <input value={field.placeholder || ''} onChange={e => patchField(section.key, field.key, { placeholder: e.target.value })} />
              </label>
            )}

            {/* The fields of one row, edited in place. */}
            {field.composite && (
              <div className={cx('builder-rows')}>
                <header>
                  <span>Fields in each row</span>
                  <button type="button" onClick={() => addRowField(section.key, field.key)}>+ Add field</button>
                </header>

                {!field.itemFields?.length && <p className={cx('builder-muted')}>This block has no editable row fields.</p>}

                {(field.itemFields || []).map((row, index) => (
                  <div key={row.key} className={cx('builder-row-field', !row.enabled && 'off')}>
                    <button
                      type="button"
                      className={cx('builder-row-open')}
                      onClick={() => setEditingRow(editingRow === row.key ? null : row.key)}
                    >
                      <strong>{row.label}</strong>
                      <small>{row.type}{row.required ? ' · required' : ''}</small>
                      <code>{row.key}</code>
                    </button>
                    <div className={cx('builder-row-actions')}>
                      <button type="button" title="Move up" disabled={index === 0}
                        onClick={() => reorderRowField(section.key, field.key, index, -1)}>↑</button>
                      <button type="button" title="Move down" disabled={index === (field.itemFields?.length || 0) - 1}
                        onClick={() => reorderRowField(section.key, field.key, index, 1)}>↓</button>
                      <input
                        type="checkbox"
                        title={row.enabled ? 'Shown' : 'Hidden'}
                        checked={row.enabled}
                        onChange={e => patchRowField(section.key, field.key, row.key, { enabled: e.target.checked })}
                      />
                      <button type="button" title="Remove" className={cx('builder-row-remove')}
                        onClick={() => removeRowField(section.key, field.key, row.key)}>×</button>
                    </div>

                    {editingRow === row.key && (
                      <div className={cx('builder-row-editor')}>
                        <label><span>Label</span>
                          <input value={row.label}
                            onChange={e => patchRowField(section.key, field.key, row.key, { label: e.target.value })} />
                        </label>
                        <label><span>Key</span>
                          <input value={row.key}
                            onChange={e => patchRowField(section.key, field.key, row.key, { key: slug(e.target.value) })} />
                        </label>
                        <label><span>Type</span>
                          <select value={row.type}
                            onChange={e => patchRowField(section.key, field.key, row.key, { type: e.target.value })}>
                            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </label>
                        <label><span>Placeholder</span>
                          <input value={row.placeholder || ''}
                            onChange={e => patchRowField(section.key, field.key, row.key, { placeholder: e.target.value })} />
                        </label>
                        <label><span>Options come from</span>
                          <select value={row.optionsSource || ''}
                            onChange={e => patchRowField(section.key, field.key, row.key, { optionsSource: e.target.value })}>
                            {OPTION_SOURCES.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
                          </select>
                        </label>
                        {!row.optionsSource && (row.type === 'select' || row.type === 'multiselect') && (
                          <label><span>Options, one per line</span>
                            <textarea
                              rows={3}
                              value={(row.options || []).join('\n')}
                              onChange={e => patchRowField(section.key, field.key, row.key, {
                                options: e.target.value.split('\n').map(o => o.trim()).filter(Boolean)
                              })}
                            />
                          </label>
                        )}
                        <label className={cx('builder-check')}>
                          <input type="checkbox" checked={row.required}
                            onChange={e => patchRowField(section.key, field.key, row.key, { required: e.target.checked })} />
                          <span>Required</span>
                        </label>
                        {/* A row condition points at another field in the same row. */}
                        <label><span>Only show when</span>
                          <select
                            value={row.visibleWhen?.field || ''}
                            onChange={e => patchRowField(section.key, field.key, row.key, {
                              visibleWhen: e.target.value
                                ? { field: e.target.value, equals: row.visibleWhen?.equals || [] }
                                : undefined
                            })}
                          >
                            <option value="">Always shown</option>
                            {(field.itemFields || []).filter(other => other.key !== row.key)
                              .map(other => <option key={other.key} value={other.key}>{other.label}</option>)}
                            {ROW_IDENTITY.map(identity => (
                              <option key={identity.value} value={identity.value}>{identity.label}</option>
                            ))}
                          </select>
                        </label>
                        {row.visibleWhen?.field && (
                          <label><span>…equals, one per line</span>
                            <textarea
                              rows={3}
                              value={(row.visibleWhen.equals || []).join('\n')}
                              onChange={e => patchRowField(section.key, field.key, row.key, {
                                visibleWhen: {
                                  field: row.visibleWhen!.field,
                                  equals: e.target.value.split('\n').map(o => o.trim()).filter(Boolean)
                                }
                              })}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <label className={cx('builder-check')}>
              <input type="checkbox" checked={field.required} onChange={e => patchField(section.key, field.key, { required: e.target.checked })} />
              <span>Required</span>
            </label>

            {(field.type === 'select' || field.type === 'multiselect') && (
              <>
                <label><span>Options from</span>
                  <select
                    value={field.optionsSource || ''}
                    onChange={e => patchField(section.key, field.key, { optionsSource: e.target.value || undefined })}
                  >
                    {OPTION_SOURCES.map(source => <option key={source.value} value={source.value}>{source.label}</option>)}
                  </select>
                </label>
                {!field.optionsSource && (
                  <label><span>Options, one per line</span>
                    <textarea
                      rows={4}
                      value={(field.options || []).join('\n')}
                      onChange={e => patchField(section.key, field.key, { options: e.target.value.split('\n').map(o => o.trim()).filter(Boolean) })}
                    />
                  </label>
                )}

                {/* A line under one option, for the places an option needs explaining. */}
                {!!(field.options || []).length && (
                  <div className={cx('builder-hints')}>
                    <small>A line under an option, where one helps. Leave blank for none.</small>
                    {(field.options || []).map(option => (
                      <label key={option} className={cx('builder-inline')}>
                        <span>{option}</span>
                        <input
                          value={field.optionHints?.[option] || ''}
                          onChange={e => patchField(section.key, field.key, {
                            optionHints: { ...(field.optionHints || {}), [option]: e.target.value }
                          })}
                        />
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {field.type === 'number' && (
              <div className={cx('builder-pair')}>
                <label><span>Minimum</span>
                  <input type="number" value={field.validation?.min ?? ''}
                    onChange={e => patchField(section.key, field.key, { validation: { ...field.validation, min: e.target.value === '' ? undefined : Number(e.target.value) } })} />
                </label>
                <label><span>Maximum</span>
                  <input type="number" value={field.validation?.max ?? ''}
                    onChange={e => patchField(section.key, field.key, { validation: { ...field.validation, max: e.target.value === '' ? undefined : Number(e.target.value) } })} />
                </label>
              </div>
            )}

            {['text', 'email', 'tel', 'textarea'].includes(field.type) && (
              <label><span>Pattern (regular expression, optional)</span>
                <input
                  value={field.validation?.pattern || ''}
                  placeholder="^[A-Z]{2}[0-9]{6}$"
                  onChange={e => patchField(section.key, field.key, { validation: { ...field.validation, pattern: e.target.value || undefined } })}
                />
              </label>
            )}

            <fieldset className={cx('builder-conditional')}>
              <legend>Show only when…</legend>
              <select
                value={field.visibleWhen?.field || ''}
                onChange={e => patchField(section.key, field.key, {
                  visibleWhen: e.target.value ? { field: e.target.value, equals: field.visibleWhen?.equals || [] } : undefined
                })}
              >
                <option value="">Always shown</option>
                {section.fields.filter(f => f.key !== field.key && !f.composite).map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
              {field.visibleWhen && (
                <input
                  placeholder="equals these values, comma separated"
                  value={(field.visibleWhen.equals || []).join(', ')}
                  onChange={e => patchField(section.key, field.key, {
                    visibleWhen: { field: field.visibleWhen!.field, equals: e.target.value.split(',').map(v => v.trim()).filter(Boolean) }
                  })}
                />
              )}
            </fieldset>
          </aside>
        )}
      </div>

      {preview && (
        <section className={cx('builder-preview')}>
          <header><h3>Preview</h3><small>How the draft renders for a student, section by section.</small></header>
          {schema.sections.filter(s => s.enabled).map(entry => (
            <article key={entry.key}>
              <h4>{entry.label}</h4>
              {entry.description && <p>{entry.description}</p>}
              <div className={cx('preview-grid')}>
                {entry.fields.filter(f => f.enabled).map(f => (
                  <label key={f.key} className={cx(f.wide && 'wide')}>
                    <span>{f.label}{f.required && <b> *</b>}</span>
                    {f.composite ? (
                      <em className={cx('preview-composite')}>{f.composite} block</em>
                    ) : f.type === 'select' || f.type === 'multiselect' ? (
                      <select disabled><option>{f.optionsSource ? f.optionsSource.replace('reference:', '') : (f.options || []).join(', ') || 'options'}</option></select>
                    ) : f.type === 'checkbox' ? (
                      <input type="checkbox" disabled />
                    ) : f.type === 'textarea' ? (
                      <textarea disabled rows={2} placeholder={f.placeholder} />
                    ) : (
                      <input disabled type={f.type} placeholder={f.placeholder} />
                    )}
                    {f.helpText && <small>{f.helpText}</small>}
                  </label>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <section className={cx('builder-versions')}>
        <h3>Version history</h3>
        {versions.map(entry => (
          <div key={entry.id} className={cx('builder-version')}>
            <span className={cx('builder-version-status', entry.status.toLowerCase())}>{entry.status}</span>
            <strong>v{entry.version}</strong>
            <small>{entry.publishedAt ? `published ${new Date(entry.publishedAt).toLocaleString()}` : `edited ${new Date(entry.updatedAt).toLocaleString()}`}</small>
            {entry.publishNote && <em title={entry.publishNote}>published with warnings</em>}
            {entry.status !== 'DRAFT' && (
              <button type="button" className={cx('ghost')} onClick={() => void restore(entry.version)}>Restore</button>
            )}
          </div>
        ))}
        {!versions.length && <p className={cx('builder-muted')}>No versions yet — this form is still the built-in default.</p>}
      </section>

      {confirming && impact && (
        <div className={cx('builder-backdrop')} onClick={() => setConfirming(false)}>
          <div className={cx('builder-dialog')} onClick={event => event.stopPropagation()}>
            <h3>{impact.safe ? 'Publish this form?' : 'This will break parts of matching'}</h3>

            {impact.safe && (
              <p>No filters, scores or completion rules are affected. Students see the new form immediately.</p>
            )}

            {!impact.safe && (
              <>
                <p>You are removing fields the matching engine reads. Publishing anyway will:</p>
                <ul className={cx('builder-warnings')}>
                  {impact.warnings.map(warning => <li key={warning}>{warning}</li>)}
                </ul>
                <p className={cx('builder-muted')}>
                  Existing answers are kept and will reappear if you restore the field.
                </p>
              </>
            )}

            <div className={cx('builder-dialog-actions')}>
              <button type="button" className={cx('ghost')} onClick={() => setConfirming(false)}>Cancel</button>
              <button type="button" className={cx(impact.safe ? 'primary' : 'danger-solid')} onClick={() => void publish()}>
                {impact.safe ? 'Publish' : 'Publish anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
