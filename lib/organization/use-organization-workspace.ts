'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { authApi } from '../api/auth-api';
import { ORGANIZATION_ROLES, homeForRole, organizationTypeFromRole } from '../models/organization';
import { clearAccessToken, isSessionExpired, readAccessToken } from '../storage';
import {
  ACADEMIC_PRESET_CATEGORIES,
  EMPTY_FILTERS,
  FINANCIAL_PRESET_CATEGORIES,
  ROLE_CONFIG,
  countActiveFilters,
  type DiscoveryFilters,
  type FilterGroup,
  type BankCriteria,
  type BankEvaluationMode,
  type BankEvaluationModeOption,
  type ConditionPreset,
  type LoanProduct,
  type Offer,
  type OfferStatus,
  type LegacyOfferTemplate,
  type OfferTemplate,
  type OrganizationOffer,
  type OrganizationProfile,
  type OrganizationView,
  type PlanOption,
  type Product,
  type Role,
  type SettingsTab,
  type TeamMember,
  type UniversityCriteria,
  type UniversityInterest,
  type WorkspaceCandidate,
  type WorkspaceStudent,
  type TemplateDraft
} from './workspace-data';

export type WorkspaceFilter = 'All' | 'Accepted' | 'Shortlisted' | 'Rejected' | 'Discover' | 'Offers' | 'Negotiating';

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const parseAmount = (v: string) => Number((v || '').replace(/[^0-9.]/g, '')) || 0;

const shortDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '';

const longDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const relativeTime = (iso: string) => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const initialsOf = (value: string) =>
  value.split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();

const matchBadgeFor = (score: number) =>
  score >= 90 ? 'Excellent match' : score >= 80 ? 'Strong match' : score >= 70 ? 'Good match' : 'Possible match';

/** An API product carries its rich fields inside `terms`; the workspace wants them flat. */
const toProduct = (row: Record<string, any>): Product => ({
  degreeLevel: 'Postgraduate', course: row.name, country: '', intakes: [], tuitionFee: '',
  scholarshipRange: '—', durationYears: 1, seats: 'Rolling',
  ...(row.terms || {}),
  id: row.id, name: row.name, category: row.category || '', url: row.url || '',
  createdAt: row.createdAt, lastModifiedAt: row.updatedAt || row.createdAt
});

const toLoanProduct = (row: Record<string, any>): LoanProduct => ({
  interestRateMin: 0, interestRateMax: 0, currency: 'INR', maxAmount: '',
  tenureOptions: [], collateralRequired: false, eligibleCountries: [],
  ...(row.terms || {}),
  id: row.id, name: row.name, category: row.category || '', url: row.url || '',
  createdAt: row.createdAt, lastModifiedAt: row.updatedAt || row.createdAt
});

/** The rich fields go back into `terms`; name/category/url are columns. */
const productTerms = (product: Partial<Product & LoanProduct>) => {
  const { id, name, category, url, createdAt, lastModifiedAt, ...terms } = product as Record<string, unknown> & Product;
  void id; void name; void category; void url; void createdAt; void lastModifiedAt;
  return terms as Record<string, unknown>;
};

export interface WorkspaceOptions {
  page: OrganizationView;
  tab?: string | null;
  studentId?: string | null;
}

/**
 * All organization-workspace state and behaviour.
 *
 * Every value here is either loaded from the API or derived from what was
 * loaded — the catalog, criteria, shortlist, team, offers, subscription and
 * discovered students all live on the server, and every action writes through
 * an endpoint and then reloads what it changed.
 */
