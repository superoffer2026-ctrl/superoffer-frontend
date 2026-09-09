/**
 * Every string and data row on the landing page lives here.
 *
 * Sections read from this file only, so copy changes never touch layout or
 * animation code. Metrics marked `PLACEHOLDER` come from the design mock —
 * replace them with confirmed figures before launch.
 */
import type { IconName } from './Icon';

/* ------------------------------------------------------------------ header */

export const NAV = {
  brand: 'SuperOffer',
  audiences: [
    { key: 'student', label: 'For Students', href: '/students' },
    { key: 'organization', label: 'For Organizations', href: '/organization' }
  ],
  /** Mobile drawer navigation — anchors into the sections of this page. */
  links: [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'For students', href: '#profile' },
    { label: 'Education finance', href: '#finance' },
    { label: 'For organizations', href: '#for-organizations' },
    { label: 'Questions', href: '#faq' }
  ],
  institutionLogin: { label: 'Institution Login', href: '/auth/login/organization' },
  cta: { label: 'Create Profile', href: '/auth/register/student' }
} as const;

/* -------------------------------------------------------------------- hero */

export const HERO = {
  eyebrow: 'Reverse Admissions Marketplace',
  headline: ['Stop Chasing Opportunities.', 'Let Them Find You.'],
  subhead:
    'Create one verified profile and let verified universities and banks discover you — then send admission offers, scholarships and education loans directly to you.',
  primaryCta: { label: 'Create Your Profile', href: '/auth/register/student' },
  secondaryCta: { label: 'For Organizations', href: '#for-organizations' },
  proof: ['Free for Students', 'One Verified Profile', 'Opportunities Come to You'],
  /** Rotating activity states above the hero visual. */
  activity: [
    { org: 'Northbridge University', action: 'is reviewing your profile' },
    { org: 'Westford Institute', action: 'sent a new admission offer' },
    { org: 'Lakeview University', action: 'added a scholarship to your offer' },
    { org: 'EduFund', action: 'pre-approved your education loan' }
  ],
  student: {
    name: 'Amina Al-Mansoor',
    initials: 'AA',
    programme: 'MSc Artificial Intelligence & Computational Systems',
    status: 'Open to inbound discovery',
    stats: [
      { label: 'Verified GPA', value: '3.96', accent: true },
      { label: 'GRE Quant', value: '169', accent: false }
    ],
    verification: 'Verified academic record and documents',
    destinations: 'UK • Switzerland • US • Singapore',
    inbound: { label: 'Live inbound offers', value: '+4 active' }
  },
  /** Surrounding opportunities: what the two organisation types actually send. */
  opportunities: [
    {
      id: 'admission',
      icon: 'school' as IconName,
      tone: 'emerald',
      org: 'Northbridge University',
      badge: '£24,500',
      badgeStyle: 'solid',
      detail: 'MSc Data Science — direct admission offer',
      footLabel: 'Admission offer',
      footValue: 'Decide in 14d',
      live: true
    },
    {
      id: 'scholarship',
      icon: 'award' as IconName,
      tone: 'amber',
      org: 'Westford Institute',
      badge: '35% waiver',
      badgeStyle: 'soft',
      detail: 'Merit scholarship attached to your admission offer',
      footLabel: 'Scholarship',
      footValue: 'Applied automatically',
      live: false
    },
    {
      id: 'loan',
      icon: 'bank' as IconName,
      tone: 'emerald',
      org: 'EduFund',
      badge: '£30,000',
      badgeStyle: 'soft',
      detail: 'Pre-approved education loan, no collateral',
      footLabel: 'Bank offer',
      footValue: 'Approved in 24h',
      live: false
    },
    {
      id: 'living-costs',
      icon: 'payments' as IconName,
      tone: 'sky',
      org: 'LearnFund',
      badge: 'Living costs',
      badgeStyle: 'soft',
      detail: 'Living-cost funding alongside your tuition loan',
      footLabel: 'Bank offer',
      footValue: 'Compare rates',
      live: false
    }
  ]
} as const;

/* -------------------------------------------------------- outcomes banner */

