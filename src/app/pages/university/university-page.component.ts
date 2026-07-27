import { Component } from '@angular/core';
import { PortalLandingComponent, PortalContent } from '../../shared/portal-landing.component';

@Component({ selector: 'app-university-page', standalone: true, imports: [PortalLandingComponent], template: '<app-portal-landing [content]="content" />' })
export class UniversityPageComponent {
  content: PortalContent = {
    key:'university', eyebrow:'SuperOffer for universities', title:'Partner with SuperOffer and digitise your admissions ecosystem.',
    intro:'Discover qualified, likely-to-enrol students, manage programmes and shortlists, and send transparent admission offers from a verified university workspace.',
    primary:'Register university', secondary:'Learn more',
    stats:[{value:'AI',label:'student matching'},{value:'100%',label:'verified organisation access'},{value:'One',label:'admissions funnel dashboard'}],
    featuresTitle:'Recruitment infrastructure built for modern universities.',
    features:[
      {icon:'⌕',title:'Digital admissions',text:'Search students using structured filters or natural-language criteria and review match factors.'},
      {icon:'◫',title:'Student management',text:'Create shared shortlists and coordinate candidate review within your institution.'},
      {icon:'✓',title:'Certificate verification',text:'Use verifiable student documents while respecting consent and access boundaries.'},
      {icon:'▥',title:'Analytics dashboard',text:'Track sent, viewed, negotiated, accepted, rejected, and expired invitations.'},
      {icon:'↗',title:'Placement management',text:'Maintain programme outcomes and prepare future placement workflows from one platform.'},
      {icon:'⬡',title:'Secure cloud platform',text:'Organisation-scoped data, role-based permissions, protected sessions, and audit-ready actions.'}
    ],
    process:['Register the university and authorised contact','Submit accreditation and business information','Super Admin reviews the organisation','Verified university dashboard is activated'],
    requirements:['University legal name and type','Accreditation details','Government registration number','Official institutional email and domain','Authorised contact person','Main address and campus information'],
    faqs:[
      {q:'Why does university registration require approval?',a:'Verification protects students and ensures only legitimate organisations can search profiles or send invitations.'},
      {q:'What can university officers do?',a:'Verified officers can search suitable students, review match scores, build shortlists, send offers, handle negotiations, and view funnel reports.'},
      {q:'Can officers see student contact details immediately?',a:'No. Contact details remain protected until the student accepts an offer, according to SuperOffer privacy rules.'}
    ]
  };
}
