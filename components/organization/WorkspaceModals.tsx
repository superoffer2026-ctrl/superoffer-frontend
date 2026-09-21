'use client';

import { useEffect, useRef, useState } from 'react';
import { SchemaFields } from '@/components/student/SchemaFields';
import { prettyDomain, websiteHref } from '@/lib/stores/offer-wallet.store';
import { classNames } from '@/lib/cx';
import {
  CODED_INVITE_FIELDS,
  CODED_OFFER_FIELDS,
  CODED_PRODUCT_FIELDS,
  useOrgForm
} from '@/lib/forms/use-org-form';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';
import { MediaUploadField } from './MediaUploadField';

const cx = classNames(styles);

type Cx = typeof cx;
type Workspace = ReturnType<typeof useOrganizationWorkspace>;

const fieldLabel = { display: 'flex', flexDirection: 'column' as const, gap: 6, fontSize: 13.5, fontWeight: 800, color: '#3f3f46' };

/** The chevron the Angular template inlined as a data URI on both category selects. */
const SELECT_CHEVRON = {
  WebkitAppearance: 'none' as const,
  appearance: 'none' as const,
  backgroundImage:
    "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23172019%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')",
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 14px center',
  backgroundSize: '11px auto'
};

/**
 * What each figure on a template is called, per organisation type.
 *
 * The keys are the vocabulary the comparison table and the cross-side valuation
 * read, so a template written here is a template those can actually price.
 *
 * A university's list is down to one. Tuition fee and duration were asked for
 * here as well as on the course itself, which meant a registrar typed them
 * twice and the two copies could disagree — and it is the course that is the
 * truth. They now travel with the offer from the product it is sent on.
 * Scholarship, meanwhile, was split across two fields that said the same thing
 * in two ways; it is now the one benefit line below. What is left is the only
 * figure a template can state that its course cannot: the deposit.
 */
const TEMPLATE_FIGURES: Record<string, Array<{ key: string; label: string; placeholder: string }>> = {
  UNIVERSITY: [
    { key: 'depositAmount', label: 'Deposit amount (optional)', placeholder: 'e.g. CAD 2,000' }
  ],
  BANK: [
    { key: 'loanAmount', label: 'Loan amount', placeholder: '₹38,00,000' },
    { key: 'interestRate', label: 'Interest rate', placeholder: '9.4% p.a.' },
    { key: 'tenure', label: 'Repayment tenure', placeholder: '10 years' }
  ]
};

/**
 * The shapes a scholarship actually takes, offered as suggestions rather than
 * as a closed list — a benefit is stated in whatever terms the university
 * agreed to, and a percentage, a flat sum and none at all are all common.
 */
const BENEFIT_SUGGESTIONS = [
  '40% tuition scholarship',
  '25% tuition scholarship',
  'CAD 10,000 scholarship',
  'Full tuition waiver',
  'No scholarship'
];

/**
 * The percentage a benefit line states, if it states one.
 *
 * `scholarshipPct` is a number the student's comparison table and the lender's
 * valuation both read. The form no longer asks for it separately — asking twice
 * was the duplication being removed — so it is read back out of the sentence
 * the officer wrote. "40% tuition scholarship" gives 40; "CAD 10,000
 * scholarship" gives nothing, which is the truth about it.
 */
const percentIn = (benefit: string): number | undefined => {
  const match = /(\d+(?:\.\d+)?)\s*%/.exec(benefit || '');
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : undefined;
};

/**
 * What a student will see under the institution's name, shown read-only while
 * an invite is being sent.
 *
 * Read-only on purpose. The website is asked for once, in the organisation
 * profile, and resolved live wherever an offer is displayed — so an officer
 * sending their fortieth invite of the week is not asked for it a fortieth
 * time. This row exists only so they can confirm what it currently says, and
 * notice if it is wrong before forty students see it.
 */
function OfficialWebsiteRow({ website, cx }: { website?: string | null; cx: Cx }) {
  const value = (website || '').trim();
  return (
    <div className={cx('invite-website')}>
      <small>OFFICIAL WEBSITE</small>
      {value ? (
        <a href={websiteHref(value)} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()}>
          {prettyDomain(value)} ↗
        </a>
      ) : (
        /* Named rather than left blank: a student sees no link at all, and the
           officer is the only person who can fix that. */
        <em>Not set — add it in your organisation profile so students can find you.</em>
      )}
    </div>
  );
}

