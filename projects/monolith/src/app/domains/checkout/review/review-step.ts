import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { Button, Icon } from '@merch/shared/ui';
import { CheckoutStore } from '../data/checkout-store';
import { OrderService } from '../data/order-service';
import { paymentLabel } from '../data/rules';
import { CheckoutLayout } from '../ui/checkout-layout/checkout-layout';

/** Revisão final. Confirmar → OrderService (fake) → limpa carrinho → confirmação. */
@Component({
  selector: 'merch-review-step',
  imports: [CurrencyPipe, RouterLink, Button, Icon, CheckoutLayout],
  templateUrl: './review-step.html',
  styleUrl: './review-step.scss',
})
export class ReviewStep {
  protected readonly store = inject(CheckoutStore);
  private readonly cart = inject(CartStore);
  private readonly orders = inject(OrderService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly errorBox = viewChild<ElementRef<HTMLElement>>('errorBox');

  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly payment = computed(() => paymentLabel(this.store.paymentMethod()));

  protected async confirm(): Promise<void> {
    const shipping = this.store.shipping();
    const shippingOption = this.store.selectedShippingOption();
    const paymentMethod = this.store.paymentMethod();
    if (!shipping || !shippingOption || !paymentMethod || this.submitting()) return;

    this.submitting.set(true);
    this.error.set(null);
    try {
      const order = await this.orders.place({
        items: this.cart.items(),
        shipping,
        shippingOption,
        paymentMethod,
        coupon: this.store.coupon(),
        subtotalInCents: this.store.subtotalInCents(),
        discountInCents: this.store.discountInCents(),
        shippingInCents: shippingOption.priceInCents,
        totalInCents: this.store.totalInCents(),
      });
      this.cart.clear();
      this.store.reset();
      await this.router.navigate(['/checkout', 'confirmacao', order.id]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Não foi possível confirmar o pedido.');
      // Leva o foco ao alerta para quem navega por teclado/leitor de tela.
      afterNextRender(() => this.errorBox()?.nativeElement.focus(), { injector: this.injector });
    } finally {
      this.submitting.set(false);
    }
  }
}
