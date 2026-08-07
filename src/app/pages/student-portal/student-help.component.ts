import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, StudentWorkspaceRailComponent],
  styleUrl: './student-workspace-pages.css',
  template: `
    <app-student-workspace-rail />
    <main class="workspace-page support-page">
      <header><div><small>HELP & SUPPORT</small><h1>How can we help?</h1><p>Find quick answers or reach the SuperOffer support team.</p></div></header>

      <section class="support-actions">
        <a href="mailto:support@superoffer.net"><span>✉</span><div><strong>Email support</strong><small>support@superoffer.net</small></div><b>→</b></a>
        <a routerLink="/student/profile"><span>○</span><div><strong>Profile help</strong><small>Review and update your student information</small></div><b>→</b></a>
        <a routerLink="/student/documents"><span>▤</span><div><strong>Document help</strong><small>Complete missing profile documents</small></div><b>→</b></a>
      </section>

      <section class="support-faq">
        <div><span>QUICK ANSWERS</span><h2>Frequently asked questions</h2></div>
        <details *ngFor="let item of faqs">
          <summary>{{item.question}}<b>＋</b></summary>
          <p>{{item.answer}}</p>
        </details>
      </section>
    </main>
  `
})
export class StudentHelpComponent {
  faqs = [
    {question:'How do I update my student profile?',answer:'Open your profile from the avatar and choose Edit section beside the information you want to update.'},
    {question:'Where can I upload missing documents?',answer:'Use Manage documents from the Dashboard or open the document checklist on your Profile page.'},
    {question:'How do I respond to an offer?',answer:'Open Offers, select an opportunity, review its terms, and use the decision actions in the middle panel.'},
    {question:'Who can view my profile?',answer:'Only authorised opportunity providers can access the information permitted by your profile visibility settings.'}
  ];
}
