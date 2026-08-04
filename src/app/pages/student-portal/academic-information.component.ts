import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { ALL_EDU_KEYS, EDUCATION_GAP_OPTIONS, EduField, FILE_STATUS_LATER, FILE_STATUS_PENDING, Qualification, QUALIFICATION_FIELDS, QUALIFICATION_OPTIONS } from './education-options';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './academic-information.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 3 OF 8</span>
        <h1>Academic Information</h1>
        <p>Tell us about your education history so we can match you with the right programmes and lenders.</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">AC</div>
          <div>
            <h2>Academic Information details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <div class="qualification-question">
          <h2>What's your highest educational qualification? <span class="required-mark">*</span></h2>
          <div class="qualification-grid">
            <button type="button" class="qualification-card" *ngFor="let q of qualificationOptions"
              [class.selected]="qualification===q" (click)="onQualificationChange(q)">
              <span class="qual-check">✓</span>
              <strong>{{q}}</strong>
            </button>
          </div>
          <small class="field-error" *ngIf="showError('qualification')">Select your highest qualification</small>
        </div>

        <div class="reveal-section" [class.open]="!!qualification">
          <div class="dynamic-fields open" [formGroup]="educationGroup">
            <ng-container *ngFor="let f of visibleFields; trackBy: trackByField">
              <label [class.wide]="f.wide" [class.field-invalid]="showEduError(f.key)">
                <span class="field-label">{{f.label}} <span class="required-mark">*</span></span>
                <select *ngIf="f.type==='select'" [formControlName]="f.key" (blur)="markEduTouched(f.key)">
                  <option value="" disabled>Select {{f.label}}</option>
                  <option *ngFor="let opt of f.options" [value]="opt">{{opt}}</option>
                </select>
                <input *ngIf="f.type==='text'" type="text" [formControlName]="f.key" [placeholder]="f.placeholder || ''" (blur)="markEduTouched(f.key)">
                <input *ngIf="f.type==='number'" type="number" min="0" [formControlName]="f.key" [placeholder]="f.placeholder || ''" (blur)="markEduTouched(f.key)">

                <div class="upload-field" *ngIf="f.type==='file'">
                  <label class="upload-dropzone" *ngIf="!hasFile(f.key)">
                    <span class="upload-dz-icon">⬆</span>
                    <span class="upload-dz-copy"><strong>Upload file</strong><small>PDF, JPG or PNG</small></span>
                    <input type="file" accept="image/png,image/jpeg,application/pdf" (change)="onEduFileChange(f.key,$event)">
                  </label>
                  <div class="uploaded-file" *ngIf="hasFile(f.key)">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ fileStatusLabel(f.key) }}</span>
                    <button type="button" class="file-remove" (click)="clearFile(f.key)" aria-label="Remove file">×</button>
                  </div>
                  <div class="upload-alt">
                    <button type="button" class="upload-pill" [class.active]="isFileStatus(f.key,'RESULT_PENDING')" (click)="setFileStatus(f.key,'RESULT_PENDING')">
                      <span class="pill-dot"></span>Result yet to come
                    </button>
                    <button type="button" class="upload-pill" [class.active]="isFileStatus(f.key,'UPLOAD_LATER')" (click)="setFileStatus(f.key,'UPLOAD_LATER')">
                      <span class="pill-dot"></span>I'll upload later
                    </button>
                  </div>
                </div>
                <small class="field-error" *ngIf="showEduError(f.key)">{{ f.type==='file' ? 'Upload your certificate or choose an option above' : 'This field is required' }}</small>
              </label>
            </ng-container>
          </div>

          <ng-container *ngIf="!isSchoolLevel">
            <h3 class="section-title">Do you have any work experience?</h3>
            <div class="toggle-group">
              <label class="toggle-option" [class.active]="workStatus==='Fresher'">
                <input type="radio" name="workStatus" value="Fresher" [checked]="workStatus==='Fresher'" (change)="onWorkStatusChange('Fresher')"> I am a Fresher
              </label>
              <label class="toggle-option" [class.active]="workStatus==='Yes'">
                <input type="radio" name="workStatus" value="Yes" [checked]="workStatus==='Yes'" (change)="onWorkStatusChange('Yes')"> Yes
              </label>
            </div>

            <div class="dynamic-fields" [class.open]="workStatus==='Yes'">
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

            <h3 class="section-title">Do you have an education gap?</h3>
            <div class="field-grid">
              <label class="wide">
                <select formControlName="educationGap">
                  <option value="" disabled>Select</option>
                  <option *ngFor="let g of educationGapOptions" [value]="g">{{g}}</option>
                </select>
              </label>
            </div>
          </ng-container>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/study-preferences">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class AcademicInformationComponent {
  qualificationOptions = QUALIFICATION_OPTIONS;
  educationGapOptions = EDUCATION_GAP_OPTIONS;
  submitted = false;

  form = this.fb.nonNullable.group({
    qualification: this.fb.nonNullable.control<Qualification | ''>('', Validators.required),
    education: this.fb.nonNullable.group(
      Object.fromEntries(ALL_EDU_KEYS.map(key => [key, this.fb.nonNullable.control<string>('')]))
    ),
    workStatus: this.fb.nonNullable.control<string>(''),
    relevantYears: this.fb.nonNullable.control<string>(''),
    nonRelevantYears: this.fb.nonNullable.control<string>(''),
    educationGap: this.fb.nonNullable.control<string>('')
  });

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router) {}

  get educationGroup(): FormGroup { return this.form.get('education') as FormGroup; }
  get qualification(): Qualification | '' { return this.form.get('qualification')!.value as Qualification | ''; }
  get visibleFields(): EduField[] { return this.qualification ? QUALIFICATION_FIELDS[this.qualification] : []; }
  get workStatus(): string { return this.form.get('workStatus')!.value; }
  get isSchoolLevel(): boolean { return this.qualification === '10th' || this.qualification === '12th'; }

  trackByField(index: number, field: EduField): string { return `${this.qualification}:${field.key}`; }

  onQualificationChange(value: string) {
    const control = this.form.get('qualification')!;
    control.setValue(value as Qualification | '');
    control.markAsTouched();

    const activeKeys = new Set((QUALIFICATION_FIELDS[value as Qualification] || []).map(f => f.key));
    ALL_EDU_KEYS.forEach(key => {
      const eduControl = this.educationGroup.get(key)!;
      eduControl.setValue('');
      eduControl.markAsUntouched();
      eduControl.setValidators(activeKeys.has(key) ? Validators.required : null);
      eduControl.updateValueAndValidity({ emitEvent: false });
    });

    if (value === '10th' || value === '12th') {
      this.onWorkStatusChange('');
      const gap = this.form.get('educationGap')!;
      gap.setValue('');
      gap.markAsUntouched();
    }
  }

  onWorkStatusChange(value: string) {
    const control = this.form.get('workStatus')!;
    control.setValue(value);
    control.markAsTouched();

    const relevant = this.form.get('relevantYears')!;
    const nonRelevant = this.form.get('nonRelevantYears')!;
    if (value === 'Yes') {
      relevant.setValidators(Validators.required);
      nonRelevant.setValidators(Validators.required);
    } else {
      relevant.setValidators(null);
      nonRelevant.setValidators(null);
      relevant.setValue('');
      nonRelevant.setValue('');
      relevant.markAsUntouched();
      nonRelevant.markAsUntouched();
    }
    relevant.updateValueAndValidity({ emitEvent: false });
    nonRelevant.updateValueAndValidity({ emitEvent: false });
  }

  markTouched(key: string) { this.form.get(key)!.markAsTouched(); }
  markEduTouched(key: string) { this.educationGroup.get(key)!.markAsTouched(); }

  setFileStatus(key: string, status: typeof FILE_STATUS_PENDING | typeof FILE_STATUS_LATER) {
    const control = this.educationGroup.get(key)!;
    control.setValue(control.value === status ? '' : status);
    control.markAsTouched();
  }

  onEduFileChange(key: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const control = this.educationGroup.get(key)!;
    control.setValue(file.name);
    control.markAsTouched();
  }

  clearFile(key: string) {
    const control = this.educationGroup.get(key)!;
    control.setValue('');
    control.markAsTouched();
  }

  isFileStatus(key: string, status: typeof FILE_STATUS_PENDING | typeof FILE_STATUS_LATER): boolean {
    return this.educationGroup.get(key)!.value === status;
  }

  hasFile(key: string): boolean {
    const value = this.educationGroup.get(key)!.value;
    return !!value && value !== FILE_STATUS_PENDING && value !== FILE_STATUS_LATER;
  }

  fileStatusLabel(key: string): string {
    const value = this.educationGroup.get(key)!.value;
    if (value === FILE_STATUS_PENDING) return 'Marked as: result yet to come';
    if (value === FILE_STATUS_LATER) return "Marked as: you'll upload later";
    return value ? value : 'No file selected';
  }

  showError(key: string): boolean {
    const control = this.form.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }
  showEduError(key: string): boolean {
    const control = this.educationGroup.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.store.values['qualificationLevel'] = value.qualification;
    Object.assign(this.store.values, value.education);
    this.store.values['workStatus'] = value.workStatus;
    this.store.values['relevantYears'] = value.relevantYears;
    this.store.values['nonRelevantYears'] = value.nonRelevantYears;
    this.store.values['educationGap'] = value.educationGap;

    this.store.values['institution'] = value.education['institutionName'] || this.store.values['institution'];
    this.store.values['score'] = value.education['cgpa'] || this.store.values['score'];
    this.store.values['graduationYear'] = value.education['completionYear'] || this.store.values['graduationYear'];
    const degreeSummary = [value.education['degreeName'], value.education['specialization']].filter(Boolean).join(' ');
    this.store.values['qualification'] = degreeSummary || value.qualification || this.store.values['qualification'];

    this.router.navigateByUrl('/student/entrance-exams');
  }
}
