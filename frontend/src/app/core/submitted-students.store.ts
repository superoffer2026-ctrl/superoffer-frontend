import { Injectable } from '@angular/core';

const STORAGE_KEY = 'superoffer_submitted_students';

export interface UniversityInterestRecord {
  university: string; country: string; course: string; status: string;
  scholarship?: string; tuitionFee?: string; remainingTuition?: string; livingCost?: string; logo?: string;
}

export interface SubmittedStudent {
  id: string;
  name: string;
  initials: string;
  photo: string;
  course: string;
  country: string;
  degree: string;
  cgpa: string;
  cgpaValue: number;
  ielts: number;
  englishTest: 'IELTS' | 'TOEFL' | 'PTE' | 'Duolingo';
  englishScore: number;
  backlogs: number;
  workExperienceYears: number;
  visaRefused: boolean;
  documentsVerified: number;
  examScore: string;
  budget: string;
  budgetValue: number;
  financialSummary: string;
  skills: string[];
  score: number;
  factor: string;
  intake: string;
  scholarshipSeeking: boolean;
  bio: string;
  color: string;
  eligible: boolean;
  eligibilityNote: string;
  live: true;
  submittedAt: string;
  gre?: number;
  gmat?: number;
  toefl?: number;
  familyIncome?: number;
  requiredLoanAmount?: number;
  universityInterests?: UniversityInterestRecord[];
}

function load(): SubmittedStudent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: SubmittedStudent[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

@Injectable({ providedIn: 'root' })
export class SubmittedStudentsStore {
  upsert(record: SubmittedStudent) {
    const list = load().filter(s => s.id !== record.id);
    list.unshift(record);
    persist(list);
  }

  remove(id: string) {
    persist(load().filter(s => s.id !== id));
  }

  list(): SubmittedStudent[] {
    return load();
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$', AED: 'AED ', SGD: 'S$'
};

const CARD_PALETTE = ['#0f6f54', '#315d88', '#8a5b35', '#695392', '#9a4f63', '#2d6a4f', '#a34135', '#1c5a7a'];

/** Turns the flat, localStorage-backed profile store into the shape the organization/bank discovery views render. */
export function mapProfileToOrgStudent(values: Record<string, string>, photo: string): SubmittedStudent {
  const name = values['fullName'] || 'Unnamed Student';
  const id = values['email'] || name;
  const initials = name.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();

  const country = (values['countries'] || '').split(',').map(s => s.trim()).filter(Boolean)[0] || values['country'] || '';
  const course = values['fieldOfInterest'] || '';
  const programLevel = (values['studyLevel'] || '').split(',').map(s => s.trim()).filter(Boolean)[0] || '';
  const degree = /bachelor/i.test(programLevel) || /undergrad/i.test(programLevel) ? 'Undergraduate' : 'Postgraduate';
  const intake = (values['intake'] || '').split(',').map(s => s.trim()).filter(Boolean)[0] || '';

  const cgpa = values['score'] || '';
  const cgpaValue = parseFloat((cgpa.match(/[\d.]+/) || ['0'])[0]) || 0;

  const englishExamRaw = values['englishExam'] || '';
  const englishTest: SubmittedStudent['englishTest'] =
    /toefl/i.test(englishExamRaw) ? 'TOEFL' : /det/i.test(englishExamRaw) ? 'Duolingo' : /pte/i.test(englishExamRaw) ? 'PTE' : 'IELTS';
  const englishScore = parseFloat(values['englishScore'] || '') || 0;
  const ielts = englishTest === 'IELTS' ? englishScore : 0;
  const toefl = englishTest === 'TOEFL' ? englishScore : undefined;

  const entranceExamRaw = (values['entranceExam'] || '').toUpperCase();
  const entranceScore = parseFloat(values['entranceScore'] || '') || undefined;
  const gre = entranceExamRaw === 'GRE' ? entranceScore : undefined;
  const gmat = entranceExamRaw.startsWith('GMAT') ? entranceScore : undefined;

  const backlogs = parseInt(values['backlogs'] || '0', 10) || 0;
  const relevantYears = parseFloat(values['relevantYears'] || '0') || 0;
  const nonRelevantYears = parseFloat(values['nonRelevantYears'] || '0') || 0;
  const workExperienceYears = values['workStatus'] === 'Yes' ? relevantYears + nonRelevantYears : 0;

  const currency = values['currency'] || 'INR';
  const householdIncome = parseFloat(values['annualHouseholdIncome'] || '0') || 0;
  const budgetValue = householdIncome;
  const symbol = CURRENCY_SYMBOLS[currency] || '';
  const budget = budgetValue ? `${symbol}${budgetValue.toLocaleString('en-IN')}` : 'Not shared';
  const financialSummary = values['fundingSource']
    ? `${values['fundingSource']} · Household income ${currency} ${budgetValue.toLocaleString('en-IN')}`
    : 'Financial details not shared';

  const skills = (values['achievements'] || '').split(',').map(s => s.trim()).filter(Boolean);

  const examParts: string[] = [];
  if (englishExamRaw) examParts.push(`${englishExamRaw} ${values['englishScore'] || ''}`.trim());
  if (values['entranceExam']) examParts.push(`${values['entranceExam']} ${values['entranceScore'] || ''}`.trim());
  const examScore = examParts.join(' · ') || 'Not recorded';

  const bio = [
    values['qualification'],
    values['institution'] ? `graduate from ${values['institution']}` : '',
    course ? `pursuing ${course}` : ''
  ].filter(Boolean).join(', ') || 'Recently submitted student profile.';

  const scholarshipSeeking = values['fundingSource'] === 'Scholarship' || values['fundingSource'] === 'Combination of the Above';

  const hash = Array.from(name).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const color = CARD_PALETTE[hash % CARD_PALETTE.length];

  const requiredChecklist = [
    values['fullName'], values['email'], values['mobileNumber'], values['country'], values['city'],
    values['countries'], values['fieldOfInterest'], values['studyLevel'], values['startYear'], values['intake'],
    values['qualificationLevel'], values['institution'], values['score'], values['graduationYear']
  ];
  const score = Math.round((requiredChecklist.filter(Boolean).length / requiredChecklist.length) * 100);

  return {
    id, name, initials,
    photo: photo || '/intelligent-matching-students.png',
    course, country, degree, intake,
    cgpa, cgpaValue,
    ielts, englishTest, englishScore, toefl,
    backlogs, workExperienceYears, visaRefused: false,
    documentsVerified: 0,
    examScore, budget, budgetValue, financialSummary,
    skills, score, factor: 'Recently submitted',
    scholarshipSeeking,
    bio, color, eligible: true,
    eligibilityNote: 'Manual review pending — recently submitted profile.',
    live: true,
    submittedAt: new Date().toISOString(),
    gre, gmat,
    familyIncome: budgetValue || undefined
  };
}
