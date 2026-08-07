import { UNIVERSITY_OPTIONS } from './university-options';

export type Qualification = '12th' | 'Diploma' | "Bachelor's Degree" | "Master's Degree";

export const QUALIFICATION_OPTIONS: Qualification[] = [
  '12th', 'Diploma', "Bachelor's Degree", "Master's Degree"
];

export const CURRICULUM_OPTIONS: string[] = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'NIOS', 'Other'];

export const EDUCATION_GAP_OPTIONS: string[] = [
  'No Gap', '1 Year', '2 Years', '3 Years', '4 Years', '5 Years',
  '6 Years', '7 Years', '8 Years', '9 Years', '10 Years', 'More than 10 Years'
];

// Easy to extend — covers a broad academic history plus near-future completion.
export const EDUCATION_YEARS: string[] = Array.from({ length: 41 }, (_, i) => String(2030 - i));

export type EduFieldType = 'select' | 'text' | 'number' | 'file';

export interface EduField {
  key: string;
  label: string;
  type: EduFieldType;
  options?: string[];
  placeholder?: string;
  wide?: boolean;
}

const cgpaField: EduField = { key: 'cgpa', label: 'CGPA / Percentage', type: 'text', placeholder: 'e.g. 8.7 CGPA or 85%' };
const backlogsField: EduField = { key: 'backlogs', label: 'Number of Backlogs', type: 'number', placeholder: '0' };
const startedYearField: EduField = { key: 'startedYear', label: 'Started Year', type: 'select', options: EDUCATION_YEARS };
const completionYearField: EduField = { key: 'completionYear', label: 'Completion Year', type: 'select', options: EDUCATION_YEARS };
const yearsOfEducationField: EduField = { key: 'yearsOfEducation', label: 'Years of Education', type: 'number', placeholder: 'e.g. 10' };
const curriculumField: EduField = { key: 'curriculum', label: 'Curriculum', type: 'select', options: CURRICULUM_OPTIONS };

const schoolNameField: EduField = { key: 'institutionName', label: 'School Name', type: 'text', placeholder: 'e.g. Delhi Public School', wide: true };

export const QUALIFICATION_FIELDS: Record<Qualification, EduField[]> = {
  '12th': [
    schoolNameField,
    curriculumField,
    cgpaField,
    startedYearField,
    completionYearField,
    yearsOfEducationField,
    { key: 'markCertificate', label: '12th Mark Certificate', type: 'file' }
  ],
  Diploma: [
    { key: 'institutionName', label: 'College Name', type: 'text', placeholder: 'e.g. Government Polytechnic College', wide: true },
    { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Mechanical Engineering' },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField
  ],
  "Bachelor's Degree": [
    { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. B.Tech, B.Sc, B.Com' },
    { key: 'specialization', label: 'Specialization / Major', type: 'text', placeholder: 'e.g. Computer Science' },
    { key: 'institutionName', label: 'University / College Name', type: 'select', options: UNIVERSITY_OPTIONS, wide: true },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField,
    yearsOfEducationField
  ],
  "Master's Degree": [
    { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. M.Tech, M.Sc, MBA' },
    { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Data Science' },
    { key: 'institutionName', label: 'University Name', type: 'select', options: UNIVERSITY_OPTIONS, wide: true },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField,
    yearsOfEducationField
  ]
};

export const ALL_EDU_KEYS: string[] = Array.from(
  new Set(Object.values(QUALIFICATION_FIELDS).flatMap(fields => fields.map(field => field.key)))
);

export const FILE_STATUS_PENDING = 'RESULT_PENDING';
export const FILE_STATUS_LATER = 'UPLOAD_LATER';
