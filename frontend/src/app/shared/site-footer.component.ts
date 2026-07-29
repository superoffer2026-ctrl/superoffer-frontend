import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="single-color-footer">
      <div class="footer-inner">
        <div class="footer-brand-section">
          <a class="brand-link" routerLink="/">
            <img src="/assets/superoffer-logo.svg" alt="SuperOffer Logo" class="brand-logo" />
            <span class="brand-name">SuperOffer</span>
          </a>
          <p class="brand-desc">
            One verified marketplace for education opportunities, funding, and guidance.
          </p>
          <div class="contact-details-box">
            <p><strong>Student & Support:</strong> <a href="mailto:support@superoffer.net">support@superoffer.net</a></p>
            <p><strong>Partnerships Desk:</strong> <a href="mailto:admissions@superoffer.net">admissions@superoffer.net</a></p>
          </div>
        </div>

        <div class="footer-links-col">
          <h4>Portals</h4>
          <a routerLink="/student">Student</a>
          <a routerLink="/university">University</a>
          <a routerLink="/bank">Bank</a>
        </div>

        <div class="footer-links-col">
          <h4>Platform</h4>
          <a routerLink="/consultancy">Consultancy</a>
          <a href="#faq">FAQs</a>
          <a href="mailto:support@superoffer.net">Support</a>
          <a routerLink="/admin">SuperAdmin</a>
        </div>
      </div>

      <div class="footer-bottom-strip">
        <small>© 2026 SuperOffer (superoffer.net). Secure by design.</small>
      </div>
    </footer>
  `,
  styles: [`
    .single-color-footer {
      background: #091c28;
      color: #ffffff;
      padding: 60px 40px 30px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      width: 100%;
      box-sizing: border-box;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .footer-inner {
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
      width: 34px;
      height: 34px;
      object-fit: contain;
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .brand-desc {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.6;
      max-width: 440px;
      margin: 0 0 20px;
    }
    .contact-details-box {
      font-size: 13px;
      color: #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .contact-details-box p {
      margin: 0;
    }
    .contact-details-box a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 600;
    }
    .contact-details-box a:hover {
      text-decoration: underline;
    }
    .footer-links-col h4 {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 20px;
    }
    .footer-links-col {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .footer-links-col a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
    }
    .footer-links-col a:hover {
      color: #38bdf8;
    }
    .footer-bottom-strip {
      max-width: 1280px;
      margin: 24px auto 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #64748b;
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .footer-inner {
        grid-template-columns: 1fr;
        gap: 36px;
      }
      .single-color-footer {
        padding: 40px 24px 24px;
      }
    }
  `]
})
export class SiteFooterComponent {}
