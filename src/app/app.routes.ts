import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { StudentPageComponent } from './pages/student/student-page.component';
import { UniversityPageComponent } from './pages/university/university-page.component';
import { BankPageComponent } from './pages/bank/bank-page.component';
import { ConsultancyPageComponent } from './pages/consultancy/consultancy-page.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { PortalPageComponent } from './pages/portal/portal-page.component';
import { AdminPageComponent } from './pages/admin/admin-page.component';
import { StudentPortalShellComponent } from './pages/student-portal/student-portal-shell.component';
import { PersonalInformationComponent } from './pages/student-portal/personal-information.component';
import { AcademicInformationComponent } from './pages/student-portal/academic-information.component';
import { StudyPreferencesComponent } from './pages/student-portal/study-preferences.component';
import { EntranceExamsComponent } from './pages/student-portal/entrance-exams.component';
import { SkillsLanguagesComponent } from './pages/student-portal/skills-languages.component';
import { ProjectsAchievementsComponent } from './pages/student-portal/projects-achievements.component';
import { DocumentsUploadComponent } from './pages/student-portal/documents-upload.component';
import { ReviewProfileComponent } from './pages/student-portal/review-profile.component';
import { CompleteProfileComponent } from './pages/student-portal/complete-profile.component';
import { StudentDashboardComponent } from './pages/student-portal/student-dashboard.component';
import { StudentOfferInboxComponent } from './pages/portal/student-offer-inbox.component';
import { StudentFullProfileComponent } from './pages/student-portal/student-full-profile.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent, title: 'SuperOffer | Education opportunities, connected' },
  { path: 'students', component: StudentPageComponent, title: 'Students | SuperOffer' },
  {
    path: 'student',
    component: StudentPortalShellComponent,
    title: 'Student Profile | SuperOffer',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'personal-information' },
      { path: 'personal-information', component: PersonalInformationComponent },
      { path: 'academic-information', component: AcademicInformationComponent },
      { path: 'study-preferences', component: StudyPreferencesComponent },
      { path: 'entrance-exams', component: EntranceExamsComponent },
      { path: 'skills', component: SkillsLanguagesComponent },
      { path: 'projects', component: ProjectsAchievementsComponent },
      { path: 'documents', component: DocumentsUploadComponent },
      { path: 'review', component: ReviewProfileComponent },
      { path: 'completion', component: CompleteProfileComponent },
      { path: 'offers', component: StudentOfferInboxComponent },
      { path: 'profile', component: StudentFullProfileComponent },
      { path: 'dashboard', component: StudentDashboardComponent }
    ]
  },
  { path: 'university', component: UniversityPageComponent, title: 'Universities | SuperOffer' },
  { path: 'bank', component: BankPageComponent, title: 'Banks | SuperOffer' },
  { path: 'consultancy', component: ConsultancyPageComponent, title: 'Consultancies | SuperOffer' },
  { path: 'auth/:mode/:portal', component: AuthPageComponent, title: 'Account | SuperOffer' },
  { path: 'portal/student', pathMatch: 'full', redirectTo: 'student/personal-information' },
  { path: 'portal/:portal', component: PortalPageComponent, title: 'Portal | SuperOffer' },
  { path: 'admin', component: AdminPageComponent, title: 'Institution approvals | SuperOffer' },
  { path: '**', redirectTo: '' }
];
