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

export type ChannelKey = 'inapp' | 'email' | 'whatsapp' | 'sms';

/** One thing a rule does. A rule holds a list of them, run in order. */
export interface NotifyAction {
  type: 'notify';
  channels: ChannelKey[];
  audience: 'student' | 'organization' | 'both';
  attribution: 'system' | 'organization';
  body: string;
  /** Email only. Falls back to the rule's name when blank. */
  subject?: string;
  /** WhatsApp will not deliver free text outside a 24-hour window. */
  templates?: Partial<Record<ChannelKey, { name: string; params: string[] }>>;
  /**
   * What one channel says, when it should not say what the others say.
   * Anything left blank falls back to the action's own body and subject.
   */
  content?: Partial<Record<ChannelKey, ChannelContent>>;
  /** Minutes to wait before this action runs. 0, or absent, means at once. */
  delayMinutes?: number;
  markUnread?: boolean;
}

export interface ChannelContent {
  body?: string;
  subject?: string;
  template?: { name: string; params: string[] };
}

interface ChannelStatus {
  channel: ChannelKey;
  label: string;
  describes: string;
  configured: boolean;
  provider: string;
}

interface Rule {
  id: string;
  event: string;
  label: string;
  /** What the rule does. Older rules have none and are read as one action. */
  actions: NotifyAction[];
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

/**
 * A rule written before actions existed, read as the single action it was.
 *
 * The same fallback the server applies, repeated here so the editor opens an
 * old rule without first having to save it into the new shape.
 */
const actionsOf = (rule: Partial<Rule> | null): NotifyAction[] => {
  if (!rule) return [];
  if (Array.isArray(rule.actions) && rule.actions.length) return rule.actions;
  return [{
    type: 'notify',
    channels: ['inapp'],
    audience: rule.audience || 'both',
    attribution: rule.attribution || 'system',
    body: rule.body || '',
    markUnread: rule.markUnread !== false
  }];
};

/** Shown until the server says which channels it has; same order, same names. */
const FALLBACK_CHANNELS: ChannelStatus[] = [
  { channel: 'inapp', label: 'Native chat', describes: 'Posted in the offer thread', configured: true, provider: 'built in' },
  { channel: 'email', label: 'Email', describes: 'Sent to the address on the account', configured: true, provider: '' },
  { channel: 'whatsapp', label: 'WhatsApp', describes: 'Sent to the mobile on the account', configured: true, provider: '' },
  { channel: 'sms', label: 'SMS', describes: 'Sent to the mobile on the account', configured: true, provider: '' }
];

/** Every channel a rule touches, across all of its actions, in a fixed order. */
const channelsOf = (rule: Partial<Rule>): ChannelKey[] => {
  const seen = new Set<ChannelKey>();
  for (const action of actionsOf(rule)) for (const channel of action.channels || []) seen.add(channel);
  return (['inapp', 'email', 'whatsapp'] as ChannelKey[]).filter(channel => seen.has(channel));
};

/** Short enough to sit three-across on a narrow card. */
const SHORT_CHANNEL: Record<ChannelKey, string> = {
  inapp: 'Chat',
  email: 'Email',
  whatsapp: 'WhatsApp',
  sms: 'SMS'
};

/**
 * The rule as a sentence.
 *
 * Written from the same values the form edits, so it cannot drift from what
 * will actually happen — and it is the fastest way to check a rule is the one
 * you meant to open.
 */
const readsAloud = (
  rule: Partial<Rule> | null,
  actions: NotifyAction[],
  triggers: Trigger[]
): string => {
  if (!rule) return '';
  const when = triggers.find(t => t.event === rule.event)?.describes || 'something happens';
  if (!actions.length) return `When ${when.toLowerCase()}, nothing is sent.`;

  const said = actions.map(action => {
    const who = action.audience === 'both' ? 'both sides'
      : action.audience === 'organization' ? 'the organisation'
        : 'the student';
    const where = (action.channels.length ? action.channels : (['inapp'] as ChannelKey[]))
      .map(channel => SHORT_CHANNEL[channel].toLowerCase());
    const list = where.length === 1
      ? where[0]
      : `${where.slice(0, -1).join(', ')} and ${where[where.length - 1]}`;
    return `${who} on ${list}`;
  });

  const tail = said.length === 1 ? said[0] : `${said.slice(0, -1).join('; ')}; and ${said[said.length - 1]}`;
  return `When ${when.toLowerCase()}, tell ${tail}.`;
};

const BLANK_ACTION: NotifyAction = {
  type: 'notify',
  channels: ['inapp'],
  audience: 'student',
  attribution: 'system',
  body: '',
  markUnread: true
};

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
  const [channels, setChannels] = useState<ChannelStatus[]>([]);
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
  /** Which channels can actually send, so the editor can say when one cannot. */
  useEffect(() => {
    void authApi.adminAutomationChannels(adminKey)
      .then(payload => setChannels((payload || []) as ChannelStatus[]))
      .catch(() => setChannels([]));
  }, [adminKey]);

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

