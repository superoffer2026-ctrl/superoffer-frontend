import { Icon } from '../Icon';
import { Button, Section } from '../primitives';
import { FINAL_CTA } from '../content';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/FinalCta.module.css';

const cx = classNames(styles);

export function FinalCtaSection() {
  return (
    <Section id="get-started" spacing="roomy">
      <div className={cx('panel')}>
        <div className={cx('inner')}>
          <span className={cx('eyebrow')}>{FINAL_CTA.eyebrow}</span>
          <h2>{FINAL_CTA.headline}</h2>
          <p>{FINAL_CTA.intro}</p>

          <div className={cx('actions')}>
            <Button href={FINAL_CTA.primary.href} variant="emerald">
              {FINAL_CTA.primary.label}
            </Button>
            <Button href={FINAL_CTA.secondary.href} variant="glass">
              {FINAL_CTA.secondary.label}
            </Button>
          </div>

          <ul className={cx('proof')}>
            {FINAL_CTA.proof.map(item => (
              <li key={item.text}>
                <Icon name={item.icon} size={16} />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
