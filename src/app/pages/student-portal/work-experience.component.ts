import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './work-experience.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Work Experience details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 6 OF 9</span>
        </div>

        <h3 class="section-title">Do you have any work experience?</h3>
        <div class="toggle-group">
          <label class="toggle-option" [class.active]="workStatus==='Fresher'">
            <input type="radio" name="workStatus" value="Fresher" [checked]="workStatus==='Fresher'" (change)="onWorkStatusChange('Fresher')"> I am a Fresher
          </label>
          <label class="toggle-option" [class.active]="workStatus==='Yes'">
            <input type="radio" name="workStatus" value="Yes" [checked]="workStatus==='Yes'" (change)="onWorkStatusChange('Yes')"> Yes
          </label>
        </div>

        <div class="reveal-section" [class.open]="workStatus==='Yes'">
          <div class="dynamic-fields">
            <label [class.field-invalid]="showError('relevantYears')">
              <span class="field-label">Relevant Experience (Years) <span class="required-mark">*</span></span>
              <input type="number" min="0" formControlName="relevantYears" placeholder="e.g. 2" (blur)="markTouched('relevantYears')">
              <small class="field-error" *ngIf="showError('relevantYears')">Enter your relevant experience</small>
            </label>
            <label [class.field-invalid]="showError('nonRelevantYears')">
              <span class="field-label">Non-Relevant Experience (Years) <span class="required-mark">*</span></span>
              <input type="number" min="0" formControlName="nonRelevantYears" placeholder="e.g. 1" (blur)="markTouched('nonRelevantYears')">
              <small class="field-error" *ngIf="showError('nonRelevantYears')">Enter your non-relevant experience</small>
            </label>
          </div>

          <h3 class="section-title">Experience details</h3>
          <p class="section-hint">Add each job or internship — company, role and how long you were there.</p>

          <div class="experience-entry" *ngFor="let grp of experiencesArray.controls; let i=index" [formGroup]="asGroup(grp)">
            <div class="experience-entry-head">
              <strong>Experience {{i+1}}</strong>
              <button type="button" class="experience-remove" (click)="removeExperience(i)" aria-label="Remove experience">×</button>
            </div>
            <div class="dynamic-fields">
              <label [class.field-invalid]="showExpError(asGroup(grp),'companyName')">
                <span class="field-label">Company Name <span class="required-mark">*</span></span>
                <input type="text" formControlName="companyName" placeholder="e.g. Acme Corp" (blur)="markExpTouched(asGroup(grp),'companyName')">
                <small class="field-error" *ngIf="showExpError(asGroup(grp),'companyName')">Enter the company name</small>
              </label>
              <label [class.field-invalid]="showExpError(asGroup(grp),'role')">
                <span class="field-label">Role / Position <span class="required-mark">*</span></span>
                <input type="text" formControlName="role" placeholder="e.g. Software Engineering Intern" (blur)="markExpTouched(asGroup(grp),'role')">
                <small class="field-error" *ngIf="showExpError(asGroup(grp),'role')">Enter your role</small>
              </label>
              <label [class.field-invalid]="showExpError(asGroup(grp),'type')">
                <span class="field-label">Type <span class="required-mark">*</span></span>
                <select formControlName="type" (blur)="markExpTouched(asGroup(grp),'type')">
                  <option value="" disabled>Select type</option>
                  <option *ngFor="let t of employmentTypes" [value]="t">{{t}}</option>
                </select>
                <small class="field-error" *ngIf="showExpError(asGroup(grp),'type')">Select the experience type</small>
              </label>
              <label [class.field-invalid]="showExpError(asGroup(grp),'durationMonths')">
                <span class="field-label">Duration (Months) <span class="required-mark">*</span></span>
                <input type="number" min="0" formControlName="durationMonths" placeholder="e.g. 6" (blur)="markExpTouched(asGroup(grp),'durationMonths')">
                <small class="field-error" *ngIf="showExpError(asGroup(grp),'durationMonths')">Enter the duration</small>
              </label>
              <label class="wide">
                <span class="field-label">Description</span>
                <textarea formControlName="description" placeholder="What did you work on?"></textarea>
              </label>
            </div>
          </div>

          <button type="button" class="add-experience-btn" (click)="addExperience()">+ Add {{ experiencesArray.length ? 'another' : 'an' }} experience</button>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/competitive-exam">Previous</a>
        <button class="button primary" type="button" [disabled]="saving" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class WorkExperienceComponent implements OnInit {
  submitted = false;
  employmentTypes: string[] = [];

  form = this.fb.nonNullable.group({
    workStatus: this.fb.nonNullable.control<string>(''),
    relevantYears: this.fb.nonNullable.control<string>(''),
    nonRelevantYears: this.fb.nonNullable.control<string>(''),
    experiences: this.fb.array<FormGroup>([])
  });

  saving = false;
  saveError = '';

  private returnToReview = false;

  constructor(
    private fb: FormBuilder,
    public store: StudentProfileUiStore,
    private router: Router,
    private route: ActivatedRoute,
    private api: AuthApiService,
    private cdr: ChangeDetectorRef
  ) {
    this.form.patchValue({
      workStatus: this.store.values['workStatus'] || '',
      relevantYears: this.store.values['relevantYears'] || '',
      nonRelevantYears: this.store.values['nonRelevantYears'] || ''
    });
    if (this.workStatus === 'Yes') {
      this.applyRelevantValidators(true);
      const saved = this.parseSavedExperiences();
      if (saved.length) saved.forEach(entry => this.addExperience(entry));
      else this.addExperience();
    }
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  private parseSavedExperiences(): Record<string, string>[] {
    try {
      return JSON.parse(this.store.values['workExperiences'] || '[]');
    } catch {
      return [];
    }
  }

  private getToken(): string | null {
    return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token');
  }

  private handleUnauthorized() {
    localStorage.removeItem('superoffer_access_token');
    sessionStorage.removeItem('superoffer_access_token');
    this.router.navigate(['/auth/login/student'], { queryParams: { sessionExpired: '1' } });
  }

  /** Local store already hydrated the form synchronously; this only fills in from the
   *  server when the local store had nothing — e.g. a fresh browser/session. */
  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }
    try {
      const options = await this.api.getWorkExperienceReferenceData();
      this.employmentTypes = options.employmentTypes;
    } catch {
      // Reference data endpoint unreachable — the type dropdown stays empty; existing selections still load below.
    }
    if (this.workStatus) {
      this.cdr.detectChanges();
      return;
    }
    try {
      const profile = await this.api.studentProfile(token);
      const work = (profile?.workExperience as Record<string, unknown>) || {};
      const status = (work['workStatus'] as string) || '';
      if (status) {
        this.form.patchValue({
          workStatus: status,
          relevantYears: (work['relevantYears'] as string) || '',
          nonRelevantYears: (work['nonRelevantYears'] as string) || ''
        });
        if (status === 'Yes') {
          this.applyRelevantValidators(true);
          const experiences = (work['experiences'] as Record<string, string>[]) || [];
          if (experiences.length) experiences.forEach(entry => this.addExperience(entry));
          else this.addExperience();
        }
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // No saved work experience yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
  }

  get experiencesArray(): FormArray { return this.form.get('experiences') as FormArray; }
  asGroup(control: AbstractControl): FormGroup { return control as FormGroup; }

  addExperience(entry?: Record<string, string>) {
    this.experiencesArray.push(this.fb.group({
      companyName: [entry?.['companyName'] || '', Validators.required],
      role: [entry?.['role'] || '', Validators.required],
      type: [entry?.['type'] || '', Validators.required],
      durationMonths: [entry?.['durationMonths'] || '', Validators.required],
      description: [entry?.['description'] || '']
    }));
  }

  removeExperience(index: number) { this.experiencesArray.removeAt(index); }

  markExpTouched(group: FormGroup, key: string) { group.get(key)!.markAsTouched(); }
  showExpError(group: FormGroup, key: string): boolean {
    const control = group.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  get workStatus(): string { return this.form.get('workStatus')!.value; }

  private applyRelevantValidators(required: boolean) {
    const relevant = this.form.get('relevantYears')!;
    const nonRelevant = this.form.get('nonRelevantYears')!;
    relevant.setValidators(required ? Validators.required : null);
    nonRelevant.setValidators(required ? Validators.required : null);
    if (!required) {
      relevant.setValue('');
      nonRelevant.setValue('');
      relevant.markAsUntouched();
      nonRelevant.markAsUntouched();
    }
    relevant.updateValueAndValidity({ emitEvent: false });
    nonRelevant.updateValueAndValidity({ emitEvent: false });
  }

  onWorkStatusChange(value: string) {
    const control = this.form.get('workStatus')!;
    control.setValue(value);
    control.markAsTouched();
    this.applyRelevantValidators(value === 'Yes');
    if (value === 'Yes') {
      if (!this.experiencesArray.length) this.addExperience();
    } else {
      this.experiencesArray.clear();
    }
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
    const first = value.experiences[0] as Record<string, string> | undefined;
    const companyName = first ? first['companyName'] : '';
    const jobRole = first ? first['role'] : '';

    this.saving = true;
    try {
      await this.api.saveStudentWorkExperience(token, {
        workStatus: value.workStatus || undefined,
        relevantYears: value.relevantYears || undefined,
        nonRelevantYears: value.nonRelevantYears || undefined,
        experiences: value.experiences,
        companyName,
        jobRole
      });

      this.store.values['workStatus'] = value.workStatus;
      this.store.values['relevantYears'] = value.relevantYears;
      this.store.values['nonRelevantYears'] = value.nonRelevantYears;
      this.store.values['workExperiences'] = JSON.stringify(value.experiences);
      this.store.values['companyName'] = companyName;
      this.store.values['jobRole'] = jobRole;

      this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/financial-information');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your work experience. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
