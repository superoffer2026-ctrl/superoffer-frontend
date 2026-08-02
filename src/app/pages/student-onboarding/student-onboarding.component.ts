import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, Subscription } from 'rxjs';
import { OnboardingChipSelectComponent } from './onboarding-chip-select.component';
import { OnboardingUploadCardComponent } from './onboarding-upload-card.component';
import { StudentDocument, StudentProfileApiService } from '../../core/student-profile-api.service';
import { StudentProfileUiStore } from '../student-portal/student-profile-ui.store';

type StudyLevel = 'UG' | 'PG' | 'PHD';

@Component({
  selector: 'app-student-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, OnboardingChipSelectComponent, OnboardingUploadCardComponent],
  styleUrl: './student-onboarding.component.css',
  template: `
    <main class="onboarding-shell">
      <header>
        <a class="brand" routerLink="/"><img src="/superoffer-brand-mark.png" alt="SuperOffer"></a>
        <div class="progress-wrap" *ngIf="step<10">
          <div><span>Profile setup</span><strong>{{progress}}%</strong></div>
          <div class="progress"><i [style.width.%]="progress"></i></div>
        </div>
        <span class="save-state" *ngIf="step<10"><i></i> {{saving ? 'Saving…' : 'Saved securely'}}</span>
      </header>

      <section class="stage" [class.success-stage]="step===9">
        <aside *ngIf="step<10">
          <small>STEP {{step+1}} OF 10</small>
          <h1>{{titles[step]}}</h1>
          <p>{{descriptions[step]}}</p>
          <div class="time"><span>◷</span><b>About {{step===8 ? '1 minute' : '20 seconds'}}</b></div>
          <div class="step-dots" aria-label="Profile steps">
            <button *ngFor="let title of titles;let i=index" type="button" [class.active]="i===step" [class.done]="i<step" [disabled]="i>furthestStep" (click)="goTo(i)" [attr.aria-label]="title">{{stepLabel(i)}}</button>
          </div>
        </aside>

        <form *ngIf="step<10" class="step-card" [formGroup]="form" (ngSubmit)="next()" novalidate>
          <div class="step-motion" [attr.data-step]="step">
            <ng-container *ngIf="step===0" formGroupName="basic">
              <div class="field-grid">
                <label>First name<input formControlName="firstName" autocomplete="given-name" placeholder="Aarav"></label>
                <label>Last name<input formControlName="lastName" autocomplete="family-name" placeholder="Mehta"></label>
                <label class="wide">Email address<input formControlName="email" type="email" readonly aria-readonly="true"></label>
                <label>Mobile number<input formControlName="mobile" type="tel" autocomplete="tel" placeholder="+91 98765 43210"></label>
                <label>Date of birth<input formControlName="dateOfBirth" type="date"></label>
                <label>Country<select formControlName="country"><option value="">Choose your country</option><option *ngFor="let country of countries">{{country}}</option></select></label>
              </div>
            </ng-container>

            <ng-container *ngIf="step===1">
              <div class="level-grid">
                <button *ngFor="let item of levels" type="button" [class.selected]="studyLevel===item.value" (click)="chooseLevel(item.value)">
                  <span>{{item.icon}}</span><small>{{item.eyebrow}}</small><h2>{{item.title}}</h2><p>{{item.copy}}</p><i>{{studyLevel===item.value?'✓':'→'}}</i>
                </button>
              </div>
            </ng-container>

            <ng-container *ngIf="step===2" formGroupName="academic">
              <div class="path-label"><span>{{studyLevel}}</span>{{levelHeading}}</div>
              <div class="field-grid" *ngIf="studyLevel==='UG'">
                <label class="wide">School name<input formControlName="schoolName" placeholder="Your current school"></label>
                <label>Education board<select formControlName="board"><option value="">Choose board</option><option>CBSE</option><option>ICSE</option><option>State Board</option><option>IB</option><option>Cambridge</option><option>Other</option></select></label>
                <label>Current grade<select formControlName="currentGrade"><option value="">Choose grade</option><option>Grade 11</option><option>Grade 12</option><option>Completed Grade 12</option></select></label>
                <label>10th percentage / CGPA<input formControlName="tenthScore" placeholder="92% or 9.2 CGPA"></label>
                <label>12th / expected percentage<input formControlName="twelfthScore" placeholder="90% expected"></label>
                <label>Passing year<input formControlName="passingYear" type="number" placeholder="2027"></label>
              </div>
              <div class="field-grid" *ngIf="studyLevel==='PG'">
                <label>College name<input formControlName="collegeName" placeholder="Your college"></label><label>University<input formControlName="university" placeholder="Affiliating university"></label>
                <label>Degree<input formControlName="degree" placeholder="B.Tech"></label><label>Major<input formControlName="major" placeholder="Computer Science"></label>
                <label>Current year<select formControlName="currentYear"><option value="">Choose year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option><option>Graduated</option></select></label>
                <label>CGPA<input formControlName="cgpa" placeholder="8.7 / 10"></label><label>Graduation year<input formControlName="graduationYear" type="number" placeholder="2027"></label>
              </div>
              <div class="field-grid" *ngIf="studyLevel==='PHD'">
                <label>Bachelor's degree<input formControlName="bachelors" placeholder="BSc Biotechnology"></label><label>Master's degree<input formControlName="masters" placeholder="MSc Biotechnology"></label>
                <label>University<input formControlName="university" placeholder="Your university"></label><label>Specialization<input formControlName="specialization" placeholder="Molecular biology"></label>
                <label>Master's CGPA<input formControlName="mastersCgpa" placeholder="8.9 / 10"></label><label>Graduation year<input formControlName="graduationYear" type="number" placeholder="2026"></label>
                <label class="wide">Research interest<textarea formControlName="researchInterest" placeholder="What would you like to investigate?"></textarea></label>
              </div>
            </ng-container>

            <ng-container *ngIf="step===3" formGroupName="preferences">
              <div class="field-grid">
                <label class="wide">Preferred course<div class="search-field"><span>⌕</span><input formControlName="course" list="courses" placeholder="Search courses"></div><datalist id="courses"><option *ngFor="let course of courses">{{course}}</option></datalist></label>
                <label class="wide">Preferred countries <small>Choose up to four</small><so-chip-select label="Preferred countries" [options]="destinationCountries" [selected]="arrayValue('preferences','countries')" (selectedChange)="setArray('preferences','countries',$event,4)" /></label>
                <label class="wide">Preferred intake<so-chip-select label="Preferred intake" [single]="true" [options]="intakes" [selected]="arrayValue('preferences','intake')" (selectedChange)="setArray('preferences','intake',$event,1)" /></label>
              </div>
            </ng-container>

            <ng-container *ngIf="step===4">
              <div class="test-intro">Select every test you have completed. Choose “Not Yet” if you are still planning.</div>
              <so-chip-select label="Completed tests" [options]="tests" [selected]="selectedTests" (selectedChange)="updateTests($event)" />
              <div class="test-details" formGroupName="testDetails" *ngIf="selectedTests.length && !selectedTests.includes('Not Yet')">
                <div *ngFor="let test of selectedTests" [formGroupName]="test">
                  <strong>{{test}}</strong><label>Score<input formControlName="score" placeholder="Enter score"></label><label>Test date<input formControlName="date" type="date"></label>
                </div>
              </div>
              <div class="empty-note" *ngIf="selectedTests.includes('Not Yet')"><span>◎</span><div><b>No problem.</b><p>You can add test scores later from your profile.</p></div></div>
            </ng-container>

            <ng-container *ngIf="step===5" formGroupName="achievements">
              <label class="section-label">What are you proud of? <small>Select all that apply</small></label>
              <so-chip-select label="Achievements" [options]="achievementOptions" [selected]="arrayValue('achievements','selected')" [icons]="achievementIcons" (selectedChange)="setArray('achievements','selected',$event)" />
              <label class="story-field">Tell universities something unique about you <small>Optional · 240 characters</small><textarea formControlName="story" maxlength="240" placeholder="A project, experience or ambition that shaped you..."></textarea></label>
            </ng-container>

            <ng-container *ngIf="step===6">
              <div class="document-heading"><div><b>{{studyLevel}} document checklist</b><p>Files stay on this device for now. Nothing is uploaded.</p></div><span>{{fileCount}} added</span></div>
              <h3 class="group-title">Required</h3><div class="upload-grid"><so-upload-card *ngFor="let doc of requiredDocuments" [title]="doc" [required]="true" [file]="files[doc]" [document]="uploadedDocuments[doc]" (fileChange)="uploadFile(doc,$event)" (preview)="previewDocument($event)" (remove)="removeDocument($event)" /></div>
              <h3 class="group-title optional">Optional</h3><div class="upload-grid"><so-upload-card *ngFor="let doc of optionalDocuments" [title]="doc" [file]="files[doc]" [document]="uploadedDocuments[doc]" (fileChange)="uploadFile(doc,$event)" (preview)="previewDocument($event)" (remove)="removeDocument($event)" /></div>
            </ng-container>

            <ng-container *ngIf="step===7" formGroupName="financial">
              <div class="finance-intro"><span>◈</span><div><b>Only matching information</b><p>We never ask for bank account or card details.</p></div></div>
              <label class="section-label">How are you planning to fund your studies?</label>
              <so-chip-select label="Funding preference" [single]="true" [options]="fundingPreferences" [selected]="arrayValue('financial','fundingPreference')" (selectedChange)="setArray('financial','fundingPreference',$event,1)" />
              <div class="field-grid finance-grid">
                <label class="wide">Estimated annual budget<select formControlName="estimatedAnnualBudget"><option value="">Choose a comfortable range</option><option *ngFor="let budget of budgets">{{budget}}</option></select></label>
                <label class="toggle-row">Interested in scholarships?<button type="button" [class.yes]="controlValue('financial','interestedInScholarships')===true" (click)="setBoolean('interestedInScholarships',true)">Yes</button><button type="button" [class.no]="controlValue('financial','interestedInScholarships')===false" (click)="setBoolean('interestedInScholarships',false)">No</button></label>
                <label class="toggle-row">Prefer universities with lower tuition?<button type="button" [class.yes]="controlValue('financial','preferLowerTuition')===true" (click)="setBoolean('preferLowerTuition',true)">Yes</button><button type="button" [class.no]="controlValue('financial','preferLowerTuition')===false" (click)="setBoolean('preferLowerTuition',false)">No</button></label>
                <label class="toggle-row wide">Need financial assistance?<button type="button" [class.yes]="controlValue('financial','needFinancialAssistance')===true" (click)="setBoolean('needFinancialAssistance',true)">Yes</button><button type="button" [class.no]="controlValue('financial','needFinancialAssistance')===false" (click)="setBoolean('needFinancialAssistance',false)">No</button></label>
              </div>
            </ng-container>

            <ng-container *ngIf="step===8" formGroupName="links">
              <div class="link-stack">
                <label><span class="link-icon">in</span><div><b>LinkedIn</b><small>Show your education and experience</small></div><input formControlName="linkedin" type="url" placeholder="linkedin.com/in/yourname"></label>
                <label><span class="link-icon">⌘</span><div><b>GitHub</b><small>Share your code and projects</small></div><input formControlName="github" type="url" placeholder="github.com/yourname"></label>
                <label><span class="link-icon">↗</span><div><b>Portfolio</b><small>Your personal website or work</small></div><input formControlName="portfolio" type="url" placeholder="yourportfolio.com"></label>
              </div>
              <div class="optional-note">These links are optional. You can skip this step and add them later.</div>
            </ng-container>

            <ng-container *ngIf="step===9">
              <div class="review-top"><div class="review-avatar">{{initials}}</div><div><small>STUDENT PROFILE</small><h2>{{fullName || 'Your profile'}}</h2><p>{{studyLevel}} · {{controlValue('preferences','course') || 'Course preference'}}</p></div><span>Ready to publish</span></div>
              <div class="review-grid">
                <article><header><b>Basic information</b><button type="button" (click)="goTo(0)">Edit</button></header><p>{{fullName}}</p><p>{{controlValue('basic','email')}}</p><p>{{controlValue('basic','country')}}</p></article>
                <article><header><b>Study plan</b><button type="button" (click)="goTo(3)">Edit</button></header><p>{{studyLevel}} · {{controlValue('preferences','course')}}</p><p>{{arrayValue('preferences','countries').join(', ')}}</p><p>{{arrayValue('preferences','intake').join(', ')}}</p></article>
                <article><header><b>Academic background</b><button type="button" (click)="goTo(2)">Edit</button></header><p>{{academicSummary}}</p><p>{{academicScore}}</p></article>
                <article><header><b>Tests & achievements</b><button type="button" (click)="goTo(4)">Edit</button></header><div class="review-chips"><span *ngFor="let item of reviewHighlights">{{item}}</span></div></article>
                <article><header><b>Documents</b><button type="button" (click)="goTo(6)">Edit</button></header><p>{{fileCount}} document{{fileCount===1?'':'s'}} uploaded</p><p *ngFor="let document of uploadedDocumentList">{{document.fileName}}</p></article>
                <article><header><b>Financial preferences</b><button type="button" (click)="goTo(7)">Edit</button></header><p>{{arrayValue('financial','fundingPreference').join('')}}</p><p>{{controlValue('financial','estimatedAnnualBudget')}}</p></article>
                <article><header><b>Profile links</b><button type="button" (click)="goTo(8)">Edit</button></header><p>{{linksSummary}}</p></article>
              </div>
              <label class="consent"><input type="checkbox" [checked]="reviewConfirmed" (change)="reviewConfirmed=!reviewConfirmed"><span>I confirm these details are accurate and ready to be shown to verified universities.</span></label>
            </ng-container>
          </div>

          <div class="validation" *ngIf="errorMessage" role="alert">{{errorMessage}}</div>
          <footer>
            <button class="back" type="button" *ngIf="step>0" (click)="previous()">← Back</button>
            <button class="next" type="submit" [disabled]="saving">{{step===9?'Submit profile':'Continue'}} <span>→</span></button>
          </footer>
        </form>

        <div class="success-card" *ngIf="step===10">
          <div class="confetti"><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <span class="success-icon">✓</span><small>PROFILE COMPLETE</small>
          <h1>Your SuperOffer profile<br>is ready to be discovered.</h1>
          <p>Universities can now find you based on your academic profile, goals and study preferences.</p>
          <div class="success-summary"><span><b>{{studyLevel}}</b><small>Study level</small></span><span><b>{{arrayValue('preferences','countries').length}}</b><small>Destinations</small></span><span><b>{{fileCount}}</b><small>Documents ready</small></span></div>
          <button type="button" (click)="dashboard()">Go to Dashboard <span>→</span></button>
          <a href="#" (click)="step=9;$event.preventDefault()">Review profile again</a>
        </div>
      </section>
    </main>
  `
})
export class StudentOnboardingComponent implements OnDestroy {
  private readonly storageKey = 'superoffer_student_onboarding_v1';
  private readonly subscription: Subscription;
  step = 0;
  furthestStep = 0;
  errorMessage = '';
  saving = false;
  reviewConfirmed = false;
  files: Record<string, File> = {};
  uploadedDocuments: Record<string, StudentDocument> = {};
  readonly titles = ['Let’s start with you','What do you want to study next?','Tell us about your academics','Where would you like to go?','Tests you have completed','What makes you stand out?','Add your documents','Plan your study finances','Share your work online','Everything look right?'];
  readonly descriptions = ['A few basics so universities know who they are meeting.','Your answer personalises every question that follows.','We only ask questions relevant to your chosen study level.','Choose the course, destinations and intake that excite you.','Scores help us find programmes where you are a strong fit.','Universities look beyond marks. Show them what drives you.','A simple checklist—add what you have and continue anytime.','Share only what helps us match affordability and funding options.','Optional links help universities see more of your work.','Review your profile before making it discoverable.'];
  readonly countries = ['India','United Arab Emirates','Bangladesh','Sri Lanka','Nepal','Nigeria','Kenya','Singapore','Malaysia','Other'];
  readonly destinationCountries = ['United Kingdom','United States','Canada','Australia','Germany','Ireland','France','Netherlands','New Zealand','Singapore'];
  readonly intakes = ['Fall 2027','Spring 2028','Summer 2028','Fall 2028','Not sure yet'];
  readonly courses = ['Computer Science','Data Science','Artificial Intelligence','Business Analytics','Mechanical Engineering','Biotechnology','Finance','Marketing','Psychology','Public Health','Architecture','Design'];
  readonly tests = ['IELTS','TOEFL','PTE','Duolingo','SAT','GRE','GMAT','Not Yet'];
  readonly fundingPreferences = ['Self Funded','Scholarship','Education Loan','Family Sponsored','Combination','Not Sure Yet'];
  readonly budgets = ['Below USD 10,000','USD 10,000–20,000','USD 20,000–30,000','USD 30,000–50,000','Above USD 50,000'];
  readonly achievementOptions = ['Sports','Coding','Robotics','Olympiads','Hackathons','Music','Dance','Leadership','Public Speaking','Volunteering','Entrepreneurship'];
  readonly achievementIcons: Record<string,string> = {Sports:'◉',Coding:'⌘',Robotics:'◇',Olympiads:'★',Hackathons:'⚡',Music:'♫',Dance:'♪',Leadership:'◆','Public Speaking':'◌',Volunteering:'♡',Entrepreneurship:'↗'};
  readonly levels: Array<{value:StudyLevel;icon:string;eyebrow:string;title:string;copy:string}> = [
    {value:'UG',icon:'🎓',eyebrow:'AFTER HIGH SCHOOL',title:'Undergraduate',copy:'Bachelor’s degree programmes'},
    {value:'PG',icon:'◫',eyebrow:'AFTER BACHELOR’S',title:'Postgraduate',copy:'Master’s and graduate programmes'},
    {value:'PHD',icon:'◎',eyebrow:'AFTER MASTER’S',title:'PhD',copy:'Doctoral and research programmes'}
  ];

