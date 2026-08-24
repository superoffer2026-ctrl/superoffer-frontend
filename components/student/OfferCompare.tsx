'use client';

import { classNames } from '@/lib/cx';
import type { OfferCategory, StudentOffer } from '@/lib/stores/offer-wallet.store';
import styles from '@/styles/OfferWorkspace.module.css';

const cx = classNames(styles);

interface CompareRow {
  label: string;
  values: string[];
}

interface CompareGroup {
  category: OfferCategory;
  offers: StudentOffer[];
  rows: CompareRow[];
}

function fieldsFor(category: OfferCategory): Array<{ label: string; value: (offer: StudentOffer) => string }> {
  switch (category) {
    case 'University':
      return [
        { label: 'Tuition Fee', value: o => o.tuitionFee || '' },
        { label: 'Scholarship', value: o => (o.scholarshipPct ? `${o.scholarshipPct}%` : '') },
        { label: 'Country', value: o => o.location },
        { label: 'Course', value: o => o.program },
        { label: 'Duration', value: o => (o.durationYears ? `${o.durationYears} year${o.durationYears === 1 ? '' : 's'}` : '') },
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

export function OfferCompare({ offers, onClose }: { offers: StudentOffer[]; onClose(): void }) {
  const categories: OfferCategory[] = ['University', 'Bank', 'Scholarship', 'Consultancy'];

  const groups: CompareGroup[] = categories
    .map(category => offers.filter(offer => offer.category === category))
    .filter(group => group.length > 0)
    .map(group => ({
      category: group[0].category,
      offers: group,
      rows: fieldsFor(group[0].category).map(field => ({
        label: field.label,
        values: group.map(offer => field.value(offer))
      }))
    }));

  return (
    <div className={cx('compare-panel-backdrop')} onClick={onClose}>
      <section className={cx('compare-panel')} onClick={event => event.stopPropagation()}>
        <header>
          <div>
            <small>OFFER WALLET</small>
            <h2>Compare offers</h2>
            <p>
              {offers.length} offers selected across {groups.length} categor{groups.length === 1 ? 'y' : 'ies'}.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close compare">×</button>
        </header>
        <div className={cx('compare-panel-scroll')}>
          {groups.map(group => (
            <section key={group.category} className={cx('compare-group')}>
              <h3>{group.category} offers</h3>
              <div className={cx('compare-table')}>
                <div className={cx('compare-table-head')}>
                  <span></span>
                  {group.offers.map(offer => (
                    <span key={offer.id}>
                      <b className={cx('compare-offer-logo')}>
                        {offer.logo ? <img src={offer.logo} alt={offer.institution} /> : offer.initial}
                      </b>
                      <strong>{offer.institution}</strong>
                      <small>{offer.program}</small>
                    </span>
                  ))}
                </div>
                {group.rows.map(row => (
                  <div key={row.label} className={cx('compare-table-row')}>
                    <span className={cx('compare-row-label')}>{row.label}</span>
                    {row.values.map((value, index) => <span key={index}>{value || '—'}</span>)}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
