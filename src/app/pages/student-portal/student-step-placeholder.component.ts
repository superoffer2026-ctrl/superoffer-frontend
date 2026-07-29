import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
          <p>Frontend preview only. You can continue without completing these fields.</p>
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
      </div>

      <div class="step-actions">
        <a *ngIf="previousRoute" class="button secondary" [routerLink]="previousRoute">Previous</a>
        <span *ngIf="!previousRoute"></span>
        <a class="button primary" [routerLink]="nextRoute">{{nextLabel}}</a>
      </div>
    </section>
  `
})
export class StudentStepPlaceholderComponent {
  @Input({ required: true }) stepNumber = 1;
  @Input({ required: true }) title = '';
  @Input({ required: true }) description = '';
  @Input() icon = '•';
  @Input() fields: StudentUiField[] = [];
  @Input() previousRoute: string | null = null;
  @Input({ required: true }) nextRoute = '';
  @Input() nextLabel = 'Continue';
  constructor(public store: StudentProfileUiStore) {}
  get hasPhotoField() { return this.fields.some(field => field.key === 'photo'); }
  get visibleFields() { return this.fields.filter(field => field.key !== 'photo'); }
  get initials() { return (this.store.values['fullName'] || 'Student').split(' ').map(value => value[0]).join('').slice(0,2).toUpperCase(); }
  chooseFile(key: string, event: Event) { this.store.setFile(key, (event.target as HTMLInputElement).files?.[0]); }
}
