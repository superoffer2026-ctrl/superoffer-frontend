import { Component } from '@angular/core';
import { PortalLandingComponent, PortalContent } from '../../shared/portal-landing.component';

@Component({ selector: 'app-student-page', standalone: true, imports: [PortalLandingComponent], template: '<app-portal-landing [content]="content" />' })
export class StudentPageComponent {
  content: PortalContent = {
    key:'student', eyebrow:'Your opportunities, organised', title:'Build one profile. Receive the right offers.',
    intro:'Stop repeating the same search across hundreds of sites. Keep academics, test scores, preferences, and verified documents together, then review university opportunities from one private workspace.',
    primary:'Create student account', secondary:'See student services',
    stats:[{value:'One',label:'verified student profile'},{value:'3',label:'offer categories to compare'},{value:'14 days',label:'standard invitation window'}],
    featuresTitle:'Everything a student needs to decide confidently.',
    features:[
      {icon:'◎',title:'Verified profile',text:'Maintain academics, test scores, goals, financial needs, documents, and visibility controls.'},
      {icon:'✦',title:'Scholarship offers',text:'Review concrete university invitations including scholarships, fee waivers, and fast-track terms.'},
      {icon:'↗',title:'Placement readiness',text:'Keep skills, achievements, and academic progress organised for future career opportunities.'},
      {icon:'▣',title:'Unified inbox',text:'Filter new, negotiating, accepted, rejected, and expired invitations in one place.'},
      {icon:'⌁',title:'Academic resources',text:'Access structured guidance, document checklists, and application preparation resources.'},
      {icon:'⇄',title:'Compare and negotiate',text:'Compare offers side by side and request improved terms once per invitation.'}
    ],
    process:['Register your free student account','Complete academics, preferences, tests, and documents','Turn visibility on when your profile is ready','Review and respond to relevant invitations'],
    faqs:[
      {q:'Does a student need admin approval?',a:'No. Student accounts can sign in immediately. Profile visibility depends on completing required information and verification.'},
      {q:'Who can see my profile?',a:'Only authorised, verified institutions within your visibility settings. Other students cannot view your information.'},
      {q:'Can I compare more than one offer?',a:'Yes. You can hold several pending invitations and compare them, while accepting one active offer per category at a time.'}
    ]
  };
}
