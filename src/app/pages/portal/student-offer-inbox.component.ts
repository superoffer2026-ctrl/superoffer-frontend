import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentProfileUiStore } from '../student-portal/student-profile-ui.store';
import { StudentWorkspaceRailComponent } from '../student-portal/student-workspace-rail.component';
import { OfferCategory, OfferWalletStore, StudentOffer } from '../student-portal/offer-wallet.models';
import { OfferMarketplaceCardComponent } from '../student-portal/offer-marketplace-card.component';
import { OfferCompareComponent } from '../student-portal/offer-compare.component';
import { OfferJourneyTrackerComponent } from '../student-portal/offer-journey-tracker.component';
import { RevealOnScrollDirective } from '../landing/reveal-on-scroll.directive';

type OfferFilter = 'All' | OfferCategory;

@Component({
  selector: 'app-student-offer-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule, StudentWorkspaceRailComponent, OfferMarketplaceCardComponent, OfferCompareComponent, OfferJourneyTrackerComponent, RevealOnScrollDirective],
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
    .back-to-market{border:1px solid #d7e0dc;background:#fff;border-radius:8px;padding:7px 11px;font-size:10px;font-weight:800;color:#3c4a43;cursor:pointer;margin-bottom:10px}
    .back-to-market:hover{border-color:#087a50;color:#087a50}
    @media(max-width:720px){
      .offers-utility-rail{position:relative;width:100%;height:58px;flex-direction:row;padding:0 14px;border-right:0;border-bottom:1px solid #d7e0dc}
      .offers-utility-rail .student-profile-link{margin-top:0;margin-left:auto}
      .offer-workspace-page{padding:0}.offer-conversation{min-height:520px}
    }
  `],
  template: `
    <app-student-workspace-rail />
    <p class="mailbox-error" *ngIf="error">{{error}}</p>

    <main class="market-grid-view" *ngIf="viewMode==='grid'">
      <header class="wallet-toolbar">
        <div class="wallet-toolbar-heading">
          <strong>Offer Wallet</strong>
          <small>{{walletStore.totalCount}} offers · {{walletStore.newCount}} new · browse, compare, save and decide in one place.</small>
        </div>
        <div class="wallet-tabs">
          <button type="button" [class.active]="filter==='All'" (click)="filter='All'">All <b>{{walletStore.totalCount}}</b></button>
          <button type="button" [class.active]="filter==='University'" (click)="filter='University'">University <b>{{walletStore.universityCount}}</b></button>
          <button type="button" [class.active]="filter==='Bank'" (click)="filter='Bank'">Bank <b>{{walletStore.bankCount}}</b></button>
          <button type="button" [class.active]="filter==='Scholarship'" (click)="filter='Scholarship'">Scholarship <b>{{walletStore.scholarshipCount}}</b></button>
          <button type="button" [class.active]="filter==='Consultancy'" (click)="filter='Consultancy'">Consultancy <b>{{walletStore.consultancyCount}}</b></button>
        </div>
        <div class="wallet-chip-row">
          <button type="button" class="wallet-chip" [class.active]="favouritesOnly" (click)="favouritesOnly=!favouritesOnly">♥ Favourites</button>
          <button type="button" class="wallet-chip" [class.active]="savedOnly" (click)="savedOnly=!savedOnly">☆ Saved <b>{{walletStore.savedCount}}</b></button>
        </div>
      </header>

      <section class="market-grid">
        <app-offer-marketplace-card
          *ngFor="let offer of filteredOffers"
          soReveal
          [offer]="offer"
          (viewDetails)="openDetail($event)"
          (toggleCompare)="walletStore.toggleCompareSelect($event)"
          (toggleSave)="walletStore.toggleSaved($event)"
          (toggleFavourite)="walletStore.toggleFavourite($event)"
          (accept)="walletStore.setStatus($event,'Accepted')"
          (decline)="walletStore.setStatus($event,'Rejected')" />
        <div class="market-grid-empty" *ngIf="!filteredOffers.length">
          <strong>No offers match these filters</strong>
          <p>Try a different category, or clear your saved/favourites filters.</p>
        </div>
      </section>

      <div class="wallet-compare-bar" *ngIf="walletStore.compareSelectionIds.length>=2">
        <strong>{{walletStore.compareSelectionIds.length}} offers selected</strong>
        <button type="button" class="compare-open-btn" (click)="compareOpen=true">Compare</button>
        <button type="button" class="compare-clear-btn" (click)="clearCompareSelection()">Clear</button>
      </div>

      <app-offer-compare *ngIf="compareOpen" [offers]="compareSelection" (close)="compareOpen=false" />
    </main>

    <main class="offer-workspace-page" *ngIf="viewMode==='detail'">
      <section class="offer-workspace">
        <aside class="offer-mailbox">
          <header class="mailbox-toolbar">
            <button class="all-offers-reset" (click)="filter='All'">
              <strong>My offers</strong>
              <small>{{offers.length}} offers across university, bank, scholarship and consultancy partners</small>
            </button>
            <div class="compact-offer-filters">
              <button [class.active]="filter==='All'" (click)="filter='All'">All <b>{{offers.length}}</b></button>
              <button [class.active]="filter==='University'" (click)="filter='University'">University <b>{{count('University')}}</b></button>
              <button [class.active]="filter==='Bank'" (click)="filter='Bank'">Bank <b>{{count('Bank')}}</b></button>
              <button [class.active]="filter==='Scholarship'" (click)="filter='Scholarship'">Scholarship <b>{{count('Scholarship')}}</b></button>
              <button [class.active]="filter==='Consultancy'" (click)="filter='Consultancy'">Consultancy <b>{{count('Consultancy')}}</b></button>
            </div>
          </header>

          <button class="back-to-market" type="button" (click)="backToMarketplace()" style="margin:10px 0 0 20px">← Back to marketplace</button>

          <button class="offer-mail-item" *ngFor="let offer of filteredOffers"
            [class.selected]="offer.id===selected.id" (click)="select(offer)">
            <span class="logo institution-logo" [class.bank-logo]="offer.category==='Bank'">
              <img *ngIf="offer.logo" [src]="offer.logo" [alt]="offer.institution">
              <ng-container *ngIf="!offer.logo">{{offer.initial}}</ng-container>
            </span>
            <span class="mail-offer-main">
              <div><small>{{offer.category}} offer</small><time>{{offer.received}}</time></div>
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
                <span class="logo institution-logo" [class.bank-logo]="selected.category==='Bank'">
                  <img *ngIf="selected.logo" [src]="selected.logo" [alt]="selected.institution">
                  <ng-container *ngIf="!selected.logo">{{selected.initial}}</ng-container>
                </span>
                <div><small>{{selected.category | uppercase}} OFFER</small><h2>{{selected.institution}}</h2><p class="reading-course">{{selected.program}}</p></div>
              </div>
              <span class="header-offer-status"
                [class.shortlisted-status]="selected.status==='Shortlisted'"
                [class.accepted-status]="selected.status==='Accepted'"
                [class.rejected-status]="selected.status==='Rejected'">{{selected.status}}</span>
            </header>

            <div class="reading-pane-scroll">
              <section class="offer-detail-hero">
                <small>{{selected.category==='Bank' ? 'FINANCE PROPOSAL' : selected.category==='Scholarship' ? 'SCHOLARSHIP AWARD' : selected.category==='Consultancy' ? 'SERVICE PROPOSAL' : 'ADMISSION OPPORTUNITY'}}</small>
                <h1>{{selected.headline}}</h1>
                <div class="offer-key-terms">
                  <div><small>{{selected.category==='Bank' ? 'PRODUCT' : 'PROGRAMME'}}</small><strong>{{selected.program}}</strong></div>
                  <div><small>{{selected.valueLabel | uppercase}}</small><strong>{{selected.value}}</strong></div>
                  <div><small>{{selected.category==='Bank' ? 'ELIGIBLE INTAKE' : 'INTAKE'}}</small><strong>{{selected.intake}}</strong></div>
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
              <section class="offer-conditions" style="margin-top:14px">
                <div><h3>Offer journey</h3><app-offer-journey-tracker [stage]="walletStore.stage(selected)" /></div>
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
                <span class="logo" [class.bank-logo]="selected.category==='Bank'">{{selected.initial}}</span>
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

  filter: OfferFilter = 'All';
  savedOnly = false;
  favouritesOnly = false;
  viewMode: 'grid' | 'detail' = 'grid';
  compareOpen = false;
  draft = '';
  selected: StudentOffer;

  constructor(public profileStore: StudentProfileUiStore, public walletStore: OfferWalletStore) {
    this.selected = this.offers[0];
  }

  get offers(): StudentOffer[] { return this.walletStore.offers; }

  get filteredOffers(): StudentOffer[] {
    return this.offers.filter(offer =>
      (this.filter === 'All' || offer.category === this.filter) &&
      (!this.savedOnly || offer.saved) &&
      (!this.favouritesOnly || offer.favourite)
    );
  }

  get compareSelection(): StudentOffer[] {
    return this.offers.filter(offer => this.walletStore.compareSelectionIds.includes(offer.id));
  }

  get studentInitials() {
    const name = this.studentName;
    return name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  }
  get studentName(){return this.profileStore.values['fullName']||this.user?.full_name||'Student';}

  count(category: OfferCategory) { return this.offers.filter(offer => offer.category === category).length; }

  openDetail(id: string) {
    const offer = this.offers.find(candidate => candidate.id === id);
    if (!offer) return;
    this.walletStore.markViewed(id);
    this.selected = offer;
    this.viewMode = 'detail';
  }
  backToMarketplace() { this.viewMode = 'grid'; }

  clearCompareSelection() {
    [...this.walletStore.compareSelectionIds].forEach(id => this.walletStore.toggleCompareSelect(id));
  }

  select(offer: StudentOffer) { this.walletStore.markViewed(offer.id); this.selected = offer; }
  setStatus(status: StudentOffer['status']) { this.walletStore.setStatus(this.selected.id, status); }
  private normaliseStatus(value: string): StudentOffer['status'] {
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
