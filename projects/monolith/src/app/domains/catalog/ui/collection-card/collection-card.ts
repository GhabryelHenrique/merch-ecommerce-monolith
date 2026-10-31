import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '@merch/shared/ui';
import type { Collection } from '../../data/models';

@Component({
  selector: 'merch-collection-card',
  imports: [NgOptimizedImage, RouterLink, Icon],
  template: `
    <article class="card" [style.background]="background()">
      <img [ngSrc]="collection().image.src" alt="" [width]="collection().image.width" [height]="collection().image.height" />
      <div class="body">
        <h3 class="name">
          <a routerLink="/c/todos" [queryParams]="{ colecao: collection().slug }">{{ collection().name }}</a>
        </h3>
        <p class="tagline">{{ collection().tagline }}</p>
        <span class="cta" aria-hidden="true">Explorar <merch-icon name="arrow-right" [size]="18" /></span>
      </div>
    </article>
  `,
  styleUrl: './collection-card.scss',
})
export class CollectionCard {
  readonly collection = input.required<Collection>();
  /** Tema da coleção → token de cor (`campaign-1` → `var(--color-campaign-1)`). */
  protected readonly background = computed(() => `var(--color-${this.collection().theme})`);
}
