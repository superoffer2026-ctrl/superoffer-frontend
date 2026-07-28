import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../core/auth-api.service';
import { StudentOfferInboxComponent } from './student-offer-inbox.component';
import { StudentProfileOnboardingComponent } from './student-profile-onboarding.component';

@Component({
  selector:'app-portal-page',standalone:true,imports:[CommonModule,RouterLink,StudentOfferInboxComponent,StudentProfileOnboardingComponent],
  template:`
    <app-student-profile-onboarding *ngIf="portal==='student' && showStudentProfile" [profile]="studentProfileData"
      [token]="token" (completed)="profileCompleted($event)" (offersRequested)="showStudentProfile=false" (signedOut)="logout()" />
    <app-student-offer-inbox *ngIf="portal==='student' && !showStudentProfile" [user]="user" [error]="error"
      [backendOffers]="studentOfferData" (editProfile)="showStudentProfile=true" (signedOut)="logout()" />
    <main class="workspace" *ngIf="portal!=='student'">
      <aside><a class="brand light-brand" routerLink="/"><span>S</span>SuperOffer</a>
        <nav><a class="active">Overview</a><a>Profile</a><a>Activity</a><a>Reports</a><a>Settings</a></nav>
        <button (click)="logout()">Sign out</button>
      </aside>
      <section><header><div><span class="eyebrow">{{portal}} portal</span><h1>Welcome{{user?.full_name ? ', ' + user.full_name : ''}}.</h1></div><span class="account-pill">Account active</span></header>
        <p class="form-message error" *ngIf="error">{{error}}</p>
        <div class="workspace-banner"><div><small>AUTHENTICATION MODULE</small><h2>Your secure {{portal}} portal is connected.</h2><p>Registration, role validation, login, and portal routing are working. Detailed portal tools will be developed module by module.</p></div><b>✓</b></div>
        <div class="workspace-cards"><article *ngFor="let item of cards"><span>{{item.icon}}</span><h3>{{item.title}}</h3><p>{{item.text}}</p></article></div>
      </section>
    </main>
  `
})
export class PortalPageComponent implements OnInit{
  portal='student';cards:any[]=[];studentOfferData:any[]=[];studentProfileData:any=null;showStudentProfile=true;user:any=null;error='';token='';
  constructor(private route:ActivatedRoute,private router:Router,private api:AuthApiService){}
  async ngOnInit(){this.portal=this.route.snapshot.paramMap.get('portal')||'student';this.token=localStorage.getItem('superoffer_access_token')||sessionStorage.getItem('superoffer_access_token')||'';if(!this.token){await this.router.navigate(['/auth/login',this.portal]);return;}try{this.user=await this.api.currentUser(this.token);if(this.portal==='student'){this.studentProfileData=await this.api.studentProfile(this.token);this.showStudentProfile=!this.studentProfileData.profile_complete;if(!this.showStudentProfile)await this.loadStudentOffers();}else this.cards=this.portal==='university'?[{icon:'⌕',title:'Search students',text:'Discover suitable, visible student profiles.'},{icon:'▤',title:'Shortlists',text:'Organise qualified candidates.'},{icon:'↗',title:'Invitations',text:'Create clear admission offers.'}]:this.portal==='bank'?[{icon:'⌕',title:'Student discovery',text:'Find matching finance candidates.'},{icon:'▤',title:'Loan products',text:'Prepare responsible indicative offers.'},{icon:'↗',title:'Invitations',text:'Track finance offer outcomes.'}]:[{icon:'⌕',title:'Student discovery',text:'Find students with genuine study-abroad intent.'},{icon:'▤',title:'Client pipeline',text:'Track consulting opportunities.'},{icon:'↗',title:'Engagements',text:'Guide accepted student clients.'}];}catch(e){this.error=e instanceof Error?e.message:'Could not load portal data.';}}
  async loadStudentOffers(){const offers=await this.api.studentOffers(this.token);this.studentOfferData=offers.results||offers.offers||[];}
  async profileCompleted(profile:any){this.studentProfileData=profile;await this.loadStudentOffers();this.showStudentProfile=false;}
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_role');this.router.navigate(['/']);}
}
