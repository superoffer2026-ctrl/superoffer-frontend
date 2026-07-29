import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth-api.service';
import { StudentProfileUiStore } from '../student-portal/student-profile-ui.store';
import { StudentWorkspaceRailComponent } from '../student-portal/student-workspace-rail.component';

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
  imports: [CommonModule, FormsModule, RouterLink, StudentWorkspaceRailComponent],
  styleUrl: '../../offer-workspace.css',
  styles: [`
    :host{--line:#dfe6e1;--muted:#6d7972;--green:#087a50;display:block;min-height:100vh;background:#fff;color:#172019;font-family:"DM Sans",sans-serif}
    button,input{font:inherit}.logo{display:grid;place-items:center;border-radius:10px;background:#102f45;color:#fff;font-weight:900}
    .inbox-logo{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:11px;background:#102f45;color:#67d0b2;text-decoration:none;font-size:17px;font-weight:900}
    .offers-utility-rail{position:fixed;inset:0 auto 0 0;z-index:20;width:68px;display:flex;flex-direction:column;align-items:center;padding:16px 0;box-sizing:border-box;background:#f8faf9;border-right:1px solid #d7e0dc}
    .offers-utility-rail .student-profile-link{margin-top:auto}
    .student-profile-link{display:flex;align-items:center;gap:8px;padding:3px;border-radius:50%;color:#172019;text-decoration:none;transition:.18s}.student-profile-link:hover{background:#dce8ed}.student-profile-link>span{width:39px;height:39px;display:grid;place-items:center;overflow:hidden;border:2px solid #cbded5;border-radius:50%;background:#e7f4ed;color:var(--green);font-size:11px;font-weight:900}.student-profile-link img{width:100%;height:100%;object-fit:cover}
    .conversation-options{border:0;background:transparent;color:#718078;font-size:20px;font-weight:800;letter-spacing:2px;cursor:pointer;padding:8px}
    .primary-btn,.secondary-btn{border-radius:8px;padding:9px 12px;font-weight:800;cursor:pointer}.primary-btn{border:1px solid var(--green);background:var(--green);color:#fff}.secondary-btn{border:1px solid #ccd8d1;background:#fff;color:#445149}
    .mailbox-error{margin:12px 18px;padding:12px;border-radius:8px;background:#fff0ee;color:#a93628}.institution-logo{flex:0 0 auto}.institution-logo.bank-logo{background:#fff2e8!important;color:#b55a24!important;border-color:#efd4c2}
    .offers-loading,.pre-offer-page{min-height:100vh;margin-left:68px;background:#f7f3ec}.offers-loading{display:grid;place-items:center;color:var(--muted);font-weight:700}
    .pre-offer-page{padding:clamp(32px,5vw,72px)}.pre-offer-wrap{width:min(1060px,100%);margin:auto}.pre-offer-heading span,.waiting-card>span{color:var(--green);font-size:10px;font-weight:900;letter-spacing:.14em}.pre-offer-heading h1{margin:8px 0 7px;font-size:clamp(34px,4vw,52px);letter-spacing:-.045em}.pre-offer-heading p{margin:0;color:var(--muted);font-size:16px}
    .waiting-card{margin-top:28px;padding:clamp(30px,5vw,58px);border:1px solid #ded8cf;border-radius:22px;background:#fff}.waiting-icon{width:70px;height:70px;display:grid;place-items:center;margin-bottom:30px;border-radius:20px;background:#e5f3eb;color:var(--green);font-size:28px}.waiting-card h2{max-width:670px;margin:9px 0 10px;font-size:clamp(25px,3vw,36px);letter-spacing:-.035em}.waiting-card>p{max-width:690px;margin:0;color:var(--muted);line-height:1.65}
    .matching-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:34px 0}.matching-steps article{padding:20px;border:1px solid #e5e0d8;border-radius:14px;background:#fbfaf7}.matching-steps b{width:28px;height:28px;display:grid;place-items:center;border-radius:50%;background:#102f45;color:#67d0b2;font-size:11px}.matching-steps strong{display:block;margin:16px 0 5px;font-size:13px}.matching-steps small{color:var(--muted);line-height:1.5}.empty-actions{display:flex;gap:10px;flex-wrap:wrap}.empty-actions a{display:inline-flex;align-items:center;justify-content:center;padding:12px 17px;border:1px solid #cad7d0;border-radius:9px;color:#35463d;text-decoration:none;font-size:12px;font-weight:900}.empty-actions a.primary{border-color:var(--green);background:var(--green);color:#fff}
    @media(max-width:720px){
      .offers-utility-rail{position:relative;width:100%;height:58px;flex-direction:row;padding:0 14px;border-right:0;border-bottom:1px solid #d7e0dc}
      .offers-utility-rail .student-profile-link{margin-top:0;margin-left:auto}
      .offer-workspace-page{padding:0}.offer-conversation{min-height:520px}.offers-loading,.pre-offer-page{margin-left:0}.pre-offer-page{padding:28px 18px}.matching-steps{grid-template-columns:1fr}
    }
  `],
  template: `
    <app-student-workspace-rail />
    <p class="mailbox-error" *ngIf="error">{{error}}</p>
    <div class="offers-loading" *ngIf="loading">Checking for your latest offers…</div>
    <main class="pre-offer-page" *ngIf="!loading && !offers.length">
      <div class="pre-offer-wrap">
        <header class="pre-offer-heading"><span>MY OFFERS</span><h1>Your opportunity inbox</h1><p>University and education-finance offers will appear here.</p></header>
        <section class="waiting-card">
          <div class="waiting-icon">{{profileIncomplete ? '○' : '✓'}}</div>
          <span>{{profileIncomplete ? 'ACTION NEEDED' : 'PROFILE LIVE'}}</span>
          <h2>{{profileIncomplete ? 'Complete your profile to start receiving offers.' : 'You are ready to be matched.'}}</h2>
          <p>{{profileIncomplete
            ? 'Partners need your academic background, study preferences, and supporting documents before they can make a relevant offer.'
            : 'There are no offers in your inbox yet. Verified universities and funding partners can now discover your profile and send opportunities that fit your goals.'}}</p>
          <div class="matching-steps">
            <article><b>1</b><strong>We compare your profile</strong><small>Your goals, academics, destination, and funding needs shape each match.</small></article>
            <article><b>2</b><strong>Partners review fit</strong><small>Only verified universities and finance providers can send an offer.</small></article>
            <article><b>3</b><strong>You stay in control</strong><small>Compare terms, message the partner, shortlist, accept, or decline here.</small></article>
          </div>
          <div class="empty-actions">
            <a class="primary" [routerLink]="profileIncomplete ? '/student/personal-information' : '/student/dashboard'">{{profileIncomplete ? 'Complete profile' : 'Go to dashboard'}}</a>
            <a routerLink="/student/profile">Review my profile</a>
          </div>
        </section>
      </div>
    </main>
    <main class="offer-workspace-page" *ngIf="!loading && offers.length">
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
              <button class="conversation-options" type="button" aria-label="Conversation options">•••</button>
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
export class StudentOfferInboxComponent implements OnInit {
  @Input() user: any;
  @Input() error = '';
  @Output() signedOut = new EventEmitter<void>();
  @Output() editProfile = new EventEmitter<void>();
  @Input() set backendOffers(value: any[]) {
    if (!Array.isArray(value)) return;
    this.setOffers(value);
  }
  filter: 'All' | OfferKind = 'All';
  draft = '';
  loading = true;
  profileIncomplete = false;
  offers: StudentOffer[] = [];
  selected = this.emptyOffer();
  constructor(public profileStore:StudentProfileUiStore, private api:AuthApiService){}

  async ngOnInit() {
    const token = localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token') || '';
    if (!token) {
      this.loading = false;
      this.profileIncomplete = true;
      return;
    }
    try {
      const result = await this.api.studentOffers(token);
      this.setOffers(result?.results || result?.offers || []);
    } catch (error) {
      const apiError = error as Error & { code?: string; body?: any };
      this.profileIncomplete = apiError.code === 'STUDENT_PROFILE_INCOMPLETE' || apiError.body?.code === 'STUDENT_PROFILE_INCOMPLETE';
      if (!this.profileIncomplete) this.error = apiError.message || 'Could not load your offers.';
    } finally {
      this.loading = false;
    }
  }

  get filteredOffers() {
    return this.filter === 'All' ? this.offers : this.offers.filter(offer => offer.kind === this.filter);
  }

  get studentInitials() {
    const name = this.studentName;
    return name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  }
  get studentName(){return this.profileStore.values['fullName']||this.user?.full_name||'Student';}

  count(kind: OfferKind) { return this.offers.filter(offer => offer.kind === kind).length; }
  select(offer: StudentOffer) { this.selected = offer; }
  setStatus(status: OfferState) { this.selected.status = status; }
  private setOffers(value: any[]) {
    this.offers = value.map((offer, index) => this.mapOffer(offer, index));
    if (this.offers.length) this.selected = this.offers[0];
  }
  private mapOffer(offer: any, index: number): StudentOffer {
    const institution = offer.institution?.name || offer.institution_name || offer.institution || offer.provider_name || 'Opportunity partner';
    const rawKind = String(offer.kind || offer.offer_type || offer.provider_type || '').toLowerCase();
    const kind: OfferKind = rawKind.includes('bank') || rawKind.includes('loan') || rawKind.includes('finance') ? 'Bank' : 'University';
    return {
      id: String(offer.id || offer.offer_id || `offer-${index}`),
      kind,
      institution,
      initial: institution.charAt(0).toUpperCase(),
      logo: offer.logo || offer.logo_url || '',
      program: offer.program?.name || offer.program_name || offer.program || offer.product_name || 'Study opportunity',
      headline: offer.headline || offer.award || offer.title || (kind === 'Bank' ? 'Education finance opportunity' : 'Admission opportunity'),
      received: offer.received || offer.received_at || offer.created_at || 'New',
      status: this.normaliseStatus(offer.status_label || offer.status),
      location: offer.location || '',
      intake: offer.intake || offer.eligible_intake || 'To be confirmed',
      deadline: offer.deadline || offer.respond_by || 'View offer terms',
      valueLabel: offer.value_label || (kind === 'Bank' ? 'Loan amount' : 'Award'),
      value: offer.value || offer.amount || offer.scholarship || 'See details',
      conditions: offer.conditions || offer.terms || 'Review the complete offer terms and eligibility requirements before responding.',
      nextSteps: Array.isArray(offer.next_steps) ? offer.next_steps : ['Review the offer details', 'Message the partner with any questions', 'Respond before the stated deadline'],
      contact: offer.contact?.name || offer.contact_name || 'Partner representative',
      contactRole: offer.contact?.role || offer.contact_role || (kind === 'Bank' ? 'Education Finance Adviser' : 'Admissions Adviser'),
      messages: Array.isArray(offer.messages) ? offer.messages : []
    };
  }
  private emptyOffer(): StudentOffer {
    return {
      id:'', kind:'University', institution:'', initial:'', program:'', headline:'', received:'', status:'Pending',
      location:'', intake:'', deadline:'', valueLabel:'', value:'', conditions:'', nextSteps:[], contact:'', contactRole:'', messages:[]
    };
  }
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
