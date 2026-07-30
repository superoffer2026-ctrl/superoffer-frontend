import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [`
    :host{display:block;position:absolute;left:0;right:0;top:0;z-index:100;font-family:Inter,system-ui,sans-serif}
    .nav{height:90px;display:flex;align-items:center;gap:34px;padding:0 clamp(22px,4vw,82px);background:transparent}
    .brand{display:flex;align-items:center;color:#102f40;text-decoration:none}.brand img{width:48px;height:48px;border-radius:13px;object-fit:cover}
    .links{display:flex;align-items:center;gap:30px;margin:auto}.links a{position:relative;padding:31px 0;color:#40505a;text-decoration:none;font-size:13px;font-weight:750}.links a:after{content:"";position:absolute;left:0;right:0;bottom:22px;height:2px;background:#ec641b;transform:scaleX(0);transition:transform .25s}.links a:hover:after,.links a.active:after{transform:scaleX(1)}
    .actions{display:flex;align-items:center;gap:26px}.actions a{text-decoration:none;font-size:13px;font-weight:800}.login{color:#2d2722}.start{padding:13px 21px;border-radius:99px;color:#fff;background:#25201c}
    .menu{display:none;margin-left:auto;width:44px;height:44px;border:1px solid #d9d0c8;border-radius:12px;background:#fff}.menu span{display:block;width:18px;height:2px;margin:5px auto;background:#29201b}.drawer{display:none;position:fixed;top:76px;left:14px;right:14px;padding:14px;border:1px solid #ded2c7;border-radius:16px;background:#fffaf5;box-shadow:0 25px 60px #38271c24}.drawer.open{display:grid}.drawer a{padding:13px;border-radius:9px;color:#352a24;text-decoration:none;font-size:14px;font-weight:700}.drawer a.start{text-align:center;color:#fff}
    @media(max-width:980px){.links,.actions{display:none}.menu{display:block}.brand{font-size:21px}}
  `],
  template: `
    <nav class="nav" [class.scrolled]="scrolled" aria-label="Primary navigation">
      <a class="brand" routerLink="/" aria-label="SuperOffer home"><img src="/superoffer-brand-mark.png" alt="SuperOffer"></a>
      <div class="links"><a routerLink="/students" routerLinkActive="active">Student</a><a routerLink="/university" routerLinkActive="active">University</a><a routerLink="/bank" routerLinkActive="active">Loans & Banks</a><a routerLink="/consultancy" routerLinkActive="active">Consultancy</a></div>
      <div class="actions"><a class="login" [routerLink]="['/auth/login',context]">Log in</a><a class="start" [routerLink]="['/auth/register',context]">Sign up</a></div>
      <button class="menu" (click)="menuOpen=!menuOpen" [attr.aria-expanded]="menuOpen" aria-label="Toggle navigation"><span></span><span></span></button>
    </nav>
    <div class="drawer" [class.open]="menuOpen"><a routerLink="/students" (click)="menuOpen=false">Student</a><a routerLink="/university" (click)="menuOpen=false">University</a><a routerLink="/bank" (click)="menuOpen=false">Loans & Banks</a><a routerLink="/consultancy" (click)="menuOpen=false">Consultancy</a><a [routerLink]="['/auth/login',context]" (click)="menuOpen=false">Log in</a><a class="start" [routerLink]="['/auth/register',context]" (click)="menuOpen=false">Sign up</a></div>
  `
})
export class SiteHeaderComponent {
  @Input() context: 'student'|'university'|'bank'|'consultancy' = 'student';
  menuOpen = false;
  scrolled = false;
  @HostListener('window:scroll') onScroll(): void { this.scrolled = scrollY > 16; }
}
