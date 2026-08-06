import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { CURRENCY_OPTIONS, EARNING_MEMBER_OPTIONS, EMPLOYMENT_CATEGORY_OPTIONS, FUNDING_SOURCE_OPTIONS } from './financial-options';

function requireOne(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length ? null : { required: true };
}

const EARNER_INCOME_FIELDS: Record<string, 'fatherIncome' | 'motherIncome' | 'guardianIncome'> = {
  Father: 'fatherIncome',
  Mother: 'motherIncome',
  Guardian: 'guardianIncome'
};

type DocKey =
  | 'incomeCertificate' | 'salarySlips' | 'payslips' | 'itr' | 'form16'
  | 'bankStatements' | 'businessIncomeProof' | 'agriculturalIncomeCertificate' | 'scholarshipLetter';

/** `categories` restricts a document to those employment categories; omit it to show the document for everyone. */
const DOCUMENT_FIELDS: { key: DocKey; label: string; categories?: string[] }[] = [
  { key: 'incomeCertificate', label: 'Income Certificate' },
  { key: 'salarySlips', label: 'Salary Slips (Last 24 Months)', categories: ['Salaried'] },
  { key: 'payslips', label: 'Payslips (Last 24 Months)', categories: ['Salaried'] },
  { key: 'form16', label: 'Form 16 (Last 2 Financial Years)', categories: ['Salaried'] },
  { key: 'businessIncomeProof', label: 'Business Income Proof (for Self-Employed/Business Owners)', categories: ['Self-Employed', 'Business'] },
  { key: 'agriculturalIncomeCertificate', label: 'Agricultural Income Certificate', categories: ['Agriculture'] },
  { key: 'itr', label: 'Income Tax Return (Last 2 Financial Years)', categories: ['Self-Employed', 'Business', 'Agriculture', 'Other'] },
  { key: 'bankStatements', label: 'Bank Statements (Last 6 Months)' },
  { key: 'scholarshipLetter', label: 'Scholarship or Funding Letter (if applicable)' }
];

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './financial-information.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 5 OF 7</span>
        <h1>Financial Information</h1>
        <p>Share an indicative affordability profile so verified universities and finance partners can match you accurately.</p>
      </div>

      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">FI</div>
          <div>
            <h2>Financial Information details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <h3 class="section-title">Education Funding</h3>
        <div class="field-grid">
          <label class="combo-field wide" [class.field-invalid]="showError('fundingSource')">
            <span class="field-label">How do you plan to fund your education? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #fundingBox type="text" placeholder="Search funding sources"
                [value]="fundingOpen ? (fundingQuery || fundingSource) : fundingSource"
                (focus)="onFundingFocus()" (input)="fundingQuery=$any($event.target).value" (blur)="delayedCloseFunding()">
              <button type="button" class="combo-arrow" [class.open]="fundingOpen" (mousedown)="$event.preventDefault()" (click)="toggleFundingOpen(fundingBox)" aria-label="Toggle funding sources">▾</button>
            </div>
            <ul class="combo-list" *ngIf="fundingOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filteredFunding()" (click)="selectFunding(opt)">
                <span class="option-check" [class.checked]="fundingSource===opt">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filteredFunding().length">No matching option</li>
            </ul>
            <small class="field-error" *ngIf="showError('fundingSource')">Select how you plan to fund your education</small>
          </label>
        </div>

        <h3 class="section-title">Financial Background</h3>
        <div class="field-grid">
          <label class="combo-field wide" [class.field-invalid]="showError('earningMembers')">
            <span class="field-label">Who is currently earning in your family? <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #earningBox type="text" placeholder="Search"
                [value]="earningOpen ? (earningQuery || selectedEarning().join(', ')) : selectedEarning().join(', ')"
                (focus)="onEarningFocus()" (input)="earningQuery=$any($event.target).value" (blur)="delayedCloseEarning()">
              <button type="button" class="combo-arrow" [class.open]="earningOpen" (mousedown)="$event.preventDefault()" (click)="toggleEarningOpen(earningBox)" aria-label="Toggle earning members">▾</button>
            </div>
            <ul class="combo-list" *ngIf="earningOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filteredEarning()" (click)="toggleEarning(opt)">
                <span class="option-check" [class.checked]="isEarningSelected(opt)">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filteredEarning().length">No matching option</li>
            </ul>
            <small class="field-error" *ngIf="showError('earningMembers')">Select who is currently earning</small>
          </label>

          <label *ngIf="isEarningSelected('Father')" [class.field-invalid]="showError('fatherIncome')">
            <span class="field-label">Father's Annual Income <span class="required-mark">*</span></span>
            <input type="text" formControlName="fatherIncome" placeholder="e.g. 10,00,000" (blur)="markTouched('fatherIncome')">
            <small class="field-error" *ngIf="showError('fatherIncome')">Enter father's annual income</small>
          </label>

          <label *ngIf="isEarningSelected('Mother')" [class.field-invalid]="showError('motherIncome')">
            <span class="field-label">Mother's Annual Income <span class="required-mark">*</span></span>
            <input type="text" formControlName="motherIncome" placeholder="e.g. 8,00,000" (blur)="markTouched('motherIncome')">
            <small class="field-error" *ngIf="showError('motherIncome')">Enter mother's annual income</small>
          </label>

          <label *ngIf="isEarningSelected('Guardian')" [class.field-invalid]="showError('guardianIncome')">
            <span class="field-label">Guardian's Annual Income <span class="required-mark">*</span></span>
            <input type="text" formControlName="guardianIncome" placeholder="e.g. 8,00,000" (blur)="markTouched('guardianIncome')">
            <small class="field-error" *ngIf="showError('guardianIncome')">Enter guardian's annual income</small>
          </label>

          <label [class.field-invalid]="showError('currency')">
            <span class="field-label">Currency <span class="required-mark">*</span></span>
            <select formControlName="currency" (blur)="markTouched('currency')">
              <option value="" disabled>Select currency</option>
              <option *ngFor="let c of currencyOptions" [value]="c">{{c}}</option>
            </select>
            <small class="field-error" *ngIf="showError('currency')">Select a currency</small>
          </label>

          <div class="wide" *ngIf="selectedEarning().length > 1">
            <span class="field-label">Annual Household Income</span>
            <div class="computed-income">{{ householdIncomeTotal() | number }} <ng-container *ngIf="currency">{{currency}}</ng-container></div>
            <small class="field-hint">Auto-calculated as the sum of {{selectedEarning().join(' + ')}} income.</small>
          </div>

          <label class="combo-field wide" [class.field-invalid]="showError('employmentCategory')">
            <span class="field-label">Employment Category <span class="required-mark">*</span></span>
            <div class="combo-input-wrap">
              <input #employmentBox type="text" placeholder="Search employment category"
                [value]="employmentOpen ? (employmentQuery || employmentCategory) : employmentCategory"
                (focus)="onEmploymentFocus()" (input)="employmentQuery=$any($event.target).value" (blur)="delayedCloseEmployment()">
              <button type="button" class="combo-arrow" [class.open]="employmentOpen" (mousedown)="$event.preventDefault()" (click)="toggleEmploymentOpen(employmentBox)" aria-label="Toggle employment category">▾</button>
            </div>
            <ul class="combo-list" *ngIf="employmentOpen" (mousedown)="$event.preventDefault()">
              <li *ngFor="let opt of filteredEmployment()" (click)="selectEmployment(opt)">
                <span class="option-check" [class.checked]="employmentCategory===opt">✓</span>{{opt}}
              </li>
              <li class="combo-empty" *ngIf="!filteredEmployment().length">No matching option</li>
            </ul>
            <small class="field-error" *ngIf="showError('employmentCategory')">Select your employment category</small>
          </label>
        </div>

        <h3 class="section-title">Financial Documents</h3>
        <p class="section-subtitle" *ngIf="!employmentCategory">Select an employment category above to see the documents you need.</p>
        <ng-container *ngIf="employmentCategory">
        <p class="section-subtitle">Documents relevant to "{{employmentCategory}}" — upload where applicable.</p>
        <div class="doc-list">
          <div class="doc-row" *ngFor="let doc of visibleDocuments()">
            <span class="doc-row-label">{{doc.label}}</span>
            <div class="doc-row-control">
              <label class="doc-upload-btn" *ngIf="!hasFile(doc.key)">
                <span>⬆ Upload</span>
                <input type="file" accept="image/png,image/jpeg,application/pdf" (change)="onFileChange(doc.key,$event)">
              </label>
              <div class="doc-file-chip" *ngIf="hasFile(doc.key)">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ fileStatusLabel(doc.key) }}</span>
                <button type="button" class="file-remove" (click)="clearFile(doc.key)" aria-label="Remove file">×</button>
              </div>
            </div>
          </div>
        </div>
        </ng-container>

        <h3 class="section-title">Declaration</h3>
        <div class="declaration-group">
          <label class="declaration-item">
            <input type="checkbox" formControlName="declarationAccurate">
            <span>I confirm that the financial information and uploaded documents are accurate and authentic.</span>
          </label>
          <label class="declaration-item">
            <input type="checkbox" formControlName="declarationConsent">
            <span>I consent to the verification of my financial documents.</span>
          </label>
          <small class="field-error" *ngIf="showError('declarationAccurate') || showError('declarationConsent')">Please accept both declarations to continue</small>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/entrance-exams">Previous</a>
        <button class="button primary" type="button" [disabled]="form.invalid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class FinancialInformationComponent {
  fundingOptions = FUNDING_SOURCE_OPTIONS;
  employmentOptions = EMPLOYMENT_CATEGORY_OPTIONS;
  currencyOptions = CURRENCY_OPTIONS;
  earningOptions = EARNING_MEMBER_OPTIONS;
  fundingQuery = '';
  fundingOpen = false;
  employmentQuery = '';
  employmentOpen = false;
  earningQuery = '';
  earningOpen = false;
  submitted = false;

  form = this.fb.nonNullable.group({
    fundingSource: this.fb.nonNullable.control('', Validators.required),
    earningMembers: this.fb.nonNullable.control<string[]>([], requireOne),
    fatherIncome: this.fb.nonNullable.control(''),
    motherIncome: this.fb.nonNullable.control(''),
    guardianIncome: this.fb.nonNullable.control(''),
    currency: this.fb.nonNullable.control('', Validators.required),
    employmentCategory: this.fb.nonNullable.control('', Validators.required),
    incomeCertificate: this.fb.nonNullable.control(''),
    salarySlips: this.fb.nonNullable.control(''),
    payslips: this.fb.nonNullable.control(''),
    itr: this.fb.nonNullable.control(''),
    form16: this.fb.nonNullable.control(''),
    bankStatements: this.fb.nonNullable.control(''),
    businessIncomeProof: this.fb.nonNullable.control(''),
    agriculturalIncomeCertificate: this.fb.nonNullable.control(''),
    scholarshipLetter: this.fb.nonNullable.control(''),
    declarationAccurate: this.fb.nonNullable.control(false, Validators.requiredTrue),
    declarationConsent: this.fb.nonNullable.control(false, Validators.requiredTrue)
  });

  private returnToReview = false;

  constructor(private fb: FormBuilder, public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  get fundingSource(): string { return this.form.get('fundingSource')!.value; }
  get currency(): string { return this.form.get('currency')!.value; }
  filteredFunding(): string[] {
    const q = this.fundingQuery.trim().toLowerCase();
    return !q ? this.fundingOptions : this.fundingOptions.filter(opt => opt.toLowerCase().includes(q));
  }
  onFundingFocus() { this.fundingOpen = true; this.fundingQuery = ''; }
  delayedCloseFunding() { this.fundingOpen = false; }
  toggleFundingOpen(inputEl: HTMLInputElement) {
    if (this.fundingOpen) { this.delayedCloseFunding(); inputEl.blur(); }
    else { this.onFundingFocus(); inputEl.focus(); }
  }
  selectFunding(value: string) {
    const control = this.form.get('fundingSource')!;
    control.setValue(this.fundingSource === value ? '' : value);
    control.markAsTouched();
    this.fundingQuery = '';
    this.delayedCloseFunding();
  }

  get employmentCategory(): string { return this.form.get('employmentCategory')!.value; }
  filteredEmployment(): string[] {
    const q = this.employmentQuery.trim().toLowerCase();
    return !q ? this.employmentOptions : this.employmentOptions.filter(opt => opt.toLowerCase().includes(q));
  }
  onEmploymentFocus() { this.employmentOpen = true; this.employmentQuery = ''; }
  delayedCloseEmployment() { this.employmentOpen = false; }
  toggleEmploymentOpen(inputEl: HTMLInputElement) {
    if (this.employmentOpen) { this.delayedCloseEmployment(); inputEl.blur(); }
    else { this.onEmploymentFocus(); inputEl.focus(); }
  }
  selectEmployment(value: string) {
    const control = this.form.get('employmentCategory')!;
    control.setValue(this.employmentCategory === value ? '' : value);
    control.markAsTouched();
    this.employmentQuery = '';
    this.delayedCloseEmployment();
  }
  visibleDocuments() {
    const category = this.employmentCategory;
    return DOCUMENT_FIELDS.filter(doc => !doc.categories || !category || doc.categories.includes(category));
  }

  selectedEarning(): string[] { return this.form.get('earningMembers')!.value as string[]; }
  isEarningSelected(value: string): boolean { return this.selectedEarning().includes(value); }
  filteredEarning(): string[] {
    const q = this.earningQuery.trim().toLowerCase();
    return !q ? this.earningOptions : this.earningOptions.filter(opt => opt.toLowerCase().includes(q));
  }
  onEarningFocus() { this.earningOpen = true; this.earningQuery = ''; }
  delayedCloseEarning() { this.earningOpen = false; }
  toggleEarningOpen(inputEl: HTMLInputElement) {
    if (this.earningOpen) { this.delayedCloseEarning(); inputEl.blur(); }
    else { this.onEarningFocus(); inputEl.focus(); }
  }
  toggleEarning(value: string) {
    const control = this.form.get('earningMembers')!;
    const current: string[] = control.value || [];
    const next = current.includes(value) ? current.filter(item => item !== value) : [...current, value];
    control.setValue(next);
    control.markAsTouched();
    this.earningQuery = '';

    const incomeKey = EARNER_INCOME_FIELDS[value];
    const incomeControl = this.form.get(incomeKey)!;
    if (next.includes(value)) {
      incomeControl.setValidators(Validators.required);
    } else {
      incomeControl.setValidators(null);
      incomeControl.setValue('');
      incomeControl.markAsUntouched();
    }
    incomeControl.updateValueAndValidity({ emitEvent: false });
  }
  private parseAmount(value: string): number {
    return Number((value || '').replace(/[^0-9.]/g, '')) || 0;
  }
  householdIncomeTotal(): number {
    return this.selectedEarning().reduce((sum, earner) => sum + this.parseAmount(this.form.get(EARNER_INCOME_FIELDS[earner])!.value), 0);
  }

  onFileChange(key: DocKey, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.form.get(key)!.setValue(file.name);
    this.form.get(key)!.markAsTouched();
  }
  clearFile(key: DocKey) { this.form.get(key)!.setValue(''); }
  hasFile(key: DocKey): boolean { return !!this.form.get(key)!.value; }
  fileStatusLabel(key: DocKey): string { return this.form.get(key)!.value || 'No file selected'; }

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
    this.store.values['fundingSource'] = value.fundingSource;
    this.store.values['earningMembers'] = value.earningMembers.join(', ');
    this.store.values['fatherIncome'] = value.fatherIncome;
    this.store.values['motherIncome'] = value.motherIncome;
    this.store.values['guardianIncome'] = value.guardianIncome;
    this.store.values['annualHouseholdIncome'] = String(this.householdIncomeTotal());
    this.store.values['currency'] = value.currency;
    this.store.values['employmentCategory'] = value.employmentCategory;
    for (const doc of DOCUMENT_FIELDS) {
      this.store.values[doc.key] = value[doc.key];
    }
    this.store.values['declarationAccurate'] = String(value.declarationAccurate);
    this.store.values['declarationConsent'] = String(value.declarationConsent);

    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/projects');
  }
}
