import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Reveal } from '@/components/shared/Reveal';
import { SiteFooter } from '@/components/shared/SiteFooter';
import { SiteHeader } from '@/components/shared/SiteHeader';
import { classNames } from '@/lib/cx';
import styles from '@/styles/Landing.module.css';

const cx = classNames(styles);

const OFFERS = [
  { logo: 'N', type: 'ADMISSION + SCHOLARSHIP', name: 'Northbridge University', course: 'MSc Data Science', detail: 'London · September 2027 · Full-time', tuition: '£24,500', scholarship: '35%', score: 96 },
  { logo: 'W', type: 'PRIORITY INVITATION', name: 'Westford Institute', course: 'MSc Artificial Intelligence', detail: 'Manchester · September 2027 · Full-time', tuition: '£21,800', scholarship: '25%', score: 91 },
  { logo: 'L', type: 'ADMISSION OFFER', name: 'Lakeview University', course: 'MSc Business Analytics', detail: 'Edinburgh · January 2028 · Full-time', tuition: '£22,200', scholarship: '20%', score: 88 }
];

export default function LandingPage() {
  return (
    <div className={cx('host')}>
      <SiteHeader />
      <main className={cx('landing')}>
        <section className={cx('hero')}>
          <div className={cx('hero-copy')}>
            <h1 className={cx('hero-enter')}>The right education opportunities,<br /><em>in one place.</em></h1>
            <p className={cx('hero-enter', 'd1')}>
              Create one verified profile and discover university admissions, education finance, and expert guidance
              matched around your plans.
            </p>
            <div className={cx('hero-actions', 'hero-enter', 'd2')}>
              <Link className={cx('btn', 'dark')} href="/auth/register/student">Create your free profile <b>→</b></Link>
            </div>
            <div className={cx('proof', 'hero-enter', 'd3')}>
              <span>✓ Free for students</span>
              <span>✓ Private by default</span>
              <span>✓ Verified organisations</span>
            </div>
          </div>

          <div className={cx('scroll-hint')}><i></i> Scroll to explore</div>
        </section>

        <Reveal id="experience" className={cx('campus-story', 'so-reveal')} visibleClassName={cx('is-visible')}>
          <div className={cx('campus-image')}>
            <img src="/students-campus.png" alt="International students walking together toward their university campus" />
          </div>
          <div className={cx('campus-copy')}>
            <span className={cx('pill')}><i></i> From possibility to campus</span>
            <h2>Find the university where your next chapter begins.</h2>
            <p>
              SuperOffer helps ambitious students move from uncertainty to a confident choice—with the right programme,
              finance and support connected along the way.
            </p>
            <Link className={cx('btn', 'dark')} href="/auth/register/student">Start your journey <b>→</b></Link>
          </div>
        </Reveal>

        <Reveal className={cx('scene', 'offers-scene', 'so-reveal')} visibleClassName={cx('is-visible')}>
          <header className={cx('scene-heading', 'centered')}>
            <span className={cx('pill', 'dark-pill')}>Opportunities</span>
            <h2>Real offers arrive.<br /><em>You stay in control.</em></h2>
            <p>Compare admission, scholarship and funding details without switching between portals.</p>
          </header>
          <div className={cx('offer-deck')}>
            {OFFERS.map((offer, i) => (
              <article key={offer.name} style={{ '--i': i } as CSSProperties}>
                <header>
                  <i>{offer.logo}</i>
                  <span><small>{offer.type}</small><b>{offer.name}</b></span>
                  <strong>{offer.score}<small>% match</small></strong>
                </header>
                <h3>{offer.course}</h3>
                <p>{offer.detail}</p>
                <div>
                  <span>Tuition <b>{offer.tuition}</b></span>
                  <span>Scholarship <b>{offer.scholarship}</b></span>
                </div>
                <footer><button>View offer</button><small>Received today</small></footer>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className={cx('scene', 'match-scene', 'so-reveal')} visibleClassName={cx('is-visible')}>
          <div className={cx('match-copy')}>
            <span className={cx('pill')}><i></i> Intelligent matching</span>
            <h2>The right fit becomes visible.</h2>
            <p>
              Your goals, academics and preferences become meaningful signals. Universities see more than marks—and you
              see why every opportunity fits.
            </p>
            <ul>
              <li><i>01</i><span><b>Context, not just credentials</b><small>Skills, projects and ambition all contribute.</small></span></li>
              <li><i>02</i><span><b>Transparent match signals</b><small>Understand the reason behind each recommendation.</small></span></li>
              <li><i>03</i><span><b>Your privacy, your choice</b><small>You decide when a conversation moves forward.</small></span></li>
            </ul>
          </div>
          <div className={cx('matching-photo')}>
            <img
              src="/intelligent-matching-students.png"
              alt="A university student reviewing matched programme options with an admissions advisor"
            />
            <div className={cx('photo-caption')}><span><i></i> Match found</span><b>Clarity for every next step.</b></div>
          </div>
        </Reveal>

        <Reveal className={cx('journey-hub', 'so-reveal')} visibleClassName={cx('is-visible')}>
          <div className={cx('hub-copy')}>
            <span className={cx('pill', 'light-pill')}><i></i> Your journey, connected</span>
            <h2>Every milestone.<br /><em>One clear view.</em></h2>
            <p>
              From your first match to the day you arrive on campus, SuperOffer keeps every decision, document and
              deadline moving together.
            </p>
            <Link href="/auth/register/student">Create your journey workspace <b>→</b></Link>
          </div>
          <div className={cx('hub-ui')}>
            <header><span><i>S</i><b>My journey</b></span><small>Fall 2027 · United Kingdom</small><em>AM</em></header>
            <div className={cx('hub-progress')}>
              <span><b>Journey progress</b><small>Everything is on track</small></span>
              <strong>68%</strong>
              <i><b></b></i>
            </div>
            <div className={cx('hub-columns')}>
              <div className={cx('timeline')}>
                <small>NEXT MILESTONES</small>
                <article className={cx('done')}><i>✓</i><span><b>Profile verified</b><small>Completed 18 July</small></span></article>
                <article className={cx('current')}><i>2</i><span><b>Choose your offer</b><small>3 offers ready to compare</small></span><em>Today</em></article>
                <article><i>3</i><span><b>Confirm your finance</b><small>2 eligible loan options</small></span></article>
                <article><i>4</i><span><b>Prepare your visa</b><small>Checklist unlocks next</small></span></article>
              </div>
              <div className={cx('hub-side')}>
                <small>RECOMMENDED FOR YOU</small>
                <article className={cx('decision-card')}>
                  <span>BEST OVERALL MATCH</span>
                  <div><i>N</i><b>Northbridge University<small>MSc Data Science</small></b><strong>96</strong></div>
                  <button>Compare offer →</button>
                </article>
                <div className={cx('support-card')}>
                  <i>◇</i>
                  <span><b>Need help deciding?</b><small>Your advisor is available today.</small></span>
                  <button>Message</button>
                </div>
                <div className={cx('deadline')}><span><i></i><b>Next deadline</b></span><strong>12 days</strong></div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className={cx('final-cta', 'so-reveal')} visibleClassName={cx('is-visible')}>
          <span className={cx('pill', 'light-pill')}>Your future, brought closer</span>
          <h2>Start with one profile.<br /><em>Open more doors.</em></h2>
          <p>Free for students. Private by default. Ready when you are.</p>
          <Link className={cx('btn', 'light')} href="/auth/register/student">Create your free profile <b>→</b></Link>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  );
}
