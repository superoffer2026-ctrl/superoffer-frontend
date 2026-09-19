/**
 * Types and presentation copy for the organization workspace.
 *
 * Nothing here is data: the catalog, criteria, shortlist, team, offers and
 * subscription all come from `/organizations/me/*`, and the offer-condition
 * presets, plans and evaluation modes from `/reference/*`. What remains is the
 * per-role wording the Angular component carried, plus the scoring weights the
 * workspace shows alongside each match.
 */
import type { OrganizationType } from '../models/organization';

export type Role = OrganizationType;
export type OrganizationView = 'dashboard' | 'students' | 'shortlists' | 'invitations' | 'catalog' | 'templates' | 'criteria' | 'reports' | 'notifications' | 'subscription' | 'profile' | 'settings';
export type OfferStatus = 'Sent' | 'Viewed' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Withdrawn' | 'Expired';
export type BankEvaluationMode = 'ACADEMIC_ONLY' | 'UNIVERSITY_OFFER_ONLY' | 'ACADEMIC_AND_OFFER';
export type UniversityOfferStatus = 'Offer Sent' | 'Shortlisted' | 'Selected' | 'Admitted';
export type SettingsTab = 'org' | 'subscription' | 'accreditation' | 'team' | 'notifications' | 'security';

/** One answered field: what was asked, and what they said. */
/**
 * The university and programme as they stood when an offer was sent.
 *
 * Frozen on the offer, so editing a programme later cannot rewrite what a
 * student was already promised.
 */
export interface OfferSnapshot {
  capturedAt?: string;
  university?: {
    name?: string; city?: string | null; country?: string | null;
    website?: string | null; logoUrl?: string | null; coverUrl?: string | null;
  };
  program?: {
    name?: string; degreeLevel?: string | null; fieldOfStudy?: string | null;
    durationMonths?: number | null; studyMode?: string | null; campusLocation?: string | null;
    intakes?: string[]; tuitionFee?: string | null; currency?: string | null;
    scholarshipInfo?: string | null; imageUrl?: string | null; url?: string | null;
  };
}

export interface RecordField { label: string; value: string }

/** A repeating entry — a qualification, an exam sitting, a job, a project. */
export interface RecordEntry { fields: RecordField[] }

/**
 * The student profile as answered, not as summarised.
 *
 * The candidate card flattens everything to fit a list; this is what an
 * organisation is actually paying to read. Empty sections arrive empty, so a
 * gap on screen is a gap in the record.
 */
export interface StudentRecord {
  personal: RecordField[];
  preferences: RecordField[];
  education: (RecordEntry & { level: string })[];
  educationGap: string;
  englishExams: (RecordEntry & { exam: string })[];
  competitiveExams: (RecordEntry & { exam: string })[];
  work: { status: string; summary: RecordField[]; roles: (RecordEntry & { role: string; company: string })[] };
  financial: RecordField[];
  projects: (RecordEntry & { title: string })[];
  achievements: string[];
  links: string[];
}

export interface NegotiationMessage { from: 'institution' | 'student' | 'system'; author: string; body: string; time: string; automatic?: boolean; }

export interface Offer {
  id: string; student: string; initials: string; course: string; deadline: string; status: OfferStatus; sent: string; sentAt?: number; responseHours?: number;
  scholarship?: string; tuition?: string; accommodation?: string;
  loanAmount?: string; interestRate?: string; emi?: string; processingFee?: string; tenure?: string; conditions?: string;
  offerType?: 'PreApproved' | 'Final'; productName?: string;
  negotiationMessages?: NegotiationMessage[];
}

export interface UniversityInterest {
  university: string; country: string; course: string; status: UniversityOfferStatus;
  scholarship?: string; tuitionFee?: string; remainingTuition?: string; livingCost?: string; logo?: string;
}

export interface Product {
  id: string; name: string; category?: string; degreeLevel: 'Undergraduate' | 'Postgraduate'; course: string; country: string;
  intakes: string[]; tuitionFee: string; scholarshipRange: string; durationYears: number; seats: number | 'Rolling';
  minCgpa?: number; englishTest?: string; minEnglishScore?: number; preferredCurricula?: string; targetCountries?: string;
  templates?: any[];
  url?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  inviteNote?: string;
  templateName?: string;
}

export interface LoanProduct {
  id: string; name: string; category?: string; interestRateMin: number; interestRateMax: number; currency: string; maxAmount: string;
  tenureOptions: number[]; collateralRequired: boolean; eligibleCountries: string[];
  guarantorRequired?: boolean; maxFamilyIncome?: number;
  templates?: any[];
  url?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  inviteNote?: string;
  templateName?: string;
}

