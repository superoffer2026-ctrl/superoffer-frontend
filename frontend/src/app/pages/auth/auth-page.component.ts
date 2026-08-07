import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService, PortalKey } from '../../core/auth-api.service';
import { ORG_TYPE_OPTIONS, OrganizationType, lookupOrganizationType, organizationRole, rememberOrganizationType } from '../../core/organization.models';

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
        <form (ngSubmit)="onFormSubmit()" #authForm="ngForm">
          <a class="back-link" [routerLink]="['/', portal]">← Back to {{portalLabel}}</a>
          <span class="eyebrow">{{mode === 'login' ? 'Secure sign in' : 'Account registration'}}</span>
          <h2>{{mode === 'login' ? 'Log in to SuperOffer' : 'Create your account'}}</h2>
          <p>{{mode === 'login' ? 'Enter the details associated with your account.' : 'Use accurate information to create your role-specific access.'}}</p>

          <div class="form-grid" *ngIf="mode === 'register' && portal === 'organization'">
            <label class="full">Organization name<input name="organization" [(ngModel)]="form.organization" required placeholder="Your organization's legal name"></label>
            <label>Organization type<select name="orgType" [(ngModel)]="form.orgType" required><option *ngFor="let opt of orgTypeOptions" [value]="opt.value">{{opt.label}}</option></select></label>
            <label>Country<input name="country" [(ngModel)]="form.country" required placeholder="Country"></label>
            <label class="full">Official email<input name="email" type="email" [(ngModel)]="form.email" required placeholder="you@example.com"></label>
            <label>Phone number<input name="phone" [(ngModel)]="form.phone" required placeholder="+91 00000 00000"></label>
            <label>Password<input name="password" type="password" [(ngModel)]="form.password" minlength="8" required placeholder="8+ characters with a letter and number"></label>
            <label>Confirm password<input name="confirmPassword" type="password" [(ngModel)]="form.confirmPassword" minlength="8" required placeholder="Re-enter your password"></label>
          </div>

          <div class="form-grid" *ngIf="mode === 'register' && portal !== 'organization' && portal !== 'student'">
            <label>Full name<input name="fullName" [(ngModel)]="form.fullName" required placeholder="Your full name"></label>
            <label>Phone number<input name="phone" [(ngModel)]="form.phone" placeholder="+91 00000 00000"></label>
            <label class="full">Official email<input name="email" type="email" [(ngModel)]="form.email" required placeholder="you@example.com"></label>
            <label class="full">Organisation legal name<input name="organization" [(ngModel)]="form.organization" required></label>
            <label>Registration number<input name="registrationNumber" [(ngModel)]="form.registrationNumber"></label>
            <label>Accreditation / licence reference<input name="license" [(ngModel)]="form.license"></label>
            <label class="full">Password<input name="password" type="password" [(ngModel)]="form.password" minlength="8" required placeholder="8+ characters with a letter and number"></label>
          </div>

          <div *ngIf="mode === 'login' && portal !== 'student'">
            <label>Email address<input name="email" type="email" [(ngModel)]="form.email" required placeholder="you@example.com"></label>
            <label>Password<input name="password" type="password" [(ngModel)]="form.password" required placeholder="Enter your password"></label>
            <label class="remember"><input type="checkbox" name="remember" [(ngModel)]="form.remember"> Keep me signed in</label>
          </div>

          <div class="form-grid" *ngIf="portal === 'student'">
            <ng-container *ngIf="otpStep === 'phone'">
              <label class="full" *ngIf="mode === 'register'">Full name<input name="fullName" [(ngModel)]="form.fullName" required placeholder="Your full name"></label>
              <label class="full">Mobile number
                <div class="phone-input-row">
                  <select name="mobileCountry" [(ngModel)]="form.mobileCountry" required>
                    <option value="+91">+91 IN</option>
                    <option value="+1">+1 US</option>
                    <option value="+44">+44 UK</option>
                    <option value="+971">+971 AE</option>
                    <option value="+61">+61 AU</option>
                  </select>
                  <input name="mobileNumber" type="tel" inputmode="numeric" [(ngModel)]="form.mobileNumber" required minlength="7" placeholder="98765 43210">
                </div>
              </label>
              <p class="form-message success full">We'll send a one-time code to this number on WhatsApp.</p>
            </ng-container>
            <ng-container *ngIf="otpStep === 'code'">
              <label class="full">Verification code<input name="otpCode" inputmode="numeric" [(ngModel)]="form.otpCode" required minlength="6" maxlength="6" placeholder="6-digit code"></label>
              <p class="form-message success full">Enter the code we sent to {{form.mobileCountry}} {{form.mobileNumber}} on WhatsApp.</p>
              <a class="back-link" (click)="backToPhone()">← Use a different number</a>
            </ng-container>
          </div>

          <p class="form-message success" *ngIf="message">{{message}}</p><p class="form-message error" *ngIf="error">{{error}}</p>
          <button type="submit" class="button primary wide-button" [disabled]="loading || authForm.invalid">{{loading ? 'Please wait…' : buttonLabel}}</button>
          <p class="switch">{{mode === 'login' ? 'New to SuperOffer?' : 'Already registered?'}}
            <a [routerLink]="['/auth', mode === 'login' ? 'register' : 'login', portal]">{{mode === 'login' ? 'Create an account' : 'Log in'}}</a></p>
        </form>
      </section>
    </main>
  `
})
export class AuthPageComponent implements OnInit {
  portal: PortalKey='student'; mode='login'; loading=false; error=''; message='';
  otpStep: 'phone'|'code' = 'phone';
  orgTypeOptions = ORG_TYPE_OPTIONS;
  form={fullName:'',phone:'',email:'',organization:'',registrationNumber:'',license:'',password:'',confirmPassword:'',orgType:'UNIVERSITY' as OrganizationType,country:'',remember:true,mobileCountry:'+91',mobileNumber:'',otpCode:''};
  constructor(private route:ActivatedRoute,private router:Router,private api:AuthApiService,private cdr:ChangeDetectorRef){}
  ngOnInit(){this.route.paramMap.subscribe(p=>{this.portal=(p.get('portal') as PortalKey)||'student';this.mode=p.get('mode')==='register'?'register':'login';this.error='';this.message='';this.otpStep='phone';});}
  get buttonLabel(){
    if(this.portal==='student')return this.otpStep==='phone'?'Send OTP via WhatsApp':'Verify & continue';
    return this.mode==='login'?'Log in securely':'Create account';
  }
  get portalLabel(){return this.portal[0].toUpperCase()+this.portal.slice(1);}
  get authTitle(){return this.portal==='student'?'Build your opportunity profile.':`Register your ${this.portal} securely.`;}
  get authCopy(){
    if(this.portal==='organization'){
      if(this.mode==='register'&&this.form.orgType==='BANK')return 'Submit official lender and licence details for verification before finance tools are unlocked.';
      if(this.mode==='register')return 'Submit official organization details for Super Admin verification before marketplace tools are unlocked.';
      return 'Log in to your verified university or bank workspace.';
    }
    if(this.portal==='consultancy')return 'Submit business and certification details for verification before connecting with students.';
    return 'Create one structured profile and receive relevant education opportunities.';
  }
  get benefits(){
    if(this.portal==='organization'){
      return this.mode==='register'&&this.form.orgType==='BANK'
        ?['Creditworthy student discovery','Clear indicative loan offers','Conversion and funnel reporting']
        :['AI-ranked student discovery','Shortlists and admission offers','Programme-level funnel reporting'];
    }
    return this.portal==='consultancy'?['Intent-qualified student discovery','Consulting engagement offers','Client relationship tracking']:['Private verified profile','Comparable invitations and offers','Visibility controls'];
  }
  private role(){
    if(this.portal==='student')return 'STUDENT';
    if(this.portal==='consultancy')return 'CONSULTANT';
    const orgType = this.mode==='register' ? this.form.orgType : lookupOrganizationType(this.form.email);
    return organizationRole(orgType);
  }
  private async openPortal(session:any){
    localStorage.removeItem('superoffer_access_token');
    sessionStorage.removeItem('superoffer_access_token');
    (this.form.remember?localStorage:sessionStorage).setItem('superoffer_access_token',session.access_token);
    sessionStorage.setItem('superoffer_role',session.role);
    const mobile=this.portal==='student'?`${this.form.mobileCountry} ${this.form.mobileNumber}`:undefined;
    sessionStorage.setItem('superoffer_user',JSON.stringify({full_name:session.full_name,email:this.form.email||undefined,mobile,organization:session.organization}));
    if(this.portal==='organization'){
      const orgType = this.mode==='register' ? this.form.orgType : lookupOrganizationType(this.form.email);
      rememberOrganizationType(this.form.email, orgType);
      sessionStorage.setItem('superoffer_org_type', orgType);
      await this.router.navigate(['/organization/dashboard']);
      return;
    }
    const studentDestination = this.mode === 'register' ? ['/student/onboarding'] : ['/student/dashboard'];
    await this.router.navigate(this.portal==='student'?studentDestination:['/portal',this.portal]);
  }
  onFormSubmit(){
    this.submit();
  }
  async submit(){
    this.loading=true;this.error='';this.message='';
    try{
      if(this.portal==='student'){ await this.submitStudent(); }
      else if(this.mode==='register'){ await this.submitOrganizationRegister(); }
      else { await this.submitLogin(); }
    }catch(e){
      this.error=this.friendlyError(e);
    }
    this.loading=false;
    this.cdr.detectChanges();
  }
  private async submitStudent(){
    const digits=this.form.mobileNumber.replace(/\D/g,'');
    if(digits.length<7){this.error='Enter a valid mobile number.';return;}
    const phone=`${this.form.mobileCountry}${digits}`;
    if(this.otpStep==='phone'){
      await this.api.requestOtp(phone,this.form.fullName||undefined);
      this.otpStep='code';
      this.message='Code sent! Check WhatsApp on this number.';
      return;
    }
    const session=await this.api.verifyOtp(phone,this.form.otpCode.trim());
    await this.openPortal(session);
  }
  private async submitOrganizationRegister(){
    if(this.portal==='organization'&&this.form.password!==this.form.confirmPassword){
      this.error='Passwords do not match.';return;
    }
    const role=this.role();
    const organization=this.portal==='organization'
      ? { name:this.form.organization, country:this.form.country }
      : { name:this.form.organization, registrationNumber:this.form.registrationNumber||undefined, licenseReference:this.form.license||undefined };
    await this.api.register({
      email:this.form.email,
      password:this.form.password,
      phone:this.form.phone||undefined,
      fullName:this.form.fullName||undefined,
      role,
      organization
    });
    this.message='Registration submitted! Our Super Admin team will review your details and notify you once verified.';
    await this.router.navigate(['/auth','login',this.portal]);
  }
  private async submitLogin(){
    const session=await this.api.login(this.form.email,this.form.password);
    const expectedRoles=this.portal==='consultancy'?['CONSULTANT']:['UNIVERSITY_OFFICER','LOAN_OFFICER'];
    if(!expectedRoles.includes(session.role)){
      throw new Error('This account belongs to a different SuperOffer portal.');
    }
    await this.openPortal(session);
  }
  backToPhone(){
    this.otpStep='phone';this.form.otpCode='';this.error='';this.message='';
  }
  private friendlyError(e:unknown):string{
    const err=e as Error & { code?:string; body?:any };
    if(err?.code==='ACCOUNT_PENDING_APPROVAL')return "Your organisation is still under review. We'll notify you once it's approved.";
    if(err?.code==='ACCOUNT_LOCKED')return `Too many attempts. Try again in ${err.body?.retry_after_seconds||900} seconds.`;
    return err instanceof Error?err.message:'Could not complete the request.';
  }
}
