import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { EduField, Qualification } from './education-options';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './academic-information.css',
  template: `
    <section class="step-page">
      <div class="profile-form-card" *ngIf="!loaded">
        <p>Loading…</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()" *ngIf="loaded">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Academic Information details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 3 OF 9</span>
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
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/study-preferences">Previous</a>
        <button class="button primary" type="button" [disabled]="saving || !loaded" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class AcademicInformationComponent implements OnInit {
  loaded = false;
  levels: Qualification[] = [];
  educationGapOptions: string[] = [];
  qualificationFields: Record<string, EduField[]> = {};

  submitted = false;
  selected: Partial<Record<Qualification, boolean>> = {};

  form!: FormGroup;

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
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  private getToken(): string | null {
    return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token');
  }

  private handleUnauthorized() {
    localStorage.removeItem('superoffer_access_token');
    sessionStorage.removeItem('superoffer_access_token');
    this.router.navigate(['/auth/login/student'], { queryParams: { sessionExpired: '1' } });
  }

  /** Reconstructs the same field-set-per-qualification-level structure that used to be
   *  hardcoded, but built from the option lists fetched from the backend. */
  private buildQualificationFields(curriculumOptions: string[], educationYears: string[], universityOptions: string[]): Record<string, EduField[]> {
    const cgpaField: EduField = { key: 'cgpa', label: 'CGPA / Percentage', type: 'text', placeholder: 'e.g. 8.7 CGPA or 85%' };
    const backlogsField: EduField = { key: 'backlogs', label: 'Number of Backlogs', type: 'number', placeholder: 'e.g. 0' };
    const startedYearField: EduField = { key: 'startedYear', label: 'Started Year', type: 'select', options: educationYears };
    const completionYearField: EduField = { key: 'completionYear', label: 'Completion Year', type: 'select', options: educationYears };
    const yearsOfEducationField: EduField = { key: 'yearsOfEducation', label: 'Years of Education', type: 'number', placeholder: 'e.g. 10' };
    const curriculumField: EduField = { key: 'curriculum', label: 'Curriculum', type: 'select', options: curriculumOptions };

    return {
      '11th': [curriculumField, cgpaField, startedYearField, completionYearField],
      '12th': [curriculumField, cgpaField, startedYearField, completionYearField],
      Diploma: [
        { key: 'institutionName', label: 'College Name', type: 'text', placeholder: 'e.g. Government Polytechnic College', wide: true },
        { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Mechanical Engineering' },
        cgpaField, backlogsField, startedYearField, completionYearField
      ],
      "Bachelor's Degree": [
        { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. B.Tech, B.Sc, B.Com' },
        { key: 'specialization', label: 'Specialization / Major', type: 'text', placeholder: 'e.g. Computer Science' },
        { key: 'institutionName', label: 'University / College Name', type: 'select', options: universityOptions, wide: true, allowCustom: true },
        cgpaField, backlogsField, startedYearField, completionYearField, yearsOfEducationField
      ],
      "Master's Degree": [
        { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. M.Tech, M.Sc, MBA' },
        { key: 'specialization', label: 'Specialization', type: 'text', placeholder: 'e.g. Data Science' },
        { key: 'institutionName', label: 'University Name', type: 'select', options: universityOptions, wide: true, allowCustom: true },
        cgpaField, backlogsField, startedYearField, completionYearField, yearsOfEducationField
      ],
      PhD: [
        { key: 'degreeName', label: 'Degree Name', type: 'text', placeholder: 'e.g. PhD in Computer Science' },
        { key: 'specialization', label: 'Research Area', type: 'text', placeholder: 'e.g. Machine Learning' },
        { key: 'institutionName', label: 'University Name', type: 'select', options: universityOptions, wide: true, allowCustom: true },
        cgpaField, backlogsField, startedYearField, completionYearField, yearsOfEducationField
      ]
    };
  }

  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }

    try {
      const options = await this.api.getAcademicInformationReferenceData();
      this.levels = options.qualificationOptions as Qualification[];
      this.educationGapOptions = options.educationGapOptions;
      this.qualificationFields = this.buildQualificationFields(options.curriculumOptions, options.educationYears, options.universityOptions);
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // Reference data unreachable — fall back to an empty qualification list; the student can retry later.
    }

    this.form = this.fb.nonNullable.group({
      levels: this.fb.nonNullable.group(
        Object.fromEntries(this.levels.map(level => [level, this.buildLevelGroup(level)]))
      ),
      educationGap: this.fb.nonNullable.control<string>('')
    });
    this.loaded = true;

    try {
      const profile = await this.api.studentProfile(token);
      const academic = (profile?.academic as { history?: Array<Record<string, string>>; educationGap?: string }) || {};
      const history = academic.history || [];
      if (!this.selectedLevels().length && history.length) {
        for (const entry of history) {
          const level = entry['level'] as Qualification;
          if (!this.levels.includes(level)) continue;
          this.toggleLevel(level);
          const group = this.levelGroup(level);
          for (const f of this.fieldsFor(level)) {
            if (entry[f.key] !== undefined) group.get(f.key)!.setValue(entry[f.key]);
          }
        }
        if (academic.educationGap) this.form.get('educationGap')!.setValue(academic.educationGap);
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // No saved academic info yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
  }

  private buildLevelGroup(level: Qualification): FormGroup {
    return this.fb.nonNullable.group(
      Object.fromEntries(this.qualificationFields[level].map(f => [f.key, this.fb.nonNullable.control<string>('')]))
    );
  }

  get levelsGroup(): FormGroup { return this.form.get('levels') as FormGroup; }
  levelGroup(level: Qualification): FormGroup { return this.levelsGroup.get(level) as FormGroup; }
  fieldsFor(level: Qualification): EduField[] { return this.qualificationFields[level]; }

  isSelected(level: Qualification): boolean { return !!this.selected[level]; }
  selectedLevels(): Qualification[] { return this.levels.filter(lvl => this.selected[lvl]); }
  hasAboveSchoolLevel(): boolean { return this.selectedLevels().some(lvl => lvl !== '11th' && lvl !== '12th'); }

  toggleLevel(level: Qualification) {
    const nowSelected = !this.selected[level];
    this.selected[level] = nowSelected;
    const group = this.levelGroup(level);
    this.qualificationFields[level].forEach(f => {
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

  async saveAndContinue() {
    this.submitted = true;
    this.saveError = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.selectedLevels().length) return;

    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }

    const value = this.form.getRawValue();
    const selected = this.selectedLevels();
    const highest = selected[selected.length - 1];
    const highestFields = value.levels[highest] as Record<string, string>;

    const institution = highestFields['institutionName'] || this.store.values['institution'] || '';
    const score = highestFields['cgpa'] || this.store.values['score'] || '';
    const graduationYear = highestFields['completionYear'] || this.store.values['graduationYear'] || '';
    const degreeSummary = [highestFields['degreeName'], highestFields['specialization']].filter(Boolean).join(' ');
    const qualification = degreeSummary || highest || this.store.values['qualification'] || '';
    const history = selected.map(level => ({ level, ...(value.levels[level] as Record<string, string>) }));

    const payload = {
      qualificationLevel: highest,
      institution,
      score,
      graduationYear,
      qualification,
      educationGap: value.educationGap || undefined,
      history
    };

    this.saving = true;
    try {
      await this.api.saveStudentAcademicInformation(token, payload);

      this.store.values['qualificationLevel'] = highest;
      Object.assign(this.store.values, highestFields);
      this.store.values['educationGap'] = value.educationGap;
      this.store.values['institution'] = institution;
      this.store.values['score'] = score;
      this.store.values['graduationYear'] = graduationYear;
      this.store.values['qualification'] = qualification;
      this.store.values['academicHistory'] = JSON.stringify(history);

      this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/english-exam');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your academic details. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
