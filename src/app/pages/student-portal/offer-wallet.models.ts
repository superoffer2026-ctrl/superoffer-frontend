import { Injectable } from '@angular/core';

export type OfferCategory = 'University' | 'Bank' | 'Scholarship' | 'Consultancy';
export type OfferDecisionStatus = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
export type JourneyStage = 'Received' | 'Viewed' | 'Compared' | 'Shortlisted' | 'Accepted' | 'Declined';

export interface OfferMessage {
  from: 'institution' | 'student';
  author: string;
  body: string;
  time: string;
}

export interface StudentOffer {
  id: string;
  category: OfferCategory;
  institution: string;
  initial: string;
  logo?: string;
  program: string;
  headline: string;
  received: string;
  status: OfferDecisionStatus;
  location: string;
  intake: string;
  deadline: string;
  valueLabel: string;
  value: string;
  conditions: string;
  nextSteps: string[];
  contact: string;
  contactRole: string;
  messages: OfferMessage[];
  recommended?: boolean;
  viewed: boolean;
  compared: boolean;
  saved: boolean;
  favourite: boolean;

  // University comparison fields
  tuitionFee?: string;
  scholarshipPct?: number;
  durationYears?: number;
  qsRanking?: string;
  placementHighlights?: string;

  // Bank comparison fields
  loanAmount?: string;
  interestRate?: string;
  emi?: string;
  moratorium?: string;
  processingFee?: string;
  tenure?: string;

  // Scholarship comparison fields
  amount?: string;
  coverage?: string;
  eligibility?: string;

  // Consultancy comparison fields
  visaServices?: string;
  accommodationSupport?: string;
  supportServices?: string;
}

const FAVOURITES_KEY = 'superoffer_offer_favourites';
const SAVED_KEY = 'superoffer_offer_saved';
const COMPARE_KEY = 'superoffer_offer_compare_selection';

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]): void {
  localStorage.setItem(key, JSON.stringify(ids));
}

