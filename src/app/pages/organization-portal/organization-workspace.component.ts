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
type SettingsTab = 'org' | 'accreditation' | 'team' | 'notifications' | 'security';

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

interface Program {
  id: string; name: string; degreeLevel: 'Undergraduate' | 'Postgraduate'; course: string; country: string;
  intakes: string[]; tuitionFee: string; scholarshipRange: string; durationYears: number; seats: number | 'Rolling';
}

interface LoanProduct {
  id: string; name: string; interestRateMin: number; interestRateMax: number; currency: string; maxAmount: string;
  tenureOptions: number[]; collateralRequired: boolean; eligibleCountries: string[];
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
    eyebrow: 'ADMISSIONS WORKSPACE', greeting: 'Good afternoon, Aisha',
    dashboardIntro: "Here's a premium overview of your student discovery pipeline.",
    cycleLabel: 'recruitment cycle', createActionLabel: 'Send admission terms',
    searchEyebrow: 'STUDENT DISCOVERY', searchTitle: 'Find best-fit students',
    searchIntro: 'Browse verified student profiles ranked by compatibility with your programmes.',
    subscriptionIntro: 'Increase the number of student profiles your university can review and invite this cycle.',
    offerVerb: 'offer', offerNoun: 'admission and scholarship proposal', offerEyebrow: 'admission',
    orgFieldLabel: 'University name', orgTypeOptions: ['Private university'],
    orgNameDefault: 'Northbridge University', orgDomainDefault: 'northbridge.edu', orgCityDefault: 'Toronto, Canada',
    orgDescriptionDefault: 'Internationally focused university offering career-led postgraduate programmes.',
    profileTabLabel: 'University Profile',
    catalogEyebrow: 'PROGRAM CATALOG', catalogTitle: 'Programmes', catalogIntro: 'Maintain the programmes you recruit for — these power search filters and match scoring.',
    templatesEyebrow: 'OFFER TEMPLATES', templatesTitle: 'Offer templates', templatesIntro: 'Start an invitation from a reusable template instead of building terms from scratch every time.',
    criteriaEyebrow: 'ADMISSION CRITERIA', criteriaTitle: 'Admission criteria', criteriaIntro: 'Set the academic thresholds AI Matching uses to rank students against your programmes.',
    reportsEyebrow: 'REPORTS', reportsTitle: 'Admissions funnel', reportsIntro: 'Track how invitations move from sent to accepted, and which programmes convert best.',
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
    eyebrow: 'EDUCATION FINANCE', greeting: 'Good afternoon, Rohan',
    dashboardIntro: "Here's a premium overview of your loan applicant pipeline.",
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
        <button class="uni-brand" type="button" (click)="go('dashboard')"><img [src]="cfg.logoSrc" [alt]="cfg.logoAlt"><strong>SuperOffer</strong></button>
        <div class="uni-org"><span>{{cfg.orgInitials}}</span><div><strong>{{orgName}}</strong><small>Verified organisation</small></div></div>
        <nav>
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id || (item.id==='profile' && view==='settings')" (click)="go(item.id)" [title]="navLabel(item.id)" [attr.aria-label]="navLabel(item.id)">
            <span>{{item.icon}}</span><strong>{{navLabel(item.id)}}</strong>
          </button>
        </nav>
        <div class="uni-plan"><span>{{currentPlan | uppercase}} PLAN</span><strong>{{profilesViewed}} of {{planQuotaLabel}}</strong><small>student profiles viewed</small><i><b [style.width.%]="quotaPercent"></b></i></div>
        <button class="uni-user" type="button" (click)="go('profile')" title="Organisation profile" aria-label="Organisation profile"><span>{{cfg.userInitials}}</span><div><strong>{{cfg.userName}}</strong><small>{{cfg.userTitle}}</small></div><b>↗</b></button>
      </aside>

      <main class="uni-main">
        <section class="uni-view" *ngIf="view==='dashboard'">
          <header class="uni-page-title"><div><span>{{cfg.eyebrow}}</span><h1>{{cfg.greeting}}</h1><p>{{cfg.dashboardIntro}}</p></div></header>

          <div class="uni-metrics">
            <article><span>CURRENT SUBSCRIPTION</span><strong>{{currentPlan}}</strong><small>{{planQuotaLabel}} profiles / cycle</small></article>
            <article><span>PROFILES VIEWED</span><strong>{{profilesViewed}}</strong><small>this {{cfg.cycleLabel}}</small></article>
            <article><span>REMAINING PROFILE CREDITS</span><strong>{{remainingCredits}}</strong><small>available to view</small></article>
            <article><span>ACTIVE OFFERS</span><strong>{{activeOffersCount}}</strong><small>awaiting a student response</small></article>
          </div>

          <section class="uni-card quick-actions-card">
            <header><div><span>QUICK ACTIONS</span><h2>Move your pipeline forward</h2></div></header>
            <div class="quick-actions">
              <button type="button" class="quick-action" (click)="go('students')"><span>⌕</span><div><strong>Browse Students</strong><small>Discover best-fit candidates</small></div></button>
              <button type="button" class="quick-action" (click)="openOfferComposer()"><span>◇</span><div><strong>Create Offer</strong><small>{{cfg.createActionLabel}}</small></div></button>
              <button type="button" class="quick-action" (click)="go('subscription')"><span>✦</span><div><strong>Upgrade Plan</strong><small>Unlock more profile credits</small></div></button>
            </div>
          </section>

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

        <section class="uni-view" *ngIf="view==='students'">
          <header class="uni-page-title"><div><span>{{cfg.searchEyebrow}}</span><h1>{{cfg.searchTitle}}</h1><p>{{cfg.searchIntro}}</p></div></header>

          <div class="candidate-toolbar">
            <button type="button" class="candidate-filter-btn" [class.active]="filtersOpen" (click)="filtersOpen=!filtersOpen">
              <span>▤</span> Filters<b class="filter-count" *ngIf="activeFilterCount">{{activeFilterCount}}</b>
            </button>
            <div class="candidate-toolbar-count"><strong>{{filteredStudents.length}}</strong> matching students<small>Results update instantly · contact details stay hidden until an offer is accepted.</small></div>
            <button type="button" class="candidate-reset-link" *ngIf="activeFilterCount" (click)="resetFilters()">Reset filters</button>
          </div>

          <div class="candidate-filter-panel" *ngIf="filtersOpen">
            <div class="filter-panel-grid">
              <div class="filter-rail-group">
                <h3>Programme &amp; destination</h3>
                <label>Course<select [(ngModel)]="filters.course"><option value="">Any course</option><option *ngFor="let c of courseOptions" [value]="c">{{c}}</option></select></label>
                <label>Degree level<select [(ngModel)]="filters.degree"><option value="">Any degree</option><option>Undergraduate</option><option>Postgraduate</option></select></label>
                <label>Preferred country<select [(ngModel)]="filters.country"><option value="">Any country</option><option *ngFor="let c of countryOptions" [value]="c">{{c}}</option></select></label>
                <label>Intake<select [(ngModel)]="filters.intake"><option value="">Any intake</option><option *ngFor="let i of intakeOptions" [value]="i">{{i}}</option></select></label>
              </div>

