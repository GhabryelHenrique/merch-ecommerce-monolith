import { CurrencyPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';

/** Resumo de valores (centavos → formatação BRL só na exibição). */
@Component({
  selector: 'merch-order-summary',
  imports: [CurrencyPipe],
  template: `
    <section class="summary" aria-labelledby="resumo-titulo">
      <h2 id="resumo-titulo" class="title">Resumo do pedido</h2>
      <dl class="rows">
        <div class="row">
          <dt>Subtotal ({{ itemCountText() }})</dt>
          <dd>{{ subtotalInCents() / 100 | currency }}</dd>
        </div>
        @if (discountInCents() > 0) {
          <div class="row row--discount">
            <dt>Desconto{{ coupon() ? ' (' + coupon() + ')' : '' }}</dt>
            <dd>−{{ discountInCents() / 100 | currency }}</dd>
          </div>
        }
        <div class="row">
          <dt>Frete</dt>
          <dd>
            @if (shippingText(); as text) {
              {{ text }}
            } @else {
              {{ shippingReais() | currency }}
            }
          </dd>
        </div>
        <div class="row row--total">
          <dt>Total</dt>
          <dd>{{ totalInCents() / 100 | currency }}</dd>
        </div>
      </dl>
      <ng-content />
    </section>
  `,
  styleUrl: './order-summary.scss',
})
export class OrderSummary {
  readonly itemCount = input.required<number>();
  readonly subtotalInCents = input.required<number>();
  readonly discountInCents = input(0);
  readonly coupon = input<string | null>(null);
  /** `null` = ainda não calculado. */
  readonly shippingInCents = input<number | null>(null);
  readonly totalInCents = input.required<number>();

  protected readonly itemCountText = computed(() => (this.itemCount() === 1 ? '1 item' : `${this.itemCount()} itens`));
  protected readonly shippingReais = computed(() => (this.shippingInCents() ?? 0) / 100);
  protected readonly shippingText = computed(() => {
    const value = this.shippingInCents();
    if (value === null) return 'Calculado na entrega';
    return value === 0 ? 'Grátis' : null;
  });
}
