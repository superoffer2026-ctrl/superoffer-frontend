import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { SiteHeaderComponent } from '../../shared/site-header.component';
import { RevealOnScrollDirective } from './reveal-on-scroll.directive';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent, RevealOnScrollDirective],
  styleUrl: './landing-page.component.css',
  template: `
    <app-site-header />
    <main class="landing">
      <section class="hero">
        <div class="hero-copy">
          <h1 class="hero-enter">The right education opportunities,<br><em>in one place.</em></h1>
          <p class="hero-enter d1">Create one verified profile and discover university admissions, education finance, and expert guidance matched around your plans.</p>
          <div class="hero-actions hero-enter d2">
            <a class="btn dark" routerLink="/auth/register/student">Create your free profile <b>→</b></a>
          </div>
          <div class="proof hero-enter d3"><span>✓ Free for students</span><span>✓ Private by default</span><span>✓ Verified organisations</span></div>
        </div>

        <div class="scroll-hint"><i></i> Scroll to explore</div>
      </section>

      <section class="campus-story" id="experience" soReveal>
        <div class="campus-image"><img src="/students-campus.png" alt="International students walking together toward their university campus"></div>
        <div class="campus-copy">
          <span class="pill"><i></i> From possibility to campus</span>
          <h2>Find the university where your next chapter begins.</h2>
          <p>SuperOffer helps ambitious students move from uncertainty to a confident choice—with the right programme, finance and support connected along the way.</p>
          <a class="btn dark" routerLink="/auth/register/student">Start your journey <b>→</b></a>
        </div>
      </section>

      <section class="scene offers-scene" soReveal>
        <header class="scene-heading centered">
          <span class="pill dark-pill">Opportunities</span>
          <h2>Real offers arrive.<br><em>You stay in control.</em></h2>
          <p>Compare admission, scholarship and funding details without switching between portals.</p>
        </header>
        <div class="offer-deck">
          <article *ngFor="let offer of offers; let i=index" [style.--i]="i">
            <header><i>{{offer.logo}}</i><span><small>{{offer.type}}</small><b>{{offer.name}}</b></span><strong>{{offer.score}}<small>% match</small></strong></header>
            <h3>{{offer.course}}</h3>
            <p>{{offer.detail}}</p>
            <div><span>Tuition <b>{{offer.tuition}}</b></span><span>Scholarship <b>{{offer.scholarship}}</b></span></div>
            <footer><button>View offer</button><small>Received today</small></footer>
          </article>
        </div>
      </section>

      <section class="scene match-scene" soReveal>
        <div class="match-copy">
          <span class="pill"><i></i> Intelligent matching</span>
          <h2>The right fit becomes visible.</h2>
          <p>Your goals, academics and preferences become meaningful signals. Universities see more than marks—and you see why every opportunity fits.</p>
          <ul><li><i>01</i><span><b>Context, not just credentials</b><small>Skills, projects and ambition all contribute.</small></span></li><li><i>02</i><span><b>Transparent match signals</b><small>Understand the reason behind each recommendation.</small></span></li><li><i>03</i><span><b>Your privacy, your choice</b><small>You decide when a conversation moves forward.</small></span></li></ul>
        </div>
        <div class="matching-photo">
          <img src="/intelligent-matching-students.png" alt="A university student reviewing matched programme options with an admissions advisor">
          <div class="photo-caption"><span><i></i> Match found</span><b>Clarity for every next step.</b></div>
        </div>
      </section>

      <section class="journey-hub" soReveal>
        <div class="hub-copy">
          <span class="pill light-pill"><i></i> Your journey, connected</span>
          <h2>Every milestone.<br><em>One clear view.</em></h2>
          <p>From your first match to the day you arrive on campus, SuperOffer keeps every decision, document and deadline moving together.</p>
          <a routerLink="/auth/register/student">Create your journey workspace <b>→</b></a>
        </div>
        <div class="hub-ui">
          <header><span><i>S</i><b>My journey</b></span><small>Fall 2027 · United Kingdom</small><em>AM</em></header>
          <div class="hub-progress"><span><b>Journey progress</b><small>Everything is on track</small></span><strong>68%</strong><i><b></b></i></div>
          <div class="hub-columns">
            <div class="timeline">
              <small>NEXT MILESTONES</small>
              <article class="done"><i>✓</i><span><b>Profile verified</b><small>Completed 18 July</small></span></article>
              <article class="current"><i>2</i><span><b>Choose your offer</b><small>3 offers ready to compare</small></span><em>Today</em></article>
              <article><i>3</i><span><b>Confirm your finance</b><small>2 eligible loan options</small></span></article>
              <article><i>4</i><span><b>Prepare your visa</b><small>Checklist unlocks next</small></span></article>
            </div>
            <div class="hub-side">
              <small>RECOMMENDED FOR YOU</small>
              <article class="decision-card"><span>BEST OVERALL MATCH</span><div><i>N</i><b>Northbridge University<small>MSc Data Science</small></b><strong>96</strong></div><button>Compare offer →</button></article>
              <div class="support-card"><i>◇</i><span><b>Need help deciding?</b><small>Your advisor is available today.</small></span><button>Message</button></div>
              <div class="deadline"><span><i></i><b>Next deadline</b></span><strong>12 days</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section class="final-cta" soReveal>
        <span class="pill light-pill">Your future, brought closer</span>
        <h2>Start with one profile.<br><em>Open more doors.</em></h2>
        <p>Free for students. Private by default. Ready when you are.</p>
        <a class="btn light" routerLink="/auth/register/student">Create your free profile <b>→</b></a>
      </section>
    </main>
    <app-site-footer />
  `
})
export class LandingPageComponent {
  readonly offers = [
    {logo:'N',type:'ADMISSION + SCHOLARSHIP',name:'Northbridge University',course:'MSc Data Science',detail:'London · September 2027 · Full-time',tuition:'£24,500',scholarship:'35%',score:96},
    {logo:'W',type:'PRIORITY INVITATION',name:'Westford Institute',course:'MSc Artificial Intelligence',detail:'Manchester · September 2027 · Full-time',tuition:'£21,800',scholarship:'25%',score:91},
    {logo:'L',type:'ADMISSION OFFER',name:'Lakeview University',course:'MSc Business Analytics',detail:'Edinburgh · January 2028 · Full-time',tuition:'£22,200',scholarship:'20%',score:88}
  ];
}
