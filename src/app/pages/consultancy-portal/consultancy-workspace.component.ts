import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

type ConsultancyView = 'dashboard' | 'students' | 'settings';

interface ConsultStudent {
  name: string; initials: string; nationality: string;
  targetCourse: string; targetCountry: string;
  cgpa: string; examScore: string; studyPreferences: string;
  documents: string; recommendedUniversities: string;
  offerSummary: string;
  stageIndex: number;
  color: string;
}

const STAGES = ['Assigned','Profile Review','Documents','Recommend','Applications','Progress','Offer','Visa','Completed'];

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../consultancy-portal.css',
  template: `
    <div class="cons-shell">
      <aside class="cons-rail">
        <button class="cons-logo" type="button" (click)="go('dashboard')">S</button>
        <nav>
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id" (click)="go(item.id)" [title]="item.label" [attr.aria-label]="item.label"><span>{{item.icon}}</span><small>{{item.label}}</small></button>
        </nav>
        <button class="cons-avatar" type="button" (click)="go('settings')" title="Settings" aria-label="Settings">{{userInitials}}</button>
      </aside>

      <main class="cons-main">
        <ng-container *ngIf="view==='dashboard'">
          <header class="cons-page-head">
            <div><span class="eyebrow">STUDENT SUCCESS</span><h1>Good afternoon, {{userName}}</h1><p>Here's what needs your attention today.</p></div>
          </header>

          <section class="cons-priority-banner" *ngIf="needsAttention.length">
            <div class="cons-priority-icon">◎</div>
            <div><span>NEEDS ATTENTION</span><h2>{{needsAttention.length}} students have milestones due this week</h2><p>Keep their applications moving on schedule.</p></div>
            <button type="button" (click)="go('students')">Review now →</button>
          </section>

          <section class="cons-task-list">
            <header><div><span>ACTION NEEDED</span><h2>Students at an active stage</h2></div><small>{{needsAttention.length}} remaining</small></header>
            <button type="button" *ngFor="let s of needsAttention" (click)="openStudent(s)">
              <span class="cons-avatar-chip" [style.background]="s.color">{{s.initials}}</span>
              <div><strong>{{s.name}}</strong><small>{{s.targetCourse}} · {{s.targetCountry}}</small></div>
              <em class="cons-stage-pill">{{stages[s.stageIndex]}}</em>
              <b>→</b>
            </button>
            <div class="cons-empty" *ngIf="!needsAttention.length">No students need action right now.</div>
          </section>
        </ng-container>

        <ng-container *ngIf="view==='students' && !selected">
          <header class="cons-page-head"><div><span class="eyebrow">MY STUDENTS</span><h1>Students</h1><p>Guide each student from assignment through to admission and visa.</p></div></header>
          <section class="cons-student-grid">
            <button type="button" class="cons-student-card" *ngFor="let s of students" (click)="openStudent(s)">
              <span class="cons-avatar-chip large" [style.background]="s.color">{{s.initials}}</span>
              <div class="cons-student-card-main"><strong>{{s.name}}</strong><small>{{s.targetCourse}} · {{s.targetCountry}}</small></div>
              <div class="cons-mini-track"><span>Stage {{s.stageIndex+1}} of {{stages.length}} · {{stages[s.stageIndex]}}</span><i><b [style.width.%]="((s.stageIndex+1)/stages.length)*100"></b></i></div>
            </button>
          </section>
        </ng-container>

        <ng-container *ngIf="selected as s">
          <header class="cons-page-head">
            <div>
              <button type="button" class="cons-back" (click)="selected=null">← Back to students</button>
              <span class="eyebrow">STUDENT JOURNEY</span><h1>{{s.name}}</h1><p>{{s.targetCourse}} · Targeting {{s.targetCountry}}</p>
            </div>
          </header>

          <section class="cons-stage-tracker">
            <article *ngFor="let stage of stages; let i=index" [class.done]="i<s.stageIndex" [class.current]="i===s.stageIndex">
              <span>{{ i < s.stageIndex ? '✓' : i+1 }}</span><small>{{stage}}</small>
            </article>
          </section>

          <section class="cons-current-stage" *ngIf="s.stageIndex<stages.length-1; else doneCard">
            <div><span>CURRENT STAGE</span><h2>{{stages[s.stageIndex]}}</h2><p>{{stageContent(s).text}}</p></div>
            <button type="button" (click)="advanceStage(s)">{{stageContent(s).action}}</button>
          </section>
          <ng-template #doneCard>
            <section class="cons-current-stage complete"><div><span>PLACEMENT COMPLETE</span><h2>Journey completed</h2><p>{{s.name}} has completed the full admission and visa process.</p></div></section>
          </ng-template>

          <div class="cons-detail-grid">
            <article><small>PERSONAL</small><h3>{{s.name}}</h3><p>{{s.nationality}} national · Verified student profile.</p></article>
            <article><small>ACADEMIC</small><h3>{{s.cgpa}}</h3><p>Exam scores: {{s.examScore}}.</p></article>
            <article><small>STUDY PREFERENCES</small><h3>{{s.targetCourse}} in {{s.targetCountry}}</h3><p>{{s.studyPreferences}}</p></article>
            <article><small>DOCUMENTS</small><h3>Verification status</h3><p>{{s.documents}}</p></article>
            <article *ngIf="s.stageIndex>=3"><small>RECOMMENDED UNIVERSITIES</small><h3>Shortlist</h3><p>{{s.recommendedUniversities}}</p></article>
            <article *ngIf="s.stageIndex>=6"><small>OFFER</small><h3>Offer summary</h3><p>{{s.offerSummary}}</p></article>
          </div>
        </ng-container>

        <ng-container *ngIf="view==='settings'">
          <header class="cons-page-head"><div><span class="eyebrow">ORGANISATION</span><h1>Settings</h1><p>Manage your organisation profile and account security.</p></div></header>
          <div class="cons-settings-rail"><button type="button" *ngFor="let tab of settingTabs" [class.active]="settingTab===tab" (click)="settingTab=tab">{{tab}}</button></div>

          <section class="cons-card" *ngIf="settingTab==='Organisation Profile'">
            <header><h2>Organisation Profile</h2><p>Manage your consultancy profile details.</p></header>
            <div class="cons-form-grid"><label>Organisation name<input [(ngModel)]="orgName"></label><label>Official email<input [(ngModel)]="orgEmail"></label><label>Phone number<input [(ngModel)]="orgPhone"></label><label>Head office<input [(ngModel)]="orgCity"></label><label class="wide">Organisation description<textarea [(ngModel)]="orgDescription"></textarea></label></div>
            <footer><button type="button" class="cons-primary" (click)="notify('Organisation profile saved')">Save changes</button></footer>
          </section>

          <section class="cons-card" *ngIf="settingTab==='Change Password'">
            <header><h2>Change Password</h2><p>Update the password used to sign in to your workspace.</p></header>
            <div class="cons-form-grid"><label>Current password<input type="password" [(ngModel)]="passwordForm.current" placeholder="••••••••"></label><label></label><label>New password<input type="password" [(ngModel)]="passwordForm.next" placeholder="••••••••"></label><label>Confirm new password<input type="password" [(ngModel)]="passwordForm.confirm" placeholder="••••••••"></label></div>
            <footer><button type="button" class="cons-primary" (click)="changePassword()">Update password</button></footer>
          </section>

          <section class="cons-card cons-logout-card">
            <span>⎋</span>
            <p><strong>Log out of SuperOffer</strong><small>End your current session on this device.</small></p>
            <button type="button" (click)="logout()">Log out</button>
          </section>
        </ng-container>
      </main>
      <div class="cons-toast" *ngIf="toast">{{toast}}</div>
    </div>
  `
})
export class ConsultancyWorkspaceComponent {
  view: ConsultancyView = 'dashboard';
  toast = '';
  selected: ConsultStudent | null = null;
  settingTab = 'Organisation Profile';
  stages = STAGES;

