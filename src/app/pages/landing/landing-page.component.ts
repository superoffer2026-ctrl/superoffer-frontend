import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="new-home">
      <section class="guidance-hero">
        <div class="guidance-copy">
          <span class="home-kicker">Study abroad opportunities, in one place</span>
          <h1>Your global education journey starts with one profile.</h1>
          <p>Create your student profile once. Discover university, education-loan, and consultancy offers matched to your goals.</p>
          <div class="cta-row centered-actions">
            <a class="button green large" routerLink="/auth/register/student">Create student profile</a>
            <a class="button home-login large" routerLink="/auth/login/student">Log in</a>
          </div>
          <div class="hero-proof">
            <span><strong>One</strong> reusable profile</span>
            <span><strong>3</strong> offer categories</span>
            <span><strong>100%</strong> student controlled</span>
          </div>
        </div>
      </section>

      <section class="interest-section">
        <div class="section-heading">
          <span class="home-kicker">Start with what you need</span>
          <h2>Everything around your study-abroad decision.</h2>
          <p>Move from uncertainty to a clear next step without repeating the same information across different services.</p>
        </div>
        <div class="interest-grid">
          <a class="interest-card university-card" routerLink="/students">
            <span class="card-number">01</span><small>ADMISSIONS</small>
            <h3>University offers</h3>
            <p>Explore relevant programmes, scholarships, intakes, and admission opportunities.</p>
            <b>Explore student services →</b>
          </a>
          <a class="interest-card loan-card" routerLink="/bank">
            <span class="card-number">02</span><small>EDUCATION FINANCE</small>
            <h3>Loan offers</h3>
            <p>Review clear funding options built around your education plans and eligibility.</p>
            <b>Understand funding →</b>
          </a>
          <a class="interest-card guidance-card" routerLink="/consultancy">
            <span class="card-number">03</span><small>EXPERT SUPPORT</small>
            <h3>Consultancy guidance</h3>
            <p>Connect with verified advisers for applications, documents, visas, and next steps.</p>
            <b>Find guidance →</b>
          </a>
        </div>
      </section>

      <section class="home-story">
        <div class="story-copy">
          <span class="home-kicker">A simpler model</span>
          <h2>Stop rebuilding your story for every opportunity.</h2>
          <p>SuperOffer keeps your academics, interests, test scores, achievements, and documents together. You decide what to complete and when to share it.</p>
          <a routerLink="/auth/register/student">Build your profile →</a>
        </div>
        <ol class="journey-list">
          <li><span>01</span><div><strong>Create one student profile</strong><p>Add the information that universities genuinely use to understand your background and goals.</p></div></li>
          <li><span>02</span><div><strong>Receive relevant opportunities</strong><p>View university, bank, and consultancy offers in one organised workspace.</p></div></li>
          <li><span>03</span><div><strong>Compare and decide confidently</strong><p>Review terms, ask questions, upload missing documents, and choose your next step.</p></div></li>
        </ol>
      </section>

      <section class="home-final-cta">
        <div><span class="home-kicker">Your profile. Your choice.</span><h2>Ready to bring the right offers closer?</h2></div>
        <a class="button cream large" routerLink="/auth/register/student">Create your free profile →</a>
      </section>
    </main>
    <app-site-footer />
  `
})
export class LandingPageComponent {}
