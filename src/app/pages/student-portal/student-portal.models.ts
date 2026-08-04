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
  { path: 'entrance-exams', title: 'Entrance Exams', description: 'Exam information', icon: '04' },
  { path: 'financial-information', title: 'Financial Information', description: 'Affordability and funding', icon: '05' },
  { path: 'projects', title: 'Projects & Achievements', description: 'Experience and recognition', icon: '06' },
  { path: 'review', title: 'Review Profile', description: 'Review all sections', icon: '07' },
  { path: 'completion', title: 'Complete Profile', description: 'Finish profile setup', icon: '08' }
];
