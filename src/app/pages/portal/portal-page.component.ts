import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthApiService } from '../../core/auth-api.service';

@Component({
  selector:'app-portal-page',standalone:true,imports:[CommonModule,RouterLink],
  template:`
    <main class="workspace">
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
  portal='student';cards:any[]=[];user:any=null;error='';
  constructor(private route:ActivatedRoute,private router:Router,private api:AuthApiService){}
  async ngOnInit(){this.portal=this.route.snapshot.paramMap.get('portal')||'student';const token=localStorage.getItem('superoffer_access_token')||sessionStorage.getItem('superoffer_access_token');if(!token){await this.router.navigate(['/auth/login',this.portal]);return;}try{this.user=await this.api.currentUser(token);if(this.portal==='student'){const [profile,offers]=await Promise.all([this.api.studentProfile(token),this.api.studentOffers(token)]);this.cards=[{icon:'◎',title:profile.program||'Complete your profile',text:`Profile completion: ${profile.completion_percent||0}%`},{icon:'▣',title:`${offers.total_results||0} offers`,text:'Opportunities loaded from the SuperOffer backend.'},{icon:'⇄',title:'My account',text:this.user.email}];}else this.cards=this.portal==='university'?[{icon:'⌕',title:'Search students',text:'Discover suitable, visible student profiles.'},{icon:'▤',title:'Shortlists',text:'Organise qualified candidates.'},{icon:'↗',title:'Invitations',text:'Create clear admission offers.'}]:this.portal==='bank'?[{icon:'⌕',title:'Student discovery',text:'Find matching finance candidates.'},{icon:'▤',title:'Loan products',text:'Prepare responsible indicative offers.'},{icon:'↗',title:'Invitations',text:'Track finance offer outcomes.'}]:[{icon:'⌕',title:'Student discovery',text:'Find students with genuine study-abroad intent.'},{icon:'▤',title:'Client pipeline',text:'Track consulting opportunities.'},{icon:'↗',title:'Engagements',text:'Guide accepted student clients.'}];}catch(e){this.error=e instanceof Error?e.message:'Could not load portal data.';}}
  logout(){localStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_access_token');sessionStorage.removeItem('superoffer_role');this.router.navigate(['/']);}
}
