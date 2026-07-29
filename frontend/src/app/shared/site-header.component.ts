import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header-container">
      <div class="nav-glass-bar">
        <a class="brand-link" routerLink="/">
          <div class="logo-wrapper">
            <img src="/assets/superoffer-logo.svg" alt="SuperOffer Logo" class="brand-logo" />
          </div>
          <span class="brand-name">Super<span class="highlight">Offer</span></span>
        </a>

        <button class="mobile-toggle" (click)="open = !open" [attr.aria-expanded]="open">
          <span class="hamburger-icon"></span>
        </button>

        <nav class="nav-links" [class.open]="open">
          <a routerLink="/student" routerLinkActive="active">Students</a>
          <a routerLink="/university" routerLinkActive="active">Universities</a>
          <a routerLink="/bank" routerLinkActive="active">Banks & Lenders</a>
          <a routerLink="/consultancy" routerLinkActive="active">Consultancies</a>
          <a routerLink="/admin" routerLinkActive="active" class="admin-link">SuperAdmin</a>
        </nav>

        <div class="header-cta-group">
          <a class="btn-ghost" [routerLink]="['/auth/login', context]">Log in</a>
          <a class="btn-glow" [routerLink]="['/auth/register', context]">Get Started</a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      position: sticky;
      top: 16px;
      z-index: 1000;
      padding: 0 24px;
      max-width: 1320px;
      margin: 0 auto 20px;
    }
    .nav-glass-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      padding: 0 24px;
      background: rgba(10, 16, 30, 0.75);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }
    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .logo-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(56, 189, 248, 0.15);
      display: grid;
      place-items: center;
      border: 1px solid rgba(56, 189, 248, 0.3);
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.2);
    }
    .brand-logo {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .brand-name .highlight {
      color: #38bdf8;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 32px;
    }
    .nav-links a {
      text-decoration: none;
      color: #94a3b8;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.2s ease;
      position: relative;
    }
    .nav-links a:hover {
      color: #38bdf8;
    }
    .nav-links a.active {
      color: #ffffff;
      font-weight: 700;
    }
    .nav-links a.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0;
      right: 0;
      height: 2px;
      background: #38bdf8;
      border-radius: 2px;
      box-shadow: 0 0 10px #38bdf8;
    }
    .admin-link {
      font-size: 12px !important;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
    }
    .header-cta-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .btn-ghost {
      text-decoration: none;
      color: #f8fafc;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 10px;
      transition: all 0.2s;
    }
    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .btn-glow {
      text-decoration: none;
      color: #060913;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%);
      font-size: 14px;
      font-weight: 700;
      padding: 10px 22px;
      border-radius: 12px;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.4);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-glow:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.7);
    }
    .mobile-toggle {
      display: none;
      background: transparent;
      border: none;
      color: #fff;
      padding: 8px;
    }
    .hamburger-icon {
      display: block;
      width: 22px;
      height: 2px;
      background: #fff;
      position: relative;
    }
    .hamburger-icon::before, .hamburger-icon::after {
      content: '';
      position: absolute;
      width: 22px;
      height: 2px;
      background: #fff;
      left: 0;
    }
    .hamburger-icon::before { top: -6px; }
    .hamburger-icon::after { bottom: -6px; }

    @media (max-width: 900px) {
      .mobile-toggle { display: block; }
      .nav-links {
        display: none;
        position: absolute;
        top: 80px;
        left: 24px;
        right: 24px;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 20px;
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
      }
      .nav-links.open { display: flex; }
      .header-cta-group { display: none; }
    }
  `]
})
export class SiteHeaderComponent {
  @Input() context: 'student' | 'university' | 'bank' | 'consultancy' = 'student';
  open = false;
}