export const OUTCOMES = {
  tagline: 'Inbound over outreach — opportunities that arrive already approved',
  headline: ['Beyond Applications.', 'Real Inbound Outcomes.'],
  intro:
    'Step out of traditional application friction. Verified universities and banks review your profile and reach you with opportunities that are already screened and approved.',
  cards: [
    {
      icon: 'school' as IconName,
      tone: 'emerald',
      title: '200+ Verified Programmes', // PLACEHOLDER metric
      text: 'Direct invitations, application waivers and fast-tracked places from accredited universities.',
      foot: 'Direct from faculty'
    },
    {
      icon: 'award' as IconName,
      tone: 'amber',
      title: 'Pre-Screened Funding',
      text: 'Scholarships, fee waivers and loan approvals checked against your profile before they reach you.',
      foot: 'Screened first'
    },
    {
      icon: 'payments' as IconName,
      tone: 'coral',
      title: 'Zero Application Fees',
      text: 'Build your profile once. No repeat portal forms, no per-application processing fees.',
      foot: 'Free for students'
    },
    {
      icon: 'cpu' as IconName,
      tone: 'sky',
      title: 'Continuous Matching',
      text: 'Our matching engine re-checks your profile against organisation criteria every day.',
      foot: 'Runs daily'
    },
    {
      icon: 'network' as IconName,
      tone: 'teal',
      title: 'Inbound Over Outreach',
      text: 'Universities and banks open the conversation. You decide which ones are worth answering.',
      foot: 'You stay in control'
    },
    {
      icon: 'shield' as IconName,
      tone: 'violet',
      title: 'Private By Default',
      text: 'Your contact details stay hidden until you choose to respond to an opportunity.',
      foot: 'Your data, your rules'
    }
  ]
} as const;

/* -------------------------------------------------- paradigm shift section */

export const PARADIGM = {
  eyebrow: 'The Paradigm Shift',
  headline: ['Higher education applications were broken.', 'We inverted the direction.'],
  old: {
    tag: 'The old way',
    meta: 'High friction • High cost',
    title: 'Students do the chasing',
    intro:
      'Candidates spend months repeating the same work across dozens of portals, with no guarantee of ever being read.',
    items: [
      { icon: 'search-off' as IconName, text: 'Searching thousands of separate university portals' },
      { icon: 'payments' as IconName, text: 'Paying repeat application processing fees' },
      { icon: 'edit-note' as IconName, text: 'Rewriting the same personal statement a dozen times' },
      { icon: 'hourglass' as IconName, text: 'Silent waitlists and rejections with no explanation' }
    ],
    metricLabel: 'Typical cost',
    metricValue: 'Months of repeated work' // PLACEHOLDER metric
  },
  next: {
    tag: 'The SuperOffer way',
    meta: 'Verified • Inbound',
    title: 'Opportunities do the finding',
    intro:
      'Publish one verified profile. Verified universities and banks reach you with concrete, pre-screened offers.',
    items: [
      { icon: 'badge' as IconName, text: 'One verified profile with academics, tests and documents' },
      { icon: 'cpu' as IconName, text: 'Matching engine checks organisation criteria every day' },
      { icon: 'mail' as IconName, text: 'Pre-screened admission offers, scholarships and loan approvals' },
      { icon: 'shield-check' as IconName, text: 'No repeat forms. No application fees for students.' }
    ],
    metricLabel: 'What changes',
    metricValue: 'Offers arrive in weeks' // PLACEHOLDER metric
  }
} as const;

/* ------------------------------------------------------ how it works steps */