export function WorkspaceModals({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, orgName, orgDomain, students, products, loanProducts, bankEvaluationMode,
    productInviteDraft, setProductInviteDraft, addProductToInvite, removeProductFromInvite, availableProductsForInvite,
    activePresetCategories, getPresetsByCategory, selectPreset, sendProductInvite,
    offerDraft, setOfferDraft, onOfferCourseChange, onOfferProductChange, saveOffer,
    catalogDraft, setCatalogDraft, saveCatalogItem, uploadProgramImage, profile,
    quickInvite, setQuickInvite, sendQuickInvite, offerTemplates,
    templateDraft, setTemplateDraft, saveTemplate,
    negotiationOffer, setNegotiationOffer, negotiationReply, setNegotiationReply, sendNegotiationReply,
    offerPrimary, offerSecondary,
    inviteDraft, setInviteDraft, sendInvite
  } = workspace;

  const notesRef = useRef<HTMLTextAreaElement>(null);

  /** The notes box grows with its content as presets are inserted. */
  useEffect(() => {
    const el = notesRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [productInviteDraft?.conditions]);

  /**
   * What the admin has published for this organisation type. The modals keep
   * their hand-built layout and consult these for what has changed: a field
   * hidden, relabelled, made required, or added outright.
   */
  const offerForm = useOrgForm('ORG_OFFER', role, 'offerTerms', CODED_OFFER_FIELDS[role] || CODED_OFFER_FIELDS.UNIVERSITY);
  const productForm = useOrgForm('ORG_PRODUCT', role, 'productDetails', CODED_PRODUCT_FIELDS);
  const inviteForm = useOrgForm('ORG_PRODUCT_INVITE', role, 'productInvite', CODED_INVITE_FIELDS);

  /** Answers to admin-added fields, kept beside the coded draft. */
  const [offerExtras, setOfferExtras] = useState<Record<string, unknown>>({});
  const [productExtras, setProductExtras] = useState<Record<string, unknown>>({});
  const [extrasError, setExtrasError] = useState('');

  /** Added answers ride along in the offer terms, where the rest of the figures live. */
  const submitOffer = () => {
    const problem = offerForm.validateAdded(offerExtras);
    setExtrasError(problem);
    if (problem) return;
    saveOffer(offerExtras);
    setOfferExtras({});
  };

  const submitCatalogItem = () => {
    const problem = productForm.validateAdded(productExtras);
    setExtrasError(problem);
    if (problem) return;
    saveCatalogItem(productExtras);
    setProductExtras({});
  };

  return (
    <>
      {productInviteDraft && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setProductInviteDraft(null)}>
          <form
            className={cx('right-side-drawer')}
            onSubmit={event => { event.preventDefault(); sendProductInvite(); }}
            onClick={event => event.stopPropagation()}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: '4px 0', fontSize: 24 }}>Invite to Product</h2>
                <p style={{ margin: 0, color: '#52525b', fontSize: 13 }}>Select a product to invite this candidate.</p>
              </div>
              <button
                type="button"
                onClick={() => setProductInviteDraft(null)}
                style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 28, lineHeight: 1, color: '#71717a', cursor: 'pointer' }}
              >
                ×
              </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
              <label style={fieldLabel}>
                Product
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', minHeight: 42, alignItems: 'center' }}>
                  {productInviteDraft.productNames.map((name: string) => (
                    <span key={name} style={{ background: '#f2f2f1', color: '#047857', padding: '4px 10px', borderRadius: 16, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {name}
                      <button
                        type="button"
                        onClick={() => removeProductFromInvite(name)}
                        style={{ background: 'transparent', border: 'none', color: '#047857', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <select
                    value=""
                    onChange={event => addProductToInvite(event.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#18181b', minWidth: 140 }}
                  >
                    <option value="" disabled>Select a product...</option>
                    {availableProductsForInvite().map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                  </select>
                </div>
              </label>


              <label style={fieldLabel}>
                Optional Template
                <select
                  value={productInviteDraft.templateId || ''}
                  onChange={event => {
                    const tid = event.target.value;
                    const template = offerTemplates.find((t: any) => t.id === tid);
                    if (template) {
                      setProductInviteDraft({
                        ...productInviteDraft,
                        templateId: tid,
                        headline: template.name || '',
                        valueLabel: template.valueLabel || '',
                        value: template.value || '',
                        description: template.description || '',
                        conditions: template.conditions || productInviteDraft.conditions || '',
                        responseWindowDays: template.responseWindowDays || '',
                        nextSteps: template.nextSteps ? template.nextSteps.join('\n') : ''
                      });
                    } else {
                      setProductInviteDraft({ ...productInviteDraft, templateId: '' });
                    }
                  }}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14 }}
                >
                  <option value="">-- No template (manual) --</option>
                  {offerTemplates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </label>

              <label style={fieldLabel}>
                Headline
                <input
                  type="text"
                  value={productInviteDraft.headline || ''}
                  onChange={e => setProductInviteDraft({ ...productInviteDraft, headline: e.target.value })}
                  placeholder={`Invitation for ${productInviteDraft.productNames.join(', ')}`}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14 }}
                />
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label style={fieldLabel}>
                  Value Label
                  <input
                    type="text"
                    value={productInviteDraft.valueLabel || ''}
                    onChange={e => setProductInviteDraft({ ...productInviteDraft, valueLabel: e.target.value })}
                    placeholder="e.g. Scholarship"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14 }}
                  />
                </label>
                <label style={fieldLabel}>
                  Value
                  <input
                    type="text"
                    value={productInviteDraft.value || ''}
                    onChange={e => setProductInviteDraft({ ...productInviteDraft, value: e.target.value })}
                    placeholder="e.g. 40% tuition"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14 }}
                  />
                </label>
              </div>

              <label style={fieldLabel}>
                Message / Description
                <textarea
                  value={productInviteDraft.description || ''}
                  onChange={e => setProductInviteDraft({ ...productInviteDraft, description: e.target.value })}
                  placeholder="e.g. We were impressed by your profile..."
                  style={{ width: '100%', minHeight: 80, padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14, resize: 'none' }}
                />
              </label>

              <label style={fieldLabel}>
                Next Steps (one per line)
                <textarea
                  value={productInviteDraft.nextSteps || ''}
                  onChange={e => setProductInviteDraft({ ...productInviteDraft, nextSteps: e.target.value })}
                  placeholder="Review conditions\nConfirm acceptance"
                  style={{ width: '100%', minHeight: 80, padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14, resize: 'none' }}
                />
              </label>

              <label style={fieldLabel}>
                Response Deadline (days)
                <input
                  type="number"
                  value={productInviteDraft.responseWindowDays || ''}
                  onChange={e => setProductInviteDraft({ ...productInviteDraft, responseWindowDays: e.target.value })}
                  placeholder="e.g. 14"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14 }}
                />
              </label>

              <label style={fieldLabel}>
                {inviteForm.labelOf('conditions', 'Notes')}
                <textarea
                  ref={notesRef}
                  name="conditions"
                  value={productInviteDraft.conditions}
                  onChange={event => setProductInviteDraft({ ...productInviteDraft, conditions: event.target.value })}
                  placeholder={inviteForm.placeholderOf('conditions', 'e.g. Additional requirements...')}
                  style={{ width: '100%', minHeight: 120, padding: '10px 12px', border: '1px solid #d8d8d5', borderRadius: 9, background: '#fbfbfa', fontSize: 14, color: '#18181b', resize: 'none', overflow: 'hidden', lineHeight: 1.5 }}
                />
              </label>

              <label style={fieldLabel}>
                Quick Conditions
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                  {activePresetCategories.map(category => (
                    <div key={category} style={{ background: '#ffffff', border: '1px solid #e4e4e2', borderRadius: 8, overflow: 'hidden' }}>
                      <div
                        style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fbfbfa' }}
                        onClick={() =>
                          setProductInviteDraft({
                            ...productInviteDraft,
                            expandedCategory: productInviteDraft.expandedCategory === category ? null : category
                          })
                        }
                      >
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#18181b' }}>{category}</div>
                        <div style={{ fontSize: 16, color: '#71717a', fontWeight: 400, lineHeight: 1 }}>
                          {productInviteDraft.expandedCategory === category ? '−' : '+'}
                        </div>
                      </div>
                      {productInviteDraft.expandedCategory === category && (
                        <div style={{ padding: 8, borderTop: '1px solid #e4e4e2', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {getPresetsByCategory(category).map(preset => {
                            const selected = productInviteDraft.selectedPresetByCategory[category] === preset.id;
                            return (
                              <div
                                key={preset.id}
                                style={{
                                  background: selected ? '#f2f2f1' : 'transparent',
                                  border: selected ? '1px solid #047857' : '1px solid transparent',
                                  borderRadius: 6, padding: 10, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => selectPreset(category, preset.id, preset.text)}
                              >
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <div
                                    style={{
                                      border: selected ? '5px solid #047857' : '2px solid #d8d8d5',
                                      width: 18, height: 18, borderRadius: '50%', background: '#ffffff', marginTop: 1,
                                      flexShrink: 0, transition: 'all 0.15s ease-in-out', boxSizing: 'border-box'
                                    }}
                                  ></div>
                                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#18181b', lineHeight: 1.4 }}>{preset.text}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </label>
            </div>

            <OfficialWebsiteRow website={profile?.website} cx={cx} />

            <footer style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className={cx('uni-secondary')} type="button" onClick={() => setProductInviteDraft(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">Send Invite</button>
            </footer>
          </form>
        </div>
      )}

      {offerDraft && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setOfferDraft(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => { event.preventDefault(); submitOffer(); }}
            onClick={event => event.stopPropagation()}
          >
            <header>
              <div><small>NEW OFFER</small><h2>Create offer</h2><p>Prepare a clear {cfg.offerNoun}.</p></div>
              <button type="button" onClick={() => setOfferDraft(null)}>×</button>
            </header>
            <div className={cx('composer-grid')}>
              {offerForm.shows('student') && (
                <label>
                  {offerForm.labelOf('student', 'Student')}
                  <select name="offerStudent" required value={offerDraft.student} onChange={event => setOfferDraft({ ...offerDraft, student: event.target.value })}>
                    <option value="" disabled>Select a student</option>
                    {students.map((student: any) => <option key={student.name} value={student.name}>{student.name}</option>)}
                  </select>
                </label>
              )}

              {role === 'UNIVERSITY' && (
                <>
                  {offerForm.shows('course') && (
                    <label>
                      {offerForm.labelOf('course', 'Product')}
                      <select name="offerCourse" required value={offerDraft.course} onChange={event => onOfferCourseChange(event.target.value)}>
                        <option value="" disabled>Select a product</option>
                        {products.map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                      </select>
                    </label>
                  )}
                  {offerForm.shows('scholarship') && (
                    <label>{offerForm.labelOf('scholarship', 'Scholarship')}<input
                      name="offerScholarship"
                      required={offerForm.isRequired('scholarship', false)}
                      value={offerDraft.scholarship}
                      placeholder={offerForm.placeholderOf('scholarship', 'e.g. 40% tuition scholarship')}
                      onChange={event => setOfferDraft({ ...offerDraft, scholarship: event.target.value })}
                    /></label>
                  )}
                  {offerForm.shows('tuition') && (
                    <label>{offerForm.labelOf('tuition', 'Tuition fee')}<input
                      name="offerTuition"
                      required={offerForm.isRequired('tuition', true)}
                      value={offerDraft.tuition}
                      placeholder={offerForm.placeholderOf('tuition', 'e.g. CAD 42,000 / year')}
                      onChange={event => setOfferDraft({ ...offerDraft, tuition: event.target.value })}
                    /></label>
                  )}
                  {offerForm.shows('accommodation') && (
                    <label>{offerForm.labelOf('accommodation', 'Accommodation')}<input
                      name="offerAccommodation"
                      required={offerForm.isRequired('accommodation', false)}
                      value={offerDraft.accommodation}
                      placeholder={offerForm.placeholderOf('accommodation', 'e.g. Campus residence available')}
                      onChange={event => setOfferDraft({ ...offerDraft, accommodation: event.target.value })}
                    /></label>
                  )}
                </>
              )}

              {role === 'BANK' && (
                <>
                  {offerForm.shows('course') && (
                    <label>{offerForm.labelOf('course', 'Course being financed')}<input
                      name="offerCourse"
                      required
                      value={offerDraft.course}
                      placeholder={offerForm.placeholderOf('course', 'e.g. MSc Data Science')}
                      onChange={event => setOfferDraft({ ...offerDraft, course: event.target.value })}
                    /></label>
                  )}
                  {offerForm.shows('productName') && (
                    <label>
                      {offerForm.labelOf('productName', 'Loan product')}
                      <select name="offerProduct" value={offerDraft.productName} onChange={event => onOfferProductChange(event.target.value)}>
                        <option value="">Custom terms</option>
                        {loanProducts.map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                      </select>
                    </label>
                  )}
                  {bankEvaluationMode === 'ACADEMIC_AND_OFFER' && offerForm.shows('offerType') && (
                    <label className={cx('wide')}>
                      {offerForm.labelOf('offerType', 'Offer type')}
                      <select name="offerType" value={offerDraft.offerType} onChange={event => setOfferDraft({ ...offerDraft, offerType: event.target.value })}>
                        <option value="PreApproved">Pre-approved loan (academic profile only)</option>
                        <option value="Final">Final loan offer (university offer confirmed)</option>
                      </select>
                    </label>
                  )}
                  {offerForm.shows('loanAmount') && (
                    <label>
                      {/* A pre-approval quotes what the student is eligible for, not a sum lent. */}
                      {offerForm.labelOf('loanAmount', offerDraft.offerType === 'Final' ? 'Loan amount' : 'Eligible loan amount')}
                      <input
                        name="offerLoanAmount"
                        required
                        value={offerDraft.loanAmount}
                        placeholder={offerForm.placeholderOf('loanAmount', 'e.g. ₹38,00,000')}
                        onChange={event => setOfferDraft({ ...offerDraft, loanAmount: event.target.value })}
                      />
                    </label>
                  )}
                  {offerForm.shows('interestRate') && (
                    <label>
                      {offerForm.labelOf('interestRate', offerDraft.offerType === 'Final' ? 'Interest rate' : 'Estimated interest rate')}
                      <input
                        name="offerInterestRate"
                        required
                        value={offerDraft.interestRate}
                        placeholder={offerForm.placeholderOf('interestRate', 'e.g. 9.4% p.a.')}
                        onChange={event => setOfferDraft({ ...offerDraft, interestRate: event.target.value })}
                      />
                    </label>
                  )}
                  {offerDraft.offerType === 'Final' && (
                    <>
                      {offerForm.shows('emi') && (
                        <label>{offerForm.labelOf('emi', 'EMI')}<input
                          name="offerEmi"
                          value={offerDraft.emi}
                          placeholder={offerForm.placeholderOf('emi', 'e.g. ₹44,200 / month')}
                          onChange={event => setOfferDraft({ ...offerDraft, emi: event.target.value })}
                        /></label>
                      )}
                      {offerForm.shows('processingFee') && (
                        <label>{offerForm.labelOf('processingFee', 'Processing fee')}<input
                          name="offerProcessingFee"
                          value={offerDraft.processingFee}
                          placeholder={offerForm.placeholderOf('processingFee', 'e.g. 1% waived')}
                          onChange={event => setOfferDraft({ ...offerDraft, processingFee: event.target.value })}
                        /></label>
                      )}
                      {offerForm.shows('tenure') && (
                        <label>{offerForm.labelOf('tenure', 'Repayment tenure')}<input
                          name="offerTenure"
                          required
                          value={offerDraft.tenure}
                          placeholder={offerForm.placeholderOf('tenure', 'e.g. 10 years')}
                          onChange={event => setOfferDraft({ ...offerDraft, tenure: event.target.value })}
                        /></label>
                      )}
                    </>
                  )}
                  {offerForm.shows('conditions') && (
                    <label>{offerForm.labelOf('conditions', 'Conditions')}<input
                      name="offerConditions"
                      value={offerDraft.conditions}
                      placeholder={offerForm.placeholderOf('conditions', 'e.g. Subject to guarantor verification')}
                      onChange={event => setOfferDraft({ ...offerDraft, conditions: event.target.value })}
                    /></label>
                  )}
                </>
              )}

              {offerForm.shows('deadline') && (
                <label>{offerForm.labelOf('deadline', 'Response deadline')}<input
                  name="offerDeadline"
                  type="date"
                  required
                  value={offerDraft.deadline}
                  onChange={event => setOfferDraft({ ...offerDraft, deadline: event.target.value })}
                /></label>
              )}

              {/* Whatever the admin added beyond the fields drawn above. */}
              {!!offerForm.added.length && (
                <SchemaFields
                  fields={offerForm.added}
                  values={offerExtras}
                  errors={{}}
                  touched={{}}
                  cx={cx}
                  onChange={(key, value) => setOfferExtras(current => ({ ...current, [key]: value }))}
                  onBlur={() => undefined}
                />
              )}
            </div>
            {extrasError && <p className={cx('composer-error')} role="alert">{extrasError}</p>}
            <footer>
              <button className={cx('uni-secondary')} type="button" onClick={() => setOfferDraft(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">Send {cfg.offerVerb}</button>
            </footer>
          </form>
        </div>
      )}

      {/*
        * A template is written once and sent many times, so it is worth being
        * explicit about what it will say — this is the only place an offer's
        * terms are composed.
        */}
      {templateDraft && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setTemplateDraft(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => {
              event.preventDefault();
              const statedPct = role === 'UNIVERSITY' ? percentIn(templateDraft.value) : undefined;
              saveTemplate(
                templateDraft.productId,
                {
                  name: templateDraft.name,
                  description: templateDraft.description || undefined,
                  terms: {
                    ...Object.fromEntries(
                      Object.entries(templateDraft.terms).filter(([, value]) => String(value).trim())
                    ),
                    /** Kept in step with the benefit line, never asked for twice. */
                    ...(statedPct === undefined ? {} : { scholarshipPct: String(statedPct) })
                  },
                  value: templateDraft.value || undefined,
                  conditions: templateDraft.conditions || undefined,
                  nextSteps: templateDraft.nextSteps.split('\n').map(step => step.trim()).filter(Boolean),
                  responseWindowDays: Number(templateDraft.responseWindowDays) || undefined,
                  isDefault: templateDraft.isDefault
                },
                templateDraft.id
              );
            }}
            onClick={event => event.stopPropagation()}
          >
            <header>
              <div>
                <small>{templateDraft.id ? 'EDIT TEMPLATE' : 'NEW TEMPLATE'}</small>
                <h2>{templateDraft.productName}</h2>
                <p>
                  The terms this {role === 'BANK' ? 'product' : 'course'} is prepared to offer. Written once, sent to as many
                  students as you like — {role === 'BANK' ? 'the product' : 'the course'}&apos;s own details travel with every offer.
                </p>
              </div>
              <button type="button" onClick={() => setTemplateDraft(null)}>×</button>
            </header>

            <div className={cx('composer-grid')}>
              <label>
                Template name
                <input
                  name="templateName"
                  required
                  value={templateDraft.name}
                  placeholder="e.g. 40% Global Excellence Scholarship"
                  onChange={event => setTemplateDraft({ ...templateDraft, name: event.target.value })}
                />
              </label>
              <label>
                {role === 'BANK' ? 'Headline figure' : 'Scholarship / financial benefit'}
                {/*
                  * One field where there were two. "Headline figure" and
                  * "Scholarship (% of tuition)" were the same promise written
                  * twice, and an officer who filled in only one left the other
                  * blank on the student's offer. The suggestions are a starting
                  * point, not a closed list: a benefit can be a percentage, a
                  * flat sum, a waiver, or nothing at all.
                  */}
                <input
                  name="templateValue"
                  required
                  list={role === 'BANK' ? undefined : 'templateBenefitOptions'}
                  value={templateDraft.value}
                  placeholder={role === 'BANK' ? 'e.g. ₹38,00,000 at 9.4%' : 'e.g. 40% tuition scholarship'}
                  onChange={event => setTemplateDraft({ ...templateDraft, value: event.target.value })}
                />
                {role !== 'BANK' && (
                  <datalist id="templateBenefitOptions">
                    {BENEFIT_SUGGESTIONS.map(option => <option key={option} value={option} />)}
                  </datalist>
                )}
              </label>

              {(TEMPLATE_FIGURES[role] || TEMPLATE_FIGURES.UNIVERSITY).map(figure => (
                <label key={figure.key}>
                  {figure.label}
                  <input
                    name={figure.key}
                    value={templateDraft.terms[figure.key] || ''}
                    placeholder={figure.placeholder}
                    onChange={event => setTemplateDraft({
                      ...templateDraft,
                      terms: { ...templateDraft.terms, [figure.key]: event.target.value }
                    })}
                  />
                </label>
              ))}

              <label>
                Respond within (days)
                <input
                  name="responseWindowDays"
                  type="number"
                  min="1"
                  required
                  value={templateDraft.responseWindowDays}
                  onChange={event => setTemplateDraft({ ...templateDraft, responseWindowDays: event.target.value })}
                />
              </label>

              <label className={cx('wide')}>
                Offer conditions
                <input
                  name="templateConditions"
                  required
                  value={templateDraft.conditions}
                  placeholder="e.g. Subject to final transcript verification"
                  onChange={event => setTemplateDraft({ ...templateDraft, conditions: event.target.value })}
                />
              </label>

              <label className={cx('wide')}>
                Next steps, one per line
                <textarea
                  name="templateNextSteps"
                  rows={3}
                  required
                  value={templateDraft.nextSteps}
                  placeholder={'Review the terms\nUpload your transcript'}
                  onChange={event => setTemplateDraft({ ...templateDraft, nextSteps: event.target.value })}
                />
              </label>

              <label className={cx('wide', 'template-default-toggle')}>
                <input
                  type="checkbox"
                  checked={templateDraft.isDefault}
                  onChange={event => setTemplateDraft({ ...templateDraft, isDefault: event.target.checked })}
                />
                <span>Send this one on a single click</span>
              </label>
            </div>

            <footer>
              <button className={cx('uni-secondary')} type="button" onClick={() => setTemplateDraft(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">
                {templateDraft.id ? 'Save template' : 'Add template'}
              </button>
            </footer>
          </form>
        </div>
      )}

      {/*
        * One click, but never blind: the officer sees exactly which offer will
        * go out before it does, because the template — not this modal — decides
        * the terms.
        */}
      {quickInvite && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setQuickInvite(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => { event.preventDefault(); sendQuickInvite(); }}
            onClick={event => event.stopPropagation()}
          >
            <header>
              <div>
                <small>QUICK INVITE</small>
                <h2>Invite {quickInvite.candidate.name}</h2>
                <p>Pick a product. The offer goes out on the terms you set for it.</p>
              </div>
              <button type="button" onClick={() => setQuickInvite(null)}>×</button>
            </header>

            <div className={cx('composer-grid')} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label>
                Product
                <select
                  name="quickInviteProduct"
                  required
                  value={quickInvite.productId}
                  onChange={event => setQuickInvite({ ...quickInvite, productId: event.target.value })}
                >
                  <option value="" disabled>Select a product…</option>
                  {(role === 'BANK' ? loanProducts : products).map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </label>

              {/* What will actually be sent, before it is. */}
              {(() => {
                if (!quickInvite.productId) return null;
                const template = offerTemplates.find(
                  (t: { productId: string; isDefault: boolean }) => t.productId === quickInvite.productId && t.isDefault
                );

                if (!template) {
                  return (
                    <p className={cx('quick-invite-warning')}>
                      This product has no offer template yet. Add one on the Products page before inviting with a
                      single click.
                    </p>
                  );
                }

                return (
                  <div className={cx('quick-invite-preview')}>
                    <small>THIS IS WHAT THEY WILL RECEIVE</small>
                    <strong>{template.name}</strong>
                    {template.value && <b>{template.value}</b>}
                    {template.conditions && <em>{template.conditions}</em>}
                    {!!template.nextSteps?.length && (
                      <ul>{template.nextSteps.map((step: string) => <li key={step}>{step}</li>)}</ul>
                    )}
                    <OfficialWebsiteRow website={profile?.website} cx={cx} />
                  </div>
                );
              })()}
            </div>

            <footer>
              <button className={cx('uni-secondary')} type="button" onClick={() => setQuickInvite(null)}>Cancel</button>
              <button
                className={cx('uni-primary')}
                type="submit"
                disabled={
                  !quickInvite.productId ||
                  !offerTemplates.some(
                    (t: { productId: string; isDefault: boolean }) => t.productId === quickInvite.productId && t.isDefault
                  )
                }
              >
                Send invitation
              </button>
            </footer>
          </form>
        </div>
      )}

      {catalogDraft && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setCatalogDraft(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => { event.preventDefault(); submitCatalogItem(); }}
            onClick={event => event.stopPropagation()}
            style={{ maxWidth: 500, padding: 32 }}
          >
            <header style={{ marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid #ececea', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <small style={{ color: '#047857', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>
                  {catalogDraft.id ? 'EDIT' : 'NEW'} {role === 'BANK' ? 'LOAN PRODUCT' : 'PRODUCT'}
                </small>
                <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {catalogDraft.id ? 'Edit Details' : 'Add Details'}
                </h2>
              </div>
              <button type="button" onClick={() => setCatalogDraft(null)} style={{ fontSize: 22, cursor: 'pointer', border: 'none', background: 'transparent', color: '#a1a1aa' }}>×</button>
            </header>

            <div className={cx('composer-grid')} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/*
                * Category is no longer asked, or even shown. A university issues
                * places and a bank issues money, so the value was never a choice —
                * it followed the organisation type, and a read-only input
                * restating that was one more row to read past. `saveCatalogItem`
                * and the CSV importer both still default it from the role, so the
                * server receives exactly what it did before.
                *
                * It stays in CODED_PRODUCT_FIELDS on purpose: that list is what
                * marks a key as drawn by hand, and dropping it from there would
                * make a published `category` field reappear further down as a
                * generic admin addition.
                */}
              {productForm.shows('name') && (
                <label>
                  {productForm.labelOf('name', role === 'BANK' ? 'Product name' : 'Course name')}
                  <input
                    name="pName" required value={catalogDraft.name}
                    placeholder={productForm.placeholderOf('name', role === 'BANK' ? 'e.g. Unsecured Study Loan' : 'e.g. MSc Data Science')}
                    onChange={event => setCatalogDraft({ ...catalogDraft, name: event.target.value })}
                  />
                </label>
              )}
              {/* A university's course link sits with the rest of the optional
                  fields, at the foot of the block below. */}
              {role !== 'UNIVERSITY' && productForm.shows('url') && (
                <label>
                  {productForm.labelOf('url', 'Product web link (URL)')}
                  <input
                    type="url"
                    name="pUrl"
                    required={productForm.isRequired('url')}
                    value={catalogDraft.url}
                    placeholder={productForm.placeholderOf('url', 'https://')}
                    onChange={event => setCatalogDraft({ ...catalogDraft, url: event.target.value })}
                  />
                </label>
              )}

              {/*
                * The academic shape of a course: what a student compares one
                * university against another on. Universities only — a lender's
                * product has no degree level and no intake.
                *
                * Six fields, all required, and with the course name above them
                * that is the whole form. A course missing any of them cannot be
                * compared against another course, and anything a course can be
                * listed without is not worth asking a registrar for.
                *
                * Study mode, scholarship information, field of study and the
                * course link were all dropped for the MVP. None of them is
                * matched or filtered on, and each was one more row between a
                * university and a published course. The columns survive in the
                * database and the payload simply omits those keys, so a course
                * that already carries one keeps it through an edit rather than
                * being blanked by a draft that no longer collects it.
                */}
              {role === 'UNIVERSITY' && (
                <>
                  <label>
                    Degree level
                    <select
                      required
                      value={catalogDraft.degreeLevel || ''}
                      onChange={event => setCatalogDraft({ ...catalogDraft, degreeLevel: event.target.value })}
                      style={SELECT_CHEVRON}
                    >
                      <option value="" disabled>Select a level</option>
                      {["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Duration (months)
                    <input
                      type="number" min={1} max={120} required
                      value={catalogDraft.durationMonths ?? ''}
                      placeholder="e.g. 18"
                      onChange={event => setCatalogDraft({ ...catalogDraft, durationMonths: event.target.value })}
                    />
                  </label>
                  <label>
                    Campus / location
                    <input
                      required
                      value={catalogDraft.campusLocation || ''}
                      placeholder="e.g. Toronto, Canada"
                      onChange={event => setCatalogDraft({ ...catalogDraft, campusLocation: event.target.value })}
                    />
                  </label>
                  <label>
                    Available intakes
                    <input
                      required
                      value={catalogDraft.intakesText ?? (catalogDraft.intakes || []).join(', ')}
                      placeholder="Fall, Winter"
                      onChange={event => setCatalogDraft({ ...catalogDraft, intakesText: event.target.value })}
                    />
                  </label>
                  <label>
                    Tuition fee
                    <input
                      type="number" min={0} step="0.01" required
                      value={catalogDraft.tuitionFee ?? ''}
                      placeholder="e.g. 24500"
                      onChange={event => setCatalogDraft({ ...catalogDraft, tuitionFee: event.target.value })}
                    />
                  </label>
                  <label>
                    Currency
                    <input
                      required
                      value={catalogDraft.currency || ''}
                      placeholder="e.g. CAD"
                      maxLength={3}
                      onChange={event => setCatalogDraft({ ...catalogDraft, currency: event.target.value.toUpperCase() })}
                    />
                  </label>
                  {catalogDraft.id && (
                    <div className={cx('product-wide')}>
                      <MediaUploadField
                        label="Programme image"
                        hint="Optional. Shown on the programme wherever a student compares it against another."
                        url={catalogDraft.imageUrl}
                        alt="Programme"
                        shape="wide"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onSelect={file => uploadProgramImage(catalogDraft.id, file)}
                      />
                    </div>
                  )}
                </>
              )}

              {/* Whatever the admin added beyond the three fields above. */}
              {!!productForm.added.length && (
                <SchemaFields
                  fields={productForm.added}
                  values={productExtras}
                  errors={{}}
                  touched={{}}
                  cx={cx}
                  onChange={(key, value) => setProductExtras(current => ({ ...current, [key]: value }))}
                  onBlur={() => undefined}
                />
              )}
            </div>

            <footer style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid #ececea', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button className={cx('uni-secondary')} type="button" onClick={() => setCatalogDraft(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">Save</button>
            </footer>
          </form>
        </div>
      )}

      {negotiationOffer && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setNegotiationOffer(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => { event.preventDefault(); sendNegotiationReply(); }}
            onClick={event => event.stopPropagation()}
          >
            <header>
              <div>
                <small>NEGOTIATION</small>
                <h2>{negotiationOffer.student}</h2>
                <p>{offerPrimary(negotiationOffer)} · {offerSecondary(negotiationOffer)}</p>
              </div>
              <button type="button" onClick={() => setNegotiationOffer(null)}>×</button>
            </header>
            <div className={cx('composer-warning')}>
              <span>!</span>
              <p>
                The student&apos;s counter-request is one-time; you may reply with revised terms or hold firm, any number of
                times — only the student can accept or reject.
              </p>
            </div>
            {(negotiationOffer.negotiationMessages || []).map((message, index) => (
              <div key={index} style={{ margin: '10px 0', padding: '10px 12px', borderRadius: 9, background: '#f7f7f6' }}>
                <strong style={{ fontSize: 12 }}>{message.author}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#52525b' }}>{message.body}</p>
              </div>
            ))}
            <label className={cx('wide')}>
              Your response
              <textarea
                required name="negotiationReply" value={negotiationReply}
                placeholder="e.g. We can offer 35% scholarship with fast-track admission, final."
                onChange={event => setNegotiationReply(event.target.value)}
              />
            </label>
            <footer>
              <button className={cx('uni-secondary')} type="button" onClick={() => setNegotiationOffer(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">Send response</button>
            </footer>
          </form>
        </div>
      )}

      {inviteDraft && (
        <div className={cx('university-panel-backdrop', 'product-modal-backdrop')} onClick={() => setInviteDraft(null)}>
          <form
            className={cx('university-offer-composer')}
            onSubmit={event => { event.preventDefault(); sendInvite(); }}
            onClick={event => event.stopPropagation()}
          >
            <header>
              <div>
                <small>NEW INVITE</small>
                <h2>Invite an officer</h2>
                <p>They&apos;ll get email access to {orgName}&apos;s workspace once they accept.</p>
              </div>
              <button type="button" onClick={() => setInviteDraft(null)}>×</button>
            </header>
            <div className={cx('composer-grid')}>
              <label>Full name<input name="inviteName" required value={inviteDraft.name} placeholder="e.g. Meera Nair" onChange={event => setInviteDraft({ ...inviteDraft, name: event.target.value })} /></label>
              <label>Work email<input name="inviteEmail" type="email" required value={inviteDraft.email} placeholder={`e.g. meera.nair@${orgDomain}`} onChange={event => setInviteDraft({ ...inviteDraft, email: event.target.value })} /></label>
              <label className={cx('wide')}>Title<input name="inviteRole" value={inviteDraft.role} placeholder={cfg.userTitle} onChange={event => setInviteDraft({ ...inviteDraft, role: event.target.value })} /></label>
            </div>
            <footer>
              <button className={cx('uni-secondary')} type="button" onClick={() => setInviteDraft(null)}>Cancel</button>
              <button className={cx('uni-primary')} type="submit">Send invite</button>
            </footer>
          </form>
        </div>
      )}
    </>
  );
}
