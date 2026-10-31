import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { CartBadge } from './cart-badge';

describe('CartBadge', () => {
  beforeEach(() => localStorage.clear());

  it('mostra a contagem do carrinho e atualiza na hora', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(CartBadge);
    fixture.detectChanges();
    const link = (fixture.nativeElement as HTMLElement).querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/checkout/carrinho');
    expect(link.getAttribute('aria-label')).toBe('Carrinho, vazio');
    expect(link.querySelector('.count')).toBeNull();

    TestBed.inject(CartStore).add(
      {
        sku: 'A',
        productId: '1',
        slug: 'a',
        name: 'A',
        imageUrl: 'http://x/a.svg',
        unitPriceInCents: 100,
        maxQuantity: 5,
      },
      2,
    );
    fixture.detectChanges();
    expect(link.getAttribute('aria-label')).toBe('Carrinho, 2 itens');
    expect(link.querySelector('.count')?.textContent).toBe('2');
  });
});
