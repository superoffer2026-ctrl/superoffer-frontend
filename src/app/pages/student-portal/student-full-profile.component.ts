import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, StudentWorkspaceRailComponent],
  styleUrl: './student-full-profile.css',
  template: `
    <app-student-workspace-rail />
    <main class="full-profile-page">
      <header class="profile-top">
        <a routerLink="/student/offers">← Back to offers</a>
        <button type="button" (click)="logout()">Logout</button>
      </header>

      <section class="profile-hero">
        <div class="large-avatar">
          <img *ngIf="store.photo" [src]="store.photo" alt="Student profile photo">
          <span *ngIf="!store.photo">{{initials}}</span>
        </div>
        <div><small>STUDENT PROFILE</small><h1>{{store.values['fullName'] || 'Student Name'}}</h1><p>{{store.values['qualification'] || 'Qualification'}} · {{store.values['location'] || 'Location'}}</p></div>
        <span class="completion-badge">Profile preview</span>
      </section>

      <div class="profile-layout">
        <section class="profile-sections">
          <article *ngFor="let section of sections">
            <div><small>{{section.eyebrow}}</small><h2>{{section.title}}</h2></div>
            <dl><ng-container *ngFor="let item of section.items"><dt>{{item.label}}</dt><dd>{{value(item.key,item.fallback)}}</dd></ng-container></dl>
            <a [routerLink]="section.route">Edit section</a>
          </article>
        </section>

        <aside class="documents-panel">
          <span>DOCUMENT CHECKLIST</span><h2>Complete your documents</h2><p>Add any missing files while reviewing your profile.</p>
          <label *ngFor="let doc of documents" [class.complete]="store.values[doc.key]">
            <div><strong>{{doc.label}}</strong><small>{{store.values[doc.key] || 'Not uploaded'}}</small></div>
            <b>{{store.values[doc.key]?'✓':'＋'}}</b>
            <input type="file" (change)="chooseFile(doc.key,$event)">
          </label>
          <a routerLink="/student/documents">Open documents step</a>
        </aside>
      </div>
    </main>
  `
})
export class StudentFullProfileComponent {
  sections = [
    { eyebrow:'PERSONAL',title:'Personal information',route:'/student/personal-information',items:[{label:'Email',key:'email',fallback:'aarav@example.com'},{label:'Phone',key:'phone',fallback:'+91 98765 43210'},{label:'Location',key:'location',fallback:'Bengaluru, India'}]},
    { eyebrow:'ACADEMIC',title:'Academic information',route:'/student/academic-information',items:[{label:'Institution',key:'institution',fallback:'Current institution'},{label:'Qualification',key:'qualification',fallback:'B.Tech Computer Science'},{label:'Academic score',key:'score',fallback:'8.7 / 10'}]},
    { eyebrow:'PREFERENCES',title:'Study preferences',route:'/student/study-preferences',items:[{label:'Field',key:'fieldOfInterest',fallback:'Data Science'},{label:'Countries',key:'countries',fallback:'Canada, United Kingdom'},{label:'Intake',key:'intake',fallback:'Fall 2027'}]},
    { eyebrow:'FINANCIAL',title:'Financial information',route:'/student/financial-information',items:[{label:'Family income',key:'annualFamilyIncome',fallback:'₹18,00,000 annually'},{label:'Education budget',key:'educationBudget',fallback:'₹35,00,000'},{label:'Savings',key:'savings',fallback:'₹12,00,000'}]},
    { eyebrow:'PROFILE',title:'Skills and achievements',route:'/student/skills',items:[{label:'Skills',key:'technicalSkills',fallback:'Python, SQL, Machine Learning'},{label:'Languages',key:'languages',fallback:'English, Hindi'},{label:'Featured project',key:'projectTitle',fallback:'Student success prediction model'}]}
  ];
  documents=[{key:'transcript',label:'Academic transcript'},{key:'resume',label:'CV / résumé'},{key:'passport',label:'Passport copy'},{key:'testReport',label:'Test score report'}];
  constructor(public store:StudentProfileUiStore,private router:Router){}
  get initials(){return (this.store.values['fullName']||'Student').split(' ').map(value=>value[0]).join('').slice(0,2).toUpperCase();}
  value(key:string,fallback:string){return this.store.values[key]||fallback;}
  chooseFile(key:string,event:Event){this.store.setFile(key,(event.target as HTMLInputElement).files?.[0]);}
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');this.router.navigate(['/']);}
}
