import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { CheckoutStore } from '../data/checkout-store';
import { cartItem, providePtBr, readText } from '../data/testing';
import { CartPage } from './cart-page';

describe('CartPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), CheckoutStore, providePtBr()] });
  });

  const render = () => {
    const fixture = TestBed.createComponent(CartPage);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('vazio → EmptyState com link para a loja', () => {
    const { el } = render();
    expect(el.querySelector('h1')?.textContent).toBe('Seu carrinho está vazio');
    expect(el.querySelector('a[href="/"]')).not.toBeNull();
  });

  it('lista os itens, resumo e CTA para a entrega', () => {
    const cart = TestBed.inject(CartStore);
    cart.add(cartItem(), 2);
    cart.add(cartItem({ sku: 'MS-022', name: 'Caneca', slug: 'caneca', unitPriceInCents: 5_000 }));
    const { el } = render();
    expect(el.querySelector('h1')?.textContent).toBe('Carrinho');
    expect(el.querySelectorAll('merch-cart-line')).toHaveLength(2);
    expect(readText(el)).toContain('Subtotal (3 itens) R$ 250,00');
    expect(el.textContent).toContain('Calculado na entrega');
    expect(el.querySelector('a[href="/checkout/entrega"]')?.textContent).toContain('Continuar');
  });

  it('remover o último item volta ao estado vazio', () => {
    TestBed.inject(CartStore).add(cartItem());
    const { fixture, el } = render();
    (Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Remover')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.querySelector('h1')?.textContent).toBe('Seu carrinho está vazio');
  });
});
