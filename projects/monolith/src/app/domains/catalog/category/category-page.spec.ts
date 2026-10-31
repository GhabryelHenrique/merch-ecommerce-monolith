import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { makeProduct, provideFakeProductApi, providePtBr } from '../data/testing';
import { CategoryPage } from './category-page';

const products = [
  ...Array.from({ length: 14 }, (_, i) =>
    makeProduct({ id: `c${i}`, slug: `camiseta-${i}`, name: `Camiseta ${i}`, priceInCents: 5_000 + i * 100, popularity: 100 - i }),
  ),
  makeProduct({ id: 'm1', slug: 'moletom', name: 'Moletom', subcategorySlug: 'moletons', priceInCents: 25_000, compareAtPriceInCents: 30_000 }),
  makeProduct({ id: 'l1', slug: 'caneca', name: 'Caneca', categorySlug: 'lifestyle', subcategorySlug: 'casa' }),
];

describe('CategoryPage', () => {
  const setup = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'c/:categorySlug', component: CategoryPage }], withComponentInputBinding()),
        provideFakeProductApi({ products }),
        providePtBr(),
        { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return { harness, el: harness.routeNativeElement as HTMLElement };
  };

  const names = (el: HTMLElement) => Array.from(el.querySelectorAll('h3 a')).map((a) => a.textContent?.trim());

  it('lista só a categoria, com título, contagem e primeira página de 12', async () => {
    const { el } = await setup('/c/vestuario');
    expect(el.querySelector('h1')?.textContent).toBe('Vestuário');
    expect(el.querySelector('.count')?.textContent).toBe('15 produtos');
    expect(names(el)).toHaveLength(12);
    expect(names(el)).not.toContain('Caneca');
  });

  it('lê filtros e ordenação da URL (query params como input)', async () => {
    const { el } = await setup('/c/vestuario?promocao=1');
    expect(names(el)).toEqual(['Moletom']);

    TestBed.resetTestingModule();
    const sorted = await setup('/c/vestuario?subcategoria=camisetas&ordem=maior-preco');
    expect(names(sorted.el)[0]).toBe('Camiseta 13');
  });

  it('"Carregar mais" mostra o restante', async () => {
    const { el, harness } = await setup('/c/vestuario');
    (Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Carregar mais')) as HTMLButtonElement).click();
    harness.detectChanges();
    expect(names(el)).toHaveLength(15);
    expect(el.textContent).not.toContain('Carregar mais');
  });

  it('mudar um filtro escreve na URL preservando os demais', async () => {
    const { el, harness } = await setup('/c/vestuario?ordem=menor-preco');
    const select = el.querySelector('#filtro-subcategoria') as HTMLSelectElement;
    select.value = 'moletons';
    select.dispatchEvent(new Event('change'));
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/c/vestuario?ordem=menor-preco&subcategoria=moletons');
  });

  it('sem resultados oferece limpar filtros', async () => {
    const { el, harness } = await setup('/c/lifestyle?promocao=1');
    expect(el.textContent).toContain('Nenhum produto encontrado');
    (Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Limpar filtros')) as HTMLButtonElement).click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/c/lifestyle');
  });

  it('categorias virtuais e categoria inexistente', async () => {
    const { el } = await setup('/c/promocoes');
    expect(el.querySelector('h1')?.textContent).toBe('Promoções');
    expect(names(el)).toEqual(['Moletom']);

    TestBed.resetTestingModule();
    const missing = await setup('/c/nao-existe');
    expect(missing.el.querySelector('h1')?.textContent).toBe('Categoria não encontrada');
  });
});
