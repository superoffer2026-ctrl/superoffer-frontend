import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { CountryInfo } from './geo-data';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './personal-information.css',
  template: `
    <section class="step-page">
      <div class="profile-form-card">
        <div class="card-head">
          <div class="placeholder-copy">
            <div>
              <h2>Personal Information details</h2>
              <p>Your information is securely saved to your student profile.</p>
            </div>
          </div>
          <span class="step-badge">STEP 1 OF 9</span>
        </div>

        <div class="field-grid">
          <label [class.field-invalid]="showError('fullName')">
            <span class="field-label">Full Name <span class="required-mark">*</span></span>
            <input type="text" name="fullName" autocomplete="name" placeholder="Aarav Mehta"
              [(ngModel)]="store.values['fullName']" (blur)="markTouched('fullName')">
            <small class="field-error" *ngIf="showError('fullName')">{{fullNameError}}</small>
          </label>

          <label [class.field-invalid]="showError('email')">
            <span class="field-label">Email Address <span class="required-mark">*</span></span>
            <input type="email" name="email" autocomplete="email" placeholder="aarav@example.com"
              [(ngModel)]="store.values['email']" (blur)="markTouched('email')">
            <small class="field-error" *ngIf="showError('email')">{{emailError}}</small>
          </label>

          <div class="field-pair-row">
            <label [class.field-invalid]="showError('mobile')">
              <span class="field-label">Mobile Number <span class="required-mark">*</span></span>
              <div class="phone-group">
                <select class="dial-select" name="mobileCountry" [(ngModel)]="store.values['mobileCountry']" (blur)="markTouched('mobile')" (change)="markTouched('mobile')">
                  <option value="" disabled>+</option>
                  <option *ngFor="let c of countries" [value]="c.iso2" [title]="c.name">{{c.dial}}</option>
                </select>
                <input type="tel" name="mobileNumber" autocomplete="tel-national" placeholder="98765 43210"
                  [(ngModel)]="store.values['mobileNumber']" (blur)="markTouched('mobile')">
              </div>
              <small class="field-error" *ngIf="showError('mobile')">{{mobileError}}</small>
              <small class="field-hint" *ngIf="!showError('mobile')">&nbsp;</small>
            </label>

            <label [class.field-invalid]="showError('altMobile')">
              <span class="field-label">Additional Mobile Number</span>
              <div class="phone-group">
                <select class="dial-select" name="altMobileCountry" [(ngModel)]="store.values['altMobileCountry']" (blur)="markTouched('altMobile')" (change)="markTouched('altMobile')">
                  <option value="" disabled>+</option>
                  <option *ngFor="let c of countries" [value]="c.iso2" [title]="c.name">{{c.dial}}</option>
                </select>
                <input type="tel" name="altMobileNumber" autocomplete="tel-national" placeholder="Optional"
                  [(ngModel)]="store.values['altMobileNumber']" (blur)="markTouched('altMobile')">
              </div>
              <small class="field-error" *ngIf="showError('altMobile')">{{altMobileError}}</small>
              <small class="field-hint" *ngIf="!showError('altMobile')">&nbsp;</small>
            </label>
          </div>

          <div class="field-pair-row">
            <label class="combo-field" [class.field-invalid]="showError('country')">
              <span class="field-label">Country <span class="required-mark">*</span></span>
              <input type="text" name="country" autocomplete="country-name" placeholder="Search for your country"
                [(ngModel)]="store.values['country']"
                (focus)="countryOpen=true" (input)="onCountryInput()" (blur)="onCountryBlur()">
              <ul class="combo-list" *ngIf="countryOpen">
                <li *ngFor="let c of filteredCountries" (mousedown)="selectCountry(c)">{{c.name}}</li>
                <li class="combo-empty" *ngIf="!filteredCountries.length">No matching country</li>
              </ul>
              <small class="field-error" *ngIf="showError('country')">{{countryError}}</small>
            </label>

            <label [class.field-invalid]="showError('city')">
              <span class="field-label">Current City <span class="required-mark">*</span></span>
              <select *ngIf="hasCityOptions" name="city" [(ngModel)]="store.values['city']" (blur)="markTouched('city')" (change)="markTouched('city')">
                <option value="" disabled>Select city</option>
                <option *ngFor="let city of cityOptions" [value]="city">{{city}}</option>
              </select>
              <input *ngIf="!hasCityOptions" type="text" name="city" placeholder="Enter your current city"
                [(ngModel)]="store.values['city']" [disabled]="!countryValid" (blur)="markTouched('city')">
              <small class="field-hint" *ngIf="!countryValid">Select a valid country first</small>
              <small class="field-hint" *ngIf="countryValid && !hasCityOptions">City list not available for this country — type your city</small>
              <small class="field-error" *ngIf="showError('city')">{{cityError}}</small>
            </label>
          </div>
        </div>

        <p class="save-message error" *ngIf="submitted && !isValid">Please fix the highlighted fields before continuing.</p>
        <p class="save-message error" *ngIf="saveError">{{saveError}}</p>
      </div>

      <div class="step-actions">
        <span></span>
        <button class="button primary" type="button" [disabled]="saving" (click)="saveAndContinue()">{{saving ? 'Saving…' : 'Continue'}}</button>
      </div>
    </section>
  `
})
export class PersonalInformationComponent implements OnInit {
  countries: CountryInfo[] = [];
  countryCityOptions: Record<string, string[]> = {};
  countryOpen = false;
  touched: Record<string, boolean> = {};
  submitted = false;
  saving = false;
  saveError = '';

  private returnToReview = false;

