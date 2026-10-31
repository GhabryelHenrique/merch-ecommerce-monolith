import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { Button, EmptyState } from '@merch/shared/ui';
import { CheckoutLayout } from '../ui/checkout-layout/checkout-layout';
import { CartLine } from '../ui/cart-line/cart-line';
import { CouponForm } from '../ui/coupon-form/coupon-form';

/** Carrinho: lê e altera SOMENTE via `@merch/shared/cart`. */
@Component({
  selector: 'merch-cart-page',
  imports: [RouterLink, Button, EmptyState, CheckoutLayout, CartLine, CouponForm],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.scss',
})
export class CartPage {
  protected readonly cart = inject(CartStore);
}
