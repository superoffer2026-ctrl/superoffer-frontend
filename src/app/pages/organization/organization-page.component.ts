import { Component } from '@angular/core';
import { PortalLandingComponent, PortalContent } from '../../shared/portal-landing.component';

@Component({ selector: 'app-organization-page', standalone: true, imports: [PortalLandingComponent], template: '<app-portal-landing [content]="content" />' })
export class OrganizationPageComponent {
  content: PortalContent = {
    key:'organization', eyebrow:'SuperOffer for organizations', title:'Reach the right students, as a university or a bank.',
    intro:'Discover qualified, verified students, manage your pipeline, and send transparent admission or loan offers from one verified organization workspace.',
    primary:'Register organization', secondary:'Learn more',
    stats:[{value:'AI',label:'student matching'},{value:'100%',label:'verified organisation access'},{value:'One',label:'workspace for every offer'}],
    featuresTitle:'Recruitment and lending infrastructure built for modern organizations.',
    features:[
      {icon:'⌕',title:'Student discovery',text:'Search students using structured filters or natural-language criteria and review match factors.'},
      {icon:'◫',title:'Student management',text:'Create shared shortlists and coordinate candidate review within your organization.'},
      {icon:'✓',title:'Certificate verification',text:'Use verifiable student documents while respecting consent and access boundaries.'},
      {icon:'▥',title:'Analytics dashboard',text:'Track sent, viewed, negotiated, accepted, rejected, and expired invitations.'},
      {icon:'₹',title:'Admission & loan offers',text:'Send clear admission terms or indicative loan terms from the same offer workspace.'},
      {icon:'⬡',title:'Secure cloud platform',text:'Organisation-scoped data, role-based permissions, protected sessions, and audit-ready actions.'}
    ],
    process:['Register your organization and authorised contact','Choose your organization type — university or bank','Submit accreditation or licence information','Super Admin reviews the organisation','Verified organization dashboard is activated'],
    requirements:['Organization legal name and type','Accreditation or lending licence details','Government registration number','Official organization email and domain','Authorised contact person','Main address and country'],
    faqs:[
      {q:'Why does organization registration require approval?',a:'Verification protects students and ensures only legitimate universities and banks can search profiles or send invitations.'},
      {q:'What can university officers and loan officers do?',a:'Verified officers can search suitable students, review match scores, build shortlists, send admission or loan offers, handle negotiations, and view funnel reports.'},
      {q:'Can organizations see student contact details immediately?',a:'No. Contact details remain protected until the student accepts an offer, according to SuperOffer privacy rules.'}
    ]
  };
}
