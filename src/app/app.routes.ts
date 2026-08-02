import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { StudentPageComponent } from './pages/student/student-page.component';
import { OrganizationPageComponent } from './pages/organization/organization-page.component';
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
import { StudentSettingsComponent } from './pages/student-portal/student-settings.component';
import { OrganizationWorkspaceComponent } from './pages/organization-portal/organization-workspace.component';
import { StudentOnboardingComponent } from './pages/student-onboarding/student-onboarding.component';
import { StudentExtraPageComponent } from './pages/student-portal/student-extra-page.component';
import { ConsultancyWorkspaceComponent } from './pages/consultancy-portal/consultancy-workspace.component';
import { FinancialInformationComponent } from './pages/student-portal/financial-information.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent, title: 'SuperOffer | Education opportunities, connected' },
  { path: 'students', component: StudentPageComponent, title: 'Students | SuperOffer' },
  { path: 'student/onboarding', component: StudentOnboardingComponent, title: 'Create your student profile | SuperOffer' },
  {
    path: 'student',
    component: StudentPortalShellComponent,
    title: 'Student Profile | SuperOffer',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'personal-information', component: PersonalInformationComponent },
      { path: 'academic-information', component: AcademicInformationComponent },
      { path: 'study-preferences', component: StudyPreferencesComponent },
      { path: 'entrance-exams', component: EntranceExamsComponent },
      { path: 'financial-information', component: FinancialInformationComponent },
      { path: 'skills', component: SkillsLanguagesComponent },
      { path: 'projects', component: ProjectsAchievementsComponent },
      { path: 'documents', component: DocumentsUploadComponent },
      { path: 'review', component: ReviewProfileComponent },
      { path: 'completion', component: CompleteProfileComponent },
      { path: 'offers', component: StudentOfferInboxComponent },
      { path: 'profile', component: StudentFullProfileComponent },
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'settings', component: StudentSettingsComponent },
      { path: 'saved-universities', component: StudentExtraPageComponent, data: { page: 'saved-universities' } },
      { path: 'scholarships', component: StudentExtraPageComponent, data: { page: 'scholarships' } },
      { path: 'loan-eligibility', component: StudentExtraPageComponent, data: { page: 'loan-eligibility' } },
      { path: 'notifications', component: StudentExtraPageComponent, data: { page: 'notifications' } },
      { path: 'messages', component: StudentExtraPageComponent, data: { page: 'messages' } },
      { path: 'help', redirectTo: 'settings', pathMatch: 'full' }
    ]
  },
  { path: 'organization', component: OrganizationPageComponent, title: 'Organizations | SuperOffer' },
  { path: 'consultancy', component: ConsultancyPageComponent, title: 'Consultancies | SuperOffer' },

  // Legacy university/bank auth links redirect into the unified organization auth flow.
  { path: 'auth/login/university', pathMatch: 'full', redirectTo: 'organization/login' },
  { path: 'auth/register/university', pathMatch: 'full', redirectTo: 'organization/signup' },
  { path: 'auth/login/bank', pathMatch: 'full', redirectTo: 'organization/login' },
  { path: 'auth/register/bank', pathMatch: 'full', redirectTo: 'organization/signup' },
  { path: 'organization/login', pathMatch: 'full', redirectTo: 'auth/login/organization' },
  { path: 'organization/signup', pathMatch: 'full', redirectTo: 'auth/register/organization' },
  { path: 'auth/:mode/:portal', component: AuthPageComponent, title: 'Account | SuperOffer' },

  { path: 'portal/student', pathMatch: 'full', redirectTo: 'student/dashboard' },

  // Legacy portal/university and portal/bank workspaces now live under /organization.
  { path: 'university', pathMatch: 'full', redirectTo: 'organization' },
  { path: 'bank', pathMatch: 'full', redirectTo: 'organization' },
  { path: 'portal/university', pathMatch: 'full', redirectTo: 'organization/dashboard' },
  { path: 'portal/bank', pathMatch: 'full', redirectTo: 'organization/dashboard' },
  ...['dashboard','students','subscription','offers','settings'].map(page => ({ path: `portal/university/${page}`, pathMatch: 'full' as const, redirectTo: `organization/${page}` })),
  ...['dashboard','students','subscription','offers','settings'].map(page => ({ path: `portal/bank/${page}`, pathMatch: 'full' as const, redirectTo: `organization/${page}` })),

  { path: 'organization/student/:id', component: OrganizationWorkspaceComponent, data: { page: 'students' }, title: 'Organization Workspace | SuperOffer' },
  ...['dashboard','students','offers','saved','notifications','subscription','profile','settings'].map(page => ({ path: `organization/${page}`, component: OrganizationWorkspaceComponent, data: { page }, title: 'Organization Workspace | SuperOffer' })),

  ...['dashboard','students','settings'].map(path => ({ path: `portal/consultancy/${path}`, component: ConsultancyWorkspaceComponent, data: { page: path }, title: 'Consultancy Workspace | SuperOffer' })),
  { path: 'portal/consultancy', pathMatch: 'full', redirectTo: 'portal/consultancy/dashboard' },
  { path: 'portal/:portal', component: PortalPageComponent, title: 'Portal | SuperOffer' },
  { path: 'admin', component: AdminPageComponent, title: 'Institution approvals | SuperOffer' },
  { path: '**', redirectTo: '' }
];
