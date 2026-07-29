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
      <span class="workspace-logo" aria-label="SuperOffer">S</span>
      <div class="workspace-links">
        <a routerLink="/student/dashboard" routerLinkActive="active" title="Dashboard" aria-label="Dashboard"><span>▦</span><small>Dashboard</small></a>
        <a routerLink="/student/offers" routerLinkActive="active" title="Offers" aria-label="Offers"><span>◇</span><small>Offers</small></a>
        <a routerLink="/student/settings" routerLinkActive="active" title="Settings" aria-label="Settings"><span>⚙</span><small>Settings</small></a>
        <a routerLink="/student/help" routerLinkActive="active" title="Help and support" aria-label="Help and support"><span>?</span><small>Help</small></a>
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
    .workspace-logo{width:40px;height:40px;display:grid;place-items:center;border-radius:12px;background:#102f45;color:#67d0b2;text-decoration:none;font-size:18px;font-weight:900}
    .workspace-links{width:100%;display:grid;gap:8px;margin-top:28px;padding:0 8px;box-sizing:border-box}
    .workspace-links a{min-height:48px;display:grid;place-items:center;border-radius:11px;color:#6a7770;text-decoration:none;transition:.18s}
    .workspace-links a:hover{background:#edf2ef;color:#087a50}.workspace-links a.active{background:#e4f2e9;color:#087a50}
    .workspace-links span{font-size:19px;line-height:1}.workspace-links small{display:none;font-size:9px;font-weight:800}
    .workspace-avatar{width:40px;height:40px;display:grid;place-items:center;overflow:hidden;margin-top:auto;border:2px solid #cbded5;border-radius:50%;background:#e7f4ed;color:#087a50;text-decoration:none;font-size:11px;font-weight:900}
    .workspace-avatar img{width:100%;height:100%;object-fit:cover}
    @media(min-width:1700px){.workspace-rail{width:76px}.workspace-links small{display:block}.workspace-links a{min-height:58px;gap:3px}.workspace-links span{font-size:20px}}
    @media(max-width:720px){.workspace-rail{position:relative;width:100%;height:60px;flex-direction:row;padding:0 12px;border-right:0;border-bottom:1px solid #d7e0dc}.workspace-links{width:auto;display:flex;gap:5px;margin:0 0 0 14px;padding:0}.workspace-links a{width:43px;min-height:42px}.workspace-avatar{margin-top:0;margin-left:auto}}
  `]
})
export class StudentWorkspaceRailComponent {
  constructor(public store: StudentProfileUiStore) {}
  get initials() {
    return (this.store.values['fullName'] || 'Student').split(/\s+/).map(value => value[0]).join('').slice(0, 2).toUpperCase();
  }
}
