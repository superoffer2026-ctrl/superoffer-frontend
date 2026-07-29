import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type UniversityView = 'dashboard' | 'search' | 'shortlists' | 'invitations' | 'programs' | 'reports' | 'settings';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: '../../university-portal.css',
  template: `
    <div class="uni-shell">
      <aside class="uni-sidebar">
        <button class="uni-brand" type="button" (click)="view='dashboard'"><img src="/university-logo.png" alt="SuperOffer University"><strong>SuperOffer</strong></button>
        <div class="uni-org"><span>NU</span><div><strong>Northbridge University</strong><small>Verified organisation</small></div></div>
        <nav>
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id" (click)="view=item.id" [title]="item.label" [attr.aria-label]="item.label">
            <span>{{item.icon}}</span><strong>{{item.label}}</strong><small *ngIf="item.badge">{{item.badge}}</small>
          </button>
        </nav>
        <div class="uni-plan"><span>GROWTH PLAN</span><strong>214 of 500</strong><small>student profiles viewed</small><i><b></b></i></div>
        <button class="uni-user" type="button" (click)="logout()"><span>AM</span><div><strong>Aisha Malik</strong><small>Admissions Officer</small></div><b>↗</b></button>
      </aside>

      <main class="uni-main">
        <header class="uni-topbar">
          <div><span class="uni-mobile-brand">SuperOffer University</span><small>2026–27 recruitment cycle</small></div>
          <div><button type="button" aria-label="Notifications">◌<b>3</b></button><button type="button" (click)="view='settings'">⚙</button></div>
        </header>

        <section class="uni-view" *ngIf="view==='dashboard'">
          <header class="uni-page-title"><div><span>ADMISSIONS WORKSPACE</span><h1>Good afternoon, Aisha</h1><p>Here’s how your student recruitment pipeline is moving.</p></div><button class="uni-primary" (click)="view='search'">Find students</button></header>
          <section class="uni-priority">
            <div><span>NEEDS ATTENTION</span><h2>3 student negotiations are waiting for your response</h2><p>The earliest offer expires in 4 days.</p></div>
            <button type="button" (click)="view='invitations'">Review negotiations →</button>
          </section>
          <div class="uni-metrics">
            <article><span>ACTIVE SHORTLISTS</span><strong>6</strong><small>48 students across programmes</small></article>
            <article><span>INVITATIONS SENT</span><strong>84</strong><small><b>+12%</b> from last cycle</small></article>
            <article><span>ACCEPTED OFFERS</span><strong>19</strong><small><b>22.6%</b> conversion rate</small></article>
            <article><span>INVITES REMAINING</span><strong>116</strong><small>Resets in 18 days</small></article>
          </div>
          <div class="uni-dashboard-grid">
            <section class="uni-card uni-recommended">
              <header><div><span>AI RECOMMENDATIONS</span><h2>Students worth reviewing</h2></div><button (click)="view='search'">View all</button></header>
              <article *ngFor="let student of students.slice(0,3)">
                <span class="candidate-avatar" [style.background]="student.color">{{student.initials}}</span>
                <div><strong>{{student.name}}</strong><small>{{student.course}} · {{student.country}}</small></div>
                <b>{{student.score}}<small>match</small></b>
                <span class="candidate-factor">{{student.factor}}</span>
                <button type="button" (click)="openStudent(student)">Review</button>
              </article>
            </section>
            <section class="uni-card uni-pipeline">
              <header><div><span>INVITATION PIPELINE</span><h2>Current cycle</h2></div><button (click)="view='reports'">Report</button></header>
              <div class="pipeline-row" *ngFor="let stage of pipeline"><div><span>{{stage.label}}</span><strong>{{stage.value}}</strong></div><i><b [style.width.%]="stage.percent"></b></i><small>{{stage.percent}}%</small></div>
              <div class="pipeline-note"><strong>19 accepted offers</strong><span>4 more than this point last cycle</span></div>
            </section>
          </div>
          <section class="uni-card uni-activity">
            <header><div><span>RECENT ACTIVITY</span><h2>Latest student responses</h2></div><button (click)="view='invitations'">All invitations</button></header>
            <div *ngFor="let event of activity"><span [class]="event.tone">{{event.icon}}</span><div><strong>{{event.title}}</strong><small>{{event.detail}}</small></div><time>{{event.time}}</time><button type="button" (click)="notify(event.action+' opened')">{{event.action}}</button></div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='search'">
          <header class="uni-page-title"><div><span>STUDENT DISCOVERY</span><h1>Find best-fit students</h1><p>Search visible profiles ranked by your programme criteria.</p></div><button class="uni-secondary" (click)="notify('Saved searches opened')">Saved searches</button></header>
          <div class="uni-search-box"><span>✦</span><input [(ngModel)]="query" placeholder="Try “Data Science students targeting Canada with IELTS 7+”"><button class="uni-primary" (click)="notify(query ? 'Search results updated' : 'Enter a search or use the filters')">Search</button></div>
          <div class="uni-filter-row"><button *ngFor="let filter of filters" [class.active]="activeFilter===filter" (click)="activeFilter=filter">{{filter}}⌄</button><span></span><small>214 profile views remaining</small></div>
          <div class="uni-results-head"><div><strong>143 matching students</strong><small>Contact details stay hidden until an offer is accepted.</small></div><select [(ngModel)]="sortOrder"><option>Best match</option><option>Most recent</option><option>Profile completion</option></select></div>
          <section class="uni-results">
            <article *ngFor="let student of students">
              <span class="candidate-avatar large" [style.background]="student.color">{{student.initials}}</span>
              <div class="candidate-main"><span>{{student.level}} · {{student.intake}}</span><h2>{{student.name}}</h2><p>{{student.course}} · Targeting {{student.country}}</p><div><small *ngFor="let tag of student.tags">{{tag}}</small></div></div>
              <div class="match-score"><strong>{{student.score}}</strong><small>MATCH SCORE</small><span>{{student.factor}}</span></div>
              <div class="result-actions"><button class="uni-secondary shortlist-toggle" [class.chosen]="isShortlisted(student.name)" (click)="toggleShortlist(student.name)">{{isShortlisted(student.name) ? '✓ Shortlisted' : '+ Shortlist'}}</button><button class="uni-primary" (click)="openStudent(student)">Review profile</button></div>
            </article>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='shortlists'">
          <header class="uni-page-title"><div><span>CANDIDATE ORGANISATION</span><h1>Shortlists</h1><p>Keep promising students organised by programme and intake.</p></div><button class="uni-primary" (click)="notify('New shortlist created')">Create shortlist</button></header>
          <div class="shortlist-summary">
            <button *ngFor="let list of shortlistGroups" [class.active]="activeShortlist===list.code" (click)="activeShortlist=list.code"><span>{{list.code}}</span><div><strong>{{list.name}}</strong><small>{{list.count}} students · {{list.intake}}</small></div><b>›</b></button>
          </div>
          <section class="shortlist-table">
            <div class="shortlist-table-head"><span>STUDENT</span><span>MATCH</span><span>FIT SIGNAL</span><span>ADDED</span><span>ACTIONS</span></div>
            <article *ngFor="let student of shortlistStudents"><div><span class="candidate-avatar" [style.background]="student.color">{{student.initials}}</span><p><strong>{{student.name}}</strong><small>{{student.course}}</small></p></div><b>{{student.score}}</b><span>{{student.factor}}</span><span>24 Jul 2026</span><div><button (click)="openStudent(student)">Profile</button><button (click)="toggleShortlist(student.name)">Remove</button><button class="primary-btn" (click)="notify('Invitation composer opened for '+student.name)">Invite</button></div></article>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='invitations'">
          <header class="uni-page-title"><div><span>OFFERS & RESPONSES</span><h1>Invitations</h1><p>Track every admission offer from sent to accepted.</p></div><button class="uni-primary" (click)="notify('Invitation composer opened')">Create invitation</button></header>
          <div class="invitation-metrics"><div><small>SENT</small><strong>84</strong><span>This cycle</span></div><div><small>VIEWED</small><strong>61</strong><span>72.6% open rate</span></div><div><small>NEGOTIATING</small><strong>3</strong><span>Needs response</span></div><div><small>ACCEPTED</small><strong>19</strong><span>22.6% conversion</span></div></div>
          <div class="invitation-filters"><button *ngFor="let status of invitationStatuses" [class.active]="invitationFilter===status" (click)="invitationFilter=status">{{status}}</button></div>
          <section class="university-invitations">
            <article *ngFor="let invite of filteredInvitations"><div><span>{{invite.initials}}</span><p><strong>{{invite.student}}</strong><small>{{invite.program}}</small></p></div><p><strong>{{invite.offer}}</strong><small>Offer terms</small></p><b [class.negotiating]="invite.status==='Negotiating'" [class.accepted]="invite.status==='Accepted'">{{invite.status}}</b><p><strong>{{invite.sent}}</strong><small>Sent</small></p><p><strong>{{invite.deadline}}</strong><small>Expires</small></p><button (click)="notify(invite.student+' invitation opened')">Open</button></article>
          </section>
          <div class="negotiation-alert"><span>!</span><div><strong>3 negotiations need a response</strong><p>Review counter-requests and reply before the invitation deadlines.</p></div><button (click)="invitationFilter='Negotiating 3'">Review now →</button></div>
        </section>

        <section class="uni-view" *ngIf="view==='programs'">
          <header class="uni-page-title"><div><span>CATALOG & MATCHING</span><h1>Programmes</h1><p>Maintain programme information and the criteria used for matching.</p></div><button class="uni-primary" (click)="openProgram()">Add programme</button></header>
          <div class="university-tabs"><button *ngFor="let tab of programTabs" [class.active]="programTab===tab" (click)="programTab=tab">{{tab}}</button></div>
          <section class="uni-card program-catalog" *ngIf="programTab==='Programme catalog'">
            <article *ngFor="let program of programs"><span class="program-mark">{{program.code}}</span><div class="program-name"><small>{{program.level}}</small><h2>{{program.name}}</h2><p>{{program.campus}} · {{program.intake}}</p></div><div><small>SHORTLISTED</small><strong>{{program.shortlisted}}</strong></div><div><small>ACCEPTED / TARGET</small><strong>{{program.accepted}} / {{program.target}}</strong></div><span>{{program.status}}</span><button (click)="openProgram(program)">Edit</button></article>
          </section>
          <section class="uni-card uni-simple-editor" *ngIf="programTab==='Admission criteria'"><header><div><h2>Admission criteria</h2><p>Set the profile signals used to rank student matches.</p></div><button class="uni-primary" (click)="notify('Admission criteria saved')">Save criteria</button></header><div class="settings-form"><label>Minimum academic score<input value="75%"></label><label>Minimum IELTS score<input value="7.0"></label><label>Preferred study background<input value="Computer Science, Mathematics"></label><label>Target intake<select><option>Fall 2027</option></select></label></div></section>
          <section class="uni-card uni-simple-editor" *ngIf="programTab==='Offer templates'"><header><div><h2>Offer templates</h2><p>Reusable terms that can be confirmed for each student.</p></div><button class="uni-primary" (click)="notify('New offer template created')">New template</button></header><div class="template-grid"><article><span>SCHOLARSHIP</span><h2>Global Excellence</h2><p>Up to 40% tuition scholarship with fast-track review.</p><button (click)="notify('Template editor opened')">Edit template</button></article><article><span>ADMISSION</span><h2>Priority admission</h2><p>Accelerated decision for high-match candidates.</p><button (click)="notify('Template editor opened')">Edit template</button></article></div></section>
        </section>

        <section class="uni-view" *ngIf="view==='reports'">
          <header class="uni-page-title"><div><span>ADMISSIONS PERFORMANCE</span><h1>Reports</h1><p>Understand which programmes, offers, and match bands convert.</p></div><button class="uni-secondary" (click)="exportReport()">Export CSV</button></header>
          <div class="uni-report-summary"><article><span>ACCEPTANCE RATE</span><strong>22.6%</strong><small>↑ 3.8% vs last cycle</small></article><article><span>AVG. RESPONSE TIME</span><strong>3.4 days</strong><small>1.2 days faster</small></article><article><span>TOP MATCH BAND</span><strong>85–100</strong><small>41% acceptance</small></article></div>
          <div class="uni-dashboard-grid"><section class="uni-card uni-funnel-chart"><header><div><span>CONVERSION FUNNEL</span><h2>Fall 2027 cycle</h2></div></header><div *ngFor="let stage of pipeline"><span>{{stage.label}}</span><i [style.width.%]="stage.percent"><b>{{stage.value}}</b></i><small>{{stage.percent}}%</small></div></section><section class="uni-card uni-program-performance"><header><div><span>BY PROGRAMME</span><h2>Offer performance</h2></div></header><div *ngFor="let program of programs"><span>{{program.name}}</span><i><b [style.width.%]="program.performance"></b></i><strong>{{program.performance}}%</strong></div></section></div>
        </section>

        <section class="uni-view" *ngIf="view==='settings'">
          <header class="uni-page-title"><div><span>ORGANISATION</span><h1>University settings</h1><p>Manage your organisation profile, team, notifications, and subscription.</p></div><span class="org-verified">✓ Verified organisation</span></header>
          <div class="settings-rail"><button *ngFor="let tab of settingTabs" [class.active]="settingTab===tab" (click)="settingTab=tab">{{tab}}</button></div>
          <section class="uni-card uni-org-settings"><header><h2>{{settingTab}}</h2><p>Manage your university {{settingTab.toLowerCase()}} details.</p></header><div class="settings-form" *ngIf="settingTab==='Organisation profile'"><label>University name<input [(ngModel)]="orgName"></label><label>Official domain<input [(ngModel)]="orgDomain"></label><label>University type<select><option>Private university</option></select></label><label>Main campus<input [(ngModel)]="orgCampus"></label><label class="wide">Organisation description<textarea [(ngModel)]="orgDescription"></textarea></label></div><div class="uni-setting-placeholder" *ngIf="settingTab!=='Organisation profile'"><strong>{{settingTab}} settings</strong><p>Frontend controls for this section are ready for backend integration.</p></div><footer><button class="uni-primary" (click)="notify(settingTab+' saved')">Save changes</button></footer></section>
        </section>
      </main>
      <div class="uni-toast" *ngIf="toast">{{toast}}</div>
      <div class="university-panel-backdrop" *ngIf="selectedStudent" (click)="selectedStudent=null"><section class="candidate-profile-panel" (click)="$event.stopPropagation()"><header><span>STUDENT PROFILE PREVIEW</span><button (click)="selectedStudent=null">×</button></header><div class="candidate-profile-hero"><span [style.background]="selectedStudent.color">{{selectedStudent.initials}}</span><div><small>{{selectedStudent.level}} · {{selectedStudent.intake}}</small><h1>{{selectedStudent.name}}</h1><p>{{selectedStudent.course}} · Targeting {{selectedStudent.country}}</p></div><strong>{{selectedStudent.score}}<small>match</small></strong></div><div class="match-factor-list"><h2>Why this student matches</h2><div><span>Academic fit</span><b><i style="width:92%"></i></b><strong>92</strong></div><div><span>Study intent</span><b><i style="width:88%"></i></b><strong>88</strong></div><div><span>Programme fit</span><b><i style="width:94%"></i></b><strong>94</strong></div><small>Contact details remain protected until an offer is accepted.</small></div><footer><button class="uni-secondary" (click)="toggleShortlist(selectedStudent.name)">{{isShortlisted(selectedStudent.name)?'Remove shortlist':'Shortlist'}}</button><button class="uni-primary" (click)="notify('Invitation composer opened for '+selectedStudent.name)">Send invitation</button></footer></section></div>
      <div class="university-panel-backdrop program-modal-backdrop" *ngIf="programDraft" (click)="programDraft=null"><form class="university-offer-composer" (ngSubmit)="saveProgram()" (click)="$event.stopPropagation()"><header><div><small>PROGRAMME CATALOG</small><h2>{{editingProgram ? 'Edit programme' : 'Add programme'}}</h2><p>Keep course details current for matching and offers.</p></div><button type="button" (click)="programDraft=null">×</button></header><div class="composer-grid"><label>Programme name<input name="programName" [(ngModel)]="programDraft.name" required></label><label>Code<input name="programCode" [(ngModel)]="programDraft.code" required></label><label>Degree level<select name="programLevel" [(ngModel)]="programDraft.level"><option>POSTGRADUATE</option><option>UNDERGRADUATE</option></select></label><label>Campus<input name="programCampus" [(ngModel)]="programDraft.campus"></label><label>Intake<input name="programIntake" [(ngModel)]="programDraft.intake"></label><label>Admission target<input name="programTarget" type="number" [(ngModel)]="programDraft.target"></label><label>Status<select name="programStatus" [(ngModel)]="programDraft.status"><option>Active</option><option>Draft</option></select></label></div><footer><button class="uni-secondary" type="button" (click)="programDraft=null">Cancel</button><button class="uni-primary" type="submit">Save programme</button></footer></form></div>
    </div>
  `
})
export class UniversityWorkspaceComponent {
  view: UniversityView = 'dashboard';
  query = '';
  activeFilter = '';
  sortOrder = 'Best match';
  activeShortlist = 'DS';
  invitationFilter = 'All 84';
  programTab = 'Programme catalog';
  settingTab = 'Organisation profile';
  toast = '';
  selectedStudent:any = null;
  editingProgram:any = null;
  programDraft:any = null;
  shortlistedNames = new Set(['Aarav Mehta', 'Sara Khan', 'Daniel Okafor']);
  navigation: Array<{id:UniversityView;label:string;icon:string;badge?:string}> = [
    {id:'dashboard',label:'Dashboard',icon:'▦'},
    {id:'search',label:'Search students',icon:'⌕'},
    {id:'shortlists',label:'Shortlists',icon:'☆',badge:'48'},
    {id:'invitations',label:'Invitations',icon:'↗',badge:'3'},
    {id:'programs',label:'Programmes',icon:'▤'}
  ];
  shortlistGroups = [
    {code:'DS',name:'MSc Data Science',count:18,intake:'Fall 2027'},
    {code:'AI',name:'MSc Artificial Intelligence',count:14,intake:'Fall 2027'},
    {code:'BA',name:'MBA International',count:16,intake:'Spring 2027'}
  ];
  invitationStatuses = ['All 84','Sent 23','Viewed 29','Negotiating 3','Accepted 19','Closed 10'];
  programTabs = ['Programme catalog','Admission criteria','Offer templates'];
  settingTabs = ['Organisation profile','Team','Notifications','Subscription','Security'];
  filters = ['Country: Canada ','Degree: Masters ','Intake: Fall 2027 ','IELTS: 7+ ','More filters '];
  students = [
    {name:'Aarav Mehta',initials:'AM',course:'Data Science',country:'Canada',score:94,factor:'Strong academic fit',level:'Postgraduate',intake:'Fall 2027',tags:['IELTS 7.5','CGPA 8.7','Profile 92%'],color:'#0f6f54'},
    {name:'Sara Khan',initials:'SK',course:'Artificial Intelligence',country:'Canada',score:91,factor:'Excellent programme fit',level:'Postgraduate',intake:'Fall 2027',tags:['IELTS 8.0','CGPA 9.1','Profile 96%'],color:'#315d88'},
    {name:'Daniel Okafor',initials:'DO',course:'Business Analytics',country:'Canada',score:88,factor:'High intent signal',level:'Postgraduate',intake:'Fall 2027',tags:['IELTS 7.0','GPA 3.7','Profile 89%'],color:'#8a5b35'},
    {name:'Mei Lin',initials:'ML',course:'Computer Science',country:'Canada',score:86,factor:'Strong test scores',level:'Postgraduate',intake:'Spring 2027',tags:['TOEFL 108','GPA 3.8','Profile 91%'],color:'#695392'},
    {name:'Riya Patel',initials:'RP',course:'International Business',country:'Canada',score:84,factor:'Budget aligned',level:'Postgraduate',intake:'Fall 2027',tags:['IELTS 7.5','CGPA 8.4','Profile 87%'],color:'#9a4f63'}
  ];
  pipeline = [{label:'Sent',value:84,percent:100},{label:'Viewed',value:61,percent:73},{label:'Negotiating',value:3,percent:36},{label:'Accepted',value:19,percent:23}];
  activity = [
    {icon:'✓',tone:'positive',title:'Sara Khan accepted your offer',detail:'MSc Artificial Intelligence · 40% scholarship',time:'18 min ago',action:'View'},
    {icon:'↔',tone:'warning',title:'Aarav Mehta requested revised terms',detail:'MSc Data Science · Scholarship counter-request',time:'1 hr ago',action:'Respond'},
    {icon:'◉',tone:'neutral',title:'Daniel Okafor viewed your invitation',detail:'MSc Business Analytics',time:'3 hrs ago',action:'Open'}
  ];
  invitations = [
    {student:'Aarav Mehta',initials:'AM',program:'MSc Data Science',offer:'40% scholarship',status:'Negotiating',sent:'24 Jul',deadline:'7 Aug'},
    {student:'Sara Khan',initials:'SK',program:'MSc Artificial Intelligence',offer:'40% scholarship',status:'Accepted',sent:'22 Jul',deadline:'5 Aug'},
    {student:'Daniel Okafor',initials:'DO',program:'MSc Business Analytics',offer:'£6,000 award',status:'Viewed',sent:'21 Jul',deadline:'4 Aug'},
    {student:'Mei Lin',initials:'ML',program:'MSc Computer Science',offer:'Fast-track admission',status:'Sent',sent:'20 Jul',deadline:'3 Aug'}
  ];
  programs = [
    {code:'DS',level:'POSTGRADUATE',name:'MSc Data Science',campus:'Toronto',intake:'Fall 2027',shortlisted:18,accepted:7,target:20,status:'Active',performance:31},
    {code:'AI',level:'POSTGRADUATE',name:'MSc Artificial Intelligence',campus:'Toronto',intake:'Fall 2027',shortlisted:14,accepted:6,target:18,status:'Active',performance:28},
    {code:'BA',level:'POSTGRADUATE',name:'MSc Business Analytics',campus:'Vancouver',intake:'Fall 2027',shortlisted:16,accepted:4,target:20,status:'Active',performance:21},
    {code:'IB',level:'POSTGRADUATE',name:'MBA International Business',campus:'Toronto',intake:'Spring 2027',shortlisted:9,accepted:2,target:15,status:'Draft',performance:15}
  ];
  orgName='Northbridge University';
  orgDomain='northbridge.edu';
  orgCampus='Toronto, Canada';
  orgDescription='Internationally focused university offering career-led postgraduate programmes.';
  get shortlistStudents(){return this.students.filter(student=>this.shortlistedNames.has(student.name));}
  get filteredInvitations(){
    const status=this.invitationFilter.split(' ')[0];
    return status==='All'||status==='Closed'?this.invitations:this.invitations.filter(invite=>invite.status===status);
  }
  isShortlisted(name:string){return this.shortlistedNames.has(name);}
  toggleShortlist(name:string){
    if(this.shortlistedNames.has(name)) this.shortlistedNames.delete(name);
    else this.shortlistedNames.add(name);
    this.shortlistedNames = new Set(this.shortlistedNames);
    localStorage.setItem('superoffer_university_shortlist',JSON.stringify([...this.shortlistedNames]));
    this.notify(this.shortlistedNames.has(name)?`${name} added to shortlist`:`${name} removed from shortlist`);
  }
  openStudent(student:any){this.selectedStudent=student;}
  openProgram(program?:any){
    this.editingProgram=program||null;
    this.programDraft=program?{...program}:{code:'',level:'POSTGRADUATE',name:'',campus:'',intake:'Fall 2027',shortlisted:0,accepted:0,target:20,status:'Draft',performance:0};
  }
  saveProgram(){
    if(this.editingProgram) Object.assign(this.editingProgram,this.programDraft);
    else this.programs=[...this.programs,{...this.programDraft}];
    this.notify(this.editingProgram?'Programme updated':'Programme added');
    this.programDraft=null;
    this.editingProgram=null;
  }
  notify(message:string){
    this.toast=message;
    window.setTimeout(()=>{if(this.toast===message)this.toast='';},2400);
  }
  exportReport(){
    const rows=['Programme,Accepted,Target,Performance',...this.programs.map(program=>`${program.name},${program.accepted},${program.target},${program.performance}%`)];
    const url=URL.createObjectURL(new Blob([rows.join('\n')],{type:'text/csv'}));
    const link=document.createElement('a');link.href=url;link.download='university-admissions-report.csv';link.click();URL.revokeObjectURL(url);
    this.notify('Report exported');
  }
  constructor(private router:Router){
    try{
      const saved=JSON.parse(localStorage.getItem('superoffer_university_shortlist')||'null');
      if(Array.isArray(saved))this.shortlistedNames=new Set(saved);
    }catch{}
  }
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');this.router.navigate(['/']);}
}
