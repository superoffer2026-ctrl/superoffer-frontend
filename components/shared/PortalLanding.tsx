import Link from 'next/link';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

export interface PortalContent {
  key: 'student' | 'organization';
  eyebrow: string;
  title: string;
  intro: string;
  primary: string;
  secondary: string;
  stats: { value: string; label: string }[];
  featuresTitle: string;
  features: { icon: string; title: string; text: string }[];
  process?: string[];
  requirements?: string[];
  faqs: { q: string; a: string }[];
}

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/** Marketing shell shared by `/students` and `/organization`.
 *  Its classes live in `app/globals.css`, exactly as they did in Angular. */
export function PortalLanding({ content }: { content: PortalContent }) {
  return (
    <>
      <SiteHeader context={content.key} />
      <main className={`sector-home ${content.key}-home`}>
        <section className="sector-hero">
          <div className="hero-copy">
            <span className="eyebrow">{content.eyebrow}</span>
            <h1>{content.title}</h1>
            <p>{content.intro}</p>
            <div className="cta-row">
              <Link className="button green large" href={`/auth/register/${content.key}`}>{content.primary}</Link>
              <a className="sector-text-link" href="#features">{content.secondary} →</a>
            </div>
          </div>
          <div className="sector-visual" aria-label="SuperOffer opportunity workspace">
            <span className="visual-label">{titleCase(content.key)} workspace</span>
            <div className="visual-profile">
              <b>{content.key.charAt(0).toUpperCase()}</b>
              <div><strong>Profile ready</strong><small>Your opportunities, organised</small></div>
            </div>
            <div className="visual-offer">
              <small>NEW OPPORTUNITY</small>
              <strong>Relevant offer received</strong>
              <span>View details →</span>
            </div>
            <div className="visual-note">Everything you need, in one clear place.</div>
          </div>
        </section>

        <section className="sector-stats">
          {content.stats.map(stat => (
            <div key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>
          ))}
        </section>

        <section className="sector-features" id="features">
          <div className="sector-section-heading">
            <span className="eyebrow">Built around your needs</span>
            <h2>{content.featuresTitle}</h2>
          </div>
          <div className="sector-feature-grid">
            {content.features.map((item, i) => (
              <article key={item.title}>
                <span className="feature-count">0{i + 1}</span>
                <span className="feature-icon">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        {!!content.process?.length && (
          <section className="sector-process" id="process">
            <div>
              <span className="eyebrow">Clear from day one</span>
              <h2>A simple path to getting started.</h2>
              <p>Every step is visible, secure, and designed around the permissions defined for your role.</p>
            </div>
            <ol>
              {content.process.map((step, i) => (
                <li key={step}><span>0{i + 1}</span><b>{step}</b></li>
              ))}
            </ol>
          </section>
        )}

        {!!content.requirements?.length && (
          <section className="requirements">
            <div>
              <span className="eyebrow">Prepare to register</span>
              <h2>What you will need.</h2>
            </div>
            <div className="requirement-grid">
              {content.requirements.map(item => (
                <span key={item}>✓ {item}</span>
              ))}
            </div>
          </section>
        )}

        <section className="sector-faq" id="faq">
          <span className="eyebrow">Frequently asked questions</span>
          <h2>Answers before you begin.</h2>
          {content.faqs.map(faq => (
            <details key={faq.q}>
              <summary>{faq.q}<span>+</span></summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </section>

        <section className="sector-cta">
          <div>
            <span className="eyebrow light">Ready when you are</span>
            <h2>{content.primary}</h2>
          </div>
          <Link className="button cream large" href={`/auth/register/${content.key}`}>Continue securely →</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
