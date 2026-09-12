/**
 * What the guide says at each step of the loan journey.
 *
 * The same shape as `wizard-copy.ts`, and for the same reason: a step is a
 * conversation, not a row in a form. One question, a line of encouragement
 * under it, and a "did you know" that explains why a lender is asking.
 *
 * Keyed by step id. The finance keys match the field keys the `coApplicant`
 * section publishes, so an admin relabelling a field does not strand its copy.
 */
export interface LoanStepCopy {
  question: string;
  lede: string;
  tip: string;
}

export const LOAN_COPY: Record<string, LoanStepCopy> = {
  relationship: {
    question: 'Who is standing behind this loan with you?',
    lede: 'Most education loans in India are taken with a parent or guardian as co-applicant.',
    tip: 'Did you know? A co-applicant with steady income is the single biggest factor in a loan being approved.'
  },
  employmentType: {
    question: 'How do they earn a living?',
    lede: 'Salaried, self-employed, farming, pensioned — every one of these is lendable.',
    tip: 'Did you know? Self-employed co-applicants are not penalised; lenders simply read two years of returns instead of payslips.'
  },
  monthlyIncome: {
    question: 'Roughly what do they take home each month?',
    lede: 'An honest approximation is fine — a lender verifies it from documents later.',
    tip: 'Did you know? Lenders look at income after existing EMIs, not before, so a smaller income with no debts often goes further.'
  },
  hasExistingLoan: {
    question: 'Are they already repaying a loan?',
    lede: 'A home loan, a vehicle loan, anything with a monthly instalment.',
    tip: 'Did you know? An existing loan repaid on time helps you — it is a track record, not a black mark.'
  },
  existingEmi: {
    question: 'What do those instalments add up to each month?',
    lede: 'Add together every EMI they are currently paying.',
    tip: 'Did you know? Lenders generally want all EMIs together to stay under about half of monthly income.'
  },
  familyContribution: {
    question: 'How much can your family put in themselves?',
    lede: 'Savings, a deposit, help from relatives — whatever will not be borrowed.',
    tip: 'Did you know? Even a 10% contribution noticeably improves the terms a lender will offer.'
  },
  loanAmountRequested: {
    question: 'And how much do you need to borrow?',
    lede: 'Tuition plus living costs, less whatever your family is contributing.',
    tip: 'Did you know? Asking for what you actually need reads better than rounding up — lenders check it against your course costs.'
  },
  declarations: {
    question: 'Last thing — is all of this accurate?',
    lede: 'A lender reads these figures as a statement from you, so we ask you to confirm them.',
    tip: 'Did you know? Nothing here is shared with a lender until you accept an offer from one.'
  },
  result: {
    question: 'Here is what a lender would make of this.',
    lede: 'An indication, not a decision — and you can add a credit check to sharpen it.',
    tip: 'Did you know? Checking a CIBIL score through SuperOffer is a soft enquiry and does not affect it.'
  }
};

/** The sky behind the journey — the same green-to-violet as the Loan & Funding page. */
export const LOAN_SKY: [string, string, string] = ['#e2fbef', '#e4efff', '#f3e8ff'];
