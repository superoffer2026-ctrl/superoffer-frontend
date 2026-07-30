import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'so-stat-counter',
  standalone: true,
  template: `<strong>{{display}}{{suffix}}</strong><span>{{label}}</span>`,
  styles: [`
    :host{display:block;padding:0 34px;border-left:1px solid #dfe5ef}
    strong{display:block;color:#10213d;font-size:clamp(38px,4vw,66px);font-weight:650;letter-spacing:-.065em;line-height:1}
    span{display:block;margin-top:12px;color:#68758a;font-size:13px;line-height:1.45}
    @media(max-width:700px){:host{padding:24px 0;border-left:0;border-top:1px solid #dfe5ef}}
  `]
})
export class StatCounterComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) value = 0;
  @Input() suffix = '';
  @Input({ required: true }) label = '';
  display = 0;
  private observer?: IntersectionObserver;
  private frame = 0;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.display = this.value;
      return;
    }
    this.observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      this.animate();
      this.observer?.disconnect();
    }, { threshold: .5 });
    this.observer.observe(this.host.nativeElement);
  }

  private animate(): void {
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - started) / 1100, 1);
      this.display = Math.round(this.value * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
  }
}
