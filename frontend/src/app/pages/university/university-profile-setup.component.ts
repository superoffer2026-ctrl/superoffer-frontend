import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityDataService } from './university-data.service';

@Component({
  selector: 'app-university-profile-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-layout">
      <div class="profile-card">
        <div class="profile-header">
          <span class="eyebrow">STEP 3 OF 5</span>
          <h2>University Profile Details</h2>
          <p>Provide your official institution details to build your university portal presence.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #profForm="ngForm" class="profile-form">
          <div class="form-grid">
            <div class="form-group full">
              <label for="profUniName">University Name *</label>
              <input
                id="profUniName"
                type="text"
                name="universityName"
                [(ngModel)]="dataService.profile.universityName"
                required
                placeholder="Official registered name"
              />
            </div>

            <div class="form-group">
              <label for="website">Official Website *</label>
              <input
                id="website"
                type="url"
                name="website"
                [(ngModel)]="dataService.profile.website"
                required
                placeholder="https://www.university.edu"
              />
            </div>

            <div class="form-group">
              <label for="universityType">University Type *</label>
              <select
                id="universityType"
                name="universityType"
                [(ngModel)]="dataService.profile.universityType"
                required
              >
                <option value="">Select University Type</option>
                <option value="Public Research">Public Research University</option>
                <option value="Private Research">Private Research University</option>
                <option value="Autonomous Institution">Autonomous Institution</option>
                <option value="Deemed University">Deemed University</option>
                <option value="State University">State University</option>
                <option value="Technical Institute">Technical Institute</option>
              </select>
            </div>

            <div class="form-group">
              <label for="country">Country *</label>
              <input
                id="country"
                type="text"
                name="country"
                [(ngModel)]="dataService.profile.country"
                required
                placeholder="Country location"
              />
            </div>

            <div class="form-group">
              <label for="city">City / Campus *</label>
              <input
                id="city"
                type="text"
                name="city"
                [(ngModel)]="dataService.profile.city"
                required
                placeholder="City or primary campus"
              />
            </div>

            <div class="form-group">
              <label for="establishedYear">Established Year *</label>
              <input
                id="establishedYear"
                type="number"
                name="establishedYear"
                [(ngModel)]="dataService.profile.establishedYear"
                required
                placeholder="e.g. 1891"
              />
            </div>

            <div class="form-group">
              <label for="contactPerson">Authorized Contact Person *</label>
              <input
                id="contactPerson"
                type="text"
                name="contactPerson"
                [(ngModel)]="dataService.profile.contactPerson"
                required
                placeholder="Full name & title"
              />
            </div>

            <div class="form-group full">
              <label for="contactNumber">Contact Phone Number *</label>
              <input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                [(ngModel)]="dataService.profile.contactNumber"
                required
                placeholder="+1 (650) 723-2300"
              />
            </div>

            <div class="form-group full">
              <label for="description">Institutional Overview / Description *</label>
              <textarea
                id="description"
                name="description"
                rows="4"
                [(ngModel)]="dataService.profile.description"
                required
                placeholder="Summarize academic specializations, research focus, rankings, and campus vision..."
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="button ghost" (click)="goBack()">
              ← Back
            </button>

            <button
              type="submit"
              class="button primary"
              [disabled]="profForm.invalid || saving"
            >
              {{ saving ? 'Saving Profile…' : 'Save & Continue to Documents →' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
      background: #f5f8f9;
    }
    .profile-layout {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 50px 20px;
    }
    .profile-card {
      width: min(780px, 100%);
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 20px;
      padding: 45px 50px;
      box-shadow: 0 18px 50px rgba(16, 33, 44, 0.08);
    }
    .profile-header {
      margin-bottom: 32px;
    }
    .profile-header h2 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 32px;
      letter-spacing: -0.03em;
      margin: 8px 0 6px;
    }
    .profile-header p {
      color: #637482;
      font-size: 15px;
      margin: 0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .form-group.full {
      grid-column: 1 / -1;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 800;
      color: #10212c;
    }
    .form-group input, .form-group select, .form-group textarea {
      border: 1px solid #cad6dd;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      outline: none;
      background: #fff;
      font-family: inherit;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: #2467e8;
      box-shadow: 0 0 0 3px rgba(36, 103, 232, 0.15);
    }
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #dfe6ea;
    }
    .button.ghost {
      padding: 12px 24px;
      border-color: #cfd9df;
      color: #10212c;
      cursor: pointer;
    }
    .button.primary {
      padding: 14px 28px;
      cursor: pointer;
    }

    @media (max-width: 650px) {
      .profile-card {
        padding: 30px 20px;
      }
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-group.full {
        grid-column: auto;
      }
    }
  `]
})
export class UniversityProfileSetupComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  saving = false;

  constructor(public dataService: UniversityDataService) {}

  onSubmit() {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.dataService.currentStep = 4;
      this.dataService.saveState();
      this.nextStep.emit();
    }, 600);
  }

  goBack() {
    this.dataService.currentStep = 2;
    this.prevStep.emit();
  }
}