@Injectable({ providedIn: 'root' })
export class OfferWalletStore {
  offers: StudentOffer[] = [
    {
      id: 'offer-1000', category: 'University', institution: 'Northbridge University', initial: 'N', logo: '/logos/northbridge.png',
      program: 'MSc Data Science', headline: '40% Global Excellence Scholarship', received: '24 Jul', status: 'Pending',
      location: 'Toronto, Canada', intake: 'Fall 2027', deadline: '15 August 2026', valueLabel: 'Scholarship', value: '40% tuition',
      conditions: 'Your admission and scholarship are conditional on final transcript verification and meeting the programme English-language requirement.',
      nextSteps: ['Review the scholarship and admission conditions', 'Upload your final academic transcript', 'Confirm your decision before the deadline'],
      contact: 'Maya Chen', contactRole: 'International Admissions Adviser',
      messages: [
        { from: 'institution', author: 'Maya Chen', body: 'Hi! We were impressed by your academic profile and would like to offer you admission with our Global Excellence Scholarship.', time: '24 Jul, 10:12' },
        { from: 'student', author: 'You', body: 'Thank you. Could you confirm whether the scholarship applies to both years of the programme?', time: '24 Jul, 11:03' },
        { from: 'institution', author: 'Maya Chen', body: 'Yes, it is renewable for the second year provided you maintain the required academic standing.', time: '24 Jul, 11:18' }
      ],
      recommended: true, viewed: false, compared: false, saved: false, favourite: false,
      tuitionFee: 'CAD 42,000 / year', scholarshipPct: 40, durationYears: 2, qsRanking: '#186 (QS 2026, placeholder)', placementHighlights: '92% graduate employment within 6 months'
    },
    {
      id: 'offer-1001', category: 'Bank', institution: 'EduFund Finance', initial: 'E', logo: '/logos/edufund.png',
      program: 'International Education Loan', headline: 'Pre-qualified education loan up to ₹35 lakh', received: '23 Jul', status: 'Pending',
      location: 'India', intake: 'Fall 2027', deadline: '20 August 2026', valueLabel: 'Loan amount', value: 'Up to ₹35 lakh',
      conditions: 'Indicative approval at 9.4% p.a., subject to KYC, co-applicant verification, admission evidence, and final credit assessment.',
      nextSteps: ['Review indicative rate and repayment schedule', 'Submit co-applicant and KYC documents', 'Share your confirmed admission letter'],
      contact: 'Rohan Kapoor', contactRole: 'Education Loan Specialist',
      messages: [
        { from: 'institution', author: 'Rohan Kapoor', body: 'Your profile is pre-qualified for our international education loan. I can help you understand the documentation and repayment options.', time: '23 Jul, 15:40' }
      ],
      recommended: true, viewed: true, compared: false, saved: true, favourite: false,
      loanAmount: '₹35,00,000', interestRate: '9.4% p.a.', emi: '≈ ₹44,200 / month', moratorium: 'Course duration + 6 months', processingFee: '1% (waived on disbursal)', tenure: '10 years'
    },
    {
      id: 'offer-1002', category: 'University', institution: 'Westford University', initial: 'W', logo: '/logos/westford.png',
      program: 'MSc Artificial Intelligence', headline: 'Priority admission with £6,000 award', received: '21 Jul', status: 'Shortlisted',
      location: 'Manchester, UK', intake: 'September 2027', deadline: '12 August 2026', valueLabel: 'Award', value: '£6,000',
      conditions: 'This priority offer is subject to degree completion with the stated minimum grade and receipt of verified IELTS results.',
      nextSteps: ['Compare programme modules and total costs', 'Submit verified English test result', 'Accept the priority place online'],
      contact: 'Olivia Hart', contactRole: 'Regional Admissions Manager',
      messages: [
        { from: 'institution', author: 'Olivia Hart', body: 'We have matched your profile with our MSc Artificial Intelligence programme and reserved a priority place for you.', time: '21 Jul, 09:24' }
      ],
      viewed: true, compared: false, saved: true, favourite: true,
      tuitionFee: '£24,000 / year', scholarshipPct: 25, durationYears: 1, qsRanking: '#301 (QS 2026, placeholder)', placementHighlights: 'Strong AI research placements across UK tech firms'
    },
    {
      id: 'offer-1003', category: 'Bank', institution: 'LearnFund', initial: 'L', logo: '/logos/learnfund.png',
      program: 'Study Abroad Loan', headline: 'Collateral-free funding assessment', received: '18 Jul', status: 'Pending',
      location: 'India', intake: '2027 intake', deadline: '30 August 2026', valueLabel: 'Funding', value: 'Up to ₹25 lakh',
      conditions: 'Final eligibility and pricing depend on university ranking, programme, co-applicant income, and standard underwriting checks.',
      nextSteps: ['Complete the two-minute eligibility form', 'Upload co-applicant income documents', 'Select the university offer you plan to fund'],
      contact: 'Neha Iyer', contactRole: 'Student Finance Adviser',
      messages: [
        { from: 'institution', author: 'Neha Iyer', body: 'Based on your profile, you may qualify for collateral-free study abroad funding. Message me if you would like a personalised estimate.', time: '18 Jul, 14:05' }
      ],
      viewed: false, compared: false, saved: false, favourite: false,
      loanAmount: '₹25,00,000', interestRate: '10.2% p.a.', emi: '≈ ₹33,500 / month', moratorium: 'Course duration + 12 months', processingFee: '1.5%', tenure: '8 years'
    },
    {
      id: 'offer-1004', category: 'University', institution: 'Lakeview Institute of Technology', initial: 'LI', logo: '/logos/lakeview.png',
      program: 'MSc Robotics', headline: 'Merit scholarship with fast-track visa support', received: '15 Jul', status: 'Pending',
      location: 'Vancouver, Canada', intake: 'Winter 2028', deadline: '5 September 2026', valueLabel: 'Scholarship', value: '25% tuition',
      conditions: 'Offer conditional on final-year transcript and confirmation of English proficiency test results.',
      nextSteps: ['Review programme structure and co-op terms', 'Submit final transcript', 'Confirm intake by the response deadline'],
      contact: 'Chen Wu', contactRole: 'Admissions Coordinator',
      messages: [
        { from: 'institution', author: 'Chen Wu', body: 'Congratulations! We would like to offer you a place in our MSc Robotics programme with a 25% merit scholarship.', time: '15 Jul, 09:30' }
      ],
      viewed: false, compared: false, saved: false, favourite: false,
      tuitionFee: 'CAD 38,500 / year', scholarshipPct: 25, durationYears: 2, qsRanking: '#412 (QS 2026, placeholder)', placementHighlights: 'Co-op placements with robotics and automation employers'
    },
    {
      id: 'offer-1005', category: 'Bank', institution: 'Global Campus Finance', initial: 'G', logo: '/logos/globalcampus.png',
      program: 'Unsecured Study Loan', headline: 'Fast-tracked unsecured loan decision', received: '12 Jul', status: 'Pending',
      location: 'India', intake: 'Any intake', deadline: '25 August 2026', valueLabel: 'Loan amount', value: 'Up to ₹20 lakh',
      conditions: 'Indicative sanction subject to KYC, academic verification and final underwriting.',
      nextSteps: ['Complete KYC verification', 'Submit co-applicant details', 'Share confirmed admission letter once available'],
      contact: 'Ananya Bose', contactRole: 'Loan Relationship Manager',
      messages: [
        { from: 'institution', author: 'Ananya Bose', body: 'Based on your academic profile, you pre-qualify for a fast-tracked unsecured study loan.', time: '12 Jul, 11:00' }
      ],
      viewed: false, compared: false, saved: false, favourite: false,
      loanAmount: '₹20,00,000', interestRate: '11.5% p.a.', emi: '≈ ₹27,800 / month', moratorium: 'Course duration + 6 months', processingFee: '2%', tenure: '7 years'
    },
    {
      id: 'offer-1006', category: 'Scholarship', institution: 'Global Merit Foundation', initial: 'GM', logo: '/logos/globalmerit.png',
      program: 'International Merit Scholarship', headline: '₹8,00,000 award for outstanding academic merit', received: '19 Jul', status: 'Pending',
      location: 'Global', intake: 'Fall 2027', deadline: '10 August 2026', valueLabel: 'Award amount', value: '₹8,00,000',
      conditions: 'Award disbursed directly to the university upon confirmed enrolment; renewable in year two subject to maintaining a first-class average.',
      nextSteps: ['Submit enrolment confirmation', 'Upload latest academic transcript', 'Accept award terms before the deadline'],
      contact: 'Grace Thompson', contactRole: 'Scholarship Program Manager',
      messages: [
        { from: 'institution', author: 'Grace Thompson', body: 'Congratulations — your profile has been selected for the International Merit Scholarship.', time: '19 Jul, 14:20' }
      ],
      recommended: true, viewed: false, compared: false, saved: false, favourite: false,
      amount: '₹8,00,000', coverage: '50% of first-year tuition', eligibility: 'CGPA 8.5+, IELTS 7.0+, demonstrated leadership activity'
    },
    {
      id: 'offer-1007', category: 'Scholarship', institution: 'WomenInTech Trust', initial: 'WT', logo: '/logos/womenintech.png',
      program: 'Women in STEM Award', headline: '£3,500 award plus mentorship programme', received: '10 Jul', status: 'Pending',
      location: 'United Kingdom', intake: 'September 2027', deadline: '1 September 2026', valueLabel: 'Award amount', value: '£3,500',
      conditions: 'Award is paid in two instalments across the academic year, subject to continued enrolment.',
      nextSteps: ['Confirm interest in the mentorship track', 'Submit a short personal statement', 'Accept before the deadline'],
      contact: 'Priya Shah', contactRole: 'Trust Coordinator',
      messages: [
        { from: 'institution', author: 'Priya Shah', body: 'We are delighted to offer you the Women in STEM Award along with our mentorship programme.', time: '10 Jul, 16:45' }
      ],
      viewed: false, compared: false, saved: false, favourite: false,
      amount: '£3,500', coverage: 'Partial tuition + 6-month mentorship', eligibility: 'Female applicants in STEM postgraduate programmes'
    },
    {
      id: 'offer-1008', category: 'Consultancy', institution: 'BrightPath Education', initial: 'BP', logo: '/logos/brightpath.png',
      program: 'End-to-end Study Abroad Support', headline: 'Full application, visa and relocation support package', received: '8 Jul', status: 'Pending',
      location: 'India', intake: 'Fall 2027', deadline: '31 August 2026', valueLabel: 'Service package', value: 'Premium',
      conditions: 'Service engagement begins once a university offer is accepted; fees apply per the agreed service package.',
      nextSteps: ['Review the service package details', 'Schedule an onboarding call', 'Confirm engagement before the deadline'],
      contact: 'Ananya Suresh', contactRole: 'Client Success Lead',
      messages: [
        { from: 'institution', author: 'Ananya Suresh', body: 'We would love to support your journey end-to-end — from visa filing through to arrival.', time: '8 Jul, 10:15' }
      ],
      recommended: true, viewed: false, compared: false, saved: false, favourite: false,
      visaServices: 'Full visa filing and interview preparation', accommodationSupport: 'Verified housing shortlist in 3 cities', supportServices: 'Pre-departure briefing, airport pickup, 24/7 helpline'
    },
    {
      id: 'offer-1009', category: 'Consultancy', institution: 'GlobalReach Consultants', initial: 'GR', logo: '/logos/globalreach.png',
      program: 'Visa & Documentation Concierge', headline: 'Dedicated visa specialist and document review', received: '5 Jul', status: 'Pending',
      location: 'India', intake: 'Any intake', deadline: '20 August 2026', valueLabel: 'Service package', value: 'Standard',
      conditions: 'Engagement is a one-time fee covering the visa filing window only.',
      nextSteps: ['Share your visa application details', 'Book a mock interview slot'],
      contact: 'Karan Mehta', contactRole: 'Visa Consultant',
      messages: [
        { from: 'institution', author: 'Karan Mehta', body: 'Happy to help you prepare a strong visa application — let’s get started with a document review.', time: '5 Jul, 13:00' }
      ],
      viewed: false, compared: false, saved: false, favourite: false,
      visaServices: 'Document review and visa interview mock sessions', accommodationSupport: 'Not included', supportServices: 'Email and chat support during visa processing'
    }
  ];

