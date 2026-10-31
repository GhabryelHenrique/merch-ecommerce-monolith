import type { Category, Product, Subcategory } from './models';

// Funções puras de consulta ao catálogo: filtro, ordenação, busca e relacionados.
// Consumidas por `computed` nas páginas e testadas isoladamente.

export const isOnSale = (p: Product): boolean =>
  p.compareAtPriceInCents !== undefined && p.compareAtPriceInCents > p.priceInCents;

export const totalStock = (p: Product): number => p.variants.reduce((sum, v) => sum + v.stock, 0);

export const isSoldOut = (p: Product): boolean => totalStock(p) === 0;

// ---------------------------------------------------------------------------
// Filtros
// ---------------------------------------------------------------------------
export interface PriceRange {
  slug: string;
  label: string;
  minInCents: number;
  maxInCents: number; // exclusivo
}

export const PRICE_RANGES: readonly PriceRange[] = [
  { slug: 'ate-100', label: 'Até R$ 100', minInCents: 0, maxInCents: 10_000 },
  { slug: '100-200', label: 'R$ 100 a R$ 200', minInCents: 10_000, maxInCents: 20_000 },
  { slug: '200-300', label: 'R$ 200 a R$ 300', minInCents: 20_000, maxInCents: 30_000 },
  { slug: 'acima-300', label: 'Acima de R$ 300', minInCents: 30_000, maxInCents: Number.POSITIVE_INFINITY },
];

export interface ProductFilters {
  subcategory?: string;
  collection?: string;
  price?: string;
  onSale?: boolean;
}

export function filterProducts(products: readonly Product[], filters: ProductFilters): Product[] {
  const range = PRICE_RANGES.find((r) => r.slug === filters.price);
  return products.filter(
    (p) =>
      (!filters.subcategory || p.subcategorySlug === filters.subcategory) &&
      (!filters.collection || p.collectionSlugs.includes(filters.collection)) &&
      (!range || (p.priceInCents >= range.minInCents && p.priceInCents < range.maxInCents)) &&
      (!filters.onSale || isOnSale(p)),
  );
}

// ---------------------------------------------------------------------------
// Ordenação
// ---------------------------------------------------------------------------
export type SortOption = 'relevancia' | 'menor-preco' | 'maior-preco' | 'novidades';

export const SORT_OPTIONS: readonly { value: SortOption; label: string }[] = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'novidades', label: 'Novidades' },
];

export const isSortOption = (value: unknown): value is SortOption =>
  SORT_OPTIONS.some((o) => o.value === value);

/** Relevância: disponíveis primeiro, depois destaque e popularidade. Ordenação estável. */
export function sortProducts(products: readonly Product[], sort: SortOption = 'relevancia'): Product[] {
  const byRelevance = (a: Product, b: Product) =>
    Number(isSoldOut(a)) - Number(isSoldOut(b)) ||
    Number(b.featured) - Number(a.featured) ||
    b.popularity - a.popularity;

  const comparators: Record<SortOption, (a: Product, b: Product) => number> = {
    relevancia: byRelevance,
    'menor-preco': (a, b) => a.priceInCents - b.priceInCents || byRelevance(a, b),
    'maior-preco': (a, b) => b.priceInCents - a.priceInCents || byRelevance(a, b),
    novidades: (a, b) => b.createdAt.localeCompare(a.createdAt) || byRelevance(a, b),
  };
  return [...products].sort(comparators[sort]);
}

// ---------------------------------------------------------------------------
// Busca
// ---------------------------------------------------------------------------
/** Minúsculas, sem acentos e sem pontuação — "Moletom Aurora!" → "moletom aurora". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Todos os termos precisam aparecer (nome, descrição, categoria ou coleção).
 * Resultados com o termo no nome vêm primeiro; empate por popularidade.
 */
export function searchProducts(
  products: readonly Product[],
  query: string,
  categories: readonly Category[] = [],
): Product[] {
  const terms = normalizeText(query).split(' ').filter(Boolean);
  if (terms.length === 0) {
    return [];
  }
  const categoryText = new Map<string, string>();
  for (const c of categories) {
    categoryText.set(c.slug, c.name);
    for (const s of c.subcategories) categoryText.set(`${c.slug}/${s.slug}`, s.name);
  }

  const scored: { product: Product; score: number }[] = [];
  for (const p of products) {
    const name = normalizeText(p.name);
    const haystack = normalizeText(
      [
        p.name,
        p.description,
        p.categorySlug,
        p.subcategorySlug,
        categoryText.get(p.categorySlug) ?? '',
        categoryText.get(`${p.categorySlug}/${p.subcategorySlug}`) ?? '',
        ...p.collectionSlugs,
      ].join(' '),
    );
    if (terms.every((t) => haystack.includes(t))) {
      const score = terms.filter((t) => name.includes(t)).length;
      scored.push({ product: p, score });
    }
  }
  return scored
    .sort((a, b) => b.score - a.score || b.product.popularity - a.product.popularity)
    .map((s) => s.product);
}

// ---------------------------------------------------------------------------
// Relacionados e destaques
// ---------------------------------------------------------------------------
export function relatedProducts(product: Product, products: readonly Product[], limit = 4): Product[] {
  const score = (p: Product) =>
    (p.subcategorySlug === product.subcategorySlug ? 3 : 0) +
    (p.categorySlug === product.categorySlug ? 1 : 0) +
    p.collectionSlugs.filter((c) => product.collectionSlugs.includes(c)).length * 2;

  return products
    .filter((p) => p.id !== product.id && !isSoldOut(p))
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.popularity - a.p.popularity)
    .slice(0, limit)
    .map(({ p }) => p);
}

export function popularProducts(products: readonly Product[], limit = 8): Product[] {
  return products
    .filter((p) => !isSoldOut(p))
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Visões de categoria (reais + virtuais do menu: novidades, promoções, todos)
// ---------------------------------------------------------------------------
export interface CategoryView {
  slug: string;
  title: string;
  description: string;
  subcategories: readonly Subcategory[];
  matches: (p: Product) => boolean;
  defaultSort: SortOption;
}

const VIRTUAL_VIEWS: Record<string, Omit<CategoryView, 'slug' | 'subcategories'>> = {
  todos: {
    title: 'Todos os produtos',
    description: 'Todo o catálogo da Merch Store em um só lugar.',
    matches: () => true,
    defaultSort: 'relevancia',
  },
  novidades: {
    title: 'Novidades',
    description: 'Os lançamentos mais recentes da loja.',
    matches: (p) => p.badges.includes('new'),
    defaultSort: 'novidades',
  },
  promocoes: {
    title: 'Promoções',
    description: 'Produtos com preço especial por tempo limitado.',
    matches: isOnSale,
    defaultSort: 'relevancia',
  },
};

export function resolveCategoryView(slug: string, categories: readonly Category[]): CategoryView | undefined {
  const virtual = VIRTUAL_VIEWS[slug];
  if (virtual) {
    return { slug, subcategories: categories.flatMap((c) => c.subcategories), ...virtual };
  }
  const category = categories.find((c) => c.slug === slug);
  if (!category) {
    return undefined;
  }
  return {
    slug,
    title: category.name,
    description: category.description,
    subcategories: category.subcategories,
    matches: (p) => p.categorySlug === slug,
    defaultSort: 'relevancia',
  };
}
