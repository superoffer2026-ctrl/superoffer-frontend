import type { CSSProperties } from 'react';
import { TelemetryClock } from './TelemetryClock';
import { Icon } from '../Icon';
import { CapabilityStrip, LiveDot, Pill, Section, SectionHead, TextLink } from '../primitives';
import { DOSSIER } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Dossier.module.css';

const cx = classNames(styles);

/** How a verified student profile reads from an organisation's side of the desk. */
export function DossierSection() {
  const { portrait, telemetry } = DOSSIER;

  return (
    <Section id="profile">
      <div className={cx('top')}>
        <SectionHead eyebrow={DOSSIER.eyebrow} title={DOSSIER.headline} intro={DOSSIER.intro} />
        <Pill dot>{DOSSIER.readiness}</Pill>
      </div>

      <div className={cx('grid')}>
        {/* Identity */}
        <article className={cx('card')} data-stagger style={{ '--i': 0 } as CSSProperties}>
          <div>
            <div className={cx('portrait')}>
              <img src={portrait.src} alt={portrait.alt} />
              <div className={cx('nameplate')}>
                <div>
                  <h4>
                    {portrait.name}
                    <Icon name="shield-check" size={15} />
                  </h4>
                  <p>{portrait.field}</p>
                </div>
                <span>{portrait.tag}</span>
              </div>
            </div>

            <div className={cx('stats')}>
              {DOSSIER.stats.map(stat => (
                <div key={stat.label} className={cx(stat.accent && 'accent')}>
                  <span>{stat.label}</span>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className={cx('block')}>
              <span>{DOSSIER.destinationsLabel}</span>
              <div className={cx('chips')}>
                {DOSSIER.destinations.map(place => (
                  <b key={place}>{place}</b>
                ))}
              </div>
            </div>

            <div className={cx('block')}>
              <span>{DOSSIER.skillsLabel}</span>
              <div className={cx('chips')}>
                {DOSSIER.skills.map(skill => (
                  <b key={skill.label} className={cx(skill.accent && 'accent')}>
                    {skill.label}
                  </b>
                ))}
              </div>
            </div>
          </div>

          <div className={cx('privacy')}>
            <span>
              <Icon name="lock" size={15} />
              {DOSSIER.privacy.title}
            </span>
            <p>{DOSSIER.privacy.text}</p>
          </div>
        </article>

        {/* Inbound activity */}
        <article className={cx('card')} data-stagger style={{ '--i': 1 } as CSSProperties}>
          <div className={cx('feedBody')}>
            <div className={cx('feedHead')}>
              <div>
                <h3>{telemetry.title}</h3>
                <span className={cx('count')}>
                  <LiveDot />
                  {telemetry.badge}
                </span>
              </div>
              <TelemetryClock />
            </div>

            <div className={cx('summary')}>
              {telemetry.summary.map(item => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className={cx('feed')}>
              {telemetry.rows.map(row => (
                <div key={row.org} className={cx('row')}>
                  <div className={cx('rowMain')}>
                    <span className={cx('rowIcon', row.tone === 'emerald' && 'emerald')}>
                      <Icon name={row.icon} size={19} />
                    </span>
                    <div>
                      <h5>{row.org}</h5>
                      <p>{row.text}</p>
                    </div>
                  </div>
                  <div className={cx('rowMeta')}>
                    <span className={cx('chip', row.tone === 'emerald' && 'solid')}>{row.chip}</span>
                    {row.value ? <em>{row.value}</em> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cx('feedFoot')}>
            <p>{telemetry.footText}</p>
            <TextLink href={telemetry.footLink.href}>{telemetry.footLink.label}</TextLink>
          </div>
        </article>
      </div>

      <CapabilityStrip items={DOSSIER.capabilities} />
    </Section>
  );
}