/**
 * The organisation-wide term sets the old composer loaded from, kept while the
 * Templates & Criteria page still reads them. Superseded by OfferTemplate,
 * which belongs to a product and is what an invitation is actually sent on.
 */
export interface LegacyOfferTemplate { id: string; name: string; description: string; terms: Record<string, any>; usedCount: number; }

export interface UniversityCriteria { minCgpa: number; minEnglishScore: number; englishTest: string; preferredCurricula: string; targetCountries: string; }
export interface BankCriteria { guarantorRequired: boolean; maxFamilyIncome: number; eligibleCountries: string; }
export interface TeamMember { id: string; initials: string; name: string; email: string; role: string; status: 'Active' | 'Invited'; isSelf?: boolean; }

export const ROLE_CONFIG: Record<Role, any> = {
  UNIVERSITY: {
    logoSrc: '/university-logo.png', logoAlt: 'SuperOffer University',
    brandLabel: 'SuperOffer University', orgInitials: 'NU', orgLabel: 'University',
    userTitle: 'Admissions Officer',
    cycleLabel: 'recruitment cycle', createActionLabel: 'Send admission terms',
    searchEyebrow: 'STUDENT DISCOVERY', searchTitle: 'Find best-fit students',
    searchIntro: 'Browse verified student profiles ranked by compatibility with your products.',
    subscriptionIntro: 'Increase the number of student profiles your university can review and invite this cycle.',
    offerVerb: 'offer', offerNoun: 'admission and scholarship proposal', offerEyebrow: 'admission',
    orgFieldLabel: 'University name', orgTypeOptions: ['Private university'],
    profileTabLabel: 'University Profile',
    catalogEyebrow: 'PRODUCT CATALOG', catalogTitle: 'Products', catalogIntro: 'Maintain the products you recruit for — these power search filters and match scoring.',
    templatesEyebrow: 'OFFER TEMPLATES', templatesTitle: 'Offer templates', templatesIntro: 'Start an invitation from a reusable template instead of building terms from scratch every time.',
    criteriaEyebrow: 'ADMISSION CRITERIA', criteriaTitle: 'Admission criteria', criteriaIntro: 'Set the academic thresholds AI Matching uses to rank students against your products.',
    reportsEyebrow: 'REPORTS', reportsTitle: 'Admissions funnel', reportsIntro: 'Track how invitations move from sent to accepted, and which products convert best.',
    weightFactors: [
      { label: 'Academic fit', weight: 35 },
      { label: 'Test score fit', weight: 20 },
      { label: 'Course alignment', weight: 20 },
      { label: 'Country & intake', weight: 15 },
      { label: 'Budget & scholarship fit', weight: 10 }
    ]
  },
  BANK: {
    logoSrc: '/university-logo.png', logoAlt: 'SuperOffer Finance',
    brandLabel: 'SuperOffer Finance', orgInitials: 'EF', orgLabel: 'Lender',
    userTitle: 'Loan Manager',
    cycleLabel: 'lending cycle', createActionLabel: 'Send loan terms',
    searchEyebrow: 'STUDENT DISCOVERY', searchTitle: 'Find loan-ready students',
    searchIntro: 'Browse verified student profiles ranked by compatibility and financial eligibility.',
    subscriptionIntro: 'Increase the number of student profiles your organisation can review and invite this cycle.',
    offerVerb: 'loan offer', offerNoun: 'education loan proposal', offerEyebrow: 'loan',
    orgFieldLabel: 'Organisation name', orgTypeOptions: ['Bank', 'NBFC', 'Specialised lender'],
    profileTabLabel: 'Organisation Profile',
    catalogEyebrow: 'LOAN PRODUCTS', catalogTitle: 'Loan products', catalogIntro: 'Maintain the loan products you lend against — these power search filters and match scoring.',
    templatesEyebrow: 'OFFER TEMPLATES', templatesTitle: 'Offer templates', templatesIntro: 'Start a loan invitation from a reusable template instead of building terms from scratch every time.',
    criteriaEyebrow: 'ELIGIBILITY CRITERIA', criteriaTitle: 'Eligibility criteria', criteriaIntro: 'Set the admission-status, guarantor and country rules AI Matching uses to rank applicants.',
    reportsEyebrow: 'REPORTS', reportsTitle: 'Lending funnel', reportsIntro: 'Track how loan invitations move from sent to accepted, and which rates convert best.',
    weightFactors: [
      { label: 'Financial need fit', weight: 40 },
      { label: 'Admission status fit', weight: 25 },
      { label: 'Country eligibility', weight: 20 },
      { label: 'Guarantor completeness', weight: 15 }
    ]
  }
};

