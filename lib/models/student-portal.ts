export interface StudentProfileStep {
  path: string;
  title: string;
  description: string;
  icon: string;
  /** The section key `/students/me/completion` reports for this step; the review step has none. */
  completionKey?: string;
}

export const STUDENT_PROFILE_STEPS: StudentProfileStep[] = [
  { path: 'personal-information', title: 'Personal Information', description: 'Basic student details', icon: '01', completionKey: 'personalInformation' },
  { path: 'study-preferences', title: 'Study Preferences', description: 'Future study interests', icon: '02', completionKey: 'studyPreferences' },
  { path: 'academic-information', title: 'Academic Information', description: 'Education background', icon: '03', completionKey: 'academicInformation' },
  { path: 'english-exam', title: 'English Exam', description: 'English proficiency exams', icon: '04', completionKey: 'englishExam' },
  { path: 'competitive-exam', title: 'Competitive Exam', description: 'GRE or GMAT', icon: '05', completionKey: 'competitiveExam' },
  { path: 'work-experience', title: 'Work Experience', description: 'Relevant and non-relevant experience', icon: '06', completionKey: 'workExperience' },
  { path: 'financial-information', title: 'Financial Information', description: 'Funding and financial background', icon: '07', completionKey: 'financialInformation' },
  { path: 'projects', title: 'Projects & Achievements', description: 'Experience and recognition', icon: '08', completionKey: 'projectsAchievements' },
  { path: 'review', title: 'Review Profile', description: 'Review all sections', icon: '09' }
];
