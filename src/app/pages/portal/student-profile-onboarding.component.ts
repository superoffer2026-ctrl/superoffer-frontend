import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-profile-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['../../onboarding-typography.css'],
  styles: [`
    :host{--green:#087a50;--green-soft:#eaf6f0;--ink:#172019;--line:#dfe6e1;--muted:#6d7972;display:block;min-height:100vh;background:#fff;color:var(--ink);font-family:"DM Sans",sans-serif}
    .student-head{height:64px;padding:0 28px;display:flex;align-items:center;border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:9px;font-size:19px;font-weight:900}.brand span{width:29px;height:29px;display:grid;place-items:center;border-radius:8px;background:#102f45;color:#68d1b4}.head-actions{margin-left:auto;display:flex;align-items:center;gap:16px}.preview-pill{padding:6px 10px;border-radius:99px;background:#fff6db;color:#795b00;font-size:10px;font-weight:900}.head-actions button{border:0;background:none;color:#5f6d65;font-weight:800;cursor:pointer}
    .content.onboarding{height:calc(100vh - 64px);overflow:hidden}.onboarding-top{display:flex;justify-content:space-between;align-items:center}.progress-summary{width:240px;text-align:right}.progress-summary strong,.progress-summary small{display:block}.progress-summary span{height:6px;background:#dfe8e3;display:block;border-radius:99px;margin:6px 0;overflow:hidden}.progress-summary i{display:block;height:100%;background:var(--green)}
    .form-title{margin-bottom:20px}.form-title>span{color:var(--green);font-size:10px;font-weight:900;letter-spacing:.12em}.form-title h2{font-size:25px;margin:6px 0}.form-title p{color:var(--muted);margin:0;max-width:720px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px 20px}.wide{grid-column:1/-1}label{display:flex;flex-direction:column;gap:7px;font-weight:800;font-size:12px}input,select,textarea{border:1px solid #cbd8d0;border-radius:9px;padding:12px;font:inherit;background:#fff}input:focus,select:focus,textarea:focus{outline:3px solid #dff2e8;border-color:var(--green)}textarea{min-height:92px;resize:vertical}.field-help{font-size:10px;color:var(--muted);font-weight:500}.check{flex-direction:row;align-items:center}.check input{width:18px;height:18px}
    .photo-builder{display:grid;grid-template-columns:150px 1fr;gap:24px;align-items:center;padding:18px;margin-bottom:22px;border:1px solid var(--line);border-radius:15px;background:#f8fbf9}.photo-ring{width:126px;height:126px;padding:5px;border-radius:50%;background:linear-gradient(135deg,#087a50,#7bd4aa);box-sizing:border-box}.photo-ring>div{width:100%;height:100%;display:grid;place-items:center;overflow:hidden;border:4px solid #fff;border-radius:50%;background:#dcebe3;color:#087a50;font-size:34px;font-weight:900}.photo-ring img{width:100%;height:100%;object-fit:cover}.photo-copy strong,.photo-copy small{display:block}.photo-copy strong{font-size:17px}.photo-copy small{margin:5px 0 12px;color:var(--muted);line-height:1.45}.photo-button{display:inline-flex;align-items:center;width:max-content;padding:10px 14px;border-radius:999px;background:#172019;color:#fff;cursor:pointer}.photo-button input{position:absolute;width:1px;height:1px;opacity:0}
    .choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.choice-grid.three-choice{grid-template-columns:repeat(3,1fr)}.choice-grid button{padding:24px;border:1px solid var(--line);border-radius:13px;background:#fff;text-align:left;cursor:pointer}.choice-grid button.selected{border-color:var(--green);background:var(--green-soft);box-shadow:0 0 0 2px #dff1e8}.choice-grid strong,.choice-grid small{display:block}.choice-grid strong{font-size:16px}.choice-grid small{margin-top:7px;color:var(--muted);line-height:1.45}.identity-title{margin-top:28px;padding-top:22px;border-top:1px solid var(--line)}
    .exam-grid,.ref-grid{display:grid;gap:10px}.exam-row{display:grid;grid-template-columns:120px 100px 1fr 1fr;gap:10px;align-items:center;padding:12px;border-radius:10px;background:#f5f8f6}.ref-card{padding:17px;border:1px solid var(--line);border-radius:12px}.ref-card>strong{display:block;margin-bottom:12px}.document-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.document-card{padding:15px;border:1px solid var(--line);border-radius:10px}.document-card strong,.document-card small{display:block}.document-card small{color:var(--muted);margin:4px 0 10px}.file-ready{color:var(--green)!important;font-weight:800}
    .profile-preview{display:grid;grid-template-columns:260px 1fr;border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:0 18px 45px rgba(22,65,41,.08)}.profile-identity{padding:28px;text-align:center;background:linear-gradient(145deg,#123b2b,#087a50);color:#fff}.preview-avatar{width:120px;height:120px;margin:0 auto 15px;border:5px solid rgba(255,255,255,.9);border-radius:50%;overflow:hidden;background:#dcebe3;display:grid;place-items:center;color:#087a50;font-size:34px;font-weight:900}.preview-avatar img{width:100%;height:100%;object-fit:cover}.profile-identity h3{margin:0 0 5px;font-size:20px}.profile-identity p{margin:0;color:#c8ead9}.profile-details{padding:28px}.profile-details>span{font-size:10px;color:var(--green);font-weight:900;letter-spacing:.12em}.profile-details h3{font-size:24px;margin:7px 0}.profile-details p{color:var(--muted);line-height:1.55}.profile-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.profile-facts div{padding:13px;background:#f3f8f5;border-radius:10px}.profile-facts small,.profile-facts strong{display:block}.profile-facts small{color:var(--muted);margin-bottom:4px}.tag-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.tag-list span{padding:7px 10px;border-radius:99px;background:var(--green-soft);color:var(--green);font-size:10px;font-weight:800}.privacy-note{padding:12px 14px;margin-top:16px;background:#f5f8f6;border-radius:9px;color:var(--muted);font-size:11px}
    .form-actions{display:flex;justify-content:space-between;margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}.form-actions button{padding:11px 18px;border-radius:8px;font-weight:900;cursor:pointer}.secondary{background:#fff;border:1px solid #cbd7d0}.primary{margin-left:auto;background:var(--green);color:#fff;border:1px solid var(--green)}.tag-hint{color:var(--muted);font-size:10px}.success{padding:11px;border-radius:8px;background:#e9f7f0;color:#087a50}
    @media(max-width:800px){.content.onboarding{height:auto;overflow:visible}.form-grid,.choice-grid,.choice-grid.three-choice,.document-grid,.profile-preview{grid-template-columns:1fr}.wide{grid-column:auto}.exam-row{grid-template-columns:1fr 1fr}.onboarding-top{align-items:flex-start;flex-direction:column}.progress-summary{width:100%;text-align:left}.student-head{padding:0 14px}.photo-builder{grid-template-columns:1fr;text-align:center}.photo-ring{margin:auto}.photo-button{margin:auto}.profile-facts{grid-template-columns:1fr}}
  `],
  template: `
    <header class="student-head">
      <div class="brand"><span>S</span>SuperOffer</div>
      <div class="head-actions"><span class="preview-pill">FRONTEND PREVIEW</span><button (click)="signedOut.emit()">Logout</button></div>
    </header>
    <main class="content onboarding">
      <header class="onboarding-top">
        <div><span class="eyebrow">UNIVERSITY-READY PROFILE</span><h1>Build one strong admissions profile</h1><p>Share the information universities use to assess academic fit and readiness.</p></div>
        <div class="progress-summary"><strong>Step {{step + 1}} of 9</strong><span><i [style.width.%]="progress"></i></span><small>{{progress}}% of the frontend preview explored</small></div>
      </header>
      <div class="onboarding-layout">
        <aside class="profile-drawer">
          <div class="profile-drawer-head"><div><small>APPLICATION JOURNEY</small><strong>Your profile</strong></div></div>
          <span class="journey-label">9 ADMISSIONS STEPS</span>
          <button *ngFor="let item of steps;let i=index" type="button" [class.current]="step===i" [class.complete]="i<step" (click)="goTo(i)">
            <span>{{i < step ? '✓' : i + 1}}</span><div><strong>{{item.title}}</strong><small>{{item.copy}}</small></div>
          </button>
        </aside>
        <form class="profile-form" (ngSubmit)="next()">
          <section *ngIf="step===0">
            <div class="form-title"><span>STEP 1 · APPLICATION PATH</span><h2>Which level are you applying for?</h2><p>This first choice tailors the full profile to what universities need from an undergraduate, postgraduate or PhD applicant.</p></div>
            <div class="choice-grid three-choice">
              <button type="button" [class.selected]="form.applicationLevel==='UNDERGRADUATE'" (click)="form.applicationLevel='UNDERGRADUATE'"><strong>Undergraduate (UG)</strong><small>I am in school or have completed Grade 12 / an equivalent qualification.</small></button>
              <button type="button" [class.selected]="form.applicationLevel==='POSTGRADUATE'" (click)="form.applicationLevel='POSTGRADUATE'"><strong>Postgraduate (PG)</strong><small>I am in college or already hold a bachelor’s degree and want a master’s.</small></button>
              <button type="button" [class.selected]="form.applicationLevel==='PHD'" (click)="form.applicationLevel='PHD'"><strong>Doctoral (PhD)</strong><small>I hold or am completing a relevant degree and want research-focused doctoral study.</small></button>
            </div>
            <div class="form-grid" style="margin-top:20px">
              <label class="wide">Fields of interest<input name="fieldsOfInterest" [(ngModel)]="form.fieldsOfInterest" placeholder="Artificial Intelligence, Public Health, Sustainable Energy"><small class="tag-hint">Add the subject areas you genuinely want to explore, separated by commas.</small></label>
            </div>
            <div class="form-title identity-title"><span>YOUR IDENTITY</span><h2>Now add your profile details</h2><p>Your photo gives your profile a human, recognisable presence. It is not an admissions criterion and can remain hidden from universities if you prefer.</p></div>
            <div class="photo-builder">
              <div class="photo-ring"><div><img *ngIf="photoPreview" [src]="photoPreview" alt="Student profile preview"><span *ngIf="!photoPreview">{{initials}}</span></div></div>
              <div class="photo-copy"><strong>Add your profile photo</strong><small>Choose a clear, recent head-and-shoulders photo. You will see it across your student profile, similar to a social profile picture.</small><label class="photo-button">Choose photo<input type="file" accept="image/png,image/jpeg,image/webp" (change)="choosePhoto($event)"></label></div>
            </div>
            <div class="form-grid">
              <label>First name<input name="firstName" [(ngModel)]="form.firstName" required></label>
              <label>Last name<input name="lastName" [(ngModel)]="form.lastName" required></label>
              <label>Date of birth<input type="date" name="dob" [(ngModel)]="form.dateOfBirth"></label>
              <label>Nationality<input name="nationality" [(ngModel)]="form.nationality" placeholder="Indian"></label>
              <label>Current country<input name="country" [(ngModel)]="form.country" placeholder="India"></label>
              <label>Current city<input name="city" [(ngModel)]="form.city" placeholder="Chennai"></label>
              <label>Email address<input type="email" name="email" [(ngModel)]="form.email"></label>
              <label>Phone number<input name="phone" [(ngModel)]="form.phoneNumber" placeholder="+91…"></label>
            </div>
          </section>

          <section *ngIf="step===1">
            <div class="form-title"><span>STEP 2 · STUDY GOAL</span><h2>{{applicationGoalTitle}}</h2><p>Universities assess you against a particular course, department and intake—not as a generic applicant.</p></div>
            <div class="form-grid">
              <label>Target programme / department<input name="targetProgramme" [(ngModel)]="form.targetProgramme" [placeholder]="programmePlaceholder"></label>
              <label>Preferred intake<select name="intake" [(ngModel)]="form.preferredIntake"><option value="">Select intake</option><option>Spring 2027</option><option>Fall 2027</option><option>Spring 2028</option><option>Fall 2028</option></select></label>
              <label>Preferred countries<input name="countries" [(ngModel)]="form.preferredCountries" placeholder="Canada, UK, Germany"><small class="tag-hint">Comma separated</small></label>
              <label>Career goal<input name="careerGoal" [(ngModel)]="form.careerGoal" placeholder="Data scientist in healthcare"></label>
              <label class="wide" *ngIf="form.applicationLevel==='PHD'">Proposed research area<textarea name="proposedResearchArea" [(ngModel)]="form.proposedResearchArea" placeholder="The problem or question you hope to investigate"></textarea></label>
            </div>
          </section>

          <section *ngIf="step===2">
            <div class="form-title"><span>STEP 3 · ACADEMIC RECORD</span><h2>Show your academic preparation</h2><p>Transcripts, subjects studied, grades and academic progression are usually the strongest evidence of readiness.</p></div>
            <div class="form-grid" *ngIf="form.applicationLevel==='UNDERGRADUATE'">
              <label>School name<input name="schoolName" [(ngModel)]="form.schoolName"></label>
              <label>Education board / curriculum<input name="schoolBoard" [(ngModel)]="form.schoolBoard" placeholder="CBSE, ISC, IB, Cambridge"></label>
              <label>Current grade / class<input name="currentGrade" [(ngModel)]="form.currentGrade" placeholder="Grade 12"></label>
              <label>Expected completion year<input type="number" name="schoolGraduationYear" [(ngModel)]="form.graduationYear"></label>
              <label>Grade 10 result<input name="grade10Score" [(ngModel)]="form.grade10Score" placeholder="94%"></label>
              <label>Grade 11 result<input name="grade11Score" [(ngModel)]="form.grade11Score" placeholder="90%"></label>
              <label>Grade 12 / predicted result<input name="predictedScore" [(ngModel)]="form.academicScore" placeholder="Predicted 93%"></label>
              <label>Academic stream<input name="schoolStream" [(ngModel)]="form.field" placeholder="Science with Mathematics"></label>
              <label class="wide">Subjects and individual grades<textarea name="schoolSubjectGrades" [(ngModel)]="form.subjectGrades" placeholder="Mathematics — 95%; Physics — 91%; Computer Science — 96%"></textarea></label>
            </div>
            <div class="form-grid" *ngIf="form.applicationLevel==='POSTGRADUATE'">
              <label>College / university<input name="pgInstitution" [(ngModel)]="form.institution"></label>
              <label>Bachelor’s degree<input name="bachelorsQualification" [(ngModel)]="form.qualification" placeholder="B.Tech Computer Science"></label>
              <label>Major / specialisation<input name="pgField" [(ngModel)]="form.field"></label>
              <label>CGPA / percentage<input name="pgScore" [(ngModel)]="form.academicScore" placeholder="8.7/10"></label>
              <label>Current semester / status<input name="collegeStatus" [(ngModel)]="form.collegeStatus" placeholder="Semester 8 / Graduated"></label>
              <label>Expected / completed year<input type="number" name="pgGraduationYear" [(ngModel)]="form.graduationYear"></label>
              <label>Number of backlogs<input type="number" min="0" name="backlogs" [(ngModel)]="form.backlogs"></label>
              <label class="wide">Relevant modules and grades<textarea name="pgSubjectGrades" [(ngModel)]="form.subjectGrades" placeholder="Algorithms — A; Statistics — A-; Machine Learning — A"></textarea></label>
            </div>
            <div class="form-grid" *ngIf="form.applicationLevel==='PHD'">
              <label>Most recent university<input name="phdInstitution" [(ngModel)]="form.institution"></label>
              <label>Highest qualification<input name="highestQualification" [(ngModel)]="form.qualification" placeholder="MSc Biotechnology"></label>
              <label>Discipline / specialisation<input name="phdField" [(ngModel)]="form.field"></label>
              <label>Final / current score<input name="phdScore" [(ngModel)]="form.academicScore"></label>
              <label>Degree completion year<input type="number" name="phdGraduationYear" [(ngModel)]="form.graduationYear"></label>
              <label>Master’s thesis title<input name="thesisTitle" [(ngModel)]="form.thesisTitle"></label>
              <label class="wide">Research methods and relevant coursework<textarea name="researchPreparation" [(ngModel)]="form.researchPreparation"></textarea></label>
              <label class="wide">Publications, conference papers or preprints<textarea name="publications" [(ngModel)]="form.publications" placeholder="Citation, venue, year and your contribution"></textarea></label>
            </div>
            <div class="form-grid" style="margin-top:16px">
              <label class="wide">Backlogs, repeats or academic gaps <span class="field-help">Explain honestly; context helps reviewers understand your record.</span><textarea name="academicContext" [(ngModel)]="form.academicContext" placeholder="Leave blank if not applicable"></textarea></label>
            </div>
          </section>

          <section *ngIf="step===3">
            <div class="form-title"><span>STEP 4 · TESTS</span><h2>Language and admissions tests</h2><p>Requirements vary by country, university and course. Add scores already earned and planned test dates.</p></div>
            <div class="exam-grid">
              <div class="exam-row" *ngFor="let exam of form.exams;let i=index">
                <strong>{{exam.examType}}</strong>
                <label class="check"><input type="checkbox" [name]="'taken'+i" [(ngModel)]="exam.examTaken"> Taken</label>
                <input [name]="'score'+i" [(ngModel)]="exam.score" [disabled]="!exam.examTaken" placeholder="Overall score">
                <input type="date" [name]="'date'+i" [(ngModel)]="exam.examDate" [disabled]="!exam.examTaken">
              </div>
            </div>
          </section>

          <section *ngIf="step===4">
            <div class="form-title"><span>STEP 5 · COURSE FIT</span><h2>Explain your motivation and fit</h2><p>A strong statement connects your preparation, subject interest, intended programme and future goals with specific evidence.</p></div>
            <div class="form-grid">
              <label class="wide">Why this subject?<textarea name="subjectMotivation" [(ngModel)]="form.subjectMotivation" placeholder="What sparked your interest, and how have you explored it?"></textarea></label>
              <label class="wide">Academic preparation<textarea name="academicPreparation" [(ngModel)]="form.academicPreparation" placeholder="Relevant coursework, projects, research or independent learning"></textarea></label>
              <label class="wide">Career direction<textarea name="futurePlans" [(ngModel)]="form.futurePlans" placeholder="How will this degree support your goals?"></textarea></label>
              <label class="wide">Research interests <span class="field-help">Especially useful for research-focused postgraduate programmes.</span><textarea name="researchInterests" [(ngModel)]="form.researchInterests"></textarea></label>
            </div>
          </section>

          <section *ngIf="step===5">
            <div class="form-title"><span>STEP 6 · EXPERIENCE</span><h2>Evidence beyond grades</h2><p>Admissions teams value relevant experience and what you learned from it—not a long list of unrelated activities.</p></div>
            <div class="form-grid">
              <label class="wide">Projects or research<textarea name="projects" [(ngModel)]="form.projects" placeholder="Project, your role, methods used and outcome"></textarea></label>
              <label class="wide">Work or internship experience<textarea name="experience" [(ngModel)]="form.experience" placeholder="Organisation, role, dates and impact"></textarea></label>
              <label>Awards and academic honours<input name="awards" [(ngModel)]="form.awards"></label>
              <label>Leadership or community contribution<input name="leadership" [(ngModel)]="form.leadership"></label>
              <label>Portfolio / personal website<input type="url" name="portfolio" [(ngModel)]="form.portfolioUrl"></label>
              <label>LinkedIn or GitHub<input type="url" name="professionalLink" [(ngModel)]="form.professionalLink"></label>
            </div>
          </section>

          <section *ngIf="step===6">
            <div class="form-title"><span>STEP 7 · RECOMMENDATIONS</span><h2>Choose people who can assess your potential</h2><p>Academic references are commonly required. Postgraduate programmes often request two or three referees.</p></div>
            <div class="ref-grid">
              <div class="ref-card" *ngFor="let referee of form.referees;let i=index">
                <strong>Referee {{i+1}} {{i===2?'(optional)':''}}</strong>
                <div class="form-grid">
                  <label>Full name<input [name]="'refName'+i" [(ngModel)]="referee.name"></label>
                  <label>Institution / organisation<input [name]="'refOrg'+i" [(ngModel)]="referee.organization"></label>
                  <label>Role / relationship<input [name]="'refRole'+i" [(ngModel)]="referee.relationship" placeholder="Professor, project supervisor"></label>
                  <label>Official email<input type="email" [name]="'refEmail'+i" [(ngModel)]="referee.email"></label>
                </div>
              </div>
            </div>
          </section>

          <section *ngIf="step===7">
            <div class="form-title"><span>STEP 8 · EVIDENCE</span><h2>Prepare supporting documents</h2><p>This frontend preview stores only the selected file names. Upload and verification will be connected after you approve the design.</p></div>
            <div class="document-grid">
              <div class="document-card" *ngFor="let doc of documentTypes">
                <strong>{{doc.label}}</strong><small [class.file-ready]="selectedFiles[doc.type]">{{selectedFiles[doc.type] || doc.help}}</small>
                <input type="file" [accept]="doc.accept" (change)="chooseDocument(doc.type,$event)">
              </div>
            </div>
            <div class="form-grid" style="margin-top:18px">
              <label>Estimated annual budget<input name="budget" [(ngModel)]="form.budgetRange" placeholder="₹25–40 lakh"></label>
              <label>Primary funding plan<select name="funding" [(ngModel)]="form.fundingPlan"><option value="">Select</option><option>Family / self-funded</option><option>Education loan</option><option>Scholarship</option><option>Sponsor</option><option>Combination</option></select></label>
              <label class="check"><input type="checkbox" name="scholarship" [(ngModel)]="form.scholarshipRequired"> I want scholarship opportunities</label>
            </div>
          </section>

          <section *ngIf="step===8">
            <div class="form-title"><span>STEP 9 · PROFILE PREVIEW</span><h2>This is how your student profile will appear</h2><p>Your photo remains prominent and consistent across the student experience. Universities see admissions-relevant evidence, not sensitive contact details.</p></div>
            <div class="profile-preview">
              <div class="profile-identity">
                <div class="preview-avatar"><img *ngIf="photoPreview" [src]="photoPreview" alt=""><span *ngIf="!photoPreview">{{initials}}</span></div>
                <h3>{{fullName}}</h3><p>{{form.city || 'Your city'}}<span *ngIf="form.country">, {{form.country}}</span></p>
              </div>
              <div class="profile-details">
                <span>STUDENT APPLICATION PROFILE</span><h3>{{form.targetProgramme || 'Your target programme'}}</h3>
                <p>{{form.subjectMotivation || 'Your academic motivation and course fit will appear here for universities.'}}</p>
                <div class="profile-facts">
                  <div><small>Application level</small><strong>{{applicationLevelLabel}}</strong></div>
                  <div><small>Academic score</small><strong>{{form.academicScore || 'Add score'}}</strong></div>
                  <div><small>Target intake</small><strong>{{form.preferredIntake || 'Choose intake'}}</strong></div>
                </div>
                <div class="tag-list"><span *ngFor="let interest of interestTags">{{interest}}</span><span *ngFor="let country of countryTags">{{country}}</span></div>
                <div class="privacy-note">Email, phone, date of birth and passport details are private and are not displayed on this profile card.</div>
              </div>
            </div>
            <p class="success">Frontend concept complete. No new admissions data is being sent to the backend yet.</p>
          </section>

          <footer class="form-actions">
            <button type="button" class="secondary" *ngIf="step>0" (click)="previous()">← Back</button>
            <button type="submit" class="primary">{{step===8?'Back to first step':'Continue →'}}</button>
          </footer>
        </form>
      </div>
    </main>
  `
})
export class StudentProfileOnboardingComponent implements OnChanges {
  @Input() profile: any;
  @Input() token = '';
  @Output() completed = new EventEmitter<any>();
  @Output() offersRequested = new EventEmitter<void>();
  @Output() signedOut = new EventEmitter<void>();

