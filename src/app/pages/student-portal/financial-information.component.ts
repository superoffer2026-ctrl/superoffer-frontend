import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { AuthApiService } from '../../core/auth-api.service';

function requireOne(control: AbstractControl): ValidationErrors | null {
  return Array.isArray(control.value) && control.value.length ? null : { required: true };
}

const EARNER_INCOME_FIELDS: Record<string, 'fatherIncome' | 'motherIncome' | 'guardianIncome'> = {
  Father: 'fatherIncome',
  Mother: 'motherIncome',
  Guardian: 'guardianIncome'
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  styleUrl: './financial-information.css',
  template: `
    <section class="step-page">
      <form class="profile-form-card" [formGroup]="form" (ngSubmit)="saveAndContinue()">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Financial Information details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 7 OF 9</span>
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

        <h3 class="section-title">Education Loan</h3>
        <div class="declaration-group">
          <label class="declaration-item">
            <input type="radio" formControlName="needsLoan" value="yes" (blur)="markTouched('needsLoan')">
            <span>Yes, I'll need an education loan to fund part of my studies.</span>
          </label>
          <label class="declaration-item">
            <input type="radio" formControlName="needsLoan" value="no" (blur)="markTouched('needsLoan')">
            <span>No, I'm self-funded or already have funding arranged.</span>
          </label>
          <small class="field-hint" *ngIf="form.value.needsLoan==='yes'">You can check indicative eligibility and upload verification documents anytime from Loan eligibility in your dashboard.</small>
          <small class="field-error" *ngIf="showError('needsLoan')">Let us know if you'll need an education loan</small>
        </div>

        <h3 class="section-title">Declaration</h3>
        <div class="declaration-group">
          <label class="declaration-item">
            <input type="checkbox" formControlName="declarationAccurate">
            <span>I confirm that the financial information provided is accurate.</span>
          </label>
          <label class="declaration-item">
            <input type="checkbox" formControlName="declarationConsent">
            <span>I consent to the verification of my financial information.</span>
          </label>
          <small class="field-error" *ngIf="showError('declarationAccurate') || showError('declarationConsent')">Please accept both declarations to continue</small>
        </div>

        <p class="save-message error" *ngIf="submitted && form.invalid">Please fix the highlighted fields before continuing.</p>
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </form>

      <div class="step-actions">
        <a class="button secondary" routerLink="/student/work-experience">Previous</a>
        <button class="button primary" type="button" [disabled]="saving" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class FinancialInformationComponent implements OnInit {
  fundingOptions: string[] = [];
  employmentOptions: string[] = [];
  currencyOptions: string[] = [];
  earningOptions: string[] = [];
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
    needsLoan: this.fb.nonNullable.control('', Validators.required),
    declarationAccurate: this.fb.nonNullable.control(false, Validators.requiredTrue),
    declarationConsent: this.fb.nonNullable.control(false, Validators.requiredTrue)
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
    this.prefillFromStore();
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
      const options = await this.api.getFinancialInformationReferenceData();
      this.fundingOptions = options.fundingSourceOptions;
      this.employmentOptions = options.employmentCategoryOptions;
      this.currencyOptions = options.currencyOptions;
      this.earningOptions = options.earningMemberOptions;
    } catch {
      // Reference data endpoint unreachable — dropdowns stay empty; existing selections still load below.
    }
    if (this.fundingSource) {
      this.cdr.detectChanges();
      return;
    }
    try {
      const profile = await this.api.studentProfile(token);
      const financial = (profile?.financial as Record<string, unknown>) || {};
      if (financial['fundingSource']) {
        this.form.patchValue({
          fundingSource: (financial['fundingSource'] as string) || '',
          currency: (financial['currency'] as string) || '',
          employmentCategory: (financial['employmentCategory'] as string) || '',
          needsLoan: (financial['needsLoan'] as string) || '',
          fatherIncome: (financial['fatherIncome'] as string) || '',
          motherIncome: (financial['motherIncome'] as string) || '',
          guardianIncome: (financial['guardianIncome'] as string) || '',
          declarationAccurate: !!financial['declarationAccurate'],
          declarationConsent: !!financial['declarationConsent']
        });
        const earning = (financial['earningMembers'] as string[]) || [];
        if (earning.length) {
          this.form.get('earningMembers')!.setValue(earning);
          for (const person of earning) {
            const incomeControl = this.form.get(EARNER_INCOME_FIELDS[person]);
            incomeControl?.setValidators(Validators.required);
            incomeControl?.updateValueAndValidity({ emitEvent: false });
          }
        }
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      // No saved financial info yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
  }

  private prefillFromStore() {
    const v = this.store.values;
    this.form.patchValue({
      fundingSource: v['fundingSource'] || '',
      currency: v['currency'] || '',
      employmentCategory: v['employmentCategory'] || '',
      needsLoan: v['needsLoan'] || '',
      fatherIncome: v['fatherIncome'] || '',
      motherIncome: v['motherIncome'] || '',
      guardianIncome: v['guardianIncome'] || '',
      declarationAccurate: v['declarationAccurate'] === 'true',
      declarationConsent: v['declarationConsent'] === 'true'
    });
    const earning = (v['earningMembers'] || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!earning.length) return;
    this.form.get('earningMembers')!.setValue(earning);
    for (const person of earning) {
      const incomeControl = this.form.get(EARNER_INCOME_FIELDS[person]);
      incomeControl?.setValidators(Validators.required);
      incomeControl?.updateValueAndValidity({ emitEvent: false });
    }
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
    const annualHouseholdIncome = String(this.householdIncomeTotal());

    this.saving = true;
    try {
      await this.api.saveStudentFinancialInformation(token, {
        fundingSource: value.fundingSource,
        earningMembers: value.earningMembers,
        fatherIncome: value.fatherIncome || undefined,
        motherIncome: value.motherIncome || undefined,
        guardianIncome: value.guardianIncome || undefined,
        annualHouseholdIncome,
        currency: value.currency,
        employmentCategory: value.employmentCategory,
        needsLoan: value.needsLoan,
        declarationAccurate: value.declarationAccurate,
        declarationConsent: value.declarationConsent
      });

      this.store.values['fundingSource'] = value.fundingSource;
      this.store.values['earningMembers'] = value.earningMembers.join(', ');
      this.store.values['fatherIncome'] = value.fatherIncome;
      this.store.values['motherIncome'] = value.motherIncome;
      this.store.values['guardianIncome'] = value.guardianIncome;
      this.store.values['annualHouseholdIncome'] = annualHouseholdIncome;
      this.store.values['currency'] = value.currency;
      this.store.values['employmentCategory'] = value.employmentCategory;
      this.store.values['needsLoan'] = value.needsLoan;
      this.store.values['declarationAccurate'] = String(value.declarationAccurate);
      this.store.values['declarationConsent'] = String(value.declarationConsent);

      this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/projects');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        this.handleUnauthorized();
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your financial details. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
