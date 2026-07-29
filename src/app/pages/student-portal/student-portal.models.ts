export interface StudentProfileStep {
  path: string;
  title: string;
  description: string;
  icon: string;
}

export interface StudentUiField {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'date' | 'textarea' | 'file';
  wide?: boolean;
}

export const PROFILE_STEP_FIELDS: Record<string, StudentUiField[]> = {
  personal: [
    { key: 'photo', label: 'Profile photo', type: 'file', wide: true },
    { key: 'fullName', label: 'Full name', placeholder: 'Aarav Mehta' },
    { key: 'email', label: 'Email address', type: 'email', placeholder: 'aarav@example.com' },
    { key: 'phone', label: 'Phone number', placeholder: '+91 98765 43210' },
    { key: 'location', label: 'Current city and country', placeholder: 'Bengaluru, India' }
  ],
  academic: [
    { key: 'institution', label: 'School / college', placeholder: 'Your current institution' },
    { key: 'qualification', label: 'Current qualification', placeholder: 'B.Tech Computer Science' },
    { key: 'score', label: 'Current grade / CGPA', placeholder: '8.7 / 10' },
    { key: 'graduationYear', label: 'Expected graduation year', placeholder: '2027' }
  ],
  preferences: [
    { key: 'studyLevel', label: 'Study level', placeholder: 'Postgraduate' },
    { key: 'fieldOfInterest', label: 'Field of interest', placeholder: 'Data Science' },
    { key: 'countries', label: 'Preferred countries', placeholder: 'Canada, UK, Germany' },
    { key: 'intake', label: 'Preferred intake', placeholder: 'Fall 2027' }
  ],
  exams: [
    { key: 'englishExam', label: 'English language exam', placeholder: 'IELTS' },
    { key: 'englishScore', label: 'Overall score', placeholder: '7.5' },
    { key: 'entranceExam', label: 'Entrance exam', placeholder: 'GRE / SAT / GMAT' },
    { key: 'entranceScore', label: 'Exam score', placeholder: 'Optional' }
  ],
  skills: [
    { key: 'technicalSkills', label: 'Technical skills', placeholder: 'Python, SQL, Machine Learning', wide: true },
    { key: 'languages', label: 'Languages known', placeholder: 'English, Hindi, Tamil' },
    { key: 'certifications', label: 'Certifications', placeholder: 'Add key certifications' }
  ],
  projects: [
    { key: 'projectTitle', label: 'Featured project', placeholder: 'Student success prediction model' },
    { key: 'projectRole', label: 'Your role', placeholder: 'Developer and researcher' },
    { key: 'achievements', label: 'Achievements', type: 'textarea', placeholder: 'Awards, leadership, competitions or relevant experience', wide: true }
  ],
  documents: [
    { key: 'transcript', label: 'Academic transcript', type: 'file' },
    { key: 'resume', label: 'CV / résumé', type: 'file' },
    { key: 'passport', label: 'Passport copy', type: 'file' },
    { key: 'testReport', label: 'Test score report', type: 'file' }
  ],
  review: [
    { key: 'profileSummary', label: 'Profile summary', type: 'textarea', placeholder: 'A short introduction shown to matched institutions', wide: true },
    { key: 'visibility', label: 'Profile visibility', placeholder: 'Visible to matched partners', wide: true }
  ],
  completion: [
    { key: 'completionNote', label: 'Final note', type: 'textarea', placeholder: 'Anything you would like institutions to know', wide: true }
  ]
};

export const STUDENT_PROFILE_STEPS: StudentProfileStep[] = [
  { path: 'personal-information', title: 'Personal Information', description: 'Basic student details', icon: '01' },
  { path: 'academic-information', title: 'Academic Information', description: 'Education background', icon: '02' },
  { path: 'study-preferences', title: 'Study Preferences', description: 'Future study interests', icon: '03' },
  { path: 'entrance-exams', title: 'Entrance Exams', description: 'Exam information', icon: '04' },
  { path: 'skills', title: 'Skills & Languages', description: 'Skills and communication', icon: '05' },
  { path: 'projects', title: 'Projects & Achievements', description: 'Experience and recognition', icon: '06' },
  { path: 'documents', title: 'Documents Upload', description: 'Supporting documents', icon: '07' },
  { path: 'review', title: 'Review Profile', description: 'Review all sections', icon: '08' },
  { path: 'completion', title: 'Complete Profile', description: 'Finish profile setup', icon: '09' }
];