  navigation = [
    {id:'dashboard' as ConsultancyView, label:'Dashboard', icon:'▦'},
    {id:'students' as ConsultancyView, label:'Students', icon:'○'},
    {id:'settings' as ConsultancyView, label:'Settings', icon:'⚙'}
  ];

  userName = 'Ananya';
  userInitials = 'AS';
  orgName = 'BrightPath Education';
  orgEmail = 'team@brightpath.example';
  orgPhone = '+91 98450 11223';
  orgCity = 'Bengaluru, India';
  orgDescription = 'A verified study-abroad consultancy guiding students from application through to visa approval.';
  settingTabs = ['Organisation Profile', 'Change Password'];
  passwordForm = {current:'', next:'', confirm:''};

  students: ConsultStudent[] = [
    {name:'Vikram Nair',initials:'VN',nationality:'Indian',targetCourse:'MEng Robotics',targetCountry:'Germany',cgpa:'8.6 / 10',examScore:'IELTS 7.0 · GRE 318',studyPreferences:'Prefers research-intensive programmes with lab access; open to Winter or Fall intake.',documents:'Transcript and passport verified · co-applicant income letter pending',recommendedUniversities:'',offerSummary:'',stageIndex:1,color:'#0f6f54'},
    {name:'Priya Menon',initials:'PM',nationality:'Indian',targetCourse:'MSc Finance',targetCountry:'United Kingdom',cgpa:'8.2 / 10',examScore:'IELTS 7.5 · GMAT 690',studyPreferences:'Targeting January 2028 intake; interested in campuses with strong finance placement records.',documents:'All documents verified',recommendedUniversities:'Imperial College London, University of Sussex, Leeds Beckett University',offerSummary:'',stageIndex:4,color:'#315d88'},
    {name:'Jiya Rao',initials:'JR',nationality:'Indian',targetCourse:'BSc Computer Science',targetCountry:'Canada',cgpa:'9.0 / 10',examScore:'IELTS 7.5',studyPreferences:'Undergraduate applicant; prefers co-op programmes with internship placement.',documents:'All documents verified',recommendedUniversities:'Northbridge University, Lakeview Institute of Technology',offerSummary:'Northbridge University — Fast-track admission, response due 3 Aug 2026.',stageIndex:6,color:'#8a5b35'},
    {name:'Rahul Verma',initials:'RV',nationality:'Indian',targetCourse:'MSc Data Science',targetCountry:'Canada',cgpa:'8.9 / 10',examScore:'IELTS 7.5 · GRE 323',studyPreferences:'Targeting Fall 2027 intake; budget-conscious, prioritising scholarship availability.',documents:'All documents verified',recommendedUniversities:'Northbridge University',offerSummary:'Northbridge University — 40% tuition scholarship, accepted.',stageIndex:7,color:'#695392'},
    {name:'Asha Iyer',initials:'AI',nationality:'Indian',targetCourse:'MBA International',targetCountry:'Canada',cgpa:'8.1 / 10',examScore:'IELTS 7.0 · GMAT 650',studyPreferences:'Placement completed last cycle; retained for reference.',documents:'All documents verified',recommendedUniversities:'Northbridge University',offerSummary:'Northbridge University — enrolled, Spring 2027 intake.',stageIndex:8,color:'#9a4f63'}
  ];

