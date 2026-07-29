import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { SiteHeaderComponent } from '../../shared/site-header.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="premium-home">
      <section class="premium-hero">
        <div class="premium-hero-copy">
          <span class="premium-pill"><i></i> Built for ambitious students</span>
          <h1>The right offer can change <em>everything.</em></h1>
          <p>Create one verified education profile and let relevant universities, education lenders, and advisers come to you.</p>
          <div class="premium-actions">
            <a class="premium-button primary" routerLink="/auth/register/student">Create your free profile <b>→</b></a>
            <a class="premium-button quiet" routerLink="/auth/login/student">I already have an account</a>
          </div>
          <div class="premium-assurance">
            <span *ngFor="let item of assurances">✓ {{item}}</span>
          </div>
        </div>

        <div class="product-stage" aria-label="SuperOffer student workspace preview">
          <div class="stage-glow"></div>
          <section class="student-product">
            <header><div><span class="mini-logo">S</span><strong>My opportunities</strong></div><span class="live-dot">LIVE</span></header>
            <div class="student-product-body">
              <aside><span class="active"></span><span></span><span></span><span></span></aside>
              <div class="product-content">
                <div class="product-greeting"><div><small>YOUR BEST MATCHES</small><strong>Opportunities selected for you</strong></div><span>{{profileStrength}}%<small>profile</small></span></div>
                <article *ngFor="let offer of offers">
                  <span class="offer-logo" [class]="offer.tone">{{offer.initial}}</span>
                  <div><small>{{offer.kind}}</small><strong>{{offer.title}}</strong><p>{{offer.detail}}</p></div>
                  <b>{{offer.match}}<small>match</small></b>
                </article>
              </div>
            </div>
          </section>
          <div class="stage-card scholarship"><small>SCHOLARSHIP</small><strong>40%</strong><span>Global Excellence Award</span></div>
          <div class="stage-card privacy"><b>✓</b><div><strong>You stay in control</strong><span>Contact details protected</span></div></div>
        </div>
      </section>

      <section class="premium-proof">
        <span>ONE PROFILE CONNECTS YOU TO</span>
        <div><strong *ngFor="let item of network">{{item}}</strong></div>
      </section>

      <section class="premium-intro">
        <header>
          <span>THE OLD WAY IS FRAGMENTED</span>
          <h2>Your education journey deserves one clear place.</h2>
          <p>SuperOffer brings admissions, education finance, and trusted guidance into a single student-owned workspace.</p>
        </header>
        <div class="value-bento">
          <article class="bento-main">
            <span>01 · ONE PROFILE</span>
            <h3>Build your story once.</h3>
            <p>Keep academics, preferences, tests, achievements, and documents consistent across every opportunity.</p>
            <div class="profile-completion">
              <header><span>Profile strength</span><strong>{{profileStrength}}%</strong></header>
              <div *ngFor="let section of profileSections"><span>{{section.label}}</span><i><b [style.width.%]="section.value"></b></i><small>{{section.value}}%</small></div>
            </div>
          </article>
          <article class="bento-card" *ngFor="let value of values">
            <span>{{value.index}} · {{value.eyebrow}}</span><div class="bento-icon">{{value.icon}}</div><h3>{{value.title}}</h3><p>{{value.copy}}</p>
          </article>
        </div>
      </section>

      <section class="premium-journey" id="how-it-works">
        <div class="journey-copy"><span>HOW SUPEROFFER WORKS</span><h2>From profile to possibility.</h2><p>No endless searching. No repeated forms. Just a clearer path from where you are to where you want to study.</p><a routerLink="/auth/register/student">Start your journey →</a></div>
        <ol>
          <li *ngFor="let step of steps"><span>{{step.index}}</span><div><small>{{step.eyebrow}}</small><strong>{{step.title}}</strong><p>{{step.copy}}</p></div></li>
        </ol>
      </section>

      <section class="premium-paths">
        <header><span>ONE NETWORK. THREE WAYS FORWARD.</span><h2>Everything your next decision needs.</h2></header>
        <div>
          <a *ngFor="let path of paths" [routerLink]="path.link">
            <span>{{path.index}}</span><div><small>{{path.eyebrow}}</small><h3>{{path.title}}</h3><p>{{path.copy}}</p></div><b>↗</b>
          </a>
        </div>
      </section>

      <section class="premium-cta">
        <div><span>FREE FOR STUDENTS</span><h2>Make your profile work for your future.</h2><p>Join SuperOffer and bring better-fit education opportunities into one private workspace.</p></div>
        <a class="premium-button light" routerLink="/auth/register/student">Create your profile <b>→</b></a>
      </section>
    </main>
    <app-site-footer />
  `
})
export class LandingPageComponent {
  readonly profileStrength = 82;
  readonly assurances = ['Free for students', 'Private by default', 'Verified organisations'];
  readonly network = ['Universities', 'Education finance', 'Expert guidance'];
  readonly offers = [
    { initial:'N', kind:'UNIVERSITY OFFER', title:'MSc Data Science', detail:'Toronto · 40% scholarship', match:'94%', tone:'mint' },
    { initial:'F', kind:'EDUCATION FINANCE', title:'Global Study Loan', detail:'Flexible collateral options', match:'89%', tone:'blue' },
    { initial:'V', kind:'EXPERT GUIDANCE', title:'Application Review', detail:'Verified admissions adviser', match:'87%', tone:'sand' }
  ];
  readonly profileSections = [
    { label:'Academics', value:100 }, { label:'Study preferences', value:92 },
    { label:'Tests & skills', value:78 }, { label:'Documents', value:61 }
  ];
  readonly values = [
    { index:'02', eyebrow:'RELEVANCE', icon:'◇', title:'Better-fit opportunities.', copy:'Structured matching focuses attention on programmes and services aligned with your goals.' },
    { index:'03', eyebrow:'CONTROL', icon:'◌', title:'Your privacy, your choice.', copy:'You decide what to complete, what to share, and when an organisation can contact you.' }
  ];
  readonly steps = [
    { index:'01', eyebrow:'TELL YOUR STORY', title:'Create one verified profile', copy:'Add the education details that institutions genuinely need.' },
    { index:'02', eyebrow:'DISCOVER', title:'Receive relevant opportunities', copy:'See admissions, funding, and guidance selected around your plans.' },
    { index:'03', eyebrow:'DECIDE', title:'Compare with confidence', copy:'Review details, respond, and take the next step from one workspace.' }
  ];
  readonly paths = [
    { index:'01', eyebrow:'ADMISSIONS', title:'University offers', copy:'Programmes, scholarships, and direct invitations.', link:'/students' },
    { index:'02', eyebrow:'FUNDING', title:'Education loans', copy:'Clear finance options shaped around your plans.', link:'/bank' },
    { index:'03', eyebrow:'SUPPORT', title:'Expert guidance', copy:'Verified help for applications, documents, and visas.', link:'/consultancy' }
  ];
}
