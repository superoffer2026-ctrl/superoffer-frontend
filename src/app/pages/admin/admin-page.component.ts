import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <main class="admin-page">
      <header>
        <a class="brand" routerLink="/"><span>S</span>SuperOffer</a>
        <div><span class="eyebrow">SUPER ADMIN</span><h1>Institution approvals</h1>
          <p>Review university, lender, and consultancy registrations before marketplace access is granted.</p></div>
        <button *ngIf="authenticated" class="button secondary" (click)="signOut()">Sign out</button>
      </header>

      <section class="admin-key-card" *ngIf="!authenticated">
        <h2>Admin access</h2>
        <p>Enter the approval key configured on the backend.</p>
        <form (ngSubmit)="connect()">
          <label>Admin approval key<input type="password" name="adminKey" [(ngModel)]="adminKey" required></label>
          <p class="form-message error" *ngIf="error">{{error}}</p>
          <button type="submit" class="button primary" [disabled]="loading || !adminKey">{{loading ? 'Connecting…' : 'Open approval queue'}}</button>
        </form>
      </section>

      <section *ngIf="authenticated">
        <nav class="admin-filters">
          <button *ngFor="let item of statuses" [class.active]="status === item" (click)="setStatus(item)">{{item}}</button>
          <button class="refresh" (click)="load()">Refresh</button>
        </nav>
        <p class="form-message error" *ngIf="error">{{error}}</p>
        <div class="admin-summary"><strong>{{registrations.length}}</strong><span>{{status.toLowerCase()}} registrations</span></div>
        <div class="empty-admin" *ngIf="!loading && registrations.length === 0">No {{status.toLowerCase()}} institution registrations.</div>
        <div class="approval-list">
          <article *ngFor="let item of registrations">
            <div class="approval-heading"><span>{{initials(item.full_name)}}</span><div><small>{{roleLabel(item.role)}}</small>
              <h2>{{item.organization?.name || item.full_name}}</h2><p>{{item.full_name}} · {{item.email}}</p></div>
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
              <button class="button approve" [disabled]="reviewing === item.user_id" (click)="review(item, 'APPROVED')">{{reviewing === item.user_id ? 'Saving…' : 'Approve institution'}}</button>
            </footer>
          </article>
        </div>
      </section>
    </main>
  `
})
export class AdminPageComponent implements OnInit {
  adminKey = ''; authenticated = false; loading = false; error = ''; reviewing = '';
  status = 'PENDING'; statuses = ['PENDING', 'APPROVED', 'REJECTED']; registrations: any[] = [];
  constructor(private api: AuthApiService, private cdr: ChangeDetectorRef) {}
  ngOnInit() {
    this.adminKey = sessionStorage.getItem('superoffer_admin_key') || '';
    if (this.adminKey) this.connect();
  }
  async connect() {
    this.loading = true; this.error = '';
    try {
      await this.load();
      this.authenticated = true;
      sessionStorage.setItem('superoffer_admin_key', this.adminKey);
    } catch (error) {
      this.authenticated = false;
      this.error = error instanceof Error ? error.message : 'Admin access failed.';
    } finally { this.loading = false; this.cdr.detectChanges(); }
  }
  async load() {
    const result = await this.api.adminRegistrations(this.adminKey, this.status);
    this.registrations = result.registrations || [];
    this.cdr.detectChanges();
  }
  async setStatus(status: string) {
    this.status = status; this.loading = true; this.error = '';
    try { await this.load(); } catch (error) { this.error = error instanceof Error ? error.message : 'Could not load registrations.'; }
    finally { this.loading = false; this.cdr.detectChanges(); }
  }
  async review(item: any, approvalStatus: 'APPROVED' | 'REJECTED') {
    const reason = approvalStatus === 'REJECTED' ? window.prompt('Reason for rejection:', 'The submitted organization details could not be verified') : '';
    if (approvalStatus === 'REJECTED' && reason === null) return;
    this.reviewing = item.user_id; this.error = '';
    try { await this.api.reviewRegistration(this.adminKey, item.user_id, approvalStatus, reason || ''); await this.load(); }
    catch (error) { this.error = error instanceof Error ? error.message : 'Could not update this registration.'; }
    finally { this.reviewing = ''; this.cdr.detectChanges(); }
  }
  signOut() { sessionStorage.removeItem('superoffer_admin_key'); this.adminKey = ''; this.authenticated = false; this.registrations = []; }
  initials(name: string) { return String(name || '?').split(/\\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase(); }
  roleLabel(role: string) { return String(role || '').replaceAll('_', ' '); }
}
