import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { LandingHeroComponent } from './components/landing-hero.component';
import { LandingSimulatorComponent } from './components/landing-simulator.component';
import { LandingProcessComponent } from './components/landing-process.component';
import { LandingPortalsComponent } from './components/landing-portals.component';
import { LandingFaqComponent } from './components/landing-faq.component';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    SiteHeaderComponent,
    SiteFooterComponent,
    LandingHeroComponent,
    LandingSimulatorComponent,
    LandingProcessComponent,
    LandingPortalsComponent,
    LandingFaqComponent
  ],
  template: `
    <app-site-header />

    <main class="landing-wrapper">
      <!-- Background Ambient Glow Orbs -->
      <div class="ambient-orb orb-1 animate-glow"></div>
      <div class="ambient-orb orb-2 animate-glow"></div>
      <div class="ambient-orb orb-3 animate-glow"></div>

      <!-- HERO SECTION WITH SIMULATOR -->
      <section class="hero-section">
        <app-landing-hero />
        <app-landing-simulator />
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

      <!-- PROCESS PIPELINE -->
      <app-landing-process />

      <!-- ECOSYSTEM PORTALS -->
      <app-landing-portals />

      <!-- FREQUENTLY ASKED QUESTIONS -->
      <app-landing-faq />
    </main>

    <app-site-footer />
  `,
  styles: [`
    .landing-wrapper {
      position: relative;
      overflow: hidden;
      max-width: 1360px;
      margin: 0 auto;
      padding: 20px 24px 80px;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }

    /* Ambient Glow Orbs */
    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 { width: 500px; height: 500px; background: rgba(56, 189, 248, 0.15); top: -100px; left: -100px; }
    .orb-2 { width: 600px; height: 600px; background: rgba(99, 102, 241, 0.12); top: 600px; right: -150px; }
    .orb-3 { width: 450px; height: 450px; background: rgba(16, 185, 129, 0.1); bottom: 200px; left: 10%; }

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

    /* Stats Strip */
    .stats-strip { margin: 40px 0 80px; position: relative; z-index: 1; }
    .stats-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      padding: 36px;
      gap: 24px;
      text-align: center;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }
    .stat-number { font-family: 'Outfit', sans-serif; font-size: 38px; font-weight: 800; display: block; }
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label { font-size: 13px; color: #94a3b8; font-weight: 600; margin-top: 4px; display: block; }

    @media (max-width: 1024px) {
      .hero-section { grid-template-columns: 1fr; }
      .stats-container { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
      .stats-container { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingPageComponent implements OnInit {
  stats: any = null;

  constructor(private api: AuthApiService) {}

  async ngOnInit() {
    try {
      this.stats = await this.api.publicStats();
    } catch {
      // Fallback
    }
  }
}
