import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [`
    :host { display: block; }

    .site-nav {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 72px;
      padding: 0 clamp(20px, 5vw, 80px);
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(220,230,235,0.7);
      transition: box-shadow 0.3s ease, background 0.3s ease;
    }
    .site-nav.scrolled {
      box-shadow: 0 4px 32px rgba(16, 47, 69, 0.08);
      background: rgba(255,255,255,0.95);
    }

    /* Brand */
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: "Libre Franklin", sans-serif;
      font-size: 21px;
      font-weight: 900;
      color: #0d2d42;
      text-decoration: none;
      flex-shrink: 0;
    }
    .nav-brand-mark {
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border-radius: 10px;
      background: linear-gradient(135deg, #0d2d42 0%, #14527e 100%);
      color: #6ad9c0;
      font-weight: 900;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(13,45,66,0.2);
      transition: transform 0.2s ease;
    }
    .nav-brand:hover .nav-brand-mark { transform: scale(1.08) rotate(-3deg); }

    /* Desktop nav links */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 0 auto;
    }
    .nav-links a {
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      color: #445560;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .nav-links a:hover { background: #f0f5f7; color: #0d2d42; }
    .nav-links a.active { color: #087a50; background: #eaf5f0; }

    /* Nav actions */
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .btn-ghost {
      padding: 9px 18px;
      border-radius: 9px;
      border: 1px solid #cfd9df;
      background: #fff;
      font-size: 13px;
      font-weight: 700;
      color: #3a4e57;
      text-decoration: none;
      transition: border-color 0.15s, box-shadow 0.15s;
      cursor: pointer;
    }
    .btn-ghost:hover { border-color: #9fc1d5; box-shadow: 0 2px 8px rgba(16,47,69,0.08); }

    .btn-primary {
      padding: 9px 20px;
      border-radius: 9px;
      border: 0;
      background: linear-gradient(135deg, #087a50 0%, #0ea16c 100%);
      color: #fff;
      font-size: 13px;
      font-weight: 800;
      text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: pointer;
      box-shadow: 0 3px 12px rgba(8, 122, 80, 0.25);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(8, 122, 80, 0.35); }

    /* Mobile hamburger */
    .hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: 1px solid #dce5ea;
      border-radius: 8px;
      padding: 9px 11px;
      cursor: pointer;
      margin-left: auto;
      transition: background 0.15s;
    }
    .hamburger:hover { background: #f0f5f7; }
    .hamburger span {
      display: block;
      width: 18px;
      height: 2px;
      background: #3a4e57;
      border-radius: 2px;
      transition: transform 0.25s, opacity 0.25s;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* Mobile drawer */
    .mobile-drawer {
      display: none;
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: #fff;
      border-bottom: 1px solid #dce5ea;
      padding: 16px 20px 24px;
      z-index: 99;
      box-shadow: 0 12px 40px rgba(16,47,69,0.1);
      flex-direction: column;
      gap: 4px;
      animation: drawerSlide 0.2s ease;
    }
    .mobile-drawer.open { display: flex; }
    .mobile-drawer a {
      padding: 13px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      color: #2a3f4b;
      text-decoration: none;
      transition: background 0.15s;
    }
    .mobile-drawer a:hover, .mobile-drawer a.active { background: #eaf5f0; color: #087a50; }
    .mobile-drawer-divider { height: 1px; background: #dce5ea; margin: 10px 0; }
    .mobile-drawer-actions { display: flex; gap: 10px; padding: 4px 16px 0; }
    .mobile-drawer-actions a { flex: 1; text-align: center; }

    @keyframes drawerSlide {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 820px) {
      .nav-links { display: none; }
      .nav-actions { display: none; }
      .hamburger { display: flex; }
    }
  `],
  template: `
    <nav class="site-nav" [class.scrolled]="scrolled">
      <a class="nav-brand" routerLink="/">
        <span class="nav-brand-mark">S</span>
        SuperOffer
      </a>

      <div class="nav-links">
        <a routerLink="/students" routerLinkActive="active">Students</a>
        <a routerLink="/university" routerLinkActive="active">Universities</a>
        <a routerLink="/bank" routerLinkActive="active">Education Loans</a>
        <a routerLink="/consultancy" routerLinkActive="active">Consultancy</a>
      </div>

      <div class="nav-actions">
        <a class="btn-ghost" [routerLink]="['/auth/login', context]">Log in</a>
        <a class="btn-primary" [routerLink]="['/auth/register', context]">Get started free</a>
      </div>

      <button class="hamburger" [class.open]="menuOpen" (click)="menuOpen = !menuOpen" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
    </nav>

    <div class="mobile-drawer" [class.open]="menuOpen">
      <a routerLink="/students" routerLinkActive="active" (click)="menuOpen = false">Students</a>
      <a routerLink="/university" routerLinkActive="active" (click)="menuOpen = false">Universities</a>
      <a routerLink="/bank" routerLinkActive="active" (click)="menuOpen = false">Education Loans</a>
      <a routerLink="/consultancy" routerLinkActive="active" (click)="menuOpen = false">Consultancy</a>
      <div class="mobile-drawer-divider"></div>
      <div class="mobile-drawer-actions">
        <a class="btn-ghost" [routerLink]="['/auth/login', context]" (click)="menuOpen = false">Log in</a>
        <a class="btn-primary" [routerLink]="['/auth/register', context]" (click)="menuOpen = false">Get started</a>
      </div>
    </div>
  `
})
export class SiteHeaderComponent {
  @Input() context: 'student' | 'university' | 'bank' | 'consultancy' = 'student';
  menuOpen = false;
  scrolled = false;

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 20;
  }
}
