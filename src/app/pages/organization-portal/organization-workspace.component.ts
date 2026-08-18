import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationType } from '../../core/organization.models';
import { SubmittedStudentsStore } from '../../core/submitted-students.store';

type Role = OrganizationType;
type OrganizationView = 'dashboard' | 'students' | 'shortlists' | 'invitations' | 'catalog' | 'templates' | 'criteria' | 'reports' | 'notifications' | 'subscription' | 'profile' | 'settings';
type OfferStatus = 'Sent' | 'Viewed' | 'Negotiating' | 'Accepted' | 'Rejected' | 'Withdrawn' | 'Expired';
type BankEvaluationMode = 'ACADEMIC_ONLY' | 'UNIVERSITY_OFFER_ONLY' | 'ACADEMIC_AND_OFFER';
type UniversityOfferStatus = 'Offer Sent' | 'Shortlisted' | 'Selected' | 'Admitted';
type SettingsTab = 'org' | 'subscription' | 'accreditation' | 'team' | 'notifications' | 'security';

const BANK_EVALUATION_MODE_KEY = 'superoffer_bank_evaluation_mode';

interface NegotiationMessage { from: 'institution' | 'student'; author: string; body: string; time: string; }

interface Offer {
  student: string; initials: string; course: string; deadline: string; status: OfferStatus; sent: string; sentAt?: number; responseHours?: number;
  scholarship?: string; tuition?: string; accommodation?: string;
  loanAmount?: string; interestRate?: string; emi?: string; processingFee?: string; tenure?: string; conditions?: string;
  offerType?: 'PreApproved' | 'Final'; productName?: string;
  negotiationMessages?: NegotiationMessage[];
}

interface UniversityInterest {
  university: string; country: string; course: string; status: UniversityOfferStatus;
  scholarship?: string; tuitionFee?: string; remainingTuition?: string; livingCost?: string; logo?: string;
}

interface Product {
  id: string; name: string; category?: string; degreeLevel: 'Undergraduate' | 'Postgraduate'; course: string; country: string;
  intakes: string[]; tuitionFee: string; scholarshipRange: string; durationYears: number; seats: number | 'Rolling';
  minCgpa?: number; englishTest?: string; minEnglishScore?: number; preferredCurricula?: string; targetCountries?: string;
  templates?: any[];
  url?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  inviteNote?: string;
  templateName?: string;
}

interface LoanProduct {
  id: string; name: string; category?: string; interestRateMin: number; interestRateMax: number; currency: string; maxAmount: string;
  tenureOptions: number[]; collateralRequired: boolean; eligibleCountries: string[];
  guarantorRequired?: boolean; maxFamilyIncome?: number;
  templates?: any[];
  url?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  inviteNote?: string;
  templateName?: string;
}

interface OfferTemplate { id: string; name: string; description: string; terms: Record<string, any>; usedCount: number; }

interface UniversityCriteria { minCgpa: number; minEnglishScore: number; englishTest: string; preferredCurricula: string; targetCountries: string; }
interface BankCriteria { guarantorRequired: boolean; maxFamilyIncome: number; eligibleCountries: string; }
interface TeamMember { initials: string; name: string; email: string; role: string; status: 'Active' | 'Invited'; isSelf?: boolean; }

