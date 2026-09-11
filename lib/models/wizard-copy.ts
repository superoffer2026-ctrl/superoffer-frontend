/**
 * What each profile step says to the student, beyond the fields themselves.
 *
 * A step is a conversation: the guide asks one clear question, an illustration
 * sets the scene, and a "did you know" nudges them to answer well. Keyed by
 * the step's route path; a section an admin publishes that has no entry here
 * falls back to a generic but still friendly voice.
 */
export type WizardIllustrationKey =
  | 'identity' | 'destinations' | 'academics' | 'language' | 'aptitude'
  | 'career' | 'funding' | 'achievements' | 'review';

export interface WizardStepCopy {
  /** The one question the guide asks at the top of the card. */
  question: string;
  /** A short encouragement under the question, in plain words. */
  lede: string;
  /** The "did you know" strip above the Continue button. */
  tip: string;
  illustration: WizardIllustrationKey;
  /** Sky colours behind the card, so each step feels like a new place. */
  sky: [string, string, string];
}

export const WIZARD_COPY: Record<string, WizardStepCopy> = {
  'personal-information': {
    question: 'First things first — who are we building this profile for?',
    lede: 'Your name and contact details are what an admissions officer sees first.',
    tip: 'Did you know? Profiles with a complete contact section get replies from universities 2× faster.',
    illustration: 'identity',
    sky: ['#ffe3ec', '#e9e2ff', '#d6f0ff']
  },
  'study-preferences': {
    question: 'Where in the world do you see yourself studying?',
    lede: 'Pick every country and programme you are open to — more doors, more offers.',
    tip: 'Did you know? Students who explore at least 3 countries are 40% more likely to find a hidden scholarship.',
    illustration: 'destinations',
    sky: ['#fde7c8', '#e6e3ff', '#cfeeff']
  },
  'academic-information': {
    question: 'Tell us about your academic journey so far.',
    lede: 'Grades, boards and gaps — universities read the whole story, not one number.',
    tip: 'Did you know? A clearly explained education gap is rarely a problem; an unexplained one always raises a question.',
    illustration: 'academics',
    sky: ['#e0f2ff', '#e8e6ff', '#ffe9dc']
  },
  'english-exam': {
    question: 'How do you show your English is ready for the classroom?',
    lede: 'IELTS, TOEFL, PTE or Duolingo — booked counts too.',
    tip: 'Did you know? Many universities accept a "planned" test date for a conditional offer, so you can apply before you sit it.',
    illustration: 'language',
    sky: ['#e3f6ee', '#e6ecff', '#fff0d6']
  },
  'competitive-exam': {
    question: 'Have you taken — or planned — a GRE, GMAT or similar?',
    lede: 'Optional for many programmes, decisive for a few. Tell us either way.',
    tip: 'Did you know? Over half of top business schools now offer GMAT waivers for strong work experience.',
    illustration: 'aptitude',
    sky: ['#fff1d6', '#ffe4ec', '#e6e6ff']
  },
  'work-experience': {
    question: 'What have you worked on, in or outside a classroom?',
    lede: 'Internships, part-time jobs and volunteering all count.',
    tip: 'Did you know? Lenders treat two years of work experience as a strong signal — it can lower your loan rate.',
    illustration: 'career',
    sky: ['#e2f0ff', '#e6ffef', '#fff3d9']
  },
  'financial-information': {
    question: 'How will your studies be funded?',
    lede: 'Honest numbers here unlock pre-approved loan offers within 24 hours.',
    tip: 'Did you know? Completing this section is what lets partner banks send you an offer before you even apply.',
    illustration: 'funding',
    sky: ['#e6fff4', '#e4efff', '#f3e8ff']
  },
  projects: {
    question: 'What are you proudest of?',
    lede: 'Projects, awards, publications, a club you ran — anything that shows initiative.',
    tip: 'Did you know? A single well-described project beats a list of ten titles. Say what you did and what changed.',
    illustration: 'achievements',
    sky: ['#fbe7ff', '#e3ecff', '#ffefd8']
  },
  review: {
    question: 'Here is your profile. Ready to be discovered?',
    lede: 'Check every section, then publish to start receiving offers.',
    tip: 'Did you know? Published profiles are shown to verified universities and banks within the hour.',
    illustration: 'review',
    sky: ['#e2fbef', '#e8e9ff', '#fff0e0']
  }
};

export const DEFAULT_WIZARD_COPY: WizardStepCopy = {
  question: 'A few more details and you are done.',
  lede: 'Everything you add here is saved to your profile straight away.',
  tip: 'Did you know? Complete profiles receive up to 3× more offers than partial ones.',
  illustration: 'identity',
  sky: ['#e8e6ff', '#e0f2ff', '#ffe9dc']
};

export const wizardCopyFor = (path: string): WizardStepCopy => WIZARD_COPY[path] ?? DEFAULT_WIZARD_COPY;
