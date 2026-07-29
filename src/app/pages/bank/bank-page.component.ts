import { Component } from '@angular/core';
import { PortalLandingComponent, PortalContent } from '../../shared/portal-landing.component';

@Component({selector:'app-bank-page',standalone:true,imports:[PortalLandingComponent],template:'<app-portal-landing [content]="content" />'})
export class BankPageComponent {
  content:PortalContent={
    key:'bank',eyebrow:'SuperOffer for education lenders',title:'Fund promising students with confidence.',
    intro:'Discover students with genuine education plans, evaluate suitable profiles, and present clear indicative loan terms through a verified lender workspace.',
    primary:'Register bank',secondary:'Explore lending tools',
    stats:[{value:'AI',label:'finance-fit matching'},{value:'100%',label:'verified lender access'},{value:'Clear',label:'indicative loan terms'}],
    featuresTitle:'A focused acquisition channel for education lenders.',
    features:[
      {icon:'⌕',title:'Student discovery',text:'Search permissioned profiles by course, destination, academic strength, and financial need.'},
      {icon:'◎',title:'Credit-fit context',text:'Review relevant structured information without exposing protected contact details before acceptance.'},
      {icon:'₹',title:'Loan product management',text:'Maintain indicative rates, limits, eligibility, collateral, and repayment information.'},
      {icon:'↗',title:'Finance invitations',text:'Send concrete pre-approval style offers rather than generic advertising.'},
      {icon:'⇄',title:'Clear negotiation',text:'Respond to a student’s single negotiation request with revised or confirmed terms.'},
      {icon:'▥',title:'Conversion analytics',text:'Track sent, viewed, negotiating, accepted, rejected, and expired finance offers.'}
    ],
    process:['Register the bank or licensed lender','Submit registration and licence details','Super Admin completes verification','Verified loan officer workspace is activated'],
    requirements:['Legal lender name and type','Government registration number','Lending licence or regulatory reference','Official business email and domain','Authorised contact person','Registered office address'],
    faqs:[
      {q:'Does SuperOffer disburse education loans?',a:'No. SuperOffer facilitates discovery and indicative offers. Final underwriting, agreements, and disbursement remain with the lender.'},
      {q:'Why is lender verification required?',a:'Only legitimate, reviewed lenders can search eligible profiles or send finance invitations.'},
      {q:'When are student contact details visible?',a:'Contact details remain protected until the student accepts the relevant offer.'}
    ]
  };
}
