'use client';

import { classNames } from '@/lib/cx';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

export function OrganizationDashboard({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, currentPlan, planQuotaLabel, profilesViewed, acceptanceRate, avgResponseTime, activeOffersCount,
    remainingCredits, funnelStages, performanceBars, rankedInsights, offers, displayStatus, offerIcon, offerTone,
    go, openOfferComposer
  } = workspace;

  return (
    <section className={cx('uni-view')}>
      <div className={cx('uni-metrics')}>
        <article><span>CURRENT SUBSCRIPTION</span><strong>{currentPlan}</strong><small>{planQuotaLabel} profiles / cycle</small></article>
        <article><span>PROFILES VIEWED</span><strong>{profilesViewed}</strong><small>this {cfg.cycleLabel}</small></article>
        <article><span>ACCEPTANCE RATE</span><strong>{acceptanceRate}%</strong><small>{avgResponseTime} avg response</small></article>
        <article><span>ACTIVE OFFERS</span><strong>{activeOffersCount}</strong><small>awaiting student response</small></article>
      </div>

      <section className={cx('uni-card', 'quick-actions-card')}>
        <header><div><span>QUICK ACTIONS</span><h2>Move your pipeline forward</h2></div></header>
        <div className={cx('quick-actions')}>
          <button type="button" className={cx('quick-action')} onClick={() => go('students')}>
            <span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <div><strong>Browse Students</strong><small>Discover best-fit candidates</small></div>
          </button>

          <button type="button" className={cx('quick-action')} onClick={() => go('subscription')}>
            <span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            <div><strong>Manage Plan</strong><small>{remainingCredits} credits remaining</small></div>
          </button>
        </div>
      </section>

      <section className={cx('uni-card', 'uni-funnel-chart')}>
        <header>
          <div>
            <span>CONVERSION FUNNEL</span>
            <h2>Sent → Viewed → Negotiating → Accepted</h2>
            <p>Real-time candidate progression through each stage.</p>
          </div>
        </header>
        {funnelStages.map(stage => (
          <div key={stage.label}>
            <span>{stage.label}</span>
            <i><b style={{ width: `${stage.percent}%` }}>{stage.count}</b></i>
            <small>{stage.percent}%</small>
          </div>
        ))}
      </section>

      <div className={cx('report-grid')}>
        <article className={cx('uni-card')}>
          <header style={{ padding: '20px 24px 10px', borderBottom: 0 }}>
            <div>
              <span>{role === 'BANK' ? 'RATE SENSITIVITY' : 'PERFORMANCE'}</span>
              <h2 style={{ fontSize: 18 }}>{role === 'BANK' ? 'Rate sensitivity' : 'Product performance'}</h2>
              <p style={{ fontSize: 13, color: '#7a8680', margin: '3px 0 0' }}>
                Acceptance rate by {role === 'BANK' ? 'interest rate band' : 'product'}
              </p>
            </div>
          </header>
          <div className={cx('bar-chart')}>
            {performanceBars.map(bar => (
              <span key={bar.label}><i style={{ height: `${bar.percent}%` }}></i><b>{bar.percent}%</b><small>{bar.label}</small></span>
            ))}
          </div>
        </article>

        <article className={cx('uni-card')}>
          <header style={{ padding: '20px 24px 10px', borderBottom: 0 }}>
            <div>
              <span>INSIGHTS</span>
              <h2 style={{ fontSize: 18 }}>{role === 'BANK' ? 'Terms vs. acceptance' : 'Best converting match bands'}</h2>
              <p style={{ fontSize: 13, color: '#7a8680', margin: '3px 0 0' }}>Key drivers of student offer acceptance</p>
            </div>
          </header>
          <ol style={{ listStyle: 'none', padding: '0 24px 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rankedInsights.map(row => (
              <li key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#f7faf8', border: '1px solid #e7efe9' }}>
                <b style={{ fontSize: 18 }}>{row.icon}</b>
                <p style={{ flex: 1, margin: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13.5, color: '#172019' }}>{row.label}</strong>
                  <small style={{ color: '#78847e', fontSize: 12 }}>{row.detail}</small>
                </p>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#087a50' }}>{row.value}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <section className={cx('uni-card', 'uni-activity', 'uni-activity-full')}>
        <header>
          <div><span>RECENT OFFERS</span><h2>Latest offer activity</h2></div>
          <button onClick={() => go('invitations')}>View all</button>
        </header>
        {offers.slice(0, 4).map(offer => (
          <div key={offer.id}>
            <span className={cx(offerTone(offer.status))}>{offerIcon(offer.status)}</span>
            <div><strong>{offer.student}</strong><small>{offer.course}</small></div>
            <time>{offer.sent}</time>
            <button type="button" onClick={() => go('invitations')}>{displayStatus(offer)}</button>
          </div>
        ))}
        {!offers.length && (
          <div className={cx('empty-state')}>
            <strong>No offers sent yet</strong>
            <p>Browse students and send your first offer.</p>
            <button type="button" className={cx('uni-secondary')} onClick={() => go('students')}>Browse students</button>
          </div>
        )}
      </section>
    </section>
  );
}
