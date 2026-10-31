import { NgOptimizedImage } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { CartItem } from '@merch/shared/cart';
import { Icon, Price, QuantityStepper } from '@merch/shared/ui';

/**
 * Linha do carrinho a partir do SNAPSHOT `CartItem` — o checkout não conhece o produto.
 * A imagem já vem com URL absoluta, então não há `IMAGE_LOADER` neste domínio.
 */
@Component({
  selector: 'merch-cart-line',
  imports: [NgOptimizedImage, RouterLink, Icon, Price, QuantityStepper],
  template: `
    <article class="line">
      <img [ngSrc]="item().imageUrl" alt="" width="96" height="96" class="thumb" />
      <div class="info">
        <h3 class="name">
          <a [routerLink]="['/p', item().slug]">{{ item().name }}</a>
        </h3>
        @if (item().variantLabel; as label) {
          <p class="variant">{{ label }}</p>
        }
        <merch-price [priceInCents]="item().unitPriceInCents" />
      </div>
      <div class="actions">
        <merch-quantity-stepper
          [value]="item().quantity"
          [max]="item().maxQuantity"
          [label]="'Quantidade de ' + item().name"
          (valueChange)="quantityChange.emit($event)"
        />
        <button type="button" class="remove" (click)="remove.emit()">
          <merch-icon name="trash" [size]="18" />
          <span>Remover<span class="visually-hidden"> {{ item().name }}</span></span>
        </button>
      </div>
    </article>
  `,
  styleUrl: './cart-line.scss',
})
export class CartLine {
  readonly item = input.required<CartItem>();
  readonly quantityChange = output<number>();
  readonly remove = output<void>();
}
