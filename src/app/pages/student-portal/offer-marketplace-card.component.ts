import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OfferWalletStore, StudentOffer } from './offer-wallet.models';
import { OfferJourneyTrackerComponent } from './offer-journey-tracker.component';

@Component({
  selector: 'app-offer-marketplace-card',
  standalone: true,
  imports: [CommonModule, OfferJourneyTrackerComponent],
  template: `
    <article class="market-card" [class.market-card-compact]="compact" [class.market-card-accepted]="offer.status==='Accepted'" [class.market-card-declined]="offer.status==='Rejected'">
      <span class="market-card-recommended" *ngIf="offer.recommended">✦ Recommended</span>
      <header class="market-card-head">
        <span class="market-card-logo">
          <img *ngIf="offer.logo" [src]="offer.logo" [alt]="offer.institution" (error)="logoFailed=true" [style.display]="logoFailed?'none':'block'">
          <ng-container *ngIf="!offer.logo || logoFailed">{{offer.initial}}</ng-container>
        </span>
        <div class="market-card-identity">
          <span class="market-card-category">{{offer.category}} offer</span>
          <strong>{{offer.institution}}</strong>
          <small>{{offer.program}}</small>
        </div>
        <b class="market-card-status" [class]="statusClass">{{offer.status}}</b>
      </header>

      <p class="market-card-headline">{{offer.headline}}</p>

      <div class="market-card-highlights">
        <div *ngFor="let item of highlights"><small>{{item.label}}</small><strong>{{item.value}}</strong></div>
      </div>

      <div class="market-card-journey" *ngIf="!compact">
        <app-offer-journey-tracker [stage]="stage" [compact]="true" />
      </div>

      <footer class="market-card-foot">
        <time>{{offer.received}}</time>
        <div class="market-card-actions">
          <button type="button" class="market-icon-btn" [class.active]="offer.favourite" (click)="toggleFavourite.emit(offer.id)" [attr.aria-label]="offer.favourite ? 'Remove favourite' : 'Add favourite'">{{offer.favourite ? '♥' : '♡'}}</button>
          <button type="button" class="market-icon-btn" [class.active]="offer.compared" *ngIf="!compact" (click)="toggleCompare.emit(offer.id)" aria-label="Toggle compare">⧉</button>
          <button type="button" class="market-icon-btn" [class.active]="offer.saved" *ngIf="!compact" (click)="toggleSave.emit(offer.id)" [attr.aria-label]="offer.saved ? 'Remove from saved' : 'Save offer'">{{offer.saved ? '✓' : '☆'}}</button>
          <button type="button" class="market-secondary-btn" (click)="viewDetails.emit(offer.id)">View details</button>
          <ng-container *ngIf="!compact && offer.status!=='Accepted' && offer.status!=='Rejected'">
            <button type="button" class="market-decline-btn" (click)="decline.emit(offer.id)">Decline</button>
            <button type="button" class="market-primary-btn" (click)="accept.emit(offer.id)">Accept</button>
          </ng-container>
        </div>
      </footer>
    </article>
  `,
  styles: [`
    :host{display:block}
    .market-card{position:relative;display:flex;flex-direction:column;gap:14px;padding:22px;border:1px solid #e3e9e5;border-radius:18px;background:#fff;box-shadow:0 6px 20px rgba(17,47,29,.05);transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
    .market-card:hover{transform:translateY(-5px);box-shadow:0 22px 48px rgba(17,47,29,.13);border-color:#bfe0cd}
    .market-card-accepted{border-color:#9cd3b6;background:linear-gradient(180deg,#fff 0%,#f4fbf7 100%)}
    .market-card-declined{opacity:.6}
    .market-card-recommended{position:absolute;top:-11px;right:18px;padding:5px 12px;border-radius:999px;background:linear-gradient(135deg,#087a50,#0ea16c);color:#fff;font-size:9px;font-weight:900;letter-spacing:.06em;box-shadow:0 6px 16px rgba(8,122,80,.35)}
    .market-card-head{display:flex;align-items:flex-start;gap:12px}
    .market-card-logo{width:44px;height:44px;flex:0 0 auto;display:grid;place-items:center;overflow:hidden;border-radius:12px;background:#102f45;color:#67d0b2;font-weight:900;font-size:14px}
    .market-card-logo img{width:100%;height:100%;object-fit:cover}
    .market-card-identity{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
    .market-card-category{font-size:9px;font-weight:900;letter-spacing:.09em;color:#087a50;text-transform:uppercase}
    .market-card-identity strong{font-size:15px;letter-spacing:-.01em;color:#151a17}
    .market-card-identity small{font-size:11px;color:#6d7972}
    .market-card-status{flex:0 0 auto;padding:5px 9px;border-radius:999px;background:#eef2ef;color:#5f6b65;font-size:9px;font-weight:900;white-space:nowrap}
    .market-card-status.status-shortlisted{background:#fff3df;color:#93600d}
    .market-card-status.status-accepted{background:#e5f4ec;color:#087a50}
    .market-card-status.status-rejected{background:#fdeceb;color:#a1372c}
    .market-card-headline{margin:0;font-size:13.5px;font-weight:700;color:#233129;line-height:1.4}
    .market-card-highlights{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:1px;background:#eef2ef;border-radius:12px;overflow:hidden}
    .market-card-highlights>div{padding:10px 12px;background:#fbfcfb;display:flex;flex-direction:column;gap:4px}
    .market-card-highlights small{font-size:8px;font-weight:800;letter-spacing:.06em;color:#7a877f;text-transform:uppercase}
    .market-card-highlights strong{font-size:12.5px;color:#151a17}
    .market-card-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #eef2ef}
    .market-card-foot>time{font-size:10px;color:#8a948e;flex:0 0 auto}
    .market-card-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
    .market-icon-btn{width:32px;height:32px;display:grid;place-items:center;border:1px solid #e1e8e3;border-radius:9px;background:#fff;color:#6d7972;font-size:14px;cursor:pointer;transition:.16s}
    .market-icon-btn:hover{border-color:#9cd3b6;color:#087a50}
    .market-icon-btn.active{background:#e8f6ef;border-color:#9cd3b6;color:#087a50}
    .market-secondary-btn,.market-primary-btn,.market-decline-btn{border-radius:9px;padding:8px 12px;font-size:11px;font-weight:800;cursor:pointer;white-space:nowrap}
    .market-secondary-btn{border:1px solid #d7e0dc;background:#fff;color:#3c4a43}
    .market-secondary-btn:hover{border-color:#087a50;color:#087a50}
    .market-primary-btn{border:1px solid #087a50;background:#087a50;color:#fff}
    .market-primary-btn:hover{background:#055d3d}
    .market-decline-btn{border:1px solid #ecd6d2;background:#fff;color:#a1372c}
    .market-decline-btn:hover{background:#fdeceb}
    .market-card-compact{padding:16px;gap:10px}
    .market-card-compact .market-card-logo{width:36px;height:36px}
    .market-card-compact .market-card-identity strong{font-size:13px}
    @media(max-width:480px){.market-card-actions{width:100%;justify-content:flex-start}}
  `]
})
export class OfferMarketplaceCardComponent {
  @Input({ required: true }) offer!: StudentOffer;
  @Input() compact = false;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() toggleCompare = new EventEmitter<string>();
  @Output() toggleSave = new EventEmitter<string>();
  @Output() toggleFavourite = new EventEmitter<string>();
  @Output() accept = new EventEmitter<string>();
  @Output() decline = new EventEmitter<string>();

