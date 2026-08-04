import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { COUNTRIES } from './geo-data';
import { ALSO_INTERESTED_OPTIONS, FIELDS_OF_STUDY, INTAKE_OPTIONS, PROGRAM_OPTIONS, START_YEARS } from './study-options';

type MultiKey = 'countries' | 'fieldsOfStudy' | 'programs' | 'intakes';
type Which = 'country' | 'field' | 'program' | 'intake';

function requireOne(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length ? null : { required: true };
}

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './study-preferences.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 2 OF 8</span>
        <h1>Study Preferences</h1>
        <p>Tell us where and what you'd like to study so we can match you with the right universities, banks and consultants.</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">SP</div>
          <div>
            <h2>Study Preferences details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <div class="field-grid">
          <label class="combo-field wide" [class.field-invalid]="showError('countries')">
            <span class="field-label">Which country do you want to study in? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #countryBox type="text" placeholder="Search countries"
                [value]="countryOpen ? (countryQuery || selectedOf('countries').join(', ')) : selectedOf('countries').join(', ')"
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
          </label>

          <label class="combo-field wide" [class.field-invalid]="showError('fieldsOfStudy')">
            <span class="field-label">What do you want to study? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #fieldBox type="text" placeholder="Search fields of study"
                [value]="fieldOpen ? (fieldQuery || selectedOf('fieldsOfStudy').join(', ')) : selectedOf('fieldsOfStudy').join(', ')"
                (focus)="onFieldFocus('field')" (input)="onFieldInput('field', $any($event.target).value)" (blur)="delayedClose('field')">
              <button type="button" class="combo-arrow" [class.open]="fieldOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('field', fieldBox)" aria-label="Toggle field of study list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="fieldOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(fieldOptions, fieldQuery)" (click)="toggleMulti('fieldsOfStudy', opt)">
                <span class="option-check" [class.checked]="isSelected('fieldsOfStudy', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(fieldOptions, fieldQuery).length">No matching field of study</li>
            </ul>
            <small class="field-error" *ngIf="showError('fieldsOfStudy')">Select at least one field of study</small>
          </label>

          <label class="combo-field" [class.field-invalid]="showError('programs')">
            <span class="field-label">Program of Interest <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #programBox type="text" placeholder="Search programs"
                [value]="programOpen ? (programQuery || selectedOf('programs').join(', ')) : selectedOf('programs').join(', ')"
                (focus)="onFieldFocus('program')" (input)="onFieldInput('program', $any($event.target).value)" (blur)="delayedClose('program')">
              <button type="button" class="combo-arrow" [class.open]="programOpen" (mousedown)="$event.preventDefault()" (click)="toggleOpen('program', programBox)" aria-label="Toggle program list">▾</button>
            </div>
            <ul class="combo-list" *ngIf="programOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filterOptions(programOptions, programQuery)" (click)="selectOption('programs', opt)">
                <span class="option-check" [class.checked]="isSelected('programs', opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filterOptions(programOptions, programQuery).length">No matching program</li>
            </ul>
            <small class="field-error" *ngIf="showError('programs')">Select a program</small>
          </label>

          <label [class.field-invalid]="showError('startYear')">
            <span class="field-label">When do you plan to start studying? <span class="required-mark">*</span></span>
            <select formControlName="startYear">
              <option value="" disabled>Select a year</option>
              <option *ngFor="let year of startYearOptions" [value]="year">{{year}}</option>
            </select>
            <small class="field-error" *ngIf="showError('startYear')">Select your intended start year</small>
          </label>

          <div class="checkbox-field" *ngIf="isMastersSelected()">
            <span class="field-label">Also Interested In (Optional)</span>
            <div class="checkbox-row">
              <span class="checkbox-item" *ngFor="let opt of alsoInterestedOptions">
                <input type="checkbox" [checked]="isAlsoInterestedSelected(opt)" (change)="toggleAlsoInterested(opt)">
                {{opt}}
              </span>
            </div>
          </div>

          <label class="combo-field wide" [class.field-invalid]="showError('intakes')">
            <span class="field-label">Preferred Intake <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #intakeBox type="text" placeholder="Search intake"
                [value]="intakeOpen ? (intakeQuery || selectedOf('intakes').join(', ')) : selectedOf('intakes').join(', ')"
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
          </label>
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
  countryOptions = COUNTRIES.map(c => c.name);
  fieldOptions = FIELDS_OF_STUDY;
  programOptions = PROGRAM_OPTIONS;
  intakeOptions = INTAKE_OPTIONS;
  startYearOptions = START_YEARS;
  alsoInterestedOptions = ALSO_INTERESTED_OPTIONS;

  countryQuery = '';
  fieldQuery = '';
  programQuery = '';
  intakeQuery = '';
  countryOpen = false;
  fieldOpen = false;
  programOpen = false;
  intakeOpen = false;
  submitted = false;

  form = this.fb.nonNullable.group({
    countries: this.fb.nonNullable.control<string[]>([], requireOne),
    fieldsOfStudy: this.fb.nonNullable.control<string[]>([], requireOne),
    programs: this.fb.nonNullable.control<string[]>([], requireOne),
    startYear: this.fb.nonNullable.control<string>('', Validators.required),
    alsoInterestedIn: this.fb.nonNullable.control<string[]>([]),
    intakes: this.fb.nonNullable.control<string[]>([], requireOne)
  });

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router) {
    this.form.patchValue({
      countries: this.splitList(this.store.values['countries']),
      fieldsOfStudy: this.splitList(this.store.values['fieldOfInterest']),
      programs: this.splitList(this.store.values['studyLevel']),
      startYear: this.store.values['startYear'] || '',
      alsoInterestedIn: this.splitList(this.store.values['alsoInterestedIn']),
      intakes: this.splitList(this.store.values['intake'])
    });
  }

  private splitList(value?: string): string[] {
    return (value || '').split(',').map(item => item.trim()).filter(Boolean);
  }

  selectedOf(key: MultiKey): string[] { return this.form.get(key)!.value as string[]; }
  isSelected(key: MultiKey, value: string): boolean { return this.selectedOf(key).includes(value); }

  /** Country / Field of Study — multiple selections allowed; dropdown stays open. */
  toggleMulti(key: MultiKey, value: string) {
    const control = this.form.get(key)!;
    const current: string[] = control.value || [];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    control.setValue(next);
    control.markAsTouched();
    this.resetQuery(key);
  }

  /** Program of Interest — only one answer allowed; dropdown closes right after picking. */
  selectOption(key: MultiKey, value: string) {
    const control = this.form.get(key)!;
    const current: string[] = control.value || [];
    const next = current[0] === value ? [] : [value];
    control.setValue(next);
    control.markAsTouched();
    this.resetQuery(key);

    if (key === 'programs') {
      this.delayedClose('program');
      if (!this.isMastersSelected()) {
        const alsoControl = this.form.get('alsoInterestedIn')!;
        if ((alsoControl.value || []).length) alsoControl.setValue([]);
      }
    }
  }

  /** "Also Interested In" only appears when Program of Interest is Masters. */
  isMastersSelected(): boolean {
    return this.selectedOf('programs')[0] === 'Masters';
  }

  isAlsoInterestedSelected(value: string): boolean {
    return (this.form.get('alsoInterestedIn')!.value as string[]).includes(value);
  }

  toggleAlsoInterested(value: string) {
    const control = this.form.get('alsoInterestedIn')!;
    const current: string[] = control.value || [];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    control.setValue(next);
    control.markAsTouched();
  }

  /** Clears the search text so the box falls back to showing the (now updated) selection. */
  private resetQuery(key: MultiKey) {
    if (key === 'countries') this.countryQuery = '';
    else if (key === 'fieldsOfStudy') this.fieldQuery = '';
    else if (key === 'programs') this.programQuery = '';
    else this.intakeQuery = '';
  }

  filterOptions(options: string[], query: string): string[] {
    const q = query.trim().toLowerCase();
    return !q ? options : options.filter(option => option.toLowerCase().includes(q));
  }

  /** Closes the dropdown when focus genuinely leaves the field (option clicks don't blur it). */
  delayedClose(which: Which) {
    if (which === 'country') this.countryOpen = false;
    else if (which === 'field') this.fieldOpen = false;
    else if (which === 'program') this.programOpen = false;
    else this.intakeOpen = false;
  }

  onFieldFocus(which: Which) {
    if (which === 'country') { this.countryOpen = true; this.countryQuery = ''; }
    else if (which === 'field') { this.fieldOpen = true; this.fieldQuery = ''; }
    else if (which === 'program') { this.programOpen = true; this.programQuery = ''; }
    else { this.intakeOpen = true; this.intakeQuery = ''; }
  }

  isOpen(which: Which): boolean {
    if (which === 'country') return this.countryOpen;
    if (which === 'field') return this.fieldOpen;
    if (which === 'program') return this.programOpen;
    return this.intakeOpen;
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

  onFieldInput(which: 'country' | 'field' | 'program' | 'intake', value: string) {
    if (which === 'country') this.countryQuery = value;
    else if (which === 'field') this.fieldQuery = value;
    else if (which === 'program') this.programQuery = value;
    else this.intakeQuery = value;
  }

  showError(key: MultiKey | 'startYear'): boolean {
    const control = this.form.get(key)!;
    return (control.touched || this.submitted) && control.invalid;
  }

  saveAndContinue() {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    this.store.values['countries'] = value.countries.join(', ');
    this.store.values['fieldOfInterest'] = value.fieldsOfStudy.join(', ');
    this.store.values['studyLevel'] = value.programs.join(', ');
    this.store.values['startYear'] = value.startYear;
    this.store.values['alsoInterestedIn'] = value.alsoInterestedIn.join(', ');
    this.store.values['intake'] = value.intakes.join(', ');
    this.router.navigateByUrl('/student/academic-information');
  }
}
