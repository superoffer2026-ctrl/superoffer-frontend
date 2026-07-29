import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="7" title="Documents Upload"
    description="This area will contain the document upload interface after document requirements are confirmed."
    icon="DU" [fields]="fields" previousRoute="/student/projects" nextRoute="/student/review" />`
})
export class DocumentsUploadComponent { fields=PROFILE_STEP_FIELDS['documents']; }