export function useOrganizationWorkspace({ page, tab, studentId }: WorkspaceOptions) {
  const router = useRouter();

  const [role, setRole] = useState<Role>('UNIVERSITY');
  const cfg = ROLE_CONFIG[role];

  const [view, setView] = useState<OrganizationView>('dashboard');
  const [templatesTab, setTemplatesTab] = useState<'templates' | 'catalog' | 'criteria'>('templates');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('org');
  const [workspaceFilter, setWorkspaceFilter] = useState<WorkspaceFilter>('All');
  const [toast, setToast] = useState('');

  // ── Server state ──────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<OrganizationProfile | null>(null);
  const [user, setUser] = useState<{ full_name: string; email: string } | null>(null);
  const [apiProducts, setApiProducts] = useState<Record<string, any>[]>([]);
  const [students, setStudents] = useState<WorkspaceStudent[]>([]);
  const [orgOffers, setOrgOffers] = useState<OrganizationOffer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<DiscoveryFilters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [presetConditions, setPresetConditions] = useState<ConditionPreset[]>([]);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  /** What this organisation was sold and what has been received. Read-only. */
  const [billing, setBilling] = useState<Awaited<ReturnType<typeof authApi.organizationBilling>> | null>(null);
  const [bankEvaluationModeOptions, setBankEvaluationModeOptions] = useState<BankEvaluationModeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadError, setLoadError] = useState('');

  // ── Editable copies of server state ───────────────────────────────────────
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [orgCity, setOrgCity] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });

  // ── Draft/modal state ─────────────────────────────────────────────────────
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [chatDraft, setChatDraft] = useState('');
  const [chatFile, setChatFile] = useState<File | null>(null);
  /** Which of a candidate's offers the conversation pane is showing. */
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [offerDraft, setOfferDraft] = useState<any>(null);
  const [catalogDraft, setCatalogDraft] = useState<any>(null);

  /** The offers each product is prepared to make, and the one being edited. */
  const [offerTemplates, setOfferTemplates] = useState<OfferTemplate[]>([]);
  /** The ones put away. Kept apart from the live list, which every other screen reads. */
  const [archivedTemplates, setArchivedTemplates] = useState<OfferTemplate[]>([]);
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft | null>(null);
  /** The candidate a one-click invitation is being sent to, once a product is picked. */
  const [quickInvite, setQuickInvite] = useState<{ candidate: WorkspaceCandidate; productId: string } | null>(null);
  const [productInviteDraft, setProductInviteDraft] = useState<any>(null);
  const [negotiationOffer, setNegotiationOffer] = useState<Offer | null>(null);
  const [negotiationReply, setNegotiationReply] = useState('');
  const [inviteDraft, setInviteDraft] = useState<{ name: string; email: string; role: string } | null>(null);

  const toastTimer = useRef<number | undefined>(undefined);
  const profileSeeded = useRef(false);

  const advancedFeatures = ['Advanced Filters', 'Priority Discovery', 'AI Recommendations'];

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
  }, []);

  const requireToken = useCallback(() => {
    const token = readAccessToken();
    if (!token) router.push('/auth/login/university');
    return token;
  }, [router]);

  /** Every write funnels its failure through here so a dead session is handled once. */
  const reportFailure = useCallback((e: unknown, fallback: string) => {
    if (isSessionExpired(e)) {
      clearAccessToken();
      router.replace('/auth/login/university?sessionExpired=1');
      return;
    }
    /** 403 means this account has no business in the workspace at all. */
    if ((e as { status?: number })?.status === 403) {
      router.replace('/');
      return;
    }
    notify(e instanceof Error ? e.message : fallback);
  }, [router, notify]);

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadProfile = useCallback(async (token: string) => {
    const next = (await authApi.organizationProfile(token)) as OrganizationProfile;
    setProfile(next);
    if (!profileSeeded.current) {
      setOrgName(next.name || '');
      setOrgDomain(next.website || '');
      setOrgCity([next.city, next.country].filter(Boolean).join(', '));
      setOrgDescription(next.description || '');
      profileSeeded.current = true;
    }
    return next;
  }, []);

  const loadBilling = useCallback(async (token: string) => {
    /** A suspended organisation can still read its own bill, so this must not
     *  take the workspace down with it if anything else is refused. */
    try {
      setBilling(await authApi.organizationBilling(token));
    } catch {
      setBilling(null);
    }
  }, []);

  /** Dates on a bill read better long-form than as an ISO string. */
  const fmtDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const loadProducts = useCallback(async (token: string) => {
    setApiProducts(((await authApi.organizationProducts(token)) || []) as Record<string, any>[]);
  }, []);

  /** Filters go to the API as query parameters — the server decides who matches. */
  const loadStudents = useCallback(async (token: string, query: DiscoveryFilters = EMPTY_FILTERS) => {
    const response = await authApi.organizationStudents(token, query as unknown as Record<string, string>);
    setStudents(((response?.results || []) as WorkspaceStudent[]));
  }, []);

  const loadOffers = useCallback(async (token: string) => {
    const response = await authApi.organizationOffers(token);
    setOrgOffers(((response?.offers || []) as OrganizationOffer[]));
  }, []);

  const loadTeam = useCallback(async (token: string) => {
    setTeamMembers(((await authApi.organizationTeam(token)) || []) as TeamMember[]);
  }, []);

  const loadShortlist = useCallback(async (token: string) => {
    const response = await authApi.organizationShortlist(token);
    setShortlistedIds(new Set<string>(response?.studentUserIds || []));
    setRejectedIds(new Set<string>(response?.rejectedUserIds || []));
  }, []);

  /** One pass over everything the workspace renders. */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/university');
        return;
      }
      try {
        const account = await authApi.currentUser(token);
        if (cancelled) return;

        /**
         * A student who opens an organization URL would otherwise sit here
         * watching every organization call return 403. Send them home instead.
         */
        if (!ORGANIZATION_ROLES.includes(account.role)) {
          router.replace(homeForRole(account.role));
          return;
        }

        /*
         * An unapproved organisation may sign in, but the workspace has nothing
         * to show it: every call behind it returns 403 by design. Send it to
         * the page where it can actually do something instead of loading a
         * shell full of empty panels.
         */
        if (account.approval_status && account.approval_status !== 'APPROVED') {
          router.replace('/organization/verification');
          return;
        }

        setUser({ full_name: account.full_name || '', email: account.email || '' });
        setRole(
          (account.organization?.organizationType as Role) || organizationTypeFromRole(account.role)
        );

        await Promise.all([
          loadProfile(token),
          loadBilling(token),
          loadProducts(token),
          loadTemplates(token),
          loadStudents(token, filters),
          loadOffers(token),
          loadTeam(token),
          loadShortlist(token)
        ]);

        const [presets, options] = await Promise.all([
          authApi.getOfferConditionPresets(),
          authApi.getOrganizationOptions()
        ]);
        if (cancelled) return;
        setPresetConditions(presets.presets);
        setPlanOptions(options.plans);
        setBankEvaluationModeOptions(options.bankEvaluationModes as BankEvaluationModeOption[]);
      } catch (e) {
        if (cancelled) return;
        /** A revoked or expired token means signed out, not "no data". */
        if (isSessionExpired(e)) {
          clearAccessToken();
          router.replace('/auth/login/university?sessionExpired=1');
          return;
        }
        if ((e as { status?: number })?.status === 403) {
          router.replace('/');
          return;
        }
        setLoadError(e instanceof Error ? e.message : 'Could not load your workspace.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router, loadProfile, loadProducts, loadStudents, loadOffers, loadTeam, loadShortlist]);

  /**
   * Re-queries discovery whenever a filter changes. Debounced so typing in the
   * search box doesn't fire a request per keystroke, and skipped until the first
   * load has finished so it can't race it.
   */
  useEffect(() => {
    if (loading) return;
    const token = readAccessToken();
    if (!token) return;

    const timer = window.setTimeout(() => {
      setSearching(true);
      /** Errors are reported, never left to escape as an unhandled rejection. */
      loadStudents(token, filters)
        .catch(e => reportFailure(e, 'Those filters could not be applied.'))
        .finally(() => setSearching(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [filters, loading, loadStudents, reportFailure]);

  // ── Route → view ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (page === 'catalog') {
      setView('templates');
      setTemplatesTab('catalog');
    } else if (page === 'criteria') {
      setView('templates');
      setTemplatesTab('criteria');
    } else if (page === 'reports') {
      setView('dashboard');
    } else if (page === 'shortlists') {
      setView('students');
      setWorkspaceFilter('Shortlisted');
    } else if (page === 'invitations') {
      setView('students');
      setWorkspaceFilter('Offers');
    } else if (page === 'subscription') {
      setView('profile');
      setSettingsTab('subscription');
    } else if (page === 'settings') {
      setView('profile');
    } else if (page) {
      setView(page);
    }
  }, [page]);

  useEffect(() => {
    if (!tab) return;
    if (tab === 'catalog' || tab === 'criteria' || tab === 'templates') setTemplatesTab(tab);
    if (tab === 'shortlisted' || tab === 'Shortlisted') setWorkspaceFilter('Shortlisted');
    if (tab === 'offers' || tab === 'Offers') setWorkspaceFilter('Offers');
    if (tab === 'negotiating' || tab === 'Negotiating') setWorkspaceFilter('Negotiating');
    if (tab === 'accepted' || tab === 'Accepted') setWorkspaceFilter('Accepted');
    if (tab === 'discover' || tab === 'Discover') setWorkspaceFilter('Discover');
    if (['subscription', 'org', 'accreditation', 'team', 'notifications', 'security'].includes(tab)) {
      setSettingsTab(tab as SettingsTab);
    }
  }, [tab]);

  useEffect(() => {
    if (!studentId) return;
    setView('students');
    setSelectedOfferId(studentId);
  }, [studentId]);

  // ── Derived catalog, criteria, templates ──────────────────────────────────

  const products = useMemo(
    () => (role === 'UNIVERSITY' ? apiProducts.map(toProduct) : []),
    [role, apiProducts]
  );

  const loanProducts = useMemo(
    () => (role === 'BANK' ? apiProducts.map(toLoanProduct) : []),
    [role, apiProducts]
  );

  const templates = useMemo<LegacyOfferTemplate[]>(() => (profile?.offerTemplates as LegacyOfferTemplate[]) || [], [profile]);
  const notificationPrefs = useMemo(() => profile?.notificationPrefs || [], [profile]);

  const uniCriteria = useMemo<UniversityCriteria>(
    () => ({
      minCgpa: 7.5, minEnglishScore: 6.5, englishTest: 'IELTS',
      preferredCurricula: '', targetCountries: '',
      ...(profile?.criteria as Partial<UniversityCriteria>)
    }),
    [profile]
  );

  const bankCriteria = useMemo<BankCriteria>(
    () => ({
      guarantorRequired: true, maxFamilyIncome: 0, eligibleCountries: '',
      ...(profile?.criteria as Partial<BankCriteria>)
    }),
    [profile]
  );

  const bankEvaluationMode: BankEvaluationMode = profile?.bankEvaluationMode || 'ACADEMIC_AND_OFFER';

  const currentPlan = profile?.subscription.plan || 'Professional';
  const profilesViewed = profile?.subscription.profilesViewed ?? 0;
  const planQuotaLabel = profile?.subscription.capacity === null ? 'Unlimited' : String(profile?.subscription.capacity ?? 0);
  const remainingCredits = profile?.subscription.remaining === null ? 'Unlimited' : profile?.subscription.remaining ?? 0;
  const quotaPercent = profile?.subscription.quotaPercent ?? 0;

  // ── Match scoring, derived from the org's own criteria and catalog ────────

  const uniTargetCountriesList = (uniCriteria.targetCountries || '').split(',').map(s => s.trim()).filter(Boolean);
  const bankEligibleCountriesList = (bankCriteria.eligibleCountries || '').split(',').map(s => s.trim()).filter(Boolean);

  const matchFactors = useCallback((s: WorkspaceStudent): Array<{ label: string; weight: number; score: number }> => {
    let scores: number[];
    if (role === 'BANK') {
      const productMaxAmounts = loanProducts.map(p => parseAmount(p.maxAmount)).filter(n => n > 0);
      const productMax = productMaxAmounts.length ? Math.max(...productMaxAmounts) : 5000000;
      const loanRatio = s.requiredLoanAmount ? Math.min(1.4, s.requiredLoanAmount / productMax) : 0.3;
      let financialNeedFit = clamp(95 - loanRatio * 45);
      if (s.familyIncome && bankCriteria.maxFamilyIncome && s.familyIncome > bankCriteria.maxFamilyIncome) {
        financialNeedFit = clamp(financialNeedFit - 20);
      }

      const rank: Record<string, number> = { Admitted: 4, Selected: 3, Shortlisted: 2, 'Offer Sent': 1 };
      const bestStatus = (s.universityInterests || []).reduce(
        (best: string, u: UniversityInterest) => ((rank[u.status] || 0) > (rank[best] || 0) ? u.status : best),
        ''
      );
      const statusScoreMap: Record<string, number> = { Admitted: 100, Selected: 85, Shortlisted: 65, 'Offer Sent': 55, '': 25 };
      const admissionStatusFit = statusScoreMap[bestStatus] ?? 25;

      const countryEligibilityFit = !bankEligibleCountriesList.length || bankEligibleCountriesList.includes(s.country) ? 100 : 30;

      let guarantorCompleteness = clamp((s.documentsVerified / 5) * 100);
      if (bankCriteria.guarantorRequired && s.documentsVerified < 5) guarantorCompleteness = clamp(guarantorCompleteness - 15);

      scores = [financialNeedFit, admissionStatusFit, countryEligibilityFit, guarantorCompleteness];
    } else {
      const academicFit = clamp(50 + (s.cgpaValue - uniCriteria.minCgpa) * 15);

      const testDelta = s.englishTest === uniCriteria.englishTest ? s.englishScore - uniCriteria.minEnglishScore : 0;
      let testScoreFit = clamp(60 + testDelta * 8);
      if (s.gre) testScoreFit = clamp((testScoreFit + (s.gre >= 310 ? 90 : 70)) / 2);
      if (s.gmat) testScoreFit = clamp((testScoreFit + (s.gmat >= 650 ? 90 : 70)) / 2);

      const matchingProduct = products.find(p => p.course === s.course);
      const courseAlignment = matchingProduct ? 92 : 55;

      const inTargetCountry = !uniTargetCountriesList.length || uniTargetCountriesList.includes(s.country);
      const intakeMatches = matchingProduct ? matchingProduct.intakes.includes(s.intake) : false;
      const countryIntakeAlignment = inTargetCountry && intakeMatches ? 95 : inTargetCountry ? 65 : 35;

      const scholarshipAvailable = !!matchingProduct?.scholarshipRange && matchingProduct.scholarshipRange !== '—';
      const budgetScholarshipFit = s.scholarshipSeeking ? (scholarshipAvailable ? 88 : 45) : 90;

      scores = [academicFit, testScoreFit, courseAlignment, countryIntakeAlignment, budgetScholarshipFit];
    }
    return cfg.weightFactors.map((f: { label: string; weight: number }, i: number) => ({ label: f.label, weight: f.weight, score: scores[i] }));
  }, [role, loanProducts, bankCriteria, bankEligibleCountriesList, uniCriteria, products, uniTargetCountriesList, cfg]);

  const overallScore = useCallback((s: WorkspaceStudent): number => {
    const factors = matchFactors(s);
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0) || 1;
    return Math.round(factors.reduce((sum, f) => sum + f.score * f.weight, 0) / totalWeight);
  }, [matchFactors]);

  // ── Offers, in the shape the dashboard analytics expect ───────────────────

  const offers = useMemo<Offer[]>(
    () =>
      orgOffers.map(offer => {
        const terms = offer.terms || {};
        const respondedHours = offer.respondedAt
          ? Math.max(1, Math.round((new Date(offer.respondedAt).getTime() - new Date(offer.sentAt).getTime()) / 3600000))
          : undefined;
        return {
          id: offer.id,
          student: offer.studentName,
          initials: initialsOf(offer.studentName),
          course: offer.program,
          deadline: longDate(offer.expiresAt),
          status: offer.status,
          sent: shortDate(offer.sentAt),
          sentAt: new Date(offer.sentAt).getTime(),
          responseHours: respondedHours,
          scholarship: terms.scholarship || offer.value || '',
          tuition: terms.tuition || '',
          accommodation: terms.accommodation || '',
          loanAmount: terms.loanAmount || '',
          interestRate: terms.interestRate || '',
          emi: terms.emi || '',
          processingFee: terms.processingFee || '',
          tenure: terms.tenure || '',
          conditions: offer.conditions,
          offerType: terms.offerType,
          productName: terms.productName,
          negotiationMessages: offer.messages.map(message => ({
            from: message.from,
            author: message.author,
            body: message.body,
            time: relativeTime(message.sentAt)
          }))
        };
      }),
    [orgOffers]
  );

  const displayStatus = (offer: Offer): OfferStatus => offer.status;
  const isTerminal = (offer: Offer) => ['Accepted', 'Rejected', 'Withdrawn', 'Expired'].includes(offer.status);

  const offerTone = (status: OfferStatus) =>
    status === 'Accepted' ? 'positive' : status === 'Negotiating' ? 'warning' : ['Rejected', 'Withdrawn', 'Expired'].includes(status) ? 'warning' : 'neutral';

  const offerIcon = (status: OfferStatus) =>
    status === 'Accepted' ? '✓' : status === 'Negotiating' ? '↔' : status === 'Rejected' ? '✕' : status === 'Withdrawn' ? '⊘' : status === 'Expired' ? '⏱' : status === 'Viewed' ? '◉' : '↗';

  const offerPrimary = (offer: Offer) => (role === 'BANK' ? offer.loanAmount || '' : offer.scholarship || 'Admission offer');
  const offerSecondary = (offer: Offer) => (role === 'BANK' ? offer.interestRate || '' : offer.tuition || '');

  const acceptanceRate = offers.length ? Math.round((offers.filter(o => o.status === 'Accepted').length / offers.length) * 100) : 0;

  const avgResponseTime = (() => {
    const withResponse = offers.filter(o => o.responseHours !== undefined);
    if (!withResponse.length) return '—';
    const avgHours = withResponse.reduce((sum, o) => sum + (o.responseHours || 0), 0) / withResponse.length;
    return avgHours >= 24 ? `${(avgHours / 24).toFixed(1)} days` : `${Math.round(avgHours)} hrs`;
  })();

  const funnelStages = (() => {
    const total = offers.length || 1;
    const viewedPlus = offers.filter(o => ['Viewed', 'Negotiating', 'Accepted', 'Rejected'].includes(o.status)).length;
    const negotiatingPlus = offers.filter(o => ['Negotiating', 'Accepted'].includes(o.status)).length;
    const accepted = offers.filter(o => o.status === 'Accepted').length;
    return [
      { label: 'Sent', count: offers.length, percent: 100 },
      { label: 'Viewed', count: viewedPlus, percent: Math.round((viewedPlus / total) * 100) },
      { label: 'Negotiating', count: negotiatingPlus, percent: Math.round((negotiatingPlus / total) * 100) },
      { label: 'Accepted', count: accepted, percent: Math.round((accepted / total) * 100) }
    ];
  })();

  const performanceBars = (() => {
    const buckets = new Map<string, { total: number; accepted: number }>();
    for (const offer of offers) {
      const label = role === 'BANK'
        ? (() => {
            const rate = parseFloat(offer.interestRate || '');
            return isNaN(rate) ? 'Unrated' : `${Math.floor(rate)}–${Math.floor(rate) + 1}%`;
          })()
        : offer.course;
      const entry = buckets.get(label) || { total: 0, accepted: 0 };
      entry.total++;
      if (offer.status === 'Accepted') entry.accepted++;
      buckets.set(label, entry);
    }
    return [...buckets.entries()].map(([label, { total, accepted }]) => ({ label, percent: total ? Math.round((accepted / total) * 100) : 0 }));
  })();

  const rankedInsights = (() => {
    if (role === 'BANK') {
      return performanceBars.slice(0, 4).map(bar => ({ icon: '%', label: bar.label, detail: 'Interest rate band', value: `${bar.percent}% accept` }));
    }
    const bands = [
      { min: 90, max: 101, label: '90–100 match' },
      { min: 80, max: 90, label: '80–89 match' },
      { min: 70, max: 80, label: '70–79 match' },
      { min: 0, max: 70, label: 'Below 70 match' }
    ];
    return bands.map(band => {
      const inBand = offers.filter(offer => {
        const student = students.find(s => s.name === offer.student);
        const score = student ? overallScore(student) : 0;
        return score >= band.min && score < band.max;
      });
      const accepted = inBand.filter(o => o.status === 'Accepted').length;
      return {
        icon: '◆',
        label: band.label,
        detail: `${inBand.length} invitation${inBand.length === 1 ? '' : 's'}`,
        value: inBand.length ? `${Math.round((accepted / inBand.length) * 100)}% accept` : '—'
      };
    });
  })();

  const savedStudents = students.filter(s => shortlistedIds.has(s.id));

  const notifications = [
    ...offers.slice(0, 3).map(offer => ({
      id: offer.id,
      icon: offerIcon(offer.status),
      tone: offerTone(offer.status),
      title: `${offer.student}'s offer is ${displayStatus(offer).toLowerCase()}`,
      detail: offer.course,
      when: offer.sent
    })),
    { id: 'shortlist-summary', icon: '★', tone: 'positive', title: `${savedStudents.length} students saved`, detail: 'Review your shortlist and send offers.', when: 'Today' }
  ];

  // ── Candidates workspace ──────────────────────────────────────────────────

  /** A discoverable student joined with this organization's offer and triage decision. */
  const candidates = useMemo<WorkspaceCandidate[]>(
    () =>
      students.map(student => {
        /** Newest first, so the default thread is the most recent conversation. */
        const studentOffers = orgOffers
          .filter(row => row.studentUserId === student.id && row.status !== 'Withdrawn')
          .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
        const offer = studentOffers.find(row => row.id === selectedThreadId) || studentOffers[0];
        const score = overallScore(student);
        const status: WorkspaceCandidate['status'] = offer
          ? 'Accepted'
          : rejectedIds.has(student.id)
            ? 'Rejected'
            : shortlistedIds.has(student.id)
              ? 'Shortlisted'
              : 'Pending';

        return {
          id: student.id,
          name: student.name,
          initials: student.initials,
          avatarColor: student.color,
          avatarUrl: student.photo,
          email: student.email,
          mobile: student.mobile,
          currentCity: student.currentCity,
          originCountry: student.originCountry,
          futureInterests: student.futureInterests || student.course,
          degree: student.degree,
          course: offer?.program || student.course,
          targetCountry: student.country,
          cgpa: student.cgpa,
          examScore: student.examScore,
          budget: student.budget,
          documentsVerified: student.documentsVerified,
          workExperienceYears: student.workExperienceYears,
          skills: student.skills,
          bio: student.bio,
          intake: student.intake,
          headline: offer?.headline || `${matchBadgeFor(score)} for ${student.course || 'your products'}`,
          matchScore: score,
          matchBadge: matchBadgeFor(score),
          offerId: offer?.id,
          offers: studentOffers.map(row => ({
            id: row.id,
            headline: row.headline,
            program: row.program,
            status: row.status,
            unread: row.unread || 0,
            sentAt: row.sentAt
          })),
          offerType: offer?.category || (role === 'BANK' ? 'Loan' : 'Admission'),
          offerValueLabel: offer?.valueLabel || (role === 'BANK' ? 'Loan amount' : 'Scholarship'),
          offerValue: offer?.value || 'Not yet offered',
          /** What the other side of the deal has already offered this student. */
          counterparty: student.counterparty,
          /** Present only for lenders, and only once the family has agreed. */
          loanReadiness: student.loanReadiness,
          /** The answers themselves, for the profile a university is paying to read. */
          detail: student.detail,
          deadline: offer ? longDate(offer.expiresAt) : 'No invitation sent',
          received: offer ? shortDate(offer.sentAt) : shortDate(student.submittedAt),
          status,
          /** An offer's own conditions, or none — there is no stand-in to invent. */
          conditions: offer?.conditions || '',
          /**
           * Only what the organisation actually wrote. The three-line fallback that
           * used to sit here was shown to every candidate as if it were their own
           * checklist; the panel no longer renders these, and inventing them for a
           * future one would put the same words back.
           */
          nextSteps: offer?.nextSteps || [],
          unread: offer?.unread || 0,
          messages: (offer?.messages || []).map(message => ({
            id: message.id,
            from: message.from,
            author: message.author,
            body: message.body,
            time: relativeTime(message.sentAt),
            automatic: message.automatic,
            attachment: message.attachment
          }))
        };
      }),
    [students, orgOffers, shortlistedIds, rejectedIds, overallScore, role, selectedThreadId]
  );

  const filteredWorkspaceOffers = (() => {
    if (workspaceFilter === 'All') return candidates;
    if (workspaceFilter === 'Discover') return candidates.filter(c => c.status === 'Pending');
    if (workspaceFilter === 'Offers') return candidates.filter(c => !!c.offerId);
    if (workspaceFilter === 'Negotiating') return candidates.filter(c => c.messages.length > 1);
    return candidates.filter(c => c.status === workspaceFilter);
  })();

  /** The reading pane follows the visible list, so a filter never leaves it
   *  showing someone the list has just excluded. */
  const selectedOfferItem =
    filteredWorkspaceOffers.find(c => c.id === selectedOfferId) || filteredWorkspaceOffers[0];

  /** Picking a different candidate drops the thread choice made on the last one. */
  useEffect(() => {
    setSelectedThreadId('');
  }, [selectedOfferId]);

  const countWorkspaceOffers = (status: string) => candidates.filter(c => c.status === status).length;

  /** Shortlisting and rejecting are both shortlist rows; clearing removes the row. */
  const setOfferStatus = async (candidate: WorkspaceCandidate, status: WorkspaceCandidate['status']) => {
    const token = requireToken();
    if (!token) return;
    try {
      if (status === 'Shortlisted') await authApi.addToShortlist(token, candidate.id, 'SHORTLISTED');
      else if (status === 'Rejected') await authApi.addToShortlist(token, candidate.id, 'REJECTED');
      else await authApi.removeFromShortlist(token, candidate.id);
      await loadShortlist(token);
      if (status === 'Shortlisted') notify(`Candidate ${candidate.name} shortlisted`);
      else if (status === 'Rejected') notify(`Candidate ${candidate.name} rejected`);
      else notify(`${candidate.name} moved back to review`);
    } catch (e) {
      reportFailure(e, 'That change could not be saved.');
    }
  };

  /** Sending an invitation creates a real offer the student will see in their wallet. */
  /**
   * One click from a candidate row: choose the product, and the offer its
   * template already describes goes out.
   *
   * Nothing is composed here. The terms an officer sends are the terms the
   * organisation wrote against that product, which is what makes a single click
   * a responsible thing to offer at all.
   */
  const openQuickInvite = (candidate: WorkspaceCandidate) => {
    if (candidate.offerId) {
      notify(`An invitation is already open with ${candidate.name}`);
      return;
    }
    setQuickInvite({ candidate, productId: '' });
  };

  const sendQuickInvite = async () => {
    const token = requireToken();
    if (!token || !quickInvite?.productId) return;

    try {
      await authApi.quickInvite(token, {
        studentUserId: quickInvite.candidate.id,
        productId: quickInvite.productId
      });
      await loadOffers(token);
      notify(`Invitation sent to ${quickInvite.candidate.name}`);
      setQuickInvite(null);
    } catch (e) {
      reportFailure(e, 'That invitation could not be sent.');
    }
  };

  // ── The offers each product is prepared to make ──────────────────────────

  const loadTemplates = useCallback(async (token: string) => {
    try {
      const payload = await authApi.offerTemplates(token);
      setOfferTemplates(payload.templates || []);
    } catch {
      /** A products page that cannot list templates still lists products. */
    }
    try {
      const payload = await authApi.archivedOfferTemplates(token);
      setArchivedTemplates(payload.templates || []);
    } catch {
      /** The drawer stays empty rather than taking the live list down with it. */
    }
  }, []);

  const saveTemplate = async (productId: string, input: Record<string, unknown>, id?: string) => {
    const token = requireToken();
    if (!token) return;
    try {
      if (id) await authApi.updateOfferTemplate(token, id, input);
      else await authApi.createOfferTemplate(token, productId, input);
      await loadTemplates(token);
      setTemplateDraft(null);
      notify(id ? 'Template saved' : 'Template added');
    } catch (e) {
      reportFailure(e, 'That template could not be saved.');
    }
  };

  /** Archived rather than deleted: offers already sent on it still point at it. */
  const archiveTemplate = async (id: string) => {
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.archiveOfferTemplate(token, id);
      await loadTemplates(token);
      notify('Template archived');
    } catch (e) {
      reportFailure(e, 'That template could not be archived.');
    }
  };

  /**
   * Brings one back out of the archive. It returns as an ordinary template
   * rather than as the one-click default, so restoring something a colleague
   * put away does not silently change what a single click now sends.
   */
  const restoreTemplate = async (id: string) => {
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.restoreOfferTemplate(token, id);
      await loadTemplates(token);
      notify('Template restored');
    } catch (e) {
      reportFailure(e, 'That template could not be restored.');
    }
  };

  const makeTemplateDefault = async (id: string) => {
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.updateOfferTemplate(token, id, { isDefault: true });
      await loadTemplates(token);
      notify('This is now the one-click offer for that product');
    } catch (e) {
      reportFailure(e, 'That could not be set as the default.');
    }
  };

  const sendChatMessage = async () => {
    const text = chatDraft.trim();
    if ((!text && !chatFile) || !selectedOfferItem) return;
    if (!selectedOfferItem.offerId) {
      notify('Send an invitation first — messages belong to an offer.');
      return;
    }
    const token = requireToken();
    if (!token) return;

    const file = chatFile;
    setChatDraft('');
    setChatFile(null);
    try {
      await authApi.messageOrganizationOffer(token, selectedOfferItem.offerId, text || `Sent ${file?.name}`, file || undefined);
      await loadOffers(token);
      notify(`Message sent to ${selectedOfferItem.name}`);
    } catch (e) {
      reportFailure(e, 'That message could not be sent.');
    }
  };

  /** Attachments sit behind bearer auth, so they open through a blob URL. */
  const openAttachment = async (messageId: string) => {
    const token = requireToken();
    if (!token || !selectedOfferItem?.offerId) return;
    try {
      const url = await authApi.organizationAttachmentUrl(token, selectedOfferItem.offerId, messageId);
      window.open(url, '_blank', 'noopener');
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      reportFailure(e, 'That attachment could not be opened.');
    }
  };

  /**
   * Refreshes the open thread on a timer. Polling rather than a socket: it is a
   * few lines, needs no sticky sessions, and an eight-second delay on a reply is
   * acceptable for this conversation.
   */
  useEffect(() => {
    if (view !== 'students') return;
    /** Faster while a thread is open; slower when only the unread badges on the
     *  candidate list need to stay current. */
    const interval = selectedOfferItem?.offerId ? 8000 : 20000;
    const timer = window.setInterval(() => {
      const token = readAccessToken();
      if (token) void loadOffers(token).catch(() => {});
    }, interval);
    return () => window.clearInterval(timer);
  }, [view, selectedOfferItem?.offerId, loadOffers]);

  /** Opening a thread clears the organization's badge for it. */
  useEffect(() => {
    const offerId = selectedOfferItem?.offerId;
    if (!offerId || !selectedOfferItem?.unread) return;
    const token = readAccessToken();
    if (!token) return;
    void authApi.markOrganizationThreadRead(token, offerId).then(() => loadOffers(token)).catch(() => {});
  }, [selectedOfferItem?.offerId, selectedOfferItem?.unread, loadOffers]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const go = (next: OrganizationView) => {
    if (next === 'students') {
      setWorkspaceFilter('All');
      router.push('/organization/students');
      return;
    }
    if (next === 'shortlists') {
      setWorkspaceFilter('Shortlisted');
      router.push('/organization/students?tab=shortlisted');
      return;
    }
    if (next === 'invitations') {
      setWorkspaceFilter('Offers');
      router.push('/organization/students?tab=offers');
      return;
    }
    if (next === 'catalog') {
      setTemplatesTab('catalog');
      router.push('/organization/templates?tab=catalog');
      return;
    }
    if (next === 'criteria') {
      setTemplatesTab('criteria');
      router.push('/organization/templates?tab=criteria');
      return;
    }
    if (next === 'reports') {
      router.push('/organization/dashboard');
      return;
    }
    if (next === 'subscription') {
      setSettingsTab('subscription');
      router.push('/organization/profile?tab=subscription');
      return;
    }
    if (next === 'settings') {
      router.push('/organization/profile');
      return;
    }
    router.push(`/organization/${next}`);
  };

  const navLabel = (id: OrganizationView): string => {
    if (id === 'students' || id === 'shortlists' || id === 'invitations') return 'Candidates & Offers';
    if (id === 'templates') return 'Templates & Criteria';
    if (id === 'catalog') return cfg.catalogTitle;
    if (id === 'criteria') return cfg.criteriaTitle;
    return NAVIGATION.find(n => n.id === id)?.label || '';
  };

  // ── Products / catalog ────────────────────────────────────────────────────

  /**
   * The category is what kind of organisation is issuing, not a choice: a
   * university offers places, a bank offers money, and neither can offer the
   * other's. It is set here so a new product is already correct, and shown
   * rather than asked in the form.
   */
  const openCatalogModal = (item?: Product | LoanProduct) => {
    const category = role === 'BANK' ? 'Financial Product' : 'Academic Product';
    setCatalogDraft(
      item
        ? { ...item, url: item.url || '', category: item.category || category }
        : { id: '', name: '', category, url: '' }
    );
  };

  /** Uploaded straight to the programme, so the image is stored against the row. */
  const uploadProgramImage = async (productId: string, file: File) => {
    const token = requireToken();
    if (!token) return;
    try {
      const { imageUrl } = await authApi.uploadProductImage(token, productId, file);
      setCatalogDraft((current: any) => (current ? { ...current, imageUrl } : current));
      await loadProducts(token);
      notify('Programme image updated');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'That image could not be uploaded');
    }
  };

  /** The organisation's own logo and cover — theirs to maintain, not ours. */
  const uploadOrganizationImage = async (kind: 'logo' | 'cover', file: File) => {
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.uploadOrganizationImage(token, kind, file);
      await loadProfile(token);
      notify(kind === 'logo' ? 'Logo updated' : 'Cover image updated');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'That image could not be uploaded');
    }
  };

  const saveCatalogItem = async (extras: Record<string, unknown> = {}) => {
    if (!catalogDraft?.name) return;
    const token = requireToken();
    if (!token) return;

    const existing = apiProducts.find(row => row.id === catalogDraft.id);
    const isAcademic = role !== 'BANK';
    const payload = {
      name: catalogDraft.name,
      category: catalogDraft.category || (role === 'BANK' ? 'Financial Product' : 'Academic Product'),
      /**
       * A lender's product still carries a link; the academic form no longer
       * asks for one, so the key is left out rather than sent empty — the
       * server writes `url` straight through, and `''` would wipe a link a
       * university set before the field was retired.
       */
      ...(isAcademic ? {} : { url: catalogDraft.url || '' }),
      /**
       * The academic fields go as themselves; `terms` keeps only what an admin
       * added. A student comparing universities needs tuition and duration to
       * mean the same thing in every offer, which a free-form blob cannot promise.
       *
       * `fieldOfStudy`, `studyMode` and `scholarshipInfo` are deliberately
       * absent: the MVP form stopped asking for them, nothing matches or filters
       * on any of them, and the server only writes a column whose key it was
       * sent — so a course that already has one keeps it through an edit.
       */
      degreeLevel: catalogDraft.degreeLevel || undefined,
      durationMonths: catalogDraft.durationMonths ? Number(catalogDraft.durationMonths) : undefined,
      campusLocation: catalogDraft.campusLocation || undefined,
      intakes: (catalogDraft.intakesText ?? (catalogDraft.intakes || []).join(', '))
        .split(',').map((part: string) => part.trim()).filter(Boolean),
      tuitionFee: catalogDraft.tuitionFee === '' || catalogDraft.tuitionFee === undefined
        ? undefined
        : Number(catalogDraft.tuitionFee),
      currency: catalogDraft.currency || undefined,
      terms: { ...(existing?.terms || {}), ...extras }
    };

    try {
      if (existing) await authApi.updateOrganizationProduct(token, existing.id, payload);
      else await authApi.createOrganizationProduct(token, payload);
      await loadProducts(token);
      setCatalogDraft(null);
      notify('Saved');
    } catch (e) {
      reportFailure(e, 'That product could not be saved.');
    }
  };

  const downloadCsvTemplate = () => {
    const isBank = role === 'BANK';
    const csvContent = isBank
      ? 'Product Name,Product URL,Product Category\nUnsecured Study Loan,https://example.com/loan,Financial Product\n'
      : 'Product Name,Product URL,Product Category\nMSc Data Science,https://example.com/msc-data-science,Academic Product\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', isBank ? 'LoanProducts_Template.csv' : 'Products_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /** The file is parsed here only to build rows; the server creates them. */
  const importProducts = (file: File, reset: () => void) => {
    const reader = new FileReader();
    reader.onload = async event => {
      const text = String(event.target?.result || '');
      if (!text) return;

      const rows = text
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.split(','))
        .map(columns => ({
          name: (columns[0] || '').replace(/^"|"$/g, '').trim(),
          url: columns.length >= 2 ? columns[1].replace(/^"|"$/g, '').trim() : '',
          category: columns.length >= 3 ? columns[2].replace(/^"|"$/g, '').trim() : ''
        }))
        .filter(row => row.name && !['product name', 'name'].includes(row.name.toLowerCase()))
        .map(row => ({
          name: row.name,
          url: row.url,
          category: row.category || (role === 'BANK' ? 'Financial Product' : 'Academic Product'),
          terms: {}
        }));

      if (!rows.length) {
        notify('No valid items found in the CSV.');
        reset();
        return;
      }

      const token = requireToken();
      if (!token) return;
      try {
        await authApi.importOrganizationProducts(token, rows);
        await loadProducts(token);
        notify(`Imported ${rows.length} ${role === 'BANK' ? 'loan products' : 'products'} successfully!`);
      } catch (e) {
        reportFailure(e, 'That file could not be imported.');
      } finally {
        reset();
      }
    };
    reader.readAsText(file);
  };

  // ── Product invite drawer ─────────────────────────────────────────────────

  function availableProductsForInvite() {
    const catalog: Array<Product | LoanProduct> = role === 'BANK' ? loanProducts : products;
    return catalog.filter(p => !productInviteDraft?.productNames?.includes(p.name));
  }

  const activePresetCategories = (() => {
    let isFinancial = role === 'BANK';
    if (productInviteDraft?.productNames?.length) {
      const name = productInviteDraft.productNames[0];
      const product = availableProductsForInvite().find((p: Product | LoanProduct) => p.name === name);
      if (product?.category) isFinancial = product.category === 'Financial Product';
    }
    const wanted = isFinancial ? FINANCIAL_PRESET_CATEGORIES : ACADEMIC_PRESET_CATEGORIES;
    return [...new Set(presetConditions.filter(p => wanted.includes(p.category)).map(p => p.category))];
  })();

  const getPresetsByCategory = (category: string) => presetConditions.filter(p => p.category === category);

  const openProductInviteModal = () =>
    setProductInviteDraft({ productNames: [], conditions: '', expandedCategory: null, selectedPresetByCategory: {}, insertedTextByCategory: {} });

  const addProductToInvite = (name: string) => {
    if (!name) return;
    setProductInviteDraft((current: any) =>
      current.productNames.includes(name) ? current : { ...current, productNames: [...current.productNames, name] }
    );
  };

  const removeProductFromInvite = (name: string) =>
    setProductInviteDraft((current: any) => ({ ...current, productNames: current.productNames.filter((p: string) => p !== name) }));

  /** Selecting a preset inserts its numbered line into the notes; selecting another in the same category swaps it. */
  const selectPreset = (cat: string, presetId: string, text: string) => {
    setProductInviteDraft((current: any) => {
      const oldId = current.selectedPresetByCategory[cat];
      const oldText = current.insertedTextByCategory[cat];
      const next = {
        ...current,
        selectedPresetByCategory: { ...current.selectedPresetByCategory },
        insertedTextByCategory: { ...current.insertedTextByCategory }
      };

      if (oldId === presetId) {
        next.selectedPresetByCategory[cat] = null;
        if (oldText && next.conditions.includes(oldText)) next.conditions = next.conditions.replace(oldText, '').trim();
        next.insertedTextByCategory[cat] = null;
        return next;
      }

      next.selectedPresetByCategory[cat] = presetId;
      let prefix = '';
      if (oldText) {
        const match = oldText.match(/^(\d+\.\s)/);
        if (match) prefix = match[1];
      } else {
        const currentCount = Object.values(next.selectedPresetByCategory).filter(Boolean).length;
        prefix = `${currentCount}. `;
      }
      const fullText = prefix + text;

      if (oldText && next.conditions.includes(oldText)) next.conditions = next.conditions.replace(oldText, fullText);
      else next.conditions = next.conditions ? `${next.conditions.trim()}\n${fullText}` : fullText;

      next.insertedTextByCategory[cat] = fullText;
      return next;
    });
  };

  /** Sends the drafted terms as a real offer to the selected candidate. */
  const sendProductInvite = async () => {
    if (!productInviteDraft?.productNames.length) {
      notify('Please select at least one product');
      return;
    }
    if (!selectedOfferItem) {
      notify('Select a candidate first');
      return;
    }
    const token = requireToken();
    if (!token) return;

    const [firstName] = productInviteDraft.productNames;
    const catalog: Array<Product | LoanProduct> = role === 'BANK' ? loanProducts : products;
    const product = catalog.find(p => p.name === firstName);

    try {
      await authApi.createOrganizationOffer(token, {
        studentUserId: selectedOfferItem.id,
        program: productInviteDraft.productNames.join(', '),
        headline: `Invitation for ${productInviteDraft.productNames.join(', ')}`,
        location: selectedOfferItem.targetCountry,
        intake: selectedOfferItem.intake,
        valueLabel: role === 'BANK' ? 'Loan amount' : 'Scholarship',
        value: role === 'BANK' ? (product as LoanProduct)?.maxAmount || 'To be confirmed' : (product as Product)?.scholarshipRange || 'To be confirmed',
        conditions: productInviteDraft.conditions || 'Subject to document verification.',
        contactName: user?.full_name || cfg.userTitle,
        contactRole: cfg.userTitle,
        terms: product ? productTerms(product as Product) : {}
      });
      await loadOffers(token);
      setProductInviteDraft(null);
      notify(`Product invite sent to ${selectedOfferItem.name}.`);
    } catch (e) {
      reportFailure(e, 'That invite could not be sent.');
    }
  };

  // ── Offer composer, negotiation, team, account ────────────────────────────

  const openOfferComposer = (student?: WorkspaceStudent) => {
    const defaultOfferType: 'PreApproved' | 'Final' =
      bankEvaluationMode === 'UNIVERSITY_OFFER_ONLY' ? 'Final'
        : bankEvaluationMode === 'ACADEMIC_ONLY' ? 'PreApproved'
          : student?.universityInterests?.length ? 'Final' : 'PreApproved';

    setOfferDraft(role === 'BANK'
      ? { studentUserId: student?.id || '', student: student?.name || '', course: student?.course ? `MSc ${student.course}` : '', productName: '', offerType: defaultOfferType, loanAmount: '', interestRate: '', emi: '', processingFee: '', tenure: '', conditions: '', deadline: '' }
      : { studentUserId: student?.id || '', student: student?.name || '', course: student?.course ? `MSc ${student.course}` : '', scholarship: '', tuition: '', accommodation: '', deadline: '' });
  };

  /**
   * Choosing a programme fills in everything it already knows.
   *
   * It used to copy across the tuition figure alone, which is why offers arrived
   * thin — an officer had to retype the intake, the campus and the scholarship
   * for every student, so mostly nobody did.
   */
  const onOfferCourseChange = (course: string) => {
    const product: any = products.find(item => item.name === course);
    setOfferDraft((current: any) => ({
      ...current,
      course,
      tuition: product?.tuitionFee ?? current.tuition,
      intake: current.intake || (product?.intakes || [])[0] || '',
      location: current.location || product?.campusLocation || '',
      scholarship: current.scholarship || product?.scholarshipInfo || ''
    }));
  };

  const onOfferProductChange = (productName: string) => {
    const product = loanProducts.find(p => p.name === productName);
    setOfferDraft((current: any) => ({
      ...current,
      productName,
      interestRate: product ? `${product.interestRateMin}–${product.interestRateMax}% p.a.` : current.interestRate,
      tenure: product ? `${product.tenureOptions[0] || ''} months` : current.tenure
    }));
  };

  /** `extras` carries answers to whatever fields an admin added to the form. */
  const saveOffer = async (extras: Record<string, unknown> = {}) => {
    if (!offerDraft?.student) return;
    const token = requireToken();
    if (!token) return;

    const target = offerDraft.studentUserId || candidates.find(c => c.name === offerDraft.student)?.id;
    if (!target) {
      notify('Pick a discoverable student for this offer.');
      return;
    }

    const { student, course, deadline, studentUserId, ...coded } = offerDraft;
    void student; void studentUserId;
    /** Added answers live with the rest of the figures, so nothing is dropped. */
    const terms = { ...coded, ...extras };

    try {
      await authApi.createOrganizationOffer(token, {
        studentUserId: target,
        /**
         * Naming the programme is what makes the offer carry it. The server takes
         * a copy of the programme and the university at this moment and freezes it
         * on the offer, so the officer never retypes a prospectus and a later edit
         * to tuition cannot rewrite an offer already sent.
         */
        productId: (products.find(item => item.name === course) || {}).id,
        program: course || 'Programme',
        headline: role === 'BANK' ? 'Education loan offer' : 'Admission and scholarship offer',
        valueLabel: role === 'BANK' ? 'Loan amount' : 'Scholarship',
        value: role === 'BANK' ? offerDraft.loanAmount || '' : offerDraft.scholarship || '',
        conditions: offerDraft.conditions || '',
        contactName: user?.full_name || cfg.userTitle,
        contactRole: cfg.userTitle,
        terms
      });
      await loadOffers(token);
      notify('Offer created and dispatched');
      setOfferDraft(null);
      setWorkspaceFilter('Offers');
      router.push('/organization/students');
    } catch (e) {
      reportFailure(e, 'That offer could not be sent.');
    }
  };

  const sendNegotiationReply = async () => {
    if (!negotiationOffer || !negotiationReply.trim()) return;
    const token = requireToken();
    if (!token || !negotiationOffer.id) return;

    const reply = negotiationReply.trim();
    try {
      await authApi.messageOrganizationOffer(token, negotiationOffer.id, reply);
      await loadOffers(token);
      setNegotiationOffer(null);
      setNegotiationReply('');
      notify('Response sent to the student');
    } catch (e) {
      reportFailure(e, 'That reply could not be sent.');
    }
  };

  const openInviteModal = () => setInviteDraft({ name: '', email: '', role: cfg.userTitle });

  const sendInvite = async () => {
    if (!inviteDraft?.name || !inviteDraft.email) return;
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.inviteOfficer(token, { name: inviteDraft.name, email: inviteDraft.email });
      await loadTeam(token);
      setInviteDraft(null);
      notify(`${inviteDraft.email} added to your team`);
    } catch (e) {
      reportFailure(e, 'That invite could not be sent.');
    }
  };

  /** There is no email sender yet, so this is honest about what it can do. */
  const resendInvite = (member: TeamMember) =>
    notify(`Share their sign-in link with ${member.email} — invite emails are not connected yet.`);

  const removeOfficer = async (member: TeamMember) => {
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.removeOfficer(token, member.id);
      await loadTeam(token);
      notify(`${member.name} removed`);
    } catch (e) {
      reportFailure(e, 'That officer could not be removed.');
    }
  };

  const patchProfile = async (payload: Record<string, unknown>, message: string) => {
    const token = requireToken();
    if (!token) return;
    try {
      const next = (await authApi.updateOrganizationProfile(token, payload)) as OrganizationProfile;
      setProfile(next);
      notify(message);
    } catch (e) {
      reportFailure(e, 'That change could not be saved.');
    }
  };

  const persistNotificationPrefs = (next: typeof notificationPrefs) =>
    void patchProfile({ notificationPrefs: next }, 'Notification preferences saved');

  /**
   * A hostname, with or without a scheme. The same shape the verification page
   * and the server both accept — records were entered as `www.example.edu`, so
   * demanding a full URL here would lock an organisation out of its own profile
   * over a value it was previously told to give.
   */
  const WEBSITE_PATTERN = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;

  const saveOrgProfile = () => {
    const [city, ...rest] = orgCity.split(',');
    void rest;

    /**
     * Checked here rather than left to the input's `pattern`: the settings form
     * saves from a button outside any <form>, so native validation never runs.
     * An empty value is allowed — clearing the website is a legitimate edit.
     */
    const website = orgDomain.trim();
    if (website && !WEBSITE_PATTERN.test(website)) {
      notify('Enter a valid website, for example https://www.university.edu');
      return Promise.resolve();
    }

    return patchProfile(
      { name: orgName, website, city: city.trim(), description: orgDescription },
      'Organisation profile saved'
    );
  };

  const saveCriteria = (criteria: UniversityCriteria | BankCriteria) =>
    void patchProfile({ criteria }, 'Criteria saved');

  const saveTemplates = (next: OfferTemplate[]) => void patchProfile({ offerTemplates: next }, 'Templates saved');

  const changePassword = async () => {
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      notify('New passwords do not match');
      return;
    }
    const token = requireToken();
    if (!token) return;
    try {
      await authApi.changePassword(token, passwordForm.current, passwordForm.next);
      setPasswordForm({ current: '', next: '', confirm: '' });
      notify('Password updated');
    } catch (e) {
      reportFailure(e, 'Your password could not be changed.');
    }
  };

  /**
   * Plans are sold offline, so there is nothing to choose here. The comparison
   * grid stays because knowing what the next tier gives you is still useful —
   * it just ends in a conversation rather than a button.
   */

  const setBankEvaluationMode = (mode: BankEvaluationMode) =>
    void patchProfile({ bankEvaluationMode: mode }, `Loan evaluation mode set to ${mode}`);

  const logout = async () => {
    const token = readAccessToken();
    if (token) await authApi.logout(token).catch(() => {});
    clearAccessToken();
    router.push('/');
  };

  const activeOffersCount = offers.filter(o => !isTerminal(o)).length;

  const selectThread = (offerId: string) => setSelectedThreadId(offerId);

  const setFilter = (key: keyof DiscoveryFilters, value: string) =>
    setFilters(current => ({ ...current, [key]: value }));

  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const activeFilterCount = countActiveFilters(filters);

  /**
   * Which filters this organization gets. A university screens on academic fit;
   * a lender screens on the money and on whether a university has already made
   * an offer — that admission status is what a loan is underwritten against.
   */
  const filterFields: FilterGroup[] = (() => {
    const academic: FilterGroup[] = [
      { group: 'Academic', fields: [
        { key: 'cgpaMin' as const, label: 'Minimum CGPA', type: 'number', placeholder: 'e.g. 8.0', step: '0.1' },
        { key: 'backlogsMax' as const, label: 'Maximum backlogs', type: 'number', placeholder: 'e.g. 0' }
      ]},
      { group: 'Test scores', fields: [
        { key: 'englishTest' as const, label: 'English test', type: 'select', options: ['IELTS', 'TOEFL', 'PTE', 'Duolingo'] },
        { key: 'englishScoreMin' as const, label: 'Minimum English score', type: 'number', placeholder: 'e.g. 6.5', step: '0.5' },
        { key: 'greMin' as const, label: 'Minimum GRE', type: 'number', placeholder: 'e.g. 310' },
        { key: 'gmatMin' as const, label: 'Minimum GMAT', type: 'number', placeholder: 'e.g. 650' }
      ]},
      { group: 'Study plan', fields: [
        { key: 'country' as const, label: 'Destination country', type: 'text', placeholder: 'e.g. Canada' },
        { key: 'intake' as const, label: 'Intake', type: 'text', placeholder: 'e.g. Fall' },
        { key: 'degree' as const, label: 'Level', type: 'select', options: ['Undergraduate', 'Postgraduate'] },
        { key: 'course' as const, label: 'Field of study', type: 'text', placeholder: 'e.g. Data Science' }
      ]},
      { group: 'Other', fields: [
        { key: 'workExperienceMin' as const, label: 'Minimum work experience (years)', type: 'number', placeholder: 'e.g. 1' },
        { key: 'scholarship' as const, label: 'Seeking a scholarship', type: 'select', options: ['yes', 'no'] }
      ]}
    ];

    if (role !== 'BANK') return academic;

    return [
      { group: 'Finance', fields: [
        { key: 'familyIncomeMax' as const, label: 'Maximum household income', type: 'number', placeholder: 'e.g. 2000000' },
        { key: 'requiredLoanMax' as const, label: 'Maximum loan required', type: 'number', placeholder: 'e.g. 2500000' }
      ]},
      { group: 'Admission status', fields: [
        { key: 'visibility' as const, label: 'University offer', type: 'select', options: ['academicOnly', 'offerAvailable'] },
        { key: 'offerStatus' as const, label: 'Offer stage', type: 'select', options: ['Offer Sent', 'Selected', 'Admitted'] }
      ]},
      ...academic
    ];
  })();

  return {
    role, cfg, view, templatesTab, setTemplatesTab, settingsTab, setSettingsTab, workspaceFilter, setWorkspaceFilter,
    toast, notify, go, navLabel, loading, loadError,
    filters, setFilter, clearFilters, activeFilterCount, filtersOpen, setFiltersOpen, searching, filterFields,
    user, profile,
    candidates, selectedOfferItem, setSelectedOfferId, filteredWorkspaceOffers, countWorkspaceOffers,
    setOfferStatus, chatDraft, setChatDraft, sendChatMessage,
    openQuickInvite, sendQuickInvite, quickInvite, setQuickInvite,
    offerTemplates, archivedTemplates, templateDraft, setTemplateDraft, saveTemplate, archiveTemplate, restoreTemplate, makeTemplateDefault,
    chatFile, setChatFile, openAttachment, selectThread, selectedThreadId,
    offers, displayStatus, offerTone, offerIcon, offerPrimary, offerSecondary,
    products, loanProducts, templates, saveTemplates, uniCriteria, bankCriteria, saveCriteria,
    teamMembers, notificationPrefs, persistNotificationPrefs,
    students, savedStudents, notifications, overallScore, matchFactors,
    acceptanceRate, avgResponseTime, funnelStages, performanceBars, rankedInsights,
    currentPlan, planOptions, advancedFeatures, planQuotaLabel, remainingCredits, quotaPercent, billing, fmtDate,
    profilesViewed, activeOffersCount,
    orgName, setOrgName, orgDomain, setOrgDomain, orgCity, setOrgCity, orgDescription, setOrgDescription, saveOrgProfile,
    passwordForm, setPasswordForm, changePassword, logout,
    offerDraft, setOfferDraft, openOfferComposer, onOfferCourseChange, onOfferProductChange, saveOffer,
    catalogDraft, setCatalogDraft, openCatalogModal, saveCatalogItem, downloadCsvTemplate, importProducts,
    uploadProgramImage, uploadOrganizationImage,
    productInviteDraft, setProductInviteDraft, openProductInviteModal, addProductToInvite, removeProductFromInvite,
    availableProductsForInvite, activePresetCategories, getPresetsByCategory, selectPreset, sendProductInvite,
    negotiationOffer, setNegotiationOffer, negotiationReply, setNegotiationReply, sendNegotiationReply,
    inviteDraft, setInviteDraft, openInviteModal, sendInvite, resendInvite, removeOfficer,
    bankEvaluationMode, setBankEvaluationMode, bankEvaluationModeOptions
  };
}

export const NAVIGATION: Array<{ id: OrganizationView; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '▦' },
  { id: 'students', label: 'Candidates & Offers', icon: '⌕' },
  { id: 'templates', label: 'Templates & Criteria', icon: '▧' },
  { id: 'notifications', label: 'Notifications', icon: '◌' }
];

export const SETTINGS_TABS: Array<{ id: SettingsTab; label: string }> = [
  { id: 'org', label: 'Org Profile' },
  { id: 'subscription', label: 'Subscription & Plans' },
  { id: 'accreditation', label: 'Accreditation' },
  { id: 'team', label: 'Team' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security' }
];
