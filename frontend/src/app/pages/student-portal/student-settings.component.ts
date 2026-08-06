import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';
import { StudentSupportChatComponent } from './student-support-chat.component';
import { SubmittedStudentsStore, mapProfileToOrgStudent } from '../../core/submitted-students.store';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StudentWorkspaceRailComponent, StudentSupportChatComponent],
  styleUrl: './student-workspace-pages.css',
  styles: [`
    .toggle-row{display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:space-between;gap:16px;padding:14px 26px;border-bottom:1px solid #eceeeb}
    .toggle-row>div{flex:1;min-width:0}
    .toggle-row strong,.toggle-row small{display:block}
    .toggle-row strong{font-size:14px}
    .toggle-row small{margin-top:3px;color:#7d8882;font-size:12px;font-weight:500}
    .mini-toggle{position:relative;flex:0 0 auto;appearance:none;width:32px!important;height:18px!important;min-height:18px!important;margin:0;padding:0;border:0;border-radius:99px;background:#cbd1cd;cursor:pointer;transition:.18s}
    .mini-toggle:after{content:"";position:absolute;left:2px;top:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:.18s}
    .mini-toggle:checked{background:#087a50}
    .mini-toggle:checked:after{transform:translateX(14px)}
    .inline-edit{display:flex;align-items:center;gap:8px}
    .inline-edit input{padding:8px 10px;border:1px solid #d9deda;border-radius:7px;font-size:13px;min-width:0;flex:1}
    .inline-edit input:focus{outline:none;border-color:#087a50}
    .inline-edit button{white-space:nowrap}
    .field-error{margin:0;color:#a54238;font-size:11px;font-weight:700}
    .settings-flash{margin:14px 26px 0;padding:10px 13px;border-radius:9px;background:#e4f2e9;color:#087a50;font-size:12px;font-weight:800}
    .password-form{display:flex;flex-direction:column;gap:8px;padding:15px 26px;border-bottom:1px solid #eceeeb}
    .password-form input{padding:9px 11px;border:1px solid #d9deda;border-radius:7px;font-size:13px}
    .password-form input:focus{outline:none;border-color:#087a50}
    .password-actions{display:flex;gap:8px;margin-top:2px}
    .password-actions button{border:1px solid #d9deda;border-radius:7px;background:#fff;color:#314239;padding:8px 13px;font-size:12px;font-weight:900;cursor:pointer}
    .password-actions button:hover{border-color:#97b9a9;color:#087a50}
    .password-actions button[type="submit"]{border-color:#087a50;background:#087a50;color:#fff}
    .password-actions button[type="submit"]:hover{color:#fff}
    .danger-confirm{display:flex;flex-direction:column;gap:10px;margin-top:18px;padding:18px 26px;background:#fffafa;border-radius:0 0 14px 14px}
    .danger-confirm p{margin:0;color:#8c7a77;font-size:12px}
    .danger-confirm .password-actions button:first-child{border-color:#e3c5c1;background:#fff;color:#a54238}
  `],
  template: `
    <app-student-workspace-rail />
    <main class="professional-settings">
      <header class="settings-page-header">
        <div><span>SETTINGS</span><h1>Account settings</h1><p>Manage your account and preferences.</p></div>
      </header>

      <div class="settings-shell">
        <nav class="settings-menu" aria-label="Settings sections">
          <button *ngFor="let item of sections" type="button" [class.active]="activeSection===item.id" (click)="activeSection=item.id">
            <span>{{item.icon}}</span>
            <div><strong>{{item.label}}</strong><small>{{item.description}}</small></div>
            <b>›</b>
          </button>
        </nav>

        <section class="settings-panel" *ngIf="activeSection==='account'">
          <header><h2>Account</h2><p>Your sign-in details and account access.</p></header>
          <p class="settings-flash" *ngIf="flashMessage">{{flashMessage}}</p>

          <div class="professional-setting-row" *ngIf="!editingEmail">
            <div><strong>Email address</strong><small>{{store.values['email'] || 'Not set'}}</small></div>
            <button type="button" (click)="startEditEmail()">Edit</button>
          </div>
          <div class="professional-setting-row" *ngIf="editingEmail">
            <div style="flex:1">
              <strong>Email address</strong>
              <div class="inline-edit" style="margin-top:6px">
                <input type="email" [(ngModel)]="emailDraft" placeholder="you@example.com" autocomplete="email">
                <button type="button" (click)="saveEmail()">Save</button>
                <button type="button" (click)="editingEmail=false">Cancel</button>
              </div>
              <p class="field-error" *ngIf="emailError">{{emailError}}</p>
            </div>
          </div>

          <div class="professional-setting-row" *ngIf="!editingPassword">
            <div><strong>Password</strong><small>{{passwordChangedLabel}}</small></div>
            <button type="button" (click)="editingPassword=true">Change password</button>
          </div>
          <form class="password-form" *ngIf="editingPassword" (ngSubmit)="savePassword()">
            <input type="password" [(ngModel)]="passwordForm.current" name="currentPassword" placeholder="Current password" autocomplete="current-password">
            <input type="password" [(ngModel)]="passwordForm.next" name="newPassword" placeholder="New password (min. 8 characters)" autocomplete="new-password">
            <input type="password" [(ngModel)]="passwordForm.confirm" name="confirmPassword" placeholder="Confirm new password" autocomplete="new-password">
            <p class="field-error" *ngIf="passwordError">{{passwordError}}</p>
            <div class="password-actions">
              <button type="submit">Update password</button>
              <button type="button" (click)="cancelPassword()">Cancel</button>
            </div>
          </form>

          <div class="professional-setting-row" *ngIf="!editingName">
            <div><strong>Full name</strong><small>{{store.values['fullName'] || 'Not set'}}</small></div>
            <button type="button" (click)="startEditName()">Edit profile</button>
          </div>
          <div class="professional-setting-row" *ngIf="editingName">
            <div style="flex:1">
              <strong>Full name</strong>
              <div class="inline-edit" style="margin-top:6px">
                <input type="text" [(ngModel)]="nameDraft" placeholder="Your full name" autocomplete="name">
                <button type="button" (click)="saveName()">Save</button>
                <button type="button" (click)="editingName=false">Cancel</button>
              </div>
              <p class="field-error" *ngIf="nameError">{{nameError}}</p>
            </div>
          </div>

          <div class="settings-danger-row" *ngIf="!confirmingDelete">
            <div><strong>Delete account</strong><small>Permanently delete your account and student profile.</small></div>
            <button type="button" (click)="confirmingDelete=true">Delete account</button>
          </div>
          <div class="danger-confirm" *ngIf="confirmingDelete">
            <p><strong>This can't be undone.</strong> Your profile, submitted applications, and offers will be permanently deleted.</p>
            <div class="password-actions">
              <button type="button" (click)="deleteAccount()">Yes, delete my account</button>
              <button type="button" (click)="confirmingDelete=false">Cancel</button>
            </div>
          </div>
        </section>

        <section class="settings-panel" *ngIf="activeSection==='preferences'">
          <header><h2>Notifications & Privacy</h2><p>Choose what you hear about and who can find your profile.</p></header>
          <label class="toggle-row">
            <div><strong>University offers</strong><small>Admission and scholarship opportunities</small></div>
            <input class="mini-toggle" type="checkbox" [ngModel]="universityUpdates" (ngModelChange)="setPreference('notifyUniversity', $event)">
          </label>
          <label class="toggle-row">
            <div><strong>Funding offers</strong><small>Education loan and finance opportunities</small></div>
            <input class="mini-toggle" type="checkbox" [ngModel]="loanUpdates" (ngModelChange)="setPreference('notifyLoan', $event)">
          </label>
          <label class="toggle-row">
            <div><strong>Messages</strong><small>Replies from universities and finance advisers</small></div>
            <input class="mini-toggle" type="checkbox" [ngModel]="messageUpdates" (ngModelChange)="setPreference('notifyMessages', $event)">
          </label>
          <label class="toggle-row">
            <div><strong>Profile discovery</strong><small>Allow verified universities and funding providers to discover your profile.</small></div>
            <input class="mini-toggle" type="checkbox" [ngModel]="discoverable" (ngModelChange)="setDiscoverable($event)">
          </label>
          <p class="settings-flash" *ngIf="discoveryFlash">{{discoveryFlash}}</p>
          <div class="settings-note"><span>i</span><p>Your contact details are never displayed publicly. Only authorised partners can access information permitted by your visibility settings.</p></div>
        </section>

        <section class="settings-panel" *ngIf="activeSection==='help'">
          <header><h2>Help & support</h2><p>Find answers or contact the SuperOffer team.</p></header>
          <a class="support-setting-row" href="mailto:support@superoffer.net"><span>✉</span><div><strong>Email support</strong><small>support@superoffer.net</small></div><b>›</b></a>
          <button class="support-setting-row" type="button" (click)="openChat()"><span>◌</span><div><strong>Chat with us</strong><small>Start a conversation with support</small></div><b>›</b></button>
          <details *ngFor="let item of faqs"><summary>{{item.question}}<b>＋</b></summary><p>{{item.answer}}</p></details>
        </section>
      </div>
    </main>
    <app-student-support-chat />
  `
})
export class StudentSettingsComponent {
  activeSection = 'account';

