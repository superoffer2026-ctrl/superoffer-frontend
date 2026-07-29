import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type OfferState = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';
type OfferKind = 'University' | 'Bank';

interface StudentOffer {
  id: string;
  kind: OfferKind;
  institution: string;
  initial: string;
  logo?: string;
  program: string;
  headline: string;
  received: string;
  status: OfferState;
  location: string;
  intake: string;
  deadline: string;
  valueLabel: string;
  value: string;
  conditions: string;
  nextSteps: string[];
  contact: string;
  contactRole: string;
  messages: Array<{ from: 'institution' | 'student'; author: string; body: string; time: string }>;
}

@Component({
  selector: 'app-student-offer-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../offer-workspace.css',
  styles: [`
    :host{--line:#dfe6e1;--muted:#6d7972;--green:#087a50;display:block;min-height:100vh;background:#fff;color:#172019;font-family:"DM Sans",sans-serif}
    button,input{font:inherit}.student-inbox-header{height:64px;padding:0 22px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--line);background:#fff}
    .inbox-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:18px}.inbox-brand span,.logo{display:grid;place-items:center;border-radius:10px;background:#102f45;color:#fff;font-weight:900}
    .inbox-brand span{width:31px;height:31px;color:#67d0b2}.student-account{display:flex;align-items:center;gap:11px}.student-account div{text-align:right}.student-account strong,.student-account small{display:block}.student-account small{font-size:10px;color:var(--muted)}
    .student-account>span{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#e7f4ed;color:var(--green);font-size:11px;font-weight:900}.sign-out{border:0;background:transparent;color:#66736c;font-size:11px;font-weight:800;cursor:pointer}
    .primary-btn,.secondary-btn{border-radius:8px;padding:9px 12px;font-weight:800;cursor:pointer}.primary-btn{border:1px solid var(--green);background:var(--green);color:#fff}.secondary-btn{border:1px solid #ccd8d1;background:#fff;color:#445149}
    .mailbox-error{margin:12px 18px;padding:12px;border-radius:8px;background:#fff0ee;color:#a93628}.institution-logo{flex:0 0 auto}.institution-logo.bank-logo{background:#fff2e8!important;color:#b55a24!important;border-color:#efd4c2}
    @media(max-width:720px){.student-account div{display:none}.student-inbox-header{padding:0 14px}.offer-workspace-page{padding:0}.offer-conversation{min-height:520px}}
  `],
  template: `
    <header class="student-inbox-header">
      <div class="inbox-brand"><span>S</span> SuperOffer <small>Student</small></div>
      <div class="student-account">
        <div><strong>{{user?.full_name || 'Student'}}</strong><small>Offer workspace</small></div>
        <span>{{studentInitials}}</span>
        <button class="sign-out" (click)="editProfile.emit()">Update profile</button>
        <button class="sign-out" (click)="signedOut.emit()">Logout</button>
      </div>
    </header>

    <p class="mailbox-error" *ngIf="error">{{error}}</p>
    <main class="offer-workspace-page">
      <section class="offer-workspace">
        <aside class="offer-mailbox">
          <header class="mailbox-toolbar">
            <button class="all-offers-reset" (click)="filter='All'">
              <strong>My offers</strong>
              <small>{{offers.length}} university and bank opportunities</small>
            </button>
            <div class="compact-offer-filters">
              <button [class.active]="filter==='All'" (click)="filter='All'">All <b>{{offers.length}}</b></button>
              <button [class.active]="filter==='University'" (click)="filter='University'">University <b>{{count('University')}}</b></button>
              <button [class.active]="filter==='Bank'" (click)="filter='Bank'">Bank <b>{{count('Bank')}}</b></button>
            </div>
          </header>

          <button class="offer-mail-item" *ngFor="let offer of filteredOffers"
            [class.selected]="offer.id===selected.id" (click)="select(offer)">
            <span class="logo institution-logo" [class.bank-logo]="offer.kind==='Bank'">
              <img *ngIf="offer.logo" [src]="offer.logo" [alt]="offer.institution">
              <ng-container *ngIf="!offer.logo">{{offer.initial}}</ng-container>
            </span>
            <span class="mail-offer-main">
              <div><small>{{offer.kind}} offer</small><time>{{offer.received}}</time></div>
              <strong>{{offer.institution}}</strong>
              <p>{{offer.program}}</p>
              <b>{{offer.headline}}</b>
            </span>
            <i *ngIf="offer.status==='Pending'"></i>
          </button>
        </aside>

        <section class="offer-reading-pane">
          <div class="offer-details-column">
            <header class="reading-pane-header">
              <div class="reading-institution">
                <span class="logo institution-logo" [class.bank-logo]="selected.kind==='Bank'">
                  <img *ngIf="selected.logo" [src]="selected.logo" [alt]="selected.institution">
                  <ng-container *ngIf="!selected.logo">{{selected.initial}}</ng-container>
                </span>
                <div><small>{{selected.kind | uppercase}} OFFER</small><h2>{{selected.institution}}</h2><p class="reading-course">{{selected.program}}</p></div>
              </div>
              <span class="header-offer-status"
                [class.shortlisted-status]="selected.status==='Shortlisted'"
                [class.accepted-status]="selected.status==='Accepted'"
                [class.rejected-status]="selected.status==='Rejected'">{{selected.status}}</span>
            </header>

            <div class="reading-pane-scroll">
              <section class="offer-detail-hero">
                <small>{{selected.kind==='Bank' ? 'FINANCE PROPOSAL' : 'ADMISSION OPPORTUNITY'}}</small>
                <h1>{{selected.headline}}</h1>
                <div class="offer-key-terms">
                  <div><small>{{selected.kind==='Bank' ? 'PRODUCT' : 'PROGRAMME'}}</small><strong>{{selected.program}}</strong></div>
                  <div><small>{{selected.valueLabel | uppercase}}</small><strong>{{selected.value}}</strong></div>
                  <div><small>{{selected.kind==='Bank' ? 'ELIGIBLE INTAKE' : 'INTAKE'}}</small><strong>{{selected.intake}}</strong></div>
                  <div><small>RESPOND BY</small><strong>{{selected.deadline}}</strong></div>
                </div>
              </section>
              <section class="offer-conditions">
                <div><h3>Offer details</h3><p>{{selected.conditions}}</p></div>
                <button>View complete terms →</button>
              </section>
              <section class="offer-next-steps">
                <div><small>NEXT STEPS</small><strong>To progress this offer</strong></div>
                <ul><li *ngFor="let step of selected.nextSteps">{{step}}</li></ul>
              </section>
            </div>
            <footer class="offer-decision-bar">
              <button class="secondary-btn shortlist-action" [class.chosen]="selected.status==='Shortlisted'" (click)="setStatus('Shortlisted')">☆ Shortlist</button>
              <button class="secondary-btn reject-action" [class.chosen]="selected.status==='Rejected'" (click)="setStatus('Rejected')">Decline</button>
              <button class="primary-btn" (click)="setStatus('Accepted')">{{selected.status==='Accepted' ? '✓ Accepted' : 'Accept offer'}}</button>
            </footer>
          </div>

          <section class="offer-conversation">
            <header class="conversation-head">
              <div class="chat-contact">
                <span class="logo" [class.bank-logo]="selected.kind==='Bank'">{{selected.initial}}</span>
                <div><h3>{{selected.contact}}</h3><p>{{selected.contactRole}}</p><small><i></i> Available to help</small></div>
              </div>
              <button aria-label="Conversation options">•••</button>
            </header>
            <div class="message-thread">
              <div *ngFor="let message of selected.messages" [class.student-message]="message.from==='student'">
                <span>{{message.from==='student' ? studentInitials : selected.initial}}</span>
                <div><strong>{{message.author}}</strong><p>{{message.body}}</p><small>{{message.time}}</small></div>
              </div>
            </div>
            <form class="message-composer" (ngSubmit)="sendMessage()">
              <button type="button" aria-label="Attach file">＋</button>
              <input name="message" [(ngModel)]="draft" placeholder="Message {{selected.contact}}…" autocomplete="off">
              <button class="primary-btn" [disabled]="!draft.trim()">Send</button>
            </form>
          </section>
        </section>
      </section>
    </main>
  `
})
export class StudentOfferInboxComponent {
  @Input() user: any;
  @Input() error = '';
  @Output() signedOut = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();
  @Input() set backendOffers(value: any[]) {
    if (!Array.isArray(value)) return;
    for (const apiOffer of value) {
      const existing = this.offers.find(offer => offer.id === apiOffer.id);
      if (!existing) continue;
      existing.institution = apiOffer.institution || existing.institution;
      existing.program = apiOffer.program || existing.program;
      existing.headline = apiOffer.award || existing.headline;
      existing.status = this.normaliseStatus(apiOffer.status_label || apiOffer.status);
    }
  }
  filter: 'All' | OfferKind = 'All';
  draft = '';

