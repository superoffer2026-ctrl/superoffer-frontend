import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { SubmittedStudentsStore, mapProfileToOrgStudent } from '../../core/submitted-students.store';
import { AuthApiService } from '../../core/auth-api.service';

interface ExamEntry { exam: string; status: string; score: string; expectedScore: string; currentScore: string; }
interface ProjectEntry { title: string; role: string; description: string; }

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './review-profile.css',
  template: `
    <section class="step-page">
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
            <a class="edit-btn" routerLink="/student/english-exam" [queryParams]="{from:'review'}">Edit</a>
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
            <a class="empty-cta" routerLink="/student/english-exam" [queryParams]="{from:'review'}">+ Add now</a>
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
            <a class="edit-btn" routerLink="/student/competitive-exam" [queryParams]="{from:'review'}">Edit</a>
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
            <a class="empty-cta" routerLink="/student/competitive-exam" [queryParams]="{from:'review'}">+ Add now</a>
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
        <p class="save-message error" *ngIf="submitError">{{submitError}}</p>
        <button class="button primary" type="button" [disabled]="completionPct<100 || submitting" (click)="submitProfile()">{{submitting ? 'Submitting…' : 'Submit Profile'}}</button>
      </div>
    </section>
  `
})
export class ReviewProfileComponent implements OnInit {
  submitting = false;
  submitError = '';

  constructor(
    public store: StudentProfileUiStore,
    private router: Router,
    private submittedStudentsStore: SubmittedStudentsStore,
    private api: AuthApiService,
    private cdr: ChangeDetectorRef
  ) {}

  private getToken(): string | null {
    return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token');
  }

  private handleUnauthorized() {
    localStorage.removeItem('superoffer_access_token');
    sessionStorage.removeItem('superoffer_access_token');
    this.router.navigate(['/auth/login/student'], { queryParams: { sessionExpired: '1' } });
  }

  /** Fills in the local store from the server for any field not already present locally —
   *  keeps the review page accurate even on a fresh browser/session where nothing has been typed yet. */
  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }
    try {
      const profile = await this.api.studentProfile(token);
      const set = (key: string, value: string | undefined) => {
        if (!this.store.values[key] && value) this.store.values[key] = value;
      };

      const personal = (profile?.personal as Record<string, string>) || {};
      ['fullName', 'email', 'mobileCountry', 'mobileNumber', 'altMobileCountry', 'altMobileNumber', 'country', 'city', 'phone', 'location']
        .forEach(key => set(key, personal[key]));

      const study = (profile?.studyPreferences as Record<string, string[]>) || {};
      set('countries', study['countries']?.join(', '));
      set('studyLevel', study['studyLevel']?.join(', '));
      set('fieldOfInterest', study['fieldOfInterest']?.join(', '));
      set('startYear', study['startYear']?.join(', '));
      set('intake', study['intake']?.join(', '));

      const academic = (profile?.academic as Record<string, unknown>) || {};
      ['qualificationLevel', 'institution', 'score', 'graduationYear', 'qualification', 'educationGap']
        .forEach(key => set(key, academic[key] as string));
      if (academic['history']) set('academicHistory', JSON.stringify(academic['history']));

      const exams = (profile?.entranceExams as Record<string, unknown>) || {};
      if (exams['englishExams']) set('englishExams', JSON.stringify(exams['englishExams']));
      set('englishExam', exams['englishExam'] as string);
      set('englishScore', exams['englishScore'] as string);
      if (exams['competitiveExams']) set('competitiveExams', JSON.stringify(exams['competitiveExams']));
      set('entranceExam', exams['entranceExam'] as string);
      set('entranceScore', exams['entranceScore'] as string);

      const projects = (profile?.projects as Record<string, unknown>) || {};
      if (projects['projects']) set('projects', JSON.stringify(projects['projects']));
      set('achievements', (projects['achievements'] as string[])?.join(', '));
      set('links', (projects['links'] as string[])?.join(', '));
      set('githubLink', projects['githubLink'] as string);
      set('linkedinLink', projects['linkedinLink'] as string);
      set('projectTitle', projects['projectTitle'] as string);
      set('projectRole', projects['projectRole'] as string);

      const work = (profile?.workExperience as Record<string, unknown>) || {};
      set('workStatus', work['workStatus'] as string);
      set('relevantYears', work['relevantYears'] as string);
      set('nonRelevantYears', work['nonRelevantYears'] as string);
      if (work['experiences']) set('workExperiences', JSON.stringify(work['experiences']));
      set('companyName', work['companyName'] as string);
      set('jobRole', work['jobRole'] as string);
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // Server unreachable — fall back to whatever is already in the local store.
    }
    this.cdr.detectChanges();
  }

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

  async submitProfile() {
    this.submitError = '';
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }

    this.submitting = true;
    try {
      await this.api.submitStudentProfile(token);

      this.submittedStudentsStore.upsert(mapProfileToOrgStudent(this.store.values, this.store.photo));
      this.store.values['profileStatus'] = 'SUBMITTED';
      this.store.values['submittedAt'] = new Date().toISOString();

      this.router.navigateByUrl('/student/dashboard');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.submitError = e instanceof Error ? e.message : 'Could not submit your profile. Please try again.';
    } finally {
      this.submitting = false;
      this.cdr.detectChanges();
    }
  }
}
