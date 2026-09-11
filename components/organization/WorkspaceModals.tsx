'use client';

import { useEffect, useRef, useState } from 'react';
import { SchemaFields } from '@/components/student/SchemaFields';
import { classNames } from '@/lib/cx';
import {
  CODED_INVITE_FIELDS,
  CODED_OFFER_FIELDS,
  CODED_PRODUCT_FIELDS,
  useOrgForm
} from '@/lib/forms/use-org-form';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

const fieldLabel = { display: 'flex', flexDirection: 'column' as const, gap: 6, fontSize: 13.5, fontWeight: 800, color: '#3f4d46' };

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
 */
const TEMPLATE_FIGURES: Record<string, Array<{ key: string; label: string; placeholder: string }>> = {
  UNIVERSITY: [
    { key: 'scholarshipPct', label: 'Scholarship (% of tuition)', placeholder: '40' },
    { key: 'tuitionFee', label: 'Tuition fee', placeholder: 'CAD 42,000 / year' },
    { key: 'durationYears', label: 'Duration in years', placeholder: '2' }
  ],
  BANK: [
    { key: 'loanAmount', label: 'Loan amount', placeholder: '₹38,00,000' },
    { key: 'interestRate', label: 'Interest rate', placeholder: '9.4% p.a.' },
    { key: 'tenure', label: 'Repayment tenure', placeholder: '10 years' }
  ]
};

