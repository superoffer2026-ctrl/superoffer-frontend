import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OfferCategory, StudentOffer } from './offer-wallet.models';

interface CompareRow {
  label: string;
  values: string[];
}

interface CompareGroup {
  category: OfferCategory;
  offers: StudentOffer[];
  rows: CompareRow[];
}

@Component({
  selector: 'app-offer-compare',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="compare-panel-backdrop" (click)="close.emit()">
      <section class="compare-panel" (click)="$event.stopPropagation()">
        <header>
          <div><small>OFFER WALLET</small><h2>Compare offers</h2><p>{{offers.length}} offers selected across {{groups.length}} categor{{groups.length===1 ? 'y' : 'ies'}}.</p></div>
          <button type="button" (click)="close.emit()" aria-label="Close compare">×</button>
        </header>
        <div class="compare-panel-scroll">
          <section class="compare-group" *ngFor="let group of groups">
            <h3>{{group.category}} offers</h3>
            <div class="compare-table">
              <div class="compare-table-head">
                <span></span>
                <span *ngFor="let offer of group.offers">
                  <b class="compare-offer-logo">
                    <img *ngIf="offer.logo" [src]="offer.logo" [alt]="offer.institution">
                    <ng-container *ngIf="!offer.logo">{{offer.initial}}</ng-container>
                  </b>
                  <strong>{{offer.institution}}</strong>
                  <small>{{offer.program}}</small>
                </span>
              </div>
              <div class="compare-table-row" *ngFor="let row of group.rows">
                <span class="compare-row-label">{{row.label}}</span>
                <span *ngFor="let value of row.values">{{value || '—'}}</span>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  `
})
export class OfferCompareComponent {
  @Input({ required: true }) offers!: StudentOffer[];
  @Output() close = new EventEmitter<void>();

  get groups(): CompareGroup[] {
    const categories: OfferCategory[] = ['University', 'Bank', 'Scholarship', 'Consultancy'];
    return categories
      .map(category => this.offers.filter(offer => offer.category === category))
      .filter(offers => offers.length > 0)
      .map(offers => ({ category: offers[0].category, offers, rows: this.buildRows(offers[0].category, offers) }));
  }

  private buildRows(category: OfferCategory, offers: StudentOffer[]): CompareRow[] {
    const fields = this.fieldsFor(category);
    return fields.map(field => ({
      label: field.label,
      values: offers.map(offer => field.value(offer))
    }));
  }

  private fieldsFor(category: OfferCategory): Array<{ label: string; value: (offer: StudentOffer) => string }> {
    switch (category) {
      case 'University':
        return [
          { label: 'Tuition Fee', value: o => o.tuitionFee || '' },
          { label: 'Scholarship', value: o => o.scholarshipPct ? `${o.scholarshipPct}%` : '' },
          { label: 'Country', value: o => o.location },
          { label: 'Course', value: o => o.program },
          { label: 'Duration', value: o => o.durationYears ? `${o.durationYears} year${o.durationYears === 1 ? '' : 's'}` : '' },
          { label: 'QS Ranking (Placeholder)', value: o => o.qsRanking || '' },
          { label: 'Placement Highlights', value: o => o.placementHighlights || '' }
        ];
      case 'Bank':
        return [
          { label: 'Loan Amount', value: o => o.loanAmount || '' },
          { label: 'Interest Rate', value: o => o.interestRate || '' },
          { label: 'EMI', value: o => o.emi || '' },
          { label: 'Moratorium', value: o => o.moratorium || '' },
          { label: 'Processing Fee', value: o => o.processingFee || '' },
          { label: 'Tenure', value: o => o.tenure || '' }
        ];
      case 'Scholarship':
        return [
          { label: 'Amount', value: o => o.amount || '' },
          { label: 'Coverage', value: o => o.coverage || '' },
          { label: 'Eligibility', value: o => o.eligibility || '' }
        ];
      case 'Consultancy':
        return [
          { label: 'Visa Services', value: o => o.visaServices || '' },
          { label: 'Accommodation', value: o => o.accommodationSupport || '' },
          { label: 'Support Services', value: o => o.supportServices || '' }
        ];
    }
  }
}
