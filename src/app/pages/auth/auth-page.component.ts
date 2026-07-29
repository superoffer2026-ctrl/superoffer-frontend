import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService, PortalKey } from '../../core/auth-api.service';

@Component({
  selector:'app-auth-page', standalone:true, imports:[CommonModule,FormsModule,RouterLink],
  template:`
    <main class="auth-layout">
      <aside class="auth-aside">
        <a class="brand light-brand" routerLink="/"><span>S</span>SuperOffer</a>
        <div><span class="eyebrow light">{{portalLabel}} account</span>
          <h1>{{mode === 'login' ? 'Welcome back to your workspace.' : authTitle}}</h1>
          <p>{{authCopy}}</p>
          <ul><li *ngFor="let item of benefits">✓ {{item}}</li></ul>
        </div><small>Role-based access • Secure sessions • Privacy by design</small>
      </aside>
      <section class="auth-panel">
        <form (ngSubmit)="submit()" #authForm="ngForm">
          <a class="back-link" [routerLink]="['/', portal]">← Back to {{portalLabel}}</a>
          <span class="eyebrow">{{mode === 'login' ? 'Secure sign in' : 'Account registration'}}</span>
          <h2>{{mode === 'login' ? 'Log in to SuperOffer' : 'Create your account'}}</h2>
          <p>{{mode === 'login' ? 'Enter the details associated with your account.' : 'Use accurate information to create your role-specific access.'}}</p>
          <div class="form-grid" *ngIf="mode === 'register'">
            <label>Full name<input name="fullName" [(ngModel)]="form.fullName" required placeholder="Your full name"></label>
            <label>Phone number<input name="phone" [(ngModel)]="form.phone" placeholder="+91 00000 00000"></label>
            <label class="full">Official email<input name="email" type="email" [(ngModel)]="form.email" required placeholder="you@example.com"></label>
            <ng-container *ngIf="portal !== 'student'">
              <label class="full">Organisation legal name<input name="organization" [(ngModel)]="form.organization" required></label>
              <label>Registration number<input name="registrationNumber" [(ngModel)]="form.registrationNumber"></label>
              <label>Accreditation / licence reference<input name="license" [(ngModel)]="form.license"></label>
            </ng-container>
            <label class="full">Password<input name="password" type="password" [(ngModel)]="form.password" minlength="8" required placeholder="8+ characters with a letter and number"></label>
          </div>
          <div *ngIf="mode === 'login'">
            <label>Email address<input name="email" type="email" [(ngModel)]="form.email" required placeholder="you@example.com"></label>
            <label>Password<input name="password" type="password" [(ngModel)]="form.password" required placeholder="Enter your password"></label>
            <label class="remember"><input type="checkbox" name="remember" [(ngModel)]="form.remember"> Keep me signed in</label>
          </div>
          <p class="form-message success" *ngIf="message">{{message}}</p><p class="form-message error" *ngIf="error">{{error}}</p>
          <button type="submit" class="button primary wide-button" [disabled]="loading || authForm.invalid">{{loading ? 'Please wait…' : mode === 'login' ? 'Log in securely' : 'Create account'}}</button>
          <p class="switch">{{mode === 'login' ? 'New to SuperOffer?' : 'Already registered?'}}
            <a [routerLink]="['/auth', mode === 'login' ? 'register' : 'login', portal]">{{mode === 'login' ? 'Create an account' : 'Log in'}}</a></p>
        </form>
      </section>
    </main>
  `
})
export class AuthPageComponent implements OnInit {
  portal: PortalKey='student'; mode='login'; loading=false; error=''; message='';
  form={fullName:'',phone:'',email:'',organization:'',registrationNumber:'',license:'',password:'',remember:true};
  constructor(private route:ActivatedRoute,private router:Router,private api:AuthApiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){this.route.paramMap.subscribe(p=>{this.portal=(p.get('portal') as PortalKey)||'student';this.mode=p.get('mode')==='register'?'register':'login';this.error='';});}
  get portalLabel(){return this.portal[0].toUpperCase()+this.portal.slice(1);}
  get authTitle(){return this.portal==='student'?'Build your opportunity profile.':`Register your ${this.portal} securely.`;}
  get authCopy(){if(this.portal==='university')return 'Submit official university details for Super Admin verification before marketplace tools are unlocked.';if(this.portal==='bank')return 'Submit official lender and licence details for verification before finance tools are unlocked.';if(this.portal==='consultancy')return 'Submit business and certification details for verification before connecting with students.';return 'Create one structured profile and receive relevant education opportunities.';}
  get benefits(){return this.portal==='university'?['AI-ranked student discovery','Shortlists and admission offers','Programme-level funnel reporting']:this.portal==='bank'?['Creditworthy student discovery','Clear indicative loan offers','Conversion and funnel reporting']:this.portal==='consultancy'?['Intent-qualified student discovery','Consulting engagement offers','Client relationship tracking']:['Private verified profile','Comparable invitations and offers','Visibility controls'];}
  private role(){return this.portal==='student'?'STUDENT':this.portal==='university'?'UNIVERSITY_OFFICER':this.portal==='bank'?'LOAN_OFFICER':'CONSULTANT';}
  private async openPortal(session:any){
    const expected=this.role();
    if(session.role!==expected)throw new Error('This account belongs to a different SuperOffer portal.');
    localStorage.removeItem('superoffer_access_token');
    sessionStorage.removeItem('superoffer_access_token');
    (this.form.remember?localStorage:sessionStorage).setItem('superoffer_access_token',session.access_token);
    sessionStorage.setItem('superoffer_role',session.role);
    sessionStorage.setItem('superoffer_user',JSON.stringify({full_name:session.full_name,email:this.form.email,organization:session.organization}));
    await this.router.navigate(this.portal==='student'?['/student/dashboard']:['/portal',this.portal]);
  }
  async submit(){
    this.loading=true;this.error='';this.message='';
    try{
      if(this.mode==='register'){
        const result=await this.api.register({full_name:this.form.fullName,email:this.form.email,phone:this.form.phone,password:this.form.password,role:this.role(),...(this.portal!=='student'?{organization:{name:this.form.organization,registration_number:this.form.registrationNumber,license_reference:this.form.license}}:{})});
        if(!result.can_login){sessionStorage.setItem('superoffer_pending_user',result.user_id);this.message='Registration submitted. Your university must be approved before login.';return;}
        const session=await this.api.login(this.form.email,this.form.password);
        await this.openPortal(session);
        return;
      }
      const session=await this.api.login(this.form.email,this.form.password);
      await this.openPortal(session);
    }catch(e){
      const apiError=e as Error & {code?:string;status?:number;body?:any};
      if(this.mode==='register'&&(apiError.code==='EMAIL_ALREADY_REGISTERED'||apiError.status===409)){
        this.mode='login';
        this.form.password='';
        this.message='This email is already registered. Enter your existing password to log in.';
        this.error='';
      }else{
        this.error=e instanceof Error?e.message:'The request could not be completed.';
      }
    }finally{this.loading=false;this.cdr.detectChanges();}
  }
}