export function WorkspaceModals({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, orgName, orgDomain, students, products, loanProducts, bankEvaluationMode,
    productInviteDraft, setProductInviteDraft, addProductToInvite, removeProductFromInvite, availableProductsForInvite,
    activePresetCategories, getPresetsByCategory, selectPreset, sendProductInvite,
    offerDraft, setOfferDraft, onOfferCourseChange, onOfferProductChange, saveOffer,
    catalogDraft, setCatalogDraft, saveCatalogItem, uploadProgramImage,
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
                <p style={{ margin: 0, color: '#526059', fontSize: 13 }}>Select a product to invite this candidate.</p>
              </div>
              <button
                type="button"
                onClick={() => setProductInviteDraft(null)}
                style={{ background: 'transparent', border: 'none', padding: 0, fontSize: 28, lineHeight: 1, color: '#697a70', cursor: 'pointer' }}
              >
                ×
              </button>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
              <label style={fieldLabel}>
                Product
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 12px', border: '1px solid #d7d4cc', borderRadius: 9, background: '#fbfcfb', minHeight: 42, alignItems: 'center' }}>
                  {productInviteDraft.productNames.map((name: string) => (
                    <span key={name} style={{ background: '#edf6f1', color: '#087a50', padding: '4px 10px', borderRadius: 16, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {name}
                      <button
                        type="button"
                        onClick={() => removeProductFromInvite(name)}
                        style={{ background: 'transparent', border: 'none', color: '#087a50', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <select
                    value=""
                    onChange={event => addProductToInvite(event.target.value)}
                    style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#172019', minWidth: 140 }}
                  >
                    <option value="" disabled>Select a product...</option>
                    {availableProductsForInvite().map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                  </select>
                </div>
              </label>

              <label style={fieldLabel}>
                {inviteForm.labelOf('conditions', 'Notes')}
                <textarea
                  ref={notesRef}
                  name="conditions"
                  value={productInviteDraft.conditions}
                  onChange={event => setProductInviteDraft({ ...productInviteDraft, conditions: event.target.value })}
                  placeholder={inviteForm.placeholderOf('conditions', 'e.g. Additional requirements...')}
                  style={{ width: '100%', minHeight: 120, padding: '10px 12px', border: '1px solid #d7d4cc', borderRadius: 9, background: '#fbfcfb', fontSize: 14, color: '#172019', resize: 'none', overflow: 'hidden', lineHeight: 1.5 }}
                />
              </label>

              <label style={fieldLabel}>
                Quick Conditions
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                  {activePresetCategories.map(category => (
                    <div key={category} style={{ background: '#fff', border: '1px solid #e1e3e1', borderRadius: 8, overflow: 'hidden' }}>
                      <div
                        style={{ padding: '10px 12px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fbfcfb' }}
                        onClick={() =>
                          setProductInviteDraft({
                            ...productInviteDraft,
                            expandedCategory: productInviteDraft.expandedCategory === category ? null : category
                          })
                        }
                      >
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#172019' }}>{category}</div>
                        <div style={{ fontSize: 16, color: '#697a70', fontWeight: 400, lineHeight: 1 }}>
                          {productInviteDraft.expandedCategory === category ? '−' : '+'}
                        </div>
                      </div>
                      {productInviteDraft.expandedCategory === category && (
                        <div style={{ padding: 8, borderTop: '1px solid #e1e3e1', display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {getPresetsByCategory(category).map(preset => {
                            const selected = productInviteDraft.selectedPresetByCategory[category] === preset.id;
                            return (
                              <div
                                key={preset.id}
                                style={{
                                  background: selected ? '#edf6f1' : 'transparent',
                                  border: selected ? '1px solid #087a50' : '1px solid transparent',
                                  borderRadius: 6, padding: 10, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onClick={() => selectPreset(category, preset.id, preset.text)}
                              >
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                  <div
                                    style={{
                                      border: selected ? '5px solid #087a50' : '2px solid #c2c9c5',
                                      width: 18, height: 18, borderRadius: '50%', background: '#fff', marginTop: 1,
                                      flexShrink: 0, transition: 'all 0.15s ease-in-out', boxSizing: 'border-box'
                                    }}
                                  ></div>
                                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#172019', lineHeight: 1.4 }}>{preset.text}</div>
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
              saveTemplate(
                templateDraft.productId,
                {
                  name: templateDraft.name,
                  description: templateDraft.description || undefined,
                  terms: Object.fromEntries(
                    Object.entries(templateDraft.terms).filter(([, value]) => String(value).trim())
                  ),
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
                <p>An offer this product is prepared to make. Written once, sent with a single click.</p>
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
                Headline figure
                <input
                  name="templateValue"
                  value={templateDraft.value}
                  placeholder="e.g. 40% tuition"
                  onChange={event => setTemplateDraft({ ...templateDraft, value: event.target.value })}
                />
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
                  value={templateDraft.responseWindowDays}
                  onChange={event => setTemplateDraft({ ...templateDraft, responseWindowDays: event.target.value })}
                />
              </label>

              <label className={cx('wide')}>
                Conditions
                <input
                  name="templateConditions"
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
            <header style={{ marginBottom: 8, paddingBottom: 12, borderBottom: '1px solid #e7efe9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <small style={{ color: '#087a50', fontWeight: 800, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>
                  {catalogDraft.id ? 'EDIT' : 'NEW'} {role === 'BANK' ? 'LOAN PRODUCT' : 'PRODUCT'}
                </small>
                <h2 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em' }}>
                  {catalogDraft.id ? 'Edit Details' : 'Add Details'}
                </h2>
              </div>
              <button type="button" onClick={() => setCatalogDraft(null)} style={{ fontSize: 22, cursor: 'pointer', border: 'none', background: 'transparent', color: '#88968f' }}>×</button>
            </header>

            <div className={cx('composer-grid')} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productForm.shows('category') && (
                <label>
                  {productForm.labelOf('category', 'Product Category')}
                  {/*
                    * Shown, not asked. A university issues places and a bank issues
                    * money; offering both as a choice let a university create a
                    * financial product it could never actually put in front of a
                    * student. The value follows the organisation type.
                    */}
                  <input
                    name="pCategory"
                    readOnly
                    value={catalogDraft.category || (role === 'BANK' ? 'Financial Product' : 'Academic Product')}
                    aria-readonly="true"
                  />
                </label>
              )}
              {productForm.shows('name') && (
                <label>
                  {productForm.labelOf('name', 'Product name')}
                  <input
                    name="pName" required value={catalogDraft.name}
                    placeholder={productForm.placeholderOf('name', role === 'BANK' ? 'e.g. Unsecured Study Loan' : 'e.g. MSc Data Science')}
                    onChange={event => setCatalogDraft({ ...catalogDraft, name: event.target.value })}
                  />
                </label>
              )}
              {productForm.shows('url') && (
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
                * The academic shape of a programme: what a student compares one
                * university against another on. Universities only — a lender's
                * product has no degree level and no intake.
                */}
              {role === 'UNIVERSITY' && (
                <>
                  <label>
                    Degree level
                    <select
                      value={catalogDraft.degreeLevel || ''}
                      onChange={event => setCatalogDraft({ ...catalogDraft, degreeLevel: event.target.value })}
                      style={SELECT_CHEVRON}
                    >
                      <option value="">Not stated</option>
                      {["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate'].map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Field of study
                    <input
                      value={catalogDraft.fieldOfStudy || ''}
                      placeholder="e.g. Data Science"
                      onChange={event => setCatalogDraft({ ...catalogDraft, fieldOfStudy: event.target.value })}
                    />
                  </label>
                  <label>
                    Duration (months)
                    <input
                      type="number" min={1} max={120}
                      value={catalogDraft.durationMonths ?? ''}
                      placeholder="e.g. 18"
                      onChange={event => setCatalogDraft({ ...catalogDraft, durationMonths: event.target.value })}
                    />
                  </label>
                  <label>
                    Study mode
                    <select
                      value={catalogDraft.studyMode || ''}
                      onChange={event => setCatalogDraft({ ...catalogDraft, studyMode: event.target.value })}
                      style={SELECT_CHEVRON}
                    >
                      <option value="">Not stated</option>
                      {['On campus', 'Online', 'Hybrid'].map(mode => <option key={mode} value={mode}>{mode}</option>)}
                    </select>
                  </label>
                  <label>
                    Campus / location
                    <input
                      value={catalogDraft.campusLocation || ''}
                      placeholder="e.g. Toronto, Canada"
                      onChange={event => setCatalogDraft({ ...catalogDraft, campusLocation: event.target.value })}
                    />
                  </label>
                  <label>
                    Available intakes
                    <input
                      value={catalogDraft.intakesText ?? (catalogDraft.intakes || []).join(', ')}
                      placeholder="Fall, Winter"
                      onChange={event => setCatalogDraft({ ...catalogDraft, intakesText: event.target.value })}
                    />
                  </label>
                  <label>
                    Tuition fee
                    <input
                      type="number" min={0} step="0.01"
                      value={catalogDraft.tuitionFee ?? ''}
                      placeholder="e.g. 24500"
                      onChange={event => setCatalogDraft({ ...catalogDraft, tuitionFee: event.target.value })}
                    />
                  </label>
                  <label>
                    Currency
                    <input
                      value={catalogDraft.currency || ''}
                      placeholder="e.g. CAD"
                      maxLength={3}
                      onChange={event => setCatalogDraft({ ...catalogDraft, currency: event.target.value.toUpperCase() })}
                    />
                  </label>
                  <label className={cx('product-wide')}>
                    Scholarship information (optional)
                    <input
                      value={catalogDraft.scholarshipInfo || ''}
                      placeholder="e.g. Up to 30% merit scholarship"
                      onChange={event => setCatalogDraft({ ...catalogDraft, scholarshipInfo: event.target.value })}
                    />
                  </label>
                  {catalogDraft.id && (
                    <label className={cx('product-wide')}>
                      Programme image (optional)
                      {catalogDraft.imageUrl && (
                        <img src={catalogDraft.imageUrl} alt="Programme" className={cx('product-image-preview')} />
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={event => {
                          const file = event.target.files?.[0];
                          if (file) void uploadProgramImage(catalogDraft.id, file);
                        }}
                      />
                    </label>
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

            <footer style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid #e7efe9', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
              <div key={index} style={{ margin: '10px 0', padding: '10px 12px', borderRadius: 9, background: '#f6f8f7' }}>
                <strong style={{ fontSize: 12 }}>{message.author}</strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#4a564f' }}>{message.body}</p>
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
