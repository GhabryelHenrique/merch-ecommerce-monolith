import { Component, input } from '@angular/core';
import { Icon, type IconName } from '../icon/icon';

/** Estado vazio/erro com título, texto e ações projetadas (`<a merch-button>`…). */
@Component({
  selector: 'merch-empty-state',
  imports: [Icon],
  template: `
    <div class="icon"><merch-icon [name]="icon()" [size]="32" /></div>
    @switch (headingLevel()) {
      @case (1) {
        <h1 class="title">{{ heading() }}</h1>
      }
      @default {
        <h2 class="title">{{ heading() }}</h2>
      }
    }
    @if (description()) {
      <p class="description">{{ description() }}</p>
    }
    <div class="actions"><ng-content /></div>
  `,
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly description = input<string>();
  readonly icon = input<IconName>('info');
  readonly headingLevel = input<1 | 2>(2);
}
