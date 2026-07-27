import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing/landing-page.component';
import { StudentPageComponent } from './pages/student/student-page.component';
import { UniversityPageComponent } from './pages/university/university-page.component';
import { BankPageComponent } from './pages/bank/bank-page.component';
import { ConsultancyPageComponent } from './pages/consultancy/consultancy-page.component';
import { AuthPageComponent } from './pages/auth/auth-page.component';
import { PortalPageComponent } from './pages/portal/portal-page.component';

export const appRoutes: Routes = [
  { path: '', component: LandingPageComponent, title: 'SuperOffer | Education opportunities, connected' },
  { path: 'student', component: StudentPageComponent, title: 'Students | SuperOffer' },
  { path: 'university', component: UniversityPageComponent, title: 'Universities | SuperOffer' },
  { path: 'bank', component: BankPageComponent, title: 'Banks | SuperOffer' },
  { path: 'consultancy', component: ConsultancyPageComponent, title: 'Consultancies | SuperOffer' },
  { path: 'auth/:mode/:portal', component: AuthPageComponent, title: 'Account | SuperOffer' },
  { path: 'portal/:portal', component: PortalPageComponent, title: 'Portal | SuperOffer' },
  { path: '**', redirectTo: '' }
];