  /** The actions being edited, whether or not this rule has been saved yet. */
  const currentActions = useMemo(() => actionsOf(draft ?? selected), [draft, selected]);

  const setActions = (next: NotifyAction[]) => edit({ actions: next });

  const editAction = (index: number, patch: Partial<NotifyAction>) =>
    setActions(currentActions.map((action, i) => (i === index ? { ...action, ...patch } : action)));

  const addAction = (delayMinutes: number) =>
    setActions([...currentActions, { ...BLANK_ACTION, delayMinutes }]);

  /**
   * Which actions run at once, and which wait — grouped the way the canvas
   * draws them.
   *
   * The index is carried alongside each action because every editing handler
   * addresses actions by position in the saved list, and grouping them for
   * display must not change what that position means.
   */
  const positioned = useMemo(
    () => currentActions.map((action, index) => ({ action, index })),
    [currentActions]
  );

  const delayOfAction = (action: NotifyAction) =>
    typeof action.delayMinutes === 'number' && action.delayMinutes >= 0
      ? action.delayMinutes
      : (selected?.delayMinutes ?? 0);

  const instantActions = positioned.filter(entry => delayOfAction(entry.action) === 0);

  const scheduledGroups = useMemo(() => {
    const byDelay = new Map<number, Array<{ action: NotifyAction; index: number }>>();
    for (const entry of positioned) {
      const delay = delayOfAction(entry.action);
      if (delay === 0) continue;
      if (!byDelay.has(delay)) byDelay.set(delay, []);
      byDelay.get(delay)!.push(entry);
    }
    return [...byDelay.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([delayMinutes, items]) => ({ delayMinutes, items }));
  }, [positioned, selected]);

  const hasScheduled = scheduledGroups.length > 0;

  /** Moving a whole set to a different time, rather than each action in it. */
  const retimeGroup = (from: number, to: number) =>
    setActions(currentActions.map(action =>
      (delayOfAction(action) === from ? { ...action, delayMinutes: to } : action)
    ));

  /** A new set starts at the first wait nothing else already uses. */
  const addScheduledSet = () => {
    const taken = new Set(scheduledGroups.map(group => group.delayMinutes));
    const next = DELAYS.filter(option => option.minutes > 0).find(option => !taken.has(option.minutes));
    setActions([...currentActions, { ...BLANK_ACTION, delayMinutes: next?.minutes ?? 1440 }]);
  };

  const removeAction = (index: number) => setActions(currentActions.filter((_, i) => i !== index));

  const toggleChannel = (index: number, channel: ChannelKey) => {
    const action = currentActions[index];
    const on = action.channels.includes(channel);
    editAction(index, {
      channels: on ? action.channels.filter(c => c !== channel) : [...action.channels, channel]
    });
  };

  /** What one channel says instead of the action's own words. */
  const editContent = (index: number, channel: ChannelKey, patch: Partial<ChannelContent>) => {
    const action = currentActions[index];
    const existing = action.content?.[channel] ?? {};
    editAction(index, {
      content: { ...action.content, [channel]: { ...existing, ...patch } }
    });
  };

  const editTemplate = (index: number, patch: { name?: string; params?: string[] }) => {
    const action = currentActions[index];
    const existing = action.content?.whatsapp?.template
      ?? action.templates?.whatsapp
      ?? { name: '', params: [] };
    editContent(index, 'whatsapp', { template: { ...existing, ...patch } });
  };

  /** Which channel's panel is open, per action. */
  const [openChannel, setOpenChannel] = useState<Record<number, string>>({});

  /**
   * Whether this rule has been narrowed, delayed or guarded.
   *
   * A fold that hides a condition somebody set is a trap, so it opens itself
   * whenever there is something inside worth seeing.
   */
  const hasFineTuning = Boolean(selected?.guard || selected?.markUnread === false);