const ROLE_CONFIG: Record<Role, any> = {
  UNIVERSITY: {
    logoSrc: '/university-logo.png', logoAlt: 'SuperOffer University',
    brandLabel: 'SuperOffer University', orgInitials: 'NU', orgLabel: 'University',
    userName: 'Aisha Malik', userTitle: 'Admissions Officer', userInitials: 'AM',
    cycleLabel: 'recruitment cycle', createActionLabel: 'Send admission terms',
    searchEyebrow: 'STUDENT DISCOVERY', searchTitle: 'Find best-fit students',
    searchIntro: 'Browse verified student profiles ranked by compatibility with your products.',
    subscriptionIntro: 'Increase the number of student profiles your university can review and invite this cycle.',
    offerVerb: 'offer', offerNoun: 'admission and scholarship proposal', offerEyebrow: 'admission',
    orgFieldLabel: 'University name', orgTypeOptions: ['Private university'],
    orgNameDefault: 'Northbridge University', orgDomainDefault: 'northbridge.edu', orgCityDefault: 'Toronto, Canada',
    orgDescriptionDefault: 'Internationally focused university offering career-led postgraduate products.',
    profileTabLabel: 'University Profile',
    catalogEyebrow: 'PRODUCT CATALOG', catalogTitle: 'Products', catalogIntro: 'Maintain the products you recruit for — these power search filters and match scoring.',
    templatesEyebrow: 'OFFER TEMPLATES', templatesTitle: 'Offer templates', templatesIntro: 'Start an invitation from a reusable template instead of building terms from scratch every time.',
    criteriaEyebrow: 'ADMISSION CRITERIA', criteriaTitle: 'Admission criteria', criteriaIntro: 'Set the academic thresholds AI Matching uses to rank students against your products.',
    reportsEyebrow: 'REPORTS', reportsTitle: 'Admissions funnel', reportsIntro: 'Track how invitations move from sent to accepted, and which products convert best.',
    weightFactors: [
      { label: 'Academic fit', weight: 35 },
      { label: 'Test score fit', weight: 20 },
      { label: 'Course alignment', weight: 20 },
      { label: 'Country & intake', weight: 15 },
      { label: 'Budget & scholarship fit', weight: 10 }
    ]
  },
  BANK: {
    logoSrc: '/university-logo.png', logoAlt: 'SuperOffer Finance',
    brandLabel: 'SuperOffer Finance', orgInitials: 'EF', orgLabel: 'Lender',
    userName: 'Rohan Kapoor', userTitle: 'Loan Manager', userInitials: 'RK',
    cycleLabel: 'lending cycle', createActionLabel: 'Send loan terms',
    searchEyebrow: 'STUDENT DISCOVERY', searchTitle: 'Find loan-ready students',
    searchIntro: 'Browse verified student profiles ranked by compatibility and financial eligibility.',
    subscriptionIntro: 'Increase the number of student profiles your organisation can review and invite this cycle.',
    offerVerb: 'loan offer', offerNoun: 'education loan proposal', offerEyebrow: 'loan',
    orgFieldLabel: 'Organisation name', orgTypeOptions: ['Bank', 'NBFC', 'Specialised lender'],
    orgNameDefault: 'EduFund Finance', orgDomainDefault: 'edufund.example', orgCityDefault: 'Mumbai, India',
    orgDescriptionDefault: 'A verified education-finance partner helping students fund international study plans.',
    profileTabLabel: 'Organisation Profile',
    catalogEyebrow: 'LOAN PRODUCTS', catalogTitle: 'Loan products', catalogIntro: 'Maintain the loan products you lend against — these power search filters and match scoring.',
    templatesEyebrow: 'OFFER TEMPLATES', templatesTitle: 'Offer templates', templatesIntro: 'Start a loan invitation from a reusable template instead of building terms from scratch every time.',
    criteriaEyebrow: 'ELIGIBILITY CRITERIA', criteriaTitle: 'Eligibility criteria', criteriaIntro: 'Set the admission-status, guarantor and country rules AI Matching uses to rank applicants.',
    reportsEyebrow: 'REPORTS', reportsTitle: 'Lending funnel', reportsIntro: 'Track how loan invitations move from sent to accepted, and which rates convert best.',
    weightFactors: [
      { label: 'Financial need fit', weight: 40 },
      { label: 'Admission status fit', weight: 25 },
      { label: 'Country eligibility', weight: 20 },
      { label: 'Guarantor completeness', weight: 15 }
    ]
  }
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../organization-portal.css',
  template: `
    <div class="uni-shell">
      <aside class="uni-sidebar">
        <button class="uni-brand workspace-logo" type="button" (click)="go('dashboard')" aria-label="SuperOffer">S</button>
        <nav>
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id" (click)="go(item.id)" [title]="navLabel(item.id)" [attr.aria-label]="navLabel(item.id)">
            <span class="nav-icon" [ngSwitch]="item.id">
              <svg *ngSwitchCase="'dashboard'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
              <svg *ngSwitchCase="'students'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <svg *ngSwitchCase="'templates'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <svg *ngSwitchCase="'notifications'" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </span>
            <strong>{{navLabel(item.id)}}</strong>
          </button>
        </nav>
        <button class="uni-user workspace-avatar" type="button" [class.active]="view==='profile' || view==='settings'" (click)="go('profile')" title="Organisation profile" aria-label="Organisation profile"><span>{{cfg.userInitials}}</span></button>
      </aside>

      <!-- ============================================================
           UNIFIED 3-COLUMN WORKSPACE: EXACT DESIGN PARITY WITH STUDENT OFFERS
           ============================================================ -->
      <main class="offer-workspace-page" *ngIf="view==='students' || view==='shortlists' || view==='invitations'">
        <section class="offer-workspace">
          <!-- COLUMN 1: CANDIDATES & APPLICANTS FEED -->
          <aside class="offer-mailbox">
            <header class="mailbox-toolbar">
              <button class="all-offers-reset" type="button" (click)="workspaceFilter='All'">
                <strong>{{ role==='BANK' ? 'Student Loan Applicants' : 'Candidates & Offers' }}</strong>
                <small>{{workspaceOffers.length}} candidates to review</small>
              </button>
              <div class="compact-offer-filters">
                <button type="button" [class.active]="workspaceFilter==='All'" (click)="workspaceFilter='All'">All <b>{{workspaceOffers.length}}</b></button>
                <button type="button" [class.active]="workspaceFilter==='Accepted'" (click)="workspaceFilter='Accepted'">Invited <b>{{countWorkspaceOffers('Accepted')}}</b></button>
                <button type="button" [class.active]="workspaceFilter==='Shortlisted'" (click)="workspaceFilter='Shortlisted'">Shortlisted <b>{{countWorkspaceOffers('Shortlisted')}}</b></button>
                <button type="button" [class.active]="workspaceFilter==='Rejected'" (click)="workspaceFilter='Rejected'">Rejected <b>{{countWorkspaceOffers('Rejected')}}</b></button>
              </div>
            </header>

            <button class="offer-mail-item" *ngFor="let cand of filteredWorkspaceOffers"
              [class.selected]="cand.id===selectedOfferItem.id" (click)="selectOffer(cand)">
              <span class="logo candidate-avatar-badge" [style.background]="cand.avatarColor">
                {{cand.initials}}
              </span>
              <span class="mail-offer-main">
                <div><small>{{cand.matchBadge}}</small><time>{{cand.received}}</time></div>
                <strong>{{cand.name}}</strong>
                <p>{{cand.course}} · {{cand.targetCountry}}</p>
                <b>{{cand.headline}}</b>
              </span>
              <i *ngIf="cand.status==='Pending'"></i>
            </button>
          </aside>

          <!-- COLUMN 2 & 3: READING PANE & LIVE NEGOTIATION -->
          <section class="offer-reading-pane" *ngIf="selectedOfferItem">
            <!-- COLUMN 2: CANDIDATE PROFILE & OFFER DETAILS -->
            <div class="offer-details-column">
              <header class="reading-pane-header">
                <div class="reading-institution">
                  <img *ngIf="selectedOfferItem.avatarUrl" [src]="selectedOfferItem.avatarUrl" alt="Profile" class="logo candidate-avatar-badge" style="object-fit: cover;">
                  <span *ngIf="!selectedOfferItem.avatarUrl" class="logo candidate-avatar-badge" [style.background]="selectedOfferItem.avatarColor">
                    {{selectedOfferItem.initials}}
                  </span>
                  <div style="display: flex; flex-direction: column; justify-content: center;">
                    <h2 style="margin: 0 0 4px 0; line-height: 1;">{{selectedOfferItem.name}}</h2>
                    <p class="reading-course" style="font-size: 14px; margin: 0; color: #3f4d46; line-height: 1;">{{selectedOfferItem.course}}</p>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; margin-left: auto;">
                  <button type="button" class="secondary-btn shortlist-action" title="Shortlist"
                          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px;" 
                          [class.chosen]="selectedOfferItem.status==='Shortlisted'" 
                          (click)="setOfferStatus(selectedOfferItem, selectedOfferItem.status==='Shortlisted' ? 'Pending' : 'Shortlisted')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </button>
                  <button type="button" class="secondary-btn reject-action" title="Reject"
                          style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center; border-radius: 6px; color: #a13d3d;" 
                          [class.chosen]="selectedOfferItem.status==='Rejected'" 
                          (click)="setOfferStatus(selectedOfferItem, 'Rejected')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                  <button type="button" class="secondary-btn" style="padding: 6px 16px; height: 32px; font-size: 13px; font-weight: 700; color: #087a50; border-color: #087a50;" (click)="openProductInviteModal()">Product Invite</button>
                  <button type="button" class="primary-btn" style="padding: 6px 16px; height: 32px; font-size: 13px; display: flex; align-items: center; gap: 4px;" (click)="sendCandidateInvite(selectedOfferItem)">
                    <svg *ngIf="selectedOfferItem.status!=='Accepted'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                    </svg>
                    <span>{{selectedOfferItem.status==='Accepted' ? '✓ Invite Sent' : 'Invite'}}</span>
                  </button>
                </div>
              </header>

              <div class="reading-pane-scroll">
                <!-- HERO KEY TERMS -->
                <section class="offer-detail-hero">
                  <small>{{role==='BANK' ? 'FINANCIAL ASSESSMENT & LOAN PROPOSAL' : 'ACADEMIC & SCHOLARSHIP EVALUATION'}}</small>
                  <h1>{{selectedOfferItem.headline}}</h1>
                  <div class="offer-key-terms">
                    <div><small>{{role==='BANK' ? 'TARGET COURSE' : 'PRODUCT'}}</small><strong>{{selectedOfferItem.course}}</strong></div>
                    <div><small>{{selectedOfferItem.offerValueLabel | uppercase}}</small><strong>{{selectedOfferItem.offerValue}}</strong></div>
                    <div><small>TARGET INTAKE</small><strong>{{selectedOfferItem.intake}}</strong></div>
                    <div><small>DECISION BY</small><strong>{{selectedOfferItem.deadline}}</strong></div>
                  </div>
                </section>

                <!-- STUDY PREFERENCES -->
                <section class="offer-conditions" style="margin-top:0; padding-bottom: 8px;">
                  <h3 style="margin-bottom: 12px; color: #172019;">Study Intent & Preferences</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;text-transform:uppercase;">Which country to study in?</small><strong style="font-size:13px;color:#172019;">{{selectedOfferItem.targetCountry}}</strong></div>
                    <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;text-transform:uppercase;">What to study / Product</small><strong style="font-size:13px;color:#172019;">{{selectedOfferItem.course}}</strong></div>
                    <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;text-transform:uppercase;">When / Intake</small><strong style="font-size:13px;color:#172019;">{{selectedOfferItem.intake}}</strong></div>
                    <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;text-transform:uppercase;">Future Study Interests</small><strong style="font-size:13px;color:#172019;">{{selectedOfferItem.futureInterests}}</strong></div>
                  </div>
                </section>

                <!-- 4-METRICS ACADEMIC SUMMARY -->
                <section class="candidate-academic-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:12px 14px;background:#f6f9f7;border:1px solid #dfe6e1;border-radius:10px;margin-top:2px;">
                  <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;">CGPA / MARKS</small><strong style="font-size:14px;color:#172019;">{{selectedOfferItem.cgpa}}</strong></div>
                  <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;">TEST SCORES</small><strong style="font-size:14px;color:#172019;">{{selectedOfferItem.examScore}}</strong></div>
                  <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;">BUDGET</small><strong style="font-size:14px;color:#172019;">{{selectedOfferItem.budget}}</strong></div>
                  <div><small style="font-size:10px;color:#6b7871;font-weight:700;display:block;margin-bottom:3px;">VERIFIED DOCS</small><strong style="font-size:14px;color:#087a50;">{{selectedOfferItem.documentsVerified}}/5 Verified</strong></div>
                </section>

                <!-- CANDIDATE BIO & SKILLS -->
                <section class="offer-conditions">
                  <div>
                    <h3 style="margin-bottom: 8px;">Experience & Recognition</h3>
                    <p>{{selectedOfferItem.bio}}</p>
                    <h3 style="margin-top: 16px; margin-bottom: 8px;">Skills & Communication</h3>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                      <span *ngFor="let sk of selectedOfferItem.skills" style="background:#eef5f1;color:#087a50;font-size:11px;font-weight:700;padding:3px 9px;border-radius:999px;border:1px solid #d5e5dc;">{{sk}}</span>
                    </div>
                  </div>
                  <button type="button" (click)="notify('Opening verified student documents')">View verified dossier →</button>
                </section>

                <!-- OFFER CONDITIONS -->
                <section class="offer-conditions" style="margin-top:0;">
                  <div>
                    <h3>Terms & Requirements</h3>
                    <p>{{selectedOfferItem.conditions}}</p>
                  </div>
                  <button type="button" (click)="notify('Viewing full terms')">Edit offer terms →</button>
                </section>

                <!-- NEXT STEPS CHECKLIST -->
                <section class="offer-next-steps">
                  <div><small>ACTION CHECKLIST</small><strong>To progress this candidate</strong></div>
                  <ul><li *ngFor="let step of selectedOfferItem.nextSteps">{{step}}</li></ul>
                </section>
              </div>

            </div>

            <!-- COLUMN 3: DIRECT STUDENT MESSAGING -->
            <section class="offer-conversation">
              <header class="conversation-head">
                <div class="chat-contact">
                  <span class="logo candidate-avatar-badge" [style.background]="selectedOfferItem.avatarColor">{{selectedOfferItem.initials}}</span>
                  <div>
                    <h3>{{selectedOfferItem.name}}</h3>
                    <p>Candidate · {{selectedOfferItem.course}}</p>
                    <small><i></i> Online & Active</small>
                  </div>
                </div>
                <button class="conversation-options" type="button" aria-label="Conversation options" (click)="notify('Conversation options')">•••</button>
              </header>
              <div class="message-thread">
                <div *ngFor="let message of selectedOfferItem.messages" [class.student-message]="message.from==='institution'">
                  <span>{{message.from==='institution' ? 'YOU' : selectedOfferItem.initials}}</span>
                  <div><strong>{{message.author}}</strong><p>{{message.body}}</p><small>{{message.time}}</small></div>
                </div>
              </div>
              <form class="message-composer" (ngSubmit)="sendChatMessage()">
                <button type="button" aria-label="Attach file" (click)="notify('Attachment picker')">＋</button>
                <input name="chatDraft" [(ngModel)]="chatDraft" placeholder="Message {{selectedOfferItem.name}}…" autocomplete="off">
                <button class="primary-btn" [disabled]="!chatDraft.trim()" type="submit">Send</button>
              </form>
            </section>
          </section>
        </section>
      </main>

      <!-- STANDARD VIEW MAIN FOR DASHBOARD, TEMPLATES, NOTIFICATIONS, PROFILE -->
      <main class="uni-main" *ngIf="view!=='students' && view!=='shortlists' && view!=='invitations'">
        <section class="uni-view" *ngIf="view==='dashboard' || view==='reports'">
          <div class="uni-metrics">
            <article><span>CURRENT SUBSCRIPTION</span><strong>{{currentPlan}}</strong><small>{{planQuotaLabel}} profiles / cycle</small></article>
            <article><span>PROFILES VIEWED</span><strong>{{profilesViewed}}</strong><small>this {{cfg.cycleLabel}}</small></article>
            <article><span>ACCEPTANCE RATE</span><strong>{{acceptanceRate}}%</strong><small>{{avgResponseTime}} avg response</small></article>
            <article><span>ACTIVE OFFERS</span><strong>{{activeOffersCount}}</strong><small>awaiting student response</small></article>
          </div>

          <section class="uni-card quick-actions-card">
            <header><div><span>QUICK ACTIONS</span><h2>Move your pipeline forward</h2></div></header>
            <div class="quick-actions">
              <button type="button" class="quick-action" (click)="go('students')">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                <div><strong>Browse Students</strong><small>Discover best-fit candidates</small></div>
              </button>
              <button type="button" class="quick-action" (click)="openOfferComposer()">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span>
                <div><strong>Create Offer</strong><small>{{cfg.createActionLabel}}</small></div>
              </button>
              <button type="button" class="quick-action" (click)="go('subscription')">
                <span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
                <div><strong>Manage Plan</strong><small>{{remainingCredits}} credits remaining</small></div>
              </button>
            </div>
          </section>

          <!-- Conversion Funnel (Merged from Reports) -->
          <section class="uni-card uni-funnel-chart">
            <header><div><span>CONVERSION FUNNEL</span><h2>Sent → Viewed → Negotiating → Accepted</h2><p>Real-time candidate progression through each stage.</p></div></header>
            <div *ngFor="let stage of funnelStages"><span>{{stage.label}}</span><i><b [style.width.%]="stage.percent">{{stage.count}}</b></i><small>{{stage.percent}}%</small></div>
          </section>

          <!-- Performance & Conversion Insights (Merged from Reports) -->
          <div class="report-grid">
            <article class="uni-card">
              <header style="padding: 20px 24px 10px; border-bottom: 0;">
                <div><span>{{role==='BANK' ? 'RATE SENSITIVITY' : 'PERFORMANCE'}}</span><h2 style="font-size:18px;">{{role==='BANK' ? 'Rate sensitivity' : 'Product performance'}}</h2><p style="font-size:13px; color:#7a8680; margin:3px 0 0;">Acceptance rate by {{role==='BANK'?'interest rate band':'product'}}</p></div>
              </header>
              <div class="bar-chart">
                <span *ngFor="let bar of performanceBars"><i [style.height.%]="bar.percent"></i><b>{{bar.percent}}%</b><small>{{bar.label}}</small></span>
              </div>
            </article>
            <article class="uni-card">
              <header style="padding: 20px 24px 10px; border-bottom: 0;">
                <div><span>INSIGHTS</span><h2 style="font-size:18px;">{{role==='BANK' ? 'Terms vs. acceptance' : 'Best converting match bands'}}</h2><p style="font-size:13px; color:#7a8680; margin:3px 0 0;">Key drivers of student offer acceptance</p></div>
              </header>
              <ol style="list-style:none; padding:0 24px 20px; margin:0; display:flex; flex-direction:column; gap:12px;">
                <li *ngFor="let row of rankedInsights" style="display:flex; align-items:center; gap:12px; padding:12px 16px; border-radius:12px; background:#f7faf8; border:1px solid #e7efe9;">
                  <b style="font-size:18px;">{{row.icon}}</b>
                  <p style="flex:1; margin:0;"><strong style="display:block; font-size:13.5px; color:#172019;">{{row.label}}</strong><small style="color:#78847e; font-size:12px;">{{row.detail}}</small></p>
                  <span style="font-size:14px; font-weight:800; color:#087a50;">{{row.value}}</span>
                </li>
              </ol>
            </article>
          </div>

          <section class="uni-card uni-activity uni-activity-full">
            <header><div><span>RECENT OFFERS</span><h2>Latest offer activity</h2></div><button (click)="go('invitations')">View all</button></header>
            <div *ngFor="let offer of offers.slice(0,4)">
              <span [class]="offerTone(offer.status)">{{offerIcon(offer.status)}}</span>
              <div><strong>{{offer.student}}</strong><small>{{offer.course}}</small></div>
              <time>{{offer.sent}}</time>
              <button type="button" (click)="go('invitations')">{{displayStatus(offer)}}</button>
            </div>
            <div class="empty-state" *ngIf="!offers.length"><strong>No offers sent yet</strong><p>Browse students and send your first offer.</p><button type="button" class="uni-secondary" (click)="go('students')">Browse students</button></div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='templates' || view==='catalog' || view==='criteria'">
          <header class="uni-page-title">
            <div>
              <span>{{ role==='BANK' ? 'FINANCIAL PRODUCTS & UNDERWRITING' : 'Product Management' }}</span>
              <h1>{{ role==='BANK' ? 'Loan Products' : 'Products' }}</h1>
              <p>{{ role==='BANK' ? 'Manage loan products, underwriting criteria, and their standard offer templates.' : 'Manage course offerings, admission criteria, and their standard offer templates.' }}</p>
            </div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <button type="button" (click)="downloadCsvTemplate()" style="background:transparent; border:none; color:#087a50; font-size:13px; font-weight:700; cursor:pointer; padding:0; text-decoration:underline;">Download CSV Template</button>
              <input type="file" #importFileInput style="display:none" accept=".csv" (change)="importProducts($event)">
              <button class="uni-secondary" (click)="importFileInput.click()" style="padding: 0 16px; height: 36px;">Import via CSV</button>
              <button class="uni-primary" (click)="openCatalogModal()">+ Add {{role==='BANK' ? 'loan product' : 'product'}}</button>
            </div>
          </header>

          <!-- SECTION: ACTIVE PRODUCTS / PRODUCTS DIRECTORY -->
          <section class="uni-card" style="margin-bottom: 24px;">


              <div class="product-catalog">
                <ng-container *ngIf="role==='UNIVERSITY'">
                  <article *ngFor="let p of products">
                    <span class="product-mark">{{p.name.charAt(0)}}</span>
                    <div class="product-name">
                      <h2>
                        <a *ngIf="p.url" [href]="p.url" target="_blank" style="text-decoration: underline; text-decoration-color: #c9d5cf; text-underline-offset: 4px;" (click)="$event.stopPropagation()">{{p.name}} ↗</a>
                        <ng-container *ngIf="!p.url">{{p.name}}</ng-container>
                      </h2>
                      <p>Created by {{cfg.userName}}<ng-container *ngIf="p.createdAt"> on {{p.createdAt | date:'MMM d, yyyy'}}</ng-container></p>
                    </div>
                    <div style="font-size: 13px; color: #4f6057; text-align: right; display: flex; flex-direction: column; justify-content: center;">
                      <ng-container *ngIf="p.lastModifiedAt">Last modified<br><span style="color: #172019; font-weight: 500;">{{p.lastModifiedAt | date:'MMM d, yyyy'}}</span></ng-container>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" (click)="openCatalogModal(p)">Edit</button>
                    </div>
                  </article>
                  <div class="empty-state" *ngIf="!products.length">
                    <strong>No products yet</strong>
                    <p>Add your first product to start receiving matched students.</p>
                  </div>
                </ng-container>
                <ng-container *ngIf="role==='BANK'">
                  <article *ngFor="let p of loanProducts">
                    <span class="product-mark">{{p.name.charAt(0)}}</span>
                    <div class="product-name">
                      <h2>
                        <a *ngIf="p.url" [href]="p.url" target="_blank" style="text-decoration: underline; text-decoration-color: #c9d5cf; text-underline-offset: 4px;" (click)="$event.stopPropagation()">{{p.name}} ↗</a>
                        <ng-container *ngIf="!p.url">{{p.name}}</ng-container>
                      </h2>
                      <p>Created by {{cfg.userName}}<ng-container *ngIf="p.createdAt"> on {{p.createdAt | date:'MMM d, yyyy'}}</ng-container></p>
                    </div>
                    <div style="font-size: 13px; color: #4f6057; text-align: right; display: flex; flex-direction: column; justify-content: center;">
                      <ng-container *ngIf="p.lastModifiedAt">Last modified<br><span style="color: #172019; font-weight: 500;">{{p.lastModifiedAt | date:'MMM d, yyyy'}}</span></ng-container>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" (click)="openCatalogModal(p)">Edit</button>
                    </div>
                  </article>
                  <div class="empty-state" *ngIf="!loanProducts.length">
                    <strong>No loan products yet</strong>
                    <p>Add your first product to start receiving matched students.</p>
                  </div>
                </ng-container>
              </div>
            </section>


        </section>



        <section class="uni-view" *ngIf="view==='notifications'">
          <header class="uni-page-title"><div><span>NOTIFICATIONS</span><h1>Notifications</h1><p>Recent activity on your offers and student discovery.</p></div></header>
          <section class="uni-card uni-activity" *ngIf="notifications.length; else noNotifications">
            <header><div><span>ACTIVITY</span><h2>Latest updates</h2></div></header>
            <div *ngFor="let item of notifications">
              <span [class]="item.tone">{{item.icon}}</span>
              <div><strong>{{item.title}}</strong><small>{{item.detail}}</small></div>
              <time>{{item.when}}</time>
            </div>
          </section>
          <ng-template #noNotifications><section class="uni-card empty-state"><strong>You're all caught up</strong><p>New offer and student activity will appear here.</p></section></ng-template>
        </section>

        <section class="uni-view" *ngIf="view==='profile' || view==='settings' || view==='subscription'">
          <header class="uni-page-title">
            <div>
              <span>ORGANISATION</span>
              <h1>{{cfg.profileTabLabel}} &amp; Settings</h1>
              <p>Manage your organisation profile, subscription plans, team and account preferences.</p>
            </div>
            <span class="org-verified">✓ Verified organisation</span>
          </header>

          <div class="settings-rail">
            <button *ngFor="let tab of settingsTabs" type="button" [class.active]="settingsTab===tab.id" (click)="setSettingsTab(tab.id)">{{tab.label}}</button>
          </div>

          <!-- Tab 1: Org Profile -->
          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='org'">
            <header><h2>{{cfg.profileTabLabel}}</h2><p>Manage your organisation profile details.</p></header>
            <div class="settings-form"><label>{{cfg.orgFieldLabel}}<input [(ngModel)]="orgName"></label><label>Official domain<input [(ngModel)]="orgDomain"></label><label>Organisation type<select><option *ngFor="let t of cfg.orgTypeOptions">{{t}}</option></select></label><label>Head office / campus<input [(ngModel)]="orgCity"></label><label class="wide">Organisation description<textarea [(ngModel)]="orgDescription"></textarea></label></div>
            <footer><button class="uni-primary" (click)="notify('Organisation profile saved')">Save changes</button></footer>
          </section>

          <!-- Tab 2: Subscription & Plans -->
          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='subscription'">
            <header><h2>Subscription &amp; Plans</h2><p>{{cfg.subscriptionIntro}}</p></header>
            <div class="current-usage">
              <div>
                <span>CURRENT PLAN</span>
                <strong>{{currentPlan}}</strong>
                <small>{{profilesViewed}} of {{planQuotaLabel}} student profiles viewed</small>
              </div>
              <div>
                <b>{{quotaPercent}}%</b>
                <i><span [style.width.%]="quotaPercent"></span></i>
                <small>{{remainingCredits}} profile views available</small>
              </div>
            </div>
            <div class="plan-options">
              <article *ngFor="let plan of planOptions" [class.recommended]="plan.recommended">
                <span *ngIf="plan.recommended">RECOMMENDED</span>
                <h3>{{plan.name}}</h3>
                <strong>{{plan.profiles}}</strong>
                <small>student profile views / cycle</small>
                <ul class="plan-feature-list">
                  <li *ngFor="let feature of plan.features">✓ {{feature}}</li>
                  <li *ngFor="let feature of advancedFeatures" [class.plan-feature-unlocked]="plan.unlocks.includes(feature)" [class.plan-feature-locked]="!plan.unlocks.includes(feature)">
                    {{plan.unlocks.includes(feature) ? '✓' : '🔒'}} {{feature}}
                  </li>
                </ul>
                <button type="button" [class.uni-primary]="plan.name!==currentPlan" [class.uni-secondary]="plan.name===currentPlan" [disabled]="plan.name===currentPlan" (click)="choosePlan(plan.name)">
                  {{plan.name===currentPlan?'Current plan':'Choose '+plan.name}}
                </button>
              </article>
            </div>
            <p class="subscription-note">Plan changes are mock frontend interactions until subscription billing is connected.</p>
          </section>

          <!-- Tab 3: Accreditation -->
          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='accreditation'">
            <header><h2>Accreditation</h2><p>{{role==='BANK' ? 'License and registration documents on file.' : 'Accreditation documents on file.'}}</p></header>
            <div class="accreditation-row"><span>✓</span><div><strong>{{role==='BANK' ? 'NBFC registration certificate' : 'University accreditation certificate'}}</strong><p>Verified · on file with SuperOffer</p></div><button type="button" (click)="notify('Re-upload flow is not connected in this preview')">Re-upload</button></div>
          </section>

          <!-- Tab 4: Team -->
          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='team'">
            <header><div><h2>Team</h2><p>Officers under {{orgName}}.</p></div><button type="button" (click)="openInviteModal()">+ Invite officer</button></header>
            <div class="team-row" *ngFor="let member of teamMembers">
              <span>{{member.initials}}</span>
              <p><strong>{{member.name}}{{member.isSelf ? ' (you)' : ''}}</strong><small>{{member.email}} · {{member.role}}</small></p>
              <b [class.status-invited]="member.status==='Invited'">{{member.status}}</b>
              <div class="team-row-actions">
                <button type="button" *ngIf="member.status==='Invited'" (click)="resendInvite(member)">Resend</button>
                <button type="button" *ngIf="!member.isSelf" (click)="removeOfficer(member)">Remove</button>
              </div>
            </div>
          </section>

          <!-- Tab 5: Notifications -->
          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='notifications'">
            <header><h2>Notification preferences</h2><p>Choose how you're notified about invitation and account activity.</p></header>
            <div class="notification-setting" *ngFor="let pref of notificationPrefs"><p><strong>{{pref.label}}</strong><small>{{pref.detail}}</small></p><select [(ngModel)]="pref.frequency" (ngModelChange)="persistNotificationPrefs()"><option>Instant</option><option>Daily digest</option><option>Off</option></select></div>
          </section>

          <!-- Tab 6: Security -->
          <ng-container *ngIf="settingsTab==='security'">
            <section class="uni-card uni-org-settings">
              <header><h2>Change Password</h2><p>Update the password used to sign in to your workspace.</p></header>
              <div class="settings-form"><label>Current password<input type="password" [(ngModel)]="passwordForm.current" placeholder="••••••••"></label><label></label><label>New password<input type="password" [(ngModel)]="passwordForm.next" placeholder="••••••••"></label><label>Confirm new password<input type="password" [(ngModel)]="passwordForm.confirm" placeholder="••••••••"></label></div>
              <footer><button class="uni-primary" (click)="changePassword()">Update password</button></footer>
            </section>

            <section class="uni-card security-action logout-card">
              <span>⎋</span>
              <p><strong>Log out of SuperOffer</strong><small>End your current session on this device.</small></p>
              <button type="button" (click)="logout()">Log out</button>
            </section>
          </ng-container>
        </section>
      </main>

      <div class="uni-toast" *ngIf="toast">{{toast}}</div>

      <div class="university-panel-backdrop product-modal-backdrop" *ngIf="productInviteDraft" (click)="productInviteDraft=null">
        <form class="right-side-drawer" (ngSubmit)="sendProductInvite()" (click)="$event.stopPropagation()">
          <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
            <div><h2 style="margin: 4px 0; font-size: 24px;">Invite to Product</h2><p style="margin: 0; color: #526059; font-size: 13px;">Select a product to invite this candidate.</p></div>
            <button type="button" (click)="productInviteDraft=null" style="background: transparent; border: none; padding: 0; font-size: 28px; line-height: 1; color: #697a70; cursor: pointer;">×</button>
          </header>
          <div style="display: flex; flex-direction: column; gap: 20px; margin-bottom: 24px;">
            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; font-weight: 800; color: #3f4d46;">Product
              <div style="display: flex; flex-wrap: wrap; gap: 8px; padding: 8px 12px; border: 1px solid #d7d4cc; border-radius: 9px; background: #fbfcfb; min-height: 42px; align-items: center;">
                <span *ngFor="let p of productInviteDraft.productNames" style="background: #edf6f1; color: #087a50; padding: 4px 10px; border-radius: 16px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                  {{p}}
                  <button type="button" (click)="removeProductFromInvite(p)" style="background: transparent; border: none; color: #087a50; cursor: pointer; font-size: 16px; line-height: 1; padding: 0;">&times;</button>
                </span>
                <select (change)="addProductToInvite($event)" style="flex: 1; border: none; background: transparent; outline: none; font-size: 14px; color: #172019; min-width: 140px;">
                  <option value="" disabled selected>Select a product...</option>
                  <option *ngFor="let p of getAvailableProductsForInvite()" [value]="p.name">{{p.name}}</option>
                </select>
              </div>
            </label>

            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; font-weight: 800; color: #3f4d46;">Notes
              <textarea id="custom-cond-textarea" name="conditions" [(ngModel)]="productInviteDraft.conditions" (input)="autoResizeTextarea($event.target)" placeholder="e.g. Additional requirements..." style="width: 100%; min-height: 120px; padding: 10px 12px; border: 1px solid #d7d4cc; border-radius: 9px; background: #fbfcfb; font-size: 14px; color: #172019; resize: none; overflow: hidden; field-sizing: content; line-height: 1.5;"></textarea>
            </label>

            <label style="display: flex; flex-direction: column; gap: 6px; font-size: 13.5px; font-weight: 800; color: #3f4d46;">Quick Conditions
              <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 2px;">
                <ng-container *ngFor="let cat of activePresetCategories">
                  <div style="background: #fff; border: 1px solid #e1e3e1; border-radius: 8px; overflow: hidden;">
                    <!-- Category Header -->
                    <div style="padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: #fbfcfb;"
                         (click)="productInviteDraft.expandedCategory = (productInviteDraft.expandedCategory === cat ? null : cat)">
                      <div style="font-size: 13.5px; font-weight: 700; color: #172019;">{{cat}}</div>
                      <div style="font-size: 16px; color: #697a70; font-weight: 400; line-height: 1;">
                        {{ productInviteDraft.expandedCategory === cat ? '−' : '+' }}
                      </div>
                    </div>
                    <!-- Expanded Items -->
                    <div *ngIf="productInviteDraft.expandedCategory === cat" style="padding: 8px; border-top: 1px solid #e1e3e1; display: flex; flex-direction: column; gap: 6px;">
                      <ng-container *ngFor="let p of getPresetsByCategory(cat)">
                        <div [style.background]="productInviteDraft.selectedPresetByCategory[cat] === p.id ? '#edf6f1' : 'transparent'"
                             [style.border]="productInviteDraft.selectedPresetByCategory[cat] === p.id ? '1px solid #087a50' : '1px solid transparent'"
                             style="border-radius: 6px; padding: 10px; cursor: pointer; transition: all 0.2s;"
                             (click)="selectPreset(cat, p.id, p.text)">
                          <div style="display: flex; gap: 10px; align-items: flex-start;">
                            <div [style.border]="productInviteDraft.selectedPresetByCategory[cat] === p.id ? '5px solid #087a50' : '2px solid #c2c9c5'"
                                 style="width: 18px; height: 18px; border-radius: 50%; background: #fff; margin-top: 1px; flex-shrink: 0; transition: all 0.15s ease-in-out; box-sizing: border-box;">
                            </div>
                            <div style="flex: 1; font-size: 13px; font-weight: 500; color: #172019; line-height: 1.4;">
                              {{p.text}}
                            </div>
                          </div>
                        </div>
                      </ng-container>
                    </div>
                  </div>
                </ng-container>
              </div>
            </label>
          </div>
          <footer style="display: flex; gap: 12px; justify-content: flex-end;">
            <button class="uni-secondary" type="button" (click)="productInviteDraft=null">Cancel</button>
            <button class="uni-primary" type="submit">Send Invite</button>
          </footer>
        </form>
      </div>

      <div class="university-panel-backdrop product-modal-backdrop" *ngIf="offerDraft" (click)="offerDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveOffer()" (click)="$event.stopPropagation()">
          <header><div><small>NEW OFFER</small><h2>Create offer</h2><p>Prepare a clear {{cfg.offerNoun}}.</p></div><button type="button" (click)="offerDraft=null">×</button></header>
          <div class="composer-grid">
            <label>Student<select name="offerStudent" required [(ngModel)]="offerDraft.student"><option value="" disabled>Select a student</option><option *ngFor="let s of students" [value]="s.name">{{s.name}}</option></select></label>
            <ng-container *ngIf="role==='UNIVERSITY'">
              <label>Product<select name="offerCourse" required [(ngModel)]="offerDraft.course" (ngModelChange)="onOfferCourseChange()"><option value="" disabled>Select a product</option><option *ngFor="let p of products" [value]="p.name">{{p.name}}</option></select></label>
              <label>Scholarship<input name="offerScholarship" [(ngModel)]="offerDraft.scholarship" placeholder="e.g. 40% tuition scholarship"></label>
              <label>Tuition fee<input name="offerTuition" required [(ngModel)]="offerDraft.tuition" placeholder="e.g. CAD 42,000 / year"></label>
              <label>Accommodation<input name="offerAccommodation" [(ngModel)]="offerDraft.accommodation" placeholder="e.g. Campus residence available"></label>
            </ng-container>
            <ng-container *ngIf="role==='BANK'">
              <label>Course being financed<input name="offerCourse" required [(ngModel)]="offerDraft.course" placeholder="e.g. MSc Data Science"></label>
              <label>Loan product<select name="offerProduct" [(ngModel)]="offerDraft.productName" (ngModelChange)="onOfferProductChange()"><option value="">Custom terms</option><option *ngFor="let p of loanProducts" [value]="p.name">{{p.name}}</option></select></label>
              <label class="wide" *ngIf="bankEvaluationMode==='ACADEMIC_AND_OFFER'">Offer type
                <select name="offerType" [(ngModel)]="offerDraft.offerType">
                  <option value="PreApproved">Pre-approved loan (academic profile only)</option>
                  <option value="Final">Final loan offer (university offer confirmed)</option>
                </select>
              </label>
              <label>{{offerDraft.offerType==='Final' ? 'Loan amount' : 'Eligible loan amount'}}<input name="offerLoanAmount" required [(ngModel)]="offerDraft.loanAmount" placeholder="e.g. ₹38,00,000"></label>
              <label>{{offerDraft.offerType==='Final' ? 'Interest rate' : 'Estimated interest rate'}}<input name="offerInterestRate" required [(ngModel)]="offerDraft.interestRate" placeholder="e.g. 9.4% p.a."></label>
              <ng-container *ngIf="offerDraft.offerType==='Final'">
                <label>EMI<input name="offerEmi" [(ngModel)]="offerDraft.emi" placeholder="e.g. ₹44,200 / month"></label>
                <label>Processing fee<input name="offerProcessingFee" [(ngModel)]="offerDraft.processingFee" placeholder="e.g. 1% waived"></label>
                <label>Repayment tenure<input name="offerTenure" required [(ngModel)]="offerDraft.tenure" placeholder="e.g. 10 years"></label>
              </ng-container>
              <label>Conditions<input name="offerConditions" [(ngModel)]="offerDraft.conditions" placeholder="e.g. Subject to guarantor verification"></label>
            </ng-container>
            <label>Response deadline<input name="offerDeadline" type="date" required [(ngModel)]="offerDraft.deadline"></label>
          </div>
          <footer><button class="uni-secondary" type="button" (click)="offerDraft=null">Cancel</button><button class="uni-primary" type="submit">Send {{cfg.offerVerb}}</button></footer>
        </form>
      </div>

      <div class="university-panel-backdrop product-modal-backdrop" *ngIf="catalogDraft" (click)="catalogDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveCatalogItem()" (click)="$event.stopPropagation()" style="max-width: 500px; padding: 32px;">
          <header style="margin-bottom: 8px; padding-bottom: 12px; border-bottom: 1px solid #e7efe9; display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1; margin-right: 16px;">
              <small style="color: #087a50; font-weight: 800; text-transform: uppercase; font-size: 11px; letter-spacing: 0.08em;">
                {{catalogDraft.id ? 'EDIT' : 'NEW'}} {{role==='BANK' ? 'LOAN PRODUCT' : 'PRODUCT'}}
              </small>
              <h2 style="margin: 4px 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.04em;">{{catalogDraft.id ? 'Edit Details' : 'Add Details'}}</h2>
            </div>
            <button type="button" (click)="catalogDraft=null" style="font-size: 22px; cursor: pointer; border: none; background: transparent; color: #88968f;">×</button>
          </header>

          <ng-container *ngIf="role==='UNIVERSITY'">
            <div class="composer-grid" style="margin: 0; display: flex; flex-direction: column; gap: 12px;">
              <label>Product Category
                <select name="pCategoryUni" required [(ngModel)]="catalogDraft.category" style="-webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23172019%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 14px center; background-size: 11px auto;">
                  <option value="" disabled selected>Select a category...</option>
                  <option value="Academic Product">Academic Product</option>
                  <option value="Financial Product">Financial Product</option>
                </select>
              </label>
              <label>Product name<input name="pName" required [(ngModel)]="catalogDraft.name" placeholder="e.g. MSc Data Science"></label>
              <label>Product web link (URL)<input type="url" name="pUrl" [(ngModel)]="catalogDraft.url" placeholder="https://"></label>
            </div>
          </ng-container>

          <ng-container *ngIf="role==='BANK'">
            <div class="composer-grid" style="margin: 0; display: flex; flex-direction: column; gap: 12px;">
              <label>Product Category
                <select name="pCategoryBank" required [(ngModel)]="catalogDraft.category" style="-webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23172019%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E'); background-repeat: no-repeat; background-position: right 14px center; background-size: 11px auto;">
                  <option value="" disabled selected>Select a category...</option>
                  <option value="Academic Product">Academic Product</option>
                  <option value="Financial Product">Financial Product</option>
                </select>
              </label>
              <label>Product name<input name="lName" required [(ngModel)]="catalogDraft.name" placeholder="e.g. Unsecured Study Loan"></label>
              <label>Product web link (URL)<input type="url" name="lUrl" [(ngModel)]="catalogDraft.url" placeholder="https://"></label>
            </div>
          </ng-container>

          <footer style="margin-top: 8px; padding-top: 12px; border-top: 1px solid #e7efe9; display: flex; justify-content: flex-end; gap: 10px;">
            <button class="uni-secondary" type="button" (click)="catalogDraft=null">Cancel</button>
            <button class="uni-primary" type="submit">Save</button>
          </footer>
        </form>
      </div>



      <div class="university-panel-backdrop product-modal-backdrop" *ngIf="negotiationOffer" (click)="negotiationOffer=null">
        <form class="university-offer-composer" (ngSubmit)="sendNegotiationReply()" (click)="$event.stopPropagation()">
          <header><div><small>NEGOTIATION</small><h2>{{negotiationOffer.student}}</h2><p>{{offerPrimary(negotiationOffer)}} · {{offerSecondary(negotiationOffer)}}</p></div><button type="button" (click)="negotiationOffer=null">×</button></header>
          <div class="composer-warning"><span>!</span><p>The student's counter-request is one-time; you may reply with revised terms or hold firm, any number of times — only the student can accept or reject.</p></div>
          <div *ngFor="let m of negotiationOffer.negotiationMessages" style="margin:10px 0;padding:10px 12px;border-radius:9px;background:#f6f8f7"><strong style="font-size:12px">{{m.author}}</strong><p style="margin:4px 0 0;font-size:13px;color:#4a564f">{{m.body}}</p></div>
          <label class="wide">Your response<textarea required [(ngModel)]="negotiationReply" name="negotiationReply" placeholder="e.g. We can offer 35% scholarship with fast-track admission, final."></textarea></label>
          <footer><button class="uni-secondary" type="button" (click)="negotiationOffer=null">Cancel</button><button class="uni-primary" type="submit">Send response</button></footer>
        </form>
      </div>

      <div class="university-panel-backdrop product-modal-backdrop" *ngIf="inviteDraft" (click)="inviteDraft=null">
        <form class="university-offer-composer" (ngSubmit)="sendInvite()" (click)="$event.stopPropagation()">
          <header><div><small>NEW INVITE</small><h2>Invite an officer</h2><p>They'll get email access to {{orgName}}'s workspace once they accept.</p></div><button type="button" (click)="inviteDraft=null">×</button></header>
          <div class="composer-grid">
            <label>Full name<input name="inviteName" required [(ngModel)]="inviteDraft.name" placeholder="e.g. Meera Nair"></label>
            <label>Work email<input name="inviteEmail" type="email" required [(ngModel)]="inviteDraft.email" [placeholder]="'e.g. meera.nair@' + orgDomain"></label>
            <label class="wide">Title<input name="inviteRole" [(ngModel)]="inviteDraft.role" [placeholder]="cfg.userTitle"></label>
          </div>
          <footer><button class="uni-secondary" type="button" (click)="inviteDraft=null">Cancel</button><button class="uni-primary" type="submit">Send invite</button></footer>
        </form>
      </div>
    </div>
  `
})
export class OrganizationWorkspaceComponent {
  role: Role = 'UNIVERSITY';
  cfg = ROLE_CONFIG['UNIVERSITY'];
  view: OrganizationView = 'dashboard';
  toast = '';
  browseIndex = 0;
  studentPanelOpen = false;
  filtersOpen = false;
  offerDraft: any = null;
  productInviteDraft: any = null;

