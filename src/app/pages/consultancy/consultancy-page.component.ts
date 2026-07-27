import { Component } from '@angular/core';
import { PortalLandingComponent, PortalContent } from '../../shared/portal-landing.component';

@Component({selector:'app-consultancy-page',standalone:true,imports:[PortalLandingComponent],template:'<app-portal-landing [content]="content" />'})
export class ConsultancyPageComponent {
  content:PortalContent={
    key:'consultancy',eyebrow:'SuperOffer for study-abroad experts',title:'Meet students with genuine intent and guide them with confidence.',
    intro:'Build a verified consultancy presence, discover suitable students, present transparent service engagements, and support accepted clients through their study-abroad journey.',
    primary:'Register consultancy',secondary:'See consultancy benefits',
    stats:[{value:'Intent',label:'qualified student discovery'},{value:'One',label:'active consultant per student'},{value:'Verified',label:'consultancy profiles'}],
    featuresTitle:'A trusted way to build meaningful student relationships.',
    features:[
      {icon:'⌕',title:'Intent-qualified discovery',text:'Find visible students whose destinations, courses, and support needs match your expertise.'},
      {icon:'◎',title:'Consultant profiles',text:'Present verified certifications, specialisations, languages, regions, and advisor experience.'},
      {icon:'↗',title:'Engagement offers',text:'Send concrete consulting service invitations with scope, duration, and terms.'},
      {icon:'▤',title:'Client pipeline',text:'Track invitations and accepted consulting relationships from one workspace.'},
      {icon:'◇',title:'Guidance visibility',text:'With consent, view relevant university and loan invitation status for active clients.'},
      {icon:'▥',title:'Performance reports',text:'Understand acceptance, engagement completion, and response outcomes.'}
    ],
    process:['Register the consultancy organisation','Submit certification and business documents','Super Admin reviews the organisation','Verified consultancy workspace is activated'],
    requirements:['Consultancy legal name','Business registration details','Relevant certifications','Official business email','Authorised contact person','Specialisations and service regions'],
    faqs:[
      {q:'Can a consultancy act for a student?',a:'Consultants provide guidance but cannot edit or respond to university and loan invitations on the student’s behalf.'},
      {q:'Can a student work with several consultants?',a:'A student can compare pending consultancy invitations but can have only one active consultant engagement at a time.'},
      {q:'Why must consultancies be verified?',a:'Verification establishes legitimacy and protects students before any discovery or engagement tools are unlocked.'}
    ]
  };
}
