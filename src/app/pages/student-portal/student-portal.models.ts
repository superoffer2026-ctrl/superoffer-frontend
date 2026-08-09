export interface StudentProfileStep {
  path: string;
  title: string;
  description: string;
  icon: string;
}

export const STUDENT_PROFILE_STEPS: StudentProfileStep[] = [
  { path: 'personal-information', title: 'Personal Information', description: 'Basic student details', icon: '01' },
  { path: 'study-preferences', title: 'Study Preferences', description: 'Future study interests', icon: '02' },
  { path: 'academic-information', title: 'Academic Information', description: 'Education background', icon: '03' },
  { path: 'english-exam', title: 'English Exam', description: 'English proficiency exams', icon: '04' },
  { path: 'competitive-exam', title: 'Competitive Exam', description: 'GRE or GMAT', icon: '05' },
  { path: 'work-experience', title: 'Work Experience', description: 'Relevant and non-relevant experience', icon: '06' },
  { path: 'projects', title: 'Projects & Achievements', description: 'Experience and recognition', icon: '07' },
  { path: 'review', title: 'Review Profile', description: 'Review all sections', icon: '08' }
];
