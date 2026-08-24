/**
 * Qualification levels, curriculum/university/year option lists, and education-gap
 * options used to live here as static data. They're now served by the backend
 * (`GET /api/v1/reference/academic-information`) as the single source of truth,
 * shared with the backend's own DTO validator — see components/student/AcademicInformation.tsx.
 * Only the shared types stay here.
 */
export type Qualification = '11th' | '12th' | 'Diploma' | "Bachelor's Degree" | "Master's Degree" | 'PhD';

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
