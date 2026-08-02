import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';
import { SiteFooterComponent } from './site-footer.component';

export interface PortalContent {
  key: 'student' | 'organization' | 'consultancy';
  eyebrow: string; title: string; intro: string;
  primary: string; secondary: string;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { icon: string; title: string; text: string }[];
  process?: string[];
  requirements?: string[];
  faqs: { q: string; a: string }[];
}

@Component({
  selector: 'app-portal-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header [context]="content.key" />
    <main class="sector-home" [class]="'sector-home ' + content.key + '-home'">
      <section class="sector-hero">
        <div class="hero-copy">
          <span class="eyebrow">{{content.eyebrow}}</span>
          <h1>{{content.title}}</h1><p>{{content.intro}}</p>
          <div class="cta-row">
            <a class="button green large" [routerLink]="['/auth/register', content.key]">{{content.primary}}</a>
            <a class="sector-text-link" href="#features">{{content.secondary}} →</a>
          </div>
        </div>
        <div class="sector-visual" aria-label="SuperOffer opportunity workspace">
          <span class="visual-label">{{content.key | titlecase}} workspace</span>
          <div class="visual-profile"><b>{{content.key.charAt(0) | uppercase}}</b><div><strong>Profile ready</strong><small>Your opportunities, organised</small></div></div>
          <div class="visual-offer"><small>NEW OPPORTUNITY</small><strong>Relevant offer received</strong><span>View details →</span></div>
          <div class="visual-note">Everything you need, in one clear place.</div>
        </div>
      </section>
      <section class="sector-stats"><div *ngFor="let stat of content.stats"><strong>{{stat.value}}</strong><span>{{stat.label}}</span></div></section>
      <section class="sector-features" id="features"><div class="sector-section-heading"><span class="eyebrow">Built around your needs</span><h2>{{content.featuresTitle}}</h2></div>
        <div class="sector-feature-grid"><article *ngFor="let item of content.features; let i=index"><span class="feature-count">0{{i+1}}</span><span class="feature-icon">{{item.icon}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p></article></div>
      </section>
      <section class="sector-process" id="process" *ngIf="content.process?.length">
        <div><span class="eyebrow">Clear from day one</span><h2>A simple path to getting started.</h2><p>Every step is visible, secure, and designed around the permissions defined for your role.</p></div>
        <ol><li *ngFor="let step of content.process; let i=index"><span>0{{i+1}}</span><b>{{step}}</b></li></ol>
      </section>
      <section class="requirements" *ngIf="content.requirements?.length"><div><span class="eyebrow">Prepare to register</span><h2>What you will need.</h2></div>
        <div class="requirement-grid"><span *ngFor="let item of content.requirements">✓ {{item}}</span></div>
      </section>
      <section class="sector-faq" id="faq"><span class="eyebrow">Frequently asked questions</span><h2>Answers before you begin.</h2>
        <details *ngFor="let faq of content.faqs"><summary>{{faq.q}}<span>+</span></summary><p>{{faq.a}}</p></details>
      </section>
      <section class="sector-cta"><div><span class="eyebrow light">Ready when you are</span><h2>{{content.primary}}</h2></div>
        <a class="button cream large" [routerLink]="['/auth/register', content.key]">Continue securely →</a></section>
    </main>
    <app-site-footer />
  `
})
export class PortalLandingComponent {
  @Input({ required: true }) content!: PortalContent;
}