  rawPresets = [
    { cat: 'Application', text: "Use code [CODE] for a full waiver on your application fee." },
    { cat: 'Application', text: "Use code [CODE] for [PERCENT]% off your application fee." },
    { cat: 'Application', text: "Use code [CODE] for [AMOUNT] off your application fee." },
    { cat: 'Tuition', text: "This invitation comes with a full tuition scholarship." },
    { cat: 'Tuition', text: "Based on your profile, a [PERCENT]% tuition scholarship upon admission." },
    { cat: 'Tuition', text: "Based on your profile, a tuition scholarship of [AMOUNT] upon admission." },
    { cat: 'Tuition', text: "This invitation makes you eligible for the reduced in-state tuition rate." },
    { cat: 'Tuition', text: "A scholarship covering [PERCENT]% of tuition across all years." },
    { cat: 'Accommodation', text: "A [PERCENT]% discount on first-year accommodation fees." },
    { cat: 'Accommodation', text: "This invitation comes with fully subsidized on-campus accommodation." },
    { cat: 'Accommodation', text: "A monthly living stipend of [AMOUNT]." },
    { cat: 'Competitive Test', text: "The [Exam] requirement waived for this product." },
    { cat: 'English Proficiency', text: "The [Exam] requirement waived based on your academic background." },
    { cat: 'Admission', text: "Priority/fast-track review, with a decision within [DAYS] days." },
    { cat: 'RA/TA', text: "A Research/Teaching Assistantship, including a tuition waiver and monthly stipend of [AMOUNT]." },
    { cat: 'Placement', text: "A guaranteed on-campus work-study position for up to [HOURS] hours/week." },
    { cat: 'Placement', text: "A guaranteed internship placement through our industry partners." },
    { cat: 'Interest Rate', text: "A reduced interest rate of [RATE]% p.a. on your education loan." },
    { cat: 'Interest Rate', text: "Your interest rate locked at [RATE]% for the full loan tenure, protected from future hikes." },
    { cat: 'Processing Charges', text: "A full waiver on your loan processing fee." },
    { cat: 'Processing Charges', text: "Use code [CODE] for [PERCENT]% off your loan processing fee." },
    { cat: 'Processing Charges', text: "A full waiver on loan documentation charges." },
    { cat: 'Processing Charges', text: "Complimentary loan protection/insurance cover, with the premium waived." },
    { cat: 'Collateral', text: "Eligibility for an unsecured loan with no collateral required, up to [AMOUNT]." },
    { cat: 'Co-Applicant/Guarantor', text: "Eligibility for a loan without a co-applicant/guarantor." },
    { cat: 'Repayment Terms', text: "An extended moratorium period of [MONTHS] months after course completion before repayment begins." },
    { cat: 'Repayment Terms', text: "A flexible repayment tenure of up to [YEARS] years." },
    { cat: 'Repayment Terms', text: "An EMI holiday of [MONTHS] months in case of financial hardship during repayment." },
    { cat: 'Repayment Terms', text: "An interest-only repayment option during your study period, deferring principal repayment." },
    { cat: 'Higher Loan Coverage', text: "Loan coverage of up to [PERCENT]% of your total cost of attendance, including tuition, living, and travel." },
    { cat: 'Risk Protection', text: "Complimentary cover that pauses EMIs for up to [MONTHS] months in case of job loss." },
    { cat: 'Risk Protection', text: "Loan waiver for the borrower in case of death or permanent disability during the loan tenure." },
    { cat: 'Risk Protection', text: "Protection against currency fluctuation on your loan amount during disbursement." }
  ];

  get activePresetCategories() {
    let isFinancial = this.role === 'BANK';
    if (this.productInviteDraft && this.productInviteDraft.productNames && this.productInviteDraft.productNames.length > 0) {
      const name = this.productInviteDraft.productNames[0];
      const product = this.getAvailableProductsForInvite().find((p: any) => p.name === name);
      if (product && product.category) {
        isFinancial = product.category === 'Financial Product';
      }
    }

    if (isFinancial) {
      return [...new Set(this.rawPresets.filter(p => ['Interest Rate', 'Processing Charges', 'Collateral', 'Co-Applicant/Guarantor', 'Repayment Terms', 'Higher Loan Coverage', 'Risk Protection'].includes(p.cat)).map(p => p.cat))];
    } else {
      return [...new Set(this.rawPresets.filter(p => ['Application', 'Tuition', 'Accommodation', 'Competitive Test', 'English Proficiency', 'Admission', 'RA/TA', 'Placement'].includes(p.cat)).map(p => p.cat))];
    }
  }

  presetConditions = this.rawPresets.map((p, idx) => {
    const vars = [];
    const regex = /\[(.*?)\]/g;
    let match;
    while ((match = regex.exec(p.text)) !== null) {
      vars.push(match[1]);
    }
    return { id: 'preset_' + idx, category: p.cat, text: p.text, vars };
  });