  readonly form: FormGroup;

  constructor(private fb: FormBuilder, private router: Router, private api: StudentProfileApiService, private store: StudentProfileUiStore) {
    const user = JSON.parse(sessionStorage.getItem('superoffer_user') || '{}');
    const names = String(user.full_name || '').split(' ');
    this.form = this.fb.group({
      basic: this.fb.group({firstName:names[0]||'',lastName:names.slice(1).join(' '),email:user.email||'',mobile:'',dateOfBirth:'',country:''}),
      studyLevel: 'UG',
      academic: this.fb.group({schoolName:'',board:'',currentGrade:'',tenthScore:'',twelfthScore:'',passingYear:'',collegeName:'',university:'',degree:'',major:'',currentYear:'',cgpa:'',graduationYear:'',bachelors:'',masters:'',specialization:'',mastersCgpa:'',researchInterest:''}),
      preferences: this.fb.group({course:'',countries:[[]],intake:[[]]}),
      selectedTests: [[]],
      testDetails: this.fb.group(Object.fromEntries(this.tests.filter(t=>t!=='Not Yet').map(t=>[t,this.fb.group({score:'',date:''})]))),
      achievements: this.fb.group({selected:[[]],story:''}),
      financial: this.fb.group({fundingPreference:[[]],estimatedAnnualBudget:'',interestedInScholarships:null,preferLowerTuition:null,needFinancialAssistance:null}),
      links: this.fb.group({linkedin:'',github:'',portfolio:''})
    });
    const saved = localStorage.getItem(this.storageKey);
    if (saved) { try { const value=JSON.parse(saved); this.form.patchValue(value.form); this.step=Math.min(value.step||0,9); this.furthestStep=value.furthestStep||this.step; } catch {} }
    this.syncProfileToStore();
    this.subscription = this.form.valueChanges.pipe(debounceTime(250)).subscribe(()=>this.save());
    void this.hydrate();
  }

