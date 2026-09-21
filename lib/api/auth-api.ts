import { isBrowser } from '../storage';

export type PortalKey = 'student' | 'organization';

export interface ApiError extends Error {
  body?: any;
  status?: number;
  code?: string;
}

type ApiPayload = Record<string, unknown>;

const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Where the API lives, in precedence order:
 *
 *  1. `window.SUPER_OFFER_API_URL` — written into public/config.js at container
 *     start-up by runtime-config.sh, so one image can be promoted between
 *     environments. Unset in development.
 *  2. `NEXT_PUBLIC_SUPER_OFFER_API_URL` — the .env.local value; in development
 *     this points straight at the API port.
 *  3. `/api/v1` — same-origin fallback, served by the dev rewrite in next.config.ts.
 *
 * Resolved per call rather than captured at module load, because during a server
 * render neither of the first two exists.
 */
function baseUrl(): string {
  const runtime = isBrowser()
    ? (window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL
    : undefined;
  return runtime || process.env.NEXT_PUBLIC_SUPER_OFFER_API_URL || '/api/v1';
}

async function request(path: string, options: RequestInit = {}, json = true): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl()}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { ...(json ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const error = new Error(body?.message || 'The request could not be completed.') as ApiError;
      error.body = body;
      error.status = response.status;
      error.code = body?.code;
      throw error;
    }
    return body;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Could not connect to the SuperOffer API at ${baseUrl()}. Please try again.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const bearer = (token: string) => ({ authorization: `Bearer ${token}` });

/**
 * Attachments sit behind bearer auth, so they can't be a plain <a href>. This
 * fetches the bytes and hands back an object URL the caller must revoke.
 */
async function authedFile(token: string, path: string): Promise<string> {
  const response = await fetch(`${baseUrl()}${path}`, { headers: bearer(token) });
  if (!response.ok) throw new Error('That attachment could not be opened.');
  return URL.createObjectURL(await response.blob());
}

const put = (path: string, token: string, payload: ApiPayload) =>
  request(path, { method: 'PUT', headers: bearer(token), body: JSON.stringify(payload) });

export const authApi = {
  sendRegistrationOtp: (payload: { email: string; fullName: string }) => request('/auth/register/send-otp', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: ApiPayload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (identifier: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),

  forgotPassword: (email: string) =>
    request('/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (resetToken: string, password: string) =>
    request('/auth/password/reset', { method: 'POST', body: JSON.stringify({ resetToken, password }) }),

  status: (userId: string) => request(`/auth/status/${userId}`),

  currentUser: (token: string) => request('/auth/me', { headers: bearer(token) }),

  studentProfile: (token: string) => request('/students/me', { headers: bearer(token) }),

  studentCompletion: (token: string) => request('/students/me/completion', { headers: bearer(token) }),

  studentNotifications: (token: string) => request('/students/me/notifications', { headers: bearer(token) }),

  studentMessages: (token: string) => request('/students/me/messages', { headers: bearer(token) }),

  saveStudentSettings: (token: string, payload: ApiPayload) => put('/students/me/settings', token, payload),

  /** Merges into the financial section without replacing it — used by the loan-eligibility page. */
  saveStudentFinancial: (token: string, payload: ApiPayload) => put('/students/me/financial', token, payload),

  deleteStudentAccount: (token: string) => request('/students/me', { method: 'DELETE', headers: bearer(token) }),

  /** `email` is institution-only; a student account has none and the API refuses it. */
  updateAccount: (token: string, payload: { fullName?: string; email?: string }) =>
    request('/auth/me', { method: 'PATCH', headers: bearer(token), body: JSON.stringify(payload) }),

  /** Ends the session server-side; the token stops working immediately. */
  logout: (token: string) => request('/auth/logout', { method: 'POST', headers: bearer(token) }),

  changePassword: (token: string, current: string, next: string) =>
    request('/auth/password', { method: 'POST', headers: bearer(token), body: JSON.stringify({ current, next }) }),

  updateStudentProfile: (token: string, profile: ApiPayload) => put('/students/me', token, profile),

  saveStudentPersonalInformation: (token: string, payload: ApiPayload) =>
    put('/students/me/personal-information', token, payload),

  saveStudentStudyPreferences: (token: string, payload: ApiPayload) =>
    put('/students/me/study-preferences', token, payload),

  saveStudentAcademicInformation: (token: string, payload: ApiPayload) =>
    put('/students/me/academic-information', token, payload),

  saveStudentEnglishExam: (token: string, payload: ApiPayload) => put('/students/me/english-exam', token, payload),

  saveStudentCompetitiveExam: (token: string, payload: ApiPayload) =>
    put('/students/me/competitive-exam', token, payload),

  saveStudentWorkExperience: (token: string, payload: ApiPayload) =>
    put('/students/me/work-experience', token, payload),

  saveStudentProjectsAchievements: (token: string, payload: ApiPayload) =>
    put('/students/me/projects-achievements', token, payload),

  saveStudentFinancialInformation: (token: string, payload: ApiPayload) =>
    put('/students/me/financial-information', token, payload),

  // ── The parent or guardian who stands as co-applicant, and their credit ────

  coApplicant: (token: string) => request('/students/me/co-applicant', { headers: bearer(token) }),

  saveCoApplicant: (token: string, payload: ApiPayload) => put('/students/me/co-applicant', token, payload),

  /** What a lender would make of this household, before anyone has been invited. */
  loanEligibility: (token: string) => request('/students/me/loan-eligibility', { headers: bearer(token) }),

  /**
   * The CIBIL check. One call: the identity the bureau matches on, plus the
   * consent that permits the look-up, which the backend records before it asks.
   *
   * SurePass is reached only by our backend — there is no token in this bundle
   * and no path from here to the bureau.
   */
  runCreditCheck: (
    token: string,
    payload: { fullName: string; panNumber: string; mobileNumber: string; gender: string; consent: true }
  ): Promise<{
    outcome: string;
    score: number | null;
    band: string | null;
    pulledAt: string;
    staleAfter: string;
    reused: boolean;
    detail?: string;
  }> =>
    request('/students/me/credit-check', {
      method: 'POST',
      headers: bearer(token),
      body: JSON.stringify(payload)
    }),

  /** Public — no auth required. Single source of truth for country/city dropdown data,
   *  matching the same lists the backend's own DTO validators check against. */
  getGeoReferenceData: (): Promise<{
    countries: { name: string; iso2: string; dial: string }[];
    indiaStates: string[];
    indiaCities: string[];
    /** Cities keyed by state, so the city dropdown narrows to where they live. */
    citiesByState: Record<string, string[]>;
  }> =>
    request('/reference/geo'),

  /** Public — no auth required. Single source of truth for study-preferences dropdown data,
   *  matching the same lists the backend's own DTO validator checks against. */
  getStudyPreferencesReferenceData: (): Promise<{
    studyCountries: string[];
    mbbsOnlyCountries: string[];
    studyLevels: string[];
    fieldsOfStudy: string[];
    intakeOptions: string[];
    startYears: string[];
  }> => request('/reference/study-preferences'),

  /** Public — no auth required. Single source of truth for academic-information dropdown data,
   *  matching the same lists the backend's own DTO validator checks against. */
  getAcademicInformationReferenceData: (): Promise<{
    qualificationOptions: string[];
    curriculumOptions: string[];
    educationGapOptions: string[];
    educationYears: string[];
    universityOptions: string[];
  }> => request('/reference/academic-information'),

  /** Public — no auth required. Single source of truth for english-exam dropdown data,
   *  matching the same lists the backend's own DTO validator checks against. */
  getEnglishExamReferenceData: (): Promise<{ englishExamOptions: string[]; examStatusOptions: string[] }> =>
    request('/reference/english-exam'),

  /** Public — no auth required. Single source of truth for competitive-exam dropdown data. */
  getCompetitiveExamReferenceData: (): Promise<{ competitiveExamOptions: string[]; examStatusOptions: string[] }> =>
    request('/reference/competitive-exam'),

  /** Public — no auth required. Single source of truth for work-experience dropdown data. */
  getWorkExperienceReferenceData: (): Promise<{ employmentTypes: string[] }> => request('/reference/work-experience'),

  /** Public — no auth required. Single source of truth for financial-information dropdown data. */
  getFinancialInformationReferenceData: (): Promise<{
    fundingSourceOptions: string[];
    earningMemberOptions: string[];
    currencyOptions: string[];
    financialDocumentFields: Array<{ key: string; label: string; categories?: string[] }>;
  }> => request('/reference/financial-information'),

  /** Public — the document checklist the student profile page renders. */
  getDocumentReferenceData: (): Promise<{ profileDocumentTypes: string[] }> => request('/reference/documents'),

  /** Public — no auth required. Single source of truth for projects-achievements suggestion data. */
  getProjectsAchievementsReferenceData: (): Promise<{ achievementSuggestions: string[] }> =>
    request('/reference/projects-achievements'),

  submitStudentProfile: (token: string) => request('/students/me/submit', { method: 'POST', headers: bearer(token) }),

  listStudentDocuments: (token: string) => request('/students/me/documents', { headers: bearer(token) }),

  uploadStudentDocument: (token: string, documentType: string, file: File) => {
    const form = new FormData();
    form.append('documentType', documentType);
    form.append('file', file);
    return request('/students/me/documents', { method: 'POST', headers: bearer(token), body: form }, false);
  },

  replaceStudentDocument: (token: string, id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return request(`/students/me/documents/${id}`, { method: 'PUT', headers: bearer(token), body: form }, false);
  },

  deleteStudentDocument: (token: string, id: string) =>
    request(`/students/me/documents/${id}`, { method: 'DELETE', headers: bearer(token) }),

  studentOffers: (token: string) => request('/students/me/offers', { headers: bearer(token) }),

  viewOffer: (token: string, offerId: string) =>
    request(`/students/me/offers/${offerId}/view`, { method: 'POST', headers: bearer(token) }),

  setOfferFlags: (token: string, offerId: string, flags: { saved?: boolean; favourite?: boolean; compared?: boolean }) =>
    request(`/students/me/offers/${offerId}/flags`, {
      method: 'PATCH',
      headers: bearer(token),
      body: JSON.stringify(flags)
    }),

  decideOffer: (token: string, offerId: string, status: string) =>
    request(`/students/me/offers/${offerId}/decision`, {
      method: 'PATCH',
      headers: bearer(token),
      body: JSON.stringify({ status })
    }),

  /** A message may carry one file; multipart is used only when there is one. */
  messageOffer: (token: string, offerId: string, body: string, file?: File) => {
    if (!file) {
      return request(`/students/me/offers/${offerId}/messages`, {
        method: 'POST',
        headers: bearer(token),
        body: JSON.stringify({ body })
      });
    }
    const form = new FormData();
    form.append('body', body);
    form.append('file', file);
    return request(`/students/me/offers/${offerId}/messages`, { method: 'POST', headers: bearer(token), body: form }, false);
  },

  markOfferThreadRead: (token: string, offerId: string) =>
    request(`/students/me/offers/${offerId}/read`, { method: 'POST', headers: bearer(token) }),

  studentUnreadMessages: (token: string) =>
    request('/students/me/offers/messages/unread', { headers: bearer(token) }),

  /** Attachments are behind auth, so they are fetched and turned into a blob URL. */
  studentAttachmentUrl: (token: string, offerId: string, messageId: string) =>
    authedFile(token, `/students/me/offers/${offerId}/messages/${messageId}/attachment`),

  // ── Organization workspace ──

  organizationProfile: (token: string) => request('/organizations/me/profile', { headers: bearer(token) }),

  updateOrganizationProfile: (token: string, payload: ApiPayload) =>
    request('/organizations/me/profile', { method: 'PATCH', headers: bearer(token), body: JSON.stringify(payload) }),

  /**
   * What this organisation was sold and what they have paid. Read-only: plans
   * are agreed with our team and settled offline, so there is nothing here to
   * change from a browser.
   */
  /** Multipart, so no JSON content-type — the browser sets the boundary itself. */
  uploadOrganizationImage: (token: string, kind: 'logo' | 'cover', file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request(`/organizations/me/${kind}`, { method: 'POST', headers: bearer(token), body }, false);
  },

  uploadProductImage: (token: string, productId: string, file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request(`/organizations/me/products/${encodeURIComponent(productId)}/image`, {
      method: 'POST', headers: bearer(token), body
    }, false);
  },

  organizationBilling: (
    token: string
  ): Promise<{
    subscription: {
      plan: string; profilesViewed: number; capacity: number | null; remaining: number | null;
      quotaPercent: number; unlimited: boolean; periodStart: string | null; periodEnd: string | null;
      invoiceNumber: string | null; paymentStatus: string; unpaid: boolean; overdue: boolean;
      suspended: boolean; suspensionReason: string | null;
    };
    invoices: {
      invoiceNumber: string; plan: string; amount: string; currency: string; status: string;
      periodStart: string; periodEnd: string; paidAt: string | null; paymentRef: string | null;
      profilesViewed: number; note: string | null;
    }[];
  }> => request('/organizations/me/billing', { headers: bearer(token) }),

  organizationStudents: (token: string, filters: Record<string, string> = {}) => {
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value)).toString();
    return request(`/organizations/me/students${query ? `?${query}` : ''}`, { headers: bearer(token) });
  },

  organizationStudent: (token: string, id: string) =>
    request(`/organizations/me/students/${id}`, { headers: bearer(token) }),

  /** What an organisation still owes a reviewer, and how far along it is. */
  organizationVerification: (token: string) =>
    request('/organizations/me/verification', { headers: bearer(token) }),

  saveOrganizationVerification: (token: string, payload: ApiPayload) =>
    request('/organizations/me/verification', {
      method: 'PUT',
      headers: { ...bearer(token), 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  organizationProducts: (token: string) => request('/organizations/me/products', { headers: bearer(token) }),

  // ── The offers a product is prepared to make ───────────────────────────────

  /** Every template, with the product each belongs to. */
  offerTemplates: (token: string) => request('/organizations/me/offer-templates', { headers: bearer(token) }),

  createOfferTemplate: (token: string, productId: string, payload: ApiPayload) =>
    request('/organizations/me/products/' + encodeURIComponent(productId) + '/templates', {
      method: 'POST',
      headers: { ...bearer(token), 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  updateOfferTemplate: (token: string, id: string, payload: ApiPayload) =>
    request('/organizations/me/offer-templates/' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: { ...bearer(token), 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  /** The ones put away, for the archive drawer under each product. */
  archivedOfferTemplates: (token: string) =>
    request('/organizations/me/offer-templates?archived=1', { headers: bearer(token) }),

  /** Archived, not deleted: offers already sent on it still point at it. */
  archiveOfferTemplate: (token: string, id: string) =>
    request('/organizations/me/offer-templates/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: bearer(token)
    }),

  /** The way back out of the archive. */
  restoreOfferTemplate: (token: string, id: string) =>
    request('/organizations/me/offer-templates/' + encodeURIComponent(id) + '/restore', {
      method: 'POST',
      headers: bearer(token)
    }),

  /** One click: a product, a student, and the terms the template already describes. */
  quickInvite: (token: string, payload: { studentUserId: string; productId: string; templateId?: string }) =>
    request('/organizations/me/offers/quick-invite', {
      method: 'POST',
      headers: { ...bearer(token), 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  createOrganizationProduct: (token: string, payload: ApiPayload) =>
    request('/organizations/me/products', { method: 'POST', headers: bearer(token), body: JSON.stringify(payload) }),

  updateOrganizationProduct: (token: string, id: string, payload: ApiPayload) =>
    request(`/organizations/me/products/${id}`, { method: 'PATCH', headers: bearer(token), body: JSON.stringify(payload) }),

  archiveOrganizationProduct: (token: string, id: string) =>
    request(`/organizations/me/products/${id}`, { method: 'DELETE', headers: bearer(token) }),

  importOrganizationProducts: (token: string, products: ApiPayload[]) =>
    request('/organizations/me/products/import', {
      method: 'POST',
      headers: bearer(token),
      body: JSON.stringify({ products })
    }),

  organizationShortlist: (token: string) => request('/organizations/me/shortlist', { headers: bearer(token) }),

  addToShortlist: (token: string, studentUserId: string, status: 'SHORTLISTED' | 'REJECTED' = 'SHORTLISTED') =>
    request('/organizations/me/shortlist', {
      method: 'POST',
      headers: bearer(token),
      body: JSON.stringify({ studentUserId, status })
    }),

  removeFromShortlist: (token: string, studentUserId: string) =>
    request(`/organizations/me/shortlist/${studentUserId}`, { method: 'DELETE', headers: bearer(token) }),

  organizationTeam: (token: string) => request('/organizations/me/team', { headers: bearer(token) }),

  inviteOfficer: (token: string, payload: { name: string; email: string }) =>
    request('/organizations/me/team', { method: 'POST', headers: bearer(token), body: JSON.stringify(payload) }),

  removeOfficer: (token: string, id: string) =>
    request(`/organizations/me/team/${id}`, { method: 'DELETE', headers: bearer(token) }),

  organizationOffers: (token: string, status = 'ALL') =>
    request(`/organizations/me/offers?status=${encodeURIComponent(status)}`, { headers: bearer(token) }),

  createOrganizationOffer: (token: string, payload: ApiPayload) =>
    request('/organizations/me/offers', { method: 'POST', headers: bearer(token), body: JSON.stringify(payload) }),

  withdrawOrganizationOffer: (token: string, id: string) =>
    request(`/organizations/me/offers/${id}/withdraw`, { method: 'POST', headers: bearer(token) }),

  messageOrganizationOffer: (token: string, id: string, body: string, file?: File) => {
    if (!file) {
      return request(`/organizations/me/offers/${id}/messages`, {
        method: 'POST',
        headers: bearer(token),
        body: JSON.stringify({ body })
      });
    }
    const form = new FormData();
    form.append('body', body);
    form.append('file', file);
    return request(`/organizations/me/offers/${id}/messages`, { method: 'POST', headers: bearer(token), body: form }, false);
  },

  markOrganizationThreadRead: (token: string, id: string) =>
    request(`/organizations/me/offers/${id}/read`, { method: 'POST', headers: bearer(token) }),

  organizationUnreadMessages: (token: string) =>
    request('/organizations/me/offers/messages/unread', { headers: bearer(token) }),

  organizationAttachmentUrl: (token: string, offerId: string, messageId: string) =>
    authedFile(token, `/organizations/me/offers/${offerId}/messages/${messageId}/attachment`),

  /** Public — the offer-condition presets an officer can insert into an invitation. */
  getOfferConditionPresets: (): Promise<{
    presets: Array<{ id: string; category: string; text: string; vars: string[] }>;
  }> => request('/reference/offer-conditions'),

  getOrganizationOptions: (): Promise<{
    plans: Array<{ name: string; profiles: string; recommended: boolean; features: string[]; unlocks: string[] }>;
    bankEvaluationModes: Array<{ value: string; label: string; description: string }>;
  }> => request('/reference/organization-options'),

  // ── Admin ──

  adminStats: (adminKey: string) => request('/admin/stats', { headers: { authorization: `Bearer ${adminKey}` } }),

  adminAuthLogs: (adminKey: string, query: Record<string, string> = {}) => {
    const search = new URLSearchParams(Object.entries(query).filter(([, value]) => value)).toString();
    return request(`/admin/auth-logs${search ? `?${search}` : ''}`, { headers: { authorization: `Bearer ${adminKey}` } });
  },

  // ── Form builder ──

  /** Public — the published schema the student portal renders from. */
  formSchema: (variant = 'DEFAULT', form = 'STUDENT_PROFILE') =>
    request(`/reference/form-schema?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`),

  /** Which forms an admin can edit, with their variants. */
  formList: () => request('/reference/form-schema/forms'),

  formSchemaVariants: (form = 'STUDENT_PROFILE') =>
    request(`/reference/form-schema/variants?form=${encodeURIComponent(form)}`),

  adminFormVersions: (adminKey: string, variant = 'DEFAULT', form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  adminFormDraft: (adminKey: string, variant = 'DEFAULT', form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/draft?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  adminSaveFormDraft: (adminKey: string, variant: string, definition: unknown, label?: string, form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/draft?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ definition, label })
    }),

  adminResetFormDraft: (adminKey: string, variant: string, form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/draft/reset?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  /** What publishing the current draft would break. */
  adminFormImpact: (adminKey: string, variant = 'DEFAULT', form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/impact?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  adminPublishForm: (adminKey: string, variant: string, acknowledge = false, form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/publish?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ acknowledge, actor: 'super-admin' })
    }),

  adminRestoreForm: (adminKey: string, variant: string, version: number, form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/restore/${version}?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  adminFormHealth: (adminKey: string, variant = 'DEFAULT', form = 'STUDENT_PROFILE') =>
    request(`/admin/form-schema/health?variant=${encodeURIComponent(variant)}&form=${encodeURIComponent(form)}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  /** Every rule, plus the triggers and placeholders an admin can write against. */
  adminAutomation: (adminKey: string) =>
    request('/admin/automation', { headers: { authorization: `Bearer ${adminKey}` } }),

  adminCreateAutomationRule: (adminKey: string, rule: unknown) =>
    request('/admin/automation', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(rule)
    }),

  adminUpdateAutomationRule: (adminKey: string, id: string, rule: unknown) =>
    request(`/admin/automation/${id}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(rule)
    }),

  adminDeleteAutomationRule: (adminKey: string, id: string) =>
    request(`/admin/automation/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${adminKey}` } }),

  /** The named lists every dropdown draws from, with which fields use each. */
  adminOptionSets: (adminKey: string) =>
    request('/admin/form-schema/option-sets', { headers: { authorization: `Bearer ${adminKey}` } }),

  /** Who would be left holding a value, asked before it is removed. */
  adminOptionSetImpact: (adminKey: string, key: string, values: string[]) =>
    request(`/admin/form-schema/option-sets/${encodeURIComponent(key)}/impact`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ values })
    }),

  adminSaveOptionSet: (adminKey: string, key: string, payload: ApiPayload) =>
    request(`/admin/form-schema/option-sets/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    }),

  /** What a condition may read, and which comparisons each field allows. */
  adminAutomationFields: (adminKey: string) =>
    request('/admin/automation/fields', { headers: { authorization: `Bearer ${adminKey}` } }),

  /** Students who accepted an offer, for the team to follow up. */
  adminAdmissions: (adminKey: string, status?: string) =>
    request(`/admin/admissions${status ? `?status=${encodeURIComponent(status)}` : ''}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  /** One acceptance in full: the offer, who sent it, and the student. */
  adminAdmissionDetail: (adminKey: string, offerId: string) =>
    request(`/admin/admissions/${offerId}`, { headers: { authorization: `Bearer ${adminKey}` } }),

  /** What the team found when they checked with the university. */
  adminRecordAdmission: (adminKey: string, offerId: string, body: { status: string; note: string }) =>
    request(`/admin/admissions/${offerId}`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }),

  /** Erases the student's personal data. Irreversible. */
  adminPurgeAdmission: (adminKey: string, offerId: string) =>
    request(`/admin/admissions/${offerId}/purge`, {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({})
    }),

  /** Which channels exist and whether each is configured to actually send. */
  adminAutomationChannels: (adminKey: string) =>
    request('/admin/automation/channels', { headers: { authorization: `Bearer ${adminKey}` } }),

  /** What a rule has actually done lately, per channel, newest first. */
  adminAutomationDeliveries: (adminKey: string, ruleId: string) =>
    request(`/admin/automation/${ruleId}/deliveries`, { headers: { authorization: `Bearer ${adminKey}` } }),

  /** What a condition means in English, and whether it means anything at all. */
  adminExplainCondition: (adminKey: string, condition: unknown) =>
    request('/admin/automation/explain', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ condition })
    }),

  /** What is waiting to be sent, and what was skipped and why. */
  adminScheduledAutomation: (adminKey: string) =>
    request('/admin/automation/scheduled', { headers: { authorization: `Bearer ${adminKey}` } }),

  adminRunScheduledAutomation: (adminKey: string) =>
    request('/admin/automation/scheduled/run', { method: 'POST', headers: { authorization: `Bearer ${adminKey}` } }),

  /** Renders a body against a sample offer, so wording is checked before it is saved. */
  adminPreviewAutomation: (adminKey: string, body: string) =>
    request('/admin/automation/preview', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ body })
    }),

  adminRegistrations: (adminKey: string, status = 'PENDING', orgType = 'ALL') =>
    request(`/admin/registrations?status=${encodeURIComponent(status)}&org_type=${encodeURIComponent(orgType)}`, {
      headers: { authorization: `Bearer ${adminKey}` }
    }),

  reviewRegistration: (
    adminKey: string,
    userId: string,
    approvalStatus: 'APPROVED' | 'REJECTED',
    rejectionReason = '',
    approvalNote = ''
  ) =>
    request(`/admin/users/${encodeURIComponent(userId)}/approval`, {
      method: 'PATCH',
      headers: { authorization: `Bearer ${adminKey}` },
      body: JSON.stringify({
        approval_status: approvalStatus,
        rejection_reason: rejectionReason,
        approval_note: approvalNote
      })
    }),

  // ── Subscriptions, sold and settled offline ───────────────────────────────

  adminBilling: (adminKey: string) => request('/admin/billing', { headers: { authorization: `Bearer ${adminKey}` } }),

  adminCreateSubscription: (
    adminKey: string,
    payload: { organizationId: string; plan: string; periodStart: string; periodEnd: string; amount: number; currency?: string; note?: string }
  ) => request('/admin/billing/subscriptions', { method: 'POST', headers: { authorization: `Bearer ${adminKey}` }, body: JSON.stringify(payload) }),

  /** The money arrived by transfer or cheque; this writes down that it did. */
  adminMarkSubscriptionPaid: (adminKey: string, id: string, payload: { paymentRef?: string; recordedBy?: string }) =>
    request(`/admin/billing/subscriptions/${encodeURIComponent(id)}/paid`, {
      method: 'POST', headers: { authorization: `Bearer ${adminKey}` }, body: JSON.stringify(payload)
    }),

  adminSetSubscriptionStatus: (adminKey: string, id: string, status: string) =>
    request(`/admin/billing/subscriptions/${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { authorization: `Bearer ${adminKey}` }, body: JSON.stringify({ status })
    }),

  adminSetOrganizationSuspension: (adminKey: string, organizationId: string, suspended: boolean, reason?: string) =>
    request(`/admin/billing/organizations/${encodeURIComponent(organizationId)}/suspension`, {
      method: 'POST', headers: { authorization: `Bearer ${adminKey}` }, body: JSON.stringify({ suspended, reason })
    }),

  adminAuditLog: (adminKey: string) => request('/admin/audit-log?limit=100', { headers: { authorization: `Bearer ${adminKey}` } })
};
