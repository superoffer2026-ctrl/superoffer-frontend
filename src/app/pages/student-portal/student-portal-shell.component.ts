import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { STUDENT_PROFILE_STEPS } from './student-portal.models';

const FURTHEST_STEP_KEY = 'superoffer_furthest_step';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  styleUrl: './student-portal.css',
  template: `
    <div class="student-portal" [class.offers-mode]="isOffers">
      <ng-container *ngIf="!isOffers">
        <header class="wizard-header">
          <a class="portal-brand" routerLink="/student/personal-information"><img src="/superoffer-brand-mark.png" alt="SuperOffer"><strong>SuperOffer</strong></a>
        </header>

        <nav class="wizard-stepper" #stepperNav aria-label="Profile creation steps">
          <ng-container *ngFor="let item of steps; let i=index; let last=last">
            <a class="stepper-node"
              [routerLink]="isAccessible(i) ? ['/student', item.path] : null"
              [queryParams]="fromReview ? {from:'review'} : null"
              [class.current]="currentIndex===i"
              [class.complete]="i<furthestIndex"
              [class.disabled]="!isAccessible(i)"
              [attr.aria-disabled]="!isAccessible(i)"
              [attr.aria-current]="currentIndex===i ? 'step' : null"
              [title]="item.title"
              (click)="onStepClick(i,$event)">
              <span class="stepper-dot">{{ i < furthestIndex ? '✓' : i + 1 }}</span>
              <span class="stepper-label">{{item.title}}</span>
            </a>
            <span class="stepper-line" *ngIf="!last" [class.filled]="i<furthestIndex"></span>
          </ng-container>
        </nav>
      </ng-container>

      <main class="student-content"><router-outlet /></main>
    </div>
  `
})
export class StudentPortalShellComponent implements AfterViewChecked {
  @ViewChild('stepperNav') stepperNav?: ElementRef<HTMLElement>;
  steps = STUDENT_PROFILE_STEPS;
  currentIndex = 0;
  furthestIndex = 0;
  isDashboard = false;
  isOffers = false;
  fromReview = false;
  private lastScrolledIndex = -1;

  constructor(private router: Router) {
    this.furthestIndex = Number(localStorage.getItem(FURTHEST_STEP_KEY) || 0) || 0;
    this.syncRoute(this.router.url);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.syncRoute((event as NavigationEnd).urlAfterRedirects);
    });
  }

  /** Once a step has been reached, editing an earlier one must not re-lock it — gate on the furthest step ever reached, not the current one. */
  isAccessible(index: number) { return this.isDashboard || this.isOffers || index <= this.furthestIndex; }
  onStepClick(index: number, event: Event) { if (!this.isAccessible(index)) event.preventDefault(); }

  /** On narrow viewports the stepper scrolls horizontally, so the active step can start off-screen — keep it in view without fighting manual scroll. */
  ngAfterViewChecked() {
    if (this.isOffers || this.currentIndex === this.lastScrolledIndex) return;
    const current = this.stepperNav?.nativeElement.querySelector<HTMLElement>('.stepper-node.current');
    if (current) {
      current.scrollIntoView({ block: 'nearest', inline: 'center' });
      this.lastScrolledIndex = this.currentIndex;
    }
  }

  private syncRoute(url: string) {
    const [path, query] = url.split('?');
    this.fromReview = new URLSearchParams(query || '').get('from') === 'review';
    this.isDashboard = path.includes('/student/dashboard');
    const index = this.steps.findIndex(step => path.includes(`/student/${step.path}`));
    /** Any page outside the 7 wizard steps (dashboard, offers, profile, settings, loan-eligibility, saved-universities, etc.)
     *  uses its own workspace-rail layout, so the step sidebar must stay hidden there — derive from the step list
     *  itself rather than an allowlist that silently goes stale whenever a new non-wizard page is added. */
    this.isOffers = index < 0;
    this.currentIndex = index >= 0 ? index : 0;
    if (this.currentIndex > this.furthestIndex) {
      this.furthestIndex = this.currentIndex;
      localStorage.setItem(FURTHEST_STEP_KEY, String(this.furthestIndex));
    }
  }
}
