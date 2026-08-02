import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { JourneyStage } from './offer-wallet.models';

const STAGE_ORDER: JourneyStage[] = ['Received', 'Viewed', 'Compared', 'Shortlisted', 'Accepted'];

@Component({
  selector: 'app-offer-journey-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="otrack-stepper" [class.otrack-compact]="compact">
      <div class="otrack-step" *ngFor="let step of steps; let i = index"
        [class.done]="i < activeIndex"
        [class.current]="i === activeIndex && !isTerminal"
        [class.otrack-declined-dot]="i === activeIndex && stage==='Declined'"
        [class.otrack-accepted-dot]="i === activeIndex && stage==='Accepted'">
        <span class="otrack-dot">{{ dotContent(i) }}</span>
        <small *ngIf="!compact">{{ step }}</small>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block}
    .otrack-stepper{display:flex;align-items:flex-start;gap:4px}
    .otrack-step{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative;text-align:center}
    .otrack-step:not(:last-child):after{content:"";position:absolute;top:11px;left:calc(50% + 14px);right:calc(-50% + 14px);height:2px;background:#e1e8e3}
    .otrack-step.done:not(:last-child):after{background:#087a50}
    .otrack-dot{width:22px;height:22px;flex:0 0 auto;display:grid;place-items:center;border-radius:50%;background:#eef2ef;color:#7a877f;font-size:10px;font-weight:800;z-index:1}
    .otrack-step.current .otrack-dot{background:#087a50;color:#fff;box-shadow:0 0 0 4px rgba(8,122,80,.15)}
    .otrack-step.done .otrack-dot{background:#087a50;color:#fff}
    .otrack-step small{font-size:8px;font-weight:800;color:#7a877f;letter-spacing:.03em}
    .otrack-step.current small,.otrack-step.done small{color:#173025}
    .otrack-declined-dot .otrack-dot{background:#d8503b!important;color:#fff!important}
    .otrack-accepted-dot .otrack-dot{background:#087a50!important;color:#fff!important;box-shadow:0 0 0 4px rgba(8,122,80,.15)}
    .otrack-compact .otrack-step{gap:0}
    .otrack-compact .otrack-dot{width:16px;height:16px;font-size:8px}
    .otrack-compact .otrack-step:not(:last-child):after{top:8px}
  `]
})
export class OfferJourneyTrackerComponent {
  @Input({ required: true }) stage!: JourneyStage;
  @Input() compact = false;

  get isTerminal(): boolean { return this.stage === 'Accepted' || this.stage === 'Declined'; }

  get steps(): string[] {
    return this.stage === 'Declined'
      ? ['Received', 'Viewed', 'Compared', 'Shortlisted', 'Declined']
      : STAGE_ORDER;
  }

  get activeIndex(): number {
    if (this.isTerminal) return this.steps.length - 1;
    const index = STAGE_ORDER.indexOf(this.stage);
    return index === -1 ? 0 : index;
  }

  dotContent(index: number): string {
    if (index < this.activeIndex) return '✓';
    if (index === this.activeIndex && this.isTerminal) return this.stage === 'Declined' ? '✕' : '✓';
    return String(index + 1);
  }
}
