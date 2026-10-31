import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Price, discountPercent, installmentPlan } from './price';

registerLocaleData(localePt);
const nbsp = (s: string | null | undefined) => (s ?? '').replace(/\s/g, ' ').trim();

describe('regras de preço', () => {
  it('desconto arredondado para baixo', () => {
    expect(discountPercent(8_990, 12_990)).toBe(30); // 30,79%
    expect(discountPercent(24_990, 29_990)).toBe(16); // 16,67%
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(100)).toBe(0);
  });

  it('parcelamento: maior N até 10 com parcela ≥ R$ 20,00; não exibe com N < 2', () => {
    expect(installmentPlan(34_990)).toEqual({ count: 10, valueInCents: 3_499 });
    expect(installmentPlan(12_990)).toEqual({ count: 6, valueInCents: 2_165 });
    expect(installmentPlan(4_000)).toEqual({ count: 2, valueInCents: 2_000 });
    expect(installmentPlan(3_999)).toBeUndefined();
  });
});

describe('Price', () => {
  const render = (inputs: Record<string, unknown>) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
      ],
    });
    const fixture = TestBed.createComponent(Price);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('preço simples formatado em BRL', () => {
    const el = render({ priceInCents: 7_990 });
    expect(nbsp(el.querySelector('.current')?.textContent)).toBe('R$ 79,90');
    expect(el.querySelector('s')).toBeNull();
    expect(nbsp(el.querySelector('.visually-hidden')?.textContent)).toBe('Preço R$ 79,90');
  });

  it('promoção: "de" riscado, "por" em destaque, selo -X% e texto para leitor de tela', () => {
    const el = render({ priceInCents: 8_990, compareAtPriceInCents: 12_990 });
    expect(nbsp(el.querySelector('s')?.textContent)).toBe('R$ 129,90');
    expect(el.querySelector('.current--sale')).not.toBeNull();
    expect(el.querySelector('.discount')?.textContent).toBe('-30%');
    expect(nbsp(el.querySelector('.visually-hidden')?.textContent)).toBe(
      'Preço promocional R$ 89,90, antes R$ 129,90',
    );
    expect(el.querySelector('.visual')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('parcelamento só quando pedido e possível', () => {
    expect(nbsp(render({ priceInCents: 34_990, showInstallments: true }).querySelector('.installments')?.textContent)).toBe(
      'em até 10x de R$ 34,99 sem juros',
    );
    TestBed.resetTestingModule();
    expect(render({ priceInCents: 2_990, showInstallments: true }).querySelector('.installments')).toBeNull();
    TestBed.resetTestingModule();
    expect(render({ priceInCents: 34_990 }).querySelector('.installments')).toBeNull();
  });
});
