import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth-api.service';

export interface AuthLogItem {
  id: string;
  user_name: string;
  email: string;
  role: string;
  login_time: string;
  logout_time: string | null;
  session_duration_seconds: number;
  browser: string;
  device: string;
  operating_system: string;
  ip_address: string;
  status: string;
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="admin-page">
      <header class="admin-header">
        <a class="brand" routerLink="/">
          <img src="/assets/superoffer-logo.svg" alt="SuperOffer Logo" style="height:36px;width:36px;object-fit:contain;" />
          <span>SuperOffer</span>
        </a>
        <div>
          <span class="eyebrow">SUPER ADMIN PANEL</span>
          <h1>Platform Operations & Audit</h1>
        </div>
        <button *ngIf="authenticated" class="button secondary" (click)="signOut()">Sign out</button>
      </header>

      <!-- Auth Key Challenge Card -->
      <section class="admin-key-card" *ngIf="!authenticated">
        <h2>Super Admin authorization</h2>
        <p>Enter the protected approval key configured on the backend.</p>
        <form (ngSubmit)="connect()">
          <label>Admin approval key
            <input type="password" name="adminKey" [(ngModel)]="adminKey" required placeholder="e.g. development-admin-key">
          </label>
          <p class="form-message error" *ngIf="error">{{error}}</p>
          <button type="submit" class="button primary" [disabled]="loading || !adminKey">
            {{loading ? 'Authenticating…' : 'Open admin dashboard'}}
          </button>
        </form>
      </section>

      <!-- Authenticated Dashboard -->
      <section *ngIf="authenticated" class="admin-main-section">
        <!-- Tab Navigation -->
        <nav class="admin-tabs">
          <button [class.active]="activeTab === 'approvals'" (click)="switchTab('approvals')">
            🏛️ Verification Queue ({{registrations.length}})
          </button>
          <button [class.active]="activeTab === 'logs'" (click)="switchTab('logs')">
            🔒 Authentication Audit Logs
          </button>
          <button class="refresh-btn" (click)="reloadCurrentTab()">🔄 Refresh</button>
        </nav>

        <p class="form-message error" *ngIf="error">{{error}}</p>

        <!-- TAB 1: INSTITUTION APPROVAL QUEUE -->
        <div *ngIf="activeTab === 'approvals'" class="tab-content">
          <nav class="admin-filters">
            <button *ngFor="let item of statuses" [class.active]="status === item" (click)="setStatus(item)">{{item}}</button>
          </nav>
          
          <div class="admin-summary">
            <strong>{{registrations.length}}</strong> <span>{{status.toLowerCase()}} registrations</span>
          </div>

          <div class="empty-admin" *ngIf="!loading && registrations.length === 0">
            No {{status.toLowerCase()}} institution registrations found.
          </div>

          <div class="approval-list">
            <article *ngFor="let item of registrations">
              <div class="approval-heading">
                <span>{{initials(item.full_name)}}</span>
                <div>
                  <small>{{roleLabel(item.role)}}</small>
                  <h2>{{item.organization?.name || item.full_name}}</h2>
                  <p>{{item.full_name}} · {{item.email}}</p>
                </div>
                <b [class]="item.approval_status.toLowerCase()">{{item.approval_status}}</b>
              </div>
              <dl>
                <div><dt>Registration number</dt><dd>{{item.organization?.registrationNumber || 'Not provided'}}</dd></div>
                <div><dt>Accreditation / licence</dt><dd>{{item.organization?.licenseReference || 'Not provided'}}</dd></div>
                <div><dt>Phone</dt><dd>{{item.phone || 'Not provided'}}</dd></div>
                <div><dt>Submitted</dt><dd>{{item.submitted_at | date:'medium'}}</dd></div>
              </dl>
              <footer *ngIf="item.approval_status === 'PENDING'">
                <button class="button reject" [disabled]="reviewing === item.user_id" (click)="review(item, 'REJECTED')">Reject</button>
                <button class="button approve" [disabled]="reviewing === item.user_id" (click)="review(item, 'APPROVED')">
                  {{reviewing === item.user_id ? 'Saving…' : 'Approve institution'}}
                </button>
              </footer>
            </article>
          </div>
        </div>

        <!-- TAB 2: AUTHENTICATION AUDIT LOGS -->
        <div *ngIf="activeTab === 'logs'" class="tab-content">
          <div class="logs-toolbar">
            <div class="search-box">
              <input type="text" [(ngModel)]="logSearch" (ngModelChange)="onLogFilterChange()" placeholder="Search name, email, IP..." />
            </div>
            
