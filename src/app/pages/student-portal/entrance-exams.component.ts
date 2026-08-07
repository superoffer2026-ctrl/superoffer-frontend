import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { EXAM_CATEGORIES, EXAM_STATUS_OPTIONS, ExamCategoryConfig, ExamCategoryKey, scoreFieldsForStatus } from './exam-options';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './entrance-exams.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 4 OF 7</span>
        <h1>Entrance Exams</h1>
        <p>Tell us about your English proficiency and competitive exam scores.</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">EX</div>
          <div>
            <h2>Entrance Exams details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <div class="qualification-question" *ngIf="!attended">
          <h2>Have you attended any exams? <span class="required-mark">*</span></h2>
          <div class="choice-grid">
            <button type="button" class="choice-card" (click)="onAttendedClick('Yes')">
              <span class="choice-icon">✓</span>
              <span><strong>Yes</strong><small>I've taken, scheduled or am preparing for an exam</small></span>
            </button>
            <button type="button" class="choice-card" (click)="onAttendedClick('No')">
              <span class="choice-icon">–</span>
              <span><strong>No</strong><small>I haven't attempted any exam yet</small></span>
            </button>
          </div>
          <small class="field-error" *ngIf="showError('attendedExams')">Select an option</small>
        </div>

        <div class="reveal-section" [class.open]="attended==='Yes'">
          <div class="exam-category-card" *ngFor="let cat of examCategories" [class.hidden-card]="activeCategory!==cat.key">
            <header class="exam-category-head">
              <span class="exam-category-icon">{{cat.icon}}</span>
              <div><h3>{{cat.title}}</h3><p>{{cat.hint}}</p></div>
            </header>

            <div class="exam-pick-block">
              <span class="field-label">Which exam(s) have you taken or are preparing for?</span>
              <div class="combo-field">
                <input type="text" placeholder="Search exams"
                  [value]="isPickerOpen(cat.key) ? (pickerQuery[cat.key] || pickedNames(cat.key).join(', ')) : pickedNames(cat.key).join(', ')"
                  (focus)="onPickerFocus(cat.key)" (input)="pickerQuery[cat.key]=$any($event.target).value" (blur)="closePicker(cat.key)">
                <button type="button" class="combo-arrow" [class.open]="isPickerOpen(cat.key)" (mousedown)="$event.preventDefault()" (click)="togglePicker(cat.key)" aria-label="Toggle exam list">▾</button>
                <ul class="combo-list" *ngIf="isPickerOpen(cat.key)" (mousedown)="$event.preventDefault()">
                  <li *ngFor="let e of filteredExamOptions(cat)" (click)="toggleExam(cat.key, e)">
                    <span class="option-check" [class.checked]="isPicked(cat.key, e)">✓</span>{{e}}
                  </li>
                  <li class="combo-empty" *ngIf="!filteredExamOptions(cat).length">No matching exam</li>
                </ul>
              </div>
            </div>

            <div class="exam-entry-card" *ngFor="let grp of arrayOf(cat.key).controls" [formGroup]="asGroup(grp)">
              <div class="exam-entry-head">
                <strong>{{asGroup(grp).value.exam}}</strong>
                <button type="button" class="exam-entry-remove" (click)="toggleExam(cat.key, asGroup(grp).value.exam)" aria-label="Remove exam">×</button>
              </div>
              <div class="status-pill-row">
                <button type="button" class="status-pill" *ngFor="let s of statusOptions"
                  [class.active]="asGroup(grp).value.status===s" (click)="setExamStatus(asGroup(grp), s)">{{s}}</button>
              </div>
              <small class="field-error" *ngIf="showGroupError(asGroup(grp), 'status')">Select a status</small>

              <div class="score-fields" [class.single]="scoreFields(asGroup(grp).value.status).length===1">
                <label class="field-block" *ngFor="let sf of scoreFields(asGroup(grp).value.status)" [class.field-invalid]="showGroupError(asGroup(grp), sf.controlKey)">
                  <span class="field-label">{{sf.label}} <span class="required-mark">*</span></span>
                  <input type="text" [formControlName]="sf.controlKey" [placeholder]="sf.placeholder">
                  <small class="field-error" *ngIf="showGroupError(asGroup(grp), sf.controlKey)">Enter your {{sf.label.toLowerCase()}}</small>
                </label>
              </div>
            </div>

            <p class="exam-note" *ngIf="!arrayOf(cat.key).length">No exams selected for this category yet — that's fine if it doesn't apply to you.</p>

            <div class="exam-card-actions">
              <button type="button" class="button secondary" *ngIf="cat.key==='competitive'" (click)="activeCategory='english'">← Back to English</button>
              <span *ngIf="cat.key==='english'"></span>
              <button type="button" class="button primary" *ngIf="cat.key==='english'" (click)="activeCategory='competitive'">Next: Competitive Exam →</button>
            </div>
          </div>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/academic-information">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class EntranceExamsComponent {
  examCategories: ExamCategoryConfig[] = EXAM_CATEGORIES;
  statusOptions = EXAM_STATUS_OPTIONS;
  activeCategory: ExamCategoryKey = 'english';
  submitted = false;
  pickerOpenState: Partial<Record<ExamCategoryKey, boolean>> = {};
  pickerQuery: Partial<Record<ExamCategoryKey, string>> = {};

  form = this.fb.group({
    attendedExams: this.fb.nonNullable.control('', Validators.required),
    english: this.fb.array<FormGroup>([]),
    competitive: this.fb.array<FormGroup>([])
  });

  private returnToReview = false;

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  get attended(): string { return this.form.get('attendedExams')!.value as string; }

  arrayOf(key: ExamCategoryKey): FormArray { return this.form.get(key) as FormArray; }
  asGroup(control: AbstractControl): FormGroup { return control as FormGroup; }

  isPicked(key: ExamCategoryKey, examName: string): boolean {
    return this.arrayOf(key).controls.some(c => c.value.exam === examName);
  }

  pickedNames(key: ExamCategoryKey): string[] {
    return this.arrayOf(key).controls.map(c => c.value.exam);
  }

  filteredExamOptions(cat: ExamCategoryConfig): string[] {
    const q = (this.pickerQuery[cat.key] || '').trim().toLowerCase();
    return !q ? cat.examOptions : cat.examOptions.filter(e => e.toLowerCase().includes(q));
  }

  isPickerOpen(key: ExamCategoryKey): boolean { return !!this.pickerOpenState[key]; }
  onPickerFocus(key: ExamCategoryKey) { this.pickerOpenState[key] = true; this.pickerQuery[key] = ''; }
  closePicker(key: ExamCategoryKey) { this.pickerOpenState[key] = false; }
  togglePicker(key: ExamCategoryKey) {
    if (this.pickerOpenState[key]) { this.pickerOpenState[key] = false; }
    else { this.pickerOpenState[key] = true; this.pickerQuery[key] = ''; }
  }

  toggleExam(key: ExamCategoryKey, examName: string) {
    const arr = this.arrayOf(key);
    const idx = arr.controls.findIndex(c => c.value.exam === examName);
    if (idx >= 0) {
      arr.removeAt(idx);
      return;
    }
    arr.push(this.fb.group({
      exam: [examName],
      status: ['', Validators.required],
      score: [''],
      expectedScore: [''],
      currentScore: ['']
    }));
  }

  scoreFields(status: string) { return scoreFieldsForStatus(status); }

  setExamStatus(group: FormGroup, status: string) {
    const statusControl = group.get('status')!;
    statusControl.setValue(status);
    statusControl.markAsTouched();

    (['score', 'expectedScore', 'currentScore'] as const).forEach(key => {
      const control = group.get(key)!;
      control.setValue('');
      control.clearValidators();
      control.markAsUntouched();
      control.updateValueAndValidity({ emitEvent: false });
    });
    scoreFieldsForStatus(status).forEach(sf => {
      const control = group.get(sf.controlKey)!;
      control.setValidators(Validators.required);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  onAttendedClick(value: string) {
    const next = this.attended === value ? '' : value;
    const control = this.form.get('attendedExams')!;
    control.setValue(next);
    control.markAsTouched();
    if (next !== 'Yes') {
      this.arrayOf('english').clear();
      this.arrayOf('competitive').clear();
      this.activeCategory = 'english';
    }
  }

  showError(key: string): boolean {
    const control = this.form.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  showGroupError(group: FormGroup, key: string): boolean {
    const control = group.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.store.values['englishExams'] = JSON.stringify(value.english);
    this.store.values['competitiveExams'] = JSON.stringify(value.competitive);

    const firstEnglish = value.english[0] as Record<string, string> | undefined;
    if (firstEnglish) {
      this.store.values['englishExam'] = firstEnglish['exam'];
      this.store.values['englishScore'] = firstEnglish['score'] || firstEnglish['expectedScore'] || firstEnglish['currentScore'] || '';
    }
    const firstCompetitive = value.competitive[0] as Record<string, string> | undefined;
    if (firstCompetitive) {
      this.store.values['entranceExam'] = firstCompetitive['exam'];
      this.store.values['entranceScore'] = firstCompetitive['score'] || firstCompetitive['expectedScore'] || firstCompetitive['currentScore'] || '';
    }

    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/financial-information');
  }
}
