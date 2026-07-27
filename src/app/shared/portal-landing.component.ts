import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from './site-header.component';
import { SiteFooterComponent } from './site-footer.component';

export interface PortalContent {
  key: 'student' | 'university' | 'bank' | 'consultancy';
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
    <main>
      <section class="portal-hero">
        <div class="hero-copy">
          <span class="eyebrow">{{content.eyebrow}}</span>
          <h1>{{content.title}}</h1><p>{{content.intro}}</p>
          <div class="cta-row">
            <a class="button dark large" [routerLink]="['/auth/register', content.key]">{{content.primary}}</a>
            <a class="button ghost large" href="#features">{{content.secondary}}</a>
          </div>
        </div>
        <div class="dashboard-preview" aria-label="Portal dashboard preview">
          <div class="preview-top"><span></span><span></span><span></span><b>{{content.key | titlecase}} workspace</b></div>
          <div class="preview-body"><aside><i></i><i></i><i></i><i></i></aside>
            <div class="preview-main"><div class="preview-heading"></div><div class="preview-stats"><i></i><i></i><i></i></div><div class="preview-chart"></div></div>
          </div>
        </div>
      </section>
      <section class="stat-row"><div *ngFor="let stat of content.stats"><strong>{{stat.value}}</strong><span>{{stat.label}}</span></div></section>
      <section class="content-section" id="features"><span class="eyebrow">Purpose-built tools</span><h2>{{content.featuresTitle}}</h2>
        <div class="feature-grid"><article *ngFor="let item of content.features"><span class="feature-icon">{{item.icon}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p><a href="#process">Learn more →</a></article></div>
      </section>
      <section class="split-section" id="process" *ngIf="content.process?.length">
        <div><span class="eyebrow">Clear from day one</span><h2>A simple path to getting started.</h2><p>Every step is visible, secure, and designed around the permissions defined for your role.</p></div>
        <ol><li *ngFor="let step of content.process; let i=index"><span>0{{i+1}}</span><b>{{step}}</b></li></ol>
      </section>
      <section class="requirements" *ngIf="content.requirements?.length"><div><span class="eyebrow">Prepare to register</span><h2>What you will need.</h2></div>
        <div class="requirement-grid"><span *ngFor="let item of content.requirements">✓ {{item}}</span></div>
      </section>
      <section class="faq-section" id="faq"><span class="eyebrow">Frequently asked questions</span><h2>Answers before you begin.</h2>
        <details *ngFor="let faq of content.faqs"><summary>{{faq.q}}<span>+</span></summary><p>{{faq.a}}</p></details>
      </section>
      <section class="page-cta"><span class="eyebrow light">Ready when you are</span><h2>{{content.primary}}</h2>
        <a class="button white large" [routerLink]="['/auth/register', content.key]">Continue securely →</a></section>
    </main>
    <app-site-footer />
  `
})
export class PortalLandingComponent {
  @Input({ required: true }) content!: PortalContent;
}
