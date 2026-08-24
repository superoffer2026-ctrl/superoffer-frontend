import type { NextConfig } from 'next';

/** Pages served by the organization workspace shell. */
const ORGANIZATION_PAGES = [
  'dashboard', 'students', 'shortlists', 'invitations', 'catalog', 'templates',
  'criteria', 'reports', 'notifications', 'subscription', 'profile', 'settings'
];

/** Pages the legacy `/portal/university/*` and `/portal/bank/*` workspaces used to serve. */
const LEGACY_PORTAL_PAGES = ['dashboard', 'students', 'subscription', 'offers', 'settings'];

const nextConfig: NextConfig = {
  output: 'standalone',
  /**
   * `next build` and `next dev` both write to the dist directory, so a verification
   * build run alongside a live dev server corrupts its chunks and leaves the HMR
   * socket reconnecting once a second. Set NEXT_DIST_DIR to build somewhere else.
   */
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,

  async redirects() {
    return [
      // Student wizard: step ids that were renamed.
      { source: '/student', destination: '/student/dashboard', permanent: false },
      { source: '/student/entrance-exams', destination: '/student/english-exam', permanent: false },
      { source: '/student/entrance-exam', destination: '/student/english-exam', permanent: false },
      { source: '/student/skills', destination: '/student/projects', permanent: false },
      { source: '/student/documents', destination: '/student/review', permanent: false },
      { source: '/student/completion', destination: '/student/dashboard', permanent: false },
      { source: '/student/help', destination: '/student/settings', permanent: false },
      { source: '/portal/student', destination: '/student/dashboard', permanent: false },

      // Legacy university/bank auth links now resolve to the unified organization auth flow.
      { source: '/auth/login/university', destination: '/auth/login/organization', permanent: false },
      { source: '/auth/register/university', destination: '/auth/register/organization', permanent: false },
      { source: '/auth/login/bank', destination: '/auth/login/organization', permanent: false },
      { source: '/auth/register/bank', destination: '/auth/register/organization', permanent: false },
      { source: '/organization/login', destination: '/auth/login/organization', permanent: false },
      { source: '/organization/signup', destination: '/auth/register/organization', permanent: false },

      // Legacy portal/university and portal/bank workspaces now live under /organization.
      { source: '/university', destination: '/organization', permanent: false },
      { source: '/bank', destination: '/organization', permanent: false },
      { source: '/portal/university', destination: '/organization/dashboard', permanent: false },
      { source: '/portal/bank', destination: '/organization/dashboard', permanent: false },
      ...LEGACY_PORTAL_PAGES.flatMap(page => [
        { source: `/portal/university/${page}`, destination: `/organization/${page}`, permanent: false },
        { source: `/portal/bank/${page}`, destination: `/organization/${page}`, permanent: false }
      ]),

      // Legacy page ids kept working after the Invitations/Shortlists rename.
      { source: '/organization/offers', destination: '/organization/invitations', permanent: false },
      { source: '/organization/saved', destination: '/organization/shortlists', permanent: false }
    ];
  },

  /** Mirrors the Angular dev-server proxy (proxy.conf.json): /api and /health hit the local API. */
  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return [];
    const target = process.env.SUPER_OFFER_API_PROXY || 'http://127.0.0.1:3000';
    return [
      { source: '/api/:path*', destination: `${target}/api/:path*` },
      { source: '/health', destination: `${target}/health` }
    ];
  }
};

export { ORGANIZATION_PAGES };
export default nextConfig;
