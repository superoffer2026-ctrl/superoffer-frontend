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
        
        <!-- Contact Banner Strip -->
        <div class="contact-banner-strip">
          <div class="contact-banner-item">
            <span class="c-icon">✉️</span>
            <div>
              <small>Student & Verification Support</small>
              <strong>support@superoffer.net</strong>
            </div>
          </div>

          <div class="contact-banner-item">
            <span class="c-icon">🏛️</span>
            <div>
              <small>Institutional Partnerships Desk</small>
              <strong>admissions@superoffer.net</strong>
            </div>
          </div>

          <div class="contact-banner-item">
            <span class="c-icon">📍</span>
            <div>
              <small>Global Headquarters</small>
              <strong>SuperOffer Operations Hub, Digital Park</strong>
            </div>
          </div>

          <div class="contact-banner-item">
            <span class="c-icon">🕒</span>
            <div>
              <small>Support Desk Hours</small>
              <strong>Mon – Fri, 9:00 AM – 6:00 PM UTC</strong>
            </div>
          </div>
        </div>

        <div class="footer-top-grid">
          <!-- Column 1: Brand & Overview -->
          <div class="footer-brand-col">
            <a class="brand-link" routerLink="/">
              <div class="logo-box">
                <img src="/assets/superoffer-logo.svg" alt="SuperOffer Logo" class="footer-logo" />
              </div>
              <span class="brand-text">Super<span class="highlight">Offer</span></span>
            </a>
            <p class="brand-desc">
              SuperOffer is the world's leading reverse education marketplace. We invert traditional admissions by enabling accredited universities, lenders, and consultancies to deliver concrete, comparable offers directly to verified students.
            </p>
            <div class="sec-pill">
              🔒 AES-256 Encrypted • SuperAdmin Verified Platform
            </div>
          </div>

          <!-- Column 2: Ecosystem Portals -->
          <div class="footer-nav-col">
            <h4>Ecosystem Portals</h4>
            <a routerLink="/student">🎓 Student Workspace</a>
            <a routerLink="/university">🏛️ University Admissions</a>
            <a routerLink="/bank">💳 Banks & Education Lenders</a>
            <a routerLink="/consultancy">💼 Study Abroad Consultancies</a>
            <a routerLink="/admin">🛡️ SuperAdmin Control Panel</a>
          </div>

          <!-- Column 3: Trust & Governance -->
          <div class="footer-nav-col">
            <h4>Platform & Governance</h4>
            <a href="#features">AI Matching Architecture</a>
            <a href="#faq">Frequently Asked Questions</a>
            <a routerLink="/auth/login/student">Sign In to Dashboard</a>
            <a routerLink="/auth/register/university">Register Institution</a>
            <a href="mailto:support@superoffer.net">Report an Issue</a>
          </div>

          <!-- Column 4: Contact & Inquiries -->
          <div class="footer-newsletter-col">
            <h4>Connect With Our Team</h4>
            <p>Have an institutional inquiry or need help with profile verification? Send us a message directly.</p>
            <form (ngSubmit)="subscribe()" class="news-form">
              <input type="email" [(ngModel)]="email" name="newsEmail" placeholder="Enter your official email" required />
              <button type="submit" class="news-btn">{{subscribed ? '✓ Message Sent' : 'Send Inquiry'}}</button>
            </form>
          </div>
        </div>

        <div class="footer-bottom-bar">
          <span>© 2026 SuperOffer Technologies (superoffer.net). All rights reserved. Permission & Privacy-First Architecture.</span>
          <div class="footer-legal-links">
            <a href="mailto:support@superoffer.net">Privacy Policy</a>
            <span>•</span>
            <a href="mailto:support@superoffer.net">Terms of Service</a>
            <span>•</span>
            <a href="mailto:support@superoffer.net">Security Compliance</a>
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
      background: rgba(10, 16, 30, 0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 24px;
      padding: 40px 48px 36px;
      box-shadow: 0 25px 70px rgba(0, 0, 0, 0.6);
    }

    /* Contact Banner Strip */
    .contact-banner-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      padding-bottom: 32px;
      margin-bottom: 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .contact-banner-item {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.03);
      padding: 16px 20px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.07);
    }
    .c-icon {
      font-size: 24px;
    }
    .contact-banner-item small {
      display: block;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .contact-banner-item strong {
      display: block;
      font-size: 13px;
      color: #38bdf8;
      font-weight: 700;
      margin-top: 2px;
      overflow-wrap: anywhere;
    }

    .footer-top-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr 1fr 1.2fr;
      gap: 40px;
      padding-bottom: 36px;
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
      padding: 8px 14px;
      border-radius: 10px;
      border: 1px solid rgba(16, 185, 129, 0.25);
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
      gap: 12px;
      align-items: center;
    }
    .footer-legal-links a {
      color: #94a3b8;
      text-decoration: none;
    }
    .footer-legal-links a:hover {
      color: #38bdf8;
    }

    @media (max-width: 1024px) {
      .contact-banner-strip {
        grid-template-columns: 1fr 1fr;
      }
      .footer-top-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (max-width: 640px) {
      .contact-banner-strip {
        grid-template-columns: 1fr;
      }
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
