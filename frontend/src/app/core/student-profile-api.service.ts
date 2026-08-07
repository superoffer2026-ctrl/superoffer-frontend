import { Injectable } from '@angular/core';

export interface StudentDocument {
  id: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class StudentProfileApiService {
  private readonly baseUrl = ((window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL || '/api/v1') + '/students/me';
  private token() { return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token') || ''; }
  private headers(json = true) { return { ...(json ? { 'content-type': 'application/json' } : {}), authorization: `Bearer ${this.token()}` }; }

  getProfile(): Promise<any> { return this.request(''); }
  updateProfile(payload: unknown): Promise<any> { return this.request('', { method: 'PUT', body: JSON.stringify(payload) }); }
  getCompletion() { return this.request('/completion'); }
  saveFinancial(payload: unknown) { return this.request('/financial', { method: 'PUT', body: JSON.stringify(payload) }); }
  async getFinancial() { return (await this.getProfile())?.financial || {}; }
  listDocuments(): Promise<StudentDocument[]> { return this.request('/documents'); }

  uploadDocument(documentType: string, file: File): Promise<StudentDocument> {
    const data = new FormData();
    data.append('documentType', documentType);
    data.append('file', file);
    return this.request('/documents', { method: 'POST', body: data }, true, false);
  }

  replaceDocument(id: string, file: File): Promise<StudentDocument> {
    const data = new FormData();
    data.append('file', file);
    return this.request(`/documents/${id}`, { method: 'PUT', body: data }, true, false);
  }

  deleteDocument(id: string) { return this.request(`/documents/${id}`, { method: 'DELETE' }); }

  async previewDocument(id: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/documents/${id}/preview`, { headers: this.headers(false) });
    if (!response.ok) throw new Error('The document could not be opened.');
    return URL.createObjectURL(await response.blob());
  }

  submit() { return this.request('/submit', { method: 'POST' }); }

  private async request(path: string, options: RequestInit = {}, expectJson = true, json = true): Promise<any> {
    const response = await fetch(`${this.baseUrl}${path}`, { ...options, headers: options.headers || this.headers(json) });
    const body = expectJson ? await response.json().catch(() => null) : null;
    if (!response.ok) throw new Error(body?.message || 'The profile request could not be completed.');
    return body;
  }
}