              <div class="filter-rail-group">
                <h3>Academic &amp; test scores</h3>
                <label>Min. CGPA / Marks<input type="number" step="0.1" min="0" max="10" [(ngModel)]="filters.cgpaMin" placeholder="e.g. 7.5"></label>
                <label>English test<select [(ngModel)]="filters.englishTest"><option value="">Any test</option><option *ngFor="let t of englishTestOptions" [value]="t">{{t}}</option></select></label>
                <label>Min. English score<input type="number" step="0.5" min="0" [(ngModel)]="filters.englishScoreMin" placeholder="e.g. 6.5"></label>
                <label>Min. GRE<input type="number" min="0" max="340" [(ngModel)]="filters.greMin" placeholder="e.g. 310"></label>
                <label>Min. GMAT<input type="number" min="0" max="800" [(ngModel)]="filters.gmatMin" placeholder="e.g. 650"></label>
                <label>Max. backlogs<input type="number" min="0" [(ngModel)]="filters.backlogsMax" placeholder="e.g. 0"></label>
              </div>

              <div class="filter-rail-group">
                <h3>Experience &amp; financial fit</h3>
                <label>Min. work experience (yrs)<input type="number" min="0" step="0.5" [(ngModel)]="filters.workExperienceMin" placeholder="e.g. 1"></label>
                <label class="filter-checkbox"><input type="checkbox" [(ngModel)]="filters.noVisaRefusals"> No prior visa refusals only</label>
                <label>Min. self-funding budget (₹)<input type="number" [(ngModel)]="filters.budgetMin" placeholder="e.g. 2000000"></label>
                <label>{{role==='BANK' ? 'Loan requirement' : 'Scholarship interest'}}<select [(ngModel)]="filters.scholarship"><option value="">Any</option><option value="yes">{{role==='BANK' ? 'Requires a loan' : 'Seeking scholarship'}}</option><option value="no">Self-funded</option></select></label>
              </div>

              <div class="filter-rail-group" *ngIf="role==='BANK'">
                <h3>Financial eligibility</h3>
                <label>Max. family income (₹/yr)<input type="number" [(ngModel)]="filters.familyIncomeMax" placeholder="e.g. 2000000"></label>
                <label>Max. loan amount needed (₹)<input type="number" [(ngModel)]="filters.requiredLoanMax" placeholder="e.g. 3000000"></label>
              </div>

              <div class="filter-rail-group" *ngIf="role==='BANK' && bankEvaluationMode!=='ACADEMIC_ONLY'">
                <h3>University interest</h3>
                <label>University name<input [(ngModel)]="filters.universityName" placeholder="e.g. Northbridge University"></label>
                <label>University course<input [(ngModel)]="filters.universityCourse" placeholder="e.g. MSc Data Science"></label>
                <label>Offer status<select [(ngModel)]="filters.offerStatus"><option value="">Any status</option><option>Offer Sent</option><option>Shortlisted</option><option>Selected</option><option>Admitted</option></select></label>
                <label *ngIf="bankEvaluationMode==='ACADEMIC_AND_OFFER'">Visibility<select [(ngModel)]="filters.visibility"><option value="">Academic + university offer (both)</option><option value="academicOnly">Academic only</option><option value="offerAvailable">University offer available</option></select></label>
              </div>
            </div>
            <footer class="filter-panel-footer">
              <button type="button" class="uni-secondary" (click)="resetFilters()">Reset all</button>
              <button type="button" class="uni-primary" (click)="filtersOpen=false">Show {{filteredStudents.length}} students</button>
            </footer>
          </div>

          <ng-container *ngIf="filteredStudents.length; else noStudents">
            <div class="student-result-list">
              <article class="student-result-row" *ngFor="let student of filteredStudents" (click)="openStudentPanel(student)">
                <div class="result-row-photo">
                  <img [src]="student.photo" [alt]="student.name">
                  <button type="button" class="result-row-save" [class.chosen]="isShortlisted(student.name)" (click)="$event.stopPropagation(); toggleShortlist(student.name)" [attr.aria-label]="isShortlisted(student.name) ? 'Remove from saved students' : 'Save student'">{{isShortlisted(student.name) ? '★' : '☆'}}</button>
                </div>
                <div class="result-row-main">
                  <div class="result-row-head">
                    <h3>{{student.name}}</h3>
                    <div class="result-row-score"><strong>{{overallScore(student)}}%</strong><small>MATCH</small></div>
                  </div>
                  <p class="result-meta">{{student.degree}} · {{student.course}}</p>
                  <p class="result-meta-sub">Targeting {{student.country}} · {{student.intake}}</p>
                  <div class="bank-badge-row result-badges" *ngIf="role==='BANK' && bankBadges(student).length">
                    <span *ngFor="let badge of bankBadges(student)" [class.pre-approved]="badge==='PRE-APPROVED'">{{badge}}</span>
                  </div>
                  <div class="result-stats">
                    <span>CGPA<b>{{student.cgpa}}</b></span>
                    <span>Tests<b>{{student.examScore}}</b></span>
                    <span>Budget<b>{{student.budget}}</b></span>
                  </div>
                </div>
                <div class="result-row-actions">
                  <button type="button" class="uni-primary" (click)="$event.stopPropagation(); openOfferComposer(student)">Send {{cfg.offerVerb}}</button>
                </div>
              </article>
            </div>
          </ng-container>
          <ng-template #noStudents><section class="uni-card empty-state"><strong>No students match your filters</strong><p>Try widening your budget, intake or score criteria.</p><button type="button" class="uni-secondary" (click)="resetFilters()">Reset filters</button></section></ng-template>

          <div class="university-panel-backdrop carousel-backdrop" *ngIf="studentPanelOpen && currentStudent" (click)="studentPanelOpen=false">
            <div class="carousel-shell" (click)="$event.stopPropagation()">
              <header class="carousel-shell-head">
                <span>Verified student · Indian national</span>
                <button type="button" (click)="studentPanelOpen=false" aria-label="Close">×</button>
              </header>

              <div class="carousel-stage">
                <button type="button" class="carousel-arrow carousel-arrow-left" (click)="swapProfile(-1)" [disabled]="browseIndex===0" aria-label="Previous candidate">‹</button>

                <div class="carousel-card" *ngFor="let item of carouselWindow; trackBy: trackByStudentName"
                  [style.transform]="cardTransform(item.offset)"
                  [style.filter]="cardBlur(item.offset)"
                  [style.opacity]="cardOpacity(item.offset)"
                  [style.zIndex]="cardZ(item.offset)"
                  [class.carousel-card-center]="item.offset===0"
                  [class.candidate-profile-panel]="item.offset===0"
                  [class.carousel-card-peek]="item.offset!==0"
                  (click)="item.offset!==0 && jumpToOffset(item.offset)">

                  <ng-container *ngIf="item.offset!==0">
                    <div class="carousel-peek">
                      <span [style.background]="item.student.color"><img [src]="item.student.photo" [alt]="item.student.name"></span>
                      <strong>{{item.student.name}}</strong>
                      <small>{{overallScore(item.student)}}% match</small>
                    </div>
                  </ng-container>

