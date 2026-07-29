import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StudentWorkspaceRailComponent],
  styleUrl: './student-workspace-pages.css',
  template: `
    <app-student-workspace-rail />
    <main class="workspace-page">
      <header><div><small>STUDENT WORKSPACE</small><h1>Settings</h1><p>Manage how your profile and workspace behave.</p></div></header>
      <section class="settings-layout">
        <article>
          <div><span>ACCOUNT</span><h2>Profile and account</h2><p>Review your personal details and complete missing documents.</p></div>
          <a routerLink="/student/profile">View complete profile →</a>
        </article>
        <article>
          <div><span>NOTIFICATIONS</span><h2>Offer updates</h2><p>Choose the updates you would like to receive.</p></div>
          <label><span><strong>New university offers</strong><small>Notify me when a university sends an offer.</small></span><input type="checkbox" [(ngModel)]="universityUpdates"></label>
          <label><span><strong>Loan and funding offers</strong><small>Notify me about relevant education finance.</small></span><input type="checkbox" [(ngModel)]="loanUpdates"></label>
          <label><span><strong>Messages</strong><small>Notify me when an adviser replies.</small></span><input type="checkbox" [(ngModel)]="messageUpdates"></label>
        </article>
        <article>
          <div><span>PRIVACY</span><h2>Profile visibility</h2><p>Control whether verified opportunity providers can discover your profile.</p></div>
          <label><span><strong>Profile discovery</strong><small>Allow matched universities and providers to find me.</small></span><input type="checkbox" [(ngModel)]="discoverable"></label>
        </article>
      </section>
    </main>
  `
})
export class StudentSettingsComponent {
  universityUpdates = true;
  loanUpdates = true;
  messageUpdates = true;
  discoverable = true;
}
