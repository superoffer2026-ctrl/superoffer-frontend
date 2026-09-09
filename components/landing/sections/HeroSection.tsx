import type { CSSProperties } from 'react';
import { HeroActivity } from './HeroActivity';
import { Icon } from '../Icon';
import { Button, LiveDot, Pill, Shell } from '../primitives';
import { HERO } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Hero.module.css';

const cx = classNames(styles);

/** Positions the four surrounding opportunities take on wide screens. */
const SLOTS = ['c1', 'c2', 'c3', 'c4'] as const;

/** Inward connection rays: each opportunity is drawn converging on the student. */
const RAYS = ['M 150 118 Q 260 200 368 276', 'M 650 126 Q 540 204 432 276', 'M 176 486 Q 280 396 368 324', 'M 638 478 Q 528 392 432 324'];

export function HeroSection() {
  const { student } = HERO;

  return (
    <section className={cx('hero')}>
      <div className={cx('glow')} aria-hidden="true" />
      <Shell className={cx('inner')}>
        <div className={cx('copy')}>
          <span data-enter style={{ '--i': 0 } as CSSProperties}>
            <Pill dot>{HERO.eyebrow}</Pill>
          </span>

          <h1 data-enter style={{ '--i': 1 } as CSSProperties}>
            {HERO.headline[0]} <em>{HERO.headline[1]}</em>
          </h1>

          <p className={cx('lede')} data-enter style={{ '--i': 2 } as CSSProperties}>
            {HERO.subhead}
          </p>

          <div className={cx('ctas')} data-enter style={{ '--i': 3 } as CSSProperties}>
            <Button href={HERO.primaryCta.href} variant="dark">
              {HERO.primaryCta.label}
            </Button>
            <Button href={HERO.secondaryCta.href} variant="outline">
              {HERO.secondaryCta.label}
            </Button>
          </div>

          <ul className={cx('proof')} data-enter style={{ '--i': 4 } as CSSProperties}>
            {HERO.proof.map(item => (
              <li key={item}>
                <Icon name="check" size={15} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* The ecosystem: one verified student at the centre, opportunities converging on them. */}
        <div className={cx('stage')} data-enter style={{ '--i': 5 } as CSSProperties}>
          <div className={cx('frame')}>
            <img src="/students-campus.png" alt="" aria-hidden="true" />
            <div className={cx('veil')} aria-hidden="true" />

            <div className={cx('rings')} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <svg className={cx('rays')} viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <ellipse cx="400" cy="300" rx="336" ry="204" fill="none" stroke="rgba(4,120,87,.28)" strokeWidth="1.2" strokeDasharray="6 8" />
              <ellipse cx="400" cy="300" rx="222" ry="136" fill="none" stroke="rgba(5,150,105,.24)" strokeWidth="1" strokeDasharray="4 6" />
              {RAYS.map(d => (
                <path key={d} d={d} fill="none" stroke="rgba(4,120,87,.55)" strokeWidth="1.4" strokeDasharray="4 7" />
              ))}
            </svg>

            <HeroActivity />

            <article className={cx('profile')}>
              <span className={cx('ribbon')}>
                <LiveDot />
                {student.status}
              </span>

              <div className={cx('avatar')}>
                {student.initials}
                <em>
                  <Icon name="check" size={13} />
                </em>
              </div>

              <h3>{student.name}</h3>
              <p>{student.programme}</p>

              <div className={cx('badges')}>
                {student.stats.map(stat => (
                  <span key={stat.label} className={cx(stat.accent && 'accent')}>
                    {stat.label} <b>{stat.value}</b>
                  </span>
                ))}
              </div>

              <span className={cx('verified')}>
                <Icon name="shield-check" size={14} />
                {student.verification}
              </span>
              <span className={cx('destinations')}>{student.destinations}</span>

              <div className={cx('inbound')}>
                <span>
                  <Icon name="mail-unread" size={15} />
                  {student.inbound.label}
                </span>
                <strong>
                  <LiveDot />
                  {student.inbound.value}
                </strong>
              </div>
            </article>
          </div>

          <div className={cx('cards')}>
            {HERO.opportunities.map((offer, i) => (
              <article key={offer.id} className={cx('card', SLOTS[i])}>
                {offer.live ? (
                  <span className={cx('new')}>
                    <LiveDot />
                    New offer
                  </span>
                ) : null}
                <div className={cx('cardTop')}>
                  <span className={cx('cardIcon', offer.tone !== 'emerald' && offer.tone)}>
                    <Icon name={offer.icon} size={19} />
                  </span>
                  <div className={cx('cardBody')}>
                    <div className={cx('cardHead')}>
                      <b>{offer.org}</b>
                      <span className={cx('value', offer.badgeStyle === 'soft' && 'soft')}>{offer.badge}</span>
                    </div>
                    <p>{offer.detail}</p>
                    <div className={cx('cardFoot')}>
                      <span>{offer.footLabel}</span>
                      {offer.footValue ? <em>{offer.footValue}</em> : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Shell>
    </section>
  );
}
