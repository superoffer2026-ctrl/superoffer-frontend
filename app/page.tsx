import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { DossierSection } from '@/components/landing/sections/DossierSection';
import { EcosystemSection } from '@/components/landing/sections/EcosystemSection';
import { EditorialSection } from '@/components/landing/sections/EditorialSection';
import { FaqSection } from '@/components/landing/sections/FaqSection';
import { FinalCtaSection } from '@/components/landing/sections/FinalCtaSection';
import { FinanceSection } from '@/components/landing/sections/FinanceSection';
import { GlobalReachSection } from '@/components/landing/sections/GlobalReachSection';
import { HeroSection } from '@/components/landing/sections/HeroSection';
import { HowItWorksSection } from '@/components/landing/sections/HowItWorksSection';
import { InstitutionDeskSection } from '@/components/landing/sections/InstitutionDeskSection';
import { OutcomesBanner } from '@/components/landing/sections/OutcomesBanner';
import { ParadigmSection } from '@/components/landing/sections/ParadigmSection';
import { classNames } from '@/lib/cx';
import styles from '@/styles/landing/Landing.module.css';

const cx = classNames(styles);

/**
 * SuperOffer landing page.
 *
 * Each section is self-contained (component + CSS Module + a slice of
 * `components/landing/content.ts`), so a section can be restyled, reordered or
 * replaced without touching the others.
 */
export default function LandingPage() {
  return (
    <div className={cx('host')}>
      <LandingHeader />
      <main className={cx('main')}>
        <HeroSection />
        <OutcomesBanner />
        <ParadigmSection />
        <HowItWorksSection />
        <DossierSection />
        <FinanceSection />
        <InstitutionDeskSection />
        <EcosystemSection />
        <EditorialSection />
        <GlobalReachSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <LandingFooter />
    </div>
  );
}
