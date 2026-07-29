import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="1" title="Personal Information"
    description="This area will contain the student's personal and contact information after the required fields are confirmed."
    icon="ID" [fields]="fields" nextRoute="/student/academic-information" />`
})
export class PersonalInformationComponent { fields=PROFILE_STEP_FIELDS['personal']; }
