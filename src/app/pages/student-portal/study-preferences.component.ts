import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="3" title="Study Preferences"
    description="This area will capture the student's study interests after the business team confirms the required information."
    icon="SP" [fields]="fields" previousRoute="/student/academic-information" nextRoute="/student/entrance-exams" />`
})
export class StudyPreferencesComponent { fields=PROFILE_STEP_FIELDS['preferences']; }
