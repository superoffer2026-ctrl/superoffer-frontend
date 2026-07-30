import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'so-chip-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chips" role="group" [attr.aria-label]="label">
      <button *ngFor="let option of options" type="button" [class.selected]="selected.includes(option)"
        (click)="toggle(option)" [attr.aria-pressed]="selected.includes(option)">
        <span *ngIf="icons[option]">{{icons[option]}}</span>{{option}}<i *ngIf="selected.includes(option)">✓</i>
      </button>
    </div>
  `,
  styles: [`
    .chips{display:flex;flex-wrap:wrap;gap:10px}button{min-height:43px;padding:0 15px;display:inline-flex;align-items:center;gap:8px;border:1px solid #ded7cf;border-radius:999px;color:#514840;background:#fff;font:700 12px Inter,system-ui;cursor:pointer;transition:.2s}button:hover{border-color:#bdaea1;transform:translateY(-1px)}button.selected{border-color:#2b211b;color:#fff;background:#2b211b;box-shadow:0 8px 20px #2b211b1c}button span{font-size:15px}button i{color:#f17835;font-style:normal}
  `]
})
export class OnboardingChipSelectComponent {
  @Input() label = '';
  @Input() options: string[] = [];
  @Input() selected: string[] = [];
  @Input() icons: Record<string, string> = {};
  @Input() single = false;
  @Output() selectedChange = new EventEmitter<string[]>();

  toggle(option: string) {
    const next = this.single
      ? (this.selected.includes(option) ? [] : [option])
      : (this.selected.includes(option) ? this.selected.filter(item => item !== option) : [...this.selected, option]);
    this.selectedChange.emit(next);
  }
}
