import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { STUDENT_PROFILE_STEPS } from './student-portal.models';

const FURTHEST_STEP_KEY = 'superoffer_furthest_step';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  styleUrl: './student-portal.css',
  template: `
    <div class="student-portal" [class.sidebar-collapsed]="collapsed" [class.mobile-open]="mobileOpen" [class.offers-mode]="isOffers">
      <button class="mobile-menu" type="button" *ngIf="!isOffers" (click)="toggleMobile()" aria-label="Open profile navigation" [attr.aria-expanded]="mobileOpen">☰</button>
      <button class="mobile-overlay" type="button" *ngIf="mobileOpen" (click)="mobileOpen=false" aria-label="Close profile navigation"></button>

      <aside class="student-sidebar" *ngIf="!isOffers">
        <div class="sidebar-brand-row">
          <button class="hamburger" type="button" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">☰</button>
          <a class="portal-brand" routerLink="/student/personal-information"><span>S</span><strong>SuperOffer</strong></a>
        </div>

        <div class="profile-progress">
          <div class="progress-copy"><span>Profile Completion</span><strong>{{isDashboard || isOffers ? '100%' : 'Step ' + (currentIndex + 1) + ' of ' + steps.length}}</strong></div>
          <div class="progress-track"><span [style.width.%]="progress"></span></div>
        </div>

        <nav aria-label="Profile creation steps">
          <a *ngFor="let item of steps; let i=index"
            [routerLink]="isAccessible(i) ? ['/student', item.path] : null"
            [class.current]="!isDashboard && !isOffers && currentIndex===i"
            [class.complete]="isDashboard || isOffers || i<furthestIndex"
            [class.disabled]="!isAccessible(i)"
            [attr.aria-disabled]="!isAccessible(i)"
            (click)="onStepClick(i,$event)">
            <span class="step-icon">{{isDashboard || isOffers || i < furthestIndex ? '✓' : item.icon}}</span>
            <span class="step-copy"><strong>{{item.title}}</strong><small>{{item.description}}</small></span>
          </a>
        </nav>
      </aside>

      <main class="student-content"><router-outlet /></main>
    </div>
  `
})
export class StudentPortalShellComponent {
  steps = STUDENT_PROFILE_STEPS;
  collapsed = false;
  mobileOpen = false;
  currentIndex = 0;
  furthestIndex = 0;
  isDashboard = false;
  isOffers = false;

  constructor(private router: Router) {
    this.furthestIndex = Number(localStorage.getItem(FURTHEST_STEP_KEY) || 0) || 0;
    this.syncRoute(this.router.url);
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.syncRoute((event as NavigationEnd).urlAfterRedirects);
      this.mobileOpen = false;
    });
  }

  get progress() { return this.isDashboard || this.isOffers ? 100 : Math.round(((this.currentIndex + 1) / this.steps.length) * 100); }
  /** Once a step has been reached, editing an earlier one must not re-lock it — gate on the furthest step ever reached, not the current one. */
  isAccessible(index: number) { return this.isDashboard || this.isOffers || index <= this.furthestIndex; }
  toggleSidebar() { innerWidth <= 760 ? this.mobileOpen = !this.mobileOpen : this.collapsed = !this.collapsed; }
  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  onStepClick(index: number, event: Event) { if (!this.isAccessible(index)) event.preventDefault(); }

  @HostListener('document:keydown.escape')
  closeMobile() { this.mobileOpen = false; }

  private syncRoute(url: string) {
    this.isDashboard = url.includes('/student/dashboard');
    const index = this.steps.findIndex(step => url.includes(`/student/${step.path}`));
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