/** Which preset categories apply to an academic versus a financial product. */
export const FINANCIAL_PRESET_CATEGORIES = [
  'Interest Rate', 'Processing Charges', 'Collateral', 'Co-Applicant/Guarantor',
  'Repayment Terms', 'Higher Loan Coverage', 'Risk Protection'
];

export const ACADEMIC_PRESET_CATEGORIES = [
  'Application', 'Tuition', 'Accommodation', 'Competitive Test',
  'English Proficiency', 'Admission', 'RA/TA', 'Placement'
];

export interface ConditionPreset { id: string; category: string; text: string; vars: string[]; }

export interface PlanOption { name: string; profiles: string; recommended: boolean; features: string[]; unlocks: string[]; }

export interface BankEvaluationModeOption { value: BankEvaluationMode; label: string; description: string; }

/** One discoverable student, exactly as `/organizations/me/students` returns it. */
/**
 * The discovery filters an officer can set. Mirrors `StudentSearchFilters` on the
 * backend — every one of these is applied server-side, not in the browser.
 *
 * Which of them an officer actually sees depends on the organization type: a
 * university filters on academic fit, a lender on the money and on whether the
 * student already holds a university offer.
 */
export interface DiscoveryFilters {
  search: string;
  course: string;
  degree: string;
  country: string;
  intake: string;
  cgpaMin: string;
  englishTest: string;
  englishScoreMin: string;
  greMin: string;
  gmatMin: string;
  backlogsMax: string;
  workExperienceMin: string;
  scholarship: string;
  familyIncomeMax: string;
  requiredLoanMax: string;
  offerStatus: string;
  visibility: string;
}

export const EMPTY_FILTERS: DiscoveryFilters = {
  search: '', course: '', degree: '', country: '', intake: '', cgpaMin: '',
  englishTest: '', englishScoreMin: '', greMin: '', gmatMin: '', backlogsMax: '',
  workExperienceMin: '', scholarship: '', familyIncomeMax: '', requiredLoanMax: '',
  offerStatus: '', visibility: ''
};

/** One control in the filter panel. */
export interface FilterField {
  key: keyof DiscoveryFilters;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  step?: string;
  options?: string[];
}

export interface FilterGroup {
  group: string;
  fields: FilterField[];
}

/** Free-text search sits in its own box, so it isn't counted as an active filter. */
export const countActiveFilters = (filters: DiscoveryFilters): number =>
  (Object.keys(filters) as Array<keyof DiscoveryFilters>)
    .filter(key => key !== 'search' && filters[key] !== '').length;

export interface WorkspaceStudent {
  id: string;
  name: string;
  initials: string;
  /** Every answer the student gave, section by section — the record behind the card. */
  detail?: StudentRecord;
  photo?: string;
  course: string;
  country: string;
  degree: string;
  intake: string;
  futureInterests: string;
  email: string;
  mobile: string;
  currentCity: string;
  originCountry: string;
  cgpa: string;
  cgpaValue: number;
  englishTest: string;
  englishScore: number;
  ielts: number;
  toefl?: number;
  gre?: number;
  gmat?: number;
  backlogs: number;
  workExperienceYears: number;
  documentsVerified: number;
  examScore: string;
  budget: string;
  budgetValue: number;
  familyIncome?: number;
  requiredLoanAmount: number;
  financialSummary: string;
  skills: string[];
  score: number;
  factor: string;
  scholarshipSeeking: boolean;
  bio: string;
  color: string;
  eligible: boolean;
  submittedAt: string;
  needsLoan: string;
  financialDocuments?: Array<{ key: string; label: string; uploaded: boolean }>;
  universityInterests?: UniversityInterest[];
  counterparty?: Counterparty;
  loanReadiness?: LoanReadiness;
}

/**
 * Whether this household could carry a loan.
 *
 * Reaches a lender only once the co-applicant has agreed to a credit check, and
 * never reaches a university at all.
 */
export interface LoanReadiness {
  coApplicantRelationship: string;
  monthlyIncome: number;
  existingEmi: number;
  hasExistingLoan: string;
  loanAmountRequested: number;
  employmentType: string;
  /** From onboarding's Financial Information step, not the loan-eligibility form. */
  fundingSource: string;
  earningMembers: string;
  /** A band, never a score. */
  creditBand: string | null;
  creditOutcome: string | null;
  checkedAt: string | null;
  stale: boolean;
  documentsVerified: number;
  documentsExpected: number;
  verdict: string;
  affordableEmi: number;
  indicativeAmount: number;
  reasons: string[];
}

/**
 * Offers this student holds from the *other* side of the deal — admissions if you
 * are a lender, funding if you are a university. Same-kind offers never appear
 * here; a rival's terms are not yours to read.
 */
