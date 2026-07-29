import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <footer class="footer-wrapper">
      <div class="footer-glass-card">
        <div class="footer-top-grid">
          <!-- Column 1: Brand -->
          <div class="footer-brand-col">
            <a class="brand-link" routerLink="/">
              <div class="logo-box">
                <img src="/assets/superoffer-logo.svg" alt="SuperOffer" class="footer-logo" />
              </div>
              <span class="brand-text">Super<span class="highlight">Offer</span></span>
            </a>
            <p class="brand-desc">
              The reverse education marketplace connecting verified students, universities, lenders, and consultancies with transparent, comparable offers.
            </p>
            <div class="sec-pill">
              🔒 AES-256 Encrypted & SuperAdmin Verified
            </div>
          </div>

          <!-- Column 2: Portals -->
          <div class="footer-nav-col">
            <h4>Ecosystem Portals</h4>
            <a routerLink="/student">Student Workspace</a>
            <a routerLink="/university">University Admissions</a>
            <a routerLink="/bank">Banks & Lenders</a>
            <a routerLink="/consultancy">Study Abroad Consultancies</a>
            <a routerLink="/admin">SuperAdmin Control</a>
          </div>

          <!-- Column 3: Platform Resources -->
          <div class="footer-nav-col">
            <h4>Platform & Safety</h4>
            <a href="#features">AI Matching Engine</a>
            <a href="#faq">Frequently Asked Questions</a>
            <a href="mailto:support@superoffer.net">Verification Support</a>
            <a routerLink="/auth/login/student">Sign In to Portal</a>
          </div>

          <!-- Column 4: Newsletter -->
          <div class="footer-newsletter-col">
            <h4>Marketplace Updates</h4>
            <p>Subscribe for scholarship announcements and new partner university onboarding alerts.</p>
            <form (ngSubmit)="subscribe()" class="news-form">
              <input type="email" [(ngModel)]="email" name="newsEmail" placeholder="Enter your email" required />
              <button type="submit" class="news-btn">{{subscribed ? '✓ Subscribed' : 'Subscribe'}}</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <span>© 2026 SuperOffer (superoffer.net). All rights reserved. Privacy & Permission-based by design.</span>
          <div class="footer-legal-links">
            <span>Role-Based Access</span>
            <span>•</span>
            <span>GDPR Compliant</span>
            <span>•</span>
            <span>Terms of Marketplace</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer-wrapper {
      padding: 0 24px 40px;
      max-width: 1360px;
      margin: 0 auto;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .footer-glass-card {
      background: rgba(10, 16, 30, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    .footer-top-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
      gap: 40px;
      padding-bottom: 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      margin-bottom: 16px;
    }
    .logo-box {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.15);
      display: grid;
      place-items: center;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .footer-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
    .brand-text {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #fff;
    }
    .brand-text .highlight { color: #38bdf8; }
    .brand-desc {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .sec-pill {
      font-size: 11px;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid rgba(16, 185, 129, 0.2);
      display: inline-block;
    }
    .footer-nav-col h4, .footer-newsletter-col h4 {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
      margin: 0 0 20px;
    }
    .footer-nav-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer-nav-col a {
      text-decoration: none;
      color: #94a3b8;
      font-size: 13px;
      transition: color 0.2s;
    }
    .footer-nav-col a:hover {
      color: #38bdf8;
    }
    .footer-newsletter-col p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .news-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .news-form input {
      padding: 12px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 13px;
      outline: none;
    }
    .news-btn {
      padding: 12px;
      border-radius: 10px;
      background: #38bdf8;
      color: #060913;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .news-btn:hover {
      background: #7dd3fc;
    }
    .footer-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 24px;
      font-size: 12px;
      color: #64748b;
      flex-wrap: wrap;
      gap: 12px;
    }
    .footer-legal-links {
      display: flex;
      gap: 10px;
    }

    @media (max-width: 1024px) {
      .footer-top-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .footer-top-grid {
        grid-template-columns: 1fr;
      }
      .footer-glass-card {
        padding: 24px;
      }
    }
  `]
})
export class SiteFooterComponent {
  email = '';
  subscribed = false;

  subscribe() {
    if (this.email) {
      this.subscribed = true;
    }
  }
}
