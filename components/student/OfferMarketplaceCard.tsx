'use client';

import { useState } from 'react';
import { classNames } from '@/lib/cx';
import { offerWalletStore, type StudentOffer } from '@/lib/stores/offer-wallet.store';
import styles from '@/styles/OfferMarketplaceCard.module.css';
import { OfferJourneyTracker } from './OfferJourneyTracker';

const cx = classNames(styles);

const STATUS_CLASS: Record<StudentOffer['status'], string> = {
  Pending: '',
  Shortlisted: 'status-shortlisted',
  Accepted: 'status-accepted',
  Rejected: 'status-rejected'
};

export interface OfferMarketplaceCardProps {
  offer: StudentOffer;
  compact?: boolean;
  onViewDetails?(id: string): void;
  onToggleCompare?(id: string): void;
  onToggleSave?(id: string): void;
  onToggleFavourite?(id: string): void;
  onAccept?(id: string): void;
  onDecline?(id: string): void;
}

function highlightsFor(offer: StudentOffer): Array<{ label: string; value: string }> {
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

export function OfferMarketplaceCard({
  offer, compact = false, onViewDetails, onToggleCompare, onToggleSave, onToggleFavourite, onAccept, onDecline
}: OfferMarketplaceCardProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  const stage = offerWalletStore.stage(offer);

  return (
    <div className={cx('host')}>
      <article
        className={cx(
          'market-card',
          compact && 'market-card-compact',
          offer.status === 'Accepted' && 'market-card-accepted',
          offer.status === 'Rejected' && 'market-card-declined'
        )}
      >
        {offer.recommended && <span className={cx('market-card-recommended')}>✦ Recommended</span>}
        <header className={cx('market-card-head')}>
          <span className={cx('market-card-logo')}>
            {offer.logo && !logoFailed && (
              <img src={offer.logo} alt={offer.institution} onError={() => setLogoFailed(true)} />
            )}
            {(!offer.logo || logoFailed) && offer.initial}
          </span>
          <div className={cx('market-card-identity')}>
            <span className={cx('market-card-category')}>{offer.category} offer</span>
            <strong>{offer.institution}</strong>
            <small>{offer.program}</small>
          </div>
          <b className={cx('market-card-status', STATUS_CLASS[offer.status])}>{offer.status}</b>
        </header>

        <p className={cx('market-card-headline')}>{offer.headline}</p>

        <div className={cx('market-card-highlights')}>
          {highlightsFor(offer).map(item => (
            <div key={item.label}><small>{item.label}</small><strong>{item.value}</strong></div>
          ))}
        </div>

        {!compact && (
          <div className={cx('market-card-journey')}>
            <OfferJourneyTracker stage={stage} compact />
          </div>
        )}

        <footer className={cx('market-card-foot')}>
          <time>{offer.received}</time>
          <div className={cx('market-card-actions')}>
            <button
              type="button"
              className={cx('market-icon-btn', offer.favourite && 'active')}
              onClick={() => onToggleFavourite?.(offer.id)}
              aria-label={offer.favourite ? 'Remove favourite' : 'Add favourite'}
            >
              {offer.favourite ? '♥' : '♡'}
            </button>
            {!compact && (
              <button
                type="button"
                className={cx('market-icon-btn', offer.compared && 'active')}
                onClick={() => onToggleCompare?.(offer.id)}
                aria-label="Toggle compare"
              >
                ⧉
              </button>
            )}
            {!compact && (
              <button
                type="button"
                className={cx('market-icon-btn', offer.saved && 'active')}
                onClick={() => onToggleSave?.(offer.id)}
                aria-label={offer.saved ? 'Remove from saved' : 'Save offer'}
              >
                {offer.saved ? '✓' : '☆'}
              </button>
            )}
            <button type="button" className={cx('market-secondary-btn')} onClick={() => onViewDetails?.(offer.id)}>
              View details
            </button>
            {!compact && offer.status !== 'Accepted' && offer.status !== 'Rejected' && (
              <>
                <button type="button" className={cx('market-decline-btn')} onClick={() => onDecline?.(offer.id)}>
                  Decline
                </button>
                <button type="button" className={cx('market-primary-btn')} onClick={() => onAccept?.(offer.id)}>
                  Accept
                </button>
              </>
            )}
          </div>
        </footer>
      </article>
    </div>
  );
}
