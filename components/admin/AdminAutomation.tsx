'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import styles from '@/styles/AdminAutomation.module.css';
import {
  ConditionBuilder, fromRows, toRows,
  type ConditionCatalogue, type Predicate
} from './ConditionBuilder';

const cx = classNames(styles);

interface Rule {
  id: string;
  event: string;
  label: string;
  audience: 'student' | 'organization' | 'both';
  attribution: 'system' | 'organization';
  body: string;
  /** A predicate tree; the two-key shape older rules used still reads. */
  condition: unknown;
  /** Re-read when a delayed rule comes due: the reason to still send it. */
  guard: unknown;
  /** Minutes to wait after the event. 0 posts immediately. */
  delayMinutes: number;
  markUnread: boolean;
  enabled: boolean;
  order: number;
  /** Built-in rules can be reworded or switched off, but never deleted. */
  system: boolean;
}

interface Trigger {
  event: string;
  describes: string;
}

interface Placeholder {
  token: string;
  describes: string;
}

const AUDIENCES: Array<{ value: Rule['audience']; label: string; describes: string }> = [
  { value: 'both', label: 'Both sides', describes: 'A neutral record of what happened' },
  { value: 'student', label: 'The student only', describes: 'The officer never sees it' },
  { value: 'organization', label: 'The organisation only', describes: 'The student never sees it' }
];

const ATTRIBUTIONS: Array<{ value: Rule['attribution']; label: string; describes: string }> = [
  { value: 'system', label: 'A platform notice', describes: 'Centred and unattributed, belonging to neither side' },
  { value: 'organization', label: 'A reply from the organisation', describes: 'Shown under the officer name, labelled Automatic' }
];

/**
 * Waits worth offering. A free-text minute box invites "10080" and a mistake
 * nobody notices until a message arrives a week late.
 */
const DELAYS: Array<{ minutes: number; label: string }> = [
  { minutes: 0, label: 'Send immediately' },
  { minutes: 60, label: 'After 1 hour' },
  { minutes: 60 * 6, label: 'After 6 hours' },
  { minutes: 60 * 24, label: 'After 1 day' },
  { minutes: 60 * 24 * 2, label: 'After 2 days' },
  { minutes: 60 * 24 * 3, label: 'After 3 days' },
  { minutes: 60 * 24 * 7, label: 'After 1 week' },
  { minutes: 60 * 24 * 14, label: 'After 2 weeks' }
];

/** Triggers that are defined and seeded but not yet wired to anything. */
const NOT_WIRED = ['offer.expired', 'document.uploaded'];

const blankRule = (event: string): Partial<Rule> => ({
  event,
  label: '',
  audience: 'both',
  attribution: 'system',
  body: '',
  condition: null,
  guard: null,
  delayMinutes: 0,
  markUnread: true,
  enabled: true,
  order: 1
});