            <div class="filter-controls">
              <select [(ngModel)]="logRoleFilter" (change)="onLogFilterChange()">
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STUDENT">Student</option>
                <option value="UNIVERSITY_OFFICER">University Officer</option>
                <option value="LOAN_OFFICER">Loan Officer</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="UNKNOWN">Unknown</option>
              </select>

              <select [(ngModel)]="logStatusFilter" (change)="onLogFilterChange()">
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
                <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                <option value="LOCKED">LOCKED</option>
                <option value="LOGOUT">LOGOUT</option>
              </select>

              <input type="date" [(ngModel)]="logDateFrom" (change)="onLogFilterChange()" title="From Date" />
              <input type="date" [(ngModel)]="logDateTo" (change)="onLogFilterChange()" title="To Date" />

              <button class="button export-btn" (click)="exportCsv()">📥 Export CSV</button>
            </div>
          </div>

          <div class="logs-table-wrapper">
            <table class="logs-table">
              <thead>
                <tr>
                  <th>User & Email</th>
                  <th>Role</th>
                  <th>Login Time</th>
                  <th>Device / Browser</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of authLogs">
                  <td>
                    <strong>{{log.user_name}}</strong>
                    <small>{{log.email}}</small>
                  </td>
                  <td><span class="role-badge">{{log.role}}</span></td>
                  <td>{{log.login_time | date:'short'}}</td>
                  <td>{{log.device}} · {{log.browser}} ({{log.operating_system}})</td>
                  <td><code>{{log.ip_address}}</code></td>
                  <td>
                    <span class="status-tag" [class]="log.status.toLowerCase()">
                      {{log.status}}
                    </span>
                  </td>
                  <td>
                    <button class="view-btn" (click)="selectedLog = log">Inspect</button>
                  </td>
                </tr>
                <tr *ngIf="!loadingLogs && authLogs.length === 0">
                  <td colspan="7" class="empty-cell">No authentication logs match the selected filters.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination-bar" *ngIf="logTotalPages > 1">
            <button [disabled]="logPage <= 1" (click)="changeLogPage(logPage - 1)">← Previous</button>
            <span>Page {{logPage}} of {{logTotalPages}} ({{logTotalRecords}} logs)</span>
            <button [disabled]="logPage >= logTotalPages" (click)="changeLogPage(logPage + 1)">Next →</button>
          </div>
        </div>
      </section>