  get progress(){ return Math.round(((this.step+1)/10)*100); }
  get studyLevel(){ return this.form.get('studyLevel')?.value as StudyLevel || ''; }
  get selectedTests(){ return this.form.get('selectedTests')?.value as string[] || []; }
  get levelHeading(){ return this.studyLevel==='UG'?'School academic record':this.studyLevel==='PG'?'Bachelor’s academic record':'Research preparation'; }
  get requiredDocuments(){ return this.studyLevel==='UG'?['10th Mark Sheet','12th Mark Sheet / Latest Marks']:this.studyLevel==='PG'?['10th Mark Sheet','12th Mark Sheet','Undergraduate Transcript / Consolidated Mark Sheet']:["Bachelor's Transcript","Master's Transcript"]; }
  get optionalDocuments(){ return this.studyLevel==='UG'?['IELTS / TOEFL / PTE / Duolingo Score Report','SAT Score Report','Achievement Certificates','Sports Certificates','Olympiad Certificates','Coding / Hackathon Certificates','Passport']:this.studyLevel==='PG'?['Degree Certificate','Resume / CV','IELTS / TOEFL / PTE','GRE / GMAT','Certificates','Passport']:['Degree Certificates','Research Papers','Publications','Resume / CV','IELTS / TOEFL','GRE','Passport']; }
  get fileCount(){ return Object.keys(this.uploadedDocuments).length; }
  get uploadedDocumentList(){ return Object.values(this.uploadedDocuments); }
  get fullName(){ return `${this.controlValue('basic','firstName')} ${this.controlValue('basic','lastName')}`.trim(); }
  get initials(){ return this.fullName.split(' ').map((v:string)=>v[0]).slice(0,2).join('').toUpperCase() || 'SO'; }
  get academicSummary(){ const a=this.form.get('academic')?.value; return this.studyLevel==='UG'?`${a.schoolName} · ${a.board}`:this.studyLevel==='PG'?`${a.degree} in ${a.major}`:`${a.masters} · ${a.specialization}`; }
  get academicScore(){ const a=this.form.get('academic')?.value; return this.studyLevel==='UG'?a.twelfthScore:this.studyLevel==='PG'?a.cgpa:a.mastersCgpa; }
  get reviewHighlights(){ return [...this.selectedTests,...this.arrayValue('achievements','selected')].slice(0,6); }
  get linksSummary(){ const values=Object.values(this.form.get('links')?.value||{}).filter(Boolean); return values.length?`${values.length} link${values.length===1?'':'s'} added`:'No links added'; }

