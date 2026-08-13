import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrl: './projects-achievements.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Projects &amp; Achievements details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 8 OF 9</span>
        </div>

        <h3 class="section-title">Social Presence</h3>
        <p class="section-hint">Share links to your GitHub, LinkedIn or portfolio.</p>

        <div class="tag-input-row">
          <input type="text" placeholder="Paste a GitHub, LinkedIn or portfolio link" [(ngModel)]="linkDraft" [ngModelOptions]="{standalone:true}"
            (keydown.enter)="addLinkDraft(); $event.preventDefault()">
          <button type="button" class="tag-add-btn" [disabled]="!linkDraft.trim()" (click)="addLinkDraft()">Add</button>
        </div>
        <small class="field-error" *ngIf="linkError">{{linkError}}</small>
        <div class="tag-chip-row" *ngIf="links.length">
          <span class="tag-chip" *ngFor="let l of links"><span class="tag-chip-text">{{linkLabel(l)}}: {{l}}</span><button type="button" (click)="removeLink(l)" [attr.aria-label]="'Remove '+l">×</button></span>
        </div>

        <h3 class="section-title">Projects</h3>
        <p class="section-hint">Add any academic, personal or professional projects you're proud of.</p>

        <div class="project-entry" *ngFor="let grp of projectsArray.controls; let i=index" [formGroup]="asGroup(grp)">
          <div class="project-entry-head">
            <strong>Project {{i+1}}</strong>
            <button type="button" class="project-remove" (click)="removeProject(i)" aria-label="Remove project">×</button>
          </div>
          <div class="field-grid">
            <label [class.field-invalid]="showGroupError(asGroup(grp),'title')">
              <span class="field-label">Project Title <span class="required-mark">*</span></span>
              <input type="text" formControlName="title" placeholder="e.g. Student success prediction model" (blur)="markGroupTouched(asGroup(grp),'title')">
              <small class="field-error" *ngIf="showGroupError(asGroup(grp),'title')">Enter a project title</small>
            </label>
            <label [class.field-invalid]="showGroupError(asGroup(grp),'role')">
              <span class="field-label">Your Role <span class="required-mark">*</span></span>
              <input type="text" formControlName="role" placeholder="e.g. Developer and researcher" (blur)="markGroupTouched(asGroup(grp),'role')">
              <small class="field-error" *ngIf="showGroupError(asGroup(grp),'role')">Enter your role</small>
            </label>
            <label class="wide">
              <span class="field-label">Description</span>
              <textarea formControlName="description" placeholder="What did you build, and what was the impact?"></textarea>
            </label>
          </div>
        </div>

        <button type="button" class="add-project-btn" (click)="addProject()">+ Add {{ projectsArray.length ? 'another' : 'a' }} project</button>

        <h3 class="section-title">Achievements</h3>
        <p class="section-hint">Optional. Awards, leadership, competitions or other recognition.</p>
        <div class="tag-input-box">
          <span class="tag-chip" *ngFor="let a of achievements">{{a}}<button type="button" (click)="removeAchievement(a)" [attr.aria-label]="'Remove '+a">×</button></span>
          <input type="text" placeholder="e.g. Hackathon Winner" [(ngModel)]="achievementDraft" [ngModelOptions]="{standalone:true}"
            (keydown.enter)="addAchievementDraft(); $event.preventDefault()">
        </div>
        <div class="tag-suggestions">
          <button type="button" class="tag-suggestion" *ngFor="let s of unpickedSuggestions()" (click)="addAchievement(s)">+ {{s}}</button>
        </div>
        <p class="tag-empty-hint" *ngIf="!achievements.length">No achievements added yet — type your own or pick a suggestion above.</p>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/financial-information">Previous</a>
        <button class="button primary" type="button" [disabled]="saving" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class ProjectsAchievementsComponent implements OnInit {
  achievementSuggestions: string[] = [];
  achievementDraft = '';
  linkDraft = '';
  linkError = '';
  submitted = false;
  saving = false;
  saveError = '';

  form = this.fb.group({
    projects: this.fb.array<FormGroup>([]),
    achievements: this.fb.nonNullable.control<string[]>([]),
    links: this.fb.nonNullable.control<string[]>([])
  });

  constructor(
    private fb: FormBuilder,
    public store: StudentProfileUiStore,
    private router: Router,
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

  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }
    try {
      const options = await this.api.getProjectsAchievementsReferenceData();
      this.achievementSuggestions = options.achievementSuggestions;
    } catch {
      // Reference data endpoint unreachable — suggestion chips stay empty; free-text entry still works.
    }
    try {
      const profile = await this.api.studentProfile(token);
      const data = (profile?.projects as Record<string, unknown>) || {};
      const projects = (data['projects'] as Record<string, string>[]) || [];
      const achievements = (data['achievements'] as string[]) || [];
      const links = (data['links'] as string[]) || [];
      if (!this.projectsArray.length && !this.achievements.length && !this.links.length && (projects.length || achievements.length || links.length)) {
        projects.forEach(p => this.projectsArray.push(this.fb.group({
          title: [p['title'] || '', Validators.required],
          role: [p['role'] || '', Validators.required],
          description: [p['description'] || '']
        })));
        this.form.get('achievements')!.setValue(achievements);
        this.form.get('links')!.setValue(links);
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // No saved projects yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
  }

  get projectsArray(): FormArray { return this.form.get('projects') as FormArray; }
  asGroup(control: AbstractControl): FormGroup { return control as FormGroup; }
  get achievements(): string[] { return this.form.get('achievements')!.value; }
  get links(): string[] { return this.form.get('links')!.value; }

  addProject() {
    this.projectsArray.push(this.fb.group({
      title: ['', Validators.required],
      role: ['', Validators.required],
      description: ['']
    }));
  }

  removeProject(index: number) { this.projectsArray.removeAt(index); }

  unpickedSuggestions(): string[] {
    return this.achievementSuggestions.filter(s => !this.achievements.includes(s));
  }

  addAchievement(value: string) {
    const clean = value.trim();
    if (!clean) return;
    const control = this.form.get('achievements')!;
    const current: string[] = control.value || [];
    if (!current.includes(clean)) control.setValue([...current, clean]);
  }
  addAchievementDraft() { this.addAchievement(this.achievementDraft); this.achievementDraft = ''; }
  removeAchievement(value: string) {
    const control = this.form.get('achievements')!;
    const current: string[] = control.value || [];
    control.setValue(current.filter(a => a !== value));
  }

  linkLabel(url: string): string {
    if (/github\.com/i.test(url)) return 'GitHub';
    if (/linkedin\.com/i.test(url)) return 'LinkedIn';
    return 'Link';
  }
  addLinkDraft() {
    const clean = this.linkDraft.trim();
    if (!clean) return;
    if (!/^https?:\/\/.+\..+/i.test(clean)) {
      this.linkError = 'Enter a valid link starting with http:// or https://';
      return;
    }
    const control = this.form.get('links')!;
    const current: string[] = control.value || [];
    if (!current.includes(clean)) control.setValue([...current, clean]);
    this.linkDraft = '';
    this.linkError = '';
  }
  removeLink(url: string) {
    const control = this.form.get('links')!;
    const current: string[] = control.value || [];
    control.setValue(current.filter(l => l !== url));
  }

  markGroupTouched(group: FormGroup, key: string) { group.get(key)!.markAsTouched(); }
  showGroupError(group: FormGroup, key: string): boolean {
    const control = group.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  markTouched(key: string) { this.form.get(key)!.markAsTouched(); }
  showError(key: string): boolean {
    const control = this.form.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  async saveAndContinue() {
    this.submitted = true;
    this.saveError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }

    const value = this.form.getRawValue();
    const githubLink = value.links.find(l => this.linkLabel(l) === 'GitHub') || '';
    const linkedinLink = value.links.find(l => this.linkLabel(l) === 'LinkedIn') || '';
    const first = value.projects[0] as Record<string, string> | undefined;
    const projectTitle = first ? first['title'] : '';
    const projectRole = first ? first['role'] : '';

    this.saving = true;
    try {
      await this.api.saveStudentProjectsAchievements(token, {
        projects: value.projects,
        achievements: value.achievements,
        links: value.links,
        githubLink,
        linkedinLink,
        projectTitle,
        projectRole
      });

      this.store.values['projects'] = JSON.stringify(value.projects);
      this.store.values['achievements'] = value.achievements.join(', ');
      this.store.values['links'] = value.links.join(', ');
      this.store.values['githubLink'] = githubLink;
      this.store.values['linkedinLink'] = linkedinLink;
      this.store.values['projectTitle'] = projectTitle;
      this.store.values['projectRole'] = projectRole;

      this.router.navigateByUrl('/student/review');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your projects. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
