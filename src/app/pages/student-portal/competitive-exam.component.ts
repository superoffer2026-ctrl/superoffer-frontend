import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { COMPETITIVE_EXAM_OPTIONS, EXAM_STATUS_OPTIONS, scoreFieldsForStatus } from './exam-options';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './entrance-exams.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Competitive Exam details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 5 OF 8</span>
        </div>

        <div class="qualification-question" *ngIf="!attended">
          <h2>Have you taken or are preparing for a competitive exam? <span class="required-mark">*</span></h2>
          <div class="choice-grid">
            <button type="button" class="choice-card" (click)="onAttendedClick('Yes')">
              <span class="choice-icon">✓</span>
              <span><strong>Yes</strong><small>GRE or GMAT</small></span>
            </button>
            <button type="button" class="choice-card" (click)="onAttendedClick('No')">
              <span class="choice-icon">–</span>
              <span><strong>No</strong><small>I haven't attempted any competitive exam yet</small></span>
            </button>
          </div>
          <small class="field-error" *ngIf="showError('attendedExams')">Select an option</small>
        </div>

        <div class="reveal-section" [class.open]="attended==='Yes'">
          <div class="exam-category-card">
            <div class="exam-pick-block">
              <span class="field-label">Which exam(s) have you taken or are preparing for?</span>
              <div class="combo-field">
                <input type="text" placeholder="Search exams"
                  [value]="pickerOpen ? pickerQuery : pickedNames().join(', ')"
                  (focus)="onPickerFocus()" (input)="pickerQuery=$any($event.target).value" (blur)="closePicker()">
                <button type="button" class="combo-arrow" [class.open]="pickerOpen" (mousedown)="$event.preventDefault()" (click)="togglePicker()" aria-label="Toggle exam list">▾</button>
                <ul class="combo-list" *ngIf="pickerOpen" (mousedown)="$event.preventDefault()">
                  <li *ngFor="let e of filteredExamOptions()" (click)="toggleExam(e)">
                    <span class="option-check" [class.checked]="isPicked(e)">✓</span>{{e}}
                  </li>
                  <li class="combo-empty" *ngIf="!filteredExamOptions().length">No matching exam</li>
                </ul>
              </div>
            </div>

            <div class="exam-entry-card" *ngFor="let grp of examsArray.controls" [formGroup]="asGroup(grp)">
              <div class="exam-entry-head">
                <strong>{{asGroup(grp).value.exam}}</strong>
                <button type="button" class="exam-entry-remove" (click)="toggleExam(asGroup(grp).value.exam)" aria-label="Remove exam">×</button>
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

            <p class="exam-note" *ngIf="!examsArray.length">No exams selected yet — that's fine if it doesn't apply to you.</p>
          </div>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/english-exam">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class CompetitiveExamComponent {
  examOptions = COMPETITIVE_EXAM_OPTIONS;
  statusOptions = EXAM_STATUS_OPTIONS;
  submitted = false;
  pickerOpen = false;
  pickerQuery = '';

  form = this.fb.group({
    attendedExams: this.fb.nonNullable.control('', Validators.required),
    competitive: this.fb.array<FormGroup>([])
  });

  private returnToReview = false;

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  get attended(): string { return this.form.get('attendedExams')!.value as string; }
  get examsArray(): FormArray { return this.form.get('competitive') as FormArray; }
  asGroup(control: AbstractControl): FormGroup { return control as FormGroup; }

  isPicked(examName: string): boolean {
    return this.examsArray.controls.some(c => c.value.exam === examName);
  }

  pickedNames(): string[] {
    return this.examsArray.controls.map(c => c.value.exam);
  }

  filteredExamOptions(): string[] {
    const q = this.pickerQuery.trim().toLowerCase();
    return !q ? this.examOptions : this.examOptions.filter(e => e.toLowerCase().includes(q));
  }

  onPickerFocus() { this.pickerOpen = true; this.pickerQuery = ''; }
  closePicker() { this.pickerOpen = false; }
  togglePicker() {
    if (this.pickerOpen) { this.pickerOpen = false; }
    else { this.pickerOpen = true; this.pickerQuery = ''; }
  }

  toggleExam(examName: string) {
    const arr = this.examsArray;
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
    if (next !== 'Yes') this.examsArray.clear();
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
    this.store.values['competitiveExams'] = JSON.stringify(value.competitive);

    const firstCompetitive = value.competitive[0] as Record<string, string> | undefined;
    this.store.values['entranceExam'] = firstCompetitive ? firstCompetitive['exam'] : '';
    this.store.values['entranceScore'] = firstCompetitive ? (firstCompetitive['score'] || firstCompetitive['expectedScore'] || firstCompetitive['currentScore'] || '') : '';

    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/work-experience');
  }
}
