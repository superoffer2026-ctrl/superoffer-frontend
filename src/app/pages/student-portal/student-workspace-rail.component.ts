import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';

@Component({
  selector: 'app-student-workspace-rail',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="workspace-rail" aria-label="Student workspace navigation">
      <img class="workspace-logo" src="/superoffer-brand-mark.png" alt="SuperOffer">
      <div class="workspace-links">
        <a routerLink="/student/dashboard" routerLinkActive="active" title="Dashboard" aria-label="Dashboard">
          <span><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg></span>
          <small>Dashboard</small>
        </a>
        <a routerLink="/student/offers" routerLinkActive="active" title="Offers" aria-label="Offers">
          <span><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></span>
          <small>Offers</small>
        </a>
        <a routerLink="/student/profile" routerLinkActive="active" title="Profile" aria-label="Profile">
          <span><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
          <small>Profile</small>
        </a>
        <a routerLink="/student/settings" routerLinkActive="active" title="Settings" aria-label="Settings">
          <span><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
          <small>Settings</small>
        </a>
      </div>
      <a class="workspace-avatar" routerLink="/student/profile" aria-label="Open complete student profile">
        <img *ngIf="store.photo" [src]="store.photo" alt="">
        <span *ngIf="!store.photo">{{initials}}</span>
      </a>
    </nav>
  `,
  styles: [`
    :host{display:contents}
    .workspace-rail{position:fixed;inset:0 auto 0 0;z-index:30;width:68px;display:flex;flex-direction:column;align-items:center;padding:16px 0;background:#f8faf9;border-right:1px solid #d7e0dc;box-sizing:border-box}
    .workspace-logo{width:40px;height:40px;border-radius:12px;object-fit:cover}
    .workspace-links{width:100%;display:grid;gap:8px;margin-top:28px;padding:0 8px;box-sizing:border-box}
    .workspace-links a{min-height:48px;display:grid;place-items:center;border-radius:11px;color:#6a7770;text-decoration:none;transition:.18s}
    .workspace-links a:hover{background:#edf2ef;color:#087a50}.workspace-links a.active{background:#e4f2e9;color:#087a50}
    .workspace-links span{font-size:21px;line-height:1}.workspace-links small{display:none;font-size:11px;font-weight:800}
    .workspace-avatar{width:40px;height:40px;display:grid;place-items:center;overflow:hidden;margin-top:auto;border:2px solid #cbded5;border-radius:50%;background:#e7f4ed;color:#087a50;text-decoration:none;font-size:13px;font-weight:900}
    .workspace-avatar img{width:100%;height:100%;object-fit:cover}
    @media(min-width:1700px){.workspace-rail{width:76px}.workspace-links small{display:block}.workspace-links a{min-height:58px;gap:3px}.workspace-links span{font-size:22px}}
    @media(max-width:720px){.workspace-rail{position:relative;width:100%;height:60px;flex-direction:row;padding:0 12px;border-right:0;border-bottom:1px solid #d7e0dc}.workspace-links{width:auto;display:flex;gap:5px;margin:0 0 0 14px;padding:0}.workspace-links a{width:43px;min-height:42px}.workspace-avatar{margin-top:0;margin-left:auto}}
  `]
})
export class StudentWorkspaceRailComponent {
  constructor(public store: StudentProfileUiStore) {}
  get initials() {
    return (this.store.values['fullName'] || 'Student').split(/\s+/).map(value => value[0]).join('').slice(0, 2).toUpperCase();
  }
}
