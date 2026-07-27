import { Injectable } from '@angular/core';

export type PortalKey = 'student' | 'university' | 'bank' | 'consultancy';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
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

  async studentOffers(token: string): Promise<any> {
    return this.request('/students/me/offers', { headers: { authorization: `Bearer ${token}` } });
  }

  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
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
  }
}