  step = 0;
  photoPreview = '';
  selectedFiles: Record<string, string> = {};
  steps = [
    { title: 'UG, PG or PhD', copy: 'Path, interests & identity' },
    { title: 'Study goal', copy: 'Programme and intake' },
    { title: 'Academic record', copy: 'Grades and subjects' },
    { title: 'Tests', copy: 'English and admissions' },
    { title: 'Course fit', copy: 'Motivation and goals' },
    { title: 'Experience', copy: 'Projects and impact' },
    { title: 'Recommendations', copy: 'Academic referees' },
    { title: 'Evidence', copy: 'Documents and funding' },
    { title: 'Profile preview', copy: 'University-ready view' }
  ];
  documentTypes = [
    { type: 'TRANSCRIPT', label: 'Academic transcript / mark sheets', help: 'Required by most universities', accept: '.pdf,.jpg,.jpeg,.png' },
    { type: 'QUALIFICATION', label: 'Degree or school certificate', help: 'Final or provisional certificate', accept: '.pdf,.jpg,.jpeg,.png' },
    { type: 'TEST', label: 'English / admissions test report', help: 'IELTS, TOEFL, PTE, SAT, GRE or GMAT', accept: '.pdf,.jpg,.jpeg,.png' },
    { type: 'CV', label: 'CV / résumé', help: 'Common for postgraduate applications', accept: '.pdf,.doc,.docx' },
    { type: 'SOP', label: 'Statement of purpose', help: 'Course motivation and preparation', accept: '.pdf,.doc,.docx' },
    { type: 'PASSPORT', label: 'Passport identity page', help: 'Used for identity and visa processing', accept: '.pdf,.jpg,.jpeg,.png' }
  ];
  form: any = {
    firstName: '', lastName: '', dateOfBirth: '', nationality: '', country: '', city: '', email: '', phoneNumber: '',
    applicationLevel: '', fieldsOfInterest: '', targetProgramme: '', preferredIntake: '', preferredCountries: '', careerGoal: '', proposedResearchArea: '',
    institution: '', awardingBody: '', qualification: '', field: '', academicScore: '', graduationYear: '',
    schoolName: '', schoolBoard: '', currentGrade: '', grade10Score: '', grade11Score: '', predictedScore: '',
    collegeStatus: '', backlogs: 0, thesisTitle: '', researchPreparation: '', publications: '',
    subjectGrades: '', academicContext: '',
    exams: ['IELTS', 'TOEFL', 'PTE', 'Duolingo', 'SAT / ACT', 'GRE', 'GMAT'].map(examType => ({ examType, examTaken: false, score: '', examDate: '' })),
    subjectMotivation: '', academicPreparation: '', futurePlans: '', researchInterests: '',
    projects: '', experience: '', awards: '', leadership: '', portfolioUrl: '', professionalLink: '',
    referees: [{ name: '', organization: '', relationship: '', email: '' }, { name: '', organization: '', relationship: '', email: '' }, { name: '', organization: '', relationship: '', email: '' }],
    budgetRange: '', fundingPlan: '', scholarshipRequired: false
  };