                  <ng-container *ngIf="item.offset===0">
                    <div class="candidate-profile-hero">
                      <span [style.background]="item.student.color"><img [src]="item.student.photo" [alt]="item.student.name" style="width:100%;height:100%;object-fit:cover;border-radius:inherit"></span>
                      <div><small>{{item.student.degree}} · {{item.student.course}}</small><h1>{{item.student.name}}</h1><p>Targeting {{item.student.country}} · {{item.student.intake}}</p></div>
                      <strong>{{overallScore(item.student)}}%<small>Match</small></strong>
                    </div>

                    <div class="bank-badge-row" *ngIf="role==='BANK' && bankBadges(item.student).length">
                      <span *ngFor="let badge of bankBadges(item.student)" [class.pre-approved]="badge==='PRE-APPROVED'">{{badge}}</span>
                    </div>

                    <section>
                      <dl>
                        <div><dt>CGPA / Marks</dt><dd>{{item.student.cgpa}}</dd></div>
                        <div><dt>Test scores</dt><dd>{{item.student.examScore}}</dd></div>
                        <div><dt>Budget</dt><dd>{{item.student.budget}}</dd></div>
                        <div><dt>Documents</dt><dd>{{item.student.documentsVerified}}/5 verified</dd></div>
                      </dl>
                    </section>

                    <section>
                      <div class="match-factor-list">
                        <h2>Why this match</h2>
                        <div *ngFor="let f of matchFactors(item.student)"><span>{{f.label}} ({{f.weight}}%)</span><b><i [style.width.%]="f.score"></i></b><small>{{f.score}}%</small></div>
                      </div>
                    </section>

                    <section *ngIf="role==='BANK'">
                      <div class="eligibility-pill" [class.eligible]="item.student.eligible"><span>{{item.student.eligible ? '✓ Loan eligible' : '! Needs manual review'}}</span><small>{{item.student.eligibilityNote}}</small></div>
                    </section>

                    <section class="finance-doc-block" *ngIf="role==='BANK' && item.student.needsLoan==='yes'">
                      <small>LOAN DOCUMENTS <ng-container *ngIf="item.student.financialDocuments?.length">· {{uploadedDocCount(item.student)}}/{{item.student.financialDocuments.length}} uploaded</ng-container></small>
                      <ng-container *ngIf="item.student.financialDocuments?.length; else noFinanceDocs">
                        <div class="finance-doc-row" *ngFor="let doc of item.student.financialDocuments">
                          <span [class.doc-uploaded]="doc.uploaded">{{doc.uploaded ? '✓' : '—'}}</span>
                          <strong>{{doc.label}}</strong>
                        </div>
                      </ng-container>
                      <ng-template #noFinanceDocs><p class="finance-doc-empty">Wants a loan — hasn't selected an employment category or uploaded documents yet.</p></ng-template>
                    </section>

                    <section class="uni-interest-block" *ngIf="role==='BANK' && bankEvaluationMode!=='ACADEMIC_ONLY' && item.student.universityInterests?.length">
                      <small>UNIVERSITY INTEREST</small>
                      <article *ngFor="let interest of item.student.universityInterests">
                        <span class="uni-interest-logo"><img *ngIf="interest.logo" [src]="interest.logo" [alt]="interest.university"><ng-container *ngIf="!interest.logo">{{interest.university.charAt(0)}}</ng-container></span>
                        <div><strong>{{interest.university}}</strong><small>{{interest.country}} · {{interest.course}}</small></div>
                        <b class="uni-interest-status" [class]="'status-'+interest.status.toLowerCase().replace(' ','-')">{{interest.status}}</b>
                        <div class="uni-interest-terms"><span>Scholarship <b>{{interest.scholarship||'—'}}</b></span><span>Tuition <b>{{interest.tuitionFee||'—'}}</b></span><span>Remaining <b>{{interest.remainingTuition||'—'}}</b></span><span>Living cost <b>{{interest.livingCost||'—'}}</b></span></div>
                      </article>
                    </section>

                    <section>
                      <div class="stage-skills"><small>SKILLS</small><span *ngFor="let skill of item.student.skills">{{skill}}</span></div>
                      <p class="stage-bio">{{item.student.bio}}</p>
                    </section>

                    <footer>
                      <button type="button" class="uni-secondary shortlist-toggle" [class.chosen]="isShortlisted(item.student.name)" (click)="$event.stopPropagation(); toggleShortlist(item.student.name)">{{isShortlisted(item.student.name) ? '★ Saved' : '☆ Save student'}}</button>
                      <button type="button" class="uni-primary" (click)="$event.stopPropagation(); openOfferComposer(item.student)">Send {{cfg.offerVerb}}</button>
                    </footer>
                  </ng-container>
                </div>

                <button type="button" class="carousel-arrow carousel-arrow-right" (click)="swapProfile(1)" [disabled]="browseIndex===filteredStudents.length-1" aria-label="Next candidate">›</button>
              </div>

              <div class="carousel-counter">{{browseIndex+1}} of {{filteredStudents.length}}</div>
            </div>
          </div>
        </section>

        <section class="uni-view" *ngIf="view==='shortlists'">
          <header class="uni-page-title"><div><span>SHORTLISTS</span><h1>Your shortlist</h1><p>Students you have saved for {{cfg.cycleLabel}} follow-up.</p></div></header>

          <div class="shortlist-summary">
            <button type="button" class="active"><span>★</span><div><strong>{{savedStudents.length}}</strong><small>Saved students</small></div></button>
            <button type="button" (click)="go('invitations')"><span>◇</span><div><strong>{{activeOffersCount}}</strong><small>Active offers</small></div></button>
            <button type="button" (click)="go('students')"><span>⌕</span><div><strong>{{filteredStudents.length}}</strong><small>In current search</small></div></button>
          </div>

          <div class="shortlist-table" *ngIf="savedStudents.length; else noSaved">
            <div class="shortlist-table-head"><span>Student</span><span>Match</span><span>Fit factor</span><span>Status</span><span>Actions</span></div>
            <article *ngFor="let student of savedStudents">
              <div><span class="candidate-avatar" [style.background]="student.color">{{student.initials}}</span><p><strong>{{student.name}}</strong><small>{{student.course}} · {{student.country}}</small></p></div>
              <b>{{overallScore(student)}}%</b>
              <span class="candidate-factor">{{student.factor}}</span>
              <small>Shortlisted</small>
              <div><button type="button" (click)="openOfferComposer(student)">Send {{cfg.offerVerb}}</button><button type="button" (click)="toggleShortlist(student.name)">Remove</button></div>
            </article>
          </div>
          <ng-template #noSaved><section class="uni-card empty-state"><strong>No saved students yet</strong><p>Save promising students from the discovery tab to review them later.</p><button type="button" class="uni-secondary" (click)="go('students')">Browse students</button></section></ng-template>
        </section>

        <section class="uni-view" *ngIf="view==='invitations'">
          <header class="uni-page-title"><div><span>OFFERS &amp; RESPONSES</span><h1>Invitations</h1><p>Create and track every {{cfg.offerEyebrow}} offer from sent to accepted.</p></div><button class="uni-primary" (click)="openOfferComposer()">Create offer</button></header>

          <div class="invitation-metrics">
            <div><small>TOTAL SENT</small><strong>{{offers.length}}</strong></div>
            <div><small>VIEWED</small><strong>{{viewedRate}}%</strong><span>opened at least once</span></div>
            <div><small>ACCEPTANCE RATE</small><strong>{{acceptanceRate}}%</strong></div>
            <div><small>AVG. RESPONSE TIME</small><strong>{{avgResponseTime}}</strong></div>
          </div>

