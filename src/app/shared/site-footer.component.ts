import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector:'app-site-footer',
  standalone:true,
  imports:[RouterLink],
  styles:[`
    :host{display:block;font-family:Inter,system-ui,sans-serif}
    footer{padding:82px clamp(22px,6vw,100px) 28px;color:#e9ded4;background:#201713}
    .top{display:grid;grid-template-columns:1.6fr repeat(3,1fr);gap:70px;max-width:1400px;margin:auto;padding-bottom:68px}
    .brand{display:flex;align-items:center;gap:12px;color:#fff;text-decoration:none;font-size:24px;font-weight:850;letter-spacing:-.04em}.brand img{width:45px;height:45px;border-radius:12px}
    .about p{max-width:360px;margin:22px 0;color:#a99b90;font-size:13px;line-height:1.8}.status{display:inline-flex;align-items:center;gap:9px;color:#c4b5aa;font-size:10px}.status i{width:7px;height:7px;border-radius:50%;background:#e96822;box-shadow:0 0 0 5px #e968221d}
    h4{margin:7px 0 23px;color:#e96822;font-size:9px;font-weight:900;letter-spacing:.15em;text-transform:uppercase}nav{display:grid;gap:13px}nav a{color:#c6b8ad;text-decoration:none;font-size:12px;transition:.2s}nav a:hover{color:#fff;transform:translateX(3px)}
    .bottom{display:flex;justify-content:space-between;gap:24px;max-width:1400px;margin:auto;padding-top:26px;border-top:1px solid #ffffff14;color:#8e8177;font-size:9px}.bottom div{display:flex;gap:24px}.bottom a{color:inherit;text-decoration:none}.bottom a:hover{color:#fff}
    @media(max-width:850px){.top{grid-template-columns:1fr 1fr}.about{grid-column:1/-1}.bottom{flex-direction:column}}@media(max-width:520px){footer{padding-top:65px}.top{grid-template-columns:1fr;gap:42px}.about{grid-column:auto}.bottom div{flex-wrap:wrap}}
  `],
  template: `
    <footer>
      <div class="top">
        <div class="about"><a class="brand" routerLink="/"><img src="/superoffer-brand-mark.png" alt=""><span>SuperOffer</span></a><p>One verified profile connecting students with the right universities, education finance and trusted guidance.</p><span class="status"><i></i> Building a better education marketplace</span></div>
        <div><h4>Explore</h4><nav><a routerLink="/students">For students</a><a routerLink="/university">For universities</a><a routerLink="/bank">Loans & banks</a><a routerLink="/consultancy">Consultancy</a></nav></div>
        <div><h4>Company</h4><nav><a routerLink="/">About SuperOffer</a><a href="mailto:hello@superoffer.net">Contact us</a><a href="mailto:partners@superoffer.net">Partner with us</a><a routerLink="/auth/login/student">Log in</a></nav></div>
        <div><h4>Get started</h4><nav><a routerLink="/auth/register/student">Create student profile</a><a routerLink="/auth/register/university">Join as a university</a><a routerLink="/auth/register/bank">Join as a lender</a><a routerLink="/auth/register/consultancy">Join as a consultant</a></nav></div>
      </div>
      <div class="bottom"><span>© 2026 SuperOffer. All rights reserved.</span><div><a href="mailto:support@superoffer.net">Support</a><a routerLink="/">Privacy</a><a routerLink="/">Terms</a></div></div>
    </footer>
  `
})
export class SiteFooterComponent {}
