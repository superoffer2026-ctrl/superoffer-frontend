import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="section-container">
      <div class="section-header centered">
        <span class="pill-tag">FREQUENTLY ASKED QUESTIONS</span>
        <h2>Everything You Need to Know</h2>
        <p>Have questions about how SuperOffer works? Here are answers to common inquiries.</p>
      </div>

      <div class="faq-accordion-list">
        <div class="glass-card faq-item" *ngFor="let faq of faqs; let i = index" [class.open]="openFaq === i">
          <button class="faq-question" (click)="toggleFaq(i)">
            <span>{{faq.q}}</span>
            <span class="toggle-icon">{{openFaq === i ? '−' : '+'}}</span>
          </button>
          <div class="faq-answer" *ngIf="openFaq === i">
            <p>{{faq.a}}</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    .section-container { margin-bottom: 100px; }
    .section-header.centered { text-align: center; max-width: 720px; margin: 0 auto 50px; }
    .pill-tag {
      display: inline-flex;
      padding: 6px 16px;
      border-radius: 99px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
    }
    .section-header h2 { font-family: 'Outfit', sans-serif; font-size: clamp(32px, 3.5vw, 48px); font-weight: 800; color: #fff; margin: 16px 0; }
    .section-header p { font-size: 16px; color: #94a3b8; line-height: 1.6; }

    .faq-accordion-list { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
    .faq-item {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .faq-item.open {
      border-color: #38bdf8;
      background: rgba(15, 23, 42, 0.95);
      box-shadow: 0 10px 30px rgba(56, 189, 248, 0.15);
    }
    .faq-question {
      width: 100%;
      padding: 22px 28px;
      background: transparent;
      border: none;
      text-align: left;
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .toggle-icon { font-size: 22px; color: #38bdf8; font-weight: 800; }
    .faq-answer {
      padding: 0 28px 22px;
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.65;
    }
    .faq-answer p { margin: 0; }
  `]
})
export class LandingFaqComponent {
  openFaq: number | null = 0;

  faqs = [
    {
      q: 'How does SuperOffer invert traditional education search?',
      a: 'Instead of searching hundreds of university websites, you create one verified profile. Institutions search candidate pools using structured criteria and proactively send concrete, negotiable admission & scholarship offers directly to your inbox.'
    },
    {
      q: 'Is SuperOffer completely free for students?',
      a: 'Yes! SuperOffer is 100% free for students. There are no subscription fees, application hidden costs, or premium paywalls for profile creation and offer comparison.'
    },
    {
      q: 'Are my personal documents and contact details kept private?',
      a: 'Absolutely. SuperOffer enforces permission-based privacy. Institutions can evaluate your academic match scores, but your contact details remain locked until you accept an invitation.'
    },
    {
      q: 'Can I compare and negotiate multiple offers at once?',
      a: 'Yes! Your student inbox allows holding multiple pending invitations side-by-side. You can compare scholarships, loan terms, and visa assistance packages, and use our 1-click negotiation tool to request better terms before final acceptance.'
    },
    {
      q: 'How are universities and lenders verified on SuperOffer?',
      a: 'Every institutional account (University, Education Lender, Consultancy) undergoes manual SuperAdmin verification checking accreditation numbers, government licenses, and official domain records before access is granted.'
    }
  ];

  toggleFaq(index: number) {
    this.openFaq = this.openFaq === index ? null : index;
  }
}
