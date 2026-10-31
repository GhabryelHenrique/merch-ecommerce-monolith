import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID, signal } from '@angular/core';
import type { Banners, Category, Collection, Product } from './models';
import { ProductApi } from './product-api';

/** Fábrica de produtos para testes do domínio. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    slug: 'produto',
    name: 'Produto',
    description: 'Descrição do produto',
    categorySlug: 'vestuario',
    subcategorySlug: 'camisetas',
    collectionSlugs: [],
    priceInCents: 10_000,
    images: [{ src: 'catalog/images/produto.svg', alt: 'Produto', width: 800, height: 800 }],
    options: {},
    variants: [{ sku: 'SKU-1', stock: 5 }],
    badges: [],
    featured: false,
    popularity: 50,
    createdAt: '2025-01-01T12:00:00.000Z',
    ...overrides,
  };
}

export const TEST_CATEGORIES: Category[] = [
  {
    slug: 'vestuario',
    name: 'Vestuário',
    description: 'Roupas',
    subcategories: [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'moletons', name: 'Moletons' },
    ],
  },
  { slug: 'lifestyle', name: 'Lifestyle', description: 'Casa', subcategories: [{ slug: 'casa', name: 'Casa' }] },
];

/** `ProductApi` falso (signals controláveis) para testar páginas sem HTTP. */
export function provideFakeProductApi(data: {
  products?: Product[];
  categories?: Category[];
  collections?: Collection[];
  banners?: Banners;
  error?: boolean;
}) {
  const products = signal<readonly Product[]>(data.products ?? []);
  const fake = {
    products,
    categories: signal<readonly Category[]>(data.categories ?? TEST_CATEGORIES),
    collections: signal<readonly Collection[]>(data.collections ?? []),
    banners: signal<Banners | undefined>(data.banners),
    productsError: signal(data.error ?? false),
    productBySlug: (slug: string) => products().find((p) => p.slug === slug),
    reload: vi.fn(),
    ready: () => Promise.resolve(),
  };
  return { provide: ProductApi, useValue: fake };
}

/** Locale da loja nos testes (pt-BR/BRL), como no app.config. */
export function providePtBr() {
  registerLocaleData(localePt);
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ];
}
