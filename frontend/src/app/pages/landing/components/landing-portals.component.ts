import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-portals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
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
              <b>{{selectedRole | titlecase}} Workspace</b>
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
  `,
  styles: [`
    :host { display: block; }
    .section-container { margin-bottom: 100px; }
    .section-header.centered { text-align: center; max-width: 720px; margin: 0 auto 50px; }
    .pill-tag.emerald {
      display: inline-flex;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #10b981;
    }
    .section-header h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 3.5vw, 48px); font-weight: 800; color: #fff; margin: 16px 0; }
    .section-header p { font-size: 16px; color: #94a3b8; line-height: 1.6; }

    .portal-tab-bar { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; flex-wrap: wrap; }
    .portal-tab-bar button {
      padding: 14px 24px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .portal-tab-bar button.active {
      background: #38bdf8;
      color: #060913;
      border-color: #38bdf8;
      box-shadow: 0 0 25px rgba(56, 189, 248, 0.4);
    }

    .role-display-card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 48px;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 40px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .role-badge { font-size: 11px; font-weight: 800; color: #10b981; letter-spacing: 0.1em; text-transform: uppercase; }
    .role-copy-side h3 { font-family: 'Outfit', sans-serif; font-size: 32px; font-weight: 800; color: #fff; margin: 10px 0 16px; }
    .role-copy-side p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
    .role-feature-list { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 12px; }
    .role-feature-list li { font-size: 14px; color: #f8fafc; display: flex; align-items: center; gap: 10px; }
    .feat-check { color: #10b981; font-weight: 800; }
    .role-cta-box { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
    .btn-primary {
      padding: 14px 28px;
      border-radius: 12px;
      background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
      color: #fff;
      font-weight: 700;
      text-decoration: none;
    }
    .role-metric { font-size: 13px; color: #38bdf8; font-weight: 700; }

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

    @media (max-width: 900px) {
      .role-display-card { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingPortalsComponent {
  selectedRole: 'student' | 'university' | 'bank' | 'consultancy' = 'student';

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