  constructor() {
    const favourites = new Set(readIds(FAVOURITES_KEY));
    const saved = new Set(readIds(SAVED_KEY));
    const compareSelection = new Set(readIds(COMPARE_KEY));
    for (const offer of this.offers) {
      if (favourites.has(offer.id)) offer.favourite = true;
      if (saved.has(offer.id)) offer.saved = true;
      if (compareSelection.has(offer.id)) offer.compared = true;
    }
    this.compareSelectionIds = [...compareSelection];
  }

  compareSelectionIds: string[] = [];

  private find(id: string): StudentOffer | undefined {
    return this.offers.find(offer => offer.id === id);
  }

  markViewed(id: string): void {
    const offer = this.find(id);
    if (offer) offer.viewed = true;
  }

  toggleFavourite(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    offer.favourite = !offer.favourite;
    writeIds(FAVOURITES_KEY, this.offers.filter(o => o.favourite).map(o => o.id));
  }

  toggleSaved(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    offer.saved = !offer.saved;
    writeIds(SAVED_KEY, this.offers.filter(o => o.saved).map(o => o.id));
  }

  toggleCompareSelect(id: string): void {
    const offer = this.find(id);
    if (!offer) return;
    if (this.compareSelectionIds.includes(id)) {
      this.compareSelectionIds = this.compareSelectionIds.filter(existing => existing !== id);
    } else {
      this.compareSelectionIds = [...this.compareSelectionIds, id];
      offer.viewed = true;
    }
    offer.compared = this.compareSelectionIds.includes(id);
    writeIds(COMPARE_KEY, this.compareSelectionIds);
  }

  setStatus(id: string, status: OfferDecisionStatus): void {
    const offer = this.find(id);
    if (offer) offer.status = status;
  }

  stage(offer: StudentOffer): JourneyStage {
    if (offer.status === 'Accepted') return 'Accepted';
    if (offer.status === 'Rejected') return 'Declined';
    if (offer.status === 'Shortlisted') return 'Shortlisted';
    if (offer.compared) return 'Compared';
    if (offer.viewed) return 'Viewed';
    return 'Received';
  }

  private byCategory(category: OfferCategory): number {
    return this.offers.filter(offer => offer.category === category).length;
  }

  get totalCount(): number { return this.offers.length; }
  get newCount(): number { return this.offers.filter(offer => !offer.viewed).length; }
  get universityCount(): number { return this.byCategory('University'); }
  get bankCount(): number { return this.byCategory('Bank'); }
  get scholarshipCount(): number { return this.byCategory('Scholarship'); }
  get consultancyCount(): number { return this.byCategory('Consultancy'); }
  get savedCount(): number { return this.offers.filter(offer => offer.saved).length; }
  get acceptedCount(): number { return this.offers.filter(offer => offer.status === 'Accepted').length; }
}