  stepLabel(index:number){ return index < this.step ? '✓' : String(index + 1); }
  chooseLevel(level:StudyLevel){ this.form.get('studyLevel')?.setValue(level); }
  arrayValue(group:string,control:string){ return (this.form.get(`${group}.${control}`)?.value || []) as string[]; }
  controlValue(group:string,control:string){ return this.form.get(`${group}.${control}`)?.value ?? ''; }
  setArray(group:string,control:string,value:string[],max=99){ this.form.get(`${group}.${control}`)?.setValue(value.slice(-max)); }
  setBoolean(control:string,value:boolean){ this.form.get(`financial.${control}`)?.setValue(value); }
  updateTests(value:string[]){ const next=value.includes('Not Yet')?['Not Yet']:value.filter(v=>v!=='Not Yet'); this.form.get('selectedTests')?.setValue(next); }
  goTo(index:number){ if(index<=this.furthestStep){this.step=index;this.errorMessage='';scrollTo({top:0,behavior:'smooth'});} }
  previous(){ if(this.step>0){this.step--;this.save();scrollTo({top:0,behavior:'smooth'});} }
  async next(){
    this.errorMessage='';
    const error=this.validateStep();
    if(error){this.errorMessage=error;return;}
    this.saving=true;
    try {
      const {financial: _financial, ...profilePayload}=this.form.getRawValue();
      await this.api.updateProfile(profilePayload);
      if(this.step===7) await this.api.saveFinancial(this.financialPayload());
      this.syncProfileToStore();
      if(this.step===9){ await this.api.submit();this.step=10;localStorage.removeItem(this.storageKey); }
      else {this.step++;this.furthestStep=Math.max(this.furthestStep,this.step);this.save();}
      scrollTo({top:0,behavior:'smooth'});
    } catch(error) { this.errorMessage=error instanceof Error?error.message:'The profile could not be saved.'; }
    finally { this.saving=false; }
  }
  dashboard(){ this.router.navigate(['/student/dashboard']); }
  ngOnDestroy(){ this.subscription.unsubscribe(); }
  private save(){ if(this.step<10)localStorage.setItem(this.storageKey,JSON.stringify({form:this.form.getRawValue(),step:this.step,furthestStep:this.furthestStep})); }
  private missing(paths:string[]){ return paths.some(path=>!String(this.form.get(path)?.value||'').trim()); }
  private validateStep(){
    if(this.step===0&&this.missing(['basic.firstName','basic.lastName','basic.email','basic.mobile','basic.dateOfBirth','basic.country']))return 'Please complete all basic information fields.';
    if(this.step===1&&!this.studyLevel)return 'Choose the study level you are planning next.';
    if(this.step===3&&(!this.controlValue('preferences','course')||!this.arrayValue('preferences','countries').length||!this.arrayValue('preferences','intake').length))return 'Choose a course, at least one country, and an intake.';
    if(this.step===4&&!this.selectedTests.length)return 'Choose a completed test or select “Not Yet”.';
    if(this.step===6&&this.requiredDocuments.some(doc=>!this.uploadedDocuments[doc]))return 'Upload every required document before continuing.';
    if(this.step===7&&(!this.arrayValue('financial','fundingPreference').length||!this.controlValue('financial','estimatedAnnualBudget')||['interestedInScholarships','preferLowerTuition','needFinancialAssistance'].some(control=>this.controlValue('financial',control)===null)))return 'Complete the financial preferences to continue.';
    if(this.step===9&&!this.reviewConfirmed)return 'Please confirm that your profile details are accurate.';
    return '';
  }

