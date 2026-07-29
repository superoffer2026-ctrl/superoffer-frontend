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
        <button class="uni-brand" type="button" (click)="view='dashboard'"><span>S</span><strong>SuperOffer</strong></button>
        <div class="uni-org"><span>NU</span><div><strong>Northbridge University</strong><small>Verified organisation</small></div></div>
        <nav>
          <button *ngFor="let item of navigation" type="button" [class.active]="view===item.id" (click)="view=item.id">
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
                <button type="button">Review</button>
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
            <div *ngFor="let event of activity"><span [class]="event.tone">{{event.icon}}</span><div><strong>{{event.title}}</strong><small>{{event.detail}}</small></div><time>{{event.time}}</time><button type="button">{{event.action}}</button></div>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='search'">
          <header class="uni-page-title"><div><span>STUDENT DISCOVERY</span><h1>Find best-fit students</h1><p>Search visible profiles ranked by your programme criteria.</p></div><button class="uni-secondary">Saved searches</button></header>
          <div class="uni-search-box"><span>✦</span><input [(ngModel)]="query" placeholder="Try “Data Science students targeting Canada with IELTS 7+”"><button class="uni-primary">Search</button></div>
          <div class="uni-filter-row"><button *ngFor="let filter of filters">{{filter}}⌄</button><span></span><small>214 profile views remaining</small></div>
          <div class="uni-results-head"><div><strong>143 matching students</strong><small>Contact details stay hidden until an offer is accepted.</small></div><select><option>Best match</option><option>Most recent</option><option>Profile completion</option></select></div>
          <section class="uni-results">
            <article *ngFor="let student of students">
              <span class="candidate-avatar large" [style.background]="student.color">{{student.initials}}</span>
              <div class="candidate-main"><span>{{student.level}} · {{student.intake}}</span><h2>{{student.name}}</h2><p>{{student.course}} · Targeting {{student.country}}</p><div><small *ngFor="let tag of student.tags">{{tag}}</small></div></div>
              <div class="match-score"><strong>{{student.score}}</strong><small>MATCH SCORE</small><span>{{student.factor}}</span></div>
              <div class="result-actions"><button class="uni-secondary">Shortlist</button><button class="uni-primary">Review profile</button></div>
            </article>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='shortlists'">
          <header class="uni-page-title"><div><span>CANDIDATE ORGANISATION</span><h1>Shortlists</h1><p>Keep promising students organised by programme and intake.</p></div><button class="uni-primary">Create shortlist</button></header>
          <div class="shortlist-summary">
            <button class="active"><span>DS</span><div><strong>MSc Data Science</strong><small>18 students · Fall 2027</small></div><b>›</b></button>
            <button><span>AI</span><div><strong>MSc Artificial Intelligence</strong><small>14 students · Fall 2027</small></div><b>›</b></button>
            <button><span>BA</span><div><strong>MBA International</strong><small>16 students · Spring 2027</small></div><b>›</b></button>
          </div>
          <section class="shortlist-table">
            <div class="shortlist-table-head"><span>STUDENT</span><span>MATCH</span><span>FIT SIGNAL</span><span>ADDED</span><span>ACTIONS</span></div>
            <article *ngFor="let student of students.slice(0,4)"><div><span class="candidate-avatar" [style.background]="student.color">{{student.initials}}</span><p><strong>{{student.name}}</strong><small>{{student.course}}</small></p></div><b>{{student.score}}</b><span>{{student.factor}}</span><span>24 Jul 2026</span><div><button>Profile</button><button class="primary-btn">Invite</button></div></article>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='invitations'">
          <header class="uni-page-title"><div><span>OFFERS & RESPONSES</span><h1>Invitations</h1><p>Track every admission offer from sent to accepted.</p></div><button class="uni-primary">Create invitation</button></header>
          <div class="invitation-metrics"><div><small>SENT</small><strong>84</strong><span>This cycle</span></div><div><small>VIEWED</small><strong>61</strong><span>72.6% open rate</span></div><div><small>NEGOTIATING</small><strong>3</strong><span>Needs response</span></div><div><small>ACCEPTED</small><strong>19</strong><span>22.6% conversion</span></div></div>
          <div class="invitation-filters"><button class="active">All 84</button><button>Sent 23</button><button>Viewed 29</button><button>Negotiating 3</button><button>Accepted 19</button><button>Closed 10</button></div>
          <section class="university-invitations">
            <article *ngFor="let invite of invitations"><div><span>{{invite.initials}}</span><p><strong>{{invite.student}}</strong><small>{{invite.program}}</small></p></div><p><strong>{{invite.offer}}</strong><small>Offer terms</small></p><b [class.negotiating]="invite.status==='Negotiating'" [class.accepted]="invite.status==='Accepted'">{{invite.status}}</b><p><strong>{{invite.sent}}</strong><small>Sent</small></p><p><strong>{{invite.deadline}}</strong><small>Expires</small></p><button>Open</button></article>
          </section>
          <div class="negotiation-alert"><span>!</span><div><strong>3 negotiations need a response</strong><p>Review counter-requests and reply before the invitation deadlines.</p></div><button>Review now →</button></div>
        </section>

        <section class="uni-view" *ngIf="view==='programs'">
          <header class="uni-page-title"><div><span>CATALOG & MATCHING</span><h1>Programmes</h1><p>Maintain programme information and the criteria used for matching.</p></div><button class="uni-primary">Add programme</button></header>
          <div class="university-tabs"><button class="active">Programme catalog</button><button>Admission criteria</button><button>Offer templates</button></div>
          <section class="uni-card program-catalog">
            <article *ngFor="let program of programs"><span class="program-mark">{{program.code}}</span><div class="program-name"><small>{{program.level}}</small><h2>{{program.name}}</h2><p>{{program.campus}} · {{program.intake}}</p></div><div><small>SHORTLISTED</small><strong>{{program.shortlisted}}</strong></div><div><small>ACCEPTED / TARGET</small><strong>{{program.accepted}} / {{program.target}}</strong></div><span>{{program.status}}</span><button>Edit</button></article>
          </section>
        </section>

        <section class="uni-view" *ngIf="view==='reports'">
          <header class="uni-page-title"><div><span>ADMISSIONS PERFORMANCE</span><h1>Reports</h1><p>Understand which programmes, offers, and match bands convert.</p></div><button class="uni-secondary">Export CSV</button></header>
          <div class="uni-report-summary"><article><span>ACCEPTANCE RATE</span><strong>22.6%</strong><small>↑ 3.8% vs last cycle</small></article><article><span>AVG. RESPONSE TIME</span><strong>3.4 days</strong><small>1.2 days faster</small></article><article><span>TOP MATCH BAND</span><strong>85–100</strong><small>41% acceptance</small></article></div>
          <div class="uni-dashboard-grid"><section class="uni-card uni-funnel-chart"><header><div><span>CONVERSION FUNNEL</span><h2>Fall 2027 cycle</h2></div></header><div *ngFor="let stage of pipeline"><span>{{stage.label}}</span><i [style.width.%]="stage.percent"><b>{{stage.value}}</b></i><small>{{stage.percent}}%</small></div></section><section class="uni-card uni-program-performance"><header><div><span>BY PROGRAMME</span><h2>Offer performance</h2></div></header><div *ngFor="let program of programs"><span>{{program.name}}</span><i><b [style.width.%]="program.performance"></b></i><strong>{{program.performance}}%</strong></div></section></div>
        </section>

        <section class="uni-view" *ngIf="view==='settings'">
          <header class="uni-page-title"><div><span>ORGANISATION</span><h1>University settings</h1><p>Manage your organisation profile, team, notifications, and subscription.</p></div><span class="org-verified">✓ Verified organisation</span></header>
          <div class="settings-rail"><button class="active">Organisation profile</button><button>Team</button><button>Notifications</button><button>Subscription</button><button>Security</button></div>
          <section class="uni-card uni-org-settings"><header><h2>Organisation profile</h2><p>Information shown on your admission offers.</p></header><div class="settings-form"><label>University name<input value="Northbridge University"></label><label>Official domain<input value="northbridge.edu"></label><label>University type<select><option>Private university</option></select></label><label>Main campus<input value="Toronto, Canada"></label><label class="wide">Organisation description<textarea>Internationally focused university offering career-led postgraduate programmes.</textarea></label></div><footer><button class="uni-primary">Save changes</button></footer></section>
        </section>
      </main>
    </div>
  `
})
export class UniversityWorkspaceComponent {
  view: UniversityView = 'dashboard';
  query = '';
  navigation: Array<{id:UniversityView;label:string;icon:string;badge?:string}> = [
    {id:'dashboard',label:'Dashboard',icon:'▦'},
    {id:'search',label:'Search students',icon:'⌕'},
    {id:'shortlists',label:'Shortlists',icon:'☆',badge:'48'},
    {id:'invitations',label:'Invitations',icon:'↗',badge:'3'},
    {id:'programs',label:'Programmes',icon:'▤'},
    {id:'reports',label:'Reports',icon:'▥'},
    {id:'settings',label:'Org settings',icon:'⚙'}
  ];
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
  constructor(private router:Router){}
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');this.router.navigate(['/']);}
}
