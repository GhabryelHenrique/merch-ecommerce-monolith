import { Component, inject, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@merch/shared/ui';
import { CheckoutStore } from '../data/checkout-store';
import type { PaymentMethod } from '../data/models';
import { PAYMENT_METHODS } from '../data/rules';
import { CheckoutLayout } from '../ui/checkout-layout/checkout-layout';
import { PixQr } from '../ui/pix-qr/pix-qr';

/** Pagamento FAKE: escolhe a forma, mas NÃO existem campos de cartão. */
@Component({
  selector: 'merch-payment-step',
  imports: [RouterLink, Button, CheckoutLayout, PixQr],
  templateUrl: './payment-step.html',
  styleUrl: './payment-step.scss',
})
export class PaymentStep {
  private readonly store = inject(CheckoutStore);
  private readonly router = inject(Router);

  protected readonly methods = PAYMENT_METHODS;
  protected readonly method = linkedSignal<PaymentMethod | null>(() => this.store.paymentMethod());
  protected readonly error = signal(false);

  protected choose(id: PaymentMethod): void {
    this.method.set(id);
    this.error.set(false);
  }

  protected continue(event: Event): void {
    event.preventDefault();
    const method = this.method();
    if (!method) {
      this.error.set(true);
      return;
    }
    this.store.selectPayment(method);
    void this.router.navigate(['/checkout', 'revisao']);
  }
}
