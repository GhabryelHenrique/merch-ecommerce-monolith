import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { Icon } from '@merch/shared/ui';

/** Só LÊ `cart.count()` — o shell nunca manipula itens. Link por URL para o checkout. */
@Component({
  selector: 'merch-cart-badge',
  imports: [RouterLink, Icon],
  template: `
    <a routerLink="/checkout/carrinho" class="cart" [attr.aria-label]="label()">
      <merch-icon name="cart" />
      @if (count() > 0) {
        <span class="count" aria-hidden="true">{{ displayCount() }}</span>
      }
    </a>
  `,
  styleUrl: './cart-badge.scss',
})
export class CartBadge {
  protected readonly count = inject(CartStore).count;
  protected readonly displayCount = computed(() => (this.count() > 99 ? '99+' : String(this.count())));
  protected readonly label = computed(() => {
    const n = this.count();
    return n === 0 ? 'Carrinho, vazio' : `Carrinho, ${n} ${n === 1 ? 'item' : 'itens'}`;
  });
}
