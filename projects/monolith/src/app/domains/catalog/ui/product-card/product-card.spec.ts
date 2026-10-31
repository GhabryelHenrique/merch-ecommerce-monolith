import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { makeProduct, providePtBr } from '../../data/testing';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  const render = (overrides: Parameters<typeof makeProduct>[0] = {}, priority = false) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), providePtBr(), { provide: IMAGE_LOADER, useValue: (c: { src: string }) => `https://cdn.test/${c.src}` }],
    });
    const fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', makeProduct(overrides));
    fixture.componentRef.setInput('priority', priority);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('mostra nome com link para a página do produto, imagem com alt e preço', () => {
    const el = render({ name: 'Camiseta Clássica', slug: 'camiseta-classica', priceInCents: 7_990 });
    const link = el.querySelector('h3 a') as HTMLAnchorElement;
    expect(link.textContent?.trim()).toBe('Camiseta Clássica');
    expect(link.getAttribute('href')).toBe('/p/camiseta-classica');
    expect(el.querySelector('img')?.getAttribute('alt')).toBe('Produto');
    expect(el.querySelector('img')?.getAttribute('src')).toBe('https://cdn.test/catalog/images/produto.svg');
    expect(el.querySelector('merch-price')?.textContent).toContain('79,90');
  });

  it('mostra selos de novo e mais vendido', () => {
    const el = render({ badges: ['new', 'bestseller'] });
    expect(Array.from(el.querySelectorAll('merch-badge')).map((b) => b.textContent)).toEqual(['Novo', 'Mais vendido']);
  });

  it('indica produto esgotado', () => {
    const el = render({ badges: ['new'], variants: [{ sku: 'X', stock: 0 }] });
    expect(Array.from(el.querySelectorAll('merch-badge')).map((b) => b.textContent)).toEqual(['Esgotado']);
    expect(el.querySelector('.card--soldout')).not.toBeNull();
  });

  it('mostra preço promocional quando há compareAt', () => {
    const el = render({ priceInCents: 8_990, compareAtPriceInCents: 12_990 });
    expect(el.querySelector('s')?.textContent).toContain('129,90');
  });

  it('marca prioridade só quando pedido', () => {
    expect(render({}, true).querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    TestBed.resetTestingModule();
    expect(render({}, false).querySelector('img')?.getAttribute('loading')).toBe('lazy');
  });
});
