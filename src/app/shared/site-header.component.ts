import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/"><span>S</span>SuperOffer</a>
      <button class="menu-toggle" (click)="open = !open" [attr.aria-expanded]="open">Menu</button>
      <nav [class.open]="open" aria-label="Primary navigation">
        <a routerLink="/student" routerLinkActive="active">Student</a>
        <a routerLink="/university" routerLinkActive="active">University</a>
        <a routerLink="/bank" routerLinkActive="active">Bank</a>
        <a routerLink="/consultancy" routerLinkActive="active">Consultancy</a>
      </nav>
      <div class="header-actions">
        <a class="button ghost" [routerLink]="['/auth/login', context]">Log in</a>
        <a class="button dark" [routerLink]="['/auth/register', context]">Sign up</a>
      </div>
    </header>
  `
})
export class SiteHeaderComponent {
  @Input() context: 'student' | 'university' | 'bank' | 'consultancy' = 'student';
  open = false;
}
