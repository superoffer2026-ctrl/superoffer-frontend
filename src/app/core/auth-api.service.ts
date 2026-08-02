import { Injectable } from '@angular/core';

export type PortalKey = 'student' | 'organization' | 'consultancy';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly requestTimeoutMs = 15_000;
  private readonly baseUrl =
    (window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL || '/api/v1';

  async register(payload: Record<string, unknown>): Promise<any> {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
  }

  async login(identifier: string, password: string): Promise<any> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
  }

  async status(userId: string): Promise<any> {
    return this.request(`/auth/status/${userId}`);
  }

  async currentUser(token: string): Promise<any> {
    return this.request('/auth/me', { headers: { authorization: `Bearer ${token}` } });
  }

  async studentProfile(token: string): Promise<any> {
    return this.request('/students/me', { headers: { authorization: `Bearer ${token}` } });
  }

  async updateStudentProfile(token: string, profile: Record<string, unknown>): Promise<any> {
    return this.request('/students/me', {
      method: 'PUT',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(profile)
    });
  }

  async studentFullProfile(token: string): Promise<any> {
    return this.request('/student/profile', { headers: { authorization: `Bearer ${token}` } });
  }

  async saveStudentProfileSection(token: string, section: string, payload: Record<string, unknown>): Promise<any> {
    return this.request(`/student/profile/${section}`, {
      method: 'PUT',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
  }

  async uploadStudentDocument(token: string, documentType: string, file: File): Promise<any> {
    const form = new FormData();
    form.append('documentType', documentType);
    form.append('file', file);
    return this.request(`/student/profile/documents`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: form
    }, false);
  }

  async studentOffers(token: string): Promise<any> {
    return this.request('/students/me/offers', { headers: { authorization: `Bearer ${token}` } });
  }

  async adminRegistrations(adminKey: string, status = 'PENDING', orgType = 'ALL'): Promise<any> {
    return this.request(`/admin/registrations?status=${encodeURIComponent(status)}&org_type=${encodeURIComponent(orgType)}`, {
      headers: { 'x-admin-key': adminKey }
    });
  }

  async reviewRegistration(adminKey: string, userId: string, approvalStatus: 'APPROVED' | 'REJECTED', rejectionReason = '', approvalNote = ''): Promise<any> {
    return this.request(`/admin/users/${encodeURIComponent(userId)}/approval`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey },
      body: JSON.stringify({ approval_status: approvalStatus, rejection_reason: rejectionReason, approval_note: approvalNote })
    });
  }

  async adminAuditLog(adminKey: string): Promise<any> {
    return this.request('/admin/audit-log?limit=100', { headers:{ 'x-admin-key':adminKey } });
  }

  private async request(path: string, options: RequestInit = {}, json = true): Promise<any> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { ...(json ? { 'content-type': 'application/json' } : {}), ...(options.headers || {}) }
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(body?.message || 'The request could not be completed.') as Error & {
          body?: any;
          status?: number;
          code?: string;
        };
        error.body = body;
        error.status = response.status;
        error.code = body?.code;
        throw error;
      }
      return body;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`Could not connect to the SuperOffer API at ${this.baseUrl}. Please try again.`);
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
}
