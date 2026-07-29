import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="realtime-single-footer">
      <!-- Callout Banner inside Footer (Unified Single Color) -->
      <div class="footer-callout">
        <div class="callout-inner">
          <div>
            <span class="eyebrow-pill">FREE FOR STUDENTS</span>
            <h2>Make your profile work for your future.</h2>
            <p>Join SuperOffer and bring better-fit education opportunities into one private workspace.</p>
          </div>
          <div>
            <a routerLink="/auth/register/student" class="callout-btn">
              Create your profile →
            </a>
          </div>
        </div>
      </div>

      <!-- Real-Time Status & Contact Strip -->
      <div class="realtime-status-strip">
        <div class="status-inner">
          <div class="system-status">
            <span class="status-dot"></span>
            <span><strong>System Status:</strong> All Systems Operational</span>
          </div>

          <div class="live-clock">
            <span class="clock-icon">🕒</span>
            <span>Real-time UTC: <strong>{{currentTime}}</strong></span>
          </div>

          <div class="contact-quick">
            <span>✉️ <strong>support@superoffer.net</strong></span>
            <span>•</span>
            <span>🏛️ <strong>admissions@superoffer.net</strong></span>
          </div>
        </div>
      </div>

      <!-- Main Footer Columns -->
      <div class="footer-main-content">
        <div class="footer-grid">
          <!-- Column 1: Brand & Identity -->
          <div class="footer-brand-col">
            <a class="brand-link" routerLink="/">
              <img src="/assets/superoffer-logo.svg" alt="SuperOffer Logo" class="brand-logo" />
              <span class="brand-name">SuperOffer</span>
            </a>
            <p class="brand-desc">
              One verified marketplace for education opportunities, funding, and guidance. Reverse admissions platform connecting students with accredited universities, lenders, and consultancies.
            </p>
          </div>

          <!-- Column 2: Ecosystem Portals -->
          <div class="footer-col">
            <h4>Portals</h4>
            <a routerLink="/student">Student</a>
            <a routerLink="/university">University</a>
            <a routerLink="/bank">Bank</a>
            <a routerLink="/consultancy">Consultancy</a>
          </div>

          <!-- Column 3: Platform Resources -->
          <div class="footer-col">
            <h4>Platform</h4>
            <a href="#faq">FAQs</a>
            <a href="mailto:support@superoffer.net">Support & Help Desk</a>
            <a routerLink="/admin">SuperAdmin Control</a>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <small>© 2026 SuperOffer (superoffer.net). Secure & Privacy-First Architecture.</small>
          <div class="legal-links">
            <a href="mailto:support@superoffer.net">Privacy Policy</a>
            <span>•</span>
            <a href="mailto:support@superoffer.net">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .realtime-single-footer {
      background: #0b2639;
      color: #ffffff;
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      width: 100%;
      box-sizing: border-box;
    }

    /* Callout Banner Inside Footer (Single Color Theme) */
    .footer-callout {
      padding: 50px 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .callout-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 30px;
    }
    .eyebrow-pill {
      display: inline-block;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #75d5bc;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .callout-inner h2 {
      font-family: 'Outfit', Georgia, serif;
      font-size: clamp(28px, 3.2vw, 42px);
      font-weight: 800;
      color: #ffffff;
      margin: 0 0 10px;
      letter-spacing: -0.02em;
    }
    .callout-inner p {
      font-size: 16px;
      color: #aebcb7;
      margin: 0;
      max-width: 600px;
    }
    .callout-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 28px;
      background: #ffffff;
      color: #0b2639;
      font-weight: 800;
      font-size: 15px;
      border-radius: 99px;
      text-decoration: none;
      transition: all 0.25s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    .callout-btn:hover {
      background: #e2f7ed;
      transform: translateY(-2px);
    }

    /* Real-Time Status Strip */
    .realtime-status-strip {
      background: rgba(0, 0, 0, 0.2);
      padding: 14px 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 13px;
    }
    .status-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      color: #b8c9c5;
    }
    .system-status {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }
    .live-clock {
      color: #65cbb0;
    }
    .contact-quick {
      display: flex;
      gap: 12px;
      align-items: center;
      color: #ffffff;
    }

    /* Main Footer */
    .footer-main-content {
      padding: 60px 40px 30px;
    }
    .footer-grid {
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 60px;
      padding-bottom: 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      margin-bottom: 16px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      object-fit: contain;
    }
    .brand-name {
      font-family: 'Outfit', Georgia, serif;
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
    }
    .brand-desc {
      color: #aebcb7;
      font-size: 14px;
      line-height: 1.6;
      max-width: 440px;
      margin: 0;
    }
    .footer-col h4 {
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 20px;
    }
    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .footer-col a {
      color: #aebcb7;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .footer-col a:hover {
      color: #65cbb0;
    }
    .footer-bottom-bar {
      max-width: 1280px;
      margin: 24px auto 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #718078;
      font-size: 13px;
    }
    .legal-links {
      display: flex;
      gap: 10px;
    }
    .legal-links a {
      color: #aebcb7;
      text-decoration: none;
    }

    @media (max-width: 900px) {
      .callout-inner {
        flex-direction: column;
        align-items: flex-start;
      }
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .status-inner {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class SiteFooterComponent implements OnInit, OnDestroy {
  currentTime = '';
  private timer: any;

  ngOnInit() {
    this.updateClock();
    this.timer = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private updateClock() {
    this.currentTime = new Date().toUTCString().replace('GMT', 'UTC');
  }
}
