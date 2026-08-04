import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './complete-profile.css',
  template: `
    <section class="step-page">
      <div class="success-head">
        <div class="check-badge" aria-hidden="true">✓</div>
        <h1>Profile Submitted Successfully!</h1>
        <p class="lead">Your SuperOffer profile is now complete. Partner universities, banks and consultants can now discover it and start matching you with offers.</p>
      </div>

      <div class="dashboard-preview">
        <div class="preview-chrome">
          <span class="chrome-dot"></span><span class="chrome-dot"></span><span class="chrome-dot"></span>
          <span class="chrome-title">Your Dashboard — Preview</span>
        </div>
        <div class="preview-body">
          <div class="preview-heading">
            <h3>Matched Offers</h3>
            <span class="preview-badge">Coming soon</span>
          </div>
          <div class="preview-row" *ngFor="let sample of sampleOffers">
            <div class="preview-avatar">🎓</div>
            <div class="preview-info"><b>{{sample.name}}</b><span>{{sample.detail}}</span></div>
            <span class="preview-match">{{sample.match}} match</span>
          </div>
          <div class="preview-overlay">
            <span>Your real matches will appear here once universities review your profile</span>
          </div>
        </div>
      </div>

      <div class="next-chips">
        <span class="next-chip"><b>🔍</b>Review</span>
        <span class="next-chip"><b>🎯</b>Match</span>
        <span class="next-chip"><b>🔔</b>Notify</span>
        <span class="next-chip"><b>✏️</b>Update</span>
      </div>

      <div class="success-actions">
        <a class="button primary" routerLink="/student/dashboard">Go to Dashboard</a>
        <a class="button secondary" routerLink="/student/profile">View My Profile</a>
      </div>
    </section>
  `
})
export class CompleteProfileComponent {
  sampleOffers = [
    { name: 'University A', detail: "Master's • Country", match: '92%' },
    { name: 'University B', detail: "Master's • Country", match: '88%' },
    { name: 'University C', detail: "Master's • Country", match: '81%' }
  ];
}
