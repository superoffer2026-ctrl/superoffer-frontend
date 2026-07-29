import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversityDataService } from './university-data.service';

@Component({
  selector: 'app-university-document-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-layout">
      <div class="upload-card">
        <div class="upload-header">
          <span class="eyebrow">STEP 4 OF 5</span>
          <h2>Upload Verification Documents</h2>
          <p>SuperAdmin verification requires institutional proof documents before unlocking marketplace access.</p>
        </div>

        <!-- Overall Progress Bar -->
        <div class="overall-progress-box">
          <div class="progress-info">
            <strong>Document Upload Completion</strong>
            <span>{{ dataService.overallUploadProgress }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-bar" [style.width.%]="dataService.overallUploadProgress"></div>
          </div>
          <small class="progress-hint">All 3 verification documents are ready for SuperAdmin review.</small>
        </div>

        <div class="doc-upload-grid">
          <!-- Document 1: Accreditation Certificate -->
          <div class="doc-card" [class.uploaded]="dataService.documents.accreditation.uploaded">
            <div class="doc-icon">📜</div>
            <div class="doc-details">
              <h3>Accreditation Certificate *</h3>
              <p>Government or international education board accreditation certificate.</p>
              
              <div class="file-status" *ngIf="dataService.documents.accreditation.uploaded">
                <span class="file-name">📄 {{ dataService.documents.accreditation.file }}</span>
                <span class="file-size">({{ dataService.documents.accreditation.size }})</span>
                <span class="status-badge success">✓ Attached</span>
              </div>
            </div>

            <div class="doc-action">
              <label class="button ghost upload-label">
                <input type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected('accreditation', $event)" hidden />
                {{ dataService.documents.accreditation.uploaded ? 'Replace File' : 'Upload PDF' }}
              </label>
            </div>
          </div>

          <!-- Document 2: Authorization Letter -->
          <div class="doc-card" [class.uploaded]="dataService.documents.authorization.uploaded">
            <div class="doc-icon">🏛️</div>
            <div class="doc-details">
              <h3>Authorization Letter *</h3>
              <p>Official letter authorizing this account to represent the university on SuperOffer.</p>

              <div class="file-status" *ngIf="dataService.documents.authorization.uploaded">
                <span class="file-name">📄 {{ dataService.documents.authorization.file }}</span>
                <span class="file-size">({{ dataService.documents.authorization.size }})</span>
                <span class="status-badge success">✓ Attached</span>
              </div>
            </div>

            <div class="doc-action">
              <label class="button ghost upload-label">
                <input type="file" accept=".pdf,.doc,.docx" (change)="onFileSelected('authorization', $event)" hidden />
                {{ dataService.documents.authorization.uploaded ? 'Replace File' : 'Upload PDF' }}
              </label>
            </div>
          </div>

          <!-- Document 3: University Logo -->
          <div class="doc-card" [class.uploaded]="dataService.documents.logo.uploaded">
            <div class="doc-icon">🖼️</div>
            <div class="doc-details">
              <h3>University Logo *</h3>
              <p>High-resolution official crest or brand logo (PNG, SVG, or JPG).</p>

              <div class="file-status" *ngIf="dataService.documents.logo.uploaded">
                <span class="file-name">🖼️ {{ dataService.documents.logo.file }}</span>
                <span class="file-size">({{ dataService.documents.logo.size }})</span>
                <span class="status-badge success">✓ Attached</span>
              </div>
            </div>

            <div class="doc-action">
              <label class="button ghost upload-label">
                <input type="file" accept=".png,.jpg,.jpeg,.svg" (change)="onFileSelected('logo', $event)" hidden />
                {{ dataService.documents.logo.uploaded ? 'Replace Logo' : 'Upload Image' }}
              </label>
            </div>
          </div>
        </div>

        <div class="upload-actions">
          <button type="button" class="button ghost" (click)="goBack()">
            ← Back to Profile
          </button>

          <button
            type="button"
            class="button primary"
            [disabled]="dataService.overallUploadProgress < 100 || submitting"
            (click)="submitForApproval()"
          >
            {{ submitting ? 'Submitting Verification…' : 'Submit for Admin Approval →' }}
          </button>
        </div>
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
    .upload-layout {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 50px 20px;
    }
    .upload-card {
      width: min(800px, 100%);
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 20px;
      padding: 45px 50px;
      box-shadow: 0 18px 50px rgba(16, 33, 44, 0.08);
    }
    .upload-header {
      margin-bottom: 28px;
    }
    .upload-header h2 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 32px;
      letter-spacing: -0.03em;
      margin: 8px 0 6px;
    }
    .upload-header p {
      color: #637482;
      font-size: 15px;
      margin: 0;
    }
    .overall-progress-box {
      background: #f7fafb;
      border: 1px solid #dfe6ea;
      border-radius: 14px;
      padding: 20px 24px;
      margin-bottom: 30px;
    }
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .progress-info strong {
      font-size: 14px;
      color: #10212c;
    }
    .progress-info span {
      font-size: 16px;
      font-weight: 800;
      color: #2467e8;
    }
    .progress-track {
      height: 10px;
      background: #e4ecef;
      border-radius: 99px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #2467e8 0%, #14916d 100%);
      border-radius: 99px;
      transition: width 0.4s ease;
    }
    .progress-hint {
      display: block;
      margin-top: 10px;
      color: #637482;
      font-size: 12px;
    }
    .doc-upload-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .doc-card {
      display: grid;
      grid-template-columns: 50px 1fr auto;
      gap: 18px;
      align-items: center;
      padding: 20px 24px;
      border: 1px solid #dfe6ea;
      border-radius: 14px;
      background: #fff;
      transition: all 0.2s;
    }
    .doc-card.uploaded {
      border-color: #7ad8be;
      background: #f6fcfa;
    }
    .doc-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #eaf5ff;
      display: grid;
      place-items: center;
      font-size: 22px;
    }
    .doc-card.uploaded .doc-icon {
      background: #e4f7f0;
    }
    .doc-details h3 {
      font-size: 16px;
      margin: 0 0 4px;
      color: #10212c;
    }
    .doc-details p {
      font-size: 13px;
      color: #637482;
      margin: 0;
    }
    .file-status {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      font-size: 13px;
    }
    .file-name {
      font-weight: 700;
      color: #0d2d42;
    }
    .file-size {
      color: #637482;
      font-size: 12px;
    }
    .status-badge.success {
      background: #e5f7f0;
      color: #147254;
      font-weight: 800;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 99px;
    }
    .upload-label {
      cursor: pointer;
      padding: 10px 18px;
      font-size: 13px;
    }
    .upload-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #dfe6ea;
    }

    @media (max-width: 680px) {
      .upload-card {
        padding: 30px 20px;
      }
      .doc-card {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .doc-action {
        justify-self: start;
      }
    }
  `]
})
export class UniversityDocumentUploadComponent {
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  submitting = false;

  constructor(public dataService: UniversityDataService) {}

  onFileSelected(docKey: 'accreditation' | 'authorization' | 'logo', event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (docKey === 'logo') {
        this.dataService.documents.logo = {
          file: file.name,
          progress: 100,
          uploaded: true,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          preview: URL.createObjectURL(file)
        };
      } else {
        this.dataService.documents[docKey] = {
          file: file.name,
          progress: 100,
          uploaded: true,
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        };
      }
      this.dataService.saveState();

    }
  }

  submitForApproval() {
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.dataService.currentStep = 5;
      this.dataService.saveState();
      this.nextStep.emit();
    }, 700);
  }

  goBack() {
    this.dataService.currentStep = 3;
    this.prevStep.emit();
  }
}
