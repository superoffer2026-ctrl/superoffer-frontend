import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentWorkspaceRailComponent } from './student-workspace-rail.component';
import { StudentProfileUiStore } from './student-profile-ui.store';
import { EMPLOYMENT_CATEGORY_OPTIONS, FINANCIAL_DOCUMENT_FIELDS, FinancialDocKey } from './financial-options';
import { SubmittedStudentsStore, mapProfileToOrgStudent } from '../../core/submitted-students.store';

@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink,StudentWorkspaceRailComponent],styleUrl:'./student-extra-page.component.css',template:`
<app-student-workspace-rail />
<main class="student-extra">
  <header><div><span>STUDENT WORKSPACE</span><h1>{{title}}</h1><p>{{description}}</p></div><a *ngIf="actionRoute" [routerLink]="actionRoute">{{actionLabel}}</a></header>
  <div class="search" *ngIf="page==='saved-universities'||page==='scholarships'"><label>⌕<input [(ngModel)]="query" placeholder="Search universities or programmes"></label><select [(ngModel)]="filter"><option>All destinations</option><option>Canada</option><option>United Kingdom</option></select></div>
  <section class="grid" *ngIf="page==='saved-universities'||page==='scholarships'">
    <article *ngFor="let item of filteredCards"><div class="logo">{{item.initial}}</div><span>{{item.tag}}</span><h2>{{item.title}}</h2><p>{{item.detail}}</p><div class="terms"><small>{{item.meta}}</small><strong>{{item.value}}</strong></div><footer><button (click)="saved=!saved">{{saved?'✓ Saved':'☆ Save'}}</button><a routerLink="/student/offers">View details →</a></footer></article>
  </section>
  <section class="loan-page" *ngIf="page==='loan-eligibility'">
    <div class="loan-gate" *ngIf="wantsLoan===null">
      <span>EDUCATION FINANCE</span>
      <h2>Do you need an education loan?</h2>
      <p>Tell us if you're planning to fund part of your education with a loan — we'll only ask for verification documents if you do.</p>
      <div class="loan-gate-actions">
        <button type="button" (click)="chooseWantsLoan(true)">Yes, I need a loan</button>
        <button type="button" class="ghost" (click)="chooseWantsLoan(false)">No, I'm self-funded</button>
      </div>
    </div>

    <div class="loan-declined" *ngIf="wantsLoan===false">
      <span>EDUCATION FINANCE</span>
      <h2>No problem</h2>
      <p>You can come back here anytime if your funding plans change.</p>
      <button type="button" (click)="chooseWantsLoan(true)">Actually, I do need a loan</button>
    </div>

    <ng-container *ngIf="wantsLoan===true">
      <section class="loan">
        <form #loanForm="ngForm" (ngSubmit)="checkEligibility(loanForm.valid)"><h2>Check your indicative eligibility</h2><p>Adjust the details below to preview matched funding.</p><div><label>Study destination<select name="destination" required [(ngModel)]="destination"><option>Canada</option><option>United Kingdom</option><option>United States</option></select></label><label>Course level<select name="level" required [(ngModel)]="level"><option>Postgraduate</option><option>Undergraduate</option></select></label><label>Estimated course cost (₹)<input name="cost" required type="number" min="100000" [(ngModel)]="cost"></label><label>Co-applicant monthly income (₹)<input name="income" required type="number" min="10000" [(ngModel)]="income"></label></div><button [disabled]="loanForm.invalid">Check eligibility</button></form>
        <aside *ngIf="checked"><span>INDICATIVE RESULT</span><b>✓</b><h2>You may be eligible</h2><strong>Up to ₹35 lakh</strong><p>Matched with 3 verified education finance partners.</p><a routerLink="/student/offers">View funding offers →</a><small>This is not a credit decision or guaranteed offer.</small></aside>
        <aside class="empty" *ngIf="!checked"><b>₹</b><h2>Your estimate will appear here</h2><p>Complete the form to see a mock eligibility result.</p></aside>
      </section>

      <section class="loan-documents">
        <header><span>VERIFICATION</span><h2>Upload your documents</h2><p>These help lenders confirm eligibility once you're ready to proceed — upload whenever you're ready.</p></header>
        <label class="doc-employment">Employment category<select [(ngModel)]="employmentCategory"><option value="" disabled>Select employment category</option><option *ngFor="let opt of employmentOptions" [value]="opt">{{opt}}</option></select></label>
        <p class="section-subtitle" *ngIf="!employmentCategory">Select an employment category to see the documents you need.</p>
        <div class="doc-list" *ngIf="employmentCategory">
          <div class="doc-row" *ngFor="let doc of visibleDocuments()">
            <span class="doc-row-label">{{doc.label}}</span>
            <div class="doc-row-control">
              <label class="doc-upload-btn" *ngIf="!hasFile(doc.key)">
                <span>⬆ Upload</span>
                <input type="file" accept="image/png,image/jpeg,application/pdf" (change)="onFileChange(doc.key,$event)">
              </label>
              <div class="doc-file-chip" *ngIf="hasFile(doc.key)">
                <span class="file-icon">📄</span>
                <span class="file-name">{{ fileStatusLabel(doc.key) }}</span>
                <button type="button" class="file-remove" (click)="clearFile(doc.key)" aria-label="Remove file">×</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ng-container>
  </section>
  <section class="notifications" *ngIf="page==='notifications'"><header><h2>Recent updates</h2><button (click)="markAll()">Mark all read</button></header><article *ngFor="let note of notes" [class.unread]="!note.read"><i>{{note.icon}}</i><div><strong>{{note.title}}</strong><p>{{note.text}}</p><small>{{note.time}}</small></div><button (click)="note.read=true">{{note.read?'Read':'Mark read'}}</button></article></section>
  <section class="messages" *ngIf="page==='messages'"><aside><button *ngFor="let contact of contacts" [class.active]="selected===contact" (click)="selected=contact"><i>{{contact.initial}}</i><div><strong>{{contact.name}}</strong><small>{{contact.role}}</small></div></button></aside><div><header><i>{{selected.initial}}</i><div><strong>{{selected.name}}</strong><small>{{selected.role}}</small></div></header><section><p><span>{{selected.message}}</span><small>Today, 10:14</small></p><p class="mine"><span>Thank you. I’ll review it today.</span><small>Today, 10:20</small></p></section><form (ngSubmit)="send()"><input name="draft" [(ngModel)]="draft" placeholder="Write a message…"><button [disabled]="!draft.trim()">Send</button></form></div></section>
</main>`})
export class StudentExtraPageComponent{
 page='saved-universities';query='';filter='All destinations';saved=true;checked=false;destination='Canada';level='Postgraduate';cost=3500000;income=90000;draft='';
 wantsLoan:boolean|null=null;
 employmentOptions=EMPLOYMENT_CATEGORY_OPTIONS;
 documentFields=FINANCIAL_DOCUMENT_FIELDS;
 cards=[{initial:'N',tag:'CANADA · FALL 2027',title:'Northbridge University',detail:'MSc Data Science · Toronto',meta:'Application fee waived',value:'40% scholarship'},{initial:'W',tag:'UNITED KINGDOM · SEP 2027',title:'Westford University',detail:'MSc Artificial Intelligence · Manchester',meta:'Priority admission',value:'£6,000 award'},{initial:'L',tag:'CANADA · JAN 2028',title:'Lakeview University',detail:'Master of Business Analytics · Vancouver',meta:'Profile match 88%',value:'Up to 25%'}];
 notes=[{icon:'✦',title:'New scholarship match',text:'Northbridge University matched you with its Global Excellence Scholarship.',time:'10 minutes ago',read:false},{icon:'✉',title:'New message',text:'Maya Chen replied to your question about scholarship renewal.',time:'1 hour ago',read:false},{icon:'▤',title:'Document reminder',text:'Upload your final transcript before 20 August.',time:'Yesterday',read:true}];
 contacts=[{initial:'M',name:'Maya Chen',role:'Northbridge University',message:'Your scholarship is renewable for the second year.'},{initial:'R',name:'Rohan Kapoor',role:'EduFund Finance',message:'I can help with the co-applicant documents.'},{initial:'S',name:'SuperOffer Support',role:'Student support',message:'How can we help with your journey?'}];selected=this.contacts[0];
 constructor(route:ActivatedRoute,public store:StudentProfileUiStore,private submittedStudentsStore:SubmittedStudentsStore){route.data.subscribe(d=>this.page=d['page']);this.wantsLoan=this.store.values['needsLoan']==='yes'?true:null;}
 get employmentCategory(){return this.store.values['employmentCategory']||'';}
 set employmentCategory(v:string){this.store.values['employmentCategory']=v;this.syncToOrgDirectory();}
 chooseWantsLoan(v:boolean){this.wantsLoan=v;this.store.values['needsLoan']=v?'yes':'no';this.syncToOrgDirectory();}
 visibleDocuments(){const category=this.employmentCategory;return this.documentFields.filter(doc=>!doc.categories||!category||doc.categories.includes(category));}
 onFileChange(key:FinancialDocKey,event:Event){const file=(event.target as HTMLInputElement).files?.[0];if(!file)return;this.store.values[key]=file.name;this.syncToOrgDirectory();}
 clearFile(key:FinancialDocKey){delete this.store.values[key];this.syncToOrgDirectory();}
 hasFile(key:FinancialDocKey):boolean{return !!this.store.values[key];}
 fileStatusLabel(key:FinancialDocKey):string{return this.store.values[key]||'No file selected';}
 /** Keeps the bank/university-visible directory in sync as documents are uploaded here, well after initial profile submission. */
 private syncToOrgDirectory(){
   if(this.store.values['profileStatus']!=='SUBMITTED')return;
   if(this.store.values['discoverable']==='false')return;
   this.submittedStudentsStore.upsert(mapProfileToOrgStudent(this.store.values,this.store.photo));
 }
 get title(){return {'saved-universities':'Saved universities',scholarships:'Scholarships','loan-eligibility':'Loan eligibility',notifications:'Notifications',messages:'Messages'}[this.page]||'Student workspace';}
 get description(){return {'saved-universities':'Compare universities you want to revisit.',scholarships:'Explore awards matched to your profile and goals.','loan-eligibility':'Preview potential education finance matches.',notifications:'Stay on top of offers, documents, and deadlines.',messages:'Speak with universities, lenders, and support.'}[this.page]||'';}
 get actionRoute(){return this.page==='saved-universities'?'/student/offers':this.page==='scholarships'?'/student/study-preferences':'';} get actionLabel(){return this.page==='saved-universities'?'Explore offers':'Update preferences';}
 get filteredCards(){const q=this.query.toLowerCase();return this.cards.filter(x=>!q||`${x.title} ${x.detail}`.toLowerCase().includes(q));} checkEligibility(valid:boolean|null){this.checked=!!valid;} markAll(){this.notes.forEach(x=>x.read=true);} send(){if(!this.draft.trim())return;this.selected.message=this.draft;this.draft='';}
}
