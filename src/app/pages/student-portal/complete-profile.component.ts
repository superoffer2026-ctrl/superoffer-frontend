import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="9" title="Complete Profile"
    description="Your profile is complete. Continue to your student dashboard."
    icon="OK" [fields]="fields" previousRoute="/student/review" nextRoute="/student/dashboard" nextLabel="Go to Dashboard" />`
})
export class CompleteProfileComponent { fields=PROFILE_STEP_FIELDS['completion']; }
