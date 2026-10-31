import {
  filterProducts,
  isOnSale,
  isSoldOut,
  normalizeText,
  popularProducts,
  relatedProducts,
  resolveCategoryView,
  searchProducts,
  sortProducts,
} from './catalog-query';
import type { Category } from './models';
import { makeProduct } from './testing';

const camiseta = makeProduct({
  id: '1',
  slug: 'camiseta',
  name: 'Camiseta Clássica',
  priceInCents: 7_990,
  popularity: 90,
  collectionSlugs: ['essenciais'],
  createdAt: '2025-01-01T00:00:00Z',
});
const moletom = makeProduct({
  id: '2',
  slug: 'moletom',
  name: 'Moletom Aurora',
  subcategorySlug: 'moletons',
  priceInCents: 25_990,
  compareAtPriceInCents: 29_990,
  popularity: 70,
  collectionSlugs: ['aurora'],
  badges: ['new'],
  createdAt: '2026-10-01T00:00:00Z',
});
const garrafa = makeProduct({
  id: '3',
  slug: 'garrafa',
  name: 'Garrafa Térmica',
  description: 'Aço inox',
  categorySlug: 'lifestyle',
  subcategorySlug: 'garrafas-canecas',
  priceInCents: 12_990,
  popularity: 95,
  featured: true,
  collectionSlugs: ['essenciais'],
  createdAt: '2025-06-01T00:00:00Z',
});
const esgotado = makeProduct({
  id: '4',
  slug: 'esgotado',
  name: 'Boné Esgotado',
  priceInCents: 35_000,
  popularity: 99,
  featured: true,
  variants: [{ sku: 'X', stock: 0 }],
});
const all = [camiseta, moletom, garrafa, esgotado];

const categories: Category[] = [
  {
    slug: 'vestuario',
    name: 'Vestuário',
    description: '',
    subcategories: [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'moletons', name: 'Moletons' },
    ],
  },
  { slug: 'lifestyle', name: 'Lifestyle', description: '', subcategories: [{ slug: 'garrafas-canecas', name: 'Garrafas e canecas' }] },
];

describe('predicados', () => {
  it('isOnSale exige compareAt maior que o preço', () => {
    expect(isOnSale(moletom)).toBe(true);
    expect(isOnSale(camiseta)).toBe(false);
    expect(isOnSale(makeProduct({ priceInCents: 100, compareAtPriceInCents: 100 }))).toBe(false);
  });

  it('isSoldOut quando nenhuma variante tem estoque', () => {
    expect(isSoldOut(esgotado)).toBe(true);
    expect(isSoldOut(camiseta)).toBe(false);
  });
});

describe('filterProducts', () => {
  it('sem filtros devolve tudo', () => {
    expect(filterProducts(all, {})).toHaveLength(4);
  });

  it('filtra por subcategoria, coleção, faixa de preço e promoção (combinados)', () => {
    expect(filterProducts(all, { subcategory: 'moletons' })).toEqual([moletom]);
    expect(filterProducts(all, { collection: 'essenciais' })).toEqual([camiseta, garrafa]);
    expect(filterProducts(all, { price: '100-200' })).toEqual([garrafa]);
    expect(filterProducts(all, { price: 'ate-100' }).map((p) => p.id)).toEqual(['1']);
    expect(filterProducts(all, { onSale: true })).toEqual([moletom]);
    expect(filterProducts(all, { collection: 'essenciais', price: 'ate-100' })).toEqual([camiseta]);
  });

  it('ignora faixa de preço desconhecida', () => {
    expect(filterProducts(all, { price: 'xyz' })).toHaveLength(4);
  });
});

describe('sortProducts', () => {
  it('relevância: disponíveis primeiro, depois destaque e popularidade', () => {
    expect(sortProducts(all).map((p) => p.id)).toEqual(['3', '1', '2', '4']);
  });

  it('menor e maior preço', () => {
    expect(sortProducts([moletom, camiseta, garrafa], 'menor-preco').map((p) => p.id)).toEqual(['1', '3', '2']);
    expect(sortProducts([moletom, camiseta, garrafa], 'maior-preco').map((p) => p.id)).toEqual(['2', '3', '1']);
  });

  it('novidades pela data de criação', () => {
    expect(sortProducts([camiseta, garrafa, moletom], 'novidades').map((p) => p.id)).toEqual(['2', '3', '1']);
  });

  it('não altera o array original', () => {
    const input = [camiseta, moletom];
    sortProducts(input, 'maior-preco');
    expect(input).toEqual([camiseta, moletom]);
  });
});

describe('searchProducts', () => {
  it('normaliza acentos e caixa', () => {
    expect(normalizeText('  Térmica, AÇO!  ')).toBe('termica aco');
    expect(searchProducts(all, 'TERMICA')).toEqual([garrafa]);
  });

  it('exige todos os termos e procura também em categoria e descrição', () => {
    expect(searchProducts(all, 'garrafa inox', categories)).toEqual([garrafa]);
    expect(searchProducts(all, 'moletons', categories)).toEqual([moletom]);
    expect(searchProducts(all, 'garrafa camiseta')).toEqual([]);
  });

  it('busca vazia não retorna nada', () => {
    expect(searchProducts(all, '   ')).toEqual([]);
  });

  it('prioriza termo no nome', () => {
    const descOnly = makeProduct({ id: '9', name: 'Kit', description: 'Inclui camiseta', popularity: 100 });
    expect(searchProducts([descOnly, camiseta], 'camiseta').map((p) => p.id)).toEqual(['1', '9']);
  });
});

describe('relatedProducts', () => {
  it('pontua subcategoria, categoria e coleção; exclui o próprio e esgotados', () => {
    const outraCamiseta = makeProduct({ id: '5', slug: 'outra', popularity: 10 });
    const result = relatedProducts(camiseta, [...all, outraCamiseta]);
    expect(result.map((p) => p.id)).toEqual(['5', '3', '2']);
    expect(result.some((p) => p.id === camiseta.id || p.id === esgotado.id)).toBe(false);
  });

  it('respeita o limite', () => {
    expect(relatedProducts(camiseta, all, 1)).toHaveLength(1);
  });
});

describe('popularProducts', () => {
  it('ordena por popularidade e ignora esgotados', () => {
    expect(popularProducts(all, 2).map((p) => p.id)).toEqual(['3', '1']);
  });
});

describe('resolveCategoryView', () => {
  it('categoria real filtra pela categoria', () => {
    const view = resolveCategoryView('lifestyle', categories);
    expect(view?.title).toBe('Lifestyle');
    expect(all.filter((p) => view?.matches(p))).toEqual([garrafa]);
  });

  it('visões virtuais: novidades, promoções e todos', () => {
    expect(all.filter((p) => resolveCategoryView('novidades', categories)?.matches(p))).toEqual([moletom]);
    expect(resolveCategoryView('novidades', categories)?.defaultSort).toBe('novidades');
    expect(all.filter((p) => resolveCategoryView('promocoes', categories)?.matches(p))).toEqual([moletom]);
    expect(all.filter((p) => resolveCategoryView('todos', categories)?.matches(p))).toHaveLength(4);
  });

  it('slug desconhecido devolve undefined', () => {
    expect(resolveCategoryView('nao-existe', categories)).toBeUndefined();
  });
});
