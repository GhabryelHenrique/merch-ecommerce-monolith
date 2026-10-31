import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { cartItem, providePtBr } from '../../data/testing';
import { CartLine } from './cart-line';

describe('CartLine', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), providePtBr()] });
    const fixture = TestBed.createComponent(CartLine);
    fixture.componentRef.setInput('item', { ...cartItem({ maxQuantity: 3 }), quantity: 2 });
    const changes: number[] = [];
    let removed = false;
    fixture.componentInstance.quantityChange.subscribe((q) => changes.push(q));
    fixture.componentInstance.remove.subscribe(() => (removed = true));
    fixture.detectChanges();
    return { el: fixture.nativeElement as HTMLElement, changes, removed: () => removed };
  };

  it('mostra o snapshot: nome com link, variante, preço e imagem absoluta', () => {
    const { el } = setup();
    expect(el.querySelector('h3 a')?.getAttribute('href')).toBe('/p/camiseta-classica');
    expect(el.querySelector('.variant')?.textContent).toBe('Azul · Tam. M');
    expect(el.querySelector('merch-price')?.textContent).toContain('100,00');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('http://localhost/catalog/images/camiseta-classica-azul.svg');
  });

  it('altera quantidade (até maxQuantity) e remove', () => {
    const { el, changes, removed } = setup();
    (el.querySelector('button[aria-label="Aumentar quantidade de camiseta clássica"]') as HTMLButtonElement).click();
    expect(changes).toEqual([3]);
    (Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Remover')) as HTMLButtonElement).click();
    expect(removed()).toBe(true);
  });
});
