import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { resolveCategoryView } from './catalog-query';
import { ProductApi } from './product-api';

const STORE = 'Merch Store';
const titled = (text: string) => `${text} · ${STORE}`;

/** Título da categoria (real ou virtual) — espera os dados do domínio. */
export const categoryTitle: ResolveFn<string> = async (route) => {
  const api = inject(ProductApi);
  await api.ready();
  const view = resolveCategoryView(route.paramMap.get('categorySlug') ?? '', api.categories());
  return titled(view?.title ?? 'Categoria não encontrada');
};

export const searchTitle: ResolveFn<string> = (route) => {
  const q = route.queryParamMap.get('q')?.trim();
  return titled(q ? `Busca por “${q}”` : 'Busca');
};

export const productTitle: ResolveFn<string> = async (route) => {
  const api = inject(ProductApi);
  await api.ready();
  const product = api.productBySlug(route.paramMap.get('productSlug') ?? '');
  return titled(product?.name ?? 'Produto não encontrado');
};