          <div class="invitation-filters"><button *ngFor="let status of offerStatuses" [class.active]="offerFilter===status" (click)="offerFilter=status">{{status}}</button></div>
          <section class="university-invitations" *ngIf="filteredOffers.length; else noOffers">
            <ng-container *ngFor="let offer of filteredOffers">
              <article>
                <div><span>{{offer.initials}}</span><p><strong>{{offer.student}}</strong><small>{{offer.course}}</small></p></div>
                <p><strong>{{offerPrimary(offer)}}</strong><small>{{offerSecondary(offer)}}</small></p>
                <b [class]="statusToneClass(offer)">{{displayStatus(offer)}}</b>
                <p><strong>{{expiryLabel(offer)}}</strong><small>{{isTerminal(offer) ? 'Closed' : '14-day expiry'}}</small></p>
                <p><strong>{{offer.deadline}}</strong><small>Decision by</small></p>
                <button type="button" [disabled]="isTerminal(offer)" (click)="withdrawOffer(offer)">{{isTerminal(offer) ? 'Closed' : 'Withdraw'}}</button>
              </article>
              <div class="negotiation-alert" *ngIf="displayStatus(offer)==='Negotiating'">
                <span>↔</span>
                <div><strong>{{offer.student}} requested revised terms</strong><p>{{lastStudentMessage(offer)}}</p></div>
                <button type="button" (click)="openNegotiationPanel(offer)">Respond</button>
              </div>
            </ng-container>
          </section>
          <ng-template #noOffers><section class="uni-card empty-state"><strong>No offers yet</strong><p>Create your first offer for a saved student.</p><button type="button" class="uni-primary" (click)="openOfferComposer()">Create offer</button></section></ng-template>
        </section>

        <section class="uni-view" *ngIf="view==='catalog'">
          <header class="uni-page-title"><div><span>{{cfg.catalogEyebrow}}</span><h1>{{cfg.catalogTitle}}</h1><p>{{cfg.catalogIntro}}</p></div><button class="uni-primary" (click)="openCatalogModal()">Add {{role==='BANK' ? 'loan product' : 'programme'}}</button></header>

          <div class="catalog-note"><span>i</span><div><strong>Feeds AI Matching</strong><p>{{role==='BANK' ? 'Loan products define the rate, tenure and country limits eligibility scoring checks against.' : 'Programmes define the course, intake and tuition scoring checks against.'}}</p></div></div>

          <section class="uni-card">
            <div class="program-catalog">
              <ng-container *ngIf="role==='UNIVERSITY'">
                <article *ngFor="let p of programs">
                  <span class="program-mark">{{p.course.charAt(0)}}</span>
                  <div class="program-name"><small>{{p.degreeLevel}} · {{p.country}}</small><h2>{{p.name}}</h2><p>{{p.course}} · {{p.durationYears}}yr · Intakes: {{p.intakes.join(', ')}}</p></div>
                  <div><strong>{{p.tuitionFee}}</strong><small>Tuition / year</small></div>
                  <span>{{p.scholarshipRange}}</span>
                  <small>{{p.seats}} seats</small>
                  <button type="button" (click)="openCatalogModal(p)">Edit</button>
                </article>
                <div class="empty-state" *ngIf="!programs.length"><strong>No programmes yet</strong><p>Add your first programme to start receiving matched students.</p></div>
              </ng-container>
              <ng-container *ngIf="role==='BANK'">
                <article *ngFor="let p of loanProducts">
                  <span class="program-mark">{{p.name.charAt(0)}}</span>
                  <div class="program-name"><small>{{p.collateralRequired ? 'Secured' : 'Unsecured'}} · {{p.eligibleCountries.join(', ')}}</small><h2>{{p.name}}</h2><p>{{p.interestRateMin}}–{{p.interestRateMax}}% p.a. · up to {{p.currency}} {{p.maxAmount}}</p></div>
                  <div><strong>{{p.interestRateMin}}–{{p.interestRateMax}}%</strong><small>Interest rate</small></div>
                  <span>up to {{p.currency}} {{p.maxAmount}}</span>
                  <small>{{p.tenureOptions.join('/')}}mo</small>
                  <button type="button" (click)="openCatalogModal(p)">Edit</button>
                </article>
                <div class="empty-state" *ngIf="!loanProducts.length"><strong>No loan products yet</strong><p>Add your first product to start receiving matched students.</p></div>
              </ng-container>
            </div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='templates'">
          <header class="uni-page-title"><div><span>{{cfg.templatesEyebrow}}</span><h1>{{cfg.templatesTitle}}</h1><p>{{cfg.templatesIntro}}</p></div></header>
          <div class="template-grid">
            <article *ngFor="let t of templates">
              <span>{{role==='BANK'?'LOAN TEMPLATE':'ADMISSION TEMPLATE'}}</span>
              <h2>{{t.name}}</h2>
              <p>{{t.description}}</p>
              <small>Used {{t.usedCount}} time{{t.usedCount===1?'':'s'}}</small>
              <button type="button" (click)="useTemplate(t)">Use template</button>
            </article>
            <div class="new-template" (click)="openTemplateModal()"><b>+</b><span>New template</span></div>
          </div>
        </section>

        <section class="uni-view" *ngIf="view==='criteria'">
          <header class="uni-page-title"><div><span>{{cfg.criteriaEyebrow}}</span><h1>{{cfg.criteriaTitle}}</h1><p>{{cfg.criteriaIntro}}</p></div></header>

          <section class="uni-card">
            <header><div><span>THRESHOLDS</span><h2>Your {{role==='BANK'?'eligibility':'admission'}} rules</h2><p>These drive the match score and eligibility badges students see in Search.</p></div></header>
            <ng-container *ngIf="role==='UNIVERSITY'">
              <div class="criteria-grid" style="padding:0 22px 22px">
                <label>Minimum CGPA / marks (out of 10)<input type="number" step="0.1" min="0" max="10" [(ngModel)]="uniCriteria.minCgpa" (ngModelChange)="persistCriteria()"></label>
                <label>Minimum English test<select [(ngModel)]="uniCriteria.englishTest" (ngModelChange)="persistCriteria()"><option *ngFor="let t of englishTestOptions" [value]="t">{{t}}</option></select></label>
                <label>Minimum English score<input type="number" step="0.5" min="0" [(ngModel)]="uniCriteria.minEnglishScore" (ngModelChange)="persistCriteria()"></label>
                <label>Preferred curricula<input [(ngModel)]="uniCriteria.preferredCurricula" (ngModelChange)="persistCriteria()" placeholder="e.g. STEM, Business"></label>
                <label class="wide">Target countries<input [(ngModel)]="uniCriteria.targetCountries" (ngModelChange)="persistCriteria()" placeholder="e.g. Canada, United Kingdom"></label>
              </div>
            </ng-container>
            <ng-container *ngIf="role==='BANK'">
              <div class="bank-eval-options">
                <label *ngFor="let option of bankEvaluationModeOptions" [class.selected]="bankEvaluationMode===option.value">
                  <input type="radio" name="bankEvaluationMode" [value]="option.value" [checked]="bankEvaluationMode===option.value" (change)="setBankEvaluationMode(option.value)">
                  <strong>{{option.label}}</strong>
                  <p>{{option.description}}</p>
                </label>
              </div>
              <div class="criteria-grid" style="padding:0 22px 22px">
                <label class="filter-checkbox"><input type="checkbox" [(ngModel)]="bankCriteria.guarantorRequired" (ngModelChange)="persistCriteria()"> Require a verified guarantor</label>
                <label>Max family income for subsidy eligibility (₹/yr)<input type="number" [(ngModel)]="bankCriteria.maxFamilyIncome" (ngModelChange)="persistCriteria()"></label>
                <label class="wide">Eligible countries<input [(ngModel)]="bankCriteria.eligibleCountries" (ngModelChange)="persistCriteria()" placeholder="e.g. Canada, United Kingdom"></label>
              </div>
            </ng-container>
          </section>

