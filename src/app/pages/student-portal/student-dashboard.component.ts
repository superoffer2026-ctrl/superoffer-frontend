import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';
import { StudentProfileUiStore } from './student-profile-ui.store';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, StudentWorkspaceRailComponent],
  styleUrl: './student-workspace-pages.css',
  template: `
    <app-student-workspace-rail />
    <section class="dashboard-page">
      <header class="dashboard-welcome">
        <div><span>STUDENT DASHBOARD</span><h1>Welcome back, {{firstName}}</h1><p>Your next study-abroad opportunity is taking shape.</p></div>
        <a routerLink="/student/profile">View profile →</a>
      </header>

      <div class="dashboard-overview">
        <article class="momentum-card">
          <div class="momentum-copy"><span>PROFILE MOMENTUM</span><h2>Complete your profile to get discovered.</h2><p>Add your academic details, study preferences, and documents to receive relevant university and funding offers.</p></div>
          <div class="progress-ring"><strong>82%</strong><small>complete</small></div>
          <a routerLink="/student/personal-information">Complete your profile →</a>
        </article>
        <article class="offer-snapshot">
          <span>NEW THIS WEEK</span><strong>4</strong><h2>Matched opportunities</h2><p>Two university offers and two education finance options are waiting.</p>
          <a routerLink="/student/offers">Open my offers →</a>
        </article>
      </div>

      <div class="dashboard-main-grid">
        <section class="dashboard-section next-actions">
          <header><div><span>NEXT ACTIONS</span><h2>Keep moving forward</h2></div><small>3 tasks</small></header>
          <label *ngFor="let task of tasks">
            <input type="checkbox">
            <span><strong>{{task.title}}</strong><small>{{task.description}}</small></span>
            <b>{{task.time}}</b>
          </label>
        </section>

        <section class="dashboard-section recommended">
          <header><div><span>RECOMMENDED FOR YOU</span><h2>Opportunity spotlight</h2></div></header>
          <div class="recommended-offer"><span>UNIVERSITY OFFER</span><h3>Northbridge University</h3><p>MSc Data Science</p><strong>40% Global Excellence Scholarship</strong></div>
          <a routerLink="/student/offers">Review opportunity →</a>
        </section>
      </div>

      <section class="quick-actions">
        <a *ngFor="let action of actions" [routerLink]="action.route"><span>{{action.icon}}</span><div><strong>{{action.title}}</strong><small>{{action.description}}</small></div><b>→</b></a>
      </section>
    </section>
  `
})
export class StudentDashboardComponent {
  tasks = [
    {title:'Upload your academic transcript',description:'Strengthen your university offer profile.',time:'5 min'},
    {title:'Review your study preferences',description:'Confirm destinations and preferred intake.',time:'3 min'},
    {title:'Respond to Northbridge University',description:'Scholarship response due 15 August.',time:'Soon'}
  ];
  actions = [
    {title:'Explore offers',description:'Compare all matched opportunities',icon:'◇',route:'/student/offers'},
    {title:'Update profile',description:'Keep academics and interests current',icon:'○',route:'/student/profile'},
    {title:'Manage documents',description:'Upload missing supporting files',icon:'▤',route:'/student/documents'}
  ];
  constructor(public store:StudentProfileUiStore){}
  get firstName(){return (this.store.values['fullName']||'Student').split(/\s+/)[0];}
}
