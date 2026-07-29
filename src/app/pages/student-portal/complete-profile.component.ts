import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="9" title="Complete Profile"
    description="The profile UI journey is complete. Continue to preview the student offers workspace."
    icon="OK" [fields]="fields" previousRoute="/student/review" nextRoute="/student/offers" nextLabel="View Offers" />`
})
export class CompleteProfileComponent { fields=PROFILE_STEP_FIELDS['completion']; }
