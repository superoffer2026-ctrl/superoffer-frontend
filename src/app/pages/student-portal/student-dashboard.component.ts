import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { OfferWalletStore } from './offer-wallet.models';
import { StudentCardComponent } from './student-card.component';
import { OfferMarketplaceCardComponent } from './offer-marketplace-card.component';
import { StatCounterComponent } from '../landing/stat-counter.component';
import { RevealOnScrollDirective } from '../landing/reveal-on-scroll.directive';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, StudentWorkspaceRailComponent, StudentCardComponent, OfferMarketplaceCardComponent, StatCounterComponent, RevealOnScrollDirective],
  styleUrl: './student-workspace-pages.css',
  template: `
    <app-student-workspace-rail />
    <section class="student-home">
      <header class="student-home-header">
        <div>
          <span class="student-kicker">MY STUDY JOURNEY</span>
          <h1>Good afternoon, {{firstName}}</h1>
          <p>Here’s what needs your attention today.</p>
        </div>
        <div class="student-header-actions">
          <span class="submitted-chip" *ngIf="isSubmitted">✓ Submitted — visible to universities</span>
          <a class="header-secondary" routerLink="/student/profile">View profile</a>
          <a class="header-primary" routerLink="/student/offers">My offers <b>{{walletStore.totalCount}}</b></a>
        </div>
      </header>

      <app-student-card
        [fullName]="store.values['fullName']"
        [photo]="store.photo"
        [cgpa]="store.values['score']"
        [ielts]="store.values['englishScore']"
        [preferredCountry]="store.values['countries']"
        [preferredCourse]="store.values['fieldOfInterest']"
        [completionPct]="completionPct"
        [verified]="isSubmitted" />

      <section class="wallet-stat-row" soReveal>
        <article><so-stat-counter [compact]="true" [value]="walletStore.totalCount" label="Total offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.newCount" label="New offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.universityCount" label="University offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.bankCount" label="Loan offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.scholarshipCount" label="Scholarship offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.consultancyCount" label="Consultancy offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.savedCount" label="Saved offers" /></article>
        <article><so-stat-counter [compact]="true" [value]="walletStore.acceptedCount" label="Accepted offers" /></article>
      </section>

      <section class="journey-banner">
        <div class="journey-main">
          <div class="journey-icon">✓</div>
          <div>
            <span>YOUR NEXT STEP</span>
            <h2 *ngIf="isSubmitted">Your profile is live with our partner universities</h2>
            <h2 *ngIf="!isSubmitted">Finish your profile to improve your matches</h2>
            <p *ngIf="isSubmitted">Submitted {{submittedAtLabel}}. Universities and lenders can now discover and match you with offers.</p>
            <p *ngIf="!isSubmitted">Complete every section and submit from Review Profile so universities can discover you.</p>
          </div>
          <a *ngIf="!isSubmitted" routerLink="/student/personal-information">Continue profile <b>→</b></a>
          <a *ngIf="isSubmitted" routerLink="/student/review">View submission <b>→</b></a>
        </div>
        <div class="journey-progress">
          <div><span>Profile strength</span><strong>{{completionPct}}%</strong></div>
          <div class="journey-track"><i [style.width.%]="completionPct"></i></div>
          <small *ngIf="!isSubmitted">{{missingSectionCount}} section{{missingSectionCount===1?'':'s'}} need attention</small>
          <small *ngIf="isSubmitted">All required sections complete</small>
        </div>
      </section>

      <section class="student-stage-row" aria-label="Your opportunity journey">
        <article class="done"><span>1</span><div><strong>Profile created</strong><small>Your basic details are ready</small></div></article>
        <i></i>
        <article class="current"><span>2</span><div><strong>Get discovered</strong><small>Complete your profile</small></div></article>
        <i></i>
        <article><span>3</span><div><strong>Compare offers</strong><small>Review the best matches</small></div></article>
        <i></i>
        <article><span>4</span><div><strong>Choose your path</strong><small>Accept when you’re ready</small></div></article>
      </section>

      <div class="student-home-grid">
        <section class="student-tasks">
          <header>
            <div><span>TO DO</span><h2>Your action list</h2></div>
            <small>3 remaining</small>
          </header>
          <a *ngFor="let task of tasks" [routerLink]="task.route">
            <span class="task-check"></span>
            <div><strong>{{task.title}}</strong><small>{{task.description}}</small></div>
            <time>{{task.time}}</time>
            <b>→</b>
          </a>
        </section>

        <aside class="student-upcoming">
          <header><span>UPCOMING</span><h2>Dates to remember</h2></header>
          <div class="upcoming-item urgent">
            <time><b>15</b><small>AUG</small></time>
            <div><span>OFFER DEADLINE</span><strong>Northbridge University</strong><small>Scholarship response due</small></div>
          </div>
          <div class="upcoming-item">
            <time><b>20</b><small>AUG</small></time>
            <div><span>DOCUMENT</span><strong>Upload final transcript</strong><small>For offer verification</small></div>
          </div>
          <a routerLink="/student/offers">View all deadlines →</a>
        </aside>
      </div>

      <section class="student-opportunities">
        <header>
          <div><span>JUST FOR YOU</span><h2>Recent opportunities</h2><p>Matches based on your goals and academic profile.</p></div>
          <a routerLink="/student/offers">See all offers →</a>
        </header>
        <div class="opportunity-row opportunity-row-market">
          <app-offer-marketplace-card *ngFor="let offer of walletStore.offers.slice(0,4)" [offer]="offer" [compact]="true" (viewDetails)="goToOffers()" />
        </div>
      </section>

      <section class="student-shortcuts">
        <a *ngFor="let action of actions" [routerLink]="action.route">
          <span>{{action.icon}}</span>
          <div><strong>{{action.title}}</strong><small>{{action.description}}</small></div>
          <b>→</b>
        </a>
      </section>
    </section>
  `
})
export class StudentDashboardComponent {
  tasks = [
    {title:'Upload your academic transcript',description:'Required to verify your academic history',time:'5 min',route:'/student/documents'},
    {title:'Review your study preferences',description:'Confirm destinations, courses, and preferred intake',time:'3 min',route:'/student/study-preferences'},
    {title:'Respond to Northbridge University',description:'Scholarship response due 15 August',time:'6 days',route:'/student/offers'}
  ];
  actions = [
    {title:'Update preferences',description:'Countries, courses, and intake',icon:'◎',route:'/student/study-preferences'},
    {title:'Manage documents',description:'View uploads and verification',icon:'▤',route:'/student/documents'},
    {title:'Account settings',description:'Privacy and notifications',icon:'⚙',route:'/student/settings'}
  ];
  constructor(public store:StudentProfileUiStore, public walletStore:OfferWalletStore, private router:Router){}
  get firstName(){return (this.store.values['fullName']||'Student').split(/\s+/)[0];}
  goToOffers(){this.router.navigate(['/student/offers']);}