  const fineTuningSummary = useMemo(() => {
    const parts: string[] = [];
    if (selected?.guard) parts.push('guarded');
    if (selected?.markUnread === false) parts.push('no unread badge');
    return parts.length ? parts.join(' · ') : 'Defaults';
  }, [selected]);

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    setError('');
    try {
      /*
       * body, audience and attribution are what a rule was before it could do
       * more than one thing. They stay as a mirror of the first action so that
       * anything still reading them — the server's own validation among them —
       * sees a rule that makes sense.
       */
      const actions = actionsOf(draft);
      const payload = {
        ...draft,
        actions,
        body: actions[0]?.body ?? '',
        audience: actions[0]?.audience ?? 'both',
        attribution: actions[0]?.attribution ?? 'system'
      };
      const saved = draft.id
        ? await authApi.adminUpdateAutomationRule(adminKey, draft.id, payload)
        : await authApi.adminCreateAutomationRule(adminKey, payload);
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

  /** One action, drawn the same wherever it sits on the canvas. */
  const renderAction = (action: NotifyAction, index: number) => {
                const wantsEmail = action.channels.includes('email');
                const wantsWhatsApp = action.channels.includes('whatsapp');
                return (
                  <div className={cx('action-card')} key={index}>
                    <div className={cx('action-head')}>
                      <strong>Action {index + 1}</strong>
                      {currentActions.length > 1 && (
                        <button
                          type="button"
                          className={cx('drop-action')}
                          onClick={() => removeAction(index)}
                          aria-label={`Remove action ${index + 1}`}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className={cx('addressing')}>
                      <label className={cx('inline-field')}>
                        <span>Tell</span>
                        <select
                          name={`audience-${index}`}
                          value={action.audience}
                          onChange={event => editAction(index, { audience: event.target.value as Rule['audience'] })}
                        >
                          {AUDIENCES.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>
                      <span className={cx('inline-word')}>on</span>
                      <div className={cx('channels')}>
                        {(channels.length ? channels : FALLBACK_CHANNELS).map(channel => {
                          const on = action.channels.includes(channel.channel);
                          return (
                            <label
                              key={channel.channel}
                              className={cx('channel', on && 'on', !channel.configured && 'unconfigured')}
                              title={channel.describes}
                            >
                              <input
                                type="checkbox"
                                name={`channel-${index}-${channel.channel}`}
                                checked={on}
                                onChange={() => toggleChannel(index, channel.channel)}
                              />
                              <span>{channel.label}</span>
                              {!channel.configured && <em>not configured</em>}
                            </label>
                          );
          })}
                      </div>
                    </div>
                    {!action.channels.length && (
                      <small className={cx('needs-channel')}>Pick at least one — a rule with no channel does nothing.</small>
                    )}

                    <label className={cx('field')}>
                      <textarea
                        name={`body-${index}`}
                        rows={4}
                        value={action.body || ''}
                        placeholder="Thank you for accepting, {{student.firstName}}!"
                        onChange={event => editAction(index, { body: event.target.value })}
                      />
                    </label>

                    <details className={cx('placeholders')}>
                      <summary>Insert a value from the offer</summary>
                      <div>
                        {placeholders.map(placeholder => (
                          <button
                            key={placeholder.token}
                            type="button"
                            title={placeholder.describes}
                            onClick={() => editAction(index, { body: `${action.body || ''}${placeholder.token}` })}
                          >
                            {placeholder.token}
                          </button>
                        ))}
                      </div>
                    </details>

                    {/*
                      * One panel per channel this action sends on.
                      *
                      * The message above is what every channel says unless a
                      * channel says otherwise here. That default matters: most
                      * rules are happy saying one thing everywhere, and asking
                      * an admin to write the same sentence three times is how
                      * three sentences end up disagreeing.
                      */}
                    {action.channels.filter(channel => channel !== 'inapp').length > 0 && (
                      <div className={cx('per-channel')}>
                        <div className={cx('per-channel-tabs')}>
                          {action.channels.map(channel => {
                            const own = action.content?.[channel];
                            /* A registered template is tailoring too — it is the
                               one thing WhatsApp will actually carry. */
                            const tailored = Boolean(
                              own?.body?.trim() || own?.subject?.trim() || own?.template?.name?.trim()
                            );
                            return (
                              <button
                                key={channel}
                                type="button"
                                className={cx('per-channel-tab', openChannel[index] === channel && 'on')}
                                onClick={() => setOpenChannel({ ...openChannel, [index]: openChannel[index] === channel ? '' : channel })}
                              >
                                {SHORT_CHANNEL[channel]}
                                {tailored && <i className={cx('tailored')} title="Worded for this channel">●</i>}
                              </button>
                            );
                          })}
                        </div>

                        {action.channels.map(channel => openChannel[index] === channel && (
                          <div className={cx('per-channel-panel')} key={channel}>
                            {channel === 'inapp' && (
                              <p className={cx('per-channel-note')}>
                                The offer thread carries the message exactly as written above.
                              </p>
                            )}

                            {channel === 'email' && (
                              <>
                                <label className={cx('field')}>
                                  <span>Subject</span>
                                  <input
                                    type="text"
                                    name={`subject-${index}`}
                                    value={action.content?.email?.subject ?? action.subject ?? ''}
                                    placeholder={selected?.label || 'Uses the rule name when blank'}
                                    onChange={event => editContent(index, 'email', { subject: event.target.value })}
                                  />
                                </label>
                                <label className={cx('field')}>
                                  <span>Email wording</span>
                                  <textarea
                                    rows={4}
                                    name={`content-email-${index}`}
                                    value={action.content?.email?.body ?? ''}
                                    placeholder="Leave blank to send the message above"
                                    onChange={event => editContent(index, 'email', { body: event.target.value })}
                                  />
                                  <small>A thread line often reads like a fragment as an email. Give it a fuller version here.</small>
                                </label>
                              </>
                            )}

                            {channel === 'sms' && (
                              <div className={cx('template-box')}>
                                <strong>DLT-registered template</strong>
                                <p>
                                  An SMS to an Indian number must match a template registered on the DLT
                                  platform, under a registered sender ID — anything else is rejected by the
                                  operator rather than delivered late. Paste the approved text, with
                                  {' '}<code>{'{#var#}'}</code> where each value goes.
                                </p>
                                <label className={cx('field')}>
                                  <span>Approved template text</span>
                                  <textarea
                                    rows={3}
                                    name={`sms-template-${index}`}
                                    value={action.content?.sms?.template?.name ?? ''}
                                    placeholder="Hi {#var#}, your offer for {#var#} is still open."
                                    onChange={event => editContent(index, 'sms', {
                                      template: {
                                        name: event.target.value,
                                        params: action.content?.sms?.template?.params ?? []
                                      }
                                    })}
                                  />
                                </label>
                                <label className={cx('field')}>
                                  <span>Values, in order</span>
                                  <input
                                    type="text"
                                    name={`sms-params-${index}`}
                                    value={(action.content?.sms?.template?.params ?? []).join(', ')}
                                    placeholder="{{student.firstName}}, {{offer.program}}"
                                    onChange={event => editContent(index, 'sms', {
                                      template: {
                                        name: action.content?.sms?.template?.name ?? '',
                                        params: event.target.value.split(',').map(p => p.trim()).filter(Boolean)
                                      }
                                    })}
                                  />
                                  <small>One per {'{#var#}'}, in the order they appear.</small>
                                </label>
                              </div>
                            )}

                            {channel === 'whatsapp' && (
                              <div className={cx('template-box')}>
                                <strong>Approved template</strong>
                                <p>
                                  WhatsApp only delivers templates you have registered with Meta, unless the student
                                  messaged you in the last 24 hours — so this replaces the message above rather than
                                  adding to it.
                                </p>
                                <label className={cx('field')}>
                                  <span>Template name</span>
                                  <input
                                    type="text"
                                    name={`template-${index}`}
                                    value={action.content?.whatsapp?.template?.name ?? action.templates?.whatsapp?.name ?? ''}
                                    placeholder="offer_reminder"
                                    onChange={event => editTemplate(index, { name: event.target.value })}
                                  />
                                </label>
                                <label className={cx('field')}>
                                  <span>Values, in order</span>
                                  <input
                                    type="text"
                                    name={`params-${index}`}
                                    value={(action.content?.whatsapp?.template?.params ?? action.templates?.whatsapp?.params ?? []).join(', ')}
                                    placeholder="{{student.firstName}}, {{offer.program}}"
                                    onChange={event => editTemplate(index, {
                                      params: event.target.value.split(',').map(part => part.trim()).filter(Boolean)
                                    })}
                                  />
                                  <small>Comma separated. Placeholders are filled the same way the message is.</small>
                                </label>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                );
  };

  return (
    <div className={cx('automation')}>
{/*
        * No heading here.
        *
        * The page above already says "Message automation" and what it is for.
        * Repeating it in a card of its own cost a fifth of the screen and told
        * an admin nothing they had not read a centimetre higher up.
        */}

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
                  {/*
                    * Where it goes, on the card.
                    *
                    * Without this a rule that reaches a student on WhatsApp
                    * looks exactly like one that only writes to the thread,
                    * and the whole point of the change is invisible from the
                    * list an admin spends most of their time in.
                    */}
                  <span className={cx('rule-channels')}>
                    {channelsOf(rule).map(channel => (
                      <i key={channel} className={cx('chip', channel)}>{SHORT_CHANNEL[channel]}</i>
                    ))}
                    {actionsOf(rule).length > 1 && <i className={cx('chip', 'count')}>{actionsOf(rule).length}</i>}
                    {!rule.enabled && <i className={cx('chip', 'off')}>Off</i>}
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

              {/*
                * The rule drawn as the flow it is.
                *
                * A rule is genuinely a sequence — this happens, then if this
                * holds, do these things now and these things later — and a
                * stack of labelled fields hid that shape completely. The
                * nodes down the left are the sequence; the cards beside them
                * are what an admin actually edits.
                */}
              <div className={cx('canvas')}>

                <div className={cx('step')}>
                  <div className={cx('node', 'when')}>WHEN</div>
                  <div className={cx('step-card')}>
                    <select name="event" value={selected.event} onChange={event => edit({ event: event.target.value })}>
                      {triggers.map(trigger => (
                        <option key={trigger.event} value={trigger.event}>{trigger.describes}</option>
                      ))}
                    </select>
                    <p className={cx('node-note')}>{readsAloud(selected, currentActions, triggers)}</p>
                  </div>
                </div>

                <div className={cx('step')}>
                  <div className={cx('node', 'condition')}><span>IF</span></div>
                  <div className={cx('step-card')}>
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
                    {!!reads && <small className={cx('node-note')}>Fires when {reads}.</small>}
                  </div>
                </div>

                <div className={cx('step', 'last')}>
                  <div className={cx('node', 'do')}>DO</div>
                  <div className={cx('do-cards')}>

                    {/* Everything that happens the moment the trigger fires. */}
                    <section className={cx('act-card', 'instant')}>
                      <header>
                        <strong>Instant actions</strong>
                        <em>As soon as it happens</em>
                      </header>
                      {instantActions.map(({ action, index }) => renderAction(action, index))}
                      {!instantActions.length && <p className={cx('act-empty')}>Nothing happens straight away.</p>}
                      <button type="button" className={cx('add-action')} onClick={() => addAction(0)}>+ Action</button>
                    </section>

                    {/*
                      * One card per distinct wait, the way an admin thinks of
                      * it: "and then, a week later…". Each carries its own
                      * timing, and the guard that decides whether it is still
                      * worth sending when the time comes.
                      */}
                    {scheduledGroups.map(group => (
                      <section className={cx('act-card', 'scheduled')} key={group.delayMinutes}>
                        <header>
                          <strong>Scheduled actions</strong>
                          <label className={cx('delay-pick')}>
                            <span>Execute</span>
                            <select
                              value={String(group.delayMinutes)}
                              onChange={event => retimeGroup(group.delayMinutes, Number(event.target.value))}
                            >
                              {DELAYS.filter(d => d.minutes > 0).map(option => (
                                <option key={option.minutes} value={option.minutes}>
                                  {option.label.replace(/^After /i, '')}
                                </option>
                              ))}
                            </select>
                            <span>after trigger time</span>
                          </label>
                        </header>
                        {group.items.map(({ action, index }) => renderAction(action, index))}
                        <button
                          type="button"
                          className={cx('add-action')}
                          onClick={() => addAction(group.delayMinutes)}
                        >
                          + Action
                        </button>
                      </section>
                    ))}

                    <button type="button" className={cx('add-set')} onClick={addScheduledSet}>
                      + Scheduled actions
                    </button>
                  </div>
                </div>
              </div>

              {/*
                * The two settings that belong to the rule rather than to any
                * one action, kept out of the flow so the flow stays readable.
                */}
              <details className={cx('advanced')} open={hasFineTuning}>
                <summary>
                  <span>Rule options</span>
                  <em>{fineTuningSummary}</em>
                </summary>

                {hasScheduled && (
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
                      Re-read at the moment a scheduled action would send, so a reminder written days
                      ago does not reach someone who has already replied.
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

                {currentActions.some(action => action.channels.includes('inapp')) && (
                  <label className={cx('field')}>
                    <span>In the native chat, show it as</span>
                    <select
                      name="attribution-0"
                      value={currentActions[0]?.attribution || 'system'}
                      onChange={event => editAction(0, { attribution: event.target.value as Rule['attribution'] })}
                    >
                      {ATTRIBUTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                )}
              </details>

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
