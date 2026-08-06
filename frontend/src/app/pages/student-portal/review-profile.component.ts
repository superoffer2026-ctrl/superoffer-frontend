import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { SubmittedStudentsStore, mapProfileToOrgStudent } from '../../core/submitted-students.store';

interface ExamEntry { exam: string; status: string; score: string; expectedScore: string; currentScore: string; }
interface ProjectEntry { title: string; role: string; description: string; }

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './review-profile.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 7 OF 7</span>
        <h1>Review Profile</h1>
        <p>Check everything looks right before submitting your profile to our partner universities, banks and consultants.</p>
      </div>

      <div class="completion-banner">
        <div class="completion-ring" [style.--pct]="completionPct">
          <b>{{completionPct}}%</b>
        </div>
        <div class="completion-copy">
          <span>Profile Completion</span>
          <strong>{{completionPct}}% Complete</strong>
          <p *ngIf="completionPct===100">Every required section is filled in — you're ready to submit.</p>
          <p *ngIf="completionPct<100">Finish the sections below to unlock submission.</p>
          <div class="completion-missing" *ngIf="missingSectionNames().length">
            <span *ngFor="let m of missingSectionNames()">{{m}}</span>
          </div>
        </div>
      </div>

      <div class="section-grid">
        <!-- Personal Information -->
        <div class="section-card" [class.incomplete]="!personalComplete()">
          <div class="section-head">
            <span class="section-icon">PI</span>
            <div class="section-title-block">
              <h2>Personal Information</h2>
              <span class="section-status" [class.ok]="personalComplete()" [class.warn]="!personalComplete()">{{ personalComplete() ? '✓ Complete' : '⚠ Incomplete' }}</span>
            </div>
            <a class="edit-btn" routerLink="/student/personal-information" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="summary-list">
            <div class="summary-item"><span>Full Name</span><strong [class.empty]="!v('fullName')">{{ v('fullName') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Email</span><strong [class.empty]="!v('email')">{{ v('email') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Mobile</span><strong [class.empty]="!v('mobileNumber')">{{ v('mobileNumber') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Country</span><strong [class.empty]="!v('country')">{{ v('country') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>City</span><strong [class.empty]="!v('city')">{{ v('city') || 'Not added' }}</strong></div>
          </div>
        </div>

        <!-- Study Preferences -->
        <div class="section-card" [class.incomplete]="!studyComplete()">
          <div class="section-head">
            <span class="section-icon">SP</span>
            <div class="section-title-block">
              <h2>Study Preferences</h2>
              <span class="section-status" [class.ok]="studyComplete()" [class.warn]="!studyComplete()">{{ studyComplete() ? '✓ Complete' : '⚠ Incomplete' }}</span>
            </div>
            <a class="edit-btn" routerLink="/student/study-preferences" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="summary-list">
            <div class="summary-item"><span>Countries</span><strong [class.empty]="!v('countries')">{{ v('countries') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Field of Study</span><strong [class.empty]="!v('fieldOfInterest')">{{ v('fieldOfInterest') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Program</span><strong [class.empty]="!v('studyLevel')">{{ v('studyLevel') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Start Year</span><strong [class.empty]="!v('startYear')">{{ v('startYear') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Preferred Intake</span><strong [class.empty]="!v('intake')">{{ v('intake') || 'Not added' }}</strong></div>
          </div>
        </div>

        <!-- Academic Information -->
        <div class="section-card" [class.incomplete]="!academicComplete()">
          <div class="section-head">
            <span class="section-icon">AC</span>
            <div class="section-title-block">
              <h2>Academic Information</h2>
              <span class="section-status" [class.ok]="academicComplete()" [class.warn]="!academicComplete()">{{ academicComplete() ? '✓ Complete' : '⚠ Incomplete' }}</span>
            </div>
            <a class="edit-btn" routerLink="/student/academic-information" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="summary-list">
            <div class="summary-item"><span>Highest Qualification</span><strong [class.empty]="!v('qualificationLevel')">{{ v('qualificationLevel') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Institution</span><strong [class.empty]="!v('institution')">{{ v('institution') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>CGPA / Percentage</span><strong [class.empty]="!v('score')">{{ v('score') || 'Not added' }}</strong></div>
            <div class="summary-item"><span>Completion Year</span><strong [class.empty]="!v('graduationYear')">{{ v('graduationYear') || 'Not added' }}</strong></div>
          </div>
        </div>

        <!-- English Language Tests -->
        <div class="section-card">
          <div class="section-head">
            <span class="section-icon">EN</span>
            <div class="section-title-block">
              <h2>English Language Tests</h2>
              <span class="section-status ok" *ngIf="englishExams().length">✓ {{englishExams().length}} added</span>
            </div>
            <a class="edit-btn" routerLink="/student/entrance-exams" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="entry-list" *ngIf="englishExams().length">
            <div class="entry-row" *ngFor="let e of englishExams()">
              <div><strong>{{e.exam}}</strong><small>{{e.status}}</small></div>
              <span class="entry-badge">{{ examScoreSummary(e) }}</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="!englishExams().length">
            <span class="empty-icon">📝</span>
            <p>No English test recorded yet.</p>
            <a class="empty-cta" routerLink="/student/entrance-exams" [queryParams]="{from:'review'}">+ Add now</a>
          </div>
        </div>

        <!-- Standardized Tests -->
        <div class="section-card">
          <div class="section-head">
            <span class="section-icon">CE</span>
            <div class="section-title-block">
              <h2>Standardized Tests</h2>
              <span class="section-status ok" *ngIf="competitiveExams().length">✓ {{competitiveExams().length}} added</span>
            </div>
            <a class="edit-btn" routerLink="/student/entrance-exams" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="entry-list" *ngIf="competitiveExams().length">
            <div class="entry-row" *ngFor="let e of competitiveExams()">
              <div><strong>{{e.exam}}</strong><small>{{e.status}}</small></div>
              <span class="entry-badge">{{ examScoreSummary(e) }}</span>
            </div>
          </div>
          <div class="empty-state" *ngIf="!competitiveExams().length">
            <span class="empty-icon">🧮</span>
            <p>No standardized test recorded yet.</p>
            <a class="empty-cta" routerLink="/student/entrance-exams" [queryParams]="{from:'review'}">+ Add now</a>
          </div>
        </div>

        <!-- Projects & Achievements -->
        <div class="section-card">
          <div class="section-head">
            <span class="section-icon">PA</span>
            <div class="section-title-block">
              <h2>Projects &amp; Achievements</h2>
            </div>
            <a class="edit-btn" routerLink="/student/projects" [queryParams]="{from:'review'}">Edit</a>
          </div>
          <div class="entry-list" *ngIf="projects().length">
            <div class="entry-row" *ngFor="let p of projects()">
              <div><strong>{{p.title}}</strong><small>{{p.role}}</small></div>
            </div>
          </div>
          <div class="chip-row" *ngIf="achievements().length">
            <span class="chip" *ngFor="let a of achievements()">{{a}}</span>
          </div>
          <div class="empty-state" *ngIf="!projects().length && !achievements().length">
            <span class="empty-icon">🏆</span>
            <p>No projects or achievements added yet.</p>
            <a class="empty-cta" routerLink="/student/projects" [queryParams]="{from:'review'}">+ Add now</a>
          </div>
        </div>
      </div>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/projects">Back</a>
        <button class="button primary" type="button" [disabled]="completionPct<100" (click)="submitProfile()">Submit Profile</button>
      </div>
    </section>
  `
})
export class ReviewProfileComponent {
  constructor(
    public store: StudentProfileUiStore,
    private router: Router,
    private submittedStudentsStore: SubmittedStudentsStore
  ) {}

  v(key: string): string { return this.store.values[key] || ''; }

  private parseJsonArray<T>(key: string): T[] {
    try {
      const parsed = JSON.parse(this.store.values[key] || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  englishExams(): ExamEntry[] { return this.parseJsonArray<ExamEntry>('englishExams'); }
  competitiveExams(): ExamEntry[] { return this.parseJsonArray<ExamEntry>('competitiveExams'); }
  projects(): ProjectEntry[] { return this.parseJsonArray<ProjectEntry>('projects'); }
  achievements(): string[] { return (this.store.values['achievements'] || '').split(',').map(a => a.trim()).filter(Boolean); }

  examScoreSummary(e: ExamEntry): string {
    if (e.status === 'I have the score') return `Score: ${e.score}`;
    if (e.status === 'Retake') return `Current ${e.currentScore} → Target ${e.expectedScore}`;
    if (e.expectedScore) return `Expected: ${e.expectedScore}`;
    return e.status;
  }

  personalComplete(): boolean {
    return !!(this.v('fullName') && this.v('email') && this.v('mobileNumber') && this.v('country') && this.v('city'));
  }
  studyComplete(): boolean {
    return !!(this.v('countries') && this.v('fieldOfInterest') && this.v('studyLevel') && this.v('startYear') && this.v('intake'));
  }
  academicComplete(): boolean {
    return !!(this.v('qualificationLevel') && this.v('institution') && this.v('score') && this.v('graduationYear'));
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
    const done = checklist.filter(Boolean).length;
    return Math.round((done / checklist.length) * 100);
  }

  missingSectionNames(): string[] {
    const missing: string[] = [];
    if (!this.personalComplete()) missing.push('Personal Information');
    if (!this.studyComplete()) missing.push('Study Preferences');
    if (!this.academicComplete()) missing.push('Academic Information');
    return missing;
  }

  submitProfile() {
    this.submittedStudentsStore.upsert(mapProfileToOrgStudent(this.store.values, this.store.photo));
    this.store.values['profileStatus'] = 'SUBMITTED';
    this.store.values['submittedAt'] = new Date().toISOString();
    this.router.navigateByUrl('/student/dashboard');
  }
}