export function AdminAutomation({ adminKey }: { adminKey: string }) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<Rule> | null>(null);
  const [preview, setPreview] = useState('');
  const [catalogue, setCatalogue] = useState<ConditionCatalogue | null>(null);
  const [reads, setReads] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  /** The server decides what a condition means, so the panel never disagrees with it. */
  const explain = async (condition: unknown, set: (value: string) => void) => {
    if (!condition) { set(''); return; }
    try {
      const answer = await authApi.adminExplainCondition(adminKey, condition);
      set(answer?.valid ? answer.reads : '');
    } catch {
      set('');
    }
  };

  const load = useCallback(async () => {
    const payload = await authApi.adminAutomation(adminKey);
    setRules(payload.rules || []);
    setTriggers(payload.events || []);
    setPlaceholders(payload.placeholders || []);
    return payload.rules as Rule[];
  }, [adminKey]);

  useEffect(() => {
    void load().catch(e => setError(e instanceof Error ? e.message : 'Rules could not be loaded.'));
  }, [load]);

  /**
   * What a condition may read comes from the server, so this editor cannot
   * offer a field the engine would refuse — or miss one it has just gained.
   */
  useEffect(() => {
    void authApi.adminAutomationFields(adminKey)
      .then(payload => setCatalogue(payload as ConditionCatalogue))
      .catch(() => setCatalogue(null));
  }, [adminKey]);

  /** Grouped by trigger, because a trigger is what an admin thinks in. */
  const grouped = useMemo(() => {
    const byEvent = new Map<string, Rule[]>();
    for (const rule of rules) {
      const list = byEvent.get(rule.event) || [];
      list.push(rule);
      byEvent.set(rule.event, list);
    }
    return triggers.map(trigger => ({
      ...trigger,
      rules: (byEvent.get(trigger.event) || []).sort((a, b) => a.order - b.order)
    }));
  }, [rules, triggers]);

  const selected = draft ?? rules.find(rule => rule.id === selectedId) ?? null;
  const isNew = !!draft && !draft.id;
  const dirty = !!draft;

  const edit = (patch: Partial<Rule>) => {
    setNote('');
    setDraft(current => ({ ...(current ?? rules.find(rule => rule.id === selectedId) ?? {}), ...patch }));
  };

  const choose = (rule: Rule) => {
    setDraft(null);
    setPreview('');
    setNote('');
    setError('');
    setSelectedId(rule.id);
  };

  /** Renders the wording against a sample offer, so it is read before it is sent. */
  const runPreview = async () => {
    if (!selected?.body) return;
    setError('');
    try {
      const result = await authApi.adminPreviewAutomation(adminKey, selected.body);
      setPreview(result.rendered || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That wording could not be rendered.');
    }
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      const saved = draft.id
        ? await authApi.adminUpdateAutomationRule(adminKey, draft.id, draft)
        : await authApi.adminCreateAutomationRule(adminKey, draft);
      await load();
      setSelectedId(saved.id);
      setDraft(null);
      setNote(draft.id ? 'Rule saved. It applies to everything that happens from now on.' : 'Rule created.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That rule could not be saved.');
    } finally {
      setBusy(false);
    }
  };

  /** Toggling is separate from editing: it is one click and needs no draft. */
  const toggle = async (rule: Rule) => {
    setBusy(true);
    setError('');
    try {
      await authApi.adminUpdateAutomationRule(adminKey, rule.id, { enabled: !rule.enabled });
      await load();
      setNote(rule.enabled ? `"${rule.label}" is off. Nothing will be posted for it.` : `"${rule.label}" is on.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That rule could not be changed.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (rule: Rule) => {
    setBusy(true);
    setError('');
    try {
      await authApi.adminDeleteAutomationRule(adminKey, rule.id);
      await load();
      setSelectedId(null);
      setDraft(null);
      setNote(`"${rule.label}" was deleted.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That rule could not be deleted.');
    } finally {
      setBusy(false);
    }
  };

  const startNew = (event: string) => {
    setSelectedId(null);
    setPreview('');
    setNote('');
    setError('');
    setDraft(blankRule(event));
  };

  return (
    <div className={cx('automation')}>
      <header className={cx('automation-head')}>
        <div>
          <h2>Message automation</h2>
          <p>
            What a thread says on its own when something happens in it. Rules react only to actions and
            state changes, never to messages automation itself wrote, so one can never set off another.
          </p>
        </div>
        <button type="button" className={cx('ghost')} onClick={() => void load()} disabled={busy}>
          Reload
        </button>
      </header>

      {error && <p className={cx('automation-error')} role="alert">{error}</p>}
      {note && !error && <p className={cx('automation-note')}>{note}</p>}

      <div className={cx('automation-body')}>
        <aside className={cx('automation-rail')}>
          {grouped.map(trigger => (
            <section key={trigger.event} className={cx('trigger')}>
              <header>
                <div>
                  <strong>{trigger.describes}</strong>
                  <code>{trigger.event}</code>
                </div>
                <button type="button" onClick={() => startNew(trigger.event)} aria-label={`Add a rule for ${trigger.event}`}>
                  + Rule
                </button>
              </header>

              {/* Saying so beats letting an admin write a rule that can never fire. */}
              {NOT_WIRED.includes(trigger.event) && (
                <p className={cx('trigger-warning')}>Not wired up yet — rules here will not fire.</p>
              )}

              {!trigger.rules.length && <p className={cx('trigger-empty')}>Nothing is posted for this.</p>}

              {trigger.rules.map(rule => (
                <button
                  key={rule.id}
                  type="button"
                  className={cx('rule', rule.id === selectedId && !isNew && 'selected', !rule.enabled && 'off')}
                  onClick={() => choose(rule)}
                >
                  <span className={cx('rule-label')}>{rule.label}</span>
                  <span className={cx('rule-meta')}>
                    <em>{rule.attribution === 'organization' ? 'as the organisation' : 'platform notice'}</em>
                    <em>to {rule.audience === 'both' ? 'both sides' : rule.audience}</em>
                    {!rule.enabled && <b>Off</b>}
                  </span>
                </button>
              ))}
            </section>
          ))}
        </aside>

        <section className={cx('automation-editor')}>
          {!selected && (
            <p className={cx('editor-empty')}>Pick a rule to reword it, or add one to a trigger.</p>
          )}

          {selected && (
            <>
              <div className={cx('editor-head')}>
                <h3>{isNew ? 'New rule' : selected.label || 'Untitled rule'}</h3>
                {!isNew && selected.id && (
                  <div className={cx('editor-actions')}>
                    <button
                      type="button"
                      className={cx('ghost')}
                      onClick={() => void toggle(selected as Rule)}
                      disabled={busy}
                    >
                      {selected.enabled ? 'Turn off' : 'Turn on'}
                    </button>
                    {/* Built-ins keep the trigger list discoverable, so they only ever switch off. */}
                    <button
                      type="button"
                      className={cx('danger')}
                      onClick={() => void remove(selected as Rule)}
                      disabled={busy || selected.system}
                      title={selected.system ? 'Built-in rules can be reworded or switched off, but not deleted' : undefined}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <label className={cx('field')}>
                <span>Name</span>
                <input
                  name="label"
                  value={selected.label || ''}
                  placeholder="Thank the student for accepting"
                  onChange={event => edit({ label: event.target.value })}
                />
                <small>Only you see this. It names the rule in the list.</small>
              </label>

              <label className={cx('field')}>
                <span>Trigger</span>
                <select name="event" value={selected.event} onChange={event => edit({ event: event.target.value })}>
                  {triggers.map(trigger => (
                    <option key={trigger.event} value={trigger.event}>
                      {trigger.describes}
                    </option>
                  ))}
                </select>
              </label>

              <div className={cx('field-row')}>
                <label className={cx('field')}>
                  <span>Who sees it</span>
                  <select
                    name="audience"
                    value={selected.audience}
                    onChange={event => edit({ audience: event.target.value as Rule['audience'] })}
                  >
                    {AUDIENCES.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <small>{AUDIENCES.find(o => o.value === selected.audience)?.describes}</small>
                </label>

                <label className={cx('field')}>
                  <span>How it appears</span>
                  <select
                    name="attribution"
                    value={selected.attribution}
                    onChange={event => edit({ attribution: event.target.value as Rule['attribution'] })}
                  >
                    {ATTRIBUTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <small>{ATTRIBUTIONS.find(o => o.value === selected.attribution)?.describes}</small>
                </label>
              </div>

              <label className={cx('field')}>
                <span>Message</span>
                <textarea
                  name="body"
                  rows={5}
                  value={selected.body || ''}
                  placeholder="Thank you for accepting, {{student.firstName}}!"
                  onChange={event => edit({ body: event.target.value })}
                />
              </label>

              <div className={cx('placeholders')}>
                <small>Click to insert. Anything the offer does not have resolves to nothing.</small>
                <div>
                  {placeholders.map(placeholder => (
                    <button
                      key={placeholder.token}
                      type="button"
                      title={placeholder.describes}
                      onClick={() => edit({ body: `${selected.body || ''}${placeholder.token}` })}
                    >
                      {placeholder.token}
                    </button>
                  ))}
                </div>
              </div>

              {/*
                * A trigger is an event plus the case it applies to. Without this
                * the nine events were nine rules; with it they are as many as
                * the admin needs.
                */}
              <div className={cx('field')}>
                <span>Only when</span>
                <ConditionBuilder
                  catalogue={catalogue}
                  join={toRows(selected.condition).join}
                  rows={toRows(selected.condition).rows}
                  cx={cx}
                  emptyLabel="Every time this happens. Add a test to narrow it."
                  onChange={(join, rows) => {
                    const next = fromRows(join, rows as Predicate[]);
                    edit({ condition: next });
                    void explain(next, setReads);
                  }}
                />
                {!!reads && <small className={cx('condition-reads')}>Fires when {reads}.</small>}
              </div>

              {/*
                * Waiting is what turns a notice into a nudge. It is also the one
                * thing that can make an automated message wrong by the time it
                * arrives, which is why a wait comes with a reason to still send.
                */}
              <label className={cx('field')}>
                <span>Wait before sending</span>
                <select
                  name="delayMinutes"
                  value={String(selected.delayMinutes ?? 0)}
                  onChange={event => edit({ delayMinutes: Number(event.target.value) })}
                >
                  {DELAYS.map(option => (
                    <option key={option.minutes} value={option.minutes}>{option.label}</option>
                  ))}
                </select>
              </label>

              {(selected.delayMinutes ?? 0) > 0 && (
                <div className={cx('field')}>
                  <span>Only still send if</span>
                  <ConditionBuilder
                    catalogue={catalogue}
                    join={toRows(selected.guard).join}
                    rows={toRows(selected.guard).rows}
                    cx={cx}
                    emptyLabel="Send regardless of what has changed while it waited."
                    onChange={(join, rows) => edit({ guard: fromRows(join, rows as Predicate[]) })}
                  />
                  <small className={cx('condition-help')}>
                    Re-read at the moment it would send, so a reminder written days ago does not
                    reach someone who has already replied.
                  </small>
                </div>
              )}

              <label className={cx('checkbox')}>
                <input
                  type="checkbox"
                  name="markUnread"
                  checked={selected.markUnread ?? true}
                  onChange={event => edit({ markUnread: event.target.checked })}
                />
                <span>Badge the other side as unread</span>
              </label>

              <div className={cx('editor-foot')}>
                <button type="button" className={cx('ghost')} onClick={() => void runPreview()} disabled={!selected.body}>
                  Preview wording
                </button>
                <div>
                  {dirty && (
                    <button type="button" className={cx('ghost')} onClick={() => { setDraft(null); setPreview(''); }} disabled={busy}>
                      Discard changes
                    </button>
                  )}
                  <button type="button" className={cx('primary')} onClick={() => void save()} disabled={!dirty || busy}>
                    {isNew ? 'Create rule' : 'Save rule'}
                  </button>
                </div>
              </div>

              {preview && (
                <div className={cx('preview')}>
                  <small>AS A STUDENT WOULD READ IT</small>
                  <p>{preview}</p>
                  <em>Rendered against a sample offer — Aarav Mehta, MSc Data Science at Northbridge University.</em>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
