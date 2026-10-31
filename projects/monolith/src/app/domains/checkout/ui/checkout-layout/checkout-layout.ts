import { Component, inject, input } from '@angular/core';
import { CheckoutStore } from '../../data/checkout-store';
import type { CheckoutStep } from '../../data/models';
import { CheckoutSteps } from '../checkout-steps/checkout-steps';
import { DemoBanner } from '../demo-banner/demo-banner';
import { OrderSummary } from '../order-summary/order-summary';

/** Moldura comum das etapas: indicador, título, aviso de demonstração e resumo lateral. */
@Component({
  selector: 'merch-checkout-layout',
  imports: [CheckoutSteps, DemoBanner, OrderSummary],
  template: `
    <div class="checkout">
      <merch-checkout-steps [current]="step()" />
      <merch-demo-banner />
      <div class="grid">
        <div class="content">
          <h1 class="title">{{ heading() }}</h1>
          <ng-content />
        </div>
        <aside class="aside" aria-label="Resumo">
          <merch-order-summary
            [itemCount]="store.count()"
            [subtotalInCents]="store.subtotalInCents()"
            [discountInCents]="store.discountInCents()"
            [coupon]="store.coupon()"
            [shippingInCents]="store.shippingInCents()"
            [totalInCents]="store.totalInCents()"
          >
            <ng-content select="[summary]" />
          </merch-order-summary>
        </aside>
      </div>
    </div>
  `,
  styleUrl: './checkout-layout.scss',
})
export class CheckoutLayout {
  readonly step = input.required<CheckoutStep>();
  readonly heading = input.required<string>();
  protected readonly store = inject(CheckoutStore);
}
