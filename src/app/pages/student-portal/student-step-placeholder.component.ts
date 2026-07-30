import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileApiService } from '../../core/student-profile-api.service';
import { StudentUiField } from './student-portal.models';
import { StudentProfileUiStore } from './student-profile-ui.store';

@Component({
  selector: 'app-student-step-placeholder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrl: './student-step-placeholder.css',
  template: `
    <section class="step-page">
      <div class="step-heading">
        <span>STEP {{stepNumber}} OF 9</span>
        <h1>{{title}}</h1>
        <p>{{description}}</p>
      </div>

      <div class="profile-form-card">
        <div class="placeholder-copy">
          <div class="placeholder-icon" aria-hidden="true">{{icon}}</div>
          <div>
          <h2>{{title}} details</h2>
          <p>Your information is securely saved to your student profile.</p>
          </div>
        </div>
        <div class="photo-field" *ngIf="hasPhotoField">
          <div class="photo-preview">
            <img *ngIf="store.photo" [src]="store.photo" alt="Student profile">
            <span *ngIf="!store.photo">{{initials}}</span>
          </div>
          <div><strong>Student profile photo</strong><p>This photo will appear in your Offers workspace.</p>
            <label class="upload-button">Choose photo<input type="file" accept="image/png,image/jpeg,image/webp" (change)="chooseFile('photo',$event)"></label>
          </div>
        </div>
        <div class="field-grid">
          <label *ngFor="let field of visibleFields" [class.wide]="field.wide">
            <span>{{field.label}}</span>
            <textarea *ngIf="field.type==='textarea'" [name]="field.key" [(ngModel)]="store.values[field.key]" [placeholder]="field.placeholder || ''"></textarea>
            <ng-container *ngIf="field.type==='file'">
              <div class="file-field"><input type="file" [name]="field.key" (change)="chooseFile(field.key,$event)"><small>{{store.values[field.key] || 'No file selected'}}</small></div>
            </ng-container>
            <input *ngIf="field.type!=='textarea' && field.type!=='file'" [type]="field.type || 'text'" [name]="field.key" [(ngModel)]="store.values[field.key]" [placeholder]="field.placeholder || ''">
          </label>
        </div>
        <p class="save-message error" *ngIf="error">{{error}}</p>
        <p class="save-message success" *ngIf="saved">Profile details saved.</p>
      </div>

      <div class="step-actions">
        <a *ngIf="previousRoute" class="button secondary" [routerLink]="previousRoute">Previous</a>
        <span *ngIf="!previousRoute"></span>
        <button class="button primary" type="button" (click)="saveAndContinue()" [disabled]="saving">
          {{saving ? 'Saving…' : nextLabel}}
        </button>
      </div>
    </section>
  `
})
export class StudentStepPlaceholderComponent implements OnInit {
  @Input({ required: true }) stepNumber = 1;
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() icon = '•';
  @Input() fields: StudentUiField[] = [];
  @Input() previousRoute: string | null = null;
  @Input({ required: true }) nextRoute = '';
  @Input() nextLabel = 'Continue';
  saving = false;
  saved = false;
  error = '';

  constructor(
    public store: StudentProfileUiStore,
    private api: StudentProfileApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    try {
      const profile = await this.api.getProfile();
      this.applyProfile(profile);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not load your profile.';
    } finally {
      this.cdr.detectChanges();
    }
  }

  get hasPhotoField() { return this.fields.some(field => field.key === 'photo'); }
  get visibleFields() { return this.fields.filter(field => field.key !== 'photo'); }
  get initials() { return (this.store.values['fullName'] || 'Student').split(' ').map(value => value[0]).join('').slice(0,2).toUpperCase(); }
  chooseFile(key: string, event: Event) { this.store.setFile(key, (event.target as HTMLInputElement).files?.[0]); }

  async saveAndContinue() {
    this.saving = true;
    this.saved = false;
    this.error = '';
    try {
      await this.api.updateProfile(this.profilePayload());
      this.saved = true;
      await this.router.navigateByUrl(this.nextRoute);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not save your profile.';
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  private profilePayload(): Record<string, unknown> {
    const values = this.store.values;
    if (this.stepNumber === 1) {
      const names = (values['fullName'] || '').trim().split(/\s+/).filter(Boolean);
      return {
        basic: {
          fullName: values['fullName'] || '',
          firstName: names[0] || '',
          lastName: names.slice(1).join(' '),
          email: values['email'] || '',
          mobile: values['phone'] || '',
          country: values['location'] || ''
        }
      };
    }
    if (this.stepNumber === 2) return { academic: this.fieldValues() };
    if (this.stepNumber === 3) {
      const level = (values['studyLevel'] || '').toLowerCase();
      return {
        studyLevel: level.includes('phd') || level.includes('doctor') ? 'PHD' : level.includes('post') || level.includes('master') ? 'PG' : 'UG',
        preferences: {
          course: values['fieldOfInterest'] || '',
          countries: this.list(values['countries']),
          intake: this.list(values['intake'])
        }
      };
    }
    if (this.stepNumber === 4) {
      return {
        selectedTests: [values['englishExam'], values['entranceExam']].filter(Boolean),
        tests: this.fieldValues()
      };
    }
    if (this.stepNumber === 5) return { skills: this.fieldValues() };
    if (this.stepNumber === 6) return { achievements: this.fieldValues() };
    return { [`step${this.stepNumber}`]: this.fieldValues() };
  }

  private fieldValues() {
    return Object.fromEntries(this.visibleFields.map(field => [field.key, this.store.values[field.key] || '']));
  }

  private list(value = '') {
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  private applyProfile(profile: any) {
    const values = this.store.values;
    if (profile?.basic) {
      values['fullName'] = profile.basic.fullName || [profile.basic.firstName, profile.basic.lastName].filter(Boolean).join(' ') || values['fullName'];
      values['email'] = profile.basic.email || values['email'];
      values['phone'] = profile.basic.mobile || values['phone'];
      values['location'] = profile.basic.country || values['location'];
    }
    Object.assign(values, profile?.academic || {}, profile?.tests || {}, profile?.skills || {}, profile?.achievements || {});
    if (profile?.preferences) {
      values['fieldOfInterest'] = profile.preferences.course || values['fieldOfInterest'];
      values['countries'] = Array.isArray(profile.preferences.countries) ? profile.preferences.countries.join(', ') : values['countries'];
      values['intake'] = Array.isArray(profile.preferences.intake) ? profile.preferences.intake.join(', ') : values['intake'];
    }
    if (profile?.studyLevel) values['studyLevel'] = profile.studyLevel;
  }
}