export const HOW_IT_WORKS = {
  eyebrow: 'How It Works',
  headline: 'One profile. A world of possibilities.',
  intro:
    'Three stages that put agency back in students’ hands — build once, get discovered, then choose what is right for you.',
  steps: [
    {
      number: '01',
      stage: 'Your stage',
      title: 'Build your verified profile',
      text: 'Academics, verified transcripts, test scores, projects, destination preferences and career goals — collected once, in one place.',
      panel: {
        kind: 'progress' as const,
        title: 'Document verification',
        status: 'Complete',
        footLeft: 'Transcripts & test scores',
        footRight: '100%'
      }
    },
    {
      number: '02',
      stage: 'Organisation stage',
      title: 'Get discovered automatically',
      text: 'Verified universities and banks search for profiles that meet their criteria — and yours surfaces when it fits.',
      panel: {
        kind: 'matches' as const,
        title: 'Active searches',
        rows: [
          { name: 'Northbridge University', value: '98% match' },
          { name: 'Westford Institute', value: '96% match' }
        ]
      }
    },
    {
      number: '03',
      stage: 'Offer stage',
      title: 'Review and choose',
      text: 'Admission offers, scholarships and loan approvals land in your dashboard. You compare the terms and decide.',
      panel: {
        kind: 'offer' as const,
        title: 'Admission + scholarship',
        badge: 'New',
        text: 'MSc place confirmed with 35% of tuition waived',
        footLeft: 'Valid for 30 days',
        footRight: 'Review offer'
      }
    }
  ]
} as const;

/* ------------------------------------------------------- scholar dossier  */

export const DOSSIER = {
  eyebrow: 'The Student Profile',
  headline: 'What organisations actually see',
  intro:
    'Structured, verified and readable at a glance. This is how a university or lender reviews your profile before sending an opportunity.',
  readiness: 'Profile readiness: 100% verified',
  portrait: {
    src: '/intelligent-matching-students.png',
    alt: 'A student reviewing matched programme options with an admissions advisor',
    name: 'Amina Al-Mansoor',
    field: 'Applied Mathematics & AI Systems',
    tag: 'Verified'
  },
  stats: [
    { label: 'Cohort percentile', value: 'Top 1%', accent: true },
    { label: 'Cumulative GPA', value: '3.94 / 4.0', accent: false }
  ],
  destinationsLabel: 'Preferred destinations',
  destinations: ['🇬🇧 United Kingdom', '🇨🇭 Switzerland', '🇺🇸 United States', '🇸🇬 Singapore'],
  skillsLabel: 'Verified strengths',
  skills: [
    { label: 'Distributed Optimisation', accent: true },
    { label: 'PyTorch', accent: false },
    { label: 'Bayesian Inference', accent: false },
    { label: 'Applied Statistics', accent: false }
  ],
  privacy: {
    title: 'Contact details stay private',
    text: 'Organisations see your academic and merit attributes only, until you choose to respond to an opportunity.'
  },
  /** Closing strip: the parts of the student workspace worth naming outright. */
  capabilities: [
    {
      icon: 'mail-unread' as IconName,
      title: 'One inbox for everything',
      text: 'Admission, scholarship and loan invitations in a single list — no portal-hopping.'
    },
    {
      icon: 'network' as IconName,
      title: 'Compare and negotiate',
      text: 'Put offers side by side and ask for better terms before you commit to any of them.'
    },
    {
      icon: 'lock' as IconName,
      title: 'You control visibility',
      text: 'Turn discovery on when you are ready. Contact details stay private until you accept.'
    }
  ],
  telemetry: {
    title: 'Live inbound activity',
    badge: '4 new',
    /** Counters above the feed — they also stop the panel running short beside
        the taller profile card on the left. */
    summary: [
      { value: '18', label: 'Profile views' },
      { value: '4', label: 'Invitations' },
      { value: '2', label: 'Shortlists' }
    ],
    rows: [
      {
        icon: 'eye' as IconName,
        tone: 'plain',
        org: 'Northbridge University — Engineering',
        text: 'Reviewed your project portfolio and academic record',
        chip: 'Profile viewed',
        value: '99% match'
      },
      {
        icon: 'mail-out' as IconName,
        tone: 'emerald',
        org: 'Westford Institute — Computer Science',
        text: 'Sent a formal invitation for direct autumn intake consideration',
        chip: 'Invitation pending',
        value: ''
      },
      {
        icon: 'bookmark' as IconName,
        tone: 'plain',
        org: 'Lakeview University',
        text: 'Shortlisted your profile for a merit scholarship review',
        chip: 'Shortlisted',
        value: ''
      },
      {
        icon: 'bank' as IconName,
        tone: 'plain',
        org: 'EduFund',
        text: 'Pre-approved an education loan against your verified profile',
        chip: 'Loan offer ready',
        value: 'Within 24h'
      }
    ],
    footText: 'Your profile is discoverable by verified organisations matching your field.',
    footLink: { label: 'Manage discovery settings', href: '/auth/register/student' }
  }
} as const;

