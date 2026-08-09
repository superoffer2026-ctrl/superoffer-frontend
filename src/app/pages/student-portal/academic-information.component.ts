import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { EDUCATION_GAP_OPTIONS, EduField, Qualification, QUALIFICATION_FIELDS, QUALIFICATION_OPTIONS } from './education-options';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './academic-information.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Academic Information details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 3 OF 8</span>
        </div>

        <div class="qualification-question">
          <h2>Select your appropriate qualification(s) <span class="required-mark">*</span></h2>
          <div class="qualification-grid">
            <button type="button" class="qualification-card" *ngFor="let lvl of levels"
              [class.selected]="isSelected(lvl)" (click)="toggleLevel(lvl)">
              <span class="qual-check">✓</span>
              <strong>{{lvl}}</strong>
            </button>
          </div>
          <small class="field-error" *ngIf="showSelectionError()">Select at least one qualification</small>
        </div>

        <div class="reveal-section" [class.open]="selectedLevels().length">
          <div class="level-section" *ngFor="let lvl of selectedLevels(); trackBy: trackByLevel">
            <h3 class="section-title">{{lvl}} details</h3>
            <div class="dynamic-fields" [formGroup]="levelGroup(lvl)">
              <ng-container *ngFor="let f of fieldsFor(lvl); trackBy: trackByField">
                <label [class.wide]="f.wide" [class.field-invalid]="showLevelFieldError(lvl, f.key)">
                  <span class="field-label">{{f.label}} <span class="required-mark">*</span></span>
                  <select *ngIf="f.type==='select' && !f.allowCustom" [formControlName]="f.key" (blur)="markLevelFieldTouched(lvl, f.key)">
                    <option value="" disabled>Select {{f.label}}</option>
                    <option *ngFor="let opt of f.options" [value]="opt">{{opt}}</option>
                  </select>
                  <ng-container *ngIf="f.type==='select' && f.allowCustom">
                    <input type="text" [attr.list]="lvl+'-'+f.key+'-list'" [formControlName]="f.key" placeholder="Select or type your own" (blur)="markLevelFieldTouched(lvl, f.key)">
                    <datalist [id]="lvl+'-'+f.key+'-list'">
                      <option *ngFor="let opt of f.options" [value]="opt"></option>
                    </datalist>
                  </ng-container>
                  <input *ngIf="f.type==='text'" type="text" [formControlName]="f.key" [placeholder]="f.placeholder || ''" (blur)="markLevelFieldTouched(lvl, f.key)">
                  <input *ngIf="f.type==='number'" type="number" min="0" [formControlName]="f.key" [placeholder]="f.placeholder || ''" (blur)="markLevelFieldTouched(lvl, f.key)">
                  <small class="field-error" *ngIf="showLevelFieldError(lvl, f.key)">This field is required</small>
                </label>
              </ng-container>
            </div>
          </div>

          <ng-container *ngIf="selectedLevels().length && hasAboveSchoolLevel()">
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

        <p class="save-message error" *ngIf="submitted && (form.invalid || !selectedLevels().length)">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/study-preferences">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid || !selectedLevels().length" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class AcademicInformationComponent {
  levels = QUALIFICATION_OPTIONS;
  educationGapOptions = EDUCATION_GAP_OPTIONS;
  submitted = false;
  selected: Partial<Record<Qualification, boolean>> = {};

  form = this.fb.nonNullable.group({
    levels: this.fb.nonNullable.group(
      Object.fromEntries(this.levels.map(level => [level, this.buildLevelGroup(level)]))
    ),
    educationGap: this.fb.nonNullable.control<string>('')
  });

  private returnToReview = false;

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  private buildLevelGroup(level: Qualification): FormGroup {
    return this.fb.nonNullable.group(
      Object.fromEntries(QUALIFICATION_FIELDS[level].map(f => [f.key, this.fb.nonNullable.control<string>('')]))
    );
  }

  get levelsGroup(): FormGroup { return this.form.get('levels') as FormGroup; }
  levelGroup(level: Qualification): FormGroup { return this.levelsGroup.get(level) as FormGroup; }
  fieldsFor(level: Qualification): EduField[] { return QUALIFICATION_FIELDS[level]; }

  isSelected(level: Qualification): boolean { return !!this.selected[level]; }
  selectedLevels(): Qualification[] { return this.levels.filter(lvl => this.selected[lvl]); }
  hasAboveSchoolLevel(): boolean { return this.selectedLevels().some(lvl => lvl !== '11th' && lvl !== '12th'); }

  toggleLevel(level: Qualification) {
    const nowSelected = !this.selected[level];
    this.selected[level] = nowSelected;
    const group = this.levelGroup(level);
    QUALIFICATION_FIELDS[level].forEach(f => {
      const control = group.get(f.key)!;
      if (nowSelected) {
        control.setValidators(Validators.required);
      } else {
        control.setValidators(null);
        control.setValue('');
        control.markAsUntouched();
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  trackByLevel(index: number, level: Qualification): string { return level; }
  trackByField(index: number, field: EduField): string { return field.key; }

  markLevelFieldTouched(level: Qualification, key: string) { this.levelGroup(level).get(key)!.markAsTouched(); }

  showLevelFieldError(level: Qualification, key: string): boolean {
    const control = this.levelGroup(level).get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  showSelectionError(): boolean {
    return this.submitted && !this.selectedLevels().length;
  }

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.selectedLevels().length) return;

    const value = this.form.getRawValue();
    const selected = this.selectedLevels();
    const highest = selected[selected.length - 1];
    const highestFields = value.levels[highest] as Record<string, string>;

    this.store.values['qualificationLevel'] = highest;
    Object.assign(this.store.values, highestFields);
    this.store.values['educationGap'] = value.educationGap;

    this.store.values['institution'] = highestFields['institutionName'] || this.store.values['institution'];
    this.store.values['score'] = highestFields['cgpa'] || this.store.values['score'];
    this.store.values['graduationYear'] = highestFields['completionYear'] || this.store.values['graduationYear'];
    const degreeSummary = [highestFields['degreeName'], highestFields['specialization']].filter(Boolean).join(' ');
    this.store.values['qualification'] = degreeSummary || highest || this.store.values['qualification'];

    this.store.values['academicHistory'] = JSON.stringify(
      selected.map(level => ({ level, ...(value.levels[level] as Record<string, string>) }))
    );

    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/english-exam');
  }
}
