'use client';

import { authApi } from '@/lib/api/auth-api';
import { ExamStep, type ExamStepConfig } from './ExamStep';

const config: ExamStepConfig = {
  sectionKey: 'englishExam',
  route: 'english-exam',
  compositeKey: 'englishExams',
  codedKeys: ['englishExams', 'englishExam', 'englishScore'],
  heading: 'English Exam details',
  question: 'Have you taken or are preparing for an English proficiency exam?',
  yesHint: 'IELTS, TOEFL, PTE or DET',
  noHint: "I haven't attempted any English exam yet",
  noOptionCopy: "No exams selected yet — that's fine if it doesn't apply to you.",
  previousHref: '/student/academic-information',
  nextHref: '/student/competitive-exam',
  saveErrorMessage: 'Could not save your exam details. Please try again.',

  loadOptions: async () => {
    const options = await authApi.getEnglishExamReferenceData();
    return { examOptions: options.englishExamOptions, statusOptions: options.examStatusOptions };
  },

  readSaved: profile => {
    const exams = (profile?.entranceExams as { englishExams?: Array<Record<string, string>> }) || {};
    return exams.englishExams || [];
  },

  save: (token, exams, attended) => {
    const first = exams[0];
    return authApi.saveStudentEnglishExam(token, {
      attended,
      englishExams: exams,
      englishExam: first ? first.exam : '',
      englishScore: first ? first.score || first.expectedScore || first.currentScore || '' : ''
    });
  }
};

export function EnglishExam() {
  return <ExamStep config={config} />;
}
