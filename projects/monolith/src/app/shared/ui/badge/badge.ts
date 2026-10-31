import { Component, input } from '@angular/core';

export type BadgeTone = 'new' | 'bestseller' | 'sale' | 'soldout' | 'neutral';

/** Selo curto ("Novo", "-20%", "Esgotado"). O texto vem por projeção. */
@Component({
  selector: 'merch-badge',
  template: `<ng-content />`,
  styleUrl: './badge.scss',
  host: {
    '[class]': "'badge badge--' + tone()",
  },
})
export class Badge {
  readonly tone = input<BadgeTone>('neutral');
}
