import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityDataService } from './university-data.service';

@Component({
  selector: 'app-university-email-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="verify-layout">
      <div class="verify-card">
        <div class="verify-header">
          <div class="email-icon-circle">
            ✉
          </div>
          <span class="eyebrow">STEP 2 OF 5</span>
          <h2>Verify Official Email</h2>
          <p>
            We have sent a 6-digit security verification code to<br />
            <strong>{{ dataService.registration.officialEmail || 'admissions@university.edu' }}</strong>
          </p>
        </div>

        <div class="otp-box-container">
          <input
            *ngFor="let digit of dataService.emailVerification.otp; let i = index"
            [id]="'otp-' + i"
            type="text"
            maxlength="1"
            class="otp-input"
            [(ngModel)]="dataService.emailVerification.otp[i]"
            (keyup)="onDigitInput($event, i)"
            (paste)="onPaste($event)"
            autocomplete="off"
          />
        </div>

        <p class="error-msg" *ngIf="error">{{ error }}</p>
        <p class="success-msg" *ngIf="message">{{ message }}</p>

        <button
          type="button"
          class="button primary wide-button"
          [disabled]="!isOtpComplete() || verifying"
          (click)="verifyOtp()"
        >
          {{ verifying ? 'Verifying OTP…' : 'Verify Email Address' }}
        </button>

        <div class="resend-container">
          <span *ngIf="cooldown > 0" class="cooldown-text">
            Resend OTP in <strong>{{ cooldown }}s</strong>
          </span>
          <button
            *ngIf="cooldown === 0"
            type="button"
            class="resend-btn"
            (click)="resendOtp()"
          >
            Resend OTP
          </button>
        </div>

        <div class="verify-footer">
          <button type="button" class="back-link" (click)="goBack()">
            ← Change official email address
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
    .verify-layout {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 40px 20px;
    }
    .verify-card {
      width: min(520px, 100%);
      background: #fff;
      border: 1px solid #dfe6ea;
      border-radius: 20px;
      padding: 45px 40px;
      box-shadow: 0 18px 50px rgba(16, 33, 44, 0.08);
      text-align: center;
    }
    .email-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eaf5ff;
      color: #2467e8;
      display: grid;
      place-items: center;
      font-size: 26px;
      margin: 0 auto 20px;
    }
    .verify-header h2 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 28px;
      letter-spacing: -0.03em;
      margin: 8px 0 10px;
    }
    .verify-header p {
      color: #637482;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 30px;
    }
    .verify-header strong {
      color: #10212c;
    }
    .otp-box-container {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .otp-input {
      width: 52px;
      height: 60px;
      border: 1px solid #cad6dd;
      border-radius: 12px;
      text-align: center;
      font-size: 24px;
      font-weight: 800;
      color: #0d2d42;
      outline: none;
      background: #fff;
      transition: all 0.2s;
    }
    .otp-input:focus {
      border-color: #2467e8;
      box-shadow: 0 0 0 3px rgba(36, 103, 232, 0.18);
    }
    .error-msg {
      color: #a1372c;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .success-msg {
      color: #147254;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .wide-button {
      width: 100%;
      height: 52px;
      font-size: 15px;
      cursor: pointer;
    }
    .resend-container {
      margin-top: 20px;
      font-size: 13px;
    }
    .cooldown-text {
      color: #637482;
    }
    .resend-btn {
      border: none;
      background: none;
      color: #2467e8;
      font-weight: 800;
      cursor: pointer;
      font-size: 14px;
    }
    .verify-footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #dfe6ea;
    }
    .back-link {
      border: none;
      background: none;
      color: #637482;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .back-link:hover {
      color: #10212c;
    }
  `]
})
export class UniversityEmailVerificationComponent implements OnInit, OnDestroy {
  @Output() nextStep = new EventEmitter<void>();
  @Output() prevStep = new EventEmitter<void>();

  verifying = false;
  cooldown = 30;
  timer: any;
  error = '';
  message = '';

  constructor(public dataService: UniversityDataService) {}

  ngOnInit() {
    // Fill dummy OTP if empty for smooth UX testing
    if (this.dataService.emailVerification.otp.every(x => x === '')) {
      this.dataService.emailVerification.otp = ['5', '8', '2', '9', '1', '4'];
    }
    this.startCooldown();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startCooldown() {
    this.cooldown = 30;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.cooldown > 0) {
        this.cooldown--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  onDigitInput(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && index > 0 && !input.value) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    } else if (input.value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const digits = pasteData.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, idx) => {
      this.dataService.emailVerification.otp[idx] = d;
    });
  }

  isOtpComplete(): boolean {
    return this.dataService.emailVerification.otp.every(d => d.length === 1);
  }

  verifyOtp() {
    this.error = '';
    this.verifying = true;
    setTimeout(() => {
      this.verifying = false;
      this.dataService.emailVerification.verified = true;
      this.message = 'Email verified successfully! Loading profile setup…';
      setTimeout(() => {
        this.dataService.currentStep = 3;
        this.dataService.saveState();
        this.nextStep.emit();
      }, 700);
    }, 800);
  }

  resendOtp() {
    this.error = '';
    this.message = 'A new 6-digit OTP has been sent to your official email.';
    this.dataService.emailVerification.otp = ['5', '8', '2', '9', '1', '4'];
    this.startCooldown();
  }

  goBack() {
    this.dataService.currentStep = 1;
    this.prevStep.emit();
  }
}
