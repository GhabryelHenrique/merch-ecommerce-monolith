import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, Icon } from '@merch/shared/ui';
import { toRouterLink } from '../../data/link';
import type { Banners } from '../../data/models';

@Component({
  selector: 'merch-sustainability-strip',
  imports: [RouterLink, Button, Icon],
  template: `
    <section class="strip" aria-labelledby="sustentabilidade-titulo">
      <div class="icon"><merch-icon name="leaf" [size]="32" /></div>
      <div class="text">
        <h2 id="sustentabilidade-titulo" class="title">{{ content().title }}</h2>
        <p>{{ content().text }}</p>
      </div>
      <a merch-button variant="secondary" [routerLink]="cta().path" [queryParams]="cta().query">
        {{ content().ctaLabel }}
      </a>
    </section>
  `,
  styleUrl: './sustainability-strip.scss',
})
export class SustainabilityStrip {
  readonly content = input.required<Banners['sustainability']>();
  protected readonly cta = computed(() => toRouterLink(this.content().ctaUrl));
}
