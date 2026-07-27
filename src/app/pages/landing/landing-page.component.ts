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
    <main>
      <section class="home-hero">
        <div><span class="eyebrow">The reverse education marketplace</span>
          <h1>Real education offers should find the right student.</h1>
          <p>SuperOffer gives students one verified profile, then helps trusted universities discover strong matches and send concrete, comparable opportunities.</p>
          <div class="cta-row"><a class="button dark large" routerLink="/student">Explore as a student</a><a class="button ghost large" routerLink="/university">Partner as a university</a></div>
          <div class="trust-list"><span>✓ Verified institutions</span><span>✓ Permission-based discovery</span><span>✓ Secure role access</span></div>
        </div>
        <div class="network-card"><span class="network-label">SUPEROffer network</span>
          <div class="network-center"><b>S</b><small>Trusted matching</small></div>
          <div class="network-node n1">Students</div><div class="network-node n2">Universities</div>
          <div class="network-node n3">Banks</div><div class="network-node n4">Consultancies</div>
        </div>
      </section>
      <section class="content-section centered"><span class="eyebrow">Choose your portal</span><h2>One platform. Four focused experiences.</h2>
        <div class="role-grid">
          <a *ngFor="let item of roles" [routerLink]="item.route"><span>{{item.number}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p><b>Open portal →</b></a>
        </div>
      </section>
      <section class="split-section"><div><span class="eyebrow">How SuperOffer works</span><h2>Less searching. More relevant opportunity.</h2></div>
        <ol><li><span>01</span><b>Students create a structured, verifiable profile</b></li><li><span>02</span><b>Verified universities discover suitable candidates</b></li><li><span>03</span><b>Students compare invitations and concrete offers</b></li><li><span>04</span><b>Every action remains permissioned and auditable</b></li></ol>
      </section>
      <section class="page-cta"><span class="eyebrow light">Build your next chapter</span><h2>Start with the portal designed for you.</h2><a class="button white large" routerLink="/student">Get started →</a></section>
    </main>
    <app-site-footer />
  `
})
export class LandingPageComponent {
  roles = [
    { number: '01', title: 'Student', route: '/student', text: 'Build one profile, receive invitations, compare offers, and choose your best path.' },
    { number: '02', title: 'University', route: '/university', text: 'Find qualified students, manage programmes, shortlists, scholarships, and admission offers.' },
    { number: '03', title: 'Bank', route: '/bank', text: 'Find creditworthy students and present clear, responsible education finance offers.' },
    { number: '04', title: 'Consultancy', route: '/consultancy', text: 'Connect with students who intend to study abroad and guide their education journey.' }
  ];
}
