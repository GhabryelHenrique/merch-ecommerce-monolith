import { Component, input } from '@angular/core';

/** Placeholder de carregamento. Decorativo: quem usa anuncia o estado (ex.: `aria-busy`). */
@Component({
  selector: 'merch-skeleton',
  template: ``,
  styleUrl: './skeleton.scss',
  host: {
    'aria-hidden': 'true',
    '[class.skeleton--text]': "shape() === 'text'",
    '[class.skeleton--circle]': "shape() === 'circle'",
    '[style.width]': 'width()',
    '[style.height]': 'height()',
    '[style.aspect-ratio]': 'aspectRatio()',
  },
})
export class Skeleton {
  readonly shape = input<'rect' | 'text' | 'circle'>('rect');
  readonly width = input('100%');
  readonly height = input<string | null>(null);
  readonly aspectRatio = input<string | null>(null);
}
