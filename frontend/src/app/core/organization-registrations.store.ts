import { Injectable } from '@angular/core';
import { OrganizationType, organizationRole } from './organization.models';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OrganizationRegistration {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  organization: {
    name: string;
    organizationType: OrganizationType;
    registrationNumber?: string;
    licenseReference?: string;
    website?: string;
    city?: string;
    country?: string;
  };
  approval_status: ApprovalStatus;
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  approval_note?: string;
}

interface AuditEntry {
  occurredAt: string;
  action: string;
  organizationName: string;
  entityId: string;
  actorUserId: string;
  reason?: string;
}

const STORAGE_KEY = 'superoffer_org_registrations';
const AUDIT_KEY = 'superoffer_org_registration_audit';

function load(): OrganizationRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: OrganizationRegistration[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

function loadAudit(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistAudit(list: AuditEntry[]) {
  try { localStorage.setItem(AUDIT_KEY, JSON.stringify(list)); } catch { /* storage unavailable */ }
}

/**
 * Local, browser-only stand-in for the organization approval workflow that
 * used to live in the Express backend (register -> PENDING -> admin
 * approve/reject -> login unlocked). The NestJS backend doesn't implement
 * this yet, so the auth flow and admin panel fall back to this store until
 * it does. Swap for real `/admin/registrations` API calls once available.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationRegistrationsStore {
  submit(data: { fullName: string; email: string; phone: string; organizationName: string; orgType: OrganizationType; country: string }): OrganizationRegistration {
    const email = data.email.trim().toLowerCase();
    const list = load().filter(r => r.email !== email);
    const record: OrganizationRegistration = {
      user_id: email,
      full_name: data.fullName || data.organizationName,
      email,
      phone: data.phone,
      role: organizationRole(data.orgType),
      organization: { name: data.organizationName, organizationType: data.orgType, country: data.country },
      approval_status: 'PENDING',
      submitted_at: new Date().toISOString()
    };
    list.unshift(record);
    persist(list);
    return record;
  }

  findByEmail(email: string): OrganizationRegistration | undefined {
    return load().find(r => r.email === email.trim().toLowerCase());
  }

  list(status?: string, orgType?: string): OrganizationRegistration[] {
    let rows = load();
    if (status && status !== 'ALL') rows = rows.filter(r => r.approval_status === status);
    if (orgType && orgType !== 'ALL') rows = rows.filter(r => r.organization.organizationType === orgType);
    return rows;
  }

  summary() {
    const rows = load();
    const pendingRows = rows.filter(r => r.approval_status === 'PENDING');
    return {
      pending: pendingRows.length,
      approved: rows.filter(r => r.approval_status === 'APPROVED').length,
      rejected: rows.filter(r => r.approval_status === 'REJECTED').length,
      universities: pendingRows.filter(r => r.organization.organizationType === 'UNIVERSITY').length,
      banks: pendingRows.filter(r => r.organization.organizationType === 'BANK').length,
      consultancies: 0
    };
  }

  review(userId: string, status: 'APPROVED' | 'REJECTED', rejectionReason = '', approvalNote = ''): OrganizationRegistration | undefined {
    const list = load();
    const record = list.find(r => r.user_id === userId);
    if (!record) return undefined;
    record.approval_status = status;
    record.reviewed_at = new Date().toISOString();
    record.rejection_reason = status === 'REJECTED' ? rejectionReason : undefined;
    record.approval_note = status === 'APPROVED' ? approvalNote : undefined;
    persist(list);

    const audit = loadAudit();
    audit.unshift({
      occurredAt: record.reviewed_at,
      action: status === 'APPROVED' ? 'APPROVE_REGISTRATION' : 'REJECT_REGISTRATION',
      organizationName: record.organization.name,
      entityId: record.user_id,
      actorUserId: 'local-admin',
      reason: record.rejection_reason || record.approval_note || ''
    });
    persistAudit(audit);

    return record;
  }

  auditLog(): AuditEntry[] {
    return loadAudit();
  }
}