  // To store selected conditions string before appending
  getResolvedPresetText(preset: any, values: any): string {
    let text = preset.text;
    for (const v of preset.vars) {
      text = text.replace(`[${v}]`, values[v] || `[${v}]`);
    }
    return text;
  }  offerFilter = 'All';
  shortlistedNames = new Set(['Aarav Mehta', 'Sara Khan', 'Daniel Okafor']);
  workspaceFilter: 'All' | 'Accepted' | 'Shortlisted' | 'Rejected' | 'Discover' | 'Offers' | 'Negotiating' = 'All';
  candidateSearch = '';
  selectedCandidateName = 'Aarav Mehta';
  chatDraft = '';

  bankEvaluationMode: BankEvaluationMode = 'ACADEMIC_AND_OFFER';
  bankEvaluationModeOptions: Array<{ value: BankEvaluationMode; label: string; description: string }> = [
    { value: 'ACADEMIC_ONLY', label: 'Academic Profile Only', description: 'Pre-approve students before admission, based on academic and financial profile alone.' },
    { value: 'UNIVERSITY_OFFER_ONLY', label: 'University Offer Only', description: 'Only evaluate students who already hold at least one university offer.' },
    { value: 'ACADEMIC_AND_OFFER', label: 'Academic + University Offer', description: 'See every student. Pre-approve on academics, then upgrade to a final loan offer once admitted.' }
  ];

  navigation: Array<{id:OrganizationView;label:string;icon:string}> = [
    {id:'dashboard',label:'Dashboard',icon:'▦'},
    {id:'students',label:'Candidates & Offers',icon:'⌕'},
    {id:'templates',label:'Templates & Criteria',icon:'▧'},
    {id:'notifications',label:'Notifications',icon:'◌'}
  ];

  navLabel(id: OrganizationView): string {
    if (id === 'students' || id === 'shortlists' || id === 'invitations') return 'Candidates & Offers';
    if (id === 'templates') return 'Templates & Criteria';
    if (id === 'catalog') return this.cfg.catalogTitle;
    if (id === 'criteria') return this.cfg.criteriaTitle;
    return this.navigation.find(n => n.id === id)?.label || '';
  }

  setWorkspaceFilter(filter: 'All' | 'Discover' | 'Shortlisted' | 'Offers' | 'Negotiating' | 'Accepted') {
    this.workspaceFilter = filter;
  }

  templatesTab: 'templates' | 'catalog' | 'criteria' = 'templates';

  setTemplatesTab(tab: 'templates' | 'catalog' | 'criteria') {
    this.templatesTab = tab;
    this.view = 'templates';
    if (tab === 'templates') {
      this.router.navigate(['/organization', 'templates']);
    } else {
      this.router.navigate(['/organization', 'templates'], { queryParams: { tab } });
    }
  }

  currentPlan = 'Professional';
  profilesViewed = 142;
  planCapacity: Record<string, number> = {Basic:50,Professional:200,Enterprise:Infinity};
  advancedFeatures = ['Advanced Filters','Priority Discovery','AI Recommendations'];
  planOptions = [
    {name:'Basic',profiles:'50',recommended:false,features:['Core student search','Save student profiles','Create offers','Team management'],unlocks:[] as string[]},
    {name:'Professional',profiles:'200',recommended:true,features:['Everything in Basic'],unlocks:['Advanced Filters','Priority Discovery']},
    {name:'Enterprise',profiles:'Unlimited',recommended:false,features:['Everything in Professional'],unlocks:['Advanced Filters','Priority Discovery','AI Recommendations']}
  ];
  passwordForm = {current:'',next:'',confirm:''};

  offerStatuses = ['All','Sent','Viewed','Negotiating','Accepted','Rejected','Withdrawn','Expired'];
  offers: Offer[] = [];

  // Catalog, templates and criteria — populated per role in applyRole().
  products: Product[] = [];
  loanProducts: LoanProduct[] = [];
  templates: OfferTemplate[] = [];
  uniCriteria: UniversityCriteria = { minCgpa: 7.5, minEnglishScore: 6.5, englishTest: 'IELTS', preferredCurricula: 'STEM, Business', targetCountries: 'Canada, United Kingdom' };
  bankCriteria: BankCriteria = { guarantorRequired: true, maxFamilyIncome: 2000000, eligibleCountries: 'Canada, United Kingdom, Australia' };
  catalogDraft: any = null;
  selectedAppFeeType: string | null = null;
  selectedAccommType: string | null = null;
  selectedTuitionType: string | null = null;
  selectedProfileCGPA = false;
  selectedProfileTest = false;
  selectedProfileBg = false;
  templateDraft: any = null;
  negotiationOffer: Offer | null = null;
  negotiationReply = '';

  settingsTab: SettingsTab = 'org';
  settingsTabs: Array<{id:SettingsTab;label:string}> = [
    {id:'org',label:'Org Profile'},
    {id:'subscription',label:'Subscription & Plans'},
    {id:'accreditation',label:'Accreditation'},
    {id:'team',label:'Team'},
    {id:'notifications',label:'Notifications'},
    {id:'security',label:'Security'}
  ];

  setSettingsTab(tab: SettingsTab) {
    this.settingsTab = tab;
    this.view = 'profile';
    if (tab === 'org') {
      this.router.navigate(['/organization', 'profile']);
    } else {
      this.router.navigate(['/organization', 'profile'], { queryParams: { tab } });
    }
  }
  notificationPrefs: Array<{key:string;label:string;detail:string;frequency:string}> = [];

  countryOptions = ['Canada','United Kingdom','Germany','Australia','United States'];
  courseOptions = ['Data Science','Artificial Intelligence','Business Analytics','Computer Science','International Business'];
  intakeOptions = ['Fall 2027','Spring 2027','Winter 2027'];
  englishTestOptions: Array<'IELTS'|'TOEFL'|'PTE'|'Duolingo'> = ['IELTS','TOEFL','PTE','Duolingo'];
  filters = {
    course:'',degree:'',country:'',intake:'',cgpaMin:'',budgetMin:'',scholarship:'',
    englishTest:'' as '' | 'IELTS' | 'TOEFL' | 'PTE' | 'Duolingo',englishScoreMin:'',
    greMin:'',gmatMin:'',backlogsMax:'',workExperienceMin:'',noVisaRefusals:false,
    familyIncomeMax:'',requiredLoanMax:'',
    universityName:'',universityCourse:'',universityScholarship:'',offerStatus:'',
    visibility:'' as '' | 'academicOnly' | 'offerAvailable'
  };

  demoStudents = [
    {name:'Aarav Mehta',initials:'AM',photo:'/intelligent-matching-students.png',course:'Data Science',country:'Canada',degree:'Postgraduate',cgpa:'8.9 / 10',cgpaValue:8.9,ielts:7.5,englishTest:'IELTS' as const,englishScore:7.5,backlogs:0,workExperienceYears:0,visaRefused:false,documentsVerified:5,examScore:'IELTS 7.5 · GRE 323',budget:'₹38,00,000',budgetValue:3800000,financialSummary:'Family income ₹18L/yr · Savings ₹12L',skills:['Python','SQL','Machine Learning','Tableau'],factor:'Strong academic fit',intake:'Fall 2027',scholarshipSeeking:true,bio:'Data-focused engineering graduate building responsible machine-learning products for education.',color:'#0f6f54',eligible:true,eligibilityNote:'Co-applicant income and collateral cover the requested amount within standard lending limits.',
      toefl:100,gre:323,familyIncome:1800000,requiredLoanAmount:2600000,
      universityInterests:[{university:'Northbridge University',country:'Canada',course:'MSc Data Science',status:'Admitted' as UniversityOfferStatus,scholarship:'40% tuition',tuitionFee:'CAD 42,000 / year',remainingTuition:'CAD 25,200 / year',livingCost:'CAD 14,000 / year',logo:'/logos/northbridge.png'}]},
    {name:'Sara Khan',initials:'SK',photo:'/intelligent-matching-students.png',course:'Artificial Intelligence',country:'Canada',degree:'Postgraduate',cgpa:'9.1 / 10',cgpaValue:9.1,ielts:8.0,englishTest:'IELTS' as const,englishScore:8.0,backlogs:0,workExperienceYears:1,visaRefused:false,documentsVerified:5,examScore:'IELTS 8.0 · GMAT 710',budget:'₹42,00,000',budgetValue:4200000,financialSummary:'Sponsored · Income proof verified',skills:['R','Excel','Econometrics','Power BI'],factor:'Excellent product fit',intake:'Fall 2027',scholarshipSeeking:false,bio:'Quantitative graduate with internships in fintech research and market strategy.',color:'#315d88',eligible:true,eligibilityNote:'Strong sponsor income and complete documentation support the full requested amount.',
      toefl:110,gmat:710,requiredLoanAmount:0,
      universityInterests:[{university:'Northbridge University',country:'Canada',course:'MSc Artificial Intelligence',status:'Selected' as UniversityOfferStatus,scholarship:'—',tuitionFee:'CAD 39,500 / year',remainingTuition:'CAD 39,500 / year',livingCost:'CAD 13,500 / year',logo:'/logos/northbridge.png'}]},
    {name:'Daniel Okafor',initials:'DO',photo:'/intelligent-matching-students.png',course:'Business Analytics',country:'Canada',degree:'Postgraduate',cgpa:'3.7 / 4.0',cgpaValue:9.25,ielts:7.0,englishTest:'IELTS' as const,englishScore:7.0,backlogs:2,workExperienceYears:0,visaRefused:false,documentsVerified:3,examScore:'IELTS 7.0 · GRE 318',budget:'₹35,00,000',budgetValue:3500000,financialSummary:'Savings ₹11L · Loan required ₹24L',skills:['C++','ROS','Python','Embedded Systems'],factor:'High intent signal',intake:'Fall 2027',scholarshipSeeking:true,bio:'Robotics enthusiast with hands-on work in perception and autonomous navigation.',color:'#8a5b35',eligible:false,eligibilityNote:'Existing loan obligation and incomplete income documentation require manual underwriting review.',
      toefl:92,gre:318,familyIncome:1100000,requiredLoanAmount:2400000},
    {name:'Mei Lin',initials:'ML',photo:'/intelligent-matching-students.png',course:'Computer Science',country:'Canada',degree:'Postgraduate',cgpa:'3.8 / 4.0',cgpaValue:9.5,ielts:6.5,englishTest:'PTE' as const,englishScore:74,backlogs:0,workExperienceYears:0,visaRefused:false,documentsVerified:4,examScore:'IELTS 6.5 · PTE 74',budget:'₹40,00,000',budgetValue:4000000,financialSummary:'Family funded · Income proof verified',skills:['Java','Distributed Systems','Cloud','Kubernetes'],factor:'Strong test scores',intake:'Spring 2027',scholarshipSeeking:false,bio:'Systems-focused computer science graduate with cloud infrastructure internship experience.',color:'#695392',eligible:true,eligibilityNote:'Fully documented, low existing liability, income comfortably covers repayment.',
      requiredLoanAmount:0,
      universityInterests:[{university:'Westford University',country:'United Kingdom',course:'MSc Computer Science',status:'Shortlisted' as UniversityOfferStatus,scholarship:'—',tuitionFee:'£24,000 / year',remainingTuition:'£24,000 / year',livingCost:'£12,000 / year',logo:'/logos/westford.png'}]},
    {name:'Riya Patel',initials:'RP',photo:'/intelligent-matching-students.png',course:'International Business',country:'Canada',degree:'Postgraduate',cgpa:'8.4 / 10',cgpaValue:8.4,ielts:7.5,englishTest:'IELTS' as const,englishScore:7.5,backlogs:1,workExperienceYears:2,visaRefused:false,documentsVerified:4,examScore:'IELTS 7.5 · GMAT 680',budget:'₹30,00,000',budgetValue:3000000,financialSummary:'Family income ₹14L/yr · Savings ₹9L',skills:['Market Research','Excel','Negotiation','Power BI'],factor:'Budget aligned',intake:'Fall 2027',scholarshipSeeking:true,bio:'International-business graduate with export-consulting internship experience across two markets.',color:'#9a4f63',eligible:false,eligibilityNote:'Requested budget exceeds standard debt-to-income guidelines for the declared co-applicant income.',
      gmat:680,familyIncome:1400000,requiredLoanAmount:2100000}
  ];

  get students(): any[] {
    return [...this.submittedStudentsStore.list(), ...this.demoStudents];
  }

  orgName=ROLE_CONFIG['UNIVERSITY'].orgNameDefault;
  orgDomain=ROLE_CONFIG['UNIVERSITY'].orgDomainDefault;
  orgCity=ROLE_CONFIG['UNIVERSITY'].orgCityDefault;
  orgDescription=ROLE_CONFIG['UNIVERSITY'].orgDescriptionDefault;

  get planQuotaLabel(){return this.currentPlan==='Enterprise'?'Unlimited':String(this.planCapacity[this.currentPlan]);}
  get remainingCredits(){return this.currentPlan==='Enterprise'?'Unlimited':Math.max(0,this.planCapacity[this.currentPlan]-this.profilesViewed);}
  get quotaPercent(){return this.currentPlan==='Enterprise'?12:Math.min(100,Math.round((this.profilesViewed/this.planCapacity[this.currentPlan])*100));}
  get activeOffersCount(){return this.offers.filter(o=>!this.isTerminal(o)).length;}

  get filteredStudents(){
    const f=this.filters;
    return this.students.filter(s=>
      (!f.course||s.course===f.course) &&
      (!f.degree||s.degree===f.degree) &&
      (!f.country||s.country===f.country) &&
      (!f.intake||s.intake===f.intake) &&
      (!f.cgpaMin||s.cgpaValue>=parseFloat(f.cgpaMin)) &&
      (!f.budgetMin||s.budgetValue>=parseFloat(f.budgetMin)) &&
      (!f.scholarship||(f.scholarship==='yes'?s.scholarshipSeeking:!s.scholarshipSeeking)) &&
      (!f.englishTest||s.englishTest===f.englishTest) &&
      (!f.englishScoreMin||s.englishScore>=parseFloat(f.englishScoreMin)) &&
      (!f.greMin||(s.gre!==undefined&&s.gre>=parseFloat(f.greMin))) &&
      (!f.gmatMin||(s.gmat!==undefined&&s.gmat>=parseFloat(f.gmatMin))) &&
      (!f.backlogsMax||s.backlogs<=parseFloat(f.backlogsMax)) &&
      (!f.workExperienceMin||s.workExperienceYears>=parseFloat(f.workExperienceMin)) &&
      (!f.noVisaRefusals||!s.visaRefused) &&
      (!f.familyIncomeMax||(s.familyIncome!==undefined&&s.familyIncome<=parseFloat(f.familyIncomeMax))) &&
      (!f.requiredLoanMax||(s.requiredLoanAmount!==undefined&&s.requiredLoanAmount<=parseFloat(f.requiredLoanMax))) &&
      (!f.universityName||(s.universityInterests||[]).some((u:UniversityInterest)=>u.university===f.universityName)) &&
      (!f.universityCourse||(s.universityInterests||[]).some((u:UniversityInterest)=>u.course===f.universityCourse)) &&
      (!f.universityScholarship||(s.universityInterests||[]).some((u:UniversityInterest)=>!!u.scholarship&&u.scholarship!=='—')) &&
      (!f.offerStatus||(s.universityInterests||[]).some((u:UniversityInterest)=>u.status===f.offerStatus)) &&
      this.passesVisibility(s)
    ).sort((a,b)=>this.overallScore(b)-this.overallScore(a));
  }

  passesVisibility(s:any):boolean{
    if(this.role!=='BANK') return true;
    const hasOffer = !!(s.universityInterests && s.universityInterests.length);
    if(this.bankEvaluationMode==='UNIVERSITY_OFFER_ONLY') return hasOffer;
    if(this.bankEvaluationMode==='ACADEMIC_AND_OFFER' && this.filters.visibility){
      return this.filters.visibility==='academicOnly' ? !hasOffer : hasOffer;
    }
    return true;
  }

  uploadedDocCount(s:any):number{ return (s.financialDocuments||[]).filter((d:any)=>d.uploaded).length; }

