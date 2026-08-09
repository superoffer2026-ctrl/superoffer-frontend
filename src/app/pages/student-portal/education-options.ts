import { UNIVERSITY_OPTIONS } from './university-options';

export type Qualification = '11th' | '12th' | 'Diploma' | "Bachelor's Degree" | "Master's Degree" | 'PhD';

export const QUALIFICATION_OPTIONS: Qualification[] = [
  '11th', '12th', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD'
];

export const CURRICULUM_OPTIONS: string[] = ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE', 'NIOS', 'Other'];

export const EDUCATION_GAP_OPTIONS: string[] = [
  'No Gap', '1 Year', '2 Years', '3 Years', '4 Years', '5 Years',
  '6 Years', '7 Years', '8 Years', '9 Years', '10 Years', 'More than 10 Years'
];

// Easy to extend — covers a broad academic history plus near-future completion.
export const EDUCATION_YEARS: string[] = Array.from({ length: 41 }, (_, i) => String(2030 - i));

export type EduFieldType = 'select' | 'text' | 'number';

export interface EduField {
  key: string;
  label: string;
  type: EduFieldType;
  options?: string[];
  placeholder?: string;
  wide?: boolean;
  /** For 'select' fields: lets the student type a value that isn't in the options list. */
  allowCustom?: boolean;
}

const cgpaField: EduField = { key: 'cgpa', label: 'CGPA / Percentage', type: 'text', placeholder: 'e.g. 8.7 CGPA or 85%' };
const backlogsField: EduField = { key: 'backlogs', label: 'Number of Backlogs', type: 'number', placeholder: '0' };
const startedYearField: EduField = { key: 'startedYear', label: 'Started Year', type: 'select', options: EDUCATION_YEARS };
const completionYearField: EduField = { key: 'completionYear', label: 'Completion Year', type: 'select', options: EDUCATION_YEARS };
const yearsOfEducationField: EduField = { key: 'yearsOfEducation', label: 'Years of Education', type: 'number', placeholder: 'e.g. 10' };
const curriculumField: EduField = { key: 'curriculum', label: 'Curriculum', type: 'select', options: CURRICULUM_OPTIONS };

export const QUALIFICATION_FIELDS: Record<Qualification, EduField[]> = {
  '11th': [
    curriculumField,
    cgpaField,
    startedYearField,
    completionYearField
  ],
  '12th': [
    curriculumField,
    cgpaField,
    startedYearField,
    completionYearField
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
    { key: 'institutionName', label: 'University / College Name', type: 'select', options: UNIVERSITY_OPTIONS, wide: true, allowCustom: true },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField,
    yearsOfEducationField
  ],
  "Master's Degree": [
    { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. M.Tech, M.Sc, MBA' },
    { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Data Science' },
    { key: 'institutionName', label: 'University Name', type: 'select', options: UNIVERSITY_OPTIONS, wide: true, allowCustom: true },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField,
    yearsOfEducationField
  ],
  PhD: [
    { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. PhD in Computer Science' },
    { key: 'specialization', label: 'Research Area', type: 'text', placeholder: 'e.g. Machine Learning' },
    { key: 'institutionName', label: 'University Name', type: 'select', options: UNIVERSITY_OPTIONS, wide: true, allowCustom: true },
    cgpaField,
    backlogsField,
    startedYearField,
    completionYearField,
    yearsOfEducationField
  ]
};
