import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationType } from '../../core/organization.models';

type Role = OrganizationType;
type OrganizationView = 'dashboard' | 'students' | 'offers' | 'saved' | 'notifications' | 'subscription' | 'profile' | 'settings';
type OfferStatus = 'Sent' | 'Viewed' | 'Negotiating' | 'Accepted' | 'Rejected';
type BankEvaluationMode = 'ACADEMIC_ONLY' | 'UNIVERSITY_OFFER_ONLY' | 'ACADEMIC_AND_OFFER';
type UniversityOfferStatus = 'Offer Sent' | 'Shortlisted' | 'Selected' | 'Admitted';

const BANK_EVALUATION_MODE_KEY = 'superoffer_bank_evaluation_mode';

interface Offer {
  student: string; initials: string; course: string; deadline: string; status: OfferStatus; sent: string;
  scholarship?: string; tuition?: string; accommodation?: string;
  loanAmount?: string; interestRate?: string; emi?: string; processingFee?: string; tenure?: string; conditions?: string;
  offerType?: 'PreApproved' | 'Final';
}

interface UniversityInterest {
  university: string; country: string; course: string; status: UniversityOfferStatus;
  scholarship?: string; tuitionFee?: string; remainingTuition?: string; livingCost?: string; logo?: string;
}

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
    profileTabLabel: 'University Profile'
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
    profileTabLabel: 'Organisation Profile'
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
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id" (click)="go(item.id)" [title]="item.label" [attr.aria-label]="item.label">
            <span>{{item.icon}}</span><strong>{{item.label}}</strong>
          </button>
        </nav>
        <div class="uni-plan"><span>{{currentPlan | uppercase}} PLAN</span><strong>{{profilesViewed}} of {{planQuotaLabel}}</strong><small>student profiles viewed</small><i><b [style.width.%]="quotaPercent"></b></i></div>
        <button class="uni-user" type="button" (click)="go('profile')" title="Organisation profile" aria-label="Organisation profile"><span>{{cfg.userInitials}}</span><div><strong>{{cfg.userName}}</strong><small>{{cfg.userTitle}}</small></div><b>↗</b></button>
      </aside>

      <main class="uni-main">
        <header class="uni-topbar">
          <div class="uni-header-identity"><span class="uni-mobile-brand">{{cfg.brandLabel}}</span><strong>{{currentViewLabel}}</strong><small>{{orgName}} <i></i> 2026–27 {{cfg.cycleLabel}}</small></div>
          <div><span class="verified-header">✓ Verified</span><button type="button" aria-label="Notifications" (click)="go('notifications')">◌<b>{{notifications.length}}</b></button></div>
        </header>

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
            <header><div><span>RECENT OFFERS</span><h2>Latest offer activity</h2></div><button (click)="go('offers')">View all</button></header>
            <div *ngFor="let offer of offers.slice(0,4)">
              <span [class]="offerTone(offer.status)">{{offerIcon(offer.status)}}</span>
              <div><strong>{{offer.student}}</strong><small>{{offer.course}}</small></div>
              <time>{{offer.sent}}</time>
              <button type="button" (click)="go('offers')">{{offer.status}}</button>
            </div>
            <div class="empty-state" *ngIf="!offers.length"><strong>No offers sent yet</strong><p>Browse students and send your first offer.</p><button type="button" class="uni-secondary" (click)="go('students')">Browse students</button></div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='students'">
          <header class="uni-page-title"><div><span>{{cfg.searchEyebrow}}</span><h1>{{cfg.searchTitle}}</h1><p>{{cfg.searchIntro}}</p></div></header>

          <div class="candidate-search-layout">
            <aside class="candidate-filter-rail">
              <div class="filter-rail-head"><h2>Filters</h2><button type="button" (click)="resetFilters()">Reset</button></div>

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
            </aside>

            <div class="candidate-results-pane">
              <div class="uni-results-head"><div><strong>{{filteredStudents.length}} matching students</strong><small>Results update instantly as you change your criteria · contact details stay hidden until an offer is accepted.</small></div></div>

              <ng-container *ngIf="currentStudent; else noStudents">
                <div class="portfolio-filmstrip">
                  <button type="button" class="filmstrip-item" *ngFor="let student of filteredStudents; let i=index" [class.active]="i===browseIndex" (click)="browseIndex=i" [attr.aria-label]="student.name">
                    <img [src]="student.photo" [alt]="student.name">
                    <small>{{student.score}}%</small>
                  </button>
                </div>

                <article class="student-portfolio-stage">
                  <button type="button" class="stage-nav stage-nav-prev" (click)="swapProfile(-1)" [disabled]="browseIndex===0" aria-label="Previous candidate">←</button>
                  <button type="button" class="stage-nav stage-nav-next" (click)="swapProfile(1)" [disabled]="browseIndex===filteredStudents.length-1" aria-label="Next candidate">→</button>

                  <div class="stage-visual">
                    <img [src]="currentStudent.photo" [alt]="currentStudent.name+' portfolio photo'">
                    <div class="stage-match-badge"><small>MATCH</small><strong>{{currentStudent.score}}%</strong></div>
                  </div>

                  <div class="stage-content">
                    <div class="stage-content-scroll">
                      <div class="stage-top-row"><span>{{browseIndex+1}} of {{filteredStudents.length}} · Verified student · Indian national</span></div>
                      <h1 class="stage-headline">{{currentStudent.name}}</h1>
                      <span class="stage-role-pill">{{currentStudent.degree}} · {{currentStudent.course}}</span>
                      <p class="stage-sub">Targeting {{currentStudent.country}} · {{currentStudent.intake}}</p>

                      <div class="bank-badge-row" *ngIf="role==='BANK' && bankBadges(currentStudent).length">
                        <span *ngFor="let badge of bankBadges(currentStudent)" [class.pre-approved]="badge==='PRE-APPROVED'">{{badge}}</span>
                      </div>

                      <div class="stage-stat-row">
                        <div><small>CGPA / Marks</small><strong>{{currentStudent.cgpa}}</strong></div>
                        <div><small>Test scores</small><strong>{{currentStudent.examScore}}</strong></div>
                        <div><small>Budget</small><strong>{{currentStudent.budget}}</strong></div>
                        <div><small>Documents</small><strong>{{currentStudent.documentsVerified}}/5 verified</strong></div>
                      </div>

                      <div class="eligibility-pill" *ngIf="role==='BANK'" [class.eligible]="currentStudent.eligible"><span>{{currentStudent.eligible ? '✓ Loan eligible' : '! Needs manual review'}}</span><small>{{currentStudent.eligibilityNote}}</small></div>

                      <section class="uni-interest-block" *ngIf="role==='BANK' && bankEvaluationMode!=='ACADEMIC_ONLY' && currentStudent.universityInterests?.length">
                        <small>UNIVERSITY INTEREST</small>
                        <article *ngFor="let interest of currentStudent.universityInterests">
                          <span class="uni-interest-logo"><img *ngIf="interest.logo" [src]="interest.logo" [alt]="interest.university"><ng-container *ngIf="!interest.logo">{{interest.university.charAt(0)}}</ng-container></span>
                          <div><strong>{{interest.university}}</strong><small>{{interest.country}} · {{interest.course}}</small></div>
                          <b class="uni-interest-status" [class]="'status-'+interest.status.toLowerCase().replace(' ','-')">{{interest.status}}</b>
                          <div class="uni-interest-terms"><span>Scholarship <b>{{interest.scholarship||'—'}}</b></span><span>Tuition <b>{{interest.tuitionFee||'—'}}</b></span><span>Remaining <b>{{interest.remainingTuition||'—'}}</b></span><span>Living cost <b>{{interest.livingCost||'—'}}</b></span></div>
                        </article>
                      </section>

                      <div class="stage-skills"><small>SKILLS</small><span *ngFor="let skill of currentStudent.skills">{{skill}}</span></div>
                      <p class="stage-bio">{{currentStudent.bio}}</p>
                    </div>

                    <footer class="stage-actions">
                      <button type="button" class="uni-secondary shortlist-toggle" [class.chosen]="isShortlisted(currentStudent.name)" (click)="toggleShortlist(currentStudent.name)">{{isShortlisted(currentStudent.name) ? '★ Saved' : '☆ Save student'}}</button>
                      <button type="button" class="uni-primary" (click)="openOfferComposer(currentStudent)">Send {{cfg.offerVerb}}</button>
                    </footer>
                  </div>
                </article>
              </ng-container>
              <ng-template #noStudents><section class="uni-card empty-state"><strong>No students match your filters</strong><p>Try widening your budget, intake or score criteria.</p><button type="button" class="uni-secondary" (click)="resetFilters()">Reset filters</button></section></ng-template>
            </div>
          </div>
        </section>

        <section class="uni-view" *ngIf="view==='offers'">
          <header class="uni-page-title"><div><span>OFFERS &amp; RESPONSES</span><h1>Offers</h1><p>Create and track every {{cfg.offerEyebrow}} offer from sent to accepted.</p></div><button class="uni-primary" (click)="openOfferComposer()">Create offer</button></header>
          <div class="invitation-filters"><button *ngFor="let status of offerStatuses" [class.active]="offerFilter===status" (click)="offerFilter=status">{{status}}</button></div>
          <section class="university-invitations" *ngIf="filteredOffers.length; else noOffers">
            <article *ngFor="let offer of filteredOffers">
              <div><span>{{offer.initials}}</span><p><strong>{{offer.student}}</strong><small>{{offer.course}}</small></p></div>
              <p><strong>{{offerPrimary(offer)}}</strong><small>{{offerSecondary(offer)}}</small></p>
              <b [class.negotiating]="offer.status==='Negotiating'" [class.accepted]="offer.status==='Accepted'">{{offer.status}}</b>
              <p><strong>{{offer.sent}}</strong><small>Sent</small></p>
              <p><strong>{{offer.deadline}}</strong><small>Expires</small></p>
              <button (click)="notify(offer.student+' offer opened')">Open</button>
            </article>
          </section>
          <ng-template #noOffers><section class="uni-card empty-state"><strong>No offers yet</strong><p>Create your first offer for a saved student.</p><button type="button" class="uni-primary" (click)="openOfferComposer()">Create offer</button></section></ng-template>
        </section>

        <section class="uni-view" *ngIf="view==='saved'">
          <header class="uni-page-title"><div><span>SAVED STUDENTS</span><h1>Your shortlist</h1><p>Students you have saved for {{cfg.cycleLabel}} follow-up.</p></div></header>
          <section class="uni-card uni-recommended" *ngIf="savedStudents.length; else noSaved">
            <header><div><span>SHORTLISTED</span><h2>{{savedStudents.length}} saved students</h2></div></header>
            <article *ngFor="let student of savedStudents">
              <span class="candidate-avatar" [style.background]="student.color">{{student.initials}}</span>
              <div><strong>{{student.name}}</strong><small>{{student.course}} · {{student.country}}</small></div>
              <b>{{student.score}}<small>match</small></b>
              <span class="candidate-factor">{{student.factor}}</span>
              <button type="button" (click)="openOfferComposer(student)">Send {{cfg.offerVerb}}</button>
              <button type="button" (click)="toggleShortlist(student.name)">Remove</button>
            </article>
          </section>
          <ng-template #noSaved><section class="uni-card empty-state"><strong>No saved students yet</strong><p>Save promising students from the discovery tab to review them later.</p><button type="button" class="uni-secondary" (click)="go('students')">Browse students</button></section></ng-template>
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

        <section class="uni-view" *ngIf="view==='profile'">
          <header class="uni-page-title"><div><span>ORGANISATION</span><h1>{{cfg.profileTabLabel}}</h1><p>Manage your organisation profile details.</p></div><span class="org-verified">✓ Verified organisation</span></header>
          <section class="uni-card uni-org-settings">
            <header><h2>{{cfg.profileTabLabel}}</h2><p>Manage your organisation profile details.</p></header>
            <div class="settings-form"><label>{{cfg.orgFieldLabel}}<input [(ngModel)]="orgName"></label><label>Official domain<input [(ngModel)]="orgDomain"></label><label>Organisation type<select><option *ngFor="let t of cfg.orgTypeOptions">{{t}}</option></select></label><label>Head office / campus<input [(ngModel)]="orgCity"></label><label class="wide">Organisation description<textarea [(ngModel)]="orgDescription"></textarea></label></div>
            <footer><button class="uni-primary" (click)="notify('Organisation profile saved')">Save changes</button></footer>
          </section>

          <section class="uni-card uni-org-settings bank-eval-card" *ngIf="role==='BANK'">
            <header><h2>Loan Evaluation Mode</h2><p>Choose how your organisation evaluates and pre-approves students.</p></header>
            <div class="bank-eval-options">
              <label *ngFor="let option of bankEvaluationModeOptions" [class.selected]="bankEvaluationMode===option.value">
                <input type="radio" name="bankEvaluationMode" [value]="option.value" [checked]="bankEvaluationMode===option.value" (change)="setBankEvaluationMode(option.value)">
                <strong>{{option.label}}</strong>
                <p>{{option.description}}</p>
              </label>
            </div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='settings'">
          <header class="uni-page-title"><div><span>ACCOUNT</span><h1>Settings</h1><p>Manage your account security.</p></div></header>

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
        </section>
      </main>

      <div class="uni-toast" *ngIf="toast">{{toast}}</div>

      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="offerDraft" (click)="offerDraft=null">
        <form class="university-offer-composer" (ngSubmit)="saveOffer()" (click)="$event.stopPropagation()">
          <header><div><small>NEW OFFER</small><h2>Create offer</h2><p>Prepare a clear {{cfg.offerNoun}}.</p></div><button type="button" (click)="offerDraft=null">×</button></header>
          <div class="composer-grid">
            <label>Student<select name="offerStudent" required [(ngModel)]="offerDraft.student"><option value="" disabled>Select a student</option><option *ngFor="let s of students" [value]="s.name">{{s.name}}</option></select></label>
            <label>Course<input name="offerCourse" required [(ngModel)]="offerDraft.course"></label>
            <ng-container *ngIf="role==='UNIVERSITY'">
              <label>Scholarship<input name="offerScholarship" [(ngModel)]="offerDraft.scholarship" placeholder="e.g. 40% tuition scholarship"></label>
              <label>Tuition fee<input name="offerTuition" required [(ngModel)]="offerDraft.tuition" placeholder="e.g. CAD 42,000 / year"></label>
              <label>Accommodation<input name="offerAccommodation" [(ngModel)]="offerDraft.accommodation" placeholder="e.g. Campus residence available"></label>
            </ng-container>
            <ng-container *ngIf="role==='BANK'">
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
    </div>
  `
})
export class OrganizationWorkspaceComponent {
  role: Role = 'UNIVERSITY';
  cfg = ROLE_CONFIG['UNIVERSITY'];
  view: OrganizationView = 'dashboard';
  toast = '';
  browseIndex = 0;
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
    {id:'offers',label:'Offers',icon:'◇'},
    {id:'saved',label:'Saved Students',icon:'★'},
    {id:'notifications',label:'Notifications',icon:'◌'},
    {id:'subscription',label:'Subscription',icon:'✦'},
    {id:'profile',label:'Organization Profile',icon:'◈'},
    {id:'settings',label:'Settings',icon:'⚙'}
  ];

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

  offerStatuses = ['All','Sent','Viewed','Negotiating','Accepted','Rejected'];
  offers: Offer[] = [];

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

  students = [
    {name:'Aarav Mehta',initials:'AM',photo:'/intelligent-matching-students.png',course:'Data Science',country:'Canada',degree:'Postgraduate',cgpa:'8.9 / 10',cgpaValue:8.9,ielts:7.5,englishTest:'IELTS' as const,englishScore:7.5,backlogs:0,workExperienceYears:0,visaRefused:false,documentsVerified:5,examScore:'IELTS 7.5 · GRE 323',budget:'₹38,00,000',budgetValue:3800000,financialSummary:'Family income ₹18L/yr · Savings ₹12L',skills:['Python','SQL','Machine Learning','Tableau'],score:94,factor:'Strong academic fit',intake:'Fall 2027',scholarshipSeeking:true,bio:'Data-focused engineering graduate building responsible machine-learning products for education.',color:'#0f6f54',eligible:true,eligibilityNote:'Co-applicant income and collateral cover the requested amount within standard lending limits.',
      toefl:100,gre:323,familyIncome:1800000,requiredLoanAmount:2600000,
      universityInterests:[{university:'Northbridge University',country:'Canada',course:'MSc Data Science',status:'Admitted' as UniversityOfferStatus,scholarship:'40% tuition',tuitionFee:'CAD 42,000 / year',remainingTuition:'CAD 25,200 / year',livingCost:'CAD 14,000 / year',logo:'/logos/northbridge.png'}]},
    {name:'Sara Khan',initials:'SK',photo:'/intelligent-matching-students.png',course:'Artificial Intelligence',country:'Canada',degree:'Postgraduate',cgpa:'9.1 / 10',cgpaValue:9.1,ielts:8.0,englishTest:'IELTS' as const,englishScore:8.0,backlogs:0,workExperienceYears:1,visaRefused:false,documentsVerified:5,examScore:'IELTS 8.0 · GMAT 710',budget:'₹42,00,000',budgetValue:4200000,financialSummary:'Sponsored · Income proof verified',skills:['R','Excel','Econometrics','Power BI'],score:91,factor:'Excellent programme fit',intake:'Fall 2027',scholarshipSeeking:false,bio:'Quantitative graduate with internships in fintech research and market strategy.',color:'#315d88',eligible:true,eligibilityNote:'Strong sponsor income and complete documentation support the full requested amount.',
      toefl:110,gmat:710,requiredLoanAmount:0,
      universityInterests:[{university:'Northbridge University',country:'Canada',course:'MSc Artificial Intelligence',status:'Selected' as UniversityOfferStatus,scholarship:'—',tuitionFee:'CAD 39,500 / year',remainingTuition:'CAD 39,500 / year',livingCost:'CAD 13,500 / year',logo:'/logos/northbridge.png'}]},
    {name:'Daniel Okafor',initials:'DO',photo:'/intelligent-matching-students.png',course:'Business Analytics',country:'Canada',degree:'Postgraduate',cgpa:'3.7 / 4.0',cgpaValue:9.25,ielts:7.0,englishTest:'IELTS' as const,englishScore:7.0,backlogs:2,workExperienceYears:0,visaRefused:false,documentsVerified:3,examScore:'IELTS 7.0 · GRE 318',budget:'₹35,00,000',budgetValue:3500000,financialSummary:'Savings ₹11L · Loan required ₹24L',skills:['C++','ROS','Python','Embedded Systems'],score:88,factor:'High intent signal',intake:'Fall 2027',scholarshipSeeking:true,bio:'Robotics enthusiast with hands-on work in perception and autonomous navigation.',color:'#8a5b35',eligible:false,eligibilityNote:'Existing loan obligation and incomplete income documentation require manual underwriting review.',
      toefl:92,gre:318,familyIncome:1100000,requiredLoanAmount:2400000},
    {name:'Mei Lin',initials:'ML',photo:'/intelligent-matching-students.png',course:'Computer Science',country:'Canada',degree:'Postgraduate',cgpa:'3.8 / 4.0',cgpaValue:9.5,ielts:6.5,englishTest:'PTE' as const,englishScore:74,backlogs:0,workExperienceYears:0,visaRefused:false,documentsVerified:4,examScore:'IELTS 6.5 · PTE 74',budget:'₹40,00,000',budgetValue:4000000,financialSummary:'Family funded · Income proof verified',skills:['Java','Distributed Systems','Cloud','Kubernetes'],score:86,factor:'Strong test scores',intake:'Spring 2027',scholarshipSeeking:false,bio:'Systems-focused computer science graduate with cloud infrastructure internship experience.',color:'#695392',eligible:true,eligibilityNote:'Fully documented, low existing liability, income comfortably covers repayment.',
      requiredLoanAmount:0,
      universityInterests:[{university:'Westford University',country:'United Kingdom',course:'MSc Computer Science',status:'Shortlisted' as UniversityOfferStatus,scholarship:'—',tuitionFee:'£24,000 / year',remainingTuition:'£24,000 / year',livingCost:'£12,000 / year',logo:'/logos/westford.png'}]},
    {name:'Riya Patel',initials:'RP',photo:'/intelligent-matching-students.png',course:'International Business',country:'Canada',degree:'Postgraduate',cgpa:'8.4 / 10',cgpaValue:8.4,ielts:7.5,englishTest:'IELTS' as const,englishScore:7.5,backlogs:1,workExperienceYears:2,visaRefused:false,documentsVerified:4,examScore:'IELTS 7.5 · GMAT 680',budget:'₹30,00,000',budgetValue:3000000,financialSummary:'Family income ₹14L/yr · Savings ₹9L',skills:['Market Research','Excel','Negotiation','Power BI'],score:84,factor:'Budget aligned',intake:'Fall 2027',scholarshipSeeking:true,bio:'International-business graduate with export-consulting internship experience across two markets.',color:'#9a4f63',eligible:false,eligibilityNote:'Requested budget exceeds standard debt-to-income guidelines for the declared co-applicant income.',
      gmat:680,familyIncome:1400000,requiredLoanAmount:2100000}
  ];

  orgName=ROLE_CONFIG['UNIVERSITY'].orgNameDefault;
  orgDomain=ROLE_CONFIG['UNIVERSITY'].orgDomainDefault;
  orgCity=ROLE_CONFIG['UNIVERSITY'].orgCityDefault;
  orgDescription=ROLE_CONFIG['UNIVERSITY'].orgDescriptionDefault;

  get planQuotaLabel(){return this.currentPlan==='Enterprise'?'Unlimited':String(this.planCapacity[this.currentPlan]);}
  get remainingCredits(){return this.currentPlan==='Enterprise'?'Unlimited':Math.max(0,this.planCapacity[this.currentPlan]-this.profilesViewed);}
  get quotaPercent(){return this.currentPlan==='Enterprise'?12:Math.min(100,Math.round((this.profilesViewed/this.planCapacity[this.currentPlan])*100));}
  get activeOffersCount(){return this.offers.filter(o=>o.status!=='Rejected').length;}

  get currentViewLabel(){
    return ({dashboard:'Overview',students:'Student discovery',offers:'Offers & responses',saved:'Saved students',notifications:'Notifications',subscription:'Subscription & access',profile:'Organisation profile',settings:'Settings'} as Record<OrganizationView,string>)[this.view];
  }

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
    );
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

  bankBadges(s:any):string[]{
    if(this.role!=='BANK') return [];
    const badges:string[]=[];
    if(s.eligible) badges.push('PRE-APPROVED');
    if(this.bankEvaluationMode==='ACADEMIC_AND_OFFER'){
      badges.push(s.universityInterests?.length ? 'University Offer Available' : 'Academic Profile Only');
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
      ...this.offers.slice(0,3).map(o=>({icon:this.offerIcon(o.status),tone:this.offerTone(o.status),title:`${o.student}'s offer is ${o.status.toLowerCase()}`,detail:o.course,when:o.sent})),
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
    this.go('students');
  }
  swapProfile(direction:number){
    const next=this.browseIndex+direction;
    if(next>=0 && next<this.filteredStudents.length) this.browseIndex=next;
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

  get filteredOffers(){return this.offerFilter==='All'?this.offers:this.offers.filter(o=>o.status===this.offerFilter);}
  offerTone(status:OfferStatus){return status==='Accepted'?'positive':status==='Negotiating'?'warning':status==='Rejected'?'warning':'neutral';}
  offerIcon(status:OfferStatus){return status==='Accepted'?'✓':status==='Negotiating'?'↔':status==='Rejected'?'✕':status==='Viewed'?'◉':'↗';}
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

  openOfferComposer(student?:any){
    const defaultOfferType:'PreApproved'|'Final' = this.bankEvaluationMode==='UNIVERSITY_OFFER_ONLY'
      ? 'Final'
      : this.bankEvaluationMode==='ACADEMIC_ONLY'
        ? 'PreApproved'
        : (student?.universityInterests?.length ? 'Final' : 'PreApproved');
    this.offerDraft = this.role==='BANK'
      ? {student:student?.name||'',course:student?.course?`MSc ${student.course}`:'',offerType:defaultOfferType,loanAmount:'',interestRate:'',emi:'',processingFee:'',tenure:'',conditions:'',deadline:''}
      : {student:student?.name||'',course:student?.course?`MSc ${student.course}`:'',scholarship:'',tuition:'',accommodation:'',deadline:''};
  }
  saveOffer(){
    if(!this.offerDraft?.student) return;
    const initials=this.offerDraft.student.split(' ').map((x:string)=>x[0]).join('').slice(0,2).toUpperCase();
    this.offers=[{...this.offerDraft,initials,status:'Sent' as OfferStatus,sent:'Today'},...this.offers];
    this.notify('Offer created');
    this.offerDraft=null;
    this.go('offers');
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

  private applyRole(role:Role){
    this.role=role;
    this.cfg=ROLE_CONFIG[role];
    this.orgName=this.cfg.orgNameDefault;
    this.orgDomain=this.cfg.orgDomainDefault;
    this.orgCity=this.cfg.orgCityDefault;
    this.orgDescription=this.cfg.orgDescriptionDefault;
    this.offers = role==='BANK' ? [
      {student:'Aarav Mehta',initials:'AM',course:'MSc Data Science',loanAmount:'₹38,00,000',interestRate:'9.2% p.a.',processingFee:'Waived',tenure:'10 years',conditions:'None',deadline:'2026-08-15',status:'Negotiating',sent:'24 Jul'},
      {student:'Sara Khan',initials:'SK',course:'MSc Artificial Intelligence',loanAmount:'₹42,00,000',interestRate:'8.9% p.a.',processingFee:'Waived',tenure:'12 years',conditions:'None',deadline:'2026-08-05',status:'Accepted',sent:'22 Jul'},
      {student:'Daniel Okafor',initials:'DO',course:'MSc Business Analytics',loanAmount:'₹35,00,000',interestRate:'10.1% p.a.',processingFee:'1% of loan amount',tenure:'10 years',conditions:'Subject to guarantor verification',deadline:'2026-08-04',status:'Viewed',sent:'21 Jul'},
      {student:'Mei Lin',initials:'ML',course:'MSc Computer Science',loanAmount:'₹40,00,000',interestRate:'9.0% p.a.',processingFee:'Waived',tenure:'10 years',conditions:'None',deadline:'2026-08-03',status:'Sent',sent:'20 Jul'}
    ] : [
      {student:'Aarav Mehta',initials:'AM',course:'MSc Data Science',scholarship:'40% tuition scholarship',tuition:'CAD 42,000 / year',accommodation:'Campus residence available',deadline:'2026-08-15',status:'Negotiating',sent:'24 Jul'},
      {student:'Sara Khan',initials:'SK',course:'MSc Artificial Intelligence',scholarship:'40% tuition scholarship',tuition:'CAD 39,500 / year',accommodation:'Off-campus support',deadline:'2026-08-05',status:'Accepted',sent:'22 Jul'},
      {student:'Daniel Okafor',initials:'DO',course:'MSc Business Analytics',scholarship:'£6,000 award',tuition:'£24,000 / year',accommodation:'Not included',deadline:'2026-08-04',status:'Viewed',sent:'21 Jul'},
      {student:'Mei Lin',initials:'ML',course:'MSc Computer Science',scholarship:'Fast-track admission',tuition:'CAD 41,000 / year',accommodation:'Campus residence available',deadline:'2026-08-03',status:'Sent',sent:'20 Jul'}
    ];
    try{
      const saved=JSON.parse(localStorage.getItem(`superoffer_${role}_shortlist`)||'null');
      this.shortlistedNames = Array.isArray(saved) ? new Set(saved) : new Set(['Aarav Mehta','Sara Khan','Daniel Okafor']);
    }catch{ this.shortlistedNames = new Set(['Aarav Mehta','Sara Khan','Daniel Okafor']); }
    if(role==='BANK'){
      const storedMode = localStorage.getItem(BANK_EVALUATION_MODE_KEY) as BankEvaluationMode | null;
      this.bankEvaluationMode = storedMode || 'ACADEMIC_AND_OFFER';
    }
  }

  setBankEvaluationMode(mode:BankEvaluationMode){
    this.bankEvaluationMode = mode;
    localStorage.setItem(BANK_EVALUATION_MODE_KEY, mode);
    this.notify(`Loan evaluation mode set to ${this.bankEvaluationModeOptions.find(o=>o.value===mode)?.label}`);
  }

  constructor(private router:Router,private route:ActivatedRoute){
    const storedRole = (sessionStorage.getItem('superoffer_org_type') as Role) || 'UNIVERSITY';
    this.applyRole(storedRole);
    this.route.data.subscribe(data=>{
      if(data['page']) this.view=data['page'] as OrganizationView;
    });
    this.route.paramMap.subscribe(params=>{
      const id = params.get('id');
      if(id){
        const index = this.filteredStudents.findIndex(s=>s.name===id);
        if(index>=0){ this.browseIndex=index; }
        this.view='students';
      }
    });
  }
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_org_type');this.router.navigate(['/']);}
}