          <section class="uni-card" style="margin-top:16px">
            <header><div><span>AI MATCHING WEIGHTS</span><h2>How Match Score is calculated</h2><p>Set platform-wide by Super Admin — shown here so you understand what drives ranking.</p></div></header>
            <div class="criteria-weights" style="padding:0 22px 22px">
              <span *ngFor="let f of cfg.weightFactors"><b [style.width.%]="f.weight*2.2"></b>{{f.label}}<strong>{{f.weight}}%</strong></span>
            </div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='reports'">
          <header class="uni-page-title"><div><span>{{cfg.reportsEyebrow}}</span><h1>{{cfg.reportsTitle}}</h1><p>{{cfg.reportsIntro}}</p></div></header>

          <div class="uni-report-summary">
            <article><span>TOTAL INVITATIONS</span><strong>{{offers.length}}</strong></article>
            <article><span>ACCEPTANCE RATE</span><strong>{{acceptanceRate}}%</strong></article>
            <article><span>AVG. RESPONSE TIME</span><strong>{{avgResponseTime}}</strong></article>
          </div>

          <section class="uni-card uni-funnel-chart">
            <header><div><span>FUNNEL</span><h2>Sent → Viewed → Negotiating → Accepted</h2></div></header>
            <div *ngFor="let stage of funnelStages"><span>{{stage.label}}</span><i><b>{{stage.count}}</b></i><small>{{stage.percent}}%</small></div>
          </section>

          <div class="report-grid">
            <article class="uni-card">
              <div><h2>{{role==='BANK' ? 'Rate sensitivity' : 'Programme performance'}}</h2><span>Acceptance rate by {{role==='BANK'?'interest rate band':'programme'}}</span></div>
              <div class="bar-chart">
                <span *ngFor="let bar of performanceBars"><i [style.height.%]="bar.percent"></i><b>{{bar.percent}}%</b><small>{{bar.label}}</small></span>
              </div>
            </article>
            <article class="uni-card">
              <div><h2>{{role==='BANK' ? 'Terms vs. acceptance' : 'Best converting match bands'}}</h2></div>
              <ol>
                <li *ngFor="let row of rankedInsights"><b>{{row.icon}}</b><p><strong>{{row.label}}</strong><small>{{row.detail}}</small></p><span>{{row.value}}</span></li>
              </ol>
            </article>
          </div>
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

        <section class="uni-view" *ngIf="view==='subscription'">
          <header class="uni-page-title"><div><span>SUBSCRIPTION &amp; ACCESS</span><h1>Reach more qualified students</h1><p>{{cfg.subscriptionIntro}}</p></div></header>
          <div class="current-usage"><div><span>CURRENT PLAN</span><strong>{{currentPlan}}</strong><small>{{profilesViewed}} of {{planQuotaLabel}} student profiles viewed</small></div><div><b>{{quotaPercent}}%</b><i><span [style.width.%]="quotaPercent"></span></i><small>{{remainingCredits}} profile views available</small></div></div>
          <div class="plan-options">
            <article *ngFor="let plan of planOptions" [class.recommended]="plan.recommended"><span *ngIf="plan.recommended">RECOMMENDED</span><h3>{{plan.name}}</h3><strong>{{plan.profiles}}</strong><small>student profile views / cycle</small>
              <ul class="plan-feature-list">
                <li *ngFor="let feature of plan.features">✓ {{feature}}</li>
                <li *ngFor="let feature of advancedFeatures" [class.plan-feature-unlocked]="plan.unlocks.includes(feature)" [class.plan-feature-locked]="!plan.unlocks.includes(feature)">{{plan.unlocks.includes(feature) ? '✓' : '🔒'}} {{feature}}</li>
              </ul>
              <button type="button" [class.uni-primary]="plan.name!==currentPlan" [class.uni-secondary]="plan.name===currentPlan" [disabled]="plan.name===currentPlan" (click)="choosePlan(plan.name)">{{plan.name===currentPlan?'Current plan':'Choose '+plan.name}}</button>
            </article>
          </div>
          <p class="subscription-note">Plan changes are mock frontend interactions until subscription billing is connected.</p>
        </section>

        <section class="uni-view" *ngIf="view==='profile' || view==='settings'">
          <header class="uni-page-title"><div><span>ORGANISATION</span><h1>{{cfg.profileTabLabel}} &amp; Settings</h1><p>Manage your organisation profile and account settings.</p></div><span class="org-verified">✓ Verified organisation</span></header>

          <div class="settings-rail">
            <button *ngFor="let tab of settingsTabs" type="button" [class.active]="settingsTab===tab.id" (click)="settingsTab=tab.id">{{tab.label}}</button>
          </div>

          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='org'">
            <header><h2>{{cfg.profileTabLabel}}</h2><p>Manage your organisation profile details.</p></header>
            <div class="settings-form"><label>{{cfg.orgFieldLabel}}<input [(ngModel)]="orgName"></label><label>Official domain<input [(ngModel)]="orgDomain"></label><label>Organisation type<select><option *ngFor="let t of cfg.orgTypeOptions">{{t}}</option></select></label><label>Head office / campus<input [(ngModel)]="orgCity"></label><label class="wide">Organisation description<textarea [(ngModel)]="orgDescription"></textarea></label></div>
            <footer><button class="uni-primary" (click)="notify('Organisation profile saved')">Save changes</button></footer>
          </section>

          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='accreditation'">
            <header><h2>Accreditation</h2><p>{{role==='BANK' ? 'License and registration documents on file.' : 'Accreditation documents on file.'}}</p></header>
            <div class="accreditation-row"><span>✓</span><div><strong>{{role==='BANK' ? 'NBFC registration certificate' : 'University accreditation certificate'}}</strong><p>Verified · on file with SuperOffer</p></div><button type="button" (click)="notify('Re-upload flow is not connected in this preview')">Re-upload</button></div>
          </section>

          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='team'">
            <header><div><h2>Team</h2><p>Officers under {{orgName}}.</p></div><button *ngIf="currentPlan==='Enterprise'" type="button" (click)="openInviteModal()">+ Invite officer</button></header>
            <ng-container *ngIf="currentPlan==='Enterprise'; else teamLocked">
              <div class="team-row" *ngFor="let member of teamMembers">
                <span>{{member.initials}}</span>
                <p><strong>{{member.name}}{{member.isSelf ? ' (you)' : ''}}</strong><small>{{member.email}} · {{member.role}}</small></p>
                <b [class.status-invited]="member.status==='Invited'">{{member.status}}</b>
                <div class="team-row-actions">
                  <button type="button" *ngIf="member.status==='Invited'" (click)="resendInvite(member)">Resend</button>
                  <button type="button" *ngIf="!member.isSelf" (click)="removeOfficer(member)">Remove</button>
                </div>
              </div>
            </ng-container>
            <ng-template #teamLocked><div class="empty-state"><strong>Team management is an Enterprise feature</strong><p>Upgrade your plan to invite other officers under {{orgName}}.</p><button type="button" class="uni-secondary" (click)="go('subscription')">View plans</button></div></ng-template>
          </section>

