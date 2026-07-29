import { Injectable } from '@angular/core';

export type PortalKey = 'student' | 'university' | 'bank' | 'consultancy';

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

  async studentOffers(token: string): Promise<any> {
    return this.request('/students/me/offers', { headers: { authorization: `Bearer ${token}` } });
  }

  async adminRegistrations(adminKey: string, status = 'PENDING'): Promise<any> {
    return this.request(`/admin/registrations?status=${encodeURIComponent(status)}`, {
      headers: { 'x-admin-key': adminKey }
    });
  }

  async reviewRegistration(adminKey: string, userId: string, approvalStatus: 'APPROVED' | 'REJECTED', rejectionReason = ''): Promise<any> {
    return this.request(`/admin/users/${encodeURIComponent(userId)}/approval`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey },
      body: JSON.stringify({ approval_status: approvalStatus, rejection_reason: rejectionReason })
    });
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: { 'content-type': 'application/json', ...(options.headers || {}) }
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