      <!-- Log Detail Inspector Modal -->
      <div class="modal-backdrop" *ngIf="selectedLog" (click)="selectedLog = null">
        <div class="modal-card" (click)="$event.stopPropagation()">
          <header class="modal-header">
            <h3>Auth Log Inspection</h3>
            <button class="close-btn" (click)="selectedLog = null">✕</button>
          </header>
          <div class="modal-body">
            <dl class="inspect-dl">
              <div><dt>Log ID</dt><dd><code>{{selectedLog.id}}</code></dd></div>
              <div><dt>User Name</dt><dd>{{selectedLog.user_name}}</dd></div>
              <div><dt>Email</dt><dd>{{selectedLog.email}}</dd></div>
              <div><dt>Role</dt><dd>{{selectedLog.role}}</dd></div>
              <div><dt>Login Time</dt><dd>{{selectedLog.login_time | date:'full'}}</dd></div>
              <div><dt>Logout Time</dt><dd>{{selectedLog.logout_time ? (selectedLog.logout_time | date:'full') : 'Active / N/A'}}</dd></div>
              <div><dt>Session Duration</dt><dd>{{selectedLog.session_duration_seconds}} seconds</dd></div>
              <div><dt>IP Address</dt><dd><code>{{selectedLog.ip_address}}</code></dd></div>
              <div><dt>Device Type</dt><dd>{{selectedLog.device}}</dd></div>
              <div><dt>Browser & OS</dt><dd>{{selectedLog.browser}} on {{selectedLog.operating_system}}</dd></div>
              <div><dt>Authentication Result</dt><dd><strong [class]="selectedLog.status.toLowerCase()">{{selectedLog.status}}</strong></dd></div>
            </dl>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f8faf9;
      font-family: "DM Sans", Arial, sans-serif;
      color: #101713;
    }
    .admin-page {
      max-width: 1320px;
      margin: 0 auto;
      padding: 30px 20px 60px;
    }
    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e1e7e4;
      margin-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      font-size: 22px;
      font-weight: 800;
      color: #101713;
    }
    .eyebrow {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.15em;
      color: #176c56;
      text-transform: uppercase;
    }
    .admin-header h1 {
      margin: 4px 0 0;
      font-size: 24px;
      font-weight: 800;
    }
    .admin-key-card {
      max-width: 480px;
      margin: 60px auto;
      background: #fff;
      padding: 36px;
      border-radius: 16px;
      border: 1px solid #dce4e0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
    }
    .admin-tabs {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      border-bottom: 2px solid #e1e7e4;
      padding-bottom: 8px;
    }
    .admin-tabs button {
      border: 0;
      background: transparent;
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 700;
      color: #55625c;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .admin-tabs button.active {
      background: #102f45;
      color: #fff;
    }
    .refresh-btn {
      margin-left: auto;
    }
    .admin-filters {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .admin-filters button {
      border: 1px solid #cfd7d3;
      background: #fff;
      padding: 6px 14px;
      border-radius: 99px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
    }
    .admin-filters button.active {
      background: #176c56;
      color: #fff;
      border-color: #176c56;
    }
    .admin-summary {
      font-size: 14px;
      margin-bottom: 16px;
    }
    .admin-summary strong {
      font-size: 20px;
      margin-right: 6px;
    }
    .approval-list article {
      background: #fff;
      border: 1px solid #dce4e0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .approval-heading {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }
    .approval-heading span:first-child {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #102f45;
      color: #65cbb0;
      display: grid;
      place-items: center;
      font-weight: 800;
    }
    .approval-heading h2 {
      margin: 0;
      font-size: 18px;
    }
    .approval-heading p {
      margin: 2px 0 0;
      font-size: 13px;
      color: #55625c;
    }
    .approval-heading b {
      margin-left: auto;
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 12px;
    }
    .approval-heading b.pending { background: #fff3d6; color: #8f6100; }
    .approval-heading b.approved { background: #e2f7ed; color: #127354; }
    .approval-heading b.rejected { background: #fee8e5; color: #a83526; }

    dl {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8faf9;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    dt { color: #66736c; font-size: 11px; text-transform: uppercase; font-weight: 700; }
    dd { margin: 2px 0 0; font-weight: 600; }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 14px;
    }

    /* Auth Logs Styles */
    .logs-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 18px;
      background: #fff;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #dce4e0;
    }
    .search-box input {
      padding: 8px 14px;
      border: 1px solid #ccd5d0;
      border-radius: 8px;
      font-size: 14px;
      width: 260px;
    }
    .filter-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }
    .filter-controls select, .filter-controls input[type="date"] {
      padding: 8px 12px;
      border: 1px solid #ccd5d0;
      border-radius: 8px;
      font-size: 13px;
      background: #fff;
    }
    .export-btn {
      background: #176c56;
      color: #fff;
      border: 0;
      border-radius: 8px;
      padding: 8px 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .logs-table-wrapper {
      background: #fff;
      border: 1px solid #dce4e0;
      border-radius: 12px;
      overflow-x: auto;
    }
    .logs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    .logs-table th, .logs-table td {
      padding: 14px 16px;
      border-bottom: 1px solid #edf1ef;
    }
    .logs-table th {
      background: #f4f7f5;
      font-size: 12px;
      font-weight: 800;
      color: #55625c;
      text-transform: uppercase;
    }
    .logs-table td strong {
      display: block;
      color: #101713;
    }
    .logs-table td small {
      color: #66736c;
    }
    .role-badge {
      background: #eef3f0;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
    }
    .status-tag {
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 11px;
      font-weight: 800;
    }
    .status-tag.success { background: #e2f7ed; color: #127354; }
    .status-tag.failed { background: #fee8e5; color: #a83526; }
    .status-tag.pending_approval { background: #fff3d6; color: #8f6100; }
    .status-tag.locked { background: #f3e8ff; color: #6b21a8; }
    .status-tag.logout { background: #e0f2fe; color: #0369a1; }

    .view-btn {
      border: 1px solid #cfd7d3;
      background: #fff;
      padding: 4px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 700;
    }
    .view-btn:hover { background: #f4f7f5; }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 18px;
      font-size: 13px;
      color: #55625c;
    }
    .pagination-bar button {
      padding: 6px 14px;
      border: 1px solid #cfd7d3;
      background: #fff;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    .pagination-bar button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: grid;
      place-items: center;
      z-index: 100;
    }
    .modal-card {
      background: #fff;
      border-radius: 16px;
      width: min(560px, 92vw);
      padding: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .close-btn {
      border: 0;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
    }
    .inspect-dl {
      grid-template-columns: 1fr 1fr;
    }
  `]
})
export class AdminPageComponent implements OnInit {
  adminKey = '';
  authenticated = false;
  loading = false;
  error = '';
  reviewing = '';

  activeTab: 'approvals' | 'logs' = 'approvals';

  // Approvals queue
  status = 'PENDING';
  statuses = ['PENDING', 'APPROVED', 'REJECTED'];
  registrations: any[] = [];

  // Auth audit logs
  authLogs: AuthLogItem[] = [];
  loadingLogs = false;
  logSearch = '';
  logRoleFilter = 'ALL';
  logStatusFilter = 'ALL';
  logDateFrom = '';
  logDateTo = '';
  logPage = 1;
  logLimit = 10;
  logTotalRecords = 0;
  logTotalPages = 1;
  selectedLog: AuthLogItem | null = null;

  constructor(private api: AuthApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.adminKey = sessionStorage.getItem('superoffer_admin_key') || '';
    if (this.adminKey) this.connect();
  }

  async connect() {
    this.loading = true;
    this.error = '';
    try {
      if (this.activeTab === 'approvals') {
        await this.loadRegistrations();
      } else {
        await this.loadAuthLogs();
      }
      this.authenticated = true;
      sessionStorage.setItem('superoffer_admin_key', this.adminKey);
    } catch (error) {
      this.authenticated = false;
      this.error = error instanceof Error ? error.message : 'Admin access failed.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async switchTab(tab: 'approvals' | 'logs') {
    this.activeTab = tab;
    this.error = '';
    await this.reloadCurrentTab();
  }

  async reloadCurrentTab() {
    this.loading = true;
    try {
      if (this.activeTab === 'approvals') {
        await this.loadRegistrations();
      } else {
        await this.loadAuthLogs();
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Could not fetch data.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadRegistrations() {
    const result = await this.api.adminRegistrations(this.adminKey, this.status);
    this.registrations = result.registrations || [];
    this.cdr.detectChanges();
  }

  async setStatus(status: string) {
    this.status = status;
    this.loading = true;
    this.error = '';
    try {
      await this.loadRegistrations();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not load registrations.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  async loadAuthLogs() {
    this.loadingLogs = true;
    try {
      const params: Record<string, string> = {
        page: String(this.logPage),
        limit: String(this.logLimit)
      };
      if (this.logSearch) params['search'] = this.logSearch;
      if (this.logRoleFilter !== 'ALL') params['role'] = this.logRoleFilter;
      if (this.logStatusFilter !== 'ALL') params['status'] = this.logStatusFilter;
      if (this.logDateFrom) params['date_from'] = this.logDateFrom;
      if (this.logDateTo) params['date_to'] = this.logDateTo;

      const result = await this.api.adminAuthLogs(this.adminKey, params);
      this.authLogs = result.logs || [];
      this.logTotalRecords = result.total || 0;
      this.logTotalPages = result.total_pages || 1;
    } finally {
      this.loadingLogs = false;
      this.cdr.detectChanges();
    }
  }

  onLogFilterChange() {
    this.logPage = 1;
    this.loadAuthLogs();
  }

  changeLogPage(newPage: number) {
    this.logPage = newPage;
    this.loadAuthLogs();
  }

  async exportCsv() {
    try {
      const params: Record<string, string> = {};
      if (this.logSearch) params['search'] = this.logSearch;
      if (this.logRoleFilter !== 'ALL') params['role'] = this.logRoleFilter;
      if (this.logStatusFilter !== 'ALL') params['status'] = this.logStatusFilter;
      if (this.logDateFrom) params['date_from'] = this.logDateFrom;
      if (this.logDateTo) params['date_to'] = this.logDateTo;

      const blob = await this.api.downloadAuthLogsCsv(this.adminKey, params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auth_audit_logs_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      this.error = e instanceof Error ? e.message : 'CSV export failed.';
    }
  }

  async review(item: any, approvalStatus: 'APPROVED' | 'REJECTED') {
    const reason = approvalStatus === 'REJECTED' ? window.prompt('Reason for rejection:', 'The submitted organization details could not be verified') : '';
    if (approvalStatus === 'REJECTED' && reason === null) return;
    this.reviewing = item.user_id;
    this.error = '';
    try {
      await this.api.reviewRegistration(this.adminKey, item.user_id, approvalStatus, reason || '');
      await this.loadRegistrations();
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Could not update this registration.';
    } finally {
      this.reviewing = '';
      this.cdr.detectChanges();
    }
  }

  signOut() {
    sessionStorage.removeItem('superoffer_admin_key');
    this.adminKey = '';
    this.authenticated = false;
    this.registrations = [];
    this.authLogs = [];
  }

  initials(name: string) {
    return String(name || '?').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  roleLabel(role: string) {
    return String(role || '').replaceAll('_', ' ');
  }
}