/* ------------------------------------------------- institutional discovery */

export const INSTITUTION_DESK = {
  eyebrow: 'For Organizations',
  headline: ['Find the right students', 'before they go somewhere else.'],
  intro:
    'Universities and banks search verified student profiles directly, and send admission, scholarship or loan offers to the candidates who genuinely fit — cutting recruitment cycles from months to minutes.',
  filterLabel: 'Active filters',
  filters: ['Computational Biology & AI', 'Autumn intake', 'Fully funded', 'Verified transcripts'],
  searchPlaceholder: 'Search verified student profiles',
  candidates: [
    {
      initials: 'AA',
      tone: 'emerald',
      ref: 'Candidate #SO-883921',
      match: '98% match',
      detail: 'Undergraduate: leading technical university • 3 first-author publications • Target: PhD / Research MSc',
      metaLabel: 'Funding expectation',
      metaValue: 'Fully funded',
      action: { label: 'Send pre-approved offer', primary: true }
    },
    {
      initials: 'LK',
      tone: 'ink',
      ref: 'Candidate #SO-449102',
      match: '95% match',
      detail: 'Undergraduate: research-intensive university • National chemistry olympiad medallist • Target: MD-PhD',
      metaLabel: 'Funding expectation',
      metaValue: 'Partial merit accepted',
      action: { label: 'Send an invitation', primary: false }
    }
  ],
  ribbon: {
    text: 'Invitations sent to matched students are answered far more often than cold outreach.',
    note: 'Based on marketplace activity' // PLACEHOLDER metric
  },
  /** Closing strip: what a verified university or bank actually works with. */
  capabilities: [
    {
      icon: 'bookmark' as IconName,
      title: 'Shortlists and pipeline',
      text: 'Shared shortlists so admissions and lending teams review candidates together.'
    },
    {
      icon: 'trending-up' as IconName,
      title: 'Offer analytics',
      text: 'Track sent, viewed, negotiated, accepted and expired invitations in one dashboard.'
    },
    {
      icon: 'shield-check' as IconName,
      title: 'Verified access only',
      text: 'Accreditation and lending licences are checked before an organisation can search at all.'
    }
  ],
  cta: { label: 'Join as an organization', href: '/auth/register/organization' }
} as const;

/* ---------------------------------------------------------- ecosystem grid */

/**
 * Framed as the four things a student receives, not as organisation types:
 * SuperOffer verifies universities and banks only (see `orgType` in
 * `lib/models/organization.ts`), and scholarships arrive attached to a
 * university's admission offer rather than from a separate awarding body.
 */
export const ECOSYSTEM = {
  eyebrow: 'The SuperOffer Ecosystem',
  headline: 'More than admissions. Everything the decision needs.',
  intro:
    'The place, the funding and the terms — all arriving through one verified profile, from organisations we have checked.',
  pillars: [
    {
      icon: 'school' as IconName,
      title: 'Admission offers',
      text: 'Direct invitations and admission offers from verified universities, without joining the usual application queue.',
      foot: 'From verified universities'
    },
    {
      icon: 'award' as IconName,
      title: 'Scholarships & fee waivers',
      text: 'Merit scholarships, tuition reductions and application fee waivers, attached to the admission offer itself.',
      foot: 'Attached to your offer'
    },
    {
      icon: 'bank' as IconName,
      title: 'Education loans',
      text: 'Pre-approved education finance from partner banks and lenders, with eligibility checked against your verified profile.',
      foot: 'Decisions in 24 hours'
    },
    {
      icon: 'network' as IconName,
      title: 'One place to decide',
      text: 'Every offer side by side, one round of negotiation per invitation, and your decision made in a single workspace.',
      foot: 'Compare, negotiate, accept'
    }
  ]
} as const;

/* ------------------------------------------------------ editorial statements */

export const EDITORIAL = {
  lines: [
    { text: 'One profile.', note: 'Built once, verified once', tone: 'ink' },
    { text: 'Less searching.', note: 'No more repeating the same forms', tone: 'muted' },
    { text: 'More discovery.', note: 'Organisations come to you', tone: 'accent' },
    { text: 'Better opportunities.', note: 'Funded places and real offers', tone: 'ink' },
    { text: 'A smarter future.', note: 'Reverse admissions', tone: 'ink', isLast: true }
  ]
} as const;