  bankBadges(s:any):string[]{
    if(this.role!=='BANK') return [];
    const badges:string[]=[];
    if(s.eligible) badges.push('PRE-APPROVED');
    if(this.bankEvaluationMode==='ACADEMIC_AND_OFFER'){
      badges.push(s.universityInterests?.length ? 'University Offer Available' : 'Academic Profile Only');
    }
    if(s.needsLoan==='yes' && s.financialDocuments?.length && this.uploadedDocCount(s)===s.financialDocuments.length){
      badges.push('Loan Documents Complete');
    }
    return badges;
  }
  workspaceOffers: Array<{
    id: string;
    name: string;
    initials: string;
    avatarColor: string;
    avatarUrl?: string;
    email: string;
    mobile: string;
    currentCity: string;
    originCountry: string;
    futureInterests: string;
    degree: string;
    course: string;
    targetCountry: string;
    cgpa: string;
    examScore: string;
    budget: string;
    documentsVerified: number;
    skills: string[];
    bio: string;
    intake: string;
    headline: string;
    matchScore: number;
    matchBadge: string;
    offerType: string;
    offerValueLabel: string;
    offerValue: string;
    deadline: string;
    received: string;
    status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
    conditions: string;
    nextSteps: string[];
    messages: Array<{ from: 'student' | 'institution'; author: string; body: string; time: string }>;
  }> = [
    {
      id: 'cand-1',
      name: 'Aarav Mehta',
      initials: 'AM',
      avatarColor: '#0f6f54',
      avatarUrl: '/intelligent-matching-students.png',
      email: 'aarav.m@example.com',
      mobile: '+91 98765 43210',
      currentCity: 'Mumbai',
      originCountry: 'India',
      futureInterests: 'AI Ethics, EdTech, Research',
      degree: 'Postgraduate',
      course: 'MSc Data Science',
      targetCountry: 'Canada',
      cgpa: '8.9 / 10',
      examScore: 'IELTS 7.5 · GRE 323',
      budget: '₹38,00,000',
      documentsVerified: 5,
      skills: ['Python', 'SQL', 'Machine Learning', 'Tableau'],
      bio: 'Data-focused engineering graduate building responsible machine-learning products for education. 1st Class Honours with undergraduate research paper published.',
      intake: 'Fall 2027',
      headline: '40% Global Excellence Scholarship candidate',
      matchScore: 94,
      matchBadge: '94% AI MATCH',
      offerType: 'Scholarship & Admission',
      offerValueLabel: 'Scholarship',
      offerValue: '40% tuition (CAD 16,800/yr)',
      deadline: '15 August 2026',
      received: '24 Jul',
      status: 'Pending',
      conditions: 'Admission and scholarship are conditional on final degree certificate verification and meeting the product English-language requirement.',
      nextSteps: [
        'Review uploaded undergraduate transcripts and GRE score report',
        'Issue formal scholarship award letter and conditional offer',
        'Assist student with visa compliance documents and seat deposit'
      ],
      messages: [
        { from: 'institution', author: 'Admissions Office', body: 'Hi Aarav! We were impressed by your 8.9 CGPA and GRE 323 score. We are pleased to extend admission for MSc Data Science with our 40% Global Excellence Scholarship.', time: '24 Jul, 10:12' },
        { from: 'student', author: 'Aarav Mehta', body: 'Thank you very much! I am thrilled to receive this offer. Could you please confirm whether the scholarship applies to both years of the product?', time: '24 Jul, 11:03' },
        { from: 'institution', author: 'Admissions Office', body: 'Yes, Aarav! It is automatically renewable for year 2 provided you maintain a minimum 3.5 GPA.', time: '24 Jul, 11:18' }
      ]
    },
    {
      id: 'cand-2',
      name: 'Sara Khan',
      initials: 'SK',
      avatarColor: '#315d88',
      email: 'sara.khan@example.com',
      mobile: '+91 91234 56789',
      currentCity: 'New Delhi',
      originCountry: 'India',
      futureInterests: 'Fintech, Quantitative Analysis',
      degree: 'Postgraduate',
      course: 'MSc Artificial Intelligence',
      targetCountry: 'Canada',
      cgpa: '9.1 / 10',
      examScore: 'IELTS 8.0 · GMAT 710',
      budget: '₹42,00,000',
      documentsVerified: 5,
      skills: ['R', 'Excel', 'Econometrics', 'Power BI'],
      bio: 'Quantitative graduate with internships in fintech research and market strategy. Strong sponsor backing and verified proof of income.',
      intake: 'Fall 2027',
      headline: 'Pre-qualified education loan up to ₹35 lakh',
      matchScore: 96,
      matchBadge: 'PRE-APPROVED',
      offerType: 'Study Abroad Loan',
      offerValueLabel: 'Max Loan',
      offerValue: '₹35,00,000 @ 8.9% p.a.',
      deadline: '20 August 2026',
      received: '23 Jul',
      status: 'Pending',
      conditions: 'Pre-approved loan assessment conditional on verified guarantor income documents and university admission confirmation.',
      nextSteps: [
        'Review indicative interest rate and flexible repayment tenure',
        'Submit co-applicant KYC and last 6 months bank statements',
        'Issue sanction letter upon university admission confirmation'
      ],
      messages: [
        { from: 'institution', author: 'Admissions & Finance', body: 'Hello Sara! Your profile has been pre-approved for an education loan of up to ₹35 lakh at 8.9% p.a. with zero processing fee.', time: '23 Jul, 14:00' },
        { from: 'student', author: 'Sara Khan', body: 'Thank you! Could you let me know if the repayment holiday covers the full course period?', time: '23 Jul, 15:30' },
        { from: 'institution', author: 'Admissions & Finance', body: 'Yes, full moratorium is provided during your 2 years of study plus 6 months post-course grace period.', time: '23 Jul, 16:15' }
      ]
    },
    {
      id: 'cand-3',
      name: 'Daniel Okafor',
      initials: 'DO',
      avatarColor: '#84572b',
      email: 'daniel.o@example.com',
      mobile: '+234 801 234 5678',
      currentCity: 'Lagos',
      originCountry: 'Nigeria',
      futureInterests: 'Business Strategy, Operations',
      degree: 'Postgraduate',
      course: 'MSc Business Analytics',
      targetCountry: 'United Kingdom',
      cgpa: '3.7 / 4.0',
      examScore: 'IELTS 7.0 · GRE 318',
      budget: '₹35,00,000',
      documentsVerified: 4,
      skills: ['C++', 'ROS', 'Python', 'Embedded Systems'],
      bio: 'Robotics and analytics enthusiast with hands-on work in perception, autonomous systems, and data pipelines.',
      intake: 'Spring 2027',
      headline: 'Priority admission with £6,000 award',
      matchScore: 91,
      matchBadge: 'SHORTLISTED',
      offerType: 'Direct Admission',
      offerValueLabel: 'Award',
      offerValue: '£6,000 Dean\'s Award',
      deadline: '10 August 2026',
      received: '21 Jul',
      status: 'Shortlisted',
      conditions: 'Subject to completion of bachelor degree with 1st Class Honours and CAS interview verification.',
      nextSteps: [
        'Review student SOP and academic references',
        'Schedule 15-minute admissions interview',
        'Issue CAS statement for UK student visa'
      ],
      messages: [
        { from: 'institution', author: 'Admissions Office', body: 'Hi Daniel, pleased to extend conditional admission for MSc Business Analytics with our £6,000 Dean’s Merit Award.', time: '21 Jul, 09:30' },
        { from: 'student', author: 'Daniel Okafor', body: 'Thank you! I have reviewed the curriculum and will submit my final semester marks next week.', time: '21 Jul, 10:45' }
      ]
    },
    {
      id: 'cand-4',
      name: 'Mei Lin',
      initials: 'ML',
      avatarColor: '#5c458a',
      email: 'mei.lin@example.com',
      mobile: '+86 138 1234 5678',
      currentCity: 'Shanghai',
      originCountry: 'China',
      futureInterests: 'Software Engineering, Systems',
      degree: 'Postgraduate',
      course: 'MSc Computer Science',
      targetCountry: 'Canada',
      cgpa: '3.8 / 4.0',
      examScore: 'IELTS 6.5 · PTE 74',
      budget: '₹40,00,000',
      documentsVerified: 5,
      skills: ['Java', 'Distributed Systems', 'Cloud', 'Kubernetes'],
      bio: 'Systems-focused computer science graduate with cloud infrastructure internship experience. Fully documented and verified.',
      intake: 'Spring 2027',
      headline: 'Collateral-free funding & fast-track admission',
      matchScore: 95,
      matchBadge: 'PRE-APPROVED',
      offerType: 'Collateral-Free Loan',
      offerValueLabel: 'Max Loan',
      offerValue: '₹40,00,000',
      deadline: '18 August 2026',
      received: '18 Jul',
      status: 'Accepted',
      conditions: 'Unsecured education loan with flexible moratorium period during study duration.',
      nextSteps: [
        'Verify GRE and undergraduate transcripts',
        'Confirm student acceptance on portal',
        'Disburse tuition deposit directly to university portal'
      ],
      messages: [
        { from: 'institution', author: 'Finance Office', body: 'Hello Mei! We are delighted to confirm your collateral-free education loan sanction for computer science studies.', time: '18 Jul, 11:20' },
        { from: 'student', author: 'Mei Lin', body: 'Thank you so much! I have accepted the sanction and will upload the fee invoice today.', time: '18 Jul, 12:45' }
      ]
    },
    {
      id: 'cand-5',
      name: 'Riya Patel',
      initials: 'RP',
      avatarColor: '#95495b',
      email: 'riya.p@example.com',
      mobile: '+91 99887 76655',
      currentCity: 'Ahmedabad',
      originCountry: 'India',
      futureInterests: 'International Trade, Logistics',
      degree: 'Postgraduate',
      course: 'MSc International Business',
      targetCountry: 'Germany',
      cgpa: '8.4 / 10',
      examScore: 'IELTS 7.5 · GMAT 680',
      budget: '₹30,00,000',
      documentsVerified: 4,
      skills: ['Market Research', 'Excel', 'Negotiation', 'Power BI'],
      bio: 'International-business graduate with export-consulting internship experience across two global markets.',
      intake: 'Fall 2027',
      headline: '35% Merit scholarship with fast-track visa support',
      matchScore: 88,
      matchBadge: '88% MATCH',
      offerType: 'Merit Scholarship',
      offerValueLabel: 'Scholarship',
      offerValue: '35% tuition',
      deadline: '25 August 2026',
      received: '15 Jul',
      status: 'Pending',
      conditions: 'Requires minimum 8.0 CGPA and verified GMAT Quantitative score of 650+.',
      nextSteps: [
        'Review department curriculum and research labs',
        'Submit statement of purpose and verified references',
        'Confirm offer acceptance and issue visa assistance'
      ],
      messages: [
        { from: 'institution', author: 'Admissions Office', body: 'We are pleased to invite you to join our international business cohort with dedicated scholarship support.', time: '15 Jul, 16:45' }
      ]
    }
  ];

  selectedOfferId = 'cand-1';

  get selectedOfferItem() {
    return this.workspaceOffers.find(o => o.id === this.selectedOfferId) || this.workspaceOffers[0];
  }

  selectOffer(offer: any) {
    this.selectedOfferId = offer.id;
  }

  get filteredWorkspaceOffers() {
    if (this.workspaceFilter === 'All') return this.workspaceOffers;
    return this.workspaceOffers.filter(o => o.status === this.workspaceFilter);
  }

  countWorkspaceOffers(status: string): number {
    return this.workspaceOffers.filter(o => o.status === status).length;
  }

  setOfferStatus(offer: any, status: 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected') {
    offer.status = status;
    if (status === 'Shortlisted') {
      this.notify(`Candidate ${offer.name} shortlisted`);
    } else if (status === 'Rejected') {
      this.notify(`Candidate ${offer.name} rejected`);
    } else {
      this.notify(`Status updated to ${status}`);
    }
  }

  sendCandidateInvite(offer: any) {
    offer.status = 'Accepted';
    this.notify(`Invitation sent to ${offer.name}`);
    if (offer.messages) {
      offer.messages.push({
        from: 'institution',
        author: this.cfg.userName,
        body: `We are pleased to formally invite you to connect with our admissions team regarding ${offer.course}!`,
        time: 'Just now'
      });
    }
  }

  get selectedStudent(): any {
    const list = this.filteredCandidateList;
    if (!list.length) return null;
    return list.find(s => s.name === this.selectedCandidateName) || list[0];
  }

  selectCandidate(student: any) {
    this.selectedCandidateName = student.name;
  }

  get filteredCandidateList(): any[] {
    const q = (this.candidateSearch || '').trim().toLowerCase();
    return this.filteredStudents.filter(s => {
      if (this.workspaceFilter === 'Discover' && this.hasOffer(s)) return false;
      if (this.workspaceFilter === 'Shortlisted' && !this.isShortlisted(s.name)) return false;
      if (this.workspaceFilter === 'Offers' && !this.hasOffer(s)) return false;
      if (this.workspaceFilter === 'Negotiating') {
        const off = this.getOffer(s.name);
        if (!off || off.status !== 'Negotiating') return false;
      }
      if (this.workspaceFilter === 'Accepted') {
        const off = this.getOffer(s.name);
        if (!off || off.status !== 'Accepted') return false;
      }
      if (q) {
        const matchName = s.name.toLowerCase().includes(q);
        const matchCourse = (s.course || '').toLowerCase().includes(q);
        const matchCountry = (s.country || '').toLowerCase().includes(q);
        const matchDegree = (s.degree || '').toLowerCase().includes(q);
        const matchSkills = (s.skills || []).some((sk: string) => sk.toLowerCase().includes(q));
        if (!matchName && !matchCourse && !matchCountry && !matchDegree && !matchSkills) return false;
      }
      return true;
    });
  }

  get allCandidatesCount(): number { return this.students.length; }
  get discoverCount(): number { return this.students.filter(s => !this.hasOffer(s)).length; }
  get shortlistedCount(): number { return this.students.filter(s => this.isShortlisted(s.name)).length; }
  get offersCount(): number { return this.offers.length; }
  get negotiatingCount(): number { return this.offers.filter(o => o.status === 'Negotiating').length; }
  get acceptedCount(): number { return this.offers.filter(o => o.status === 'Accepted').length; }

  getOffer(studentName: string): Offer | undefined {
    return this.offers.find(o => o.student === studentName);
  }

  hasOffer(student: any): boolean {
    return !!this.getOffer(student.name);
  }

  candidateBadge(student: any): string {
    const off = this.getOffer(student.name);
    if (off) {
      return this.role === 'BANK' ? `BANK OFFER · ${off.status.toUpperCase()}` : `UNIVERSITY OFFER · ${off.status.toUpperCase()}`;
    }
    if (this.isShortlisted(student.name)) return 'SHORTLISTED CANDIDATE';
    if (this.role === 'BANK' && student.eligible) return 'PRE-APPROVED LOAN MATCH';
    return `${this.overallScore(student)}% AI MATCH`;
  }

  candidateHeadline(student: any): string {
    const off = this.getOffer(student.name);
    if (off) {
      if (this.role === 'BANK') {
        return `${off.loanAmount} Education Loan @ ${off.interestRate}`;
      }
      return off.scholarship || `${off.course} Direct Admission`;
    }
    if (this.role === 'BANK') {
      return student.eligible ? 'Pre-Approved Study Loan up to ₹50 Lakh' : `Indicative Study Loan · ${student.course}`;
    }
    return `${this.overallScore(student)}% Match · 40% Global Excellence Scholarship`;
  }

  candidateDate(student: any): string {
    const off = this.getOffer(student.name);
    return off ? off.sent : 'Today';
  }

  offerKeyTermValue(student: any): string {
    const off = this.getOffer(student.name);
    if (off) {
      return this.role === 'BANK' ? `${off.loanAmount} @ ${off.interestRate}` : (off.scholarship || '40% tuition');
    }
    if (this.role === 'BANK') {
      return student.eligible ? 'Up to ₹50,00,000' : 'Needs Review';
    }
    return student.scholarshipSeeking ? '40% tuition' : 'Full tuition';
  }

  offerDeadline(student: any): string {
    const off = this.getOffer(student.name);
    return off?.deadline || '15 August 2026';
  }

  candidateConditions(student: any): string {
    const off = this.getOffer(student.name);
    if (off?.conditions && off.conditions !== 'None') return off.conditions;
    if (this.role === 'BANK') {
      return 'Pre-qualified loan assessment conditional on confirmed admission transcript and co-applicant income verification.';
    }
    return 'Your admission and scholarship are conditional on final transcript verification and meeting the product English-language requirement.';
  }

  candidateMessages(student: any): Array<{ from: 'institution' | 'student'; author: string; body: string; time: string }> {
    const off = this.getOffer(student.name);
    if (off?.negotiationMessages && off.negotiationMessages.length) {
      return off.negotiationMessages;
    }
    return [
      { from: 'institution', author: this.cfg.userName, body: `Hi ${student.name.split(' ')[0]}! We were impressed by your academic profile and would like to connect regarding ${student.course}.`, time: '24 Jul, 10:12' }
    ];
  }

  sendChatMessage() {
    if (!this.chatDraft.trim()) return;
    const text = this.chatDraft.trim();
    const item = this.selectedOfferItem;
    if (item) {
      item.messages.push({
        from: 'institution',
        author: this.cfg.userName,
        body: text,
        time: 'Just now'
      });
      this.chatDraft = '';
      this.notify(`Message sent to ${item.name}`);
      setTimeout(() => {
        item.messages.push({
          from: 'student',
          author: item.name,
          body: 'Thank you for the update! I will review the documents and submit the required paperwork promptly.',
          time: 'Just now'
        });
      }, 1200);
      return;
    }
  }

  get currentStudent(){
    const list=this.filteredStudents;
    if(!list.length) return null;
    if(this.browseIndex>list.length-1) this.browseIndex=0;
    return list[this.browseIndex];
  }
  get savedStudents(){return this.students.filter(s=>this.isShortlisted(s.name));}
  get notifications(){
    return [
      ...this.offers.slice(0,3).map(o=>({icon:this.offerIcon(o.status),tone:this.offerTone(o.status),title:`${o.student}'s offer is ${this.displayStatus(o).toLowerCase()}`,detail:o.course,when:o.sent})),
      {icon:'★',tone:'positive',title:`${this.savedStudents.length} students saved`,detail:'Review your shortlist and send offers.',when:'Today'}
    ];
  }
  isShortlisted(name:string){return this.shortlistedNames.has(name);}
  toggleShortlist(name:string){
    if(this.shortlistedNames.has(name)) this.shortlistedNames.delete(name);
    else this.shortlistedNames.add(name);
    this.shortlistedNames = new Set(this.shortlistedNames);
    localStorage.setItem(`superoffer_${this.role}_shortlist`,JSON.stringify([...this.shortlistedNames]));
    this.notify(this.shortlistedNames.has(name)?`${name} saved`:`${name} removed from saved students`);
  }
  openProfile(student:any){
    const index=this.filteredStudents.findIndex(s=>s.name===student.name);
    if(index>=0) this.browseIndex=index;
    this.studentPanelOpen=true;
    this.go('students');
  }
  openStudentPanel(student:any){
    const index=this.filteredStudents.findIndex(s=>s.name===student.name);
    if(index>=0) this.browseIndex=index;
    this.studentPanelOpen=true;
  }
  swapProfile(direction:number){
    const next=this.browseIndex+direction;
    if(next>=0 && next<this.filteredStudents.length) this.browseIndex=next;
  }
  jumpToOffset(offset:number){ this.swapProfile(offset); }
  trackByStudentName(_index:number, item:{student:any}){ return item.student.name; }

