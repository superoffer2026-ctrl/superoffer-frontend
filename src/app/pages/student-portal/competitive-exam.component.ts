import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { scoreFieldsForStatus } from './exam-options';
import { AuthApiService } from '../../core/auth-api.service';

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
          <span class="step-badge">STEP 5 OF 9</span>
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
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/english-exam">Previous</a>
        <button class="button primary" type="button" [disabled]="saving" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class CompetitiveExamComponent implements OnInit {
  examOptions: string[] = [];
  statusOptions: string[] = [];
  submitted = false;
  pickerOpen = false;
  pickerQuery = '';

  form = this.fb.group({
    attendedExams: this.fb.nonNullable.control('', Validators.required),
    competitive: this.fb.array<FormGroup>([])
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

  private restoreExam(entry: Record<string, string>) {
    this.toggleExam(entry['exam']);
    const idx = this.examsArray.controls.findIndex(c => c.value.exam === entry['exam']);
    if (idx < 0) return;
    const group = this.asGroup(this.examsArray.at(idx));
    this.setExamStatus(group, entry['status']);
    (['score', 'expectedScore', 'currentScore'] as const).forEach(key => {
      if (entry[key]) group.get(key)!.setValue(entry[key]);
    });
  }

  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }
    try {
      const options = await this.api.getCompetitiveExamReferenceData();
      this.examOptions = options.competitiveExamOptions;
      this.statusOptions = options.examStatusOptions;
    } catch {
      // Reference data endpoint unreachable — pickers stay empty; existing selections still load below.
    }
    try {
      const profile = await this.api.studentProfile(token);
      const exams = (profile?.entranceExams as { competitiveExams?: Array<Record<string, string>> }) || {};
      const competitiveExams = exams.competitiveExams || [];
      if (!this.examsArray.length && competitiveExams.length) {
        this.form.get('attendedExams')!.setValue('Yes');
        competitiveExams.forEach(entry => this.restoreExam(entry));
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // No saved exams yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
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
    const firstCompetitive = value.competitive[0] as Record<string, string> | undefined;
    const entranceExam = firstCompetitive ? firstCompetitive['exam'] : '';
    const entranceScore = firstCompetitive ? (firstCompetitive['score'] || firstCompetitive['expectedScore'] || firstCompetitive['currentScore'] || '') : '';

    this.saving = true;
    try {
      await this.api.saveStudentCompetitiveExam(token, { competitiveExams: value.competitive, entranceExam, entranceScore });

      this.store.values['competitiveExams'] = JSON.stringify(value.competitive);
      this.store.values['entranceExam'] = entranceExam;
      this.store.values['entranceScore'] = entranceScore;

      this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/work-experience');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your exam details. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