export interface Counterparty {
  kind: 'ADMISSION' | 'FUNDING' | 'ADVISORY' | null;
  heading: string;
  blurb: string;
  count: number;
  maxAmount: number;
  /** Highest scholarship share, when the offers are quoted as percentages. */
  maxShare: number;
  maxAmountLabel: string;
  maxAmountCaption: string;
  maxAmountFrom: string;
  anyAccepted: boolean;
  offers: Array<{
    organization: string;
    organizationType: string;
    country: string;
    program: string;
    status: string;
    accepted: boolean;
    value: string;
    amount: number;
    share: number;
  }>;
}

/**
 * An offer a product is prepared to make, written once and sent many times.
 *
 * Terms live here rather than being typed per invitation, which is what lets a
 * single click send something the organisation already agreed to.
 */
export interface OfferTemplate {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  terms: Record<string, unknown>;
  value?: string | null;
  valueLabel?: string | null;
  conditions?: string | null;
  nextSteps: string[];
  responseWindowDays?: number | null;
  /** The one a single-click invitation uses. Exactly one per product. */
  isDefault: boolean;
  usedCount: number;
  product?: { id: string; name: string; category?: string | null };
}

/** A template being written or edited, before it is saved. */
export interface TemplateDraft {
  id?: string;
  productId: string;
  productName: string;
  name: string;
  description: string;
  value: string;
  conditions: string;
  nextSteps: string;
  responseWindowDays: string;
  /** The figures, in the vocabulary the comparison and valuation read. */
  terms: Record<string, string>;
  isDefault: boolean;
}

/** One offer this organization sent, as `/organizations/me/offers` returns it. */
export interface OrganizationOffer {
  id: string;
  studentUserId: string;
  studentName: string;
  category: string;
  program: string;
  headline: string;
  status: OfferStatus;
  studentDecision: string;
  terms: Record<string, any>;
  conditions: string;
  location: string;
  intake: string;
  valueLabel: string;
  value: string;
  nextSteps: string[];
  contactName: string;
  contactRole: string;
  sentAt: string;
  viewedAt: string | null;
  respondedAt: string | null;
  expiresAt: string;
  messageCount: number;
  unread: number;
  messages: Array<{
    id: string;
    from: 'institution' | 'student' | 'system';
    author: string;
    body: string;
    sentAt: string;
    automatic?: boolean;
    attachment: { fileName: string; mimeType: string; size: number } | null;
  }>;
}

export interface OrganizationProfile {
  /** Resolved image URLs; the stored reference stays on the server. */
  logoUrl?: string | null;
  coverUrl?: string | null;
  id: string;
  name: string;
  organizationType: string;
  registrationNumber: string | null;
  licenseReference: string | null;
  website: string | null;
  country: string | null;
  city: string | null;
  description: string | null;
  verificationStatus: string;
  reviewedAt: string | null;
  bankEvaluationMode: BankEvaluationMode;
  criteria: Record<string, any>;
  notificationPrefs: Array<{ key: string; label: string; detail: string; frequency: string }>;
  offerTemplates: OfferTemplate[];
  subscription: {
    plan: string;
    profilesViewed: number;
    capacity: number | null;
    remaining: number | null;
    quotaPercent: number;
  };
}

/**
 * One row in the Candidates & Offers workspace: a discoverable student joined
 * with this organization's offer to them and its triage decision.
 */
export interface WorkspaceCandidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  email: string;
  mobile: string;
  currentCity: string;
  originCountry: string;
  futureInterests: string;
  degree: string;
  course: string;
  targetCountry: string;
  cgpa: string;
  examScore: string;
  budget: string;
  documentsVerified: number;
  workExperienceYears: number;
  skills: string[];
  bio: string;
  intake: string;
  headline: string;
  matchScore: number;
  matchBadge: string;
  offerId?: string;
  /** Every live offer this organization has sent them, newest first. */
  offers: Array<{ id: string; headline: string; program: string; status: string; unread: number; sentAt: string }>;
  offerType: string;
  offerValueLabel: string;
  offerValue: string;
  /** What the other side of the deal has already offered this student. */
  counterparty?: Counterparty;
  /** Whether this household could carry a loan. Lenders only. */
  loanReadiness?: LoanReadiness;
  /** The student's answers in full — what an organisation is paying to read. */
  detail?: StudentRecord;
  deadline: string;
  received: string;
  status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected' | 'Withdrawn';
  conditions: string;
  nextSteps: string[];
  unread: number;
  messages: Array<{
    id: string;
    from: 'student' | 'institution' | 'system';
    author: string;
    body: string;
    time: string;
    automatic?: boolean;
    attachment: { fileName: string; mimeType: string; size: number } | null;
  }>;
}