/* --------------------------------------------------------- global reach   */

export const GLOBAL_REACH = {
  eyebrow: 'Borderless Opportunity',
  headline: 'Opportunities without borders.',
  intro:
    'SuperOffer connects students with verified universities and banks across every major academic corridor.',
  hubs: [
    { label: 'San Francisco', x: 14, y: 26, primary: false },
    { label: 'London', x: 46, y: 12, primary: true },
    { label: 'Zurich', x: 55, y: 46, primary: false },
    { label: 'Singapore', x: 78, y: 58, primary: false }
  ],
  // PLACEHOLDER metrics — confirm real figures before launch.
  metrics: [
    { label: 'Student reach', value: 142, suffix: '', caption: 'Countries represented', accent: false },
    { label: 'Opportunity value', value: 180, prefix: '$', suffix: 'M+', caption: 'In inbound offers', accent: true },
    { label: 'Partner network', value: 480, suffix: '+', caption: 'Verified organisations', accent: false }
  ]
} as const;

/* ------------------------------------------------------------- final call */

export const FINAL_CTA = {
  eyebrow: 'Create your profile',
  headline: 'Your next opportunity may already be looking for you.',
  intro:
    'Build one verified profile and let verified universities and banks make their case to you.',
  primary: { label: 'Create Your Profile', href: '/auth/register/student' },
  secondary: { label: 'Join as an Institution', href: '/auth/register/organization' },
  proof: [
    { icon: 'check-circle' as IconName, text: 'Free for students' },
    { icon: 'security' as IconName, text: 'No cold spam or brokers' },
    { icon: 'shield' as IconName, text: 'Privacy-first by default' }
  ]
} as const;

/* ------------------------------------------------------- education finance */

export const FINANCE = {
  eyebrow: 'Education Finance',
  headline: ['Bank loan decisions', 'in 24 hours.'],
  intro:
    'Banks are first-class members of the marketplace, not an afterthought. Partner lenders read your verified profile, score it against their own criteria, and send pre-approved education loan offers — typically within 24 hours of your profile going live. No branch queues, no re-submitting the same paperwork to five different banks.',
  steps: [
    {
      time: 'Step 1',
      title: 'Share your finances once',
      text: 'Income, co-applicant details and supporting documents are collected a single time, as part of your profile.'
    },
    {
      time: 'Step 2',
      title: 'Banks check eligibility',
      text: 'Partner lenders score your verified profile against their lending criteria automatically — no application needed.'
    },
    {
      time: 'Within 24 hours',
      title: 'Pre-approved offers arrive',
      text: 'Loan offers land in your inbox with amount, indicative rate, tenure and margin money stated upfront.',
      accent: true
    },
    {
      time: 'Your call',
      title: 'Compare and choose',
      text: 'Put lenders side by side against your admission offer, then accept the one that actually suits your plan.'
    }
  ],
  highlights: [
    {
      icon: 'clock' as IconName,
      title: '24-hour decisions',
      text: 'Verified profiles are scored automatically, so an answer never waits on a branch appointment.'
    },
    {
      icon: 'shield-check' as IconName,
      title: 'No collateral for eligible profiles',
      text: 'Strong academic and co-applicant profiles can qualify for unsecured education finance.'
    },
    {
      icon: 'network' as IconName,
      title: 'One co-applicant flow',
      text: 'Your co-applicant completes their part once, and it carries across every lender who makes an offer.'
    }
  ],
  /* Illustrative offer card — figures are placeholders, not a quoted product. */
  offer: {
    tag: 'Pre-approved',
    speed: 'Decision in 24h',
    bank: 'EduFund',
    initials: 'EF',
    amount: '€45,000',
    rows: [
      { label: 'Covers', value: 'Tuition + living costs' },
      { label: 'Collateral', value: 'Not required' },
      { label: 'Repayment', value: 'Starts after course' }
    ],
    action: 'Compare with other lenders'
  },
  cta: { label: 'Check your loan eligibility', href: '/auth/register/student' },
  bankCta: { label: 'Join as a lender', href: '/auth/register/organization' }
} as const;