          <section class="uni-card uni-org-settings" *ngIf="settingsTab==='notifications'">
            <header><h2>Notification preferences</h2><p>Choose how you're notified about invitation and account activity.</p></header>
            <div class="notification-setting" *ngFor="let pref of notificationPrefs"><p><strong>{{pref.label}}</strong><small>{{pref.detail}}</small></p><select [(ngModel)]="pref.frequency" (ngModelChange)="persistNotificationPrefs()"><option>Instant</option><option>Daily digest</option><option>Off</option></select></div>
          </section>

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

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="offerDraft" (click)="offerDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveOffer()" (click)="$event.stopPropagation()">
          <header><div><small>NEW OFFER</small><h2>Create offer</h2><p>Prepare a clear {{cfg.offerNoun}}.</p></div><button type="button" (click)="offerDraft=null">×</button></header>
          <div class="composer-grid">
            <label>Student<select name="offerStudent" required [(ngModel)]="offerDraft.student"><option value="" disabled>Select a student</option><option *ngFor="let s of students" [value]="s.name">{{s.name}}</option></select></label>
            <ng-container *ngIf="role==='UNIVERSITY'">
              <label>Programme<select name="offerCourse" required [(ngModel)]="offerDraft.course" (ngModelChange)="onOfferCourseChange()"><option value="" disabled>Select a programme</option><option *ngFor="let p of programs" [value]="p.name">{{p.name}}</option></select></label>
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

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="catalogDraft" (click)="catalogDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveCatalogItem()" (click)="$event.stopPropagation()">
          <header><div><small>{{catalogDraft.id ? 'EDIT' : 'NEW'}} {{role==='BANK'?'LOAN PRODUCT':'PROGRAMME'}}</small><h2>{{catalogDraft.id ? 'Edit' : 'Add'}} {{role==='BANK'?'loan product':'programme'}}</h2><p>{{cfg.catalogIntro}}</p></div><button type="button" (click)="catalogDraft=null">×</button></header>
          <div class="composer-grid">
            <ng-container *ngIf="role==='UNIVERSITY'">
              <label>Programme name<input name="pName" required [(ngModel)]="catalogDraft.name" placeholder="e.g. MSc Data Science"></label>
              <label>Course/major<input name="pCourse" required [(ngModel)]="catalogDraft.course" placeholder="e.g. Data Science"></label>
              <label>Degree level<select name="pDegree" [(ngModel)]="catalogDraft.degreeLevel"><option>Postgraduate</option><option>Undergraduate</option></select></label>
              <label>Country<input name="pCountry" required [(ngModel)]="catalogDraft.country" placeholder="e.g. Canada"></label>
              <label>Intakes (comma separated)<input name="pIntakes" [(ngModel)]="catalogDraft.intakesText" placeholder="e.g. Fall 2027, Winter 2028"></label>
              <label>Duration (years)<input name="pDuration" type="number" min="1" [(ngModel)]="catalogDraft.durationYears"></label>
              <label>Tuition fee<input name="pTuition" required [(ngModel)]="catalogDraft.tuitionFee" placeholder="e.g. CAD 42,000 / year"></label>
              <label>Scholarship range<input name="pScholarship" [(ngModel)]="catalogDraft.scholarshipRange" placeholder="e.g. 0–40% tuition"></label>
              <label>Seats (or 'Rolling')<input name="pSeats" [(ngModel)]="catalogDraft.seatsText" placeholder="e.g. 60 or Rolling"></label>
            </ng-container>
            <ng-container *ngIf="role==='BANK'">
              <label>Product name<input name="lName" required [(ngModel)]="catalogDraft.name" placeholder="e.g. Unsecured Study Loan"></label>
              <label>Min interest rate (%)<input name="lRateMin" type="number" step="0.1" required [(ngModel)]="catalogDraft.interestRateMin"></label>
              <label>Max interest rate (%)<input name="lRateMax" type="number" step="0.1" required [(ngModel)]="catalogDraft.interestRateMax"></label>
              <label>Currency<input name="lCurrency" [(ngModel)]="catalogDraft.currency" placeholder="e.g. INR"></label>
              <label>Max loan amount<input name="lMaxAmount" required [(ngModel)]="catalogDraft.maxAmount" placeholder="e.g. 50,00,000"></label>
              <label>Tenure options in months (comma separated)<input name="lTenure" [(ngModel)]="catalogDraft.tenureText" placeholder="e.g. 60, 84, 120"></label>
              <label class="wide">Eligible countries (comma separated)<input name="lCountries" [(ngModel)]="catalogDraft.countriesText" placeholder="e.g. Canada, United Kingdom"></label>
              <label class="filter-checkbox"><input type="checkbox" name="lCollateral" [(ngModel)]="catalogDraft.collateralRequired"> Collateral required</label>
            </ng-container>
          </div>
          <footer><button class="uni-secondary" type="button" (click)="catalogDraft=null">Cancel</button><button class="uni-primary" type="submit">Save {{role==='BANK'?'product':'programme'}}</button></footer>
        </form>
      </div>

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="templateDraft" (click)="templateDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveTemplate()" (click)="$event.stopPropagation()">
          <header><div><small>NEW TEMPLATE</small><h2>Save an offer template</h2><p>Reuse these terms next time you start an invitation.</p></div><button type="button" (click)="templateDraft=null">×</button></header>
          <div class="composer-grid">
            <label class="wide">Template name<input name="tName" required [(ngModel)]="templateDraft.name" placeholder="e.g. 40% Merit Scholarship"></label>
            <label class="wide">Description<input name="tDescription" [(ngModel)]="templateDraft.description" placeholder="When should officers use this template?"></label>
            <ng-container *ngIf="role==='UNIVERSITY'">
              <label>Scholarship<input name="tScholarship" [(ngModel)]="templateDraft.scholarship" placeholder="e.g. 40% tuition scholarship"></label>
              <label>Tuition fee<input name="tTuition" [(ngModel)]="templateDraft.tuition" placeholder="e.g. CAD 42,000 / year"></label>
              <label>Accommodation<input name="tAccommodation" [(ngModel)]="templateDraft.accommodation" placeholder="e.g. Campus residence available"></label>
            </ng-container>
            <ng-container *ngIf="role==='BANK'">
              <label>Loan amount<input name="tLoanAmount" [(ngModel)]="templateDraft.loanAmount" placeholder="e.g. ₹25,00,000"></label>
              <label>Interest rate<input name="tInterestRate" [(ngModel)]="templateDraft.interestRate" placeholder="e.g. 10.5% p.a."></label>
              <label>Processing fee<input name="tProcessingFee" [(ngModel)]="templateDraft.processingFee" placeholder="e.g. 1% waived"></label>
              <label>Repayment tenure<input name="tTenure" [(ngModel)]="templateDraft.tenure" placeholder="e.g. 10 years"></label>
              <label class="wide">Conditions<input name="tConditions" [(ngModel)]="templateDraft.conditions" placeholder="e.g. Subject to guarantor verification"></label>
            </ng-container>
          </div>
          <footer><button class="uni-secondary" type="button" (click)="templateDraft=null">Cancel</button><button class="uni-primary" type="submit">Save template</button></footer>
        </form>
      </div>

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="negotiationOffer" (click)="negotiationOffer=null">
        <form class="university-offer-composer" (ngSubmit)="sendNegotiationReply()" (click)="$event.stopPropagation()">
          <header><div><small>NEGOTIATION</small><h2>{{negotiationOffer.student}}</h2><p>{{offerPrimary(negotiationOffer)}} · {{offerSecondary(negotiationOffer)}}</p></div><button type="button" (click)="negotiationOffer=null">×</button></header>
          <div class="composer-warning"><span>!</span><p>The student's counter-request is one-time; you may reply with revised terms or hold firm, any number of times — only the student can accept or reject.</p></div>
          <div *ngFor="let m of negotiationOffer.negotiationMessages" style="margin:10px 0;padding:10px 12px;border-radius:9px;background:#f6f8f7"><strong style="font-size:12px">{{m.author}}</strong><p style="margin:4px 0 0;font-size:13px;color:#4a564f">{{m.body}}</p></div>
          <label class="wide">Your response<textarea required [(ngModel)]="negotiationReply" name="negotiationReply" placeholder="e.g. We can offer 35% scholarship with fast-track admission, final."></textarea></label>
          <footer><button class="uni-secondary" type="button" (click)="negotiationOffer=null">Cancel</button><button class="uni-primary" type="submit">Send response</button></footer>
        </form>
      </div>

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="inviteDraft" (click)="inviteDraft=null">
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
  offerFilter = 'All';
  shortlistedNames = new Set(['Aarav Mehta', 'Sara Khan', 'Daniel Okafor']);
  bankEvaluationMode: BankEvaluationMode = 'ACADEMIC_AND_OFFER';
  bankEvaluationModeOptions: Array<{ value: BankEvaluationMode; label: string; description: string }> = [
    { value: 'ACADEMIC_ONLY', label: 'Academic Profile Only', description: 'Pre-approve students before admission, based on academic and financial profile alone.' },
    { value: 'UNIVERSITY_OFFER_ONLY', label: 'University Offer Only', description: 'Only evaluate students who already hold at least one university offer.' },
    { value: 'ACADEMIC_AND_OFFER', label: 'Academic + University Offer', description: 'See every student. Pre-approve on academics, then upgrade to a final loan offer once admitted.' }
  ];

