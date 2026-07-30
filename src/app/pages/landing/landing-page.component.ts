import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { SiteFooterComponent } from '../../shared/site-footer.component';

// ─── Landing page data (config-driven, ready for future API integration) ───

const STATS = [
  { num: '12,400+', label: 'Student profiles created', teal: false },
  { num: '380+',    label: 'Verified institutions',   teal: true  },
  { num: '64',      label: 'Countries represented',   teal: false },
  { num: '97%',     label: 'Match satisfaction rate', teal: true  },
];

const HOW_STEPS = [
  {
    icon: '🎓',
    title: 'Build one rich profile',
    body: 'Add your academics, test scores, target countries, financial info, and documents — once. Your profile becomes your universal application across every institution.',
  },
  {
    icon: '🤖',
    title: 'AI ranks your best matches',
    body: 'Our matching engine scores your profile against every institution in the network. Universities, lenders, and consultants see ranked candidates — you stay in control of your data.',
  },
  {
    icon: '📬',
    title: 'Receive and compare real offers',
    body: 'Institutions send you concrete, negotiable offers — scholarships, loan rates, consulting packages. Compare them side by side and accept the right one at your pace.',
  },
];

const WHY_PILLARS = [
  {
    icon: '🔄',
    title: 'Reverse discovery',
    body: 'Stop chasing universities. Let verified institutions find you based on your actual profile and goals.',
  },
  {
    icon: '🧠',
    title: 'AI-powered matching',
    body: 'A Match Score (0–100) with transparent reasoning — no black-box algorithms, just clear relevance signals.',
  },
  {
    icon: '💸',
    title: 'Free for students',
    body: 'Always free for students. Institutions pay to access the pool — so your interests are never compromised.',
  },
  {
    icon: '✅',
    title: 'Verified institutions only',
    body: 'Every university, lender, and consultant is reviewed and approved by our admin team before they can reach you.',
  },
];

const FEATURES = [
  { icon: '📋', title: 'Single structured profile', body: 'One profile serves every institution. No repeated forms, no scattered documents.' },
  { icon: '🏫', title: 'University admissions', body: 'Receive scholarship offers, programme invitations, and admission terms directly in your inbox.' },
  { icon: '🏦', title: 'Education loan offers', body: 'Compare real loan rates from verified lenders with clear terms — interest, tenure, processing fees.' },
  { icon: '🧭', title: 'Consultancy guidance', body: 'Connect with expert advisers specialising in your target country, course, and visa process.' },
  { icon: '🤝', title: 'Built-in negotiation', body: 'Request better terms once per offer, directly within the platform. No awkward back-and-forth.' },
  { icon: '🔐', title: 'Secure by design', body: 'Your data is encrypted and never shared without your consent. You decide what to reveal and when.' },
];

const STUDENT_BENEFITS = [
  { title: 'One profile, all opportunities', desc: 'Build it once. Every institution in the network can discover you from that single source of truth.' },
  { title: 'Real, concrete offers', desc: 'No vague marketing — receive actual scholarship percentages, loan rates, and consulting packages.' },
  { title: 'Negotiate with confidence', desc: 'Request improved terms once per offer without leaving the platform or losing your position.' },
  { title: 'Compare side by side', desc: 'See all your university, loan, and consultancy offers in one organised workspace at any time.' },
  { title: 'Privacy by default', desc: 'You control who sees your profile. Institutions can only contact you through verified invitations.' },
];

const INSTITUTION_BENEFITS = [
  { title: 'Targeted student discovery', desc: 'Search a verified pool of structured profiles. AI rankings surface the highest-fit candidates first.' },
  { title: 'Reduce acquisition cost', desc: 'Replace broad marketing spend with precision outreach to students who already match your criteria.' },
  { title: 'Structured offer workflow', desc: 'Send, track, and negotiate offers through a consistent, auditable digital workflow.' },
  { title: 'Subscription-based access', desc: 'Choose Starter, Growth, or Enterprise — all with clear search and invitation quotas.' },
  { title: 'Verified-only network', desc: 'Every institution is reviewed before entering the marketplace, protecting quality on both sides.' },
];

const AI_MATCHES = [
  { initials: 'AR', name: 'Ananya Rajan', detail: 'Computer Science · Delhi', score: '94', fill: '94%' },
  { initials: 'MS', name: 'Mohammed Salim', detail: 'Business Analytics · Mumbai', score: '88', fill: '88%' },
  { initials: 'LP', name: 'Lucia Patel', detail: 'Data Science · Bangalore', score: '82', fill: '82%' },
];