  // --- Coverflow carousel: center card at offset 0, one blurred peek card on each side ---
  get carouselWindow(): Array<{student:any; offset:number}> {
    const list=this.filteredStudents;
    const window: Array<{student:any; offset:number}> = [];
    for(let offset=-1; offset<=1; offset++){
      const idx=this.browseIndex+offset;
      if(idx>=0 && idx<list.length) window.push({ student:list[idx], offset });
    }
    return window;
  }
  cardTransform(offset:number):string{
    if(offset===0) return 'translateX(-50%) scale(1)';
    const shift=offset>0?68:-68;
    return `translateX(calc(-50% + ${shift}%)) scale(0.82)`;
  }
  cardBlur(offset:number):string{ return offset===0?'none':'blur(3px)'; }
  cardOpacity(offset:number):number{ return offset===0?1:0.55; }
  cardZ(offset:number):number{ return offset===0?3:2; }
  get activeFilterCount():number{
    return Object.values(this.filters).filter(v=>v!==''&&v!==false).length;
  }
  resetFilters(){
    this.filters={
      course:'',degree:'',country:'',intake:'',cgpaMin:'',budgetMin:'',scholarship:'',
      englishTest:'',englishScoreMin:'',
      greMin:'',gmatMin:'',backlogsMax:'',workExperienceMin:'',noVisaRefusals:false,
      familyIncomeMax:'',requiredLoanMax:'',
      universityName:'',universityCourse:'',universityScholarship:'',offerStatus:'',
      visibility:''
    };
    this.browseIndex=0;
  }

  get filteredOffers(){return this.offerFilter==='All'?this.offers:this.offers.filter(o=>this.displayStatus(o)===this.offerFilter);}
  offerTone(status:OfferStatus){return status==='Accepted'?'positive':status==='Negotiating'?'warning':(status==='Rejected'||status==='Withdrawn'||status==='Expired')?'warning':'neutral';}
  offerIcon(status:OfferStatus){return status==='Accepted'?'✓':status==='Negotiating'?'↔':status==='Rejected'?'✕':status==='Withdrawn'?'⊘':status==='Expired'?'⏱':status==='Viewed'?'◉':'↗';}
  offerPrimary(offer:Offer){
    if(this.role!=='BANK') return offer.scholarship;
    return offer.offerType==='PreApproved' ? `${offer.loanAmount} at ~${offer.interestRate}` : `${offer.loanAmount} at ${offer.interestRate}`;
  }
  offerSecondary(offer:Offer){
    if(this.role!=='BANK') return `${offer.tuition} · ${offer.accommodation}`;
    if(offer.offerType==='PreApproved') return 'Pre-approved · subject to admission confirmation';
    const emi = offer.emi ? ` · EMI ${offer.emi}` : '';
    return `${offer.tenure||'Tenure TBD'} · ${offer.processingFee||'No processing fee'}${emi}`;
  }

  // --- Invitation lifecycle: 14-day expiry, withdrawal, negotiation ---
  private daysSince(ts?: number): number { return ts ? Math.floor((Date.now() - ts) / 86400000) : 0; }
  isAutoExpired(offer: Offer): boolean { return !['Accepted','Rejected','Withdrawn'].includes(offer.status) && this.daysSince(offer.sentAt) >= 14; }
  displayStatus(offer: Offer): OfferStatus { return this.isAutoExpired(offer) ? 'Expired' : offer.status; }
  isTerminal(offer: Offer): boolean { return ['Accepted','Rejected','Withdrawn'].includes(offer.status) || this.isAutoExpired(offer); }
  statusToneClass(offer: Offer): string {
    const s = this.displayStatus(offer);
    return s==='Negotiating' ? 'negotiating' : s==='Accepted' ? 'accepted' : (s==='Expired'||s==='Withdrawn'||s==='Rejected') ? 'closed-status' : '';
  }
  expiryLabel(offer: Offer): string {
    if(['Accepted','Rejected','Withdrawn'].includes(offer.status)) return '—';
    const remaining = 14 - this.daysSince(offer.sentAt);
    if(remaining<=0) return 'Expired';
    if(remaining<=3) return `Expiring in ${remaining}d`;
    return `${remaining}d remaining`;
  }
  withdrawOffer(offer: Offer){
    if(this.isTerminal(offer)) return;
    if(!window.confirm(`Withdraw the offer to ${offer.student}? This can't be undone.`)) return;
    offer.status = 'Withdrawn';
    this.offers = [...this.offers];
    this.notify(`Offer to ${offer.student} withdrawn`);
  }
  lastStudentMessage(offer: Offer): string {
    const msgs = offer.negotiationMessages || [];
    const last = [...msgs].reverse().find(m=>m.from==='student');
    return last?.body || 'Requested revised terms.';
  }
  openNegotiationPanel(offer: Offer){ this.negotiationOffer = offer; this.negotiationReply=''; }
  sendNegotiationReply(){
    if(!this.negotiationOffer || !this.negotiationReply.trim()) return;
    const offer = this.negotiationOffer;
    offer.negotiationMessages = [...(offer.negotiationMessages||[]), {from:'institution', author: this.cfg.userName, body: this.negotiationReply.trim(), time:'Just now'}];
    this.notify(`Response sent to ${offer.student}`);
    this.negotiationOffer = null;
  }

  // --- Reports: computed live from `offers`, never hardcoded ---
  get acceptanceRate(): number {
    if(!this.offers.length) return 0;
    return Math.round(this.offers.filter(o=>o.status==='Accepted').length / this.offers.length * 100);
  }
  get viewedRate(): number {
    if(!this.offers.length) return 0;
    return Math.round(this.offers.filter(o=>o.status!=='Sent').length / this.offers.length * 100);
  }
  get avgResponseTime(): string {
    const withResponse = this.offers.filter(o=>o.responseHours!==undefined);
    if(!withResponse.length) return '—';
    const avgHours = withResponse.reduce((sum,o)=>sum+(o.responseHours||0),0)/withResponse.length;
    return avgHours>=24 ? `${(avgHours/24).toFixed(1)} days` : `${Math.round(avgHours)} hrs`;
  }
  get funnelStages(){
    const total = this.offers.length || 1;
    const viewedPlus = this.offers.filter(o=>['Viewed','Negotiating','Accepted','Rejected'].includes(o.status)).length;
    const negotiatingPlus = this.offers.filter(o=>['Negotiating','Accepted'].includes(o.status)).length;
    const accepted = this.offers.filter(o=>o.status==='Accepted').length;
    return [
      {label:'Sent', count:this.offers.length, percent:100},
      {label:'Viewed', count:viewedPlus, percent:Math.round(viewedPlus/total*100)},
      {label:'Negotiating', count:negotiatingPlus, percent:Math.round(negotiatingPlus/total*100)},
      {label:'Accepted', count:accepted, percent:Math.round(accepted/total*100)}
    ];
  }
  get performanceBars(){
    const buckets = new Map<string,{total:number;accepted:number}>();
    if(this.role==='BANK'){
      for(const o of this.offers){
        const rate = parseFloat(o.interestRate||'');
        const label = isNaN(rate) ? 'Unrated' : `${Math.floor(rate)}–${Math.floor(rate)+1}%`;
        const entry = buckets.get(label) || {total:0,accepted:0};
        entry.total++; if(o.status==='Accepted') entry.accepted++;
        buckets.set(label, entry);
      }
    } else {
      for(const o of this.offers){
        const entry = buckets.get(o.course) || {total:0,accepted:0};
        entry.total++; if(o.status==='Accepted') entry.accepted++;
        buckets.set(o.course, entry);
      }
    }
    return [...buckets.entries()].map(([label,{total,accepted}])=>({label, percent: total ? Math.round(accepted/total*100) : 0}));
  }
  get rankedInsights(){
    if(this.role==='BANK'){
      return this.performanceBars.slice(0,4).map(b=>({icon:'%', label:b.label, detail:'Interest rate band', value:`${b.percent}% accept`}));
    }
    const bands = [{min:90,max:101,label:'90–100 match'},{min:80,max:90,label:'80–89 match'},{min:70,max:80,label:'70–79 match'},{min:0,max:70,label:'Below 70 match'}];
    return bands.map(band=>{
      const inBand = this.offers.filter(o=>{
        const student = this.students.find((s:any)=>s.name===o.student);
        const score = student ? this.overallScore(student) : 0;
        return score>=band.min && score<band.max;
      });
      const accepted = inBand.filter(o=>o.status==='Accepted').length;
      return {icon:'◆', label:band.label, detail:`${inBand.length} invitation${inBand.length===1?'':'s'}`, value: inBand.length ? `${Math.round(accepted/inBand.length*100)}% accept` : '—'};
    });
  }

  // --- Match scoring: derived from the org's own criteria/catalog, per Modules/11_AI_Matching.md ---
  private clamp(n:number):number{ return Math.max(0, Math.min(100, Math.round(n))); }
  private parseAmount(v:string):number{ return Number((v||'').replace(/[^0-9.]/g,''))||0; }
  get uniTargetCountriesList(): string[] { return (this.uniCriteria.targetCountries || '').split(',').map(s=>s.trim()).filter(Boolean); }
  get bankEligibleCountriesList(): string[] { return (this.bankCriteria.eligibleCountries || '').split(',').map(s=>s.trim()).filter(Boolean); }