  navigation: Array<{id:OrganizationView;label:string;icon:string}> = [
    {id:'dashboard',label:'Dashboard',icon:'▦'},
    {id:'students',label:'Students',icon:'⌕'},
    {id:'shortlists',label:'Shortlists',icon:'★'},
    {id:'invitations',label:'Invitations',icon:'◇'},
    {id:'catalog',label:'Catalog',icon:'▤'},
    {id:'templates',label:'Templates',icon:'▧'},
    {id:'criteria',label:'Criteria',icon:'◎'},
    {id:'reports',label:'Reports',icon:'▥'},
    {id:'notifications',label:'Notifications',icon:'◌'},
    {id:'subscription',label:'Subscription',icon:'✦'},
    {id:'profile',label:'Profile & Settings',icon:'◈'}
  ];

  navLabel(id: OrganizationView): string {
    if (id === 'catalog') return this.cfg.catalogTitle;
    if (id === 'criteria') return this.cfg.criteriaTitle;
    return this.navigation.find(n => n.id === id)?.label || '';
  }

  currentPlan = 'Professional';
  profilesViewed = 142;
  planCapacity: Record<string, number> = {Basic:50,Professional:200,Enterprise:Infinity};
  advancedFeatures = ['Advanced Filters','Priority Discovery','AI Recommendations'];
  planOptions = [
    {name:'Basic',profiles:'50',recommended:false,features:['Core student search','Save student profiles','Create offers'],unlocks:[] as string[]},
    {name:'Professional',profiles:'200',recommended:true,features:['Everything in Basic'],unlocks:['Advanced Filters','Priority Discovery']},
    {name:'Enterprise',profiles:'Unlimited',recommended:false,features:['Everything in Professional'],unlocks:['Advanced Filters','Priority Discovery','AI Recommendations']}
  ];
  passwordForm = {current:'',next:'',confirm:''};

  offerStatuses = ['All','Sent','Viewed','Negotiating','Accepted','Rejected','Withdrawn','Expired'];
  offers: Offer[] = [];

  // Catalog, templates and criteria — populated per role in applyRole().
  programs: Program[] = [];
  loanProducts: LoanProduct[] = [];
  templates: OfferTemplate[] = [];
  uniCriteria: UniversityCriteria = { minCgpa: 7.5, minEnglishScore: 6.5, englishTest: 'IELTS', preferredCurricula: 'STEM, Business', targetCountries: 'Canada, United Kingdom' };
  bankCriteria: BankCriteria = { guarantorRequired: true, maxFamilyIncome: 2000000, eligibleCountries: 'Canada, United Kingdom, Australia' };
  catalogDraft: any = null;
  templateDraft: any = null;
  negotiationOffer: Offer | null = null;
  negotiationReply = '';