/* --------------------------------------------------------------------- faq */

export const FAQ = {
  eyebrow: 'Questions',
  headline: 'The things people ask first.',
  intro: 'Everything students, universities and banks want to know before they start.',
  groups: [
    {
      title: 'Students',
      items: [
        {
          q: 'Does a student need approval to join?',
          a: 'No. Student accounts can sign in immediately. Profile visibility depends on completing the required information and verification.'
        },
        {
          q: 'Who can see my profile?',
          a: 'Only authorised, verified organisations within your visibility settings. Other students cannot view your information, and your contact details stay protected until you accept an offer.'
        },
        {
          q: 'Can I hold more than one offer?',
          a: 'Yes. You can hold several pending invitations and compare them side by side, while accepting one active offer per category at a time.'
        }
      ]
    },
    {
      title: 'Banks & finance',
      items: [
        {
          q: 'How fast is a loan decision, really?',
          a: 'Once your profile is verified and your financial details are complete, partner banks score it automatically. Most pre-approved offers arrive within 24 hours, because nothing waits on a branch visit or a fresh application form.'
        },
        {
          q: 'Does checking eligibility cost anything?',
          a: 'No. Eligibility checks and receiving loan offers are free for students. You only deal with a lender directly once you decide to accept one of their offers.'
        },
        {
          q: 'Do I need a co-applicant?',
          a: 'It depends on the lender and your profile. Where one is required, your co-applicant completes their details once and that information carries across every bank that makes you an offer.'
        }
      ]
    },
    {
      title: 'Organizations',
      items: [
        {
          q: 'Why does organization registration require approval?',
          a: 'Verification protects students and ensures only legitimate universities and banks can search profiles or send invitations.'
        },
        {
          q: 'What can admissions and loan officers do?',
          a: 'Verified officers can search suitable students, review match factors, build shortlists, send admission or loan offers, handle negotiations, and view funnel reports.'
        },
        {
          q: 'Can organizations see student contact details immediately?',
          a: 'No. Contact details remain protected until the student accepts an offer, in line with SuperOffer privacy rules.'
        }
      ]
    }
  ]
} as const;

/* ------------------------------------------------------------------ footer */


export const FOOTER = {
  brand: 'SuperOffer',
  tagline: 'Reverse admissions marketplace',
  status: 'Matching engine online',
  columns: [
    {
      title: 'Students',
      links: [
        { label: 'Student overview', href: '#profile' },
        { label: 'Create your profile', href: '/auth/register/student' },
        { label: 'Compare offers', href: '#profile' },
        { label: 'Student login', href: '/auth/login/student' }
      ]
    },
    {
      title: 'Universities',
      links: [
        { label: 'Discover students', href: '#for-organizations' },
        { label: 'Send invitations', href: '#for-organizations' },
        { label: 'Institution desk', href: '/auth/login/organization' },
        { label: 'Join as a university', href: '/auth/register/organization' }
      ]
    },
    {
      title: 'Platform',
      links: [
        { label: 'How it works', href: '#how-it-works' },
        { label: 'What organisations see', href: '#profile' },
        { label: 'Opportunity types', href: '#ecosystem' },
        { label: 'Questions', href: '#faq' }
      ]
    },
    {
      title: 'Banks',
      links: [
        { label: 'Education finance', href: '#finance' },
        { label: 'Loan eligibility', href: '#finance' },
        { label: 'Lender desk', href: '/auth/login/organization' },
        { label: 'Join as a lender', href: '/auth/register/organization' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About SuperOffer', href: '/' },
        { label: 'Contact us', href: 'mailto:hello@superoffer.net' },
        { label: 'Partner with us', href: 'mailto:partners@superoffer.net' },
        { label: 'Support', href: 'mailto:support@superoffer.net' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of service', href: '/' },
        { label: 'Privacy policy', href: '/' },
        { label: 'Data protection', href: '/' },
        { label: 'Security', href: '/' }
      ]
    }
  ],
  copyright: `© ${new Date().getFullYear()} SuperOffer. All rights reserved.`,
  locations: 'London • Zurich • New York • Singapore'
} as const;
