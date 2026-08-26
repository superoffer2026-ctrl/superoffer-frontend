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

/**
 * The choices a select offers come from a named list the server owns, so this
 * component asks for them rather than keeping its own copy — a list added in
 * the Option lists store appears here without a release, and one edited here
 * changes every field that points at it.
 */
interface OptionSet {
  key: string;
  label: string;
  description: string | null;
  values: string[];
  usedBy: Array<{ form: string; variant: string; field: string }>;
}

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
  const [optionSets, setOptionSets] = useState<OptionSet[]>([]);
  const [optionDraft, setOptionDraft] = useState<string[] | null>(null);
  const [optionBusy, setOptionBusy] = useState(false);

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
  /**
   * The named lists are fetched once and kept beside the form, so the choices a
   * select offers are editable in the same place the select is configured.
   */
  useEffect(() => {
    void authApi.adminOptionSets(adminKey)
      .then(payload => setOptionSets((payload?.sets || []) as OptionSet[]))
      .catch(() => setOptionSets([]));
  }, [adminKey]);

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

  /** The list this field borrows its choices from, if it borrows any. */
  const sourceKey = field?.optionsSource?.startsWith('reference:')
    ? field.optionsSource.slice('reference:'.length)
    : '';
  const sharedList = optionSets.find(set => set.key === sourceKey) || null;

  /** Fields elsewhere that would change with it — the reason editing here is not local. */
  const alsoUsing = sharedList
    ? sharedList.usedBy.filter(use => use.field !== field?.label)
    : [];

  const choices = optionDraft ?? (sharedList ? sharedList.values : field?.options ?? []);
  const choicesDirty = !!optionDraft && JSON.stringify(optionDraft) !== JSON.stringify(sharedList ? sharedList.values : field?.options ?? []);

  const setChoices = (next: string[]) => {
    if (sharedList) setOptionDraft(next);
    else if (field && section) patchField(section.key, field.key, { options: next });
  };

  const saveSharedList = async () => {
    if (!sharedList || !optionDraft) return;
    setOptionBusy(true);
    try {
      await authApi.adminSaveOptionSet(adminKey, sharedList.key, { values: optionDraft });
      const payload = await authApi.adminOptionSets(adminKey);
      setOptionSets((payload?.sets || []) as OptionSet[]);
      setOptionDraft(null);
      flash(`"${sharedList.label}" saved — every field using it now offers these choices.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save that list.');
    } finally {
      setOptionBusy(false);
    }
  };

  const isChoiceField = field?.type === 'select' || field?.type === 'multiselect';

  return (
    <section className={cx('shell')}>
      {/* One bar: which form, what state it is in, and what can be done to it. */}
      <header className={cx('bar')}>
        <div className={cx('bar-pickers')}>
          <label>
            <span>Form</span>
            <select value={formKey} onChange={e => chooseForm(e.target.value)}>
              {forms.map(entry => <option key={entry.key} value={entry.key}>{entry.label}</option>)}
            </select>
          </label>
          <label>
            <span>Variant</span>
            <select value={variant} onChange={e => { setVariant(e.target.value); void load(e.target.value); }}>
              {variants.map(entry => <option key={entry.variant} value={entry.variant}>{entry.label}</option>)}
            </select>
          </label>
          {currentForm && !currentForm.variantsAreFixed && (
            <button type="button" className={cx('ghost')} onClick={createVariant}>+ New variant</button>
          )}
          <p className={cx('bar-describes')}>{currentForm?.describes}</p>
        </div>

        <div className={cx('bar-actions')}>
          {health && (
            <span className={cx('pill', health.healthy ? 'ok' : 'warn')}>
              {health.healthy ? '✓ Live form supports every filter' : `⚠ ${health.missing.length} filter${health.missing.length === 1 ? '' : 's'} unsupported`}
            </span>
          )}
          <span className={cx('pill', dirty ? 'draft' : 'clean')}>{dirty ? 'Unsaved draft' : 'Saved'}</span>
          <button type="button" className={cx('ghost')} onClick={() => setPreview(true)}>Preview</button>
          <button type="button" className={cx('ghost')} onClick={() => void discard()}>Discard draft</button>
          <button type="button" className={cx('ghost')} disabled={!dirty} onClick={() => void save()}>Save draft</button>
          <button type="button" className={cx('primary')} onClick={() => void reviewPublish()}>Review &amp; publish</button>
        </div>
      </header>

      {!!status && <p className={cx('flash')}>{status}</p>}
      {!!error && <p className={cx('flash', 'bad')}>{error}</p>}

      <div className={cx('panes')}>
        {/*
          * Sections, not a palette of field types. The wizard's steps are the
          * spine of this form — a generic builder has no such level, and losing
          * it would mean an admin scrolling one long list of ninety fields.
          */}
        <aside className={cx('rail')}>
          <header>
            <strong>Sections</strong>
            <small>{schema.sections.length} steps</small>
          </header>
          {schema.sections.map((entry, index) => (
            <div key={entry.key} className={cx('rail-row', entry.key === section?.key && 'active', !entry.enabled && 'off')}>
              <button type="button" className={cx('rail-open')} onClick={() => { setOpenSection(entry.key); setEditingField(null); }}>
                <span>{entry.label}</span>
                <small>{entry.fields.filter(f => f.enabled).length} of {entry.fields.length} shown</small>
              </button>
              <div className={cx('rail-tools')}>
                <button type="button" onClick={() => reorderSection(index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
                <button type="button" onClick={() => reorderSection(index, 1)} disabled={index === schema.sections.length - 1} aria-label="Move down">↓</button>
                <input
                  type="checkbox"
                  checked={entry.enabled}
                  title={entry.enabled ? 'Shown to students' : 'Hidden'}
                  onChange={e => patchSection(entry.key, { enabled: e.target.checked })}
                />
              </div>
            </div>
          ))}
        </aside>

        {/* The section as a student meets it. Clicking a field opens it on the right. */}
        <main className={cx('canvas')}>
          {section && (
            <>
              <div className={cx('canvas-head')}>
                <label className={cx('canvas-title')}>
                  <span>Section title</span>
                  <input value={section.label} onChange={e => patchSection(section.key, { label: e.target.value })} />
                </label>
                <label className={cx('canvas-title')}>
                  <span>Description</span>
                  <input value={section.description || ''} onChange={e => patchSection(section.key, { description: e.target.value })} />
                </label>
                <button type="button" className={cx('primary', 'add')} onClick={() => addField(section.key)}>+ Add field</button>
              </div>

              <div className={cx('headings')}>
                <div className={cx('headings-head')}>
                  <strong>Headings in this section</strong>
                  <button type="button" className={cx('ghost', 'tiny')} onClick={() => addGroup(section.key)}>+ Add heading</button>
                </div>
                {groupsOf(section.key).length ? (
                  <div className={cx('heading-rows')}>
                    {groupsOf(section.key).map(group => (
                      <div key={group.key} className={cx('heading-row')}>
                        <input value={group.label} onChange={e => patchGroup(section.key, group.key, { label: e.target.value })} />
                        <button type="button" onClick={() => removeGroup(section.key, group.key)} aria-label="Remove heading">×</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={cx('muted')}>No headings — every field renders in one list.</p>
                )}
              </div>

              <div className={cx('fields')}>
                {section.fields.map((entry, index) => (
                  <article
                    key={entry.key}
                    className={cx('field-card', entry.key === field?.key && 'selected', !entry.enabled && 'off')}
                    onClick={() => setEditingField({ section: section.key, key: entry.key })}
                  >
                    <div className={cx('field-head')}>
                      <div>
                        <strong>{entry.label}</strong>
                        <small>
                          {entry.type}
                          {entry.required ? ' · required' : ''}
                          {entry.composite ? ' · repeating block' : ''}
                          {entry.visibleWhen ? ' · conditional' : ''}
                        </small>
                      </div>
                      <div className={cx('field-tools')} onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => reorderField(section.key, index, -1)} disabled={index === 0} aria-label="Move up">↑</button>
                        <button type="button" onClick={() => reorderField(section.key, index, 1)} disabled={index === section.fields.length - 1} aria-label="Move down">↓</button>
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          title={entry.enabled ? 'Shown' : 'Hidden'}
                          onChange={e => patchField(section.key, entry.key, { enabled: e.target.checked })}
                        />
                        <button type="button" className={cx('drop')} onClick={() => removeField(section.key, entry.key)} aria-label="Remove field">×</button>
                      </div>
                    </div>

                    {/* What the student will actually see, not a description of it. */}
                    <div className={cx('field-preview')}>
                      {entry.type === 'textarea' ? (
                        <textarea rows={2} disabled placeholder={entry.placeholder || entry.label} />
                      ) : entry.type === 'select' || entry.type === 'multiselect' ? (
                        <select disabled>
                          <option>{entry.placeholder || `Choose${entry.type === 'multiselect' ? ' one or more' : ''}…`}</option>
                        </select>
                      ) : entry.type === 'checkbox' ? (
                        <label className={cx('preview-check')}><input type="checkbox" disabled /> <span>{entry.label}</span></label>
                      ) : (
                        <input disabled type={entry.type === 'number' ? 'number' : 'text'} placeholder={entry.placeholder || entry.label} />
                      )}
                    </div>
                    <code className={cx('field-key')}>{entry.key}</code>
                  </article>
                ))}
                {!section.fields.length && <p className={cx('muted')}>No fields yet. Add one to begin.</p>}
              </div>
            </>
          )}
        </main>

        {/* Properties, including the choices — so a list is edited where it is used. */}
        <aside className={cx('props')}>
          {!field && <p className={cx('muted')}>Pick a field to edit it.</p>}
          {field && section && (
            <>
              <header className={cx('props-head')}>
                <strong>{field.label || 'Untitled field'}</strong>
                <button type="button" onClick={() => setEditingField(null)} aria-label="Close">×</button>
              </header>

              <label className={cx('prop')}>
                <span>Label</span>
                <input value={field.label} onChange={e => patchField(section.key, field.key, { label: e.target.value })} />
              </label>

              <label className={cx('prop')}>
                <span>Key</span>
                <input value={field.key} onChange={e => patchField(section.key, field.key, { key: e.target.value })} />
                <small>What the answer is stored as. Changing it on a live form orphans what students already saved.</small>
              </label>

              <label className={cx('prop')}>
                <span>Type</span>
                <select value={field.type} onChange={e => patchField(section.key, field.key, { type: e.target.value })}>
                  {FIELD_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>

              <label className={cx('prop')}>
                <span>Help text</span>
                <input value={field.helpText || ''} onChange={e => patchField(section.key, field.key, { helpText: e.target.value })} />
              </label>

              <label className={cx('prop')}>
                <span>Placeholder</span>
                <input value={field.placeholder || ''} onChange={e => patchField(section.key, field.key, { placeholder: e.target.value })} />
              </label>

              <label className={cx('prop')}>
                <span>Under which heading</span>
                <select value={field.group || ''} onChange={e => patchField(section.key, field.key, { group: e.target.value || undefined })}>
                  <option value="">No heading</option>
                  {groupsOf(section.key).map(group => <option key={group.key} value={group.key}>{group.label}</option>)}
                </select>
              </label>

              <label className={cx('prop', 'check')}>
                <input type="checkbox" checked={field.required} onChange={e => patchField(section.key, field.key, { required: e.target.checked })} />
                <span>Required</span>
              </label>

              {isChoiceField && (
                <section className={cx('choices')}>
                  <label className={cx('prop')}>
                    <span>Choices come from</span>
                    <select
                      value={field.optionsSource || ''}
                      onChange={e => { setOptionDraft(null); patchField(section.key, field.key, { optionsSource: e.target.value || undefined }); }}
                    >
                      <option value="">A list only this field uses</option>
                      {optionSets.map(set => (
                        <option key={set.key} value={`reference:${set.key}`}>{set.label}</option>
                      ))}
                    </select>
                  </label>

                  {/*
                    * A shared list is edited here for convenience, but never
                    * silently: the fields that would change with it are named,
                    * and it saves separately from the form draft because it
                    * takes effect immediately rather than on publish.
                    */}
                  {sharedList && (
                    <p className={cx('shared-note')}>
                      Shared list. {alsoUsing.length
                        ? `Also used by ${alsoUsing.map(use => use.field).join(', ')} — editing changes them too.`
                        : 'No other field uses it yet.'}
                    </p>
                  )}

                  <div className={cx('choice-rows')}>
                    {choices.map((value, index) => (
                      <div key={index} className={cx('choice-row')}>
                        <input
                          value={value}
                          onChange={e => setChoices(choices.map((entry, i) => (i === index ? e.target.value : entry)))}
                        />
                        <button
                          type="button"
                          onClick={() => setChoices(choices.filter((_, i) => i !== index))}
                          aria-label="Remove choice"
                        >×</button>
                      </div>
                    ))}
                    {!choices.length && <p className={cx('muted')}>No choices yet.</p>}
                  </div>

                  <button type="button" className={cx('ghost', 'tiny')} onClick={() => setChoices([...choices, ''])}>
                    + Add choice
                  </button>

                  {sharedList && choicesDirty && (
                    <div className={cx('choice-save')}>
                      <button type="button" className={cx('ghost', 'tiny')} onClick={() => setOptionDraft(null)}>Discard</button>
                      <button type="button" className={cx('primary', 'tiny')} disabled={optionBusy} onClick={() => void saveSharedList()}>
                        Save shared list
                      </button>
                    </div>
                  )}
                </section>
              )}

              <label className={cx('prop')}>
                <span>Show only when</span>
                <select
                  value={field.visibleWhen?.field || ''}
                  onChange={e => patchField(section.key, field.key, {
                    visibleWhen: e.target.value
                      ? { field: e.target.value, equals: field.visibleWhen?.equals || [] }
                      : undefined
                  })}
                >
                  <option value="">Always shown</option>
                  {section.fields.filter(f => f.key !== field.key).map(f => (
                    <option key={f.key} value={f.key}>{f.label}</option>
                  ))}
                </select>
              </label>

              {field.visibleWhen && (
                <label className={cx('prop')}>
                  <span>…is one of</span>
                  <input
                    value={(field.visibleWhen.equals || []).join(', ')}
                    placeholder="Yes, Maybe"
                    onChange={e => patchField(section.key, field.key, {
                      visibleWhen: {
                        field: field.visibleWhen!.field,
                        equals: e.target.value.split(',').map(v => v.trim()).filter(Boolean)
                      }
                    })}
                  />
                </label>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Publishing names what the matching engine would lose, before it happens. */}
      {confirming && impact && (
        <div className={cx('backdrop')} onClick={() => setConfirming(false)}>
          <div className={cx('sheet')} onClick={e => e.stopPropagation()}>
            <h3>{impact.safe ? 'Ready to publish' : 'Publish would change what students can be matched on'}</h3>
            {!!impact.warnings.length && <ul>{impact.warnings.map(w => <li key={w}>{w}</li>)}</ul>}
            {!!impact.missing.length && (
              <ul>
                {impact.missing.map(m => (
                  <li key={`${m.section}-${m.field}`}>
                    <b>{m.field}</b> is used by {m.usedBy.join(', ')}
                  </li>
                ))}
              </ul>
            )}
            <footer>
              <button type="button" className={cx('ghost')} onClick={() => setConfirming(false)}>Keep editing</button>
              <button type="button" className={cx('primary')} onClick={() => void publish()}>Publish anyway</button>
            </footer>
          </div>
        </div>
      )}

      {preview && (
        <div className={cx('backdrop')} onClick={() => setPreview(false)}>
          <div className={cx('sheet', 'wide')} onClick={e => e.stopPropagation()}>
            <h3>{schema.label}</h3>
            {schema.sections.filter(s => s.enabled).map(entry => (
              <section key={entry.key} className={cx('preview-section')}>
                <strong>{entry.label}</strong>
                <ul>
                  {entry.fields.filter(f => f.enabled).map(f => (
                    <li key={f.key}>{f.label}{f.required ? ' *' : ''}</li>
                  ))}
                </ul>
              </section>
            ))}
            <footer>
              <button type="button" className={cx('primary')} onClick={() => setPreview(false)}>Close</button>
            </footer>
          </div>
        </div>
      )}

      {!!versions.length && (
        <details className={cx('versions')}>
          <summary>Version history</summary>
          {versions.map(entry => (
            <div key={entry.version} className={cx('version-row')}>
              <span>v{entry.version} · {entry.status}</span>
              <button type="button" className={cx('ghost', 'tiny')} onClick={() => void restore(entry.version)}>Restore</button>
            </div>
          ))}
        </details>
      )}
    </section>
  );
}