  matchFactors(s: any): Array<{ label: string; weight: number; score: number }> {
    let scores: number[];
    if (this.role === 'BANK') {
      const productMaxAmounts = this.loanProducts.map(p => this.parseAmount(p.maxAmount)).filter(n => n > 0);
      const productMax = productMaxAmounts.length ? Math.max(...productMaxAmounts) : 5000000;
      const loanRatio = s.requiredLoanAmount ? Math.min(1.4, s.requiredLoanAmount / productMax) : 0.3;
      let financialNeedFit = this.clamp(95 - loanRatio * 45);
      if (s.familyIncome && this.bankCriteria.maxFamilyIncome && s.familyIncome > this.bankCriteria.maxFamilyIncome) financialNeedFit = this.clamp(financialNeedFit - 20);

      const rank: Record<string, number> = { 'Admitted': 4, 'Selected': 3, 'Shortlisted': 2, 'Offer Sent': 1 };
      const bestStatus = (s.universityInterests || []).reduce((best: string, u: UniversityInterest) => (rank[u.status] || 0) > (rank[best] || 0) ? u.status : best, '');
      const statusScoreMap: Record<string, number> = { 'Admitted': 100, 'Selected': 85, 'Shortlisted': 65, 'Offer Sent': 55, '': 25 };
      const admissionStatusFit = statusScoreMap[bestStatus] ?? 25;

      const eligibleCountries = this.bankEligibleCountriesList;
      const countryEligibilityFit = !eligibleCountries.length || eligibleCountries.includes(s.country) ? 100 : 30;

      let guarantorCompleteness = this.clamp((s.documentsVerified / 5) * 100);
      if (this.bankCriteria.guarantorRequired && s.documentsVerified < 5) guarantorCompleteness = this.clamp(guarantorCompleteness - 15);

      scores = [financialNeedFit, admissionStatusFit, countryEligibilityFit, guarantorCompleteness];
    } else {
      const academicFit = this.clamp(50 + (s.cgpaValue - this.uniCriteria.minCgpa) * 15);

      const testDelta = s.englishTest === this.uniCriteria.englishTest ? (s.englishScore - this.uniCriteria.minEnglishScore) : 0;
      let testScoreFit = this.clamp(60 + testDelta * 8);
      if (s.gre) testScoreFit = this.clamp((testScoreFit + (s.gre >= 310 ? 90 : 70)) / 2);
      if (s.gmat) testScoreFit = this.clamp((testScoreFit + (s.gmat >= 650 ? 90 : 70)) / 2);

      const matchingProduct = this.products.find(p => p.course === s.course);
      const courseAlignment = matchingProduct ? 92 : 55;

      const targetCountries = this.uniTargetCountriesList;
      const inTargetCountry = !targetCountries.length || targetCountries.includes(s.country);
      const intakeMatches = matchingProduct ? matchingProduct.intakes.includes(s.intake) : false;
      const countryIntakeAlignment = inTargetCountry && intakeMatches ? 95 : inTargetCountry ? 65 : 35;

      const scholarshipAvailable = !!matchingProduct && !!matchingProduct.scholarshipRange && matchingProduct.scholarshipRange !== '—';
      const budgetScholarshipFit = s.scholarshipSeeking ? (scholarshipAvailable ? 88 : 45) : 90;

      scores = [academicFit, testScoreFit, courseAlignment, countryIntakeAlignment, budgetScholarshipFit];
    }
    return this.cfg.weightFactors.map((f: { label: string; weight: number }, i: number) => ({ label: f.label, weight: f.weight, score: scores[i] }));
  }
  overallScore(s: any): number {
    const factors = this.matchFactors(s);
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0) || 1;
    return Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0) / totalWeight);
  }

  getPresetsByCategory(category: string) {
    return this.presetConditions.filter(p => p.category === category);
  }

  openProductInviteModal() {
    this.productInviteDraft = {
      productNames: [],
      conditions: '',
      expandedCategory: null,
      selectedPresetByCategory: {},
      insertedTextByCategory: {}
    };
  }

  addProductToInvite(event: any) {
    const val = event.target.value;
    if (val && !this.productInviteDraft.productNames.includes(val)) {
      this.productInviteDraft.productNames.push(val);
    }
    event.target.value = '';
  }

  removeProductFromInvite(name: string) {
    this.productInviteDraft.productNames = this.productInviteDraft.productNames.filter((p: string) => p !== name);
  }

  getAvailableProductsForInvite() {
    return this.products.filter(p => !this.productInviteDraft.productNames.includes(p.name));
  }

  selectPreset(cat: string, presetId: string, text: string) {
    const oldId = this.productInviteDraft.selectedPresetByCategory[cat];
    const oldText = this.productInviteDraft.insertedTextByCategory[cat];

    if (oldId === presetId) {
      // Deselect
      this.productInviteDraft.selectedPresetByCategory[cat] = null;
      if (oldText && this.productInviteDraft.conditions.includes(oldText)) {
        this.productInviteDraft.conditions = this.productInviteDraft.conditions.replace(oldText, '').trim();
      }
      this.productInviteDraft.insertedTextByCategory[cat] = null;
    } else {
      // Select or swap
      this.productInviteDraft.selectedPresetByCategory[cat] = presetId;
      
      let prefix = '';
      if (oldText) {
        const match = oldText.match(/^(\d+\.\s)/);
        if (match) {
          prefix = match[1];
        }
      } else {
        const currentCount = Object.values(this.productInviteDraft.selectedPresetByCategory).filter(v => v).length;
        prefix = `${currentCount}. `;
      }
      
      const fullText = prefix + text;
      
      if (oldText && this.productInviteDraft.conditions.includes(oldText)) {
        this.productInviteDraft.conditions = this.productInviteDraft.conditions.replace(oldText, fullText);
      } else {
        if (!this.productInviteDraft.conditions) {
          this.productInviteDraft.conditions = fullText;
        } else {
          this.productInviteDraft.conditions = this.productInviteDraft.conditions.trim() + '\n' + fullText;
        }
      }
      this.productInviteDraft.insertedTextByCategory[cat] = fullText;
    }
    
    setTimeout(() => {
      const el = document.getElementById('custom-cond-textarea');
      if (el) this.autoResizeTextarea(el);
    }, 0);
  }

  autoResizeTextarea(el: any) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  sendProductInvite() {
    if (this.productInviteDraft.productNames.length === 0) {
      this.notify('Please select at least one product');
      return;
    }
    
    let finalConditions = this.productInviteDraft.conditions;
    const condStr = finalConditions ? ` with conditions: "${finalConditions}"` : '';
    const productsList = this.productInviteDraft.productNames.join(', ');
    this.notify(`Product Invite sent for ${productsList}${condStr}.`);
    this.productInviteDraft = null;
  }

  // --- Catalog CRUD with Admission Criteria ---
  openCatalogModal(item?: Product | LoanProduct){
    this.selectedAppFeeType = null;
    this.selectedAccommType = null;
    this.selectedTuitionType = null;
    this.selectedProfileCGPA = false;
    this.selectedProfileTest = false;
    this.selectedProfileBg = false;
    if(this.role==='UNIVERSITY'){
      const p = item as Product | undefined;
      this.catalogDraft = p
        ? {
            ...p,
            intakesText: p.intakes.join(', '),
            seatsText: String(p.seats),
            minCgpa: p.minCgpa !== undefined ? p.minCgpa : (this.uniCriteria.minCgpa || 8.0),
            englishTest: p.englishTest || this.uniCriteria.englishTest || 'IELTS',
            minEnglishScore: p.minEnglishScore !== undefined ? p.minEnglishScore : (this.uniCriteria.minEnglishScore || 6.5),
            preferredCurricula: p.preferredCurricula || this.uniCriteria.preferredCurricula || 'STEM, Business',
            targetCountries: p.targetCountries || this.uniCriteria.targetCountries || 'Worldwide',
            templates: p.templates ? JSON.parse(JSON.stringify(p.templates)) : [{ name: '', scholarship: '', tuition: '', accommodation: '', description: '' }],
            url: p.url || ''
          }
        : {
            id:'', name:'', category:'', course:'', degreeLevel:'Postgraduate', country:'Canada', intakesText:'Fall 2027, Spring 2028',
            durationYears:2, tuitionFee:'CAD 40,000 / year', scholarshipRange:'0–30% tuition', seatsText:'60',
            minCgpa: this.uniCriteria.minCgpa || 8.0,
            englishTest: this.uniCriteria.englishTest || 'IELTS',
            minEnglishScore: this.uniCriteria.minEnglishScore || 6.5,
            preferredCurricula: 'STEM, Computer Science, Business',
            targetCountries: 'Canada, United Kingdom, Worldwide',
            templates: [{ name: '', scholarship: '', tuition: '', accommodation: '', description: '' }],
            url: ''
          };
    } else {
      const p = item as LoanProduct | undefined;
      this.catalogDraft = p
        ? {
            ...p,
            tenureText: p.tenureOptions.join(', '),
            countriesText: p.eligibleCountries.join(', '),
            guarantorRequired: p.guarantorRequired !== undefined ? p.guarantorRequired : this.bankCriteria.guarantorRequired,
            maxFamilyIncome: p.maxFamilyIncome !== undefined ? p.maxFamilyIncome : this.bankCriteria.maxFamilyIncome,
            templates: p.templates ? JSON.parse(JSON.stringify(p.templates)) : [{ name: '', loanAmount: '', interestRate: '', processingFee: '', tenure: '', conditions: '' }],
            url: p.url || ''
          }
        : {
            id:'', name:'', category:'', interestRateMin:8.5, interestRateMax:11.5, currency:'INR', maxAmount:'35,00,000',
            tenureText:'60, 84, 120', countriesText:'Canada, United Kingdom, Australia', collateralRequired:false,
            guarantorRequired: true, maxFamilyIncome: 1800000,
            templates: [{ name: '', loanAmount: '', interestRate: '', processingFee: '', tenure: '', conditions: '' }],
            url: ''
          };
    }
  }
  addDraftTemplate() {
    if (this.role === 'UNIVERSITY') {
      this.catalogDraft.templates.push({ name: '', scholarship: '', tuition: '', accommodation: '', description: '' });
    } else {
      this.catalogDraft.templates.push({ name: '', loanAmount: '', interestRate: '', processingFee: '', tenure: '', conditions: '' });
    }
  }
  removeDraftTemplate(index: number) {
    this.catalogDraft.templates.splice(index, 1);
  }

  downloadCsvTemplate() {
    const isBank = this.role === 'BANK';
    const csvContent = isBank 
      ? 'Product Name,Product URL,Product Category\nUnsecured Study Loan,https://example.com/loan,Financial Product\n' 
      : 'Product Name,Product URL,Product Category\nMSc Data Science,https://example.com/msc-data-science,Academic Product\n';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', isBank ? 'LoanProducts_Template.csv' : 'Products_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  importProducts(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      if (!text) return;

      const lines = text.split('\n').filter((l: string) => l.trim() !== '');
      let importCount = 0;
      
      lines.forEach((line: string, index: number) => {
        const columns = line.split(',');
        if (columns.length >= 1) {
          const name = columns[0].replace(/^"|"$/g, '').trim();
          const url = columns.length >= 2 ? columns[1].replace(/^"|"$/g, '').trim() : '';
          const category = columns.length >= 3 ? columns[2].replace(/^"|"$/g, '').trim() : '';
          
          if (name && name.toLowerCase() !== 'product name' && name.toLowerCase() !== 'product name' && name.toLowerCase() !== 'name') {
            if (this.role === 'UNIVERSITY') {
              const newProduct: Product = {
                id: `prog-csv-${Date.now()}-${index}`,
                name: name, url: url, category: category || 'Academic Product', course: name, degreeLevel: 'Postgraduate', country: '', intakes: [],
                durationYears: 1, tuitionFee: '', scholarshipRange: '—', seats: 'Rolling',
                minCgpa: 8.0, englishTest: 'IELTS', minEnglishScore: 6.5,
                preferredCurricula: 'STEM', targetCountries: 'Worldwide', templates: [],
                inviteNote: '', templateName: '', createdAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString()
              };
              this.products.push(newProduct);
            } else {
              const newLoan: LoanProduct = {
                id: `loan-csv-${Date.now()}-${index}`,
                name: name, url: url, category: category || 'Financial Product',
                interestRateMin: 5, interestRateMax: 15, currency: 'USD', maxAmount: '50000',
                tenureOptions: [5, 10], collateralRequired: false, eligibleCountries: ['Worldwide'],
                templates: [], inviteNote: '', templateName: '', createdAt: new Date().toISOString(), lastModifiedAt: new Date().toISOString()
              };
              this.loanProducts.push(newLoan);
            }
            importCount++;
          }
        }
      });
      
      if (importCount > 0) {
        if (this.role === 'UNIVERSITY') {
          localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.products));
          this.notify(`Imported ${importCount} products successfully!`);
        } else {
          localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.loanProducts));
          this.notify(`Imported ${importCount} loan products successfully!`);
        }
      } else {
        this.notify(`No valid items found in the CSV.`);
      }
      
      event.target.value = '';
    };
    reader.readAsText(file);
  }

  saveCatalogItem(){
    if(!this.catalogDraft?.name) return;
    if(this.role==='UNIVERSITY'){
      const product: Product = {
        id: this.catalogDraft.id || `prog-${Date.now()}`,
        name: this.catalogDraft.name, category: this.catalogDraft.category, course: this.catalogDraft.course, degreeLevel: this.catalogDraft.degreeLevel,
        country: this.catalogDraft.country, intakes: String(this.catalogDraft.intakesText||'').split(',').map((s:string)=>s.trim()).filter(Boolean),
        durationYears: Number(this.catalogDraft.durationYears)||1, tuitionFee: this.catalogDraft.tuitionFee, scholarshipRange: this.catalogDraft.scholarshipRange||'—',
        seats: /^\d+$/.test(String(this.catalogDraft.seatsText).trim()) ? Number(this.catalogDraft.seatsText) : 'Rolling',
        minCgpa: Number(this.catalogDraft.minCgpa) || 8.0,
        englishTest: this.catalogDraft.englishTest || 'IELTS',
        minEnglishScore: Number(this.catalogDraft.minEnglishScore) || 6.5,
        preferredCurricula: this.catalogDraft.preferredCurricula || 'STEM',
        targetCountries: this.catalogDraft.targetCountries || 'Worldwide',
        templates: this.catalogDraft.templates,
        url: this.catalogDraft.url || '',
        inviteNote: this.catalogDraft.inviteNote || '',
        templateName: this.catalogDraft.templateName || '',
        createdAt: this.catalogDraft.createdAt || new Date().toISOString(),
        lastModifiedAt: new Date().toISOString()
      };
      const idx = this.products.findIndex(p=>p.id===product.id);
      this.products = idx>=0 ? this.products.map(p=>p.id===product.id?product:p) : [...this.products, product];
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.products));
    } else {
      const product: LoanProduct = {
        id: this.catalogDraft.id || `loan-${Date.now()}`,
        name: this.catalogDraft.name, category: this.catalogDraft.category, interestRateMin: Number(this.catalogDraft.interestRateMin)||0, interestRateMax: Number(this.catalogDraft.interestRateMax)||0,
        currency: this.catalogDraft.currency||'INR', maxAmount: this.catalogDraft.maxAmount,
        tenureOptions: String(this.catalogDraft.tenureText||'').split(',').map((s:string)=>Number(s.trim())).filter((n:number)=>!!n),
        collateralRequired: !!this.catalogDraft.collateralRequired,
        eligibleCountries: String(this.catalogDraft.countriesText||'').split(',').map((s:string)=>s.trim()).filter(Boolean),
        guarantorRequired: !!this.catalogDraft.guarantorRequired,
        maxFamilyIncome: Number(this.catalogDraft.maxFamilyIncome) || undefined,
        templates: this.catalogDraft.templates,
        url: this.catalogDraft.url || '',
        inviteNote: this.catalogDraft.inviteNote || '',
        templateName: this.catalogDraft.templateName || '',
        createdAt: this.catalogDraft.createdAt || new Date().toISOString(),
        lastModifiedAt: new Date().toISOString()
      };
      const idx = this.loanProducts.findIndex(p=>p.id===product.id);
      this.loanProducts = idx>=0 ? this.loanProducts.map(p=>p.id===product.id?product:p) : [...this.loanProducts, product];
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.loanProducts));
    }
    this.notify(`${this.catalogDraft.name} saved`);
    this.catalogDraft = null;
  }

  removeAppFeeText(note: string): string {
    let result = note;
    result = result.replace(/We are pleased to offer a full application fee waiver for this product\. ?/gi, '');
    result = result.replace(/Use code .*? to receive a .*?% waiver on your application fee\. ?/gi, '');
    result = result.replace(/Use code .*? to receive a .*? discount on your application fee\. ?/gi, '');
    return result.trim();
  }

  removeAccommText(note: string): string {
    let result = note;
    result = result.replace(/Guaranteed on-campus accommodation is available for your first year\. ?/gi, '');
    result = result.replace(/You are eligible for a .*?% discount on your first-year accommodation\. ?/gi, '');
    result = result.replace(/We are pleased to offer fully subsidized on-campus accommodation\. ?/gi, '');
    return result.trim();
  }

  removeTuitionText(note: string): string {
    let result = note;
    result = result.replace(/We are thrilled to offer you a full tuition scholarship for this product\. ?/gi, '');
    result = result.replace(/Based on your academic profile, you have been awarded a .*?% tuition fee scholarship\. ?/gi, '');
    result = result.replace(/Based on your academic profile, you have been awarded a .*? tuition fee scholarship\. ?/gi, '');
    result = result.replace(/You are eligible for the reduced in-state tuition fee rate\. ?/gi, '');
    return result.trim();
  }

  toggleProfileNote(type: string) {
    if (!this.catalogDraft) return;
    let currentNote = this.catalogDraft.inviteNote || '';
    
    if (type === 'CGPA') {
      const txt = 'Your exceptional CGPA of [CGPA] makes you a standout candidate for this product. ';
      if (this.selectedProfileCGPA) {
        currentNote = currentNote.replace(txt, '');
        this.selectedProfileCGPA = false;
      } else {
        currentNote += (currentNote && !currentNote.endsWith(' ') ? ' ' : '') + txt;
        this.selectedProfileCGPA = true;
      }
    }
    else if (type === 'Test') {
      const txt = 'Your strong test scores ([TEST_SCORES]) align perfectly with our rigorous academic standards. ';
      if (this.selectedProfileTest) {
        currentNote = currentNote.replace(txt, '');
        this.selectedProfileTest = false;
      } else {
        currentNote += (currentNote && !currentNote.endsWith(' ') ? ' ' : '') + txt;
        this.selectedProfileTest = true;
      }
    }
    else if (type === 'Background') {
      const txt = 'Your unique background and experience in [FIELD] make you a great fit for our cohort. ';
      if (this.selectedProfileBg) {
        currentNote = currentNote.replace(txt, '');
        this.selectedProfileBg = false;
      } else {
        currentNote += (currentNote && !currentNote.endsWith(' ') ? ' ' : '') + txt;
        this.selectedProfileBg = true;
      }
    }
    this.catalogDraft.inviteNote = currentNote;
  }

  appendInviteNote(type: string) {
    if (!this.catalogDraft) return;

    let currentNote = this.catalogDraft.inviteNote || '';

    if (type.startsWith('App Fee')) {
      if (this.selectedAppFeeType === type) {
        this.selectedAppFeeType = null;
        this.catalogDraft.inviteNote = this.removeAppFeeText(currentNote);
        return; 
      } else {
        this.selectedAppFeeType = type;
        currentNote = this.removeAppFeeText(currentNote);
      }
    } else if (type.startsWith('Accomm')) {
      if (this.selectedAccommType === type) {
        this.selectedAccommType = null;
        this.catalogDraft.inviteNote = this.removeAccommText(currentNote);
        return; 
      } else {
        this.selectedAccommType = type;
        currentNote = this.removeAccommText(currentNote);
      }
    } else if (type.startsWith('Tuition')) {
      if (this.selectedTuitionType === type) {
        this.selectedTuitionType = null;
        this.catalogDraft.inviteNote = this.removeTuitionText(currentNote);
        return; 
      } else {
        this.selectedTuitionType = type;
        currentNote = this.removeTuitionText(currentNote);
      }
    }

    let textToAppend = '';
    let templateTitle = 'Invite';
    switch (type) {
      case 'App Fee - Full':
        textToAppend = 'We are pleased to offer a full application fee waiver for this product. ';
        templateTitle = 'Application Fee';
        break;
      case 'App Fee - %':
        textToAppend = 'Use code [CODE] to receive a [PERCENT]% waiver on your application fee. ';
        templateTitle = 'Application Fee';
        break;
      case 'App Fee - Amount':
        textToAppend = 'Use code [CODE] to receive a [AMOUNT] discount on your application fee. ';
        templateTitle = 'Application Fee';
        break;
      case 'Accomm - Guaranteed':
        textToAppend = 'Guaranteed on-campus accommodation is available for your first year. ';
        templateTitle = 'Accommodation';
        break;
      case 'Accomm - Discount':
        textToAppend = 'You are eligible for a [PERCENT]% discount on your first-year accommodation. ';
        templateTitle = 'Accommodation';
        break;
      case 'Accomm - Free':
        textToAppend = 'We are pleased to offer fully subsidized on-campus accommodation. ';
        templateTitle = 'Accommodation';
        break;
      case 'Tuition - Full':
        textToAppend = 'We are thrilled to offer you a full tuition scholarship for this product. ';
        templateTitle = 'Tuition Scholarship';
        break;
      case 'Tuition - %':
        textToAppend = 'Based on your academic profile, you have been awarded a [PERCENT]% tuition fee scholarship. ';
        templateTitle = 'Tuition Scholarship';
        break;
      case 'Tuition - Amount':
        textToAppend = 'Based on your academic profile, you have been awarded a [AMOUNT] tuition fee scholarship. ';
        templateTitle = 'Tuition Scholarship';
        break;
      case 'Tuition - In-State':
        textToAppend = 'You are eligible for the reduced in-state tuition fee rate. ';
        templateTitle = 'Tuition Scholarship';
        break;
    }
    this.catalogDraft.inviteNote = currentNote + (currentNote && !currentNote.endsWith(' ') ? ' ' : '') + textToAppend;
    
    if (!this.catalogDraft.templateName) {
      this.catalogDraft.templateName = `${templateTitle} Offer Template`;
    }
  }

  archiveProduct(p: Product) {
    if (confirm(`Are you sure you want to archive ${p.name}? This will remove it from the directory.`)) {
      this.products = this.products.filter(x => x.id !== p.id);
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.products));
      this.notify(`${p.name} archived`);
    }
  }

  archiveLoanProduct(p: LoanProduct) {
    if (confirm(`Are you sure you want to archive ${p.name}? This will remove it from the directory.`)) {
      this.loanProducts = this.loanProducts.filter(x => x.id !== p.id);
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.loanProducts));
      this.notify(`${p.name} archived`);
    }
  }

  // --- Offer templates ---
  openTemplateModal(){
    this.templateDraft = this.role==='BANK'
      ? {name:'', description:'', loanAmount:'', interestRate:'', processingFee:'', tenure:'', conditions:''}
      : {name:'', description:'', scholarship:'', tuition:'', accommodation:''};
  }
  saveTemplate(){
    if(!this.templateDraft?.name) return;
    const {name, description, ...terms} = this.templateDraft;
    const template: OfferTemplate = {id:`tpl-${Date.now()}`, name, description: description||'', terms, usedCount:0};
    this.templates = [...this.templates, template];
    localStorage.setItem(`superoffer_${this.role}_templates`, JSON.stringify(this.templates));
    this.notify('Template saved');
    this.templateDraft = null;
  }
  useTemplate(t: OfferTemplate){
    t.usedCount++;
    localStorage.setItem(`superoffer_${this.role}_templates`, JSON.stringify(this.templates));
    this.offerDraft = this.role==='BANK'
      ? {student:'', course:'', productName:'', offerType:'PreApproved', deadline:'', ...t.terms}
      : {student:'', course:'', deadline:'', ...t.terms};
    this.notify(`Started an offer from "${t.name}"`);
  }

  // --- Criteria persistence ---
  persistCriteria(){
    if(this.role==='UNIVERSITY') localStorage.setItem(`superoffer_${this.role}_criteria`, JSON.stringify(this.uniCriteria));
    else localStorage.setItem(`superoffer_${this.role}_criteria`, JSON.stringify(this.bankCriteria));
  }
  persistNotificationPrefs(){
    localStorage.setItem(`superoffer_${this.role}_notification_prefs`, JSON.stringify(this.notificationPrefs));
  }
  teamMembers: TeamMember[] = [];
  inviteDraft: { name: string; email: string; role: string } | null = null;

  openInviteModal(){ this.inviteDraft = { name:'', email:'', role: this.cfg.userTitle }; }
  sendInvite(){
    if(!this.inviteDraft?.name.trim() || !this.inviteDraft?.email.trim()) return;
    const initials = this.inviteDraft.name.trim().split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
    const member: TeamMember = { initials, name: this.inviteDraft.name.trim(), email: this.inviteDraft.email.trim(), role: this.inviteDraft.role.trim() || this.cfg.userTitle, status:'Invited' };
    this.teamMembers = [...this.teamMembers, member];
    this.persistTeam();
    this.notify(`Invite sent to ${member.email}`);
    this.inviteDraft = null;
  }
  resendInvite(member: TeamMember){ this.notify(`Invite resent to ${member.email}`); }
  removeOfficer(member: TeamMember){
    if(member.isSelf) return;
    if(!window.confirm(`Remove ${member.name} from ${this.orgName}?`)) return;
    this.teamMembers = this.teamMembers.filter(m=>m!==member);
    this.persistTeam();
    this.notify(`${member.name} removed`);
  }
  persistTeam(){ localStorage.setItem(`superoffer_${this.role}_team`, JSON.stringify(this.teamMembers)); }

  openOfferComposer(student?:any){
    const defaultOfferType:'PreApproved'|'Final' = this.bankEvaluationMode==='UNIVERSITY_OFFER_ONLY'
      ? 'Final'
      : this.bankEvaluationMode==='ACADEMIC_ONLY'
        ? 'PreApproved'
        : (student?.universityInterests?.length ? 'Final' : 'PreApproved');
    this.offerDraft = this.role==='BANK'
      ? {student:student?.name||'',course:student?.course?`MSc ${student.course}`:'',productName:'',offerType:defaultOfferType,loanAmount:'',interestRate:'',emi:'',processingFee:'',tenure:'',conditions:'',deadline:''}
      : {student:student?.name||'',course:student?.course?`MSc ${student.course}`:'',scholarship:'',tuition:'',accommodation:'',deadline:''};
    if(this.role==='UNIVERSITY') this.onOfferCourseChange();
  }
  onOfferCourseChange(){
    if(!this.offerDraft) return;
    const product = this.products.find(p=>p.name===this.offerDraft.course);
    if(product) this.offerDraft.tuition = product.tuitionFee;
  }
  onOfferProductChange(){
    if(!this.offerDraft) return;
    const product = this.loanProducts.find(p=>p.name===this.offerDraft.productName);
    if(product){
      this.offerDraft.interestRate = `${product.interestRateMin}–${product.interestRateMax}% p.a.`;
      this.offerDraft.tenure = `${product.tenureOptions[0]||''} months`;
    }
  }
  saveOffer(){
    if(!this.offerDraft?.student) return;
    const studentName = this.offerDraft.student;
    const initials=studentName.split(' ').map((x:string)=>x[0]).join('').slice(0,2).toUpperCase();
    this.offers=[{...this.offerDraft,initials,status:'Sent' as OfferStatus,sent:'Today',sentAt:Date.now()},...this.offers];
    this.notify('Offer created and dispatched');
    this.offerDraft=null;
    this.workspaceFilter='Offers';
    this.selectedCandidateName=studentName;
    this.view='students';
    this.router.navigate(['/organization', 'students']);
  }
  changePassword(){
    if(!this.passwordForm.next||this.passwordForm.next!==this.passwordForm.confirm){this.notify('New passwords do not match');return;}
    this.passwordForm={current:'',next:'',confirm:''};
    this.notify('Password updated');
  }
  choosePlan(name:string){this.currentPlan=name;this.notify(`${name} selected as your subscription plan`);}
  go(view: OrganizationView){
    if (view === 'students') {
      this.view = 'students';
      this.workspaceFilter = 'All';
      this.router.navigate(['/organization', 'students']);
      return;
    }
    if (view === 'shortlists') {
      this.view = 'students';
      this.workspaceFilter = 'Shortlisted';
      this.router.navigate(['/organization', 'students'], { queryParams: { tab: 'shortlisted' } });
      return;
    }
    if (view === 'invitations') {
      this.view = 'students';
      this.workspaceFilter = 'Offers';
      this.router.navigate(['/organization', 'students'], { queryParams: { tab: 'offers' } });
      return;
    }
    if (view === 'catalog') {
      this.view = 'templates';
      this.templatesTab = 'catalog';
      this.router.navigate(['/organization', 'templates'], { queryParams: { tab: 'catalog' } });
      return;
    }
    if (view === 'criteria') {
      this.view = 'templates';
      this.templatesTab = 'criteria';
      this.router.navigate(['/organization', 'templates'], { queryParams: { tab: 'criteria' } });
      return;
    }
    if (view === 'reports') {
      this.view = 'dashboard';
      this.router.navigate(['/organization', 'dashboard']);
      return;
    }
    if (view === 'subscription') {
      this.view = 'profile';
      this.settingsTab = 'subscription';
      this.router.navigate(['/organization', 'profile'], { queryParams: { tab: 'subscription' } });
      return;
    }
    if (view === 'settings') {
      this.view = 'profile';
      this.router.navigate(['/organization', 'profile']);
      return;
    }
    this.view = view;
    this.router.navigate(['/organization', view]);
  }
  notify(message:string){
    this.toast=message;
    window.setTimeout(()=>{if(this.toast===message)this.toast='';},2400);
  }

  private daysAgoTs(n:number): number { return Date.now() - n*86400000; }

  private defaultNotificationPrefs(){
    return [
      {key:'invitation_status', label:'Invitation status changes', detail:'Viewed, negotiated, accepted, rejected, expired', frequency:'Instant'},
      {key:'quota', label:'Quota alerts', detail:'When your subscription quota is nearing its limit', frequency:'Instant'},
      {key:'verification', label:'Verification status', detail:"Changes to your organisation's verification status", frequency:'Instant'}
    ];
  }

  private applyRole(role:Role){
    this.role=role;
    this.cfg=ROLE_CONFIG[role];
    this.orgName=this.cfg.orgNameDefault;
    this.orgDomain=this.cfg.orgDomainDefault;
    this.orgCity=this.cfg.orgCityDefault;
    this.orgDescription=this.cfg.orgDescriptionDefault;
    this.offers = role==='BANK' ? [
      {student:'Aarav Mehta',initials:'AM',course:'MSc Data Science',loanAmount:'₹38,00,000',interestRate:'9.2% p.a.',processingFee:'Waived',tenure:'10 years',conditions:'None',deadline:'2026-08-15',status:'Negotiating',sent:'24 Jul',sentAt:this.daysAgoTs(12),negotiationMessages:[{from:'student',author:'Aarav Mehta',body:'Can you offer a lower processing fee given my guarantor profile?',time:'2 days ago'}]},
      {student:'Sara Khan',initials:'SK',course:'MSc Artificial Intelligence',loanAmount:'₹42,00,000',interestRate:'8.9% p.a.',processingFee:'Waived',tenure:'12 years',conditions:'None',deadline:'2026-08-05',status:'Accepted',sent:'22 Jul',sentAt:this.daysAgoTs(9),responseHours:20},
      {student:'Daniel Okafor',initials:'DO',course:'MSc Business Analytics',loanAmount:'₹35,00,000',interestRate:'10.1% p.a.',processingFee:'1% of loan amount',tenure:'10 years',conditions:'Subject to guarantor verification',deadline:'2026-08-04',status:'Viewed',sent:'21 Jul',sentAt:this.daysAgoTs(4)},
      {student:'Mei Lin',initials:'ML',course:'MSc Computer Science',loanAmount:'₹40,00,000',interestRate:'9.0% p.a.',processingFee:'Waived',tenure:'10 years',conditions:'None',deadline:'2026-08-03',status:'Sent',sent:'20 Jul',sentAt:this.daysAgoTs(1)}
    ] : [
      {student:'Aarav Mehta',initials:'AM',course:'MSc Data Science',scholarship:'40% tuition scholarship',tuition:'CAD 42,00,000 / year',accommodation:'Campus residence available',deadline:'2026-08-15',status:'Negotiating',sent:'24 Jul',sentAt:this.daysAgoTs(12),negotiationMessages:[{from:'student',author:'Aarav Mehta',body:'Could you match this with a 45% scholarship given my test scores?',time:'2 days ago'}]},
      {student:'Sara Khan',initials:'SK',course:'MSc Artificial Intelligence',scholarship:'40% tuition scholarship',tuition:'CAD 39,500 / year',accommodation:'Off-campus support',deadline:'2026-08-05',status:'Accepted',sent:'22 Jul',sentAt:this.daysAgoTs(9),responseHours:36},
      {student:'Daniel Okafor',initials:'DO',course:'MSc Business Analytics',scholarship:'£6,000 award',tuition:'£24,000 / year',accommodation:'Not included',deadline:'2026-08-04',status:'Viewed',sent:'21 Jul',sentAt:this.daysAgoTs(4)},
      {student:'Mei Lin',initials:'ML',course:'MSc Computer Science',scholarship:'Fast-track admission',tuition:'CAD 41,000 / year',accommodation:'Campus residence available',deadline:'2026-08-03',status:'Sent',sent:'20 Jul',sentAt:this.daysAgoTs(1)}
    ];
    try{
      const saved=JSON.parse(localStorage.getItem(`superoffer_${role}_shortlist`)||'null');
      this.shortlistedNames = Array.isArray(saved) ? new Set(saved) : new Set(['Aarav Mehta','Sara Khan','Daniel Okafor']);
    }catch{ this.shortlistedNames = new Set(['Aarav Mehta','Sara Khan','Daniel Okafor']); }
    if(role==='BANK'){
      const storedMode = localStorage.getItem(BANK_EVALUATION_MODE_KEY) as BankEvaluationMode | null;
      this.bankEvaluationMode = storedMode || 'ACADEMIC_AND_OFFER';
    }

    const defaultProducts: Product[] = [
      {id:'prog-1', name:'MSc Data Science', course:'Data Science', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027','Winter 2028'], durationYears:2, tuitionFee:'CAD 42,00,000 / year', scholarshipRange:'0–40% tuition', seats:60, minCgpa:8.0, englishTest:'IELTS', minEnglishScore:6.5, preferredCurricula:'STEM, Computer Science', targetCountries:'Worldwide', createdAt:'2026-07-15T08:00:00Z', lastModifiedAt:'2026-08-01T12:00:00Z'},
      {id:'prog-2', name:'MSc Artificial Intelligence', course:'Artificial Intelligence', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027'], durationYears:2, tuitionFee:'CAD 39,500 / year', scholarshipRange:'—', seats:40, minCgpa:8.5, englishTest:'IELTS', minEnglishScore:7.0, preferredCurricula:'Computer Science, Mathematics', targetCountries:'Worldwide', createdAt:'2026-07-20T09:30:00Z', lastModifiedAt:'2026-08-02T15:45:00Z'},
      {id:'prog-3', name:'MSc Business Analytics', course:'Business Analytics', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027','Spring 2027'], durationYears:2, tuitionFee:'CAD 37,000 / year', scholarshipRange:'0–25% tuition', seats:'Rolling', minCgpa:7.5, englishTest:'IELTS', minEnglishScore:6.5, preferredCurricula:'Business, Economics, STEM', targetCountries:'Worldwide', createdAt:'2026-07-25T11:15:00Z', lastModifiedAt:'2026-08-03T10:20:00Z'},
      {id:'prog-4', name:'MSc Computer Science', course:'Computer Science', degreeLevel:'Postgraduate', country:'Canada', intakes:['Spring 2027'], durationYears:2, tuitionFee:'CAD 41,000 / year', scholarshipRange:'—', seats:50, minCgpa:8.0, englishTest:'PTE', minEnglishScore:65, preferredCurricula:'Computer Science, IT', targetCountries:'Worldwide', createdAt:'2026-07-28T14:00:00Z', lastModifiedAt:'2026-08-04T16:10:00Z'},
      {id:'prog-5', name:'MSc International Business', course:'International Business', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027'], durationYears:1, tuitionFee:'CAD 35,500 / year', scholarshipRange:'0–20% tuition', seats:'Rolling', minCgpa:7.0, englishTest:'IELTS', minEnglishScore:6.5, preferredCurricula:'Business, Commerce', targetCountries:'Worldwide', createdAt:'2026-08-01T10:30:00Z', lastModifiedAt:'2026-08-05T09:05:00Z'}
    ];
    const defaultLoanProducts: LoanProduct[] = [
      {id:'loan-1', name:'Unsecured Study Loan', interestRateMin:10.5, interestRateMax:13, currency:'INR', maxAmount:'25,00,000', tenureOptions:[60,84], collateralRequired:false, eligibleCountries:['Canada','United Kingdom','Australia'], guarantorRequired:true, maxFamilyIncome:1800000, createdAt:'2026-07-10T08:00:00Z', lastModifiedAt:'2026-07-28T11:00:00Z'},
      {id:'loan-2', name:'Secured Study Loan', interestRateMin:8.5, interestRateMax:10.5, currency:'INR', maxAmount:'50,00,000', tenureOptions:[84,120,144], collateralRequired:true, eligibleCountries:['Canada','United Kingdom','Germany','Australia','United States'], guarantorRequired:false, createdAt:'2026-07-12T09:00:00Z', lastModifiedAt:'2026-08-02T13:30:00Z'}
    ];
    if(role==='UNIVERSITY'){
      try{ 
        const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_catalog`)||'null'); 
        this.products = Array.isArray(saved)&&saved.length ? saved.map(p => ({ ...p, createdAt: p.createdAt || '2026-07-15T08:00:00Z', lastModifiedAt: p.lastModifiedAt || '2026-08-01T12:00:00Z' })) : defaultProducts; 
      }catch{ this.products = defaultProducts; }
    } else {
      try{ 
        const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_catalog`)||'null'); 
        this.loanProducts = Array.isArray(saved)&&saved.length ? saved.map(p => ({ ...p, createdAt: p.createdAt || '2026-07-10T08:00:00Z', lastModifiedAt: p.lastModifiedAt || '2026-07-28T11:00:00Z' })) : defaultLoanProducts; 
      }catch{ this.loanProducts = defaultLoanProducts; }
    }

    const defaultUniTemplates: OfferTemplate[] = [
      {id:'tpl-1', name:'40% Merit Scholarship', description:'Standard scholarship offer for high-CGPA applicants.', terms:{scholarship:'40% tuition scholarship', tuition:'CAD 42,000 / year', accommodation:'Campus residence available'}, usedCount:6},
      {id:'tpl-2', name:'Fast-track, no scholarship', description:'For applicants past scholarship deadlines who still qualify for admission.', terms:{scholarship:'', tuition:'CAD 42,000 / year', accommodation:'Off-campus support'}, usedCount:2}
    ];
    const defaultBankTemplates: OfferTemplate[] = [
      {id:'tpl-3', name:'Pre-approved standard rate', description:'Academic-profile pre-approval before admission is confirmed.', terms:{offerType:'PreApproved', loanAmount:'₹25,00,000', interestRate:'10.5% p.a.', processingFee:'1%', tenure:'', conditions:'Subject to admission confirmation'}, usedCount:9},
      {id:'tpl-4', name:'Guarantor-conditional low rate', description:'Lower rate contingent on a verified guarantor.', terms:{offerType:'Final', loanAmount:'₹40,00,000', interestRate:'9.0% p.a.', emi:'', processingFee:'Waived', tenure:'10 years', conditions:'Subject to guarantor verification'}, usedCount:4}
    ];
    try{
      const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_templates`)||'null');
      this.templates = Array.isArray(saved)&&saved.length ? saved : (role==='UNIVERSITY' ? defaultUniTemplates : defaultBankTemplates);
    }catch{ this.templates = role==='UNIVERSITY' ? defaultUniTemplates : defaultBankTemplates; }

    if(role==='UNIVERSITY'){
      try{ const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_criteria`)||'null'); if(saved) this.uniCriteria = saved; }catch{ /* keep defaults */ }
    } else {
      try{ const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_criteria`)||'null'); if(saved) this.bankCriteria = saved; }catch{ /* keep defaults */ }
    }

    try{
      const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_notification_prefs`)||'null');
      this.notificationPrefs = Array.isArray(saved)&&saved.length ? saved : this.defaultNotificationPrefs();
    }catch{ this.notificationPrefs = this.defaultNotificationPrefs(); }

    const defaultTeam: TeamMember[] = [
      {initials: this.cfg.userInitials, name: this.cfg.userName, email: `${this.cfg.userName.split(' ')[0].toLowerCase()}@${this.cfg.orgDomainDefault}`, role: this.cfg.userTitle, status:'Active', isSelf:true},
      {initials:'JD', name:'James Dutta', email:`james.dutta@${this.cfg.orgDomainDefault}`, role: this.cfg.userTitle, status:'Active'},
      {initials:'PR', name:'Priya Rao', email:`priya.rao@${this.cfg.orgDomainDefault}`, role: this.cfg.userTitle, status:'Invited'}
    ];
    try{
      const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_team`)||'null');
      this.teamMembers = Array.isArray(saved)&&saved.length ? saved : defaultTeam;
    }catch{ this.teamMembers = defaultTeam; }
  }

  setBankEvaluationMode(mode:BankEvaluationMode){
    this.bankEvaluationMode = mode;
    localStorage.setItem(BANK_EVALUATION_MODE_KEY, mode);
    this.notify(`Loan evaluation mode set to ${this.bankEvaluationModeOptions.find(o=>o.value===mode)?.label}`);
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent) {
    // No-op body: just being inside NgZone's patched listener is enough to
    // trigger change detection so newly submitted students appear live.
    if (event.key) { /* re-render */ }
  }

  constructor(private router:Router,private route:ActivatedRoute,private submittedStudentsStore:SubmittedStudentsStore){
    const storedRole = (sessionStorage.getItem('superoffer_org_type') as Role) || 'UNIVERSITY';
    this.applyRole(storedRole);
    this.route.data.subscribe(data=>{
      const page = data['page'] as OrganizationView;
      if (page === 'catalog') {
        this.view = 'templates';
        this.templatesTab = 'catalog';
      } else if (page === 'criteria') {
        this.view = 'templates';
        this.templatesTab = 'criteria';
      } else if (page === 'reports') {
        this.view = 'dashboard';
      } else if (page === 'shortlists') {
        this.view = 'students';
        this.workspaceFilter = 'Shortlisted';
      } else if (page === 'invitations') {
        this.view = 'students';
        this.workspaceFilter = 'Offers';
      } else if (page === 'subscription') {
        this.view = 'profile';
        this.settingsTab = 'subscription';
      } else if (page === 'settings') {
        this.view = 'profile';
      } else if (page) {
        this.view = page;
      }
    });
    this.route.queryParamMap.subscribe(params=>{
      const tab = params.get('tab');
      if (tab === 'catalog' || tab === 'criteria' || tab === 'templates') {
        this.templatesTab = tab;
      }
      if (tab === 'shortlisted' || tab === 'Shortlisted') this.workspaceFilter = 'Shortlisted';
      if (tab === 'offers' || tab === 'Offers') this.workspaceFilter = 'Offers';
      if (tab === 'negotiating' || tab === 'Negotiating') this.workspaceFilter = 'Negotiating';
      if (tab === 'accepted' || tab === 'Accepted') this.workspaceFilter = 'Accepted';
      if (tab === 'discover' || tab === 'Discover') this.workspaceFilter = 'Discover';
      if (tab === 'subscription' || tab === 'org' || tab === 'accreditation' || tab === 'team' || tab === 'notifications' || tab === 'security') {
        this.settingsTab = tab as SettingsTab;
      }
    });
    this.route.paramMap.subscribe(params=>{
      const id = params.get('id');
      if(id){
        const index = this.filteredStudents.findIndex(s=>s.name===id);
        if(index>=0){ this.browseIndex=index; this.studentPanelOpen=true; }
        this.view='students';
      }
    });
  }
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_org_type');this.router.navigate(['/']);}
}
