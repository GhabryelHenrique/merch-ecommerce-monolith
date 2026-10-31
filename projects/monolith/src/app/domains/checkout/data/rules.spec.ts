import { discountFor, isValidCoupon, normalizeCep, paymentLabel, shippingOptionsFor } from './rules';

describe('regras do checkout', () => {
  it('cupom WORKSHOP10 (sem diferenciar caixa/espaços) dá 10% do subtotal', () => {
    expect(isValidCoupon(' workshop10 ')).toBe(true);
    expect(isValidCoupon('OUTRO')).toBe(false);
    expect(discountFor(12_345, 'WORKSHOP10')).toBe(1_235);
    expect(discountFor(12_345, 'OUTRO')).toBe(0);
    expect(discountFor(12_345, null)).toBe(0);
  });

  it('normaliza CEP com ou sem hífen', () => {
    expect(normalizeCep('01310100')).toBe('01310-100');
    expect(normalizeCep('01310-100')).toBe('01310-100');
    expect(normalizeCep('0131-0100')).toBe('01310-100');
    expect(normalizeCep('1234')).toBeUndefined();
  });

  it('frete pelo primeiro dígito do CEP, com Econômico grátis acima de R$ 299,00', () => {
    expect(shippingOptionsFor('01310-100', 10_000)).toEqual([
      { id: 'economico', label: 'Econômico', priceInCents: 1_990, days: 6 },
      { id: 'expresso', label: 'Expresso', priceInCents: 3_490, days: 2 },
    ]);
    expect(shippingOptionsFor('69000-000', 10_000)[1]).toEqual({ id: 'expresso', label: 'Expresso', priceInCents: 4_990, days: 5 });
    expect(shippingOptionsFor('01310-100', 29_900)[0].priceInCents).toBe(1_990);
    expect(shippingOptionsFor('01310-100', 29_901)[0].priceInCents).toBe(0);
    expect(shippingOptionsFor('01310-100', 29_901)[1].priceInCents).toBe(3_490);
    expect(shippingOptionsFor('123', 10_000)).toEqual([]);
  });

  it('rótulo da forma de pagamento', () => {
    expect(paymentLabel('cartao-teste')).toBe('Cartão de teste');
    expect(paymentLabel(null)).toBe('');
  });
});
