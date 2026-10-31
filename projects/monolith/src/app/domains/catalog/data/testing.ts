import type { Product } from './models';

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
