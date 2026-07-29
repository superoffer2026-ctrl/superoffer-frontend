import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../shared/site-footer.component';
import { SiteHeaderComponent } from '../../shared/site-header.component';

type OpportunityPath = {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  link: string;
  action: string;
  tone: string;
};

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SiteHeaderComponent, SiteFooterComponent],
  template: `
    <app-site-header />
    <main class="discovery-home">
      <section class="discovery-hero">
        <div class="hero-orbit orbit-a"></div><div class="hero-orbit orbit-b"></div>
        <div class="discovery-copy">
          <span class="discovery-kicker">THE OPPORTUNITY NETWORK FOR GLOBAL EDUCATION</span>
          <h1>One profile.<br><em>Better possibilities.</em></h1>
          <p>Tell your education story once, then discover relevant university admissions, funding, and expert guidance in one private workspace.</p>
          <div class="discovery-actions">
            <a class="discovery-button primary" routerLink="/auth/register/student">Create your profile <span>↗</span></a>
            <a class="discovery-button text" href="#how-it-works">See how it works ↓</a>
          </div>
          <div class="trust-note"><span>✓ Free for students</span><span>✓ You control visibility</span><span>✓ Verified organisations</span></div>
        </div>
        <aside class="opportunity-preview" aria-label="Example matched opportunities">
          <div class="preview-head"><span>YOUR OPPORTUNITY SPACE</span><b>LIVE</b></div>
          <article *ngFor="let item of previewCards; let i=index" [style.--delay]="i">
            <span class="preview-mark">{{item.mark}}</span>
            <div><small>{{item.type}}</small><strong>{{item.title}}</strong><p>{{item.detail}}</p></div>
            <b>{{item.match}}</b>
          </article>
          <div class="preview-foot"><span>Profile strength</span><i><b [style.width.%]="profileStrength"></b></i><strong>{{profileStrength}}%</strong></div>
        </aside>
      </section>

      <section class="proof-ribbon" aria-label="Platform highlights">
        <article *ngFor="let proof of proofPoints"><strong>{{proof.value}}</strong><span>{{proof.label}}</span></article>
      </section>

      <section class="path-section" id="opportunities">
        <header class="editorial-heading"><span>START WITH YOUR GOAL</span><h2>Every part of your decision,<br>connected.</h2><p>One organised space replaces repeated forms, disconnected conversations, and unclear next steps.</p></header>
        <div class="path-grid-v2">
          <a *ngFor="let path of opportunityPaths" class="path-card-v2" [class]="path.tone" [routerLink]="path.link">
            <div><span>{{path.index}}</span><small>{{path.eyebrow}}</small></div>
            <h3>{{path.title}}</h3><p>{{path.copy}}</p><b>{{path.action}} <i>↗</i></b>
          </a>
        </div>
      </section>

      <section class="profile-story" id="how-it-works">
        <div class="profile-visual">
          <span class="visual-label">YOUR REUSABLE PROFILE</span>
          <div class="profile-sheet">
            <header><span>AM</span><div><strong>Complete education profile</strong><small>Visible only when you choose</small></div><b>{{profileStrength}}%</b></header>
            <div *ngFor="let section of profileSections"><span>{{section.icon}}</span><strong>{{section.label}}</strong><i><b [style.width.%]="section.progress"></b></i><small>{{section.progress}}%</small></div>
          </div>
          <aside>Information stays consistent across every opportunity.</aside>
        </div>
        <div class="story-editorial">
          <span class="discovery-kicker">ONE PROFILE, MANY PATHS</span>
          <h2>Stop rebuilding your story.</h2>
          <p>Your academics, ambitions, tests, achievements, and documents belong together. Complete them at your pace and decide when organisations can discover you.</p>
          <ol>
            <li *ngFor="let step of journeySteps"><span>{{step.index}}</span><div><strong>{{step.title}}</strong><p>{{step.copy}}</p></div></li>
          </ol>
        </div>
      </section>

      <section class="control-section">
        <header><span>BUILT AROUND THE STUDENT</span><h2>Clear choices.<br>No hidden pressure.</h2></header>
        <div><article *ngFor="let value of controlValues"><span>{{value.icon}}</span><h3>{{value.title}}</h3><p>{{value.copy}}</p></article></div>
      </section>

      <section class="discovery-final">
        <span>YOUR NEXT STEP CAN START HERE</span>
        <h2>Bring the right education opportunities closer.</h2>
        <p>Create your free profile and shape what comes next.</p>
        <a class="discovery-button light" routerLink="/auth/register/student">Start your profile <b>↗</b></a>
      </section>
    </main>
    <app-site-footer />
  `
})
export class LandingPageComponent {
  readonly profileStrength = 82;
  readonly previewCards = [
    { mark:'N', type:'UNIVERSITY', title:'MSc Data Science', detail:'40% scholarship · Toronto', match:'94%' },
    { mark:'F', type:'EDUCATION FINANCE', title:'Global study loan', detail:'Flexible collateral options', match:'89%' },
    { mark:'V', type:'EXPERT GUIDANCE', title:'Application review', detail:'Verified admissions adviser', match:'87%' }
  ];
  readonly proofPoints = [
    { value:'1', label:'student-owned profile' },
    { value:'3', label:'connected opportunity paths' },
    { value:'24/7', label:'private access controls' },
    { value:'100%', label:'free for students' }
  ];
  readonly opportunityPaths: OpportunityPath[] = [
    { index:'01', eyebrow:'ADMISSIONS', title:'University opportunities', copy:'Discover relevant programmes, scholarships, intakes, and direct admission invitations.', link:'/students', action:'Explore admissions', tone:'path-mint' },
    { index:'02', eyebrow:'EDUCATION FINANCE', title:'Funding that fits', copy:'Compare clear education-loan options shaped around your course, destination, and eligibility.', link:'/bank', action:'Understand funding', tone:'path-blue' },
    { index:'03', eyebrow:'EXPERT GUIDANCE', title:'Support when needed', copy:'Connect with verified advisers for applications, documentation, visas, and important decisions.', link:'/consultancy', action:'Find guidance', tone:'path-sand' }
  ];
  readonly profileSections = [
    { icon:'01', label:'Academics', progress:100 },
    { icon:'02', label:'Study preferences', progress:90 },
    { icon:'03', label:'Tests & skills', progress:76 },
    { icon:'04', label:'Documents', progress:62 }
  ];
  readonly journeySteps = [
    { index:'01', title:'Build once', copy:'Add the information organisations genuinely need to understand your background and goals.' },
    { index:'02', title:'Be matched thoughtfully', copy:'Receive opportunities connected to your intent—not a noisy list of unrelated promotions.' },
    { index:'03', title:'Compare with confidence', copy:'Review terms, ask questions, and make your decision from one organised workspace.' }
  ];
  readonly controlValues = [
    { icon:'◌', title:'Private by default', copy:'Your contact details stay protected until you decide to move forward.' },
    { icon:'◇', title:'Relevant, not random', copy:'Structured matching keeps the focus on opportunities that suit your goals.' },
    { icon:'✓', title:'Verified participants', copy:'Universities, lenders, and advisers are reviewed before joining the network.' }
  ];
}