  private v(key: string): string { return this.store.values[key] || ''; }

  get isSubmitted(): boolean { return this.store.values['profileStatus'] === 'SUBMITTED'; }

  get submittedAtLabel(): string {
    const raw = this.store.values['submittedAt'];
    if (!raw) return '';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '' : `on ${date.toLocaleDateString()}`;
  }

  private requiredChecklist(): boolean[] {
    return [
      !!this.v('fullName'), !!this.v('email'), !!this.v('mobileNumber'), !!this.v('country'), !!this.v('city'),
      !!this.v('countries'), !!this.v('fieldOfInterest'), !!this.v('studyLevel'), !!this.v('startYear'), !!this.v('intake'),
      !!this.v('qualificationLevel'), !!this.v('institution'), !!this.v('score'), !!this.v('graduationYear')
    ];
  }

  get completionPct(): number {
    const checklist = this.requiredChecklist();
    return Math.round((checklist.filter(Boolean).length / checklist.length) * 100);
  }

  get missingSectionCount(): number {
    const missing = [
      !(this.v('fullName') && this.v('email') && this.v('mobileNumber') && this.v('country') && this.v('city')),
      !(this.v('countries') && this.v('fieldOfInterest') && this.v('studyLevel') && this.v('startYear') && this.v('intake')),
      !(this.v('qualificationLevel') && this.v('institution') && this.v('score') && this.v('graduationYear'))
    ];
    return missing.filter(Boolean).length;
  }
}