  ngOnChanges() {
    const personal = this.profile?.personal || {};
    const preferences = this.profile?.preferences || {};
    Object.assign(this.form, {
      firstName: personal.firstName || this.form.firstName,
      lastName: personal.lastName || this.form.lastName,
      dateOfBirth: personal.dateOfBirth || this.form.dateOfBirth,
      nationality: personal.nationality || this.form.nationality,
      country: personal.country || this.form.country,
      city: personal.city || this.form.city,
      phoneNumber: personal.phoneNumber || this.form.phoneNumber,
      preferredCountries: Array.isArray(preferences.preferredCountries) ? preferences.preferredCountries.join(', ') : this.form.preferredCountries,
      preferredIntake: preferences.preferredIntake || this.form.preferredIntake,
      budgetRange: preferences.budgetRange || this.form.budgetRange,
      scholarshipRequired: preferences.scholarshipRequired || this.form.scholarshipRequired
    });
    if (personal.profilePhoto) this.photoPreview = personal.profilePhoto;
  }

  get progress() { return Math.round(((this.step + 1) / this.steps.length) * 100); }
  get fullName() { return `${this.form.firstName || ''} ${this.form.lastName || ''}`.trim() || 'Your name'; }
  get initials() {
    const initials = [this.form.firstName, this.form.lastName].filter(Boolean).map((value: string) => value[0]).join('').toUpperCase();
    return initials || 'ST';
  }
  get countryTags() { return String(this.form.preferredCountries || '').split(',').map((value: string) => value.trim()).filter(Boolean).slice(0, 4); }
  get interestTags() { return String(this.form.fieldsOfInterest || '').split(',').map((value: string) => value.trim()).filter(Boolean).slice(0, 4); }
  get applicationLevelLabel() {
    return this.form.applicationLevel === 'UNDERGRADUATE' ? 'Undergraduate (UG)' : this.form.applicationLevel === 'POSTGRADUATE' ? 'Postgraduate (PG)' : this.form.applicationLevel === 'PHD' ? 'Doctoral (PhD)' : 'Choose a path';
  }
  get applicationGoalTitle() {
    return this.form.applicationLevel === 'PHD' ? 'Define your doctoral research direction' : this.form.applicationLevel === 'POSTGRADUATE' ? 'Which master’s programme fits your goal?' : 'Which bachelor’s course interests you?';
  }
  get programmePlaceholder() {
    return this.form.applicationLevel === 'PHD' ? 'PhD in Computational Biology' : this.form.applicationLevel === 'POSTGRADUATE' ? 'MSc Data Science' : 'BSc Computer Science';
  }

  choosePhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.photoPreview = String(reader.result || '');
    reader.readAsDataURL(file);
  }

  chooseDocument(type: string, event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.selectedFiles[type] = `Selected: ${file.name}`;
  }

  goTo(index: number) { this.step = index; }
  previous() { this.step = Math.max(0, this.step - 1); }
  next() { this.step = this.step === 8 ? 0 : this.step + 1; }
}