  offers: StudentOffer[] = [
    {
      id:'offer-1000', kind:'University', institution:'Northbridge University', initial:'N', logo:'/logos/northbridge.png',
      program:'MSc Data Science', headline:'40% Global Excellence Scholarship', received:'24 Jul', status:'Pending',
      location:'Toronto, Canada', intake:'Fall 2027', deadline:'15 August 2026', valueLabel:'Scholarship', value:'40% tuition',
      conditions:'Your admission and scholarship are conditional on final transcript verification and meeting the programme English-language requirement.',
      nextSteps:['Review the scholarship and admission conditions','Upload your final academic transcript','Confirm your decision before the deadline'],
      contact:'Maya Chen', contactRole:'International Admissions Adviser',
      messages:[
        {from:'institution',author:'Maya Chen',body:'Hi! We were impressed by your academic profile and would like to offer you admission with our Global Excellence Scholarship.',time:'24 Jul, 10:12'},
        {from:'student',author:'You',body:'Thank you. Could you confirm whether the scholarship applies to both years of the programme?',time:'24 Jul, 11:03'},
        {from:'institution',author:'Maya Chen',body:'Yes, it is renewable for the second year provided you maintain the required academic standing.',time:'24 Jul, 11:18'}
      ]
    },
    {
      id:'offer-1001', kind:'Bank', institution:'EduFund Finance', initial:'E', logo:'/logos/edufund.png',
      program:'International Education Loan', headline:'Pre-qualified education loan up to ₹35 lakh', received:'23 Jul', status:'Pending',
      location:'India', intake:'Fall 2027', deadline:'20 August 2026', valueLabel:'Loan amount', value:'Up to ₹35 lakh',
      conditions:'Indicative approval at 9.4% p.a., subject to KYC, co-applicant verification, admission evidence, and final credit assessment.',
      nextSteps:['Review indicative rate and repayment schedule','Submit co-applicant and KYC documents','Share your confirmed admission letter'],
      contact:'Rohan Kapoor', contactRole:'Education Loan Specialist',
      messages:[
        {from:'institution',author:'Rohan Kapoor',body:'Your profile is pre-qualified for our international education loan. I can help you understand the documentation and repayment options.',time:'23 Jul, 15:40'}
      ]
    },
    {
      id:'offer-1002', kind:'University', institution:'Westford University', initial:'W', logo:'/logos/westford.png',
      program:'MSc Artificial Intelligence', headline:'Priority admission with £6,000 award', received:'21 Jul', status:'Shortlisted',
      location:'Manchester, UK', intake:'September 2027', deadline:'12 August 2026', valueLabel:'Award', value:'£6,000',
      conditions:'This priority offer is subject to degree completion with the stated minimum grade and receipt of verified IELTS results.',
      nextSteps:['Compare programme modules and total costs','Submit verified English test result','Accept the priority place online'],
      contact:'Olivia Hart', contactRole:'Regional Admissions Manager',
      messages:[
        {from:'institution',author:'Olivia Hart',body:'We have matched your profile with our MSc Artificial Intelligence programme and reserved a priority place for you.',time:'21 Jul, 09:24'}
      ]
    },
    {
      id:'offer-1003', kind:'Bank', institution:'LearnFund', initial:'L', logo:'/logos/learnfund.png',
      program:'Study Abroad Loan', headline:'Collateral-free funding assessment', received:'18 Jul', status:'Pending',
      location:'India', intake:'2027 intake', deadline:'30 August 2026', valueLabel:'Funding', value:'Up to ₹25 lakh',
      conditions:'Final eligibility and pricing depend on university ranking, programme, co-applicant income, and standard underwriting checks.',
      nextSteps:['Complete the two-minute eligibility form','Upload co-applicant income documents','Select the university offer you plan to fund'],
      contact:'Neha Iyer', contactRole:'Student Finance Adviser',
      messages:[
        {from:'institution',author:'Neha Iyer',body:'Based on your profile, you may qualify for collateral-free study abroad funding. Message me if you would like a personalised estimate.',time:'18 Jul, 14:05'}
      ]
    }
  ];

  selected = this.offers[0];

  get filteredOffers() {
    return this.filter === 'All' ? this.offers : this.offers.filter(offer => offer.kind === this.filter);
  }

  get studentInitials() {
    const name = this.user?.full_name || 'Student';
    return name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  }

  count(kind: OfferKind) { return this.offers.filter(offer => offer.kind === kind).length; }
  select(offer: StudentOffer) { this.selected = offer; }
  setStatus(status: OfferState) { this.selected.status = status; }
  private normaliseStatus(value: string): OfferState {
    const status = String(value || '').toLowerCase();
    if (status.includes('accept')) return 'Accepted';
    if (status.includes('reject') || status.includes('declin')) return 'Rejected';
    if (status.includes('shortlist')) return 'Shortlisted';
    return 'Pending';
  }

  sendMessage() {
    const body = this.draft.trim();
    if (!body) return;
    this.selected.messages.push({from:'student', author:'You', body, time:'Just now'});
    this.draft = '';
  }
}
