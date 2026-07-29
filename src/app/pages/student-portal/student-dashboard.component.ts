import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-page">
      <div class="student-summary">
        <div class="student-avatar" aria-label="Profile photo placeholder">ST</div>
        <div>
          <span>STUDENT PROFILE</span>
          <h1>Student Name</h1>
          <p>Student ID: SO-STUDENT-0001</p>
        </div>
        <strong>Profile Complete</strong>
      </div>

      <div class="welcome-card">
        <span aria-hidden="true">✓</span>
        <div><h2>Welcome to SuperOffer</h2><p>Your profile has been created successfully.</p></div>
      </div>

      <div class="dashboard-cards">
        <article *ngFor="let card of cards">
          <span aria-hidden="true">{{card.icon}}</span>
          <h2>{{card.title}}</h2>
          <p>Coming Soon</p>
        </article>
      </div>
    </section>
  `
})
export class StudentDashboardComponent {
  cards = [
    { title: 'University Offers', icon: 'U' },
    { title: 'Loan Offers', icon: 'L' },
    { title: 'Consultancy Offers', icon: 'C' },
    { title: 'Notifications', icon: 'N' }
  ];
}
