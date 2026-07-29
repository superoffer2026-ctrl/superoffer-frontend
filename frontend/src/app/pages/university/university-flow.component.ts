import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversityDataService } from './university-data.service';
import { UniversityRegistrationComponent } from './university-registration.component';
import { UniversityEmailVerificationComponent } from './university-email-verification.component';
import { UniversityProfileSetupComponent } from './university-profile-setup.component';
import { UniversityDocumentUploadComponent } from './university-document-upload.component';
import { UniversityPendingApprovalComponent } from './university-pending-approval.component';
import { UniversityDashboardComponent } from './university-dashboard.component';

@Component({
  selector: 'app-university-flow',
  standalone: true,
  imports: [
    CommonModule,
    UniversityRegistrationComponent,
    UniversityEmailVerificationComponent,
    UniversityProfileSetupComponent,
    UniversityDocumentUploadComponent,
    UniversityPendingApprovalComponent,
    UniversityDashboardComponent
  ],
  template: `
    <div class="uni-module-root">
      <!-- Step Navigation Bar (Visible during onboarding steps 1-5) -->
      <header class="flow-header" *ngIf="dataService.currentStep < 6">
        <div class="flow-header-container">
          <div class="flow-brand">
            <a class="brand dark-brand">
              <span>S</span>SuperOffer
            </a>
            <span class="flow-subtitle">University Onboarding</span>
          </div>

          <!-- Step Breadcrumbs -->
          <nav class="flow-breadcrumbs">
            <button
              *ngFor="let stepItem of steps; let i = index"
              class="crumb-btn"
              [class.active]="dataService.currentStep === i + 1"
              [class.completed]="dataService.currentStep > i + 1"
              (click)="goToStep(i + 1)"
            >
              <span class="crumb-node">{{ dataService.currentStep > i + 1 ? '✓' : i + 1 }}</span>
              <span class="crumb-label">{{ stepItem.label }}</span>
            </button>
          </nav>
        </div>
      </header>

      <!-- Active Screen Rendering -->
      <main class="flow-main-content">
        <!-- Screen 1: Registration -->
        <app-university-registration
          *ngIf="dataService.currentStep === 1"
          (nextStep)="onNext()"
        ></app-university-registration>

        <!-- Screen 2: Email Verification -->
        <app-university-email-verification
          *ngIf="dataService.currentStep === 2"
          (nextStep)="onNext()"
          (prevStep)="onPrev()"
        ></app-university-email-verification>

        <!-- Screen 3: University Profile -->
        <app-university-profile-setup
          *ngIf="dataService.currentStep === 3"
          (nextStep)="onNext()"
          (prevStep)="onPrev()"
        ></app-university-profile-setup>

        <!-- Screen 4: Upload Documents -->
        <app-university-document-upload
          *ngIf="dataService.currentStep === 4"
          (nextStep)="onNext()"
          (prevStep)="onPrev()"
        ></app-university-document-upload>

        <!-- Screen 5: Pending Approval -->
        <app-university-pending-approval
          *ngIf="dataService.currentStep === 5"
          (nextStep)="onNext()"
          (prevStep)="onPrev()"
        ></app-university-pending-approval>

        <!-- Screen 6: University Dashboard -->
        <app-university-dashboard
          *ngIf="dataService.currentStep === 6"
          (logout)="resetFlow()"
        ></app-university-dashboard>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #fff;
    }
    .uni-module-root {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .flow-header {
      background: #0d2d42;
      color: #fff;
      padding: 14px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      sticky: top;
      z-index: 40;
    }
    .flow-header-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .flow-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .flow-subtitle {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #79dbc1;
      background: rgba(121, 219, 193, 0.15);
      padding: 4px 10px;
      border-radius: 99px;
    }
    .flow-breadcrumbs {
      display: flex;
      gap: 8px;
    }
    .crumb-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      border: none;
      background: transparent;
      color: #a8bdc8;
      font-size: 12px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 99px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .crumb-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
    .crumb-btn.active {
      background: #2467e8;
      color: #fff;
    }
    .crumb-btn.completed {
      color: #79dbc1;
    }
    .crumb-node {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      display: grid;
      place-items: center;
      font-size: 11px;
      font-weight: 900;
    }
    .crumb-btn.active .crumb-node {
      background: #fff;
      color: #2467e8;
    }
    .crumb-btn.completed .crumb-node {
      background: rgba(121, 219, 193, 0.25);
      color: #79dbc1;
    }
    .flow-main-content {
      flex: 1;
    }

    @media (max-width: 900px) {
      .flow-breadcrumbs {
        display: none;
      }
    }
  `]
})
export class UniversityFlowComponent {
  steps = [
    { label: 'Registration' },
    { label: 'Verification' },
    { label: 'Profile' },
    { label: 'Documents' },
    { label: 'Approval' },
    { label: 'Dashboard' }
  ];

  constructor(public dataService: UniversityDataService) {}

  onNext() {
    this.dataService.saveState();
  }

  onPrev() {
    this.dataService.saveState();
  }

  goToStep(stepNumber: number) {
    this.dataService.currentStep = stepNumber;
    this.dataService.saveState();
  }

  resetFlow() {
    this.dataService.currentStep = 1;
    this.dataService.approvalState = 'PENDING';
    this.dataService.saveState();
  }
}
