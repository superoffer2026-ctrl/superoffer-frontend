import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div><a class="brand light-brand" routerLink="/"><span>S</span>SuperOffer</a>
        <p>One verified marketplace for education opportunities, funding, and guidance.</p></div>
      <div><b>Portals</b><a routerLink="/student">Student</a><a routerLink="/university">University</a><a routerLink="/bank">Bank</a></div>
      <div><b>Platform</b><a routerLink="/consultancy">Consultancy</a><a href="#faq">FAQs</a><a href="mailto:support@superoffer.net">Support</a></div>
      <small>© 2026 SuperOffer. Secure by design.</small>
    </footer>
  `
})
export class SiteFooterComponent {}
