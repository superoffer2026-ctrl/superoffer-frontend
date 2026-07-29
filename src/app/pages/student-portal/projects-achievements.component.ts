import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({
  standalone: true,
  imports: [StudentStepPlaceholderComponent],
  template: `<app-student-step-placeholder [stepNumber]="6" title="Projects & Achievements"
    description="This area will present the student's relevant projects, experience, and achievements."
    icon="PA" [fields]="fields" previousRoute="/student/skills" nextRoute="/student/documents" />`
})
export class ProjectsAchievementsComponent { fields=PROFILE_STEP_FIELDS['projects']; }