  editingEmail = false;
  emailDraft = '';
  emailError = '';

  editingName = false;
  nameDraft = '';
  nameError = '';

  editingPassword = false;
  passwordForm = { current: '', next: '', confirm: '' };
  passwordError = '';

  confirmingDelete = false;
  flashMessage = '';
  discoveryFlash = '';

  sections = [
    {id:'account',label:'Account',description:'Email and password',icon:'○'},
    {id:'preferences',label:'Notifications & Privacy',description:'Offers, messages and visibility',icon:'◉'},
    {id:'help',label:'Help & support',description:'FAQs and contact',icon:'?'}
  ];
  faqs = [
    {question:'How do I update my student profile?',answer:'Open your profile from the navigation rail and choose the section you want to update.'},
    {question:'Where can I upload missing documents?',answer:'Open Documents from your dashboard action list or student profile.'},
    {question:'Who can see my profile?',answer:'Only authorised universities and funding providers permitted by your discovery settings.'}
  ];

  constructor(
    public store: StudentProfileUiStore,
    private submittedStudentsStore: SubmittedStudentsStore,
    private router: Router
  ) {}

  private flag(key: string, defaultValue = true): boolean {
    const raw = this.store.values[key];
    return raw === undefined ? defaultValue : raw === 'true';
  }

