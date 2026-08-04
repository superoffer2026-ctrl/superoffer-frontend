import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { ACHIEVEMENT_SUGGESTIONS } from './projects-options';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  styleUrl: './projects-achievements.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 6 OF 8</span>
        <h1>Projects &amp; Achievements</h1>
        <p>Showcase the projects, experience and recognition that set your profile apart. This step is optional.</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">PA</div>
          <div>
            <h2>Projects &amp; Achievements details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <h3 class="section-title">Projects</h3>
        <p class="section-hint">Add any academic, personal or professional projects you're proud of.</p>

        <div class="tag-input-row">
          <input type="text" placeholder="Paste a GitHub, LinkedIn or portfolio link" [(ngModel)]="linkDraft" [ngModelOptions]="{standalone:true}"
            (keydown.enter)="addLinkDraft(); $event.preventDefault()">
          <button type="button" class="tag-add-btn" [disabled]="!linkDraft.trim()" (click)="addLinkDraft()">Add</button>
        </div>
        <small class="field-error" *ngIf="linkError">{{linkError}}</small>
        <div class="tag-chip-row" *ngIf="links.length">
          <span class="tag-chip" *ngFor="let l of links"><span class="tag-chip-text">{{linkLabel(l)}}: {{l}}</span><button type="button" (click)="removeLink(l)" [attr.aria-label]="'Remove '+l">×</button></span>
        </div>

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
        <div class="tag-input-row">
          <input type="text" placeholder="e.g. Hackathon Winner" [(ngModel)]="achievementDraft" [ngModelOptions]="{standalone:true}"
            (keydown.enter)="addAchievementDraft(); $event.preventDefault()">
          <button type="button" class="tag-add-btn" [disabled]="!achievementDraft.trim()" (click)="addAchievementDraft()">Add</button>
        </div>
        <div class="tag-suggestions">
          <button type="button" class="tag-suggestion" *ngFor="let s of unpickedSuggestions()" (click)="addAchievement(s)">+ {{s}}</button>
        </div>
        <div class="tag-chip-row" *ngIf="achievements.length">
          <span class="tag-chip" *ngFor="let a of achievements">{{a}}<button type="button" (click)="removeAchievement(a)" [attr.aria-label]="'Remove '+a">×</button></span>
        </div>
        <p class="tag-empty-hint" *ngIf="!achievements.length">No achievements added yet.</p>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/financial-information">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class ProjectsAchievementsComponent {
  achievementSuggestions = ACHIEVEMENT_SUGGESTIONS;
  achievementDraft = '';
  linkDraft = '';
  linkError = '';
  submitted = false;

  form = this.fb.group({
    projects: this.fb.array<FormGroup>([]),
    achievements: this.fb.nonNullable.control<string[]>([]),
    links: this.fb.nonNullable.control<string[]>([])
  });

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router) {}

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

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.store.values['projects'] = JSON.stringify(value.projects);
    this.store.values['achievements'] = value.achievements.join(', ');
    this.store.values['links'] = value.links.join(', ');
    this.store.values['githubLink'] = value.links.find(l => this.linkLabel(l) === 'GitHub') || '';
    this.store.values['linkedinLink'] = value.links.find(l => this.linkLabel(l) === 'LinkedIn') || '';

    const first = value.projects[0] as Record<string, string> | undefined;
    this.store.values['projectTitle'] = first ? first['title'] : '';
    this.store.values['projectRole'] = first ? first['role'] : '';

    this.router.navigateByUrl('/student/review');
  }
}
