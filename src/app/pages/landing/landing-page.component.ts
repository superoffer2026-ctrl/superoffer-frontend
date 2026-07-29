import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    
    <main class="landing-wrapper">
      <!-- Background Ambient Glow Orbs -->
      <div class="ambient-orb orb-1 animate-glow"></div>
      <div class="ambient-orb orb-2 animate-glow"></div>
      <div class="ambient-orb orb-3 animate-glow"></div>

      <!-- HERO SECTION -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="pill-tag">
            <span class="pulse-dot"></span> REVERSE EDUCATION MARKETPLACE
          </div>
          
          <h1 class="hero-title">
            Real education offers should <span class="gradient-text">find the right student.</span>
          </h1>

          <p class="hero-subtitle">
            SuperOffer replaces endless university applications with one structured, verified profile. 
            Over 380+ verified universities, lenders, and consultancies discover your profile and deliver concrete, comparable invitations.
          </p>

          <div class="hero-actions">
            <a routerLink="/auth/register/student" class="btn-primary">
              Build Your Profile Free <span class="arrow">→</span>
            </a>
            <a routerLink="/university" class="btn-secondary">
              Partner as an Institution
            </a>
          </div>

          <div class="hero-trust-bar">
            <div class="trust-item">
              <span class="check-icon">✓</span>
              <span><strong>100% Verified</strong> Institutions</span>
            </div>
            <div class="trust-item">
              <span class="check-icon">✓</span>
              <span><strong>Permission-Based</strong> Privacy</span>
            </div>
            <div class="trust-item">
              <span class="check-icon">✓</span>
              <span><strong>Zero Fee</strong> For Students</span>
            </div>
          </div>
        </div>

        <!-- HERO INTERACTIVE AI MATCH SIMULATOR CARD -->
        <div class="hero-widget-container animate-float">
          <div class="glass-card widget-card">
            <div class="widget-header">
              <div class="widget-title">
                <span class="ai-badge">⚡ AI Engine Live Demo</span>
                <h3>Instant Opportunity Simulator</h3>
              </div>
              <span class="live-status">Live Matching</span>
            </div>

            <div class="widget-controls">
              <div class="control-group">
                <label>
                  <span>Student CGPA / Grade:</span>
                  <strong>{{simCgpa}} / 4.0</strong>
                </label>
                <input type="range" min="2.8" max="4.0" step="0.1" [(ngModel)]="simCgpa" (input)="updateSimulation()" />
              </div>

              <div class="control-group">
                <label>
                  <span>Target Discipline:</span>
                  <strong>{{simDegree}}</strong>
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
                  <strong>\${{simBudget}}k / yr</strong>
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
        </div>
      </section>

      <!-- LIVE IMPACT STATS STRIP -->
      <section class="stats-strip">
        <div class="glass-card stats-container">
          <div class="stat-card">
            <span class="stat-number gradient-text">\${{stats?.scholarship_value_m || 85}}M+</span>
            <span class="stat-label">Scholarship Value Offered</span>
          </div>
          <div class="stat-card">
            <span class="stat-number gradient-text">{{stats?.active_universities || 380}}+</span>
            <span class="stat-label">Verified Universities</span>
          </div>
          <div class="stat-card">
            <span class="stat-number gradient-text">{{(stats?.verified_students || 12450) | number}}</span>
            <span class="stat-label">Active Student Profiles</span>
          </div>
          <div class="stat-card">
            <span class="stat-number gradient-text">94%</span>
            <span class="stat-label">Offer Acceptance Yield</span>
          </div>
        </div>
      </section>

      <!-- HOW REVERSE MARKETPLACE WORKS (4-STEP PIPELINE) -->
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

      <!-- 4-ROLE INTERACTIVE PORTAL EXPLORER -->
      <section class="section-container">
        <div class="section-header centered">
          <span class="pill-tag emerald">ECOSYSTEM PORTALS</span>
          <h2>One Platform. Four Specialized Experiences.</h2>
          <p>SuperOffer provides tailor-made workspaces for every actor in international education.</p>
        </div>

        <!-- Role Tabs -->
        <div class="portal-tab-bar">
          <button [class.active]="selectedRole === 'student'" (click)="selectedRole = 'student'">
            🎓 Student Portal
          </button>
          <button [class.active]="selectedRole === 'university'" (click)="selectedRole = 'university'">
            🏛️ University Admissions
          </button>
          <button [class.active]="selectedRole === 'bank'" (click)="selectedRole = 'bank'">
            💳 Banks & Lenders
          </button>
          <button [class.active]="selectedRole === 'consultancy'" (click)="selectedRole = 'consultancy'">
            💼 Consultancies
          </button>
        </div>

        <!-- Tab Content Card -->
        <div class="glass-card role-display-card">
          <div class="role-copy-side">
            <span class="role-badge">{{getRoleData().badge}}</span>
            <h3>{{getRoleData().title}}</h3>
            <p>{{getRoleData().description}}</p>

            <ul class="role-feature-list">
              <li *ngFor="let feat of getRoleData().features">
                <span class="feat-check">✓</span> {{feat}}
              </li>
            </ul>

            <div class="role-cta-box">
              <a [routerLink]="['/auth/register', selectedRole]" class="btn-primary">
                {{getRoleData().ctaText}} →
              </a>
              <span class="role-metric">{{getRoleData().metricText}}</span>
            </div>
          </div>

          <div class="role-mockup-side">
            <div class="mockup-window">
              <div class="mockup-bar">
                <span></span><span></span><span></span>
                <small>{{selectedRole | titlecase}} Workspace</small>
              </div>
              <div class="mockup-content">
                <div class="mock-header-strip">
                  <h4>{{getRoleData().mockTitle}}</h4>
                  <span class="live-indicator">● Active Session</span>
                </div>
                <div class="mock-cards-grid">
                  <div class="mock-card" *ngFor="let item of getRoleData().mockItems">
                    <strong>{{item.label}}</strong>
                    <span>{{item.value}}</span>
                  </div>
                </div>
                <div class="mock-graph-bar">
                  <div class="graph-fill" [style.width]="getRoleData().graphWidth"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- LIVE OFFER COMPARISON INTERACTIVE SHOWCASE -->
      <section class="section-container">
        <div class="section-header centered">
          <span class="pill-tag">TRANSPARENT OFFERS</span>
          <h2>Compare Real Offers Side-By-Side</h2>
          <p>No generic brochures. Evaluate binding scholarships, indicative loan terms, and guidance packages effortlessly.</p>
        </div>

        <div class="offers-showcase-grid">
          <!-- Offer 1: University -->
          <div class="glass-card offer-card featured">
            <div class="offer-card-badge">TOP ADMISSIONS OFFER</div>
            <div class="offer-card-header">
              <div class="uni-logo-box">🏛️</div>
              <div>
                <h4>Stanford International Institute</h4>
                <p>MS in Computer Science & AI</p>
              </div>
            </div>
            <div class="offer-amount-box">
              <span class="amount">$45,000</span>
              <span class="amount-label">Tuition Scholarship Grant</span>
            </div>
            <ul class="offer-perks">
              <li>✓ 60% Annual Tuition Coverage</li>
              <li>✓ Priority Research Assistantship</li>
              <li>✓ Expedited I-20 Visa Document</li>
            </ul>
            <div class="offer-card-footer">
              <span class="expiry">Valid for 14 days</span>
              <a routerLink="/student" class="button-link">Review Invitation →</a>
            </div>
          </div>

          <!-- Offer 2: Education Lender -->
          <div class="glass-card offer-card">
            <div class="offer-card-badge bank">PRE-APPROVED LOAN</div>
            <div class="offer-card-header">
              <div class="uni-logo-box bank">💳</div>
              <div>
                <h4>Global Education Finance Bank</h4>
                <p>Non-Collateral Student Loan</p>
              </div>
            </div>
            <div class="offer-amount-box">
              <span class="amount">8.5% p.a.</span>
              <span class="amount-label">$60,000 Disbursal Sanction</span>
            </div>
            <ul class="offer-perks">
              <li>✓ Zero Processing Fee</li>
              <li>✓ 12-Month Grace Moratorium</li>
              <li>✓ No Collateral Required</li>
            </ul>
            <div class="offer-card-footer">
              <span class="expiry">Fast Disbursement</span>
              <a routerLink="/student" class="button-link">Review Terms →</a>
            </div>
          </div>

          <!-- Offer 3: Consultancy -->
          <div class="glass-card offer-card">
            <div class="offer-card-badge consultant">EXPERT MENTORSHIP</div>
            <div class="offer-card-header">
              <div class="uni-logo-box consultant">💼</div>
              <div>
                <h4>Global Pathways Consultancy</h4>
                <p>Visa & Transition Concierge</p>
              </div>
            </div>
            <div class="offer-amount-box">
              <span class="amount">100% Free</span>
              <span class="amount-label">Institutional Sponsored Service</span>
            </div>
            <ul class="offer-perks">
              <li>✓ 1-on-1 Embassy Interview Prep</li>
              <li>✓ Housing & Flight Settlement</li>
              <li>✓ Dedicated Admissions Officer</li>
            </ul>
            <div class="offer-card-footer">
              <span class="expiry">Instant Access</span>
              <a routerLink="/student" class="button-link">Connect Mentor →</a>
            </div>
          </div>
        </div>
      </section>

      <!-- AI MATCHING ENGINE DEEP DIVE -->
      <section class="section-container">
        <div class="glass-card ai-deepdive-card">
          <div class="ai-copy">
            <span class="pill-tag">MATCHING ARCHITECTURE</span>
            <h2>Driven by High-Precision AI Algorithms</h2>
            <p>Our matching engine processes multidimensional profile attributes to ensure institutions connect with students who have genuine academic intent and financial compatibility.</p>
            
            <div class="ai-factors-grid">
              <div class="factor-item">
                <span class="factor-score">35%</span>
                <div>
                  <strong>Academic Alignment</strong>
                  <p>CGPA, grading scales, core coursework, & prerequisites.</p>
                </div>
              </div>
              <div class="factor-item">
                <span class="factor-score">25%</span>
                <div>
                  <strong>Test & Skill Ratings</strong>
                  <p>GRE, GMAT, TOEFL, IELTS, & verified achievements.</p>
                </div>
              </div>
              <div class="factor-item">
                <span class="factor-score">20%</span>
                <div>
                  <strong>Financial & Budget Fit</strong>
                  <p>Target budget bands, funding sources, & scholarship need.</p>
                </div>
              </div>
              <div class="factor-item">
                <span class="factor-score">20%</span>
                <div>
                  <strong>Verification & Intent</strong>
                  <p>Document completeness, domain checks, & program preferences.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TRUST & SECURITY STRIP -->
      <section class="trust-security-section">
        <div class="security-banner">
          <div class="sec-badge">
            <span class="sec-icon">🔒</span>
            <div>
              <h4>AES-256 Encrypted Profile Storage</h4>
              <p>Your academic documents and personal data remain protected by enterprise encryption.</p>
            </div>
          </div>

          <div class="sec-badge">
            <span class="sec-icon">🛡️</span>
            <div>
              <h4>Permissioned Access Control</h4>
              <p>Institutions can only view your contact information after you accept their invitation.</p>
            </div>
          </div>

          <div class="sec-badge">
            <span class="sec-icon">✓</span>
            <div>
              <h4>Vetted & Accredited Partners</h4>
              <p>Every university, lender, and consultancy undergoes manual SuperAdmin verification.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FREQUENTLY ASKED QUESTIONS ACCORDION -->
      <section class="section-container">
        <div class="section-header centered">
          <span class="pill-tag">FREQUENTLY ASKED QUESTIONS</span>
          <h2>Everything You Need to Know</h2>
          <p>Have questions about how SuperOffer works? Here are answers to common inquiries.</p>
        </div>

        <div class="faq-accordion-list">
          <div class="glass-card faq-item" *ngFor="let faq of faqs; let i = index" [class.open]="openFaq === i">
            <button class="faq-question" (click)="toggleFaq(i)">
              <span>{{faq.q}}</span>
              <span class="toggle-icon">{{openFaq === i ? '−' : '+'}}</span>
            </button>
            <div class="faq-answer" *ngIf="openFaq === i">
              <p>{{faq.a}}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- HIGH-IMPACT FINAL CALL TO ACTION -->
      <section class="final-cta-section">
        <div class="glass-card cta-banner">
          <span class="pill-tag emerald">START YOUR JOURNEY</span>
          <h2>Ready for Real Education Offers to Find You?</h2>
          <p>Create your structured profile in less than 5 minutes and let top international universities compete for your enrollment.</p>
          
          <div class="cta-buttons">
            <a routerLink="/auth/register/student" class="btn-primary">
              Create Free Student Account →
            </a>
            <a routerLink="/university" class="btn-secondary">
              Register Your Institution
            </a>
          </div>
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: [`
    .landing-wrapper {
      position: relative;
      overflow: hidden;
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px 24px 80px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Ambient Glowing Orbs */
    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 {
      width: 500px;
      height: 500px;
      background: rgba(56, 189, 248, 0.15);
      top: -100px;
      left: -100px;
    }
    .orb-2 {
      width: 600px;
      height: 600px;
      background: rgba(99, 102, 241, 0.12);
      top: 600px;
      right: -150px;
    }
    .orb-3 {
      width: 450px;
      height: 450px;
      background: rgba(16, 185, 129, 0.1);
      bottom: 200px;
      left: 10%;
    }

    /* Hero Section */
    .hero-section {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 48px;
      align-items: center;
      padding: 60px 0 80px;
      position: relative;
      z-index: 1;
    }
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(42px, 4.5vw, 68px);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.03em;
      margin: 20px 0 24px;
    }
    .hero-subtitle {
      font-size: 18px;
      line-height: 1.65;
      color: #94a3b8;
      max-width: 620px;
      margin-bottom: 36px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 10px #38bdf8;
    }
    .hero-trust-bar {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      font-size: 13px;
      color: #94a3b8;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .check-icon {
      color: #10b981;
      font-weight: 800;
    }

    /* Hero Widget Simulator */
    .hero-widget-container {
      position: relative;
      z-index: 2;
    }
    .widget-card {
      padding: 32px;
      border: 1px solid rgba(56, 189, 248, 0.25);
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
    .control-group label strong {
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
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 14px;
    }
    .widget-result-box {
      background: rgba(15, 23, 42, 0.9);
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

    /* Stats Strip */
    .stats-strip { margin: 40px 0 80px; }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 36px;
      gap: 24px;
      text-align: center;
    }
    .stat-number { font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 800; display: block; }
    .stat-label { font-size: 13px; color: #94a3b8; font-weight: 600; margin-top: 4px; display: block; }

    /* General Section Headers */
    .section-container { margin-bottom: 100px; position: relative; z-index: 1; }
    .section-header.centered { text-align: center; max-width: 720px; margin: 0 auto 50px; }
    .section-header h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 3.5vw, 48px); font-weight: 800; margin: 16px 0; letter-spacing: -0.02em; }
    .section-header p { font-size: 16px; color: #94a3b8; line-height: 1.6; }

    /* Process Grid */
    .process-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .process-card { padding: 30px; position: relative; }
    .process-card.active { border-color: #38bdf8; background: rgba(15, 23, 42, 0.9); }
    .step-num { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #38bdf8; display: block; margin-bottom: 16px; }
    .process-card h3 { font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 10px; }
    .process-card p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .step-footer .tag { font-size: 11px; font-weight: 700; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 6px; }

    /* Role Explorer */
    .portal-tab-bar { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; flex-wrap: wrap; }
    .portal-tab-bar button {
      padding: 14px 24px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-weight: 700;
      font-size: 14px;
      transition: all 0.2s;
    }
    .portal-tab-bar button.active {
      background: #38bdf8;
      color: #060913;
      border-color: #38bdf8;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.4);
    }
    .role-display-card { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 40px; padding: 48px; }
    .role-badge { font-size: 11px; font-weight: 800; color: #10b981; letter-spacing: 0.1em; text-transform: uppercase; }
    .role-copy-side h3 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #fff; margin: 10px 0 16px; }
    .role-copy-side p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .role-feature-list { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 12px; }
    .role-feature-list li { font-size: 14px; color: #f8fafc; display: flex; align-items: center; gap: 10px; }
    .feat-check { color: #10b981; font-weight: 800; }
    .role-cta-box { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .role-metric { font-size: 13px; color: #38bdf8; font-weight: 700; }

    /* Mockup */
    .mockup-window { background: #090e1a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 16px; overflow: hidden; }
    .mockup-bar { background: #0f172a; padding: 12px 16px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #64748b; }
    .mockup-bar span { width: 10px; height: 10px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); }
    .mockup-bar b { margin-left: auto; color: #94a3b8; }
    .mockup-content { padding: 24px; }
    .mock-header-strip { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .mock-header-strip h4 { margin: 0; font-size: 16px; color: #fff; }
    .live-indicator { font-size: 11px; color: #10b981; font-weight: 700; }
    .mock-cards-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .mock-card { background: rgba(255, 255, 255, 0.04); padding: 14px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); }
    .mock-card strong { display: block; font-size: 11px; color: #94a3b8; font-weight: 600; }
    .mock-card span { font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 4px; display: block; }
    .mock-graph-bar { height: 8px; background: rgba(255, 255, 255, 0.06); border-radius: 4px; overflow: hidden; }
    .graph-fill { height: 100%; background: linear-gradient(90deg, #38bdf8, #10b981); transition: width 0.5s ease; }

    /* Offers Showcase */
    .offers-showcase-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .offer-card { padding: 32px; display: flex; flex-direction: column; justify-content: space-between; }
    .offer-card.featured { border-color: rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.95); }
    .offer-card-badge { font-size: 10px; font-weight: 800; color: #38bdf8; letter-spacing: 0.1em; background: rgba(56, 189, 248, 0.1); padding: 4px 10px; border-radius: 6px; width: fit-content; margin-bottom: 16px; }
    .offer-card-badge.bank { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
    .offer-card-badge.consultant { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .offer-card-header { display: flex; gap: 14px; align-items: center; margin-bottom: 20px; }
    .uni-logo-box { width: 44px; height: 44px; border-radius: 12px; background: rgba(56, 189, 248, 0.15); display: grid; place-items: center; font-size: 22px; }
    .uni-logo-box.bank { background: rgba(251, 191, 36, 0.15); }
    .uni-logo-box.consultant { background: rgba(16, 185, 129, 0.15); }
    .offer-card-header h4 { margin: 0 0 2px; font-size: 16px; color: #fff; }
    .offer-card-header p { margin: 0; font-size: 12px; color: #94a3b8; }
    .offer-amount-box { margin-bottom: 20px; }
    .amount { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #fff; display: block; }
    .amount-label { font-size: 12px; color: #38bdf8; font-weight: 600; }
    .offer-perks { list-style: none; padding: 0; margin: 0 0 24px; display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #94a3b8; }
    .offer-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 16px; }
    .expiry { font-size: 11px; color: #64748b; font-weight: 600; }
    .button-link { color: #38bdf8; font-weight: 700; font-size: 13px; text-decoration: none; }

    /* AI Deepdive */
    .ai-deepdive-card { padding: 50px; }
    .ai-copy h2 { font-family: 'Outfit', sans-serif; font-size: 36px; font-weight: 800; color: #fff; margin: 16px 0 12px; }
    .ai-copy>p { font-size: 16px; color: #94a3b8; max-width: 780px; margin-bottom: 36px; }
    .ai-factors-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .factor-item { background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); }
    .factor-score { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #10b981; display: block; margin-bottom: 8px; }
    .factor-item strong { display: block; font-size: 14px; color: #fff; margin-bottom: 4px; }
    .factor-item p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }

    /* Security Banner */
    .trust-security-section { margin-bottom: 100px; }
    .security-banner { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; background: rgba(15, 23, 42, 0.6); padding: 32px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); }
    .sec-badge { display: flex; gap: 16px; align-items: flex-start; }
    .sec-icon { font-size: 26px; }
    .sec-badge h4 { margin: 0 0 4px; font-size: 15px; color: #fff; }
    .sec-badge p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }

    /* FAQ Accordion */
    .faq-accordion-list { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
    .faq-item { padding: 0; overflow: hidden; }
    .faq-question { width: 100%; padding: 20px 24px; background: transparent; border: none; text-align: left; font-size: 16px; font-weight: 700; color: #fff; display: flex; justify-content: space-between; align-items: center; }
    .toggle-icon { font-size: 20px; color: #38bdf8; }
    .faq-answer { padding: 0 24px 20px; font-size: 14px; color: #94a3b8; line-height: 1.6; }

    /* Final CTA Banner */
    .final-cta-section { margin-bottom: 60px; }
    .cta-banner { text-align: center; padding: 64px 32px; background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%); border: 1px solid rgba(56, 189, 248, 0.3); }
    .cta-banner h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 3.8vw, 52px); font-weight: 800; color: #fff; margin: 16px 0; }
    .cta-banner p { font-size: 16px; color: #94a3b8; max-width: 640px; margin: 0 auto 36px; }
    .cta-buttons { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; }

    /* Responsive Queries */
    @media (max-width: 1024px) {
      .hero-section { grid-template-columns: 1fr; }
      .stats-container { grid-template-columns: 1fr 1fr; }
      .process-grid { grid-template-columns: 1fr 1fr; }
      .role-display-card { grid-template-columns: 1fr; }
      .offers-showcase-grid { grid-template-columns: 1fr; }
      .ai-factors-grid { grid-template-columns: 1fr 1fr; }
      .security-banner { grid-template-columns: 1fr; }
    }

    @media (max-width: 640px) {
      .stats-container { grid-template-columns: 1fr; }
      .process-grid { grid-template-columns: 1fr; }
      .ai-factors-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingPageComponent implements OnInit {
  stats: any = null;
  activeStep = 1;
  openFaq: number | null = 0;
  selectedRole: 'student' | 'university' | 'bank' | 'consultancy' = 'student';

  // Simulator State
  simCgpa = 3.8;
  simDegree = 'Computer Science & AI';
  simBudget = 30;
  simMatchScore = 96;
  simMatchedUni = 'Stanford International Institute';
  simLocation = 'United States';
  simOfferPackage = '$45,000 Annual Scholarship';

  faqs = [
    {
      q: 'How does SuperOffer invert traditional education search?',
      a: 'Instead of searching hundreds of university websites, you create one verified profile. Institutions search candidate pools using structured criteria and proactively send concrete, negotiable admission & scholarship offers directly to your inbox.'
    },
    {
      q: 'Is SuperOffer completely free for students?',
      a: 'Yes! SuperOffer is 100% free for students. There are no subscription fees, application hidden costs, or premium paywalls for profile creation and offer comparison.'
    },
    {
      q: 'Are my personal documents and contact details kept private?',
      a: 'Absolutely. SuperOffer enforces permission-based privacy. Institutions can evaluate your academic match scores, but your contact details remain locked until you accept an invitation.'
    },
    {
      q: 'Can I compare and negotiate multiple offers at once?',
      a: 'Yes! Your student inbox allows holding multiple pending invitations side-by-side. You can compare scholarships, loan terms, and visa assistance packages, and use our 1-click negotiation tool to request better terms before final acceptance.'
    },
    {
      q: 'How are universities and lenders verified on SuperOffer?',
      a: 'Every institutional account (University, Education Lender, Consultancy) undergoes manual SuperAdmin verification checking accreditation numbers, government licenses, and official domain records before access is granted.'
    }
  ];

  constructor(private api: AuthApiService) {}

  async ngOnInit() {
    try {
      this.stats = await this.api.publicStats();
    } catch {
      // Fallback cleanly
    }
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

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }

  getRoleData() {
    const data = {
      student: {
        badge: 'STUDENT WORKSPACE',
        title: 'One Profile. Concrete Offers Delivered.',
        description: 'Stop repeating applications. Keep your GPA, test scores, financial goals, and documents in one verified workspace, then compare real invitations side by side.',
        features: [
          'Unified academic & credential vault',
          'Side-by-side scholarship & loan comparison',
          '1-Click transparent term negotiation',
          'Strict permissioned privacy controls'
        ],
        ctaText: 'Build Student Profile',
        metricText: '12,450+ Verified Students Matched',
        mockTitle: 'Student Offer Inbox',
        mockItems: [
          { label: 'Pending Invitations', value: '3 Active' },
          { label: 'Total Scholarship Value', value: '$85,000' },
          { label: 'Highest Match Score', value: '98% Stanford' },
          { label: 'Status', value: 'Negotiating Terms' }
        ],
        graphWidth: '85%'
      },
      university: {
        badge: 'ADMISSIONS RECRUITMENT',
        title: 'Discover Best-Fit Students & Fill Seats Faster',
        description: 'Access pre-verified candidate pools filtered by GPA, budget, and degree intent. Issue formal admission offers and monitor your funnel in real time.',
        features: [
          'AI-Ranked student discovery engine',
          'Institutional shortlist management',
          'Direct scholarship offer issuance',
          'Real-time enrollment funnel reporting'
        ],
        ctaText: 'Register University',
        metricText: '380+ Verified Partner Universities',
        mockTitle: 'Admissions Funnel Dashboard',
        mockItems: [
          { label: 'Candidates Discovered', value: '1,420 Students' },
          { label: 'Offers Dispatched', value: '184 Offers' },
          { label: 'Acceptance Rate', value: '94% Yield' },
          { label: 'Verification Status', value: 'Approved (Green)' }
        ],
        graphWidth: '94%'
      },
      bank: {
        badge: 'EDUCATION LENDING',
        title: 'Discover Creditworthy Students & Disburse Loans',
        description: 'Evaluate pre-verified creditworthy students seeking education financing. Present clear indicative loan offers with competitive interest rates and grace periods.',
        features: [
          'Creditworthy student discovery',
          'Non-collateral indicative loan quotes',
          'Upfront grace period & rate transparency',
          'Streamlined disbursal workflow'
        ],
        ctaText: 'Partner as Education Lender',
        metricText: '$12M+ Disbursed Loans',
        mockTitle: 'Lender Pipeline Portal',
        mockItems: [
          { label: 'Loan Inquiries', value: '420 Active' },
          { label: 'Pre-Approved Capital', value: '$12.4M' },
          { label: 'Avg. Interest Rate', value: '8.5% p.a.' },
          { label: 'Processing Fee', value: '0%' }
        ],
        graphWidth: '78%'
      },
      consultancy: {
        badge: 'STUDY ABROAD ADVISORY',
        title: 'Connect with Intent-Verified Student Clients',
        description: 'Skip cold outreach. Reach students actively seeking study-abroad guidance and offer 1-on-1 mentorship, visa preparation, and university transition support.',
        features: [
          'High-intent student client pipeline',
          'Direct consulting engagement offers',
          'Visa & embassy interview prep modules',
          'Client milestone tracking'
        ],
        ctaText: 'Register Consultancy',
        metricText: '110+ Certified Consultancies',
        mockTitle: 'Consulting Engagement Manager',
        mockItems: [
          { label: 'Student Engagements', value: '94 Clients' },
          { label: 'Visa Success Rate', value: '99.2%' },
          { label: 'Country Coverage', value: '12 Nations' },
          { label: 'Client Satisfaction', value: '4.9 / 5.0' }
        ],
        graphWidth: '92%'
      }
    };
    return data[this.selectedRole];
  }
}
