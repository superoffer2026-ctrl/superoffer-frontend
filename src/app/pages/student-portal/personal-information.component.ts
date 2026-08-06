import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { COUNTRIES, COUNTRY_CITY_OPTIONS, CountryInfo } from './geo-data';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './personal-information.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP 1 OF 7</span>
        <h1>Personal Information</h1>
        <p>Tell us who you are and how institutions and lenders can reach you. This information is used across your SuperOffer profile.</p>
      </div>

      <div class="profile-form-card">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">ID</div>
          <div>
            <h2>Personal Information details</h2>
            <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>

        <div class="photo-field">
          <div class="photo-preview">
            <img *ngIf="store.photo" [src]="store.photo" alt="Student profile">
            <span *ngIf="!store.photo">{{initials}}</span>
          </div>
          <div>
            <strong>Profile photo</strong>
            <p>Optional. This photo will appear across your student profile and Offers workspace.</p>
            <div class="photo-actions">
              <label class="upload-button">{{store.photo ? 'Change photo' : 'Upload photo'}}<input type="file" accept="image/png,image/jpeg,image/webp" (change)="choosePhoto($event)"></label>
              <button type="button" class="remove-photo-btn" *ngIf="store.photo" (click)="removePhoto()">Remove photo</button>
            </div>
          </div>
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

          <label [class.field-invalid]="showError('mobile')">
            <span class="field-label">Mobile Number <span class="required-mark">*</span>
              <button type="button" class="add-alt-btn" *ngIf="!showAltMobile" (click)="showAltMobile=true" title="Add another mobile number" aria-label="Add additional mobile number">+</button>
            </span>
            <div class="phone-group">
              <select class="dial-select" name="mobileCountry" [(ngModel)]="store.values['mobileCountry']" (blur)="markTouched('mobile')" (change)="markTouched('mobile')">
                <option value="" disabled>+</option>
                <option *ngFor="let c of countries" [value]="c.iso2" [title]="c.name">{{c.dial}}</option>
              </select>
              <input type="tel" name="mobileNumber" autocomplete="tel-national" placeholder="98765 43210"
                [(ngModel)]="store.values['mobileNumber']" (blur)="markTouched('mobile')">
            </div>
            <small class="field-error" *ngIf="showError('mobile')">{{mobileError}}</small>
          </label>

          <label [class.field-invalid]="showError('altMobile')" *ngIf="showAltMobile">
            <span class="field-label">Additional Mobile Number
              <button type="button" class="remove-alt-btn" (click)="removeAltMobile()" title="Remove additional mobile number" aria-label="Remove additional mobile number">×</button>
            </span>
            <div class="phone-group">
              <select class="dial-select" name="altMobileCountry" [(ngModel)]="store.values['altMobileCountry']" (blur)="markTouched('altMobile')" (change)="markTouched('altMobile')">
                <option value="" disabled>+</option>
                <option *ngFor="let c of countries" [value]="c.iso2" [title]="c.name">{{c.dial}}</option>
              </select>
              <input type="tel" name="altMobileNumber" autocomplete="tel-national" placeholder="Optional"
                [(ngModel)]="store.values['altMobileNumber']" (blur)="markTouched('altMobile')">
            </div>
            <small class="field-error" *ngIf="showError('altMobile')">{{altMobileError}}</small>
          </label>

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

        <p class="save-message error" *ngIf="submitted && !isValid">Please fix the highlighted fields before continuing.</p>
      </div>

      <div class="step-actions">
        <span></span>
        <button class="button primary" type="button" [disabled]="!isValid" (click)="saveAndContinue()">Continue</button>
      </div>
    </section>
  `
})
export class PersonalInformationComponent {
  countries = COUNTRIES;
  countryOpen = false;
  touched: Record<string, boolean> = {};
  submitted = false;
  showAltMobile = false;

  private returnToReview = false;

  constructor(public store: StudentProfileUiStore, private router: Router, private route: ActivatedRoute) {
    this.showAltMobile = !!(this.store.values['altMobileNumber'] || this.store.values['altMobileCountry']);
    if (!this.store.values['mobileCountry']) this.store.values['mobileCountry'] = 'IN';
    this.returnToReview = this.route.snapshot.queryParamMap.get('from') === 'review';
  }

  get initials() {
    return (this.store.values['fullName'] || 'Student').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  choosePhoto(event: Event) { this.store.setFile('photo', (event.target as HTMLInputElement).files?.[0]); }
  removePhoto() { this.store.photo = ''; this.store.values['photo'] = ''; }

  removeAltMobile() {
    this.showAltMobile = false;
    this.store.values['altMobileCountry'] = '';
    this.store.values['altMobileNumber'] = '';
    this.touched['altMobile'] = false;
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
    return COUNTRIES.some(c => c.name === (this.store.values['country'] || ''));
  }
  get countryError(): string { return this.countryValid ? '' : 'Select a valid country from the list'; }

  get cityOptions(): string[] { return COUNTRY_CITY_OPTIONS[this.store.values['country'] || ''] || []; }
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

  saveAndContinue() {
    this.submitted = true;
    if (!this.isValid) return;
    const mobile = `${this.dialFor(this.store.values['mobileCountry'])} ${this.store.values['mobileNumber'] || ''}`.trim();
    this.store.values['phone'] = mobile;
    this.store.values['location'] = [this.store.values['city'], this.store.values['country']].filter(Boolean).join(', ');
    this.router.navigateByUrl(this.returnToReview ? '/student/review' : '/student/study-preferences');
  }
}
