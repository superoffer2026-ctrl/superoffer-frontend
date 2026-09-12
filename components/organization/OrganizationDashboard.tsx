'use client';

import { classNames } from '@/lib/cx';
import type { useOrganizationWorkspace } from '@/lib/organization/use-organization-workspace';
import styles from '@/styles/OrganizationWorkspace.module.css';

const cx = classNames(styles);

type Workspace = ReturnType<typeof useOrganizationWorkspace>;

export function OrganizationDashboard({ workspace }: { workspace: Workspace }) {
  const {
    role, cfg, currentPlan, planQuotaLabel, profilesViewed, acceptanceRate, avgResponseTime, activeOffersCount,
    remainingCredits, quotaPercent, funnelStages, performanceBars, rankedInsights, offers, displayStatus, offerIcon, offerTone,
    go, user
  } = workspace;

  /** First name only — the header already carries the full name and initials. */
  const firstName = (user?.full_name || '').trim().split(/\s+/)[0] || '';

  return (
    <section className={cx('uni-view')}>
      <section className={cx('uni-hero')}>
        <div>
          <span className={cx('eyebrow')}><i />{cfg.orgLabel} workspace</span>
          <h1>{firstName ? `Welcome back, ${firstName}.` : cfg.searchTitle}</h1>
          <p>{cfg.searchIntro}</p>
          <div className={cx('hero-actions')}>
            <button type="button" className={cx('uni-primary')} onClick={() => go('students')}>
              {role === 'BANK' ? 'Review applicants' : 'Browse students'}
            </button>
            <button type="button" className={cx('uni-secondary')} onClick={() => go('subscription')}>Manage plan</button>
          </div>
        </div>

        <div className={cx('uni-quota')}>
          <div className={cx('quota-top')}>
            <span>{currentPlan} plan</span>
            <strong>{profilesViewed}<small>/{planQuotaLabel}</small></strong>
          </div>
          {/* Unlimited plans have no bar to fill, so the meter sits at zero
              rather than pretending a fraction of infinity has been used. */}
          <div className={cx('quota-bar')} style={{ ['--p' as string]: `${Math.min(100, quotaPercent)}%` }}><i /></div>
          <div className={cx('quota-foot')}>
            <span>Profiles viewed this {cfg.cycleLabel}</span>
            <b>{remainingCredits} left</b>
          </div>
        </div>
      </section>

      <div className={cx('uni-metrics')}>
        <article><span>CURRENT SUBSCRIPTION</span><strong>{currentPlan}</strong><small>{planQuotaLabel} profiles / cycle</small></article>
        <article><span>PROFILES VIEWED</span><strong>{profilesViewed}</strong><small>this {cfg.cycleLabel}</small></article>
        <article><span>ACCEPTANCE RATE</span><strong>{acceptanceRate}%</strong><small>{avgResponseTime} avg response</small></article>
        <article><span>ACTIVE OFFERS</span><strong>{activeOffersCount}</strong><small>awaiting student response</small></article>
      </div>

      {/* The quick-actions card stood here with exactly two buttons: Browse
          Students and Manage Plan. Both are now the hero's own calls to
          action, a screen-height above — a second copy of them read as a bug
          rather than a shortcut. */}

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
              <p style={{ fontSize: 13, color: '#71717a', margin: '3px 0 0' }}>
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
              <p style={{ fontSize: 13, color: '#71717a', margin: '3px 0 0' }}>Key drivers of student offer acceptance</p>
            </div>
          </header>
          <ol style={{ listStyle: 'none', padding: '0 24px 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rankedInsights.map(row => (
              <li key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#fbfbfa', border: '1px solid #ececea' }}>
                <b style={{ fontSize: 18 }}>{row.icon}</b>
                <p style={{ flex: 1, margin: 0 }}>
                  <strong style={{ display: 'block', fontSize: 13.5, color: '#18181b' }}>{row.label}</strong>
                  <small style={{ color: '#71717a', fontSize: 12 }}>{row.detail}</small>
                </p>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#047857' }}>{row.value}</span>
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
