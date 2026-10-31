import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CartStore } from '@merch/shared/cart';
import { ToastService } from '@merch/shared/ui';
import { ASSETS_BASE_URL } from '@merch/shared/util';
import { makeProduct, provideFakeProductApi, providePtBr } from '../data/testing';
import { ProductPage } from './product-page';

const tee = makeProduct({
  id: '001',
  slug: 'camiseta',
  name: 'Camiseta Clássica',
  priceInCents: 7_990,
  images: [
    { src: 'catalog/images/camiseta-preto.svg', alt: 'preta', width: 800, height: 800 },
    { src: 'catalog/images/camiseta-azul.svg', alt: 'azul', width: 800, height: 800 },
  ],
  options: {
    colors: [
      { slug: 'preto', label: 'Preto', hex: '#000000' },
      { slug: 'azul', label: 'Azul', hex: '#0000ff' },
    ],
    sizes: ['P', 'M'],
  },
  variants: [
    { sku: 'MS-001-PRETO-P', color: 'preto', size: 'P', stock: 0 },
    { sku: 'MS-001-PRETO-M', color: 'preto', size: 'M', stock: 0 },
    { sku: 'MS-001-AZUL-P', color: 'azul', size: 'P', stock: 2 },
    { sku: 'MS-001-AZUL-M', color: 'azul', size: 'M', stock: 0 },
  ],
});

describe('ProductPage', () => {
  beforeEach(() => localStorage.clear());

  const setup = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'p/:productSlug', component: ProductPage }], withComponentInputBinding()),
        provideFakeProductApi({ products: [tee, makeProduct({ id: '2', slug: 'outra', name: 'Outra Camiseta' })] }),
        providePtBr(),
        { provide: ASSETS_BASE_URL, useValue: 'https://catalog.example.com/' },
        { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    const el = harness.routeNativeElement as HTMLElement;
    const addButton = () =>
      Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Adicionar ao carrinho')) as HTMLButtonElement;
    return { harness, el, addButton };
  };

  it('mostra breadcrumb, nome, preço e começa na primeira cor com estoque', async () => {
    const { el } = await setup('/p/camiseta');
    expect(el.querySelector('h1')?.textContent).toBe('Camiseta Clássica');
    expect(el.querySelector('nav[aria-label="Trilha de navegação"]')).not.toBeNull();
    expect((el.querySelector('input[name="cor"][value="azul"]') as HTMLInputElement).checked).toBe(true);
    expect(el.querySelector('.main img')?.getAttribute('alt')).toBe('azul');
  });

  it('"Adicionar ao carrinho" só habilita com variante válida e explica o motivo', async () => {
    const { el, harness, addButton } = await setup('/p/camiseta');
    expect(addButton().disabled).toBe(true);
    expect(el.querySelector('#dica-compra')?.textContent).toBe('Selecione um tamanho.');
    expect(addButton().getAttribute('aria-describedby')).toBe('dica-compra');

    (el.querySelector('input[name="tamanho"][value="P"]') as HTMLInputElement).click();
    harness.detectChanges();
    expect(addButton().disabled).toBe(false);
    expect(el.querySelector('#dica-compra')).toBeNull();
  });

  it('quantidade limitada ao estoque da variante', async () => {
    const { el, harness } = await setup('/p/camiseta');
    (el.querySelector('input[name="tamanho"][value="P"]') as HTMLInputElement).click();
    harness.detectChanges();
    const plus = el.querySelector('button[aria-label="Aumentar quantidade"]') as HTMLButtonElement;
    plus.click();
    harness.detectChanges();
    expect(plus.disabled).toBe(true);
    expect((el.querySelector('merch-quantity-stepper input') as HTMLInputElement).value).toBe('2');
  });

  it('adiciona ao carrinho via CartStore (snapshot com URL absoluta) e mostra toast com link', async () => {
    const { el, harness, addButton } = await setup('/p/camiseta');
    (el.querySelector('input[name="tamanho"][value="P"]') as HTMLInputElement).click();
    harness.detectChanges();
    addButton().click();

    const cart = TestBed.inject(CartStore);
    expect(cart.count()).toBe(1);
    expect(cart.items()[0]).toEqual({
      sku: 'MS-001-AZUL-P',
      productId: '001',
      slug: 'camiseta',
      name: 'Camiseta Clássica',
      imageUrl: 'https://catalog.example.com/catalog/images/camiseta-azul.svg',
      unitPriceInCents: 7_990,
      variantLabel: 'Azul · Tam. P',
      maxQuantity: 2,
      quantity: 1,
    });
    const toast = TestBed.inject(ToastService).toasts()[0];
    expect(toast.message).toBe('Camiseta Clássica adicionado ao carrinho.');
    expect(toast.action).toEqual({ label: 'Ver carrinho', url: '/checkout/carrinho' });
  });

  it('slug inexistente mostra "Produto não encontrado" com link para a home', async () => {
    const { el } = await setup('/p/nao-existe');
    expect(el.querySelector('h1')?.textContent).toBe('Produto não encontrado');
    expect(el.querySelector('a[href="/"]')).not.toBeNull();
  });
});
