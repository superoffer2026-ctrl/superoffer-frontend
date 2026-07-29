import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-student-settings-help',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <article class="settings-help-module">
      <div class="settings-help-heading">
        <span>HELP & SUPPORT</span>
        <h2>How can we help?</h2>
        <p>Find quick answers or reach the SuperOffer support team.</p>
      </div>

      <div class="settings-help-actions">
        <a href="mailto:support@superoffer.net">
          <span>✉</span>
          <div><strong>Email support</strong><small>support@superoffer.net</small></div>
          <b>→</b>
        </a>
        <a routerLink="/student/profile">
          <span>○</span>
          <div><strong>Profile help</strong><small>Review and update your student information</small></div>
          <b>→</b>
        </a>
        <a routerLink="/student/documents">
          <span>▤</span>
          <div><strong>Document help</strong><small>Complete missing profile documents</small></div>
          <b>→</b>
        </a>
      </div>

      <div class="settings-help-faq">
        <div><span>QUICK ANSWERS</span><h3>Frequently asked questions</h3></div>
        <details *ngFor="let item of faqs">
          <summary>{{item.question}}<b>＋</b></summary>
          <p>{{item.answer}}</p>
        </details>
      </div>
    </article>
  `,
  styles: [`
    :host{display:block}
    .settings-help-module{padding:24px 26px;border:1px solid #ded8cf;border-radius:18px;background:#fff}
    .settings-help-heading>span,.settings-help-faq>div>span{color:#087a50;font-size:10px;font-weight:900;letter-spacing:.13em}
    h2{margin:7px 0;font-size:22px}p{color:#68766f}.settings-help-heading>p{margin:0 0 20px}
    .settings-help-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .settings-help-actions>a{display:flex;align-items:center;gap:12px;padding:17px;border:1px solid #e0e5e1;border-radius:13px;background:#f8faf9;color:#172019;text-decoration:none;transition:.18s}
    .settings-help-actions>a:hover{border-color:#a9cabb;transform:translateY(-1px)}
    .settings-help-actions>a>span{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border-radius:10px;background:#e4f2e9;color:#087a50}
    .settings-help-actions>a>div{min-width:0;flex:1}.settings-help-actions strong,.settings-help-actions small{display:block}
    .settings-help-actions strong{font-size:12px}.settings-help-actions small{margin-top:4px;overflow:hidden;color:#748078;font-size:10px;text-overflow:ellipsis;white-space:nowrap}
    .settings-help-actions>a>b{color:#087a50}
    .settings-help-faq{margin-top:24px}.settings-help-faq h3{margin:5px 0 15px;font-size:18px}
    details{padding:15px 0;border-top:1px solid #e4e8e5}
    summary{display:flex;align-items:center;justify-content:space-between;gap:20px;list-style:none;font-size:12px;font-weight:800;cursor:pointer}
    summary::-webkit-details-marker{display:none}summary b{color:#087a50}
    details p{max-width:800px;margin:10px 0 0;font-size:11px;line-height:1.65}
    @media(max-width:850px){.settings-help-actions{grid-template-columns:1fr}}
    @media(max-width:650px){.settings-help-module{padding:21px 19px}}
  `]
})
export class StudentSettingsHelpComponent {
  readonly faqs = [
    {question: 'How do I update my student profile?', answer: 'Open your profile from the avatar and choose Edit section beside the information you want to update.'},
    {question: 'Where can I upload missing documents?', answer: 'Use Manage documents from the Dashboard or open the document checklist on your Profile page.'},
    {question: 'How do I respond to an offer?', answer: 'Open Offers, select an opportunity, review its terms, and use the decision actions in the middle panel.'},
    {question: 'Who can view my profile?', answer: 'Only authorised opportunity providers can access the information permitted by your profile visibility settings.'}
  ];
}
