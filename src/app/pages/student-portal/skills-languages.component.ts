import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="5" title="Skills & Languages"
    description="This area will contain the approved skills and language information."
    icon="SL" [fields]="fields" previousRoute="/student/entrance-exams" nextRoute="/student/projects" />`
})
export class SkillsLanguagesComponent { fields=PROFILE_STEP_FIELDS['skills']; }
