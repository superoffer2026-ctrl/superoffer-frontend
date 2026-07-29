import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="2" title="Academic Information"
    description="This area will be structured around the student's confirmed academic profile requirements."
    icon="AC" [fields]="fields" previousRoute="/student/personal-information" nextRoute="/student/study-preferences" />`
})
export class AcademicInformationComponent { fields=PROFILE_STEP_FIELDS['academic']; }
