import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styles: [`
    .footer-root {
      background: #071f2e;
      color: #fff;
      padding: 72px clamp(24px, 7vw, 100px) 0;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.2fr;
      gap: 56px;
      padding-bottom: 56px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .footer-brand-col .footer-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: "Libre Franklin", sans-serif;
      font-size: 20px;
      font-weight: 900;
      color: #fff;
      text-decoration: none;
      margin-bottom: 18px;
    }
    .footer-brand-mark {
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 9px;
      background: linear-gradient(135deg, #14527e 0%, #0ea16c 100%);
      color: #fff;
      font-weight: 900;
      font-size: 15px;
    }
    .footer-tagline {
      color: #7fa8bc;
      font-size: 14px;
      line-height: 1.7;
      max-width: 290px;
      margin: 0 0 28px;
    }
    .footer-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 8px 14px;
      border-radius: 99px;
      border: 1px solid rgba(255,255,255,0.12);
      font-size: 12px;
      font-weight: 700;
      color: #6ad9c0;
    }
    .footer-badge span { width: 7px; height: 7px; border-radius: 50%; background: #6ad9c0; display: block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .footer-col h4 {
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #5b8093;
      margin: 0 0 18px;
    }
    .footer-col nav {
      display: flex;
      flex-direction: column;
      gap: 11px;
    }
    .footer-col nav a {
      font-size: 14px;
      font-weight: 500;
      color: #a8c4d1;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-col nav a:hover { color: #fff; }

    .footer-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 0;
    }
    .footer-copy {
      font-size: 13px;
      color: #5b8093;
    }
    .footer-legal {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .footer-legal a {
      font-size: 12px;
      color: #5b8093;
      text-decoration: none;
      transition: color 0.15s;
    }
    .footer-legal a:hover { color: #a8c4d1; }

    @media (max-width: 900px) {
      .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
      .footer-brand-col { grid-column: 1 / -1; }
    }
    @media (max-width: 520px) {
      .footer-root { padding-top: 52px; }
      .footer-grid { grid-template-columns: 1fr; gap: 30px; }
      .footer-bottom { flex-direction: column; gap: 14px; align-items: flex-start; }
    }
  `],
  template: `
    <footer class="footer-root">
      <div class="footer-grid">
        <!-- Brand column -->
        <div class="footer-brand-col">
          <a class="footer-brand" routerLink="/">
            <span class="footer-brand-mark">S</span>
            SuperOffer
          </a>
          <p class="footer-tagline">
            The AI-powered reverse admissions platform where universities discover talented students — not the other way around.
          </p>
          <span class="footer-badge"><span></span> Live on superoffer.net</span>
        </div>

        <!-- Portals -->
        <div class="footer-col">
          <h4>Students</h4>
          <nav>
            <a routerLink="/students">How it works</a>
            <a routerLink="/auth/register/student">Create free profile</a>
            <a routerLink="/auth/login/student">Sign in</a>
            <a routerLink="/student/dashboard">Dashboard</a>
          </nav>
        </div>

        <!-- Institutions -->
        <div class="footer-col">
          <h4>Institutions</h4>
          <nav>
            <a routerLink="/university">Universities</a>
            <a routerLink="/bank">Education Lenders</a>
            <a routerLink="/consultancy">Consultancies</a>
            <a routerLink="/auth/register/university">Register institution</a>
          </nav>
        </div>

        <!-- Support -->
        <div class="footer-col">
          <h4>Platform</h4>
          <nav>
            <a href="mailto:support@superoffer.net">Support</a>
            <a href="mailto:partners@superoffer.net">Partner with us</a>
            <a href="#faq">FAQ</a>
            <a href="mailto:privacy@superoffer.net">Privacy</a>
          </nav>
        </div>
      </div>

      <div class="footer-bottom">
        <span class="footer-copy">© 2026 SuperOffer. All rights reserved.</span>
        <div class="footer-legal">
          <a href="mailto:privacy@superoffer.net">Privacy Policy</a>
          <a href="mailto:legal@superoffer.net">Terms of Service</a>
          <a href="mailto:support@superoffer.net">Contact</a>
        </div>
      </div>
    </footer>
  `
})
export class SiteFooterComponent {}
