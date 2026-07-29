import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversityDataService } from './university-data.service';

@Component({
  selector: 'app-university-pending-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="approval-layout">
      <!-- Top Demo Simulator Toolbar for testing states -->
      <div class="demo-state-toolbar">
        <span>⚡ SuperAdmin Approval State Simulator:</span>
        <button
          type="button"
          class="state-btn"
          [class.active]="dataService.approvalState === 'PENDING'"
          (click)="setApprovalState('PENDING')"
        >
          🟡 Pending Review
        </button>
        <button
          type="button"
          class="state-btn"
          [class.active]="dataService.approvalState === 'APPROVED'"
          (click)="setApprovalState('APPROVED')"
        >
          🟢 Approved & Active
        </button>
        <button
          type="button"
          class="state-btn"
          [class.active]="dataService.approvalState === 'REJECTED'"
          (click)="setApprovalState('REJECTED')"
        >
          🔴 Rejection / Resubmit
        </button>
      </div>

      <div class="approval-container">
        <!-- Main Institutional Header -->
        <header class="approval-header">
          <div class="uni-avatar-badge">
            🏛️
          </div>
          <div>
            <span class="eyebrow">VERIFICATION STATUS</span>
            <h1>{{ dataService.profile.universityName || 'Stanford Global Institute' }}</h1>
            <p>{{ dataService.profile.city }}, {{ dataService.profile.country }} • {{ dataService.profile.universityType }}</p>
          </div>

          <div class="status-pill-box">
            <span class="status-pill pending" *ngIf="dataService.approvalState === 'PENDING'">
              ⏳ Under Admin Review
            </span>
            <span class="status-pill approved" *ngIf="dataService.approvalState === 'APPROVED'">
              ✓ Verified Institution
            </span>
            <span class="status-pill rejected" *ngIf="dataService.approvalState === 'REJECTED'">
              ✕ Re-submission Required
            </span>
          </div>
        </header>

        <!-- STATE 1: PENDING -->
        <div class="status-content-card" *ngIf="dataService.approvalState === 'PENDING'">
          <div class="status-banner pending-banner">
            <div class="banner-icon">⏳</div>
            <div>
              <h3>Institutional Review in Progress</h3>
              <p>
                Our compliance team is verifying your official domain (<strong>{{ dataService.registration.officialEmail }}</strong>)
                and uploaded accreditation certificates. Approvals are typically completed within 24–48 hours.
              </p>
            </div>
          </div>

          <!-- Timeline Component -->
          <div class="timeline-wrapper">
            <h3>Verification Progress Timeline</h3>
            <div class="timeline">
              <div
                *ngFor="let step of dataService.timelineSteps; let i = index"
                class="timeline-item"
                [class.completed]="step.completed"
                [class.current]="step.current"
              >
                <div class="timeline-node">
                  <span *ngIf="step.completed">✓</span>
                  <span *ngIf="!step.completed">{{ i + 1 }}</span>
                </div>
                <div class="timeline-content">
                  <strong>{{ step.title }}</strong>
                  <p>{{ step.description }}</p>
                  <small>{{ step.timestamp }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="approval-footer">
            <p class="help-text">Need priority onboarding or help with documents?</p>
            <button type="button" class="button ghost" (click)="contactSupport()">
              Contact Verification Support
            </button>
          </div>
        </div>

        <!-- STATE 2: APPROVED -->
        <div class="status-content-card" *ngIf="dataService.approvalState === 'APPROVED'">
          <div class="status-banner approved-banner">
            <div class="banner-icon">🎉</div>
            <div>
              <h3>Congratulations! Your Institution is Verified</h3>
              <p>
                SuperAdmin has verified {{ dataService.profile.universityName }}. You now have full access to the Student Marketplace, admissions shortlist management, and invitation dispatching.
              </p>
            </div>
          </div>

          <div class="unlocked-features-grid">
            <div class="feature-item">
              <span class="f-icon">⌕</span>
              <h4>Student Discovery</h4>
              <p>Search 10,000+ AI-ranked student profiles filtered by CGPA, degree, and preferences.</p>
            </div>
            <div class="feature-item">
              <span class="f-icon">✉</span>
              <h4>Admission Invitations</h4>
              <p>Issue formal scholarship and admission offers with transparent criteria tracking.</p>
            </div>
            <div class="feature-item">
              <span class="f-icon">📊</span>
              <h4>Funnel Analytics</h4>
              <p>Monitor offer views, negotiations, acceptances, and enrollment conversions.</p>
            </div>
          </div>

          <div class="approval-footer highlight">
            <button type="button" class="button primary large" (click)="enterDashboard()">
              Open University Dashboard →
            </button>
          </div>
        </div>

        <!-- STATE 3: REJECTED -->
        <div class="status-content-card" *ngIf="dataService.approvalState === 'REJECTED'">
          <div class="status-banner rejected-banner">
            <div class="banner-icon">⚠️</div>
            <div>
              <h3>Action Required: Document Revision Needed</h3>
              <p>
                Our verification team reviewed your application, but requires updated document details before approval can be granted.
              </p>
            </div>
          </div>

          <div class="rejection-reason-box">
            <h4>SuperAdmin Note:</h4>
            <p>"{{ dataService.rejectionReason }}"</p>
          </div>

          <div class="approval-footer">
            <button type="button" class="button ghost" (click)="resubmitDocuments()">
              ← Update & Re-upload Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #f5f8f9;
    }
    .approval-layout {
      min-height: 100vh;
      padding: 30px 20px 60px;
    }
    .demo-state-toolbar {
      max-width: 900px;
      margin: 0 auto 24px;
      background: #0d2d42;
      color: #fff;
      padding: 12px 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 13px;
      font-weight: 700;
    }
    .state-btn {
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .state-btn.active {
      background: #2467e8;
      border-color: #2467e8;
    }
    .approval-container {
      max-width: 900px;
      margin: 0 auto;
    }
    .approval-header {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 18px;
      padding: 30px 35px;
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 24px;
      box-shadow: 0 12px 30px rgba(16, 33, 44, 0.04);
    }
    .uni-avatar-badge {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: #0d2d42;
      color: #79dbc1;
      display: grid;
      place-items: center;
      font-size: 30px;
    }
    .approval-header h1 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 26px;
      letter-spacing: -0.03em;
      margin: 4px 0 2px;
    }
    .approval-header p {
      color: #637482;
      font-size: 13px;
      margin: 0;
    }
    .status-pill-box {
      margin-left: auto;
    }
    .status-pill {
      padding: 8px 16px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 800;
    }
    .status-pill.pending {
      background: #fff2d8;
      color: #906000;
    }
    .status-pill.approved {
      background: #ddf7eb;
      color: #147557;
    }
    .status-pill.rejected {
      background: #ffebe8;
      color: #a93628;
    }
    .status-content-card {
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 18px;
      padding: 35px;
      box-shadow: 0 12px 30px rgba(16, 33, 44, 0.04);
    }
    .status-banner {
      display: flex;
      gap: 18px;
      padding: 24px;
      border-radius: 14px;
      margin-bottom: 30px;
    }
    .status-banner.pending-banner {
      background: #fff9ed;
      border: 1px solid #fce8c5;
    }
    .status-banner.approved-banner {
      background: #eaf8f2;
      border: 1px solid #c2ebd9;
    }
    .status-banner.rejected-banner {
      background: #fff0ee;
      border: 1px solid #f7cdca;
    }
    .banner-icon {
      font-size: 32px;
    }
    .status-banner h3 {
      font-size: 18px;
      margin: 0 0 6px;
      color: #10212c;
    }
    .status-banner p {
      font-size: 14px;
      color: #4a5a66;
      line-height: 1.6;
      margin: 0;
    }
    .timeline-wrapper h3 {
      font-size: 17px;
      margin-bottom: 20px;
      color: #10212c;
    }
    .timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      padding-left: 20px;
    }
    .timeline::before {
      content: "";
      position: absolute;
      left: 37px;
      top: 15px;
      bottom: 25px;
      width: 2px;
      background: #dfe6ea;
    }
    .timeline-item {
      display: flex;
      gap: 20px;
      padding-bottom: 24px;
      position: relative;
    }
    .timeline-node {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #cad6dd;
      color: #637482;
      display: grid;
      place-items: center;
      font-size: 13px;
      font-weight: 800;
      z-index: 2;
    }
    .timeline-item.completed .timeline-node {
      background: #14916d;
      border-color: #14916d;
      color: #fff;
    }
    .timeline-item.current .timeline-node {
      border-color: #2467e8;
      color: #2467e8;
      background: #eaf5ff;
    }
    .timeline-content strong {
      font-size: 15px;
      color: #10212c;
      display: block;
    }
    .timeline-content p {
      font-size: 13px;
      color: #637482;
      margin: 3px 0 4px;
    }
    .timeline-content small {
      font-size: 11px;
      color: #8b9aa4;
      font-weight: 600;
    }
    .unlocked-features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 30px;
    }
    .feature-item {
      padding: 20px;
      border: 1px solid #dfe6ea;
      border-radius: 12px;
      background: #f7fafb;
    }
    .f-icon {
      font-size: 24px;
      color: #14916d;
      margin-bottom: 8px;
      display: block;
    }
    .feature-item h4 {
      font-size: 15px;
      margin: 0 0 6px;
      color: #10212c;
    }
    .feature-item p {
      font-size: 12px;
      color: #637482;
      line-height: 1.5;
      margin: 0;
    }
    .rejection-reason-box {
      background: #fff5f5;
      border-left: 4px solid #a1372c;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .rejection-reason-box h4 {
      margin: 0 0 6px;
      color: #a1372c;
    }
    .rejection-reason-box p {
      margin: 0;
      color: #5c2018;
      font-size: 14px;
      font-style: italic;
    }
    .approval-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #dfe6ea;
    }
    .approval-footer.highlight {
      justify-content: center;
    }
    .help-text {
      color: #637482;
      font-size: 13px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .approval-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .status-pill-box {
        margin-left: 0;
      }
      .unlocked-features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UniversityPendingApprovalComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  constructor(public dataService: UniversityDataService) {}

  setApprovalState(state: 'PENDING' | 'APPROVED' | 'REJECTED') {
    this.dataService.approvalState = state;
    this.dataService.saveState();
  }

  contactSupport() {
    alert('Support ticket created. Verification agent assigned.');
  }

  resubmitDocuments() {
    this.dataService.currentStep = 4;
    this.prevStep.emit();
  }

  enterDashboard() {
    this.dataService.currentStep = 6;
    this.dataService.saveState();
    this.nextStep.emit();
  }
}
