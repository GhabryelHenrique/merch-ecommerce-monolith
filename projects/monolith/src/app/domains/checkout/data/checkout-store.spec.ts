import { TestBed } from '@angular/core/testing';
import { CartStore } from '@merch/shared/cart';
import { CheckoutStore } from './checkout-store';
import { address, cartItem } from './testing';

describe('CheckoutStore', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [CheckoutStore] });
  });

  const setup = (quantity = 2, unit = 10_000) => {
    const cart = TestBed.inject(CartStore);
    if (quantity > 0) cart.add(cartItem({ unitPriceInCents: unit }), quantity);
    return { cart, store: TestBed.inject(CheckoutStore) };
  };

  it('subtotal vem do CartStore; frete ainda não calculado', () => {
    const { store } = setup();
    expect(store.subtotalInCents()).toBe(20_000);
    expect(store.shippingInCents()).toBeNull();
    expect(store.totalInCents()).toBe(20_000);
  });

  it('cupom válido dá 10%; inválido é recusado sem alterar o estado', () => {
    const { store } = setup();
    expect(store.applyCoupon('nada')).toBe(false);
    expect(store.coupon()).toBeNull();
    expect(store.applyCoupon('workshop10')).toBe(true);
    expect(store.coupon()).toBe('WORKSHOP10');
    expect(store.discountInCents()).toBe(2_000);
    expect(store.totalInCents()).toBe(18_000);
    store.removeCoupon();
    expect(store.discountInCents()).toBe(0);
  });

  it('frete e total a partir do endereço e da opção escolhida', () => {
    const { store } = setup();
    store.saveShipping(address({ cep: '01310-100' }), 'expresso');
    expect(store.shippingOptions().map((o) => o.id)).toEqual(['economico', 'expresso']);
    expect(store.shippingInCents()).toBe(3_490);
    expect(store.totalInCents()).toBe(20_000 + 3_490);
  });

  it('Econômico grátis acima de R$ 299,00', () => {
    const { store } = setup(3, 10_000);
    store.saveShipping(address(), 'economico');
    expect(store.shippingInCents()).toBe(0);
  });

  it('canProceedTo segue a ordem das etapas', () => {
    const { store, cart } = setup(0);
    expect(store.canProceedTo('carrinho')).toBe(true);
    expect(store.canProceedTo('entrega')).toBe(false);
    cart.add(cartItem());
    expect(store.canProceedTo('entrega')).toBe(true);
    expect(store.canProceedTo('pagamento')).toBe(false);
    store.saveShipping(address(), 'economico');
    expect(store.canProceedTo('pagamento')).toBe(true);
    expect(store.canProceedTo('revisao')).toBe(false);
    store.selectPayment('pix');
    expect(store.canProceedTo('revisao')).toBe(true);
    expect(store.nearestAllowed('revisao')).toBe('revisao');
    cart.clear();
    expect(store.nearestAllowed('revisao')).toBe('carrinho');
  });

  it('persiste em sessionStorage e restaura (sobrevive a F5)', () => {
    const { store } = setup();
    store.applyCoupon('WORKSHOP10');
    store.saveShipping(address(), 'expresso');
    store.selectPayment('boleto');

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CheckoutStore] });
    const restored = TestBed.inject(CheckoutStore);
    expect(restored.coupon()).toBe('WORKSHOP10');
    expect(restored.shipping()?.city).toBe('São Paulo');
    expect(restored.paymentMethod()).toBe('boleto');
  });

  it('reset limpa estado e storage', () => {
    const { store } = setup();
    store.selectPayment('pix');
    store.reset();
    expect(store.paymentMethod()).toBeNull();
    expect(sessionStorage.getItem('merch.checkout.v1')).toBeNull();
  });
});
