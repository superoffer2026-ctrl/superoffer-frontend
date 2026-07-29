import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UniversityDataService } from './university-data.service';

@Component({
  selector: 'app-university-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="uni-auth-layout">
      <!-- Left Hero Panel -->
      <aside class="uni-auth-aside">
        <div class="brand-header">
          <a class="brand light-brand">
            <span>S</span>SuperOffer
          </a>
          <span class="portal-badge">University Portal</span>
        </div>

        <div class="aside-body">
          <span class="eyebrow light">INSTITUTION REGISTRATION</span>
          <h1>Join the verified university ecosystem.</h1>
          <p>
            Connect directly with high-intent global students, manage academic criteria, and send transparent admission offers.
          </p>

          <ul class="benefit-list">
            <li><span>✓</span> Direct access to AI-matched student profiles</li>
            <li><span>✓</span> Automated credential & transcript verification</li>
            <li><span>✓</span> Admissions funnel & scholarship management</li>
            <li><span>✓</span> Enterprise role-based team permissions</li>
          </ul>
        </div>

        <div class="aside-footer">
          <small>Verified Institution Access • SSL Encrypted • Role-Based Security</small>
        </div>
      </aside>

      <!-- Right Form Panel -->
      <section class="uni-auth-panel">
        <div class="form-wrapper">
          <div class="form-header">
            <span class="eyebrow">STEP 1 OF 5</span>
            <h2>Create University Account</h2>
            <p>Register your official university workspace to begin student recruitment.</p>
          </div>

          <!-- Google Social Login Button -->
          <button type="button" class="google-btn" (click)="continueWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div class="divider">
            <span>OR REGISTER WITH OFFICIAL EMAIL</span>
          </div>

          <form (ngSubmit)="onSubmit()" #regForm="ngForm" novalidate>
            <div class="form-group">
              <label for="universityName">University Name</label>
              <input
                id="universityName"
                type="text"
                name="universityName"
                [(ngModel)]="dataService.registration.universityName"
                required
                #nameModel="ngModel"
                placeholder="e.g. Stanford Global Institute"
              />
              <span class="field-error" *ngIf="nameModel.invalid && nameModel.touched">
                University name is required.
              </span>
            </div>

            <div class="form-group">
              <label for="officialEmail">Official Email</label>
              <input
                id="officialEmail"
                type="email"
                name="officialEmail"
                [(ngModel)]="dataService.registration.officialEmail"
                required
                email
                #emailModel="ngModel"
                placeholder="admissions@university.edu"
              />
              <small class="hint-text">Must use official university domain (@edu, @ac.uk, etc.)</small>
              <span class="field-error" *ngIf="emailModel.invalid && emailModel.touched">
                Please enter a valid official university email.
              </span>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label for="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  [(ngModel)]="dataService.registration.password"
                  required
                  minlength="8"
                  #passModel="ngModel"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  [(ngModel)]="dataService.registration.confirmPassword"
                  required
                  #confirmModel="ngModel"
                  placeholder="Re-enter password"
                />
              </div>
            </div>

            <span class="field-error" *ngIf="passwordMismatch">
              Passwords do not match. Please check and try again.
            </span>

            <div class="form-message success" *ngIf="successMessage">
              {{ successMessage }}
            </div>

            <button
              type="submit"
              class="button primary wide-button"
              [disabled]="regForm.invalid || loading"
            >
              {{ loading ? 'Creating Account…' : 'Create Account' }}
            </button>
          </form>

          <div class="form-footer">
            <p>Already have a verified university account? <a (click)="goToLogin()">Log in here</a></p>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .uni-auth-layout {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 42% 58%;
      background: #fff;
    }
    .uni-auth-aside {
      background: var(--navy, #0d2d42);
      padding: 55px clamp(35px, 5vw, 70px);
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .portal-badge {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(121, 219, 193, 0.15);
      color: #79dbc1;
      padding: 6px 12px;
      border-radius: 99px;
      border: 1px solid rgba(121, 219, 193, 0.3);
    }
    .aside-body h1 {
      font-family: "Libre Franklin", sans-serif;
      font-size: clamp(38px, 4.2vw, 56px);
      line-height: 1.06;
      letter-spacing: -0.04em;
      margin: 16px 0 20px;
    }
    .aside-body p {
      color: #bbced8;
      line-height: 1.7;
      font-size: 16px;
      margin-bottom: 28px;
    }
    .benefit-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .benefit-list li {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #e0ecef;
      font-size: 14px;
      font-weight: 600;
    }
    .benefit-list li span {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(121, 219, 193, 0.2);
      color: #79dbc1;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 900;
    }
    .aside-footer small {
      color: #8ba6b2;
      border-top: 1px solid #315064;
      padding-top: 25px;
      display: block;
      font-size: 12px;
    }
    .uni-auth-panel {
      display: grid;
      place-items: center;
      padding: 50px clamp(24px, 5vw, 70px);
    }
    .form-wrapper {
      width: min(580px, 100%);
    }
    .form-header {
      margin-bottom: 30px;
    }
    .form-header h2 {
      font-family: "Libre Franklin", sans-serif;
      font-size: 34px;
      letter-spacing: -0.03em;
      margin: 8px 0 6px;
    }
    .form-header p {
      color: var(--muted, #637482);
      font-size: 15px;
      margin: 0;
    }
    .google-btn {
      width: 100%;
      height: 52px;
      border: 1px solid #d0dcd5;
      border-radius: 10px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-weight: 700;
      font-size: 14px;
      color: #10212c;
      cursor: pointer;
      transition: all 0.2s;
    }
    .google-btn:hover {
      background: #f7faf8;
      border-color: #b5c7bd;
    }
    .divider {
      position: relative;
      text-align: center;
      margin: 28px 0 24px;
    }
    .divider::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: #dfe6ea;
    }
    .divider span {
      position: relative;
      background: #fff;
      padding: 0 14px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #7b8b95;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 7px;
      margin-bottom: 20px;
    }
    .form-group label {
      font-size: 13px;
      font-weight: 800;
      color: #10212c;
    }
    .form-group input {
      height: 52px;
      border: 1px solid #cad6dd;
      border-radius: 10px;
      padding: 0 16px;
      font-size: 14px;
      outline: none;
    }
    .form-group input:focus {
      border-color: var(--blue, #2467e8);
      box-shadow: 0 0 0 3px rgba(36, 103, 232, 0.15);
    }
    .hint-text {
      font-size: 11px;
      color: #637482;
      margin-top: 2px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .field-error {
      color: #a1372c;
      font-size: 12px;
      font-weight: 700;
      margin-bottom: 14px;
      display: block;
    }
    .form-message {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 18px;
      font-size: 13px;
    }
    .form-message.success {
      background: #e9f8f1;
      color: #147254;
    }
    .wide-button {
      width: 100%;
      height: 54px;
      margin-top: 10px;
      font-size: 15px;
      cursor: pointer;
    }
    .form-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 14px;
      color: #637482;
    }
    .form-footer a {
      color: var(--blue, #2467e8);
      font-weight: 800;
      cursor: pointer;
    }

    @media (max-width: 950px) {
      .uni-auth-layout {
        grid-template-columns: 1fr;
      }
      .uni-auth-aside {
        display: none;
      }
      .uni-auth-panel {
        padding: 40px 20px;
      }
    }
  `]
})
export class UniversityRegistrationComponent {
  @Output() nextStep = new EventEmitter<void>();
  loading = false;
  passwordMismatch = false;
  successMessage = '';

  constructor(public dataService: UniversityDataService) {}

  continueWithGoogle() {
    this.dataService.registration.universityName = 'Stanford Global Institute';
    this.dataService.registration.officialEmail = 'admissions@stanford.edu';
    this.successMessage = 'Google Sign-In authenticated. Proceeding to Email Verification…';
    setTimeout(() => {
      this.dataService.currentStep = 2;
      this.dataService.saveState();
      this.nextStep.emit();
    }, 900);
  }

  onSubmit() {
    this.passwordMismatch = false;
    const { password, confirmPassword } = this.dataService.registration;
    
    if (password && confirmPassword && password !== confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.dataService.currentStep = 2;
      this.dataService.saveState();
      this.nextStep.emit();
    }, 600);
  }

  goToLogin() {
    this.dataService.currentStep = 2;
    this.nextStep.emit();
  }
}
