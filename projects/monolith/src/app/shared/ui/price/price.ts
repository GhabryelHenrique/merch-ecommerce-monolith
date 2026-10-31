import { CurrencyPipe } from '@angular/common';
import { Component, DEFAULT_CURRENCY_CODE, LOCALE_ID, computed, inject, input } from '@angular/core';

const MAX_INSTALLMENTS = 10;
const MIN_INSTALLMENT_IN_CENTS = 2_000;

/** Selo -X%, arredondado para baixo. 0 quando não é promoção. */
export function discountPercent(priceInCents: number, compareAtPriceInCents?: number): number {
  if (!compareAtPriceInCents || compareAtPriceInCents <= priceInCents) return 0;
  return Math.floor(((compareAtPriceInCents - priceInCents) / compareAtPriceInCents) * 100);
}

/** Maior N ≤ 10 com parcela ≥ R$ 20,00. `undefined` quando N < 2. */
export function installmentPlan(priceInCents: number): { count: number; valueInCents: number } | undefined {
  const count = Math.min(MAX_INSTALLMENTS, Math.floor(priceInCents / MIN_INSTALLMENT_IN_CENTS));
  return count >= 2 ? { count, valueInCents: priceInCents / count } : undefined;
}

/**
 * Preço em centavos, formatado só na exibição (pt-BR/BRL via CurrencyPipe).
 * A parte visual é `aria-hidden`; leitores de tela recebem uma frase completa.
 */
@Component({
  selector: 'merch-price',
  template: `
    <span class="visually-hidden">{{ spokenText() }}</span>
    <span class="visual" aria-hidden="true">
      @if (onSale()) {
        <s class="compare">{{ compareAtText() }}</s>
      }
      <span class="current" [class.current--sale]="onSale()">{{ priceText() }}</span>
      @if (discount() > 0) {
        <span class="discount">-{{ discount() }}%</span>
      }
      @if (installmentsText(); as text) {
        <span class="installments">{{ text }}</span>
      }
    </span>
  `,
  styleUrl: './price.scss',
  host: { '[class.price--lg]': "size() === 'lg'" },
})
export class Price {
  readonly priceInCents = input.required<number>();
  readonly compareAtPriceInCents = input<number>();
  readonly showInstallments = input(false);
  readonly size = input<'md' | 'lg'>('md');

  private readonly currency = new CurrencyPipe(inject(LOCALE_ID), inject(DEFAULT_CURRENCY_CODE));
  private readonly format = (cents: number) => this.currency.transform(cents / 100) ?? '';

  protected readonly discount = computed(() => discountPercent(this.priceInCents(), this.compareAtPriceInCents()));
  protected readonly onSale = computed(() => this.discount() > 0);
  protected readonly priceText = computed(() => this.format(this.priceInCents()));
  protected readonly compareAtText = computed(() => this.format(this.compareAtPriceInCents() ?? 0));

  protected readonly installmentsText = computed(() => {
    if (!this.showInstallments()) return undefined;
    const plan = installmentPlan(this.priceInCents());
    return plan ? `em até ${plan.count}x de ${this.format(plan.valueInCents)} sem juros` : undefined;
  });

  protected readonly spokenText = computed(() => {
    const base = this.onSale()
      ? `Preço promocional ${this.priceText()}, antes ${this.compareAtText()}`
      : `Preço ${this.priceText()}`;
    const installments = this.installmentsText();
    return installments ? `${base}, ${installments}` : base;
  });
}