const AI_BULLETS = [
  { icon: '📊', title: 'Transparent match scores', body: 'Every score comes with human-readable factors — "Strong academic fit", "Budget within scholarship range" — so you always know why.' },
  { icon: '🔁', title: 'Continuously improving', body: 'Institution actions (invite, skip) and student decisions (accept, reject) feed back into the engine, sharpening relevance over time.' },
  { icon: '⚖️', title: 'Fair and compliant', body: 'Our matching never uses protected attributes. Officers see why a score was given; students see why they were matched.' },
];

const TESTIMONIALS = [
  {
    quote: 'I built my profile in an afternoon. Three universities reached out within two weeks with scholarship offers I would never have found searching on my own.',
    name: 'Priya M.',
    role: 'MSc Computer Science student, UK',
    initials: 'PM',
    stars: '★★★★★',
  },
  {
    quote: 'SuperOffer cut our student acquisition cost by over 60%. The profile quality and AI ranking meant our admission team spent time on genuine candidates only.',
    name: 'Dr. James Okafor',
    role: 'Head of Admissions, European University',
    initials: 'JO',
    stars: '★★★★★',
  },
  {
    quote: 'Finding education finance used to be the most stressful part of studying abroad. On SuperOffer I compared three real loan offers with actual rates in one place.',
    name: 'Riya S.',
    role: 'MBA student, Canada',
    initials: 'RS',
    stars: '★★★★★',
  },
];

