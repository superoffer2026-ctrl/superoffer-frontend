export type ExamCategoryKey = 'english' | 'competitive';

export const EXAM_STATUS_OPTIONS: string[] = [
  'I have the score',
  'Awaiting Result',
  'Yet to be taken',
  'Retake'
];

export const ENGLISH_EXAM_OPTIONS: string[] = ['IELTS', 'TOEFL (New)', 'TOEFL (Old)', 'PTE', 'DET'];
export const COMPETITIVE_EXAM_OPTIONS: string[] = ['GRE', 'GMAT (Focus)', 'GMAT (Classic)'];

export interface ExamCategoryConfig {
  key: ExamCategoryKey;
  title: string;
  icon: string;
  hint: string;
  examOptions: string[];
}

export const EXAM_CATEGORIES: ExamCategoryConfig[] = [
  { key: 'english', title: 'English Requirement', icon: 'EN', hint: 'IELTS, TOEFL, PTE or DET', examOptions: ENGLISH_EXAM_OPTIONS },
  { key: 'competitive', title: 'Competitive Exam', icon: 'CE', hint: 'GRE or GMAT', examOptions: COMPETITIVE_EXAM_OPTIONS }
];

export interface ScoreFieldDescriptor {
  controlKey: 'score' | 'expectedScore' | 'currentScore';
  label: string;
  placeholder: string;
}

export function scoreFieldsForStatus(status: string): ScoreFieldDescriptor[] {
  if (status === 'I have the score') return [{ controlKey: 'score', label: 'Score', placeholder: 'e.g. 7.5' }];
  if (status === 'Awaiting Result' || status === 'Yet to be taken') {
    return [{ controlKey: 'expectedScore', label: 'Expected Score', placeholder: 'e.g. 7.5' }];
  }
  if (status === 'Retake') {
    return [
      { controlKey: 'currentScore', label: 'Current Score', placeholder: 'e.g. 6.5' },
      { controlKey: 'expectedScore', label: 'Expected Score', placeholder: 'e.g. 7.5' }
    ];
  }
  return [];
}