  async uploadFile(documentType:string,file:File){
    this.errorMessage='';
    if(!['application/pdf','image/jpeg','image/png'].includes(file.type)){this.errorMessage='Only PDF, JPG, JPEG, and PNG files are allowed.';return;}
    if(file.size>10*1024*1024){this.errorMessage='Documents must be 10 MB or smaller.';return;}
    this.files[documentType]=file;this.saving=true;
    try {
      const existing=this.uploadedDocuments[documentType];
      const document=existing?await this.api.replaceDocument(existing.id,file):await this.api.uploadDocument(documentType,file);
      this.uploadedDocuments[documentType]=document;
    } catch(error){delete this.files[documentType];this.errorMessage=error instanceof Error?error.message:'The document could not be uploaded.';}
    finally{this.saving=false;}
  }
  async removeDocument(document:StudentDocument){
    this.saving=true;this.errorMessage='';
    try{await this.api.deleteDocument(document.id);delete this.uploadedDocuments[document.documentType];delete this.files[document.documentType];}
    catch(error){this.errorMessage=error instanceof Error?error.message:'The document could not be removed.';}
    finally{this.saving=false;}
  }
  async previewDocument(document:StudentDocument){
    try{const url=await this.api.previewDocument(document.id);window.open(url,'_blank','noopener,noreferrer');setTimeout(()=>URL.revokeObjectURL(url),60_000);}
    catch(error){this.errorMessage=error instanceof Error?error.message:'The document could not be opened.';}
  }
  private financialPayload(){
    const value=this.form.get('financial')?.value;
    return {...value,fundingPreference:value.fundingPreference?.[0]||''};
  }
  private syncProfileToStore(){
    const values=this.store.values;
    const basic=this.form.get('basic')?.value;
    if(basic){
      values['fullName']=`${basic.firstName||''} ${basic.lastName||''}`.trim()||values['fullName'];
      values['email']=basic.email||values['email'];
      values['phone']=basic.mobile||values['phone'];
      values['location']=basic.country||values['location'];
    }
    const academic=this.form.get('academic')?.value;
    if(academic){
      if(this.studyLevel==='UG'){
        values['institution']=academic.schoolName||values['institution'];
        values['qualification']=academic.board?`Grade ${academic.currentGrade||''} · ${academic.board}`.trim():values['qualification'];
        values['score']=academic.twelfthScore||academic.tenthScore||values['score'];
        values['graduationYear']=academic.passingYear||values['graduationYear'];
      } else if(this.studyLevel==='PG'){
        values['institution']=academic.collegeName||values['institution'];
        values['qualification']=academic.degree?`${academic.degree} ${academic.major||''}`.trim():values['qualification'];
        values['score']=academic.cgpa||values['score'];
        values['graduationYear']=academic.graduationYear||values['graduationYear'];
      } else if(this.studyLevel==='PHD'){
        values['institution']=academic.university||values['institution'];
        values['qualification']=academic.masters?`PhD · ${academic.specialization||''}`.trim():values['qualification'];
        values['score']=academic.mastersCgpa||values['score'];
        values['graduationYear']=academic.graduationYear||values['graduationYear'];
      }
    }
    const preferences=this.form.get('preferences')?.value;
    if(preferences){
      values['fieldOfInterest']=preferences.course||values['fieldOfInterest'];
      values['countries']=(preferences.countries||[]).join(', ')||values['countries'];
      values['intake']=(preferences.intake||[]).join(', ')||values['intake'];
    }
    values['studyLevel']=this.studyLevel;
  }
  private async hydrate(){
    try{
      const profile=await this.api.getProfile();
      if(profile?.studyLevel){
        const hydrated={...profile,financial:profile.financial?{...profile.financial,fundingPreference:[profile.financial.fundingPreference]}:undefined};
        this.form.patchValue(hydrated,{emitEvent:false});
      }
      for(const document of profile?.documents||[])this.uploadedDocuments[document.documentType]=document;
    }catch(error){this.errorMessage=error instanceof Error?error.message:'The saved profile could not be loaded.';}
  }
}