  settingsTab: SettingsTab = 'org';
  settingsTabs: Array<{id:SettingsTab;label:string}> = [
    {id:'org',label:'Org Profile'},
    {id:'accreditation',label:'Accreditation'},
    {id:'team',label:'Team'},
    {id:'notifications',label:'Notifications'},
    {id:'security',label:'Security'}
  ];
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
    {name:'Sara Khan',initials:'SK',photo:'/intelligent-matching-students.png',course:'Artificial Intelligence',country:'Canada',degree:'Postgraduate',cgpa:'9.1 / 10',cgpaValue:9.1,ielts:8.0,englishTest:'IELTS' as const,englishScore:8.0,backlogs:0,workExperienceYears:1,visaRefused:false,documentsVerified:5,examScore:'IELTS 8.0 · GMAT 710',budget:'₹42,00,000',budgetValue:4200000,financialSummary:'Sponsored · Income proof verified',skills:['R','Excel','Econometrics','Power BI'],factor:'Excellent programme fit',intake:'Fall 2027',scholarshipSeeking:false,bio:'Quantitative graduate with internships in fintech research and market strategy.',color:'#315d88',eligible:true,eligibilityNote:'Strong sponsor income and complete documentation support the full requested amount.',
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

      const matchingProgram = this.programs.find(p => p.course === s.course);
      const courseAlignment = matchingProgram ? 92 : 55;

      const targetCountries = this.uniTargetCountriesList;
      const inTargetCountry = !targetCountries.length || targetCountries.includes(s.country);
      const intakeMatches = matchingProgram ? matchingProgram.intakes.includes(s.intake) : false;
      const countryIntakeAlignment = inTargetCountry && intakeMatches ? 95 : inTargetCountry ? 65 : 35;

      const scholarshipAvailable = !!matchingProgram && !!matchingProgram.scholarshipRange && matchingProgram.scholarshipRange !== '—';
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

  // --- Catalog CRUD ---
  openCatalogModal(item?: Program | LoanProduct){
    if(this.role==='UNIVERSITY'){
      const p = item as Program | undefined;
      this.catalogDraft = p ? {...p, intakesText: p.intakes.join(', '), seatsText: String(p.seats)} : {id:'', name:'', course:'', degreeLevel:'Postgraduate', country:'', intakesText:'', durationYears:2, tuitionFee:'', scholarshipRange:'', seatsText:''};
    } else {
      const p = item as LoanProduct | undefined;
      this.catalogDraft = p ? {...p, tenureText: p.tenureOptions.join(', '), countriesText: p.eligibleCountries.join(', ')} : {id:'', name:'', interestRateMin:8, interestRateMax:12, currency:'INR', maxAmount:'', tenureText:'', countriesText:'', collateralRequired:false};
    }
  }
  saveCatalogItem(){
    if(!this.catalogDraft?.name) return;
    if(this.role==='UNIVERSITY'){
      const program: Program = {
        id: this.catalogDraft.id || `prog-${Date.now()}`,
        name: this.catalogDraft.name, course: this.catalogDraft.course, degreeLevel: this.catalogDraft.degreeLevel,
        country: this.catalogDraft.country, intakes: String(this.catalogDraft.intakesText||'').split(',').map((s:string)=>s.trim()).filter(Boolean),
        durationYears: Number(this.catalogDraft.durationYears)||1, tuitionFee: this.catalogDraft.tuitionFee, scholarshipRange: this.catalogDraft.scholarshipRange||'—',
        seats: /^\d+$/.test(String(this.catalogDraft.seatsText).trim()) ? Number(this.catalogDraft.seatsText) : 'Rolling'
      };
      const idx = this.programs.findIndex(p=>p.id===program.id);
      this.programs = idx>=0 ? this.programs.map(p=>p.id===program.id?program:p) : [...this.programs, program];
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.programs));
    } else {
      const product: LoanProduct = {
        id: this.catalogDraft.id || `loan-${Date.now()}`,
        name: this.catalogDraft.name, interestRateMin: Number(this.catalogDraft.interestRateMin)||0, interestRateMax: Number(this.catalogDraft.interestRateMax)||0,
        currency: this.catalogDraft.currency||'INR', maxAmount: this.catalogDraft.maxAmount,
        tenureOptions: String(this.catalogDraft.tenureText||'').split(',').map((s:string)=>Number(s.trim())).filter((n:number)=>!!n),
        collateralRequired: !!this.catalogDraft.collateralRequired,
        eligibleCountries: String(this.catalogDraft.countriesText||'').split(',').map((s:string)=>s.trim()).filter(Boolean)
      };
      const idx = this.loanProducts.findIndex(p=>p.id===product.id);
      this.loanProducts = idx>=0 ? this.loanProducts.map(p=>p.id===product.id?product:p) : [...this.loanProducts, product];
      localStorage.setItem(`superoffer_${this.role}_catalog`, JSON.stringify(this.loanProducts));
    }
    this.notify(`${this.catalogDraft.name} saved`);
    this.catalogDraft = null;
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
    const program = this.programs.find(p=>p.name===this.offerDraft.course);
    if(program) this.offerDraft.tuition = program.tuitionFee;
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
    const initials=this.offerDraft.student.split(' ').map((x:string)=>x[0]).join('').slice(0,2).toUpperCase();
    this.offers=[{...this.offerDraft,initials,status:'Sent' as OfferStatus,sent:'Today',sentAt:Date.now()},...this.offers];
    this.notify('Offer created');
    this.offerDraft=null;
    this.go('invitations');
  }
  changePassword(){
    if(!this.passwordForm.next||this.passwordForm.next!==this.passwordForm.confirm){this.notify('New passwords do not match');return;}
    this.passwordForm={current:'',next:'',confirm:''};
    this.notify('Password updated');
  }
  choosePlan(name:string){this.currentPlan=name;this.notify(`${name} selected as your subscription plan`);}
  go(view: OrganizationView){this.view=view;this.router.navigate(['/organization',view]);}
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
      {student:'Aarav Mehta',initials:'AM',course:'MSc Data Science',scholarship:'40% tuition scholarship',tuition:'CAD 42,000 / year',accommodation:'Campus residence available',deadline:'2026-08-15',status:'Negotiating',sent:'24 Jul',sentAt:this.daysAgoTs(12),negotiationMessages:[{from:'student',author:'Aarav Mehta',body:'Could you match this with a 45% scholarship given my test scores?',time:'2 days ago'}]},
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

    const defaultPrograms: Program[] = [
      {id:'prog-1', name:'MSc Data Science', course:'Data Science', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027','Winter 2028'], durationYears:2, tuitionFee:'CAD 42,000 / year', scholarshipRange:'0–40% tuition', seats:60},
      {id:'prog-2', name:'MSc Artificial Intelligence', course:'Artificial Intelligence', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027'], durationYears:2, tuitionFee:'CAD 39,500 / year', scholarshipRange:'—', seats:40},
      {id:'prog-3', name:'MSc Business Analytics', course:'Business Analytics', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027','Spring 2027'], durationYears:2, tuitionFee:'CAD 37,000 / year', scholarshipRange:'0–25% tuition', seats:'Rolling'},
      {id:'prog-4', name:'MSc Computer Science', course:'Computer Science', degreeLevel:'Postgraduate', country:'Canada', intakes:['Spring 2027'], durationYears:2, tuitionFee:'CAD 41,000 / year', scholarshipRange:'—', seats:50},
      {id:'prog-5', name:'MSc International Business', course:'International Business', degreeLevel:'Postgraduate', country:'Canada', intakes:['Fall 2027'], durationYears:1, tuitionFee:'CAD 35,500 / year', scholarshipRange:'0–20% tuition', seats:'Rolling'}
    ];
    const defaultLoanProducts: LoanProduct[] = [
      {id:'loan-1', name:'Unsecured Study Loan', interestRateMin:10.5, interestRateMax:13, currency:'INR', maxAmount:'25,00,000', tenureOptions:[60,84], collateralRequired:false, eligibleCountries:['Canada','United Kingdom','Australia']},
      {id:'loan-2', name:'Secured Study Loan', interestRateMin:8.5, interestRateMax:10.5, currency:'INR', maxAmount:'50,00,000', tenureOptions:[84,120,144], collateralRequired:true, eligibleCountries:['Canada','United Kingdom','Germany','Australia','United States']}
    ];
    if(role==='UNIVERSITY'){
      try{ const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_catalog`)||'null'); this.programs = Array.isArray(saved)&&saved.length ? saved : defaultPrograms; }catch{ this.programs = defaultPrograms; }
    } else {
      try{ const saved = JSON.parse(localStorage.getItem(`superoffer_${role}_catalog`)||'null'); this.loanProducts = Array.isArray(saved)&&saved.length ? saved : defaultLoanProducts; }catch{ this.loanProducts = defaultLoanProducts; }
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
      if(data['page']) this.view=data['page'] as OrganizationView;
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
