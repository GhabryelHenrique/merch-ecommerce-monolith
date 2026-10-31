import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { CheckoutStore } from '../data/checkout-store';
import { ORDER_LATENCY_MS, OrderService } from '../data/order-service';
import { address, cartItem, providePtBr, readText } from '../data/testing';
import { ReviewStep } from './review-step';

describe('ReviewStep', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  const setup = (cep: string) => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), CheckoutStore, OrderService, providePtBr()] });
    const cart = TestBed.inject(CartStore);
    cart.add(cartItem(), 2);
    const store = TestBed.inject(CheckoutStore);
    store.applyCoupon('WORKSHOP10');
    store.saveShipping(address({ cep }), 'economico');
    store.selectPayment('boleto');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ReviewStep);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const confirmButton = () =>
      Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Confirmar pedido')) as HTMLButtonElement;
    return { fixture, el, cart, store, navigate, confirmButton };
  };

  it('resume itens, entrega, pagamento e total com desconto', () => {
    const { el } = setup('01310-100');
    const text = readText(el);
    expect(text).toContain('2× Camiseta Clássica');
    expect(text).toContain('CEP 01310-100');
    expect(text).toContain('Boleto');
    expect(text).toContain('Desconto (WORKSHOP10) −R$ 20,00');
    expect(text).toContain('Total R$ 199,90');
  });

  it('confirma: loading, limpa o carrinho e navega para a confirmação', async () => {
    const { fixture, cart, store, navigate, confirmButton } = setup('01310-100');
    confirmButton().click();
    fixture.detectChanges();
    expect(confirmButton().getAttribute('aria-busy')).toBe('true');
    await vi.advanceTimersByTimeAsync(ORDER_LATENCY_MS);

    expect(cart.count()).toBe(0);
    expect(store.paymentMethod()).toBeNull();
    const [[route]] = navigate.mock.calls as [[string[]]];
    expect(route.slice(0, 2)).toEqual(['/checkout', 'confirmacao']);
    expect(route[2]).toMatch(/^MS-[A-Z0-9]{6}$/);
  });

  it('CEP 99999-999: mostra erro com "Tentar novamente" e mantém o carrinho', async () => {
    const { fixture, el, cart, navigate, confirmButton } = setup('99999-999');
    confirmButton().click();
    await vi.advanceTimersByTimeAsync(ORDER_LATENCY_MS);
    fixture.detectChanges();

    const alert = el.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain('Pedido não confirmado');
    expect(alert?.querySelector('button')?.textContent).toContain('Tentar novamente');
    expect(cart.count()).toBe(2);
    expect(navigate).not.toHaveBeenCalled();
  });
});
