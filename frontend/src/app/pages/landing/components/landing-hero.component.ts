import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="hero-content">
      <div class="pill-tag animate-pulse-badge">
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
        <a routerLink="/auth/register/student" class="btn-primary glow-btn">
          Build Your Profile Free <span class="arrow-bounce">→</span>
        </a>
        <a routerLink="/university" class="btn-secondary hover-lift">
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
  `,
  styles: [`
    :host { display: block; }
    .hero-content {
      max-width: 660px;
    }
    .pill-tag {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 99px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      margin-bottom: 24px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38bdf8;
      box-shadow: 0 0 12px #38bdf8;
      animation: pulseGlow 2s infinite ease-in-out;
    }
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.5; }
    }
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: clamp(42px, 4.5vw, 64px);
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0 0 24px;
    }
    .gradient-text {
      background: linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #818cf8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-subtitle {
      font-size: 18px;
      line-height: 1.65;
      color: #94a3b8;
      margin-bottom: 36px;
    }
    .hero-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      margin-bottom: 40px;
    }
    .glow-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 16px 32px;
      border-radius: 14px;
      background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%);
      color: #ffffff;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .glow-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 40px rgba(56, 189, 248, 0.6);
    }
    .arrow-bounce {
      display: inline-block;
      transition: transform 0.2s ease;
    }
    .glow-btn:hover .arrow-bounce {
      transform: translateX(4px);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      padding: 16px 32px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #f8fafc;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-3px);
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
  `]
})
export class LandingHeroComponent {}
