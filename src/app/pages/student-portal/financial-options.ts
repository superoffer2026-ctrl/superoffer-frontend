export const FUNDING_SOURCE_OPTIONS: string[] = [
  'Self-Funded', 'Parent/Guardian', 'Scholarship', 'Sponsor', 'Education Loan', 'Combination of the Above', 'Other'
];

export const EMPLOYMENT_CATEGORY_OPTIONS: string[] = [
  'Salaried', 'Self-Employed', 'Business', 'Agriculture', 'Other'
];

export const EARNING_MEMBER_OPTIONS: string[] = ['Father', 'Mother', 'Guardian'];

export const CURRENCY_OPTIONS: string[] = [
  'INR', 'USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'SGD'
];

export type FinancialDocKey =
  | 'incomeCertificate' | 'salarySlips' | 'payslips' | 'itr' | 'form16'
  | 'bankStatements' | 'businessIncomeProof' | 'agriculturalIncomeCertificate' | 'scholarshipLetter';

export interface FinancialDocumentField { key: FinancialDocKey; label: string; categories?: string[]; }

/** `categories` restricts a document to those employment categories; omit it to show the document for everyone.
 *  Collected on the loan-eligibility page, not during onboarding — see financial-information.component.ts. */
export const FINANCIAL_DOCUMENT_FIELDS: FinancialDocumentField[] = [
  { key: 'incomeCertificate', label: 'Income Certificate' },
  { key: 'salarySlips', label: 'Salary Slips (Last 24 Months)', categories: ['Salaried'] },
  { key: 'payslips', label: 'Payslips (Last 24 Months)', categories: ['Salaried'] },
  { key: 'form16', label: 'Form 16 (Last 2 Financial Years)', categories: ['Salaried'] },
  { key: 'businessIncomeProof', label: 'Business Income Proof (for Self-Employed/Business Owners)', categories: ['Self-Employed', 'Business'] },
  { key: 'agriculturalIncomeCertificate', label: 'Agricultural Income Certificate', categories: ['Agriculture'] },
  { key: 'itr', label: 'Income Tax Return (Last 2 Financial Years)', categories: ['Self-Employed', 'Business', 'Agriculture', 'Other'] },
  { key: 'bankStatements', label: 'Bank Statements (Last 6 Months)' },
  { key: 'scholarshipLetter', label: 'Scholarship or Funding Letter (if applicable)' }
];
