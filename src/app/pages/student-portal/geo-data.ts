/**
 * Country/city list data used to live here as static arrays. It's now served by the
 * backend (`GET /api/v1/reference/geo`) as the single source of truth, shared with the
 * backend's own DTO validators — see personal-information.component.ts and
 * superoffer-backend/src/reference/. Only the shared type stays here.
 */
export interface CountryInfo {
  name: string;
  iso2: string;
  dial: string;
}
