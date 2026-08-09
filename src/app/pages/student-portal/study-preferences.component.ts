import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { FIELDS_OF_STUDY, INTAKE_OPTIONS, MBBS_ONLY_COUNTRIES, PROGRAM_OPTIONS, START_YEARS, STUDY_COUNTRIES } from './study-options';

type MultiKey = 'countries' | 'fieldsOfStudy' | 'programs' | 'startYear' | 'intakes';
type Which = 'country' | 'field' | 'program' | 'intake' | 'year';

function requireOne(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length ? null : { required: true };
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './study-preferences.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Study Preferences details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 2 OF 8</span>
        </div>

        <div class="field-grid">
          <div class="combo-field wide" [class.field-invalid]="showError('countries')">
            <span class="field-label">Which country do you want to study in? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <span class="tag-chip" *ngFor="let item of selectedOf('countries')">{{item}}<button type="button" (mousedown)="$event.preventDefault()" (click)="toggleMulti('countries', item)" [attr.aria-label]="'Remove '+item">×</button></span>
              <input #countryBox type="text" placeholder="Search countries"
                [value]="countryOpen ? countryQuery : ''"
                (focus)="onFieldFocus('country')" (input)="onFieldInput('country', $any($event.target).value)" (blur)="delayedClose('country')">
              <button type="button" class="combo-arrow" [class.open]="countryOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('country', countryBox)" aria-label="Toggle country list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="countryOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(countryOptions, countryQuery)" (click)="toggleMulti('countries', opt)">
                <span class="option-check" [class.checked]="isSelected('countries', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(countryOptions, countryQuery).length">No matching country</li>
            </ul>
            <small class="field-error" *ngIf="showError('countries')">Select at least one country</small>
          </div>

          <div class="combo-field wide" [class.field-invalid]="showError('fieldsOfStudy')">
            <span class="field-label">What do you want to study? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <span class="tag-chip" *ngFor="let item of selectedOf('fieldsOfStudy')">{{item}}<button type="button" (mousedown)="$event.preventDefault()" (click)="toggleMulti('fieldsOfStudy', item)" [attr.aria-label]="'Remove '+item">×</button></span>
              <input #fieldBox type="text" placeholder="Search"
                [value]="fieldOpen ? fieldQuery : ''"
                (focus)="onFieldFocus('field')" (input)="onFieldInput('field', $any($event.target).value)" (blur)="delayedClose('field')">
              <button type="button" class="combo-arrow" [class.open]="fieldOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('field', fieldBox)" aria-label="Toggle list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="fieldOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(availableFieldOptions(), fieldQuery)" (click)="toggleMulti('fieldsOfStudy', opt)">
                <span class="option-check" [class.checked]="isSelected('fieldsOfStudy', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(availableFieldOptions(), fieldQuery).length">No matching option</li>
            </ul>
            <small class="field-hint" *ngIf="isMbbsOnlyCountrySelected()">One of your selected countries only offers MBBS.</small>
            <small class="field-error" *ngIf="showError('fieldsOfStudy')">Select at least one option</small>
          </div>

          <div class="combo-field wide" [class.field-invalid]="showError('programs')">
            <span class="field-label">Program of Interest <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <span class="tag-chip" *ngFor="let item of selectedOf('programs')">{{item}}<button type="button" (mousedown)="$event.preventDefault()" (click)="toggleMulti('programs', item)" [attr.aria-label]="'Remove '+item">×</button></span>
              <input #programBox type="text" placeholder="Search programs"
                [value]="programOpen ? programQuery : ''"
                (focus)="onFieldFocus('program')" (input)="onFieldInput('program', $any($event.target).value)" (blur)="delayedClose('program')">
              <button type="button" class="combo-arrow" [class.open]="programOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('program', programBox)" aria-label="Toggle program list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="programOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(programOptions, programQuery)" (click)="toggleMulti('programs', opt)">
                <span class="option-check" [class.checked]="isSelected('programs', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(programOptions, programQuery).length">No matching program</li>
            </ul>
            <small class="field-error" *ngIf="showError('programs')">Select at least one program</small>
          </div>

          <div class="combo-field wide" [class.field-invalid]="showError('startYear')">
            <span class="field-label">When do you plan to start studying? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <span class="tag-chip" *ngFor="let item of selectedOf('startYear')">{{item}}<button type="button" (mousedown)="$event.preventDefault()" (click)="toggleMulti('startYear', item)" [attr.aria-label]="'Remove '+item">×</button></span>
              <input #yearBox type="text" placeholder="Search year"
                [value]="yearOpen ? yearQuery : ''"
                (focus)="onFieldFocus('year')" (input)="onFieldInput('year', $any($event.target).value)" (blur)="delayedClose('year')">
              <button type="button" class="combo-arrow" [class.open]="yearOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('year', yearBox)" aria-label="Toggle year list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="yearOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let year of filterYearOptions(yearQuery)" (click)="toggleMulti('startYear', '' + year)">
                <span class="option-check" [class.checked]="isSelected('startYear', '' + year)">✓</span>{{year}}
              </li>
              <li class="combo-empty" *ngIf="!filterYearOptions(yearQuery).length">No matching year</li>
            </ul>
            <small class="field-error" *ngIf="showError('startYear')">Select at least one start year</small>
          </div>

          <div class="combo-field wide" [class.field-invalid]="showError('intakes')">
            <span class="field-label">Preferred Intake <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <span class="tag-chip" *ngFor="let item of selectedOf('intakes')">{{item}}<button type="button" (mousedown)="$event.preventDefault()" (click)="toggleMulti('intakes', item)" [attr.aria-label]="'Remove '+item">×</button></span>
              <input #intakeBox type="text" placeholder="Search intake"
                [value]="intakeOpen ? intakeQuery : ''"
                (focus)="onFieldFocus('intake')" (input)="onFieldInput('intake', $any($event.target).value)" (blur)="delayedClose('intake')">
              <button type="button" class="combo-arrow" [class.open]="intakeOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('intake', intakeBox)" aria-label="Toggle intake list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="intakeOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(intakeOptions, intakeQuery)" (click)="toggleMulti('intakes', opt)">
                <span class="option-check" [class.checked]="isSelected('intakes', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(intakeOptions, intakeQuery).length">No matching intake</li>
            </ul>
            <small class="field-error" *ngIf="showError('intakes')">Select at least one intake</small>
          </div>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/personal-information">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class StudyPreferencesComponent {
  countryOptions = STUDY_COUNTRIES;
  fieldOptions = PROGRAM_OPTIONS;
  programOptions = FIELDS_OF_STUDY;
  intakeOptions = INTAKE_OPTIONS;
  startYearOptions = START_YEARS;

  countryQuery = '';
  fieldQuery = '';
  programQuery = '';
  intakeQuery = '';
  yearQuery = '';
  countryOpen = false;
  fieldOpen = false;
  programOpen = false;
  intakeOpen = false;
  yearOpen = false;
  submitted = false;

  form = this.fb.nonNullable.group({
    countries: this.fb.nonNullable.control<string[]>([], requireOne),
    fieldsOfStudy: this.fb.nonNullable.control<string[]>([], requireOne),
    programs: this.fb.nonNullable.control<string[]>([], requireOne),
    startYear: this.fb.nonNullable.control<string[]>([], requireOne),
    intakes: this.fb.nonNullable.control<string[]>([], requireOne)
  });

  private returnToReview = false;

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.form.patchValue({
      countries: this.splitList(this.store.values['countries']),
      fieldsOfStudy: this.splitList(this.store.values['studyLevel']),
      programs: this.splitList(this.store.values['fieldOfInterest']),
      startYear: this.splitList(this.store.values['startYear']),
      intakes: this.splitList(this.store.values['intake'])
    });
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  private splitList(value?: string): string[] {
    return (value || '').split(',').map(item => item.trim()).filter(Boolean);
  }

  selectedOf(key: MultiKey): string[] { return this.form.get(key)!.value as string[]; }
  isSelected(key: MultiKey, value: string): boolean { return this.selectedOf(key).includes(value); }

  /** Every combo field allows multiple selections; dropdown stays open so more picks can follow. */
  toggleMulti(key: MultiKey, value: string) {
    const control = this.form.get(key)!;
    const current: string[] = control.value || [];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    control.setValue(next);
    control.markAsTouched();
    this.resetQuery(key);

    if (key === 'countries') this.syncFieldsOfStudyForCountries();
  }

  /** True once one of the selected countries only offers an MBBS pathway. */
  isMbbsOnlyCountrySelected(): boolean {
    return this.selectedOf('countries').some(country => MBBS_ONLY_COUNTRIES.includes(country));
  }

  /** "What do you want to study?" narrows to MBBS only once an MBBS-only country is picked. */
  availableFieldOptions(): string[] {
    return this.isMbbsOnlyCountrySelected() ? ['MBBS'] : this.fieldOptions;
  }

  /** Drops study levels no longer offered, and auto-fills MBBS once an MBBS-only country is picked. */
  private syncFieldsOfStudyForCountries() {
    const allowed = this.availableFieldOptions();
    const control = this.form.get('fieldsOfStudy')!;
    const current: string[] = control.value || [];
    let next = current.filter(item => allowed.includes(item));
    if (this.isMbbsOnlyCountrySelected() && !next.includes('MBBS')) next = [...next, 'MBBS'];
    if (next.length !== current.length || next.some((item, i) => item !== current[i])) control.setValue(next);
  }


  /** Clears the search text so the box falls back to showing the (now updated) selection. */
  private resetQuery(key: MultiKey) {
    if (key === 'countries') this.countryQuery = '';
    else if (key === 'fieldsOfStudy') this.fieldQuery = '';
    else if (key === 'programs') this.programQuery = '';
    else if (key === 'startYear') this.yearQuery = '';
    else this.intakeQuery = '';
  }

  filterOptions(options: string[], query: string): string[] {
    const q = query.trim().toLowerCase();
    return !q ? options : options.filter(option => option.toLowerCase().includes(q));
  }

  filterYearOptions(query: string): number[] {
    const q = query.trim();
    return !q ? this.startYearOptions : this.startYearOptions.filter(year => String(year).includes(q));
  }

  /** Closes the dropdown when focus genuinely leaves the field (option clicks don't blur it). */
  delayedClose(which: Which) {
    if (which === 'country') this.countryOpen = false;
    else if (which === 'field') this.fieldOpen = false;
    else if (which === 'program') this.programOpen = false;
    else if (which === 'intake') this.intakeOpen = false;
    else this.yearOpen = false;
  }

  onFieldFocus(which: Which) {
    if (which === 'country') { this.countryOpen = true; this.countryQuery = ''; }
    else if (which === 'field') { this.fieldOpen = true; this.fieldQuery = ''; }
    else if (which === 'program') { this.programOpen = true; this.programQuery = ''; }
    else if (which === 'intake') { this.intakeOpen = true; this.intakeQuery = ''; }
    else { this.yearOpen = true; this.yearQuery = ''; }
  }

  isOpen(which: Which): boolean {
    if (which === 'country') return this.countryOpen;
    if (which === 'field') return this.fieldOpen;
    if (which === 'program') return this.programOpen;
    if (which === 'intake') return this.intakeOpen;
    return this.yearOpen;
  }

  /** Lets the dropdown arrow open/close the list without needing to click into the text box first. */
  toggleOpen(which: Which, inputEl: HTMLInputElement) {
    if (this.isOpen(which)) {
      this.delayedClose(which);
      inputEl.blur();
    } else {
      this.onFieldFocus(which);
      inputEl.focus();
    }
  }

  onFieldInput(which: Which, value: string) {
    if (which === 'country') this.countryQuery = value;
    else if (which === 'field') this.fieldQuery = value;
    else if (which === 'program') this.programQuery = value;
    else if (which === 'intake') this.intakeQuery = value;
    else this.yearQuery = value;
  }

  showError(key: MultiKey): boolean {
    const control = this.form.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.store.values['countries'] = value.countries.join(', ');
    this.store.values['studyLevel'] = value.fieldsOfStudy.join(', ');
    this.store.values['fieldOfInterest'] = value.programs.join(', ');
    this.store.values['startYear'] = value.startYear.join(', ');
    this.store.values['intake'] = value.intakes.join(', ');
    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/academic-information');
  }
}