  get needsAttention(){return this.students.filter(s=>s.stageIndex<this.stages.length-1);}

  stageContent(s:ConsultStudent){
    const map: Record<number,{text:string;action:string}> = {
      0:{text:'A new student has been assigned to you. Start by reviewing their profile and study goals.',action:'Mark profile reviewed'},
      1:{text:'Confirm academic records and study preferences are accurate and complete.',action:'Confirm profile reviewed'},
      2:{text:'Verify transcripts, passport, and test scores before recommending universities.',action:'Mark documents verified'},
      3:{text:'Shortlist target universities and courses that match this student\'s goals.',action:'Confirm recommendations sent'},
      4:{text:'Submit applications to the shortlisted universities on the student\'s behalf.',action:'Mark applications submitted'},
      5:{text:'Track university responses and follow up on outstanding applications.',action:'Update progress'},
      6:{text:'An offer has been received — help the student review and respond.',action:'Confirm offer accepted'},
      7:{text:'Guide the student through visa documentation and interview preparation.',action:'Mark visa approved'}
    };
    return map[s.stageIndex] || {text:'', action:''};
  }
  advanceStage(s:ConsultStudent){
    if(s.stageIndex<this.stages.length-1){s.stageIndex++;this.notify(`${s.name} moved to "${this.stages[s.stageIndex]}"`);}
  }

  openStudent(s:ConsultStudent){this.selected=s;this.view='students';}
  changePassword(){
    if(!this.passwordForm.next||this.passwordForm.next!==this.passwordForm.confirm){this.notify('New passwords do not match');return;}
    this.passwordForm={current:'',next:'',confirm:''};
    this.notify('Password updated');
  }
  go(view:ConsultancyView){this.view=view;this.selected=null;this.router.navigate(['/portal/consultancy',view]);}
  notify(message:string){this.toast=message;window.setTimeout(()=>{if(this.toast===message)this.toast='';},2400);}
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');this.router.navigate(['/']);}
  constructor(private router:Router,private route:ActivatedRoute){
    this.route.data.subscribe(data=>{if(data['page'])this.view=data['page'] as ConsultancyView;});
  }
}