const FAQS = [
  {
    q: 'Is SuperOffer free for students?',
    a: 'Yes — completely free, forever. SuperOffer is free for students in every version of the product. Revenue comes entirely from institutional subscriptions, so your interests are never compromised.',
  },
  {
    q: 'How does the AI matching work?',
    a: 'Our engine scores your profile against institutional criteria (academic record, target country, budget, test scores) and returns a 0–100 match score with transparent factors. Institutions see ranked candidates; you see why an offer arrived.',
  },
  {
    q: 'Can I control who sees my profile?',
    a: 'Yes. Your profile is only visible to verified, approved institutions — not the public internet. You can pause visibility at any time from your settings page.',
  },
  {
    q: 'What types of offers can I receive?',
    a: 'Three categories: university admission offers (including scholarships and programme invitations), education loan offers (with real rates and terms), and study-abroad consultancy offers (SOP help, visa support, full-service packages).',
  },
  {
    q: 'Are all institutions verified?',
    a: 'Yes. Every university, lender, and consultancy must submit registration documents and pass a manual review by our admin team before they can send invitations.',
  },
  {
    q: 'Can I negotiate an offer?',
    a: 'Yes — once per invitation. You can request improved terms (higher scholarship, lower interest rate, reduced fee) directly in the platform. The institution sees your counter and can accept, decline, or maintain their original terms.',
  },
];

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />

    <div class="lp-root">

      <!-- ── HERO ─────────────────────────────────────────── -->
      <section class="lp-hero" id="hero">
        <div class="lp-hero-grid">

          <!-- Copy -->
          <div class="lp-hero-copy">
            <div class="lp-hero-badge lp-animate-fade-up">
              <span class="lp-hero-badge-dot"></span>
              AI-Powered Reverse Admissions Platform
            </div>

            <h1 class="lp-hero-h1 lp-animate-fade-up-d1">
              Universities discover <span class="lp-grad-text">you.</span><br>
              Not the other way around.
            </h1>

            <p class="lp-hero-sub lp-animate-fade-up-d2">
              Build one powerful student profile. Receive personalised offers from universities, education lenders, and expert consultants — all in one place, completely free.
            </p>

            <div class="lp-hero-cta-row lp-animate-fade-up-d3">
              <a class="lp-btn-hero-primary" routerLink="/auth/register/student">
                Create your free profile →
              </a>
              <a class="lp-btn-hero-secondary" routerLink="/students">
                See how it works
              </a>
            </div>

            <div class="lp-hero-trust lp-animate-fade-up-d4">
              <span class="lp-hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#6ad9c0" fill-opacity=".2"/><path d="M4 7l2 2 4-4" stroke="#6ad9c0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Always free for students
              </span>
              <span class="lp-hero-trust-sep"></span>
              <span class="lp-hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#6ad9c0" fill-opacity=".2"/><path d="M4 7l2 2 4-4" stroke="#6ad9c0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Verified institutions only
              </span>
              <span class="lp-hero-trust-sep"></span>
              <span class="lp-hero-trust-item">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#6ad9c0" fill-opacity=".2"/><path d="M4 7l2 2 4-4" stroke="#6ad9c0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Private by default
              </span>
            </div>
          </div>

          <!-- Visual -->
          <div class="lp-hero-visual lp-animate-fade-up-d2">
            <div class="lp-orbit-ring lp-orbit-ring-1"></div>
            <div class="lp-orbit-ring lp-orbit-ring-2"></div>
            <div class="lp-orbit-ring lp-orbit-ring-3"></div>

            <div class="lp-hero-center">
              <span class="lp-hero-center-mark">S</span>
              <span class="lp-hero-center-label">SuperOffer</span>
            </div>

            <div class="lp-orbit-card lp-oc-student">
              <div class="lp-orbit-card-icon">🎓</div>
              <div class="lp-orbit-card-text">
                <b>12,400+ Students</b>
                <span>Active profiles</span>
              </div>
            </div>

            <div class="lp-orbit-card lp-oc-uni">
              <div class="lp-orbit-card-icon">🏫</div>
              <div class="lp-orbit-card-text">
                <b>University Offer</b>
                <span>40% Scholarship</span>
              </div>
            </div>

            <div class="lp-orbit-card lp-oc-loan">
              <div class="lp-orbit-card-icon">🏦</div>
              <div class="lp-orbit-card-text">
                <b>Loan Offer</b>
                <span>9.2% · 0 fee</span>
              </div>
            </div>

            <div class="lp-orbit-card lp-oc-ai">
              <div class="lp-orbit-card-icon">🤖</div>
              <div class="lp-orbit-card-text">
                <b>AI Match Score</b>
                <span>94 / 100</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ── STATS STRIP ────────────────────────────────────── -->
      <div class="lp-stats-strip">
        <div *ngFor="let s of stats">
          <strong class="lp-stats-num" [class.teal]="s.teal">{{ s.num }}</strong>
          <span class="lp-stats-label">{{ s.label }}</span>
        </div>
      </div>

      <!-- ── HOW IT WORKS ────────────────────────────────────── -->
      <div class="lp-section-bg-soft">
        <div class="lp-how-inner" id="how-it-works">
          <span class="lp-kicker">How SuperOffer works</span>
          <h2 class="lp-h2">Three steps to your best offer.</h2>
          <p class="lp-section-intro">The traditional admissions process is broken. SuperOffer inverts it — putting students at the centre and letting institutions compete for the right talent.</p>

          <div class="lp-how-grid">
            <div class="lp-how-card" *ngFor="let step of howSteps; let i = index">
              <span class="lp-how-step-num">0{{ i + 1 }}</span>
              <div class="lp-how-icon">{{ step.icon }}</div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.body }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── WHY SUPEROFFER ──────────────────────────────────── -->
      <div class="lp-why-band">
        <div class="lp-why-inner">
          <span class="lp-kicker light">Why SuperOffer</span>
          <h2 class="lp-h2 light">Clarity creates better outcomes.</h2>
          <p class="lp-section-intro light">Every design decision on SuperOffer serves one goal: more signal, less noise, for everyone involved.</p>
          <div class="lp-why-grid">
            <div class="lp-why-item" *ngFor="let p of whyPillars">
              <div class="lp-why-item-icon">{{ p.icon }}</div>
              <h3>{{ p.title }}</h3>
              <p>{{ p.body }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FEATURES ───────────────────────────────────────── -->
      <div class="lp-features-inner" id="features">
        <span class="lp-kicker">Platform features</span>
        <h2 class="lp-h2">Everything in one place.</h2>
        <p class="lp-section-intro">SuperOffer replaces the fragmented world of university searches, loan comparison sites, and consultant directories with one integrated, AI-driven workspace.</p>
        <div class="lp-features-grid">
          <div class="lp-feature-card" *ngFor="let f of features">
            <div class="lp-feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.body }}</p>
          </div>
        </div>
      </div>

      <!-- ── STUDENT BENEFITS ───────────────────────────────── -->
      <div class="lp-section-bg-soft">
        <div class="lp-benefits-section">
          <div class="lp-benefits-inner">
            <span class="lp-kicker">For students</span>
            <h2 class="lp-h2">Your education journey, simplified.</h2>

            <div class="lp-benefits-layout">
              <!-- Visual card -->
              <div class="lp-benefit-visual">
                <span class="lp-bv-label">Student Dashboard</span>

                <div class="lp-bv-profile">
                  <div class="lp-bv-avatar">A</div>
                  <div class="lp-bv-profile-text">
                    <b>Ananya Rajan</b>
                    <span>Computer Science · Targeting UK & Canada</span>
                  </div>
                </div>

                <div class="lp-bv-score-bar">
                  <div class="lp-bv-score-bar-label"><span>Profile completion</span><span>84%</span></div>
                  <div class="lp-bv-score-track"><div class="lp-bv-score-fill" style="width:84%"></div></div>
                </div>

                <div class="lp-bv-offer-item">
                  <div class="lp-bv-offer-dot"></div>
                  <div class="lp-bv-offer-text">
                    <b>Oxford Brookes University</b>
                    <span>40% Tuition Scholarship · MSc CS</span>
                  </div>
                  <span class="lp-bv-offer-badge green">New offer</span>
                </div>

                <div class="lp-bv-offer-item">
                  <div class="lp-bv-offer-dot" style="background:#2467e8"></div>
                  <div class="lp-bv-offer-text">
                    <b>Education Finance Ltd</b>
                    <span>9.2% interest · Zero processing fee</span>
                  </div>
                  <span class="lp-bv-offer-badge blue">Loan offer</span>
                </div>

                <div class="lp-bv-offer-item">
                  <div class="lp-bv-offer-dot" style="background:#f5a623"></div>
                  <div class="lp-bv-offer-text">
                    <b>Global Study Advisors</b>
                    <span>Full-service UK application package</span>
                  </div>
                  <span class="lp-bv-offer-badge amber">Consultancy</span>
                </div>
              </div>

              <!-- Benefits list -->
              <div>
                <ul class="lp-benefits-list">
                  <li *ngFor="let b of studentBenefits">
                    <div class="lp-benefit-check">✓</div>
                    <div>
                      <b>{{ b.title }}</b>
                      <p>{{ b.desc }}</p>
                    </div>
                  </li>
                </ul>
                <div style="margin-top:32px">
                  <a class="lp-btn-hero-primary" routerLink="/auth/register/student" style="display:inline-flex">
                    Create free profile →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── INSTITUTION BENEFITS ───────────────────────────── -->
      <div class="lp-benefits-section">
        <div class="lp-benefits-inner">
          <span class="lp-kicker">For institutions</span>
          <h2 class="lp-h2">Find the right students, faster.</h2>

          <div class="lp-benefits-layout reverse">
            <!-- Benefits list -->
            <div>
              <ul class="lp-benefits-list">
                <li *ngFor="let b of institutionBenefits">
                  <div class="lp-benefit-check">✓</div>
                  <div>
                    <b>{{ b.title }}</b>
                    <p>{{ b.desc }}</p>
                  </div>
                </li>
              </ul>
              <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">
                <a class="lp-btn-hero-primary" routerLink="/university" style="display:inline-flex;background:linear-gradient(135deg,#0d2d42,#14527e);box-shadow:0 8px 28px rgba(13,45,66,.4)">
                  University portal →
                </a>
                <a class="lp-btn-hero-secondary" routerLink="/bank" style="display:inline-flex;background:rgba(13,45,66,.04);border-color:#d0dde3;color:#3a4e57">
                  Lender portal →
                </a>
              </div>
            </div>

            <!-- Visual card -->
            <div class="lp-benefit-visual" style="background:linear-gradient(160deg,#f0f6ff 0%,#e8f2fa 100%)">
              <span class="lp-bv-label" style="color:#2467e8;background:rgba(36,103,232,.08)">Admissions Workspace</span>

              <div class="lp-bv-profile" style="border-color:#d0dde3">
                <div class="lp-bv-avatar" style="background:linear-gradient(135deg,#1a3c5e,#2467e8)">🏫</div>
                <div class="lp-bv-profile-text">
                  <b>Oxford Brookes University</b>
                  <span>Computer Science · Intake 2025</span>
                </div>
              </div>

              <div style="font-size:12px;font-weight:700;color:#5a6d76;margin-top:4px">AI-ranked candidate matches</div>

              <div *ngFor="let m of aiMatches" class="lp-bv-offer-item">
                <div class="lp-bv-avatar" style="width:36px;height:36px;font-size:14px;background:linear-gradient(135deg,#0d2d42,#14527e)">{{ m.initials }}</div>
                <div class="lp-bv-offer-text">
                  <b>{{ m.name }}</b>
                  <span>{{ m.detail }}</span>
                </div>
                <span class="lp-bv-offer-badge green">{{ m.score }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── AI MATCHING ────────────────────────────────────── -->
      <section class="lp-ai-section" id="ai-matching">
        <div class="lp-ai-inner">
          <span class="lp-kicker light">AI Matching Engine</span>
          <h2 class="lp-h2 light">Match scores you can explain.</h2>
          <p class="lp-section-intro light">SuperOffer's AI ranks students for institutions and ranks incoming offers for students — but never makes decisions. Every score comes with a clear reason.</p>

          <div class="lp-ai-layout">
            <!-- Visual -->
            <div class="lp-ai-visual">
              <div class="lp-ai-header">
                <div class="lp-ai-header-dot"></div>
                <span class="lp-ai-header-label">LIVE MATCH QUEUE · Oxford Brookes — MSc CS</span>
              </div>

              <div *ngFor="let m of aiMatches" class="lp-ai-match-item">
                <div class="lp-ai-match-avatar">{{ m.initials }}</div>
                <div class="lp-ai-match-info">
                  <b>{{ m.name }}</b>
                  <span>{{ m.detail }}</span>
                </div>
                <div class="lp-ai-match-score-wrap">
                  <span class="lp-ai-match-score">{{ m.score }}</span>
                  <div class="lp-ai-mini-bar">
                    <div class="lp-ai-mini-fill" [style.width]="m.fill"></div>
                  </div>
                </div>
              </div>

              <div class="lp-ai-tags">
                <span class="lp-ai-tag">Strong academic fit</span>
                <span class="lp-ai-tag">Budget in scholarship range</span>
                <span class="lp-ai-tag">Target country match</span>
                <span class="lp-ai-tag">IELTS eligible</span>
              </div>
            </div>

            <!-- Copy -->
            <div class="lp-ai-copy">
              <ul class="lp-ai-bullets">
                <li *ngFor="let b of aiBullets">
                  <div class="lp-ai-bullet-icon">{{ b.icon }}</div>
                  <div>
                    <b>{{ b.title }}</b>
                    <p>{{ b.body }}</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ── TESTIMONIALS ───────────────────────────────────── -->
      <div class="lp-section-bg-soft">
        <div class="lp-testimonials-inner">
          <span class="lp-kicker">What people say</span>
          <h2 class="lp-h2">Real outcomes from real users.</h2>
          <p class="lp-section-intro">SuperOffer connects students with the right opportunities and institutions with the right talent.</p>

          <div class="lp-testimonials-grid">
            <div class="lp-tcard" *ngFor="let t of testimonials">
              <div class="lp-tcard-quote">"</div>
              <p class="lp-tcard-text">{{ t.quote }}</p>
              <div class="lp-tcard-author">
                <div class="lp-tcard-avatar">{{ t.initials }}</div>
                <div class="lp-tcard-author-info">
                  <b>{{ t.name }}</b>
                  <span>{{ t.role }}</span>
                </div>
                <span class="lp-tcard-stars">{{ t.stars }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FAQ ───────────────────────────────────────────── -->
      <div id="faq">
        <div class="lp-faq-inner">
          <span class="lp-kicker">FAQ</span>
          <h2 class="lp-h2">Common questions.</h2>
          <p class="lp-section-intro" style="margin-bottom:0">Everything you need to know before getting started.</p>

          <div class="lp-faq-list">
            <details class="lp-faq-item" *ngFor="let f of faqs">
              <summary>
                {{ f.q }}
                <span class="lp-faq-chevron">▾</span>
              </summary>
              <p class="lp-faq-answer">{{ f.a }}</p>
            </details>
          </div>
        </div>
      </div>

      <!-- ── FINAL CTA ──────────────────────────────────────── -->
      <section class="lp-cta-band">
        <div class="lp-cta-inner">
          <span class="lp-kicker light">Start today — it's free</span>
          <h2 class="lp-h2 light">Ready to let the right opportunities find you?</h2>
          <p class="lp-section-intro light">
            Join thousands of students who built one profile and received personalised university, loan, and consultancy offers — without hunting, repeating themselves, or paying a cent.
          </p>

          <div class="lp-cta-row">
            <a class="lp-btn-hero-primary" routerLink="/auth/register/student">
              Create your free profile →
            </a>
            <a class="lp-btn-hero-secondary" routerLink="/auth/login/student">
              Already have an account
            </a>
          </div>

          <div class="lp-inst-tabs">
            <a class="lp-inst-tab" routerLink="/university">For universities →</a>
            <a class="lp-inst-tab" routerLink="/bank">For lenders →</a>
            <a class="lp-inst-tab" routerLink="/consultancy">For consultancies →</a>
          </div>
        </div>
      </section>

    </div><!-- /lp-root -->

    <app-site-footer />
  `
})
export class LandingPageComponent {
  stats = STATS;
  howSteps = HOW_STEPS;
  whyPillars = WHY_PILLARS;
  features = FEATURES;
  studentBenefits = STUDENT_BENEFITS;
  institutionBenefits = INSTITUTION_BENEFITS;
  aiMatches = AI_MATCHES;
  aiBullets = AI_BULLETS;
  testimonials = TESTIMONIALS;
  faqs = FAQS;
}
