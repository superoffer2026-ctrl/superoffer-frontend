import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-landing-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card widget-card float-animation">
      <div class="widget-header">
        <div class="widget-title">
          <span class="ai-badge">⚡ AI Engine Live Demo</span>
          <h3>Instant Opportunity Simulator</h3>
        </div>
        <span class="live-status pulse-glow">Live Matching</span>
      </div>

      <div class="widget-controls">
        <div class="control-group">
          <label>
            <span>Student CGPA / Grade:</span>
            <strong class="highlight-val">{{simCgpa}} / 4.0</strong>
          </label>
          <input type="range" min="2.8" max="4.0" step="0.1" [(ngModel)]="simCgpa" (input)="updateSimulation()" />
        </div>

        <div class="control-group">
          <label>
            <span>Target Discipline:</span>
            <strong class="highlight-val">{{simDegree}}</strong>
          </label>
          <select [(ngModel)]="simDegree" (change)="updateSimulation()">
            <option value="Computer Science & AI">Computer Science & AI</option>
            <option value="Data Science & Analytics">Data Science & Analytics</option>
            <option value="Business Administration (MBA)">Business Administration (MBA)</option>
            <option value="Biomedical Engineering">Biomedical Engineering</option>
            <option value="Finance & Fintech">Finance & Fintech</option>
          </select>
        </div>

        <div class="control-group">
          <label>
            <span>Annual Budget Target:</span>
            <strong class="highlight-val">\${{simBudget}}k / yr</strong>
          </label>
          <input type="range" min="10" max="60" step="5" [(ngModel)]="simBudget" (input)="updateSimulation()" />
        </div>
      </div>

      <!-- Calculated Live Result Box -->
      <div class="widget-result-box">
        <div class="match-score-header">
          <div class="score-circle">
            <span>{{simMatchScore}}%</span>
            <small>Match</small>
          </div>
          <div>
            <h4 class="matched-uni-name">{{simMatchedUni}}</h4>
            <p class="matched-detail">{{simDegree}} • {{simLocation}}</p>
          </div>
        </div>

        <div class="offer-preview-pill">
          <div class="pill-badge">OFFER DISPATCHED</div>
          <div class="offer-details">
            <strong>{{simOfferPackage}}</strong>
            <span>Includes tuition waiver + priority visa sponsorship</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .glass-card {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .float-animation {
      animation: floatWidget 6s ease-in-out infinite;
    }
    @keyframes floatWidget {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .ai-badge {
      font-size: 11px;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .widget-title h3 {
      margin: 4px 0 0;
      font-size: 20px;
      font-weight: 700;
      color: #fff;
    }
    .live-status {
      padding: 4px 12px;
      border-radius: 99px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #10b981;
      font-size: 12px;
      font-weight: 700;
    }
    .widget-controls {
      display: flex;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 24px;
    }
    .control-group label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .highlight-val {
      color: #38bdf8;
    }
    .control-group input[type="range"] {
      width: 100%;
      accent-color: #38bdf8;
      cursor: pointer;
    }
    .control-group select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 14px;
    }
    .widget-result-box {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 16px;
      padding: 20px;
    }
    .match-score-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .score-circle {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);

    }
    .score-circle span { font-size: 17px; line-height: 1; }
    .score-circle small { font-size: 9px; opacity: 0.85; }
    .matched-uni-name { margin: 0; font-size: 16px; color: #fff; }
    .matched-detail { margin: 2px 0 0; font-size: 12px; color: #94a3b8; }
    .offer-preview-pill {
      background: rgba(56, 189, 248, 0.1);
      border-left: 3px solid #38bdf8;
      padding: 12px 14px;
      border-radius: 8px;
    }
    .pill-badge {
      font-size: 10px;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.1em;
      margin-bottom: 4px;
    }
    .offer-details strong { display: block; font-size: 14px; color: #f8fafc; }
    .offer-details span { font-size: 12px; color: #94a3b8; }
  `]
})
export class LandingSimulatorComponent implements OnInit {
  simCgpa = 3.8;
  simDegree = 'Computer Science & AI';
  simBudget = 30;
  simMatchScore = 96;
  simMatchedUni = 'Stanford International Institute';
  simLocation = 'United States';
  simOfferPackage = '$45,000 Annual Scholarship';

  ngOnInit() {
    this.updateSimulation();
  }

  updateSimulation() {
    const cgpaScore = (this.simCgpa / 4.0) * 50;
    const budgetFactor = Math.min(30, (this.simBudget / 60) * 30);
    this.simMatchScore = Math.min(99, Math.round(cgpaScore + budgetFactor + 18));

    if (this.simMatchScore >= 92) {
      this.simMatchedUni = 'Stanford International Institute';
      this.simLocation = 'California, USA';
      this.simOfferPackage = `$${Math.round(this.simCgpa * 12)}k Annual Scholarship + RAship`;
    } else if (this.simMatchScore >= 85) {
      this.simMatchedUni = 'University of Cambridge';
      this.simLocation = 'United Kingdom';
      this.simOfferPackage = '50% Tuition Fee Waiver';
    } else {
      this.simMatchedUni = 'Technical University of Munich';
      this.simLocation = 'Germany';
      this.simOfferPackage = 'Zero Tuition + €1,200/mo Research Stipend';
    }
  }
}
