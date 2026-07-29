import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="4" title="Entrance Exams"
    description="This area will contain applicable entrance and language examination details."
    icon="EX" [fields]="fields" previousRoute="/student/study-preferences" nextRoute="/student/skills" />`
})
export class EntranceExamsComponent { fields=PROFILE_STEP_FIELDS['exams']; }