  get universityUpdates() { return this.flag('notifyUniversity'); }
  get loanUpdates() { return this.flag('notifyLoan'); }
  get messageUpdates() { return this.flag('notifyMessages'); }
  get discoverable() { return this.flag('discoverable'); }

  get passwordChangedLabel(): string {
    const changedAt = this.store.values['passwordChangedAt'];
    return changedAt ? `Last changed ${new Date(changedAt).toLocaleDateString()}` : 'Never changed';
  }

  private flash(message: string) {
    this.flashMessage = message;
    setTimeout(() => { this.flashMessage = ''; }, 3000);
  }

  setPreference(key: string, value: boolean) {
    this.store.values[key] = String(value);
  }

  setDiscoverable(value: boolean) {
    this.store.values['discoverable'] = String(value);
    if (this.store.values['profileStatus'] !== 'SUBMITTED') return;
    if (value) {
      this.submittedStudentsStore.upsert(mapProfileToOrgStudent(this.store.values, this.store.photo));
      this.discoveryFlash = 'Your profile is visible to universities and lenders again.';
    } else {
      this.submittedStudentsStore.remove(this.store.values['email'] || this.store.values['fullName'] || '');
      this.discoveryFlash = 'Your profile is hidden from university and lender discovery.';
    }
    setTimeout(() => { this.discoveryFlash = ''; }, 3500);
  }

  startEditEmail() {
    this.emailDraft = this.store.values['email'] || '';
    this.emailError = '';
    this.editingEmail = true;
  }

  saveEmail() {
    const value = this.emailDraft.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      this.emailError = 'Enter a valid email address';
      return;
    }
    this.store.values['email'] = value;
    this.editingEmail = false;
    this.flash('Email address updated.');
  }

  startEditName() {
    this.nameDraft = this.store.values['fullName'] || '';
    this.nameError = '';
    this.editingName = true;
  }

  saveName() {
    const value = this.nameDraft.trim();
    if (value.length < 2) {
      this.nameError = 'Enter your full name';
      return;
    }
    this.store.values['fullName'] = value;
    this.editingName = false;
    this.flash('Full name updated.');
  }

  cancelPassword() {
    this.editingPassword = false;
    this.passwordForm = { current: '', next: '', confirm: '' };
    this.passwordError = '';
  }

  savePassword() {
    const { current, next, confirm } = this.passwordForm;
    if (!current.trim()) { this.passwordError = 'Enter your current password'; return; }
    if (next.length < 8) { this.passwordError = 'New password must be at least 8 characters'; return; }
    if (next !== confirm) { this.passwordError = 'New password and confirmation do not match'; return; }
    this.store.values['passwordChangedAt'] = new Date().toISOString();
    this.cancelPassword();
    this.flash('Password updated.');
  }

  deleteAccount() {
    const id = this.store.values['email'] || this.store.values['fullName'] || '';
    if (id) this.submittedStudentsStore.remove(id);
    Object.keys(this.store.values).forEach(key => delete this.store.values[key]);
    this.store.photo = '';
    localStorage.removeItem('superoffer_furthest_step');
    this.confirmingDelete = false;
    this.router.navigateByUrl('/');
  }

  openChat(){window.dispatchEvent(new CustomEvent('open-student-support-chat'));}
}
