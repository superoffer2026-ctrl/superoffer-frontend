import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';
import { StudentSupportChatComponent } from './student-support-chat.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, StudentWorkspaceRailComponent, StudentSupportChatComponent],
  styleUrl: './student-workspace-pages.css',
  template: `
    <app-student-workspace-rail />
    <main class="workspace-page">
      <header><div><small>STUDENT WORKSPACE</small><h1>Settings</h1><p>Manage your account, notifications, privacy, and security.</p></div></header>
      <section class="settings-layout">
        <article>
          <div><span>ACCOUNT SETTINGS</span><h2>Account information</h2><p>Update the details used to access your SuperOffer account.</p></div>
          <div class="settings-row"><span><strong>Email address</strong><small>{{store.values['email'] || 'aarav@example.com'}}</small></span><button type="button">Edit</button></div>
          <div class="settings-row"><span><strong>Password</strong><small>Last changed recently</small></span><button type="button">Change password</button></div>
        </article>
        <article>
          <div><span>NOTIFICATIONS</span><h2>Choose your updates</h2><p>Control which student opportunity updates you receive.</p></div>
          <label><span><strong>University offers</strong><small>New admissions and scholarship opportunities</small></span><input type="checkbox" [(ngModel)]="universityUpdates"></label>
          <label><span><strong>Loan and funding offers</strong><small>Relevant education finance opportunities</small></span><input type="checkbox" [(ngModel)]="loanUpdates"></label>
          <label><span><strong>Messages</strong><small>Replies from university and finance advisers</small></span><input type="checkbox" [(ngModel)]="messageUpdates"></label>
        </article>
        <article>
          <div><span>PRIVACY</span><h2>Profile visibility</h2><p>Decide whether verified opportunity providers can discover your profile.</p></div>
          <label><span><strong>Allow profile discovery</strong><small>Show my profile to matched, authorised providers</small></span><input type="checkbox" [(ngModel)]="discoverable"></label>
        </article>
        <article class="delete-account-card">
          <div><span>DANGER ZONE</span><h2>Delete account</h2><p>Permanently remove your student account, profile, and saved information.</p></div>
          <button type="button">Delete my account</button>
        </article>
      </section>
    </main>
    <app-student-support-chat />
  `
})
export class StudentSettingsComponent {
  universityUpdates = true;
  loanUpdates = true;
  messageUpdates = true;
  discoverable = true;
  constructor(public store: StudentProfileUiStore) {}
}
