import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-process',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-container">
      <div class="section-header centered">
        <span class="pill-tag">THE PROCESS</span>
        <h2>How SuperOffer Inverts Education Admissions</h2>
        <p>Instead of submitting 50 separate applications, experience transparent offers in four seamless steps.</p>
      </div>

      <div class="process-grid">
        <div class="glass-card process-card" [class.active]="activeStep === 1" (mouseenter)="activeStep = 1">
          <span class="step-num">01</span>
          <h3>Single Verified Profile</h3>
          <p>Assemble your academic records, test scores, financial budget, target countries, and verified credentials into one master profile.</p>
          <div class="step-footer">
            <span class="tag">Student Controlled</span>
          </div>
        </div>

        <div class="glass-card process-card" [class.active]="activeStep === 2" (mouseenter)="activeStep = 2">
          <span class="step-num">02</span>
          <h3>AI Engine Match</h3>
          <p>Our proprietary AI engine ranks student profiles for admissions teams based on academic fit, intent score, and budget alignment.</p>
          <div class="step-footer">
            <span class="tag">Bidirectional Scoring</span>
          </div>
        </div>

        <div class="glass-card process-card" [class.active]="activeStep === 3" (mouseenter)="activeStep = 3">
          <span class="step-num">03</span>
          <h3>Concrete Invitations</h3>
          <p>Institutions send proactive invitations bundled with binding scholarship grants, loan terms, or consulting engagements.</p>
          <div class="step-footer">
            <span class="tag">Real Terms Included</span>
          </div>
        </div>

        <div class="glass-card process-card" [class.active]="activeStep === 4" (mouseenter)="activeStep = 4">
          <span class="step-num">04</span>
          <h3>1-Click Negotiation</h3>
          <p>Compare all incoming offers side-by-side in your workspace and negotiate better scholarship terms with 1-click requests.</p>
          <div class="step-footer">
            <span class="tag">Maximum Leverage</span>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .section-container { margin-bottom: 100px; }
    .section-header.centered { text-align: center; max-width: 720px; margin: 0 auto 50px; }
    .pill-tag {
      display: inline-flex;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
    }
    .section-header h2 {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(32px, 3.5vw, 48px);
      font-weight: 800;
      color: #fff;
      margin: 16px 0;
      letter-spacing: -0.02em;
    }
    .section-header p { font-size: 16px; color: #94a3b8; line-height: 1.6; }

    .process-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .process-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 30px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .process-card:hover, .process-card.active {
      border-color: #38bdf8;
      background: rgba(15, 23, 42, 0.95);
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(56, 189, 248, 0.15);
    }
    .step-num { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #38bdf8; display: block; margin-bottom: 16px; }
    .process-card h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 10px; }
    .process-card p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .step-footer .tag { font-size: 11px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px; }

    @media (max-width: 1024px) {
      .process-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .process-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingProcessComponent {
  activeStep = 1;
}
