import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CartStore } from '@merch/shared/cart';
import { StorageService } from '@merch/shared/util';
import { checkoutStepGuard, orderExistsGuard } from './checkout-guards';
import { CheckoutStore } from './checkout-store';
import { OrderService } from './order-service';
import { address, cartItem } from './testing';

@Component({ template: '' })
class Blank {}

describe('guards do checkout', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: 'checkout',
            providers: [CheckoutStore, OrderService],
            children: [
              { path: 'carrinho', component: Blank },
              { path: 'entrega', component: Blank, canActivate: [checkoutStepGuard('entrega')] },
              { path: 'pagamento', component: Blank, canActivate: [checkoutStepGuard('pagamento')] },
              { path: 'revisao', component: Blank, canActivate: [checkoutStepGuard('revisao')] },
              { path: 'confirmacao/:orderId', component: Blank, canActivate: [orderExistsGuard] },
            ],
          },
        ]),
      ],
    });
  });

  let harness: RouterTestingHarness | undefined;
  beforeEach(() => (harness = undefined));

  const go = async (url: string) => {
    harness ??= await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    return TestBed.inject(Router).url;
  };

  it('carrinho vazio → volta para o carrinho', async () => {
    expect(await go('/checkout/entrega')).toBe('/checkout/carrinho');
    expect(await go('/checkout/revisao')).toBe('/checkout/carrinho');
  });

  it('sem entrega → pagamento redireciona para entrega', async () => {
    TestBed.inject(CartStore).add(cartItem());
    expect(await go('/checkout/pagamento')).toBe('/checkout/entrega');
  });

  it('com entrega mas sem pagamento → revisão redireciona para pagamento', async () => {
    sessionStorage.setItem(
      'merch.checkout.v1',
      JSON.stringify({ shipping: address(), shippingOption: 'economico', paymentMethod: null, coupon: null }),
    );
    TestBed.inject(CartStore).add(cartItem());
    expect(await go('/checkout/revisao')).toBe('/checkout/pagamento');
  });

  it('libera a etapa quando as anteriores são válidas', async () => {
    TestBed.inject(CartStore).add(cartItem());
    expect(await go('/checkout/entrega')).toBe('/checkout/entrega');
  });

  it('confirmação exige pedido existente na sessão', async () => {
    expect(await go('/checkout/confirmacao/MS-XXXXXX')).toBe('/checkout/carrinho');
    TestBed.inject(StorageService).session.set('merch.orders.v1', { 'MS-ABC234': { id: 'MS-ABC234' } });
    expect(await go('/checkout/confirmacao/MS-ABC234')).toBe('/checkout/confirmacao/MS-ABC234');
  });
});
