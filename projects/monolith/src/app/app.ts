import { Component, type ElementRef, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer, Header, PromoBar, TelemetryBar, ToastHost, focusMainOnNavigation } from '@merch/core';

@Component({
  selector: 'merch-root',
  imports: [RouterOutlet, TelemetryBar, PromoBar, Header, Footer, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    focusMainOnNavigation(this.main);
  }

  /** O `href` serve de fallback; o clique só move o foco (com `<base href>` o hash mudaria de página). */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.main().nativeElement.focus();
  }
}
