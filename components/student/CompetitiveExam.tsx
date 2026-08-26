'use client';

import { authApi } from '@/lib/api/auth-api';
import { ExamStep, type ExamStepConfig } from './ExamStep';

const config: ExamStepConfig = {
  sectionKey: 'competitiveExam',
  route: 'competitive-exam',
  compositeKey: 'competitiveExams',
  codedKeys: ['competitiveExams', 'entranceExam', 'entranceScore'],
  heading: 'Competitive Exam details',
  question: 'Have you taken or are preparing for a competitive exam?',
  yesHint: 'GRE or GMAT',
  noHint: "I haven't attempted any competitive exam yet",
  noOptionCopy: "No exams selected yet — that's fine if it doesn't apply to you.",
  previousHref: '/student/english-exam',
  nextHref: '/student/work-experience',
  saveErrorMessage: 'Could not save your exam details. Please try again.',

  loadOptions: async () => {
    const options = await authApi.getCompetitiveExamReferenceData();
    return { examOptions: options.competitiveExamOptions, statusOptions: options.examStatusOptions };
  },

  readSaved: profile => {
    const exams = (profile?.entranceExams as { competitiveExams?: Array<Record<string, string>> }) || {};
    return exams.competitiveExams || [];
  },

  save: (token, exams, attended) => {
    const first = exams[0];
    return authApi.saveStudentCompetitiveExam(token, {
      attended,
      competitiveExams: exams,
      entranceExam: first ? first.exam : '',
      entranceScore: first ? first.score || first.expectedScore || first.currentScore || '' : ''
    });
  }
};

export function CompetitiveExam() {
  return <ExamStep config={config} />;
}
