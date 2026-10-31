import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Badge, Price } from '@merch/shared/ui';
import { isSoldOut } from '../../data/catalog-query';
import type { Product } from '../../data/models';

/**
 * Card de produto (imagem, nome, preço, selos). Visual isolado aqui de propósito:
 * é o candidato ao deploy canário da fase 3 (mudança pequena e visível).
 * O card inteiro é clicável (link "esticado"), mas só o nome é o link — um único tab stop.
 */
@Component({
  selector: 'merch-product-card',
  imports: [NgOptimizedImage, RouterLink, Badge, Price],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Só para imagens acima da dobra (hero e primeira linha do grid). */
  readonly priority = input(false);

  protected readonly image = computed(() => this.product().images[0]);
  protected readonly soldOut = computed(() => isSoldOut(this.product()));
  protected readonly isNew = computed(() => this.product().badges.includes('new'));
  protected readonly isBestseller = computed(() => this.product().badges.includes('bestseller'));
  protected readonly colorCount = computed(() => this.product().options.colors?.length ?? 0);
  protected readonly link = computed(() => ['/p', this.product().slug]);
}