  logoFailed = false;

  constructor(private walletStore: OfferWalletStore) {}

  get stage() { return this.walletStore.stage(this.offer); }

  get statusClass(): string {
    return {
      Pending: '', Shortlisted: 'status-shortlisted', Accepted: 'status-accepted', Rejected: 'status-rejected'
    }[this.offer.status];
  }

  get highlights(): Array<{ label: string; value: string }> {
    const offer = this.offer;
    switch (offer.category) {
      case 'University':
        return [
          { label: 'Tuition', value: offer.tuitionFee || '—' },
          { label: 'Scholarship', value: offer.scholarshipPct ? `${offer.scholarshipPct}%` : '—' },
          { label: 'Duration', value: offer.durationYears ? `${offer.durationYears} yr` : '—' }
        ];
      case 'Bank':
        return [
          { label: 'Loan amount', value: offer.loanAmount || '—' },
          { label: 'Interest', value: offer.interestRate || '—' },
          { label: 'EMI', value: offer.emi || '—' }
        ];
      case 'Scholarship':
        return [
          { label: 'Award', value: offer.amount || '—' },
          { label: 'Coverage', value: offer.coverage || '—' }
        ];
      case 'Consultancy':
        return [
          { label: 'Visa services', value: offer.visaServices || '—' },
          { label: 'Support', value: offer.supportServices || '—' }
        ];
    }
  }
}
