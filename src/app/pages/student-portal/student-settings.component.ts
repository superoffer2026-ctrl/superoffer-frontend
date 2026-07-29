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
          <div class="professional-setting-row">
            <div><strong>Email address</strong><small>{{store.values['email'] || 'aarav@example.com'}}</small></div>
            <button type="button">Edit</button>
          </div>
          <div class="professional-setting-row">
            <div><strong>Password</strong><small>Last changed recently</small></div>
            <button type="button">Change password</button>
          </div>
          <div class="professional-setting-row">
            <div><strong>Full name</strong><small>{{store.values['fullName'] || 'Aarav Mehta'}}</small></div>
            <button type="button">Edit profile</button>
          </div>
          <div class="settings-danger-row">
            <div><strong>Delete account</strong><small>Permanently delete your account and student profile.</small></div>
            <button type="button">Delete account</button>
          </div>
        </section>

        <section class="settings-panel" *ngIf="activeSection==='notifications'">
          <header><h2>Notifications</h2><p>Choose which updates you want to receive.</p></header>
          <label class="professional-setting-row">
            <div><strong>University offers</strong><small>Admission and scholarship opportunities</small></div>
            <input class="settings-toggle" type="checkbox" [(ngModel)]="universityUpdates">
          </label>
          <label class="professional-setting-row">
            <div><strong>Funding offers</strong><small>Education loan and finance opportunities</small></div>
            <input class="settings-toggle" type="checkbox" [(ngModel)]="loanUpdates">
          </label>
          <label class="professional-setting-row">
            <div><strong>Messages</strong><small>Replies from universities and finance advisers</small></div>
            <input class="settings-toggle" type="checkbox" [(ngModel)]="messageUpdates">
          </label>
        </section>

        <section class="settings-panel" *ngIf="activeSection==='privacy'">
          <header><h2>Privacy</h2><p>Control how your profile is used for opportunity matching.</p></header>
          <label class="professional-setting-row">
            <div><strong>Profile discovery</strong><small>Allow verified universities and funding providers to discover your profile.</small></div>
            <input class="settings-toggle" type="checkbox" [(ngModel)]="discoverable">
          </label>
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
  universityUpdates = true;
  loanUpdates = true;
  messageUpdates = true;
  discoverable = true;
  sections = [
    {id:'account',label:'Account',description:'Email and password',icon:'○'},
    {id:'notifications',label:'Notifications',description:'Offers and messages',icon:'◉'},
    {id:'privacy',label:'Privacy',description:'Profile visibility',icon:'◇'},
    {id:'help',label:'Help & support',description:'FAQs and contact',icon:'?'}
  ];
  faqs = [
    {question:'How do I update my student profile?',answer:'Open your profile from the navigation rail and choose the section you want to update.'},
    {question:'Where can I upload missing documents?',answer:'Open Documents from your dashboard action list or student profile.'},
    {question:'Who can see my profile?',answer:'Only authorised universities and funding providers permitted by your discovery settings.'}
  ];
  constructor(public store: StudentProfileUiStore) {}
  openChat(){window.dispatchEvent(new CustomEvent('open-student-support-chat'));}
}
