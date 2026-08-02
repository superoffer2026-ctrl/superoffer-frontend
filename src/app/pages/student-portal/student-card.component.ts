import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-student-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="scard">
      <div class="scard-avatar">
        <img *ngIf="photo" [src]="photo" alt="{{fullName}} profile photo">
        <span *ngIf="!photo">{{initials}}</span>
        <i class="scard-verified" *ngIf="verified" title="Verified student">✓</i>
      </div>

      <div class="scard-identity">
        <span class="scard-kicker">STUDENT CARD</span>
        <h1>{{fullName || 'Student'}}</h1>
        <div class="scard-summary-row">
          <span class="scard-pill" *ngIf="cgpa">CGPA <b>{{cgpa}}</b></span>
          <span class="scard-pill" *ngIf="ielts">IELTS <b>{{ielts}}</b></span>
          <span class="scard-pill scard-pill-course" *ngIf="preferredCourse">{{preferredCourse}}<small *ngIf="preferredCountry"> · {{preferredCountry}}</small></span>
        </div>
      </div>

      <div class="scard-completion">
        <div class="scard-ring" [style.background]="ringGradient">
          <span>{{completionPct}}%</span>
        </div>
        <small>Profile complete</small>
      </div>
    </section>
  `,
  styles: [`
    :host{display:block}
    .scard{position:relative;display:flex;align-items:center;gap:26px;padding:30px 34px;border-radius:22px;overflow:hidden;background:linear-gradient(120deg,#0d2d42 0%,#123b2b 55%,#087a50 120%);color:#fff;box-shadow:0 24px 60px rgba(8,45,32,.28)}
    .scard:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 85% 15%,rgba(103,208,178,.25) 0%,transparent 45%)}
    .scard-avatar{position:relative;flex:0 0 auto;width:84px;height:84px;display:grid;place-items:center;overflow:hidden;border-radius:24px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.25);color:#fff;font-size:26px;font-weight:900;z-index:1}
    .scard-avatar img{width:100%;height:100%;object-fit:cover}
    .scard-verified{position:absolute;right:-6px;bottom:-6px;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:#67d0b2;color:#0d2d42;font-size:13px;font-weight:900;border:3px solid #0d2d42}
    .scard-identity{position:relative;flex:1;min-width:0;z-index:1}
    .scard-kicker{display:block;margin-bottom:8px;font-size:10px;font-weight:900;letter-spacing:.16em;color:#8ed9c2}
    .scard-identity h1{margin:0 0 14px;font-family:"Libre Franklin",sans-serif;font-size:clamp(24px,3vw,32px);letter-spacing:-.03em}
    .scard-summary-row{display:flex;flex-wrap:wrap;gap:8px}
    .scard-pill{padding:7px 13px;border-radius:999px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);font-size:11px;font-weight:700;color:#d7e6df}
    .scard-pill b{margin-left:4px;color:#fff;font-weight:900}
    .scard-pill-course{background:rgba(103,208,178,.16);border-color:rgba(103,208,178,.3);color:#dff6ec}
    .scard-pill-course small{color:#a9d9c8}
    .scard-completion{position:relative;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:8px;z-index:1}
    .scard-ring{width:64px;height:64px;display:grid;place-items:center;border-radius:50%;box-shadow:inset 0 0 0 6px rgba(255,255,255,.14)}
    .scard-ring span{width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:#0d2d42;color:#fff;font-size:13px;font-weight:900}
    .scard-completion small{font-size:9px;font-weight:800;letter-spacing:.05em;color:#a9d9c8}
    @media(max-width:720px){.scard{flex-wrap:wrap;padding:24px;gap:18px}.scard-completion{margin-left:auto}}
    @media(max-width:480px){.scard{flex-direction:column;align-items:flex-start}.scard-completion{margin-left:0;flex-direction:row}}
  `]
})
export class StudentCardComponent {
  @Input() fullName = '';
  @Input() photo = '';
  @Input() cgpa = '';
  @Input() ielts = '';
  @Input() preferredCountry = '';
  @Input() preferredCourse = '';
  @Input() completionPct = 0;
  @Input() verified = false;

  get initials(): string {
    return (this.fullName || 'Student').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  get ringGradient(): string {
    const pct = Math.max(0, Math.min(100, this.completionPct));
    return `conic-gradient(#67d0b2 ${pct}%, rgba(255,255,255,.14) 0)`;
  }
}