  constructor(
    public store: StudentProfileUiStore,
    private router: Router,
    private route: ActivatedRoute,
    private api: AuthApiService,
    private cdr: ChangeDetectorRef
  ) {
    if (!this.store.values['mobileCountry']) this.store.values['mobileCountry'] = 'IN';
    if (!this.store.values['altMobileCountry']) this.store.values['altMobileCountry'] = 'IN';
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  private getToken(): string | null {
    return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token');
  }

  async ngOnInit() {
    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }
    try {
      const geo = await this.api.getGeoReferenceData();
      this.countries = geo.countries;
      this.countryCityOptions = { India: geo.indiaCities };
    } catch {
      // Reference data endpoint unreachable — dropdowns stay empty; the student can still type a country/city.
    }
    try {
      const profile = await this.api.studentProfile(token);
      const personal = (profile?.personal as Record<string, string>) || {};
      for (const key of Object.keys(personal)) {
        if (!this.store.values[key]) this.store.values[key] = personal[key];
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        localStorage.removeItem('superoffer_access_token');
        sessionStorage.removeItem('superoffer_access_token');
        this.router.navigate(['/auth/login/student'], { queryParams: { sessionExpired: '1' } });
        return;
      }
      // No saved profile yet, or the server is unreachable — the student can still fill the form from scratch.
    }
    this.cdr.detectChanges();
  }

  markTouched(key: string) { this.touched[key] = true; }
  showError(key: string): boolean {
    return (this.touched[key] || this.submitted) && !!this.errorFor(key);
  }
  private errorFor(key: string): string {
    switch (key) {
      case 'fullName': return this.fullNameError;
      case 'email': return this.emailError;
      case 'mobile': return this.mobileError;
      case 'altMobile': return this.altMobileError;
      case 'country': return this.countryError;
      case 'city': return this.cityError;
      default: return '';
    }
  }

  get fullNameError(): string {
    return (this.store.values['fullName'] || '').trim().length >= 2 ? '' : 'Enter your full name';
  }

  get emailError(): string {
    const value = (this.store.values['email'] || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
  }

  get mobileError(): string {
    if (!this.store.values['mobileCountry']) return 'Select a country code';
    const digits = (this.store.values['mobileNumber'] || '').replace(/\D/g, '');
    return /^\d{6,14}$/.test(digits) ? '' : 'Enter a valid mobile number';
  }

  get altMobileError(): string {
    const raw = (this.store.values['altMobileNumber'] || '').trim();
    if (!raw) return '';
    if (!this.store.values['altMobileCountry']) return 'Select a country code';
    const digits = raw.replace(/\D/g, '');
    return /^\d{6,14}$/.test(digits) ? '' : 'Enter a valid mobile number';
  }

  get countryValid(): boolean {
    return this.countries.some(c => c.name === (this.store.values['country'] || ''));
  }
  get countryError(): string { return this.countryValid ? '' : 'Select a valid country from the list'; }

  get cityOptions(): string[] { return this.countryCityOptions[this.store.values['country'] || ''] || []; }
  get hasCityOptions(): boolean { return this.cityOptions.length > 0; }
  get cityError(): string { return (this.store.values['city'] || '').trim() ? '' : 'Select or enter your current city'; }

  get filteredCountries(): CountryInfo[] {
    const query = (this.store.values['country'] || '').trim().toLowerCase();
    return !query ? this.countries : this.countries.filter(c => c.name.toLowerCase().includes(query));
  }

  onCountryInput() { this.countryOpen = true; }
  onCountryBlur() { setTimeout(() => this.countryOpen = false, 150); }
  selectCountry(country: CountryInfo) {
    const changed = this.store.values['country'] !== country.name;
    this.store.values['country'] = country.name;
    this.countryOpen = false;
    if (changed) this.store.values['city'] = '';
  }

  get isValid(): boolean {
    return !this.fullNameError && !this.emailError && !this.mobileError && !this.altMobileError && !this.countryError && !this.cityError;
  }

  private dialFor(iso2: string): string { return this.countries.find(c => c.iso2 === iso2)?.dial || ''; }

  async saveAndContinue() {
    this.submitted = true;
    this.saveError = '';
    if (!this.isValid) return;

    const token = this.getToken();
    if (!token) {
      this.router.navigate(['/auth/login/student']);
      return;
    }

    const mobile = `${this.dialFor(this.store.values['mobileCountry'])} ${this.store.values['mobileNumber'] || ''}`.trim();
    this.store.values['phone'] = mobile;
    this.store.values['location'] = [this.store.values['city'], this.store.values['country']].filter(Boolean).join(', ');

    const payload = {
      fullName: this.store.values['fullName'],
      email: this.store.values['email'],
      mobileCountry: this.store.values['mobileCountry'],
      mobileNumber: this.store.values['mobileNumber'],
      altMobileCountry: this.store.values['altMobileCountry'] || undefined,
      altMobileNumber: this.store.values['altMobileNumber'] || undefined,
      country: this.store.values['country'],
      city: this.store.values['city'],
      phone: this.store.values['phone'],
      location: this.store.values['location']
    };

    this.saving = true;
    try {
      await this.api.saveStudentPersonalInformation(token, payload);
      this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/study-preferences');
    } catch (e) {
      if ((e as { status?: number }).status === 401) {
        localStorage.removeItem('superoffer_access_token');
        sessionStorage.removeItem('superoffer_access_token');
        this.router.navigate(['/auth/login/student'], { queryParams: { sessionExpired: '1' } });
        return;
      }
      this.saveError = e instanceof Error ? e.message : 'Could not save your details. Please try again.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
