'use client';

import { useSectionFields, type SectionFields } from './use-section-fields';

export type OrgForm = SectionFields;

/**
 * One section of an organisation form, as published.
 *
 * The workspace modals keep their hand-built layout — a product picker that
 * fills the terms, a conditional block for final loan offers — and consult this
 * for what the admin changed. It is the same lookup the student steps use; only
 * the document differs, keyed by organisation type.
 */
export function useOrgForm(formKey: string, orgType: string, sectionKey: string, codedKeys: string[]): OrgForm {
  /** An unknown organisation type reads the university form, as the server does. */
  const variant = orgType === 'BANK' || orgType === 'CONSULTANCY' ? orgType : 'UNIVERSITY';
  return useSectionFields(sectionKey, codedKeys, formKey, variant);
}

/**
 * The keys each modal draws by hand.
 *
 * They differ by organisation type, because the two invitation forms are not the
 * same form: a university block has a tuition input and no conditions, a lender
 * block has a rate and a conditional final-offer section. Anything published
 * beyond these is an admin addition and gets rendered generically after them.
 */
export const CODED_OFFER_FIELDS: Record<string, string[]> = {
  UNIVERSITY: ['student', 'course', 'scholarship', 'tuition', 'accommodation', 'deadline'],
  BANK: [
    'student', 'course', 'productName', 'offerType', 'loanAmount',
    'interestRate', 'emi', 'processingFee', 'tenure', 'conditions', 'deadline'
  ],
  CONSULTANCY: ['student', 'course', 'productName', 'scholarship', 'conditions', 'deadline']
};

export const CODED_PRODUCT_FIELDS = ['category', 'name', 'url'];
export const CODED_INVITE_FIELDS = ['productNames', 'conditions'];
