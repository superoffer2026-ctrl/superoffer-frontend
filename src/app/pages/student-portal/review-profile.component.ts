import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="8" title="Review Profile"
    description="This area will provide a clear summary of the student's profile before completion."
    icon="RV" [fields]="fields" previousRoute="/student/documents" nextRoute="/student/completion" />`
})
export class ReviewProfileComponent { fields=PROFILE_STEP_FIELDS['review']; }
