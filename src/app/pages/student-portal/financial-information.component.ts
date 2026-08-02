import { Component } from '@angular/core';
import { StudentStepPlaceholderComponent } from './student-step-placeholder.component';
import { PROFILE_STEP_FIELDS } from './student-portal.models';

@Component({standalone:true,imports:[StudentStepPlaceholderComponent],template:`<app-student-step-placeholder [stepNumber]="7" title="Financial Information" description="Share an indicative affordability profile with verified universities and finance partners." icon="FI" [fields]="fields" previousRoute="/student/entrance-exams" nextRoute="/student/documents" />`})
export class FinancialInformationComponent{fields=PROFILE_STEP_FIELDS['financial'];}
