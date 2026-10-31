import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Breadcrumb, Button, EmptyState } from '@merch/shared/ui';
import {
  type ProductFilters,
  type SortOption,
  filterProducts,
  isSortOption,
  resolveCategoryView,
  sortProducts,
} from '../data/catalog-query';
import { ProductApi } from '../data/product-api';
import { CatalogState } from '../ui/catalog-state/catalog-state';
import { FilterBar, type FilterChange } from '../ui/filter-bar/filter-bar';
import { ProductGrid } from '../ui/product-grid/product-grid';

const PAGE_SIZE = 12;
const FILTER_KEYS: readonly FilterChange['key'][] = ['subcategoria', 'colecao', 'preco', 'promocao'];

/**
 * Listagem por categoria. TODO o estado de filtro/ordenação mora na URL
 * (query params lidos como `input()`): links compartilháveis e voltar/avançar funcionam.
 */
@Component({
  selector: 'merch-category-page',
  imports: [RouterLink, Breadcrumb, Button, EmptyState, FilterBar, ProductGrid, CatalogState],
  templateUrl: './category-page.html',
  styleUrl: './category-page.scss',
})
export class CategoryPage {
  private readonly api = inject(ProductApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Path param + query params (withComponentInputBinding)
  readonly categorySlug = input.required<string>();
  readonly subcategoria = input<string>();
  readonly colecao = input<string>();
  readonly preco = input<string>();
  readonly promocao = input<string>();
  readonly ordem = input<string>();

  protected readonly loading = computed(() => this.api.products().length === 0 && !this.api.productsError());
  protected readonly error = this.api.productsError;
  protected readonly collections = this.api.collections;

  protected readonly view = computed(() => resolveCategoryView(this.categorySlug(), this.api.categories()));
  protected readonly notFound = computed(() => this.api.categories().length > 0 && !this.view());

  protected readonly sort = computed<SortOption>(() => {
    const requested = this.ordem();
    return isSortOption(requested) ? requested : (this.view()?.defaultSort ?? 'relevancia');
  });

  protected readonly filters = computed<ProductFilters>(() => ({
    subcategory: this.subcategoria(),
    collection: this.colecao(),
    price: this.preco(),
    onSale: this.promocao() === '1',
  }));

  protected readonly hasActiveFilters = computed(() => {
    const f = this.filters();
    return Boolean(f.subcategory || f.collection || f.price || f.onSale);
  });

  protected readonly results = computed(() => {
    const view = this.view();
    if (!view) return [];
    const inCategory = this.api.products().filter(view.matches);
    return sortProducts(filterProducts(inCategory, this.filters()), this.sort());
  });

  /** "Carregar mais": volta para a primeira página sempre que categoria/filtro/ordem mudam. */
  protected readonly visibleCount = linkedSignal({
    source: () => [this.categorySlug(), this.filters(), this.sort()],
    computation: () => PAGE_SIZE,
  });
  protected readonly visible = computed(() => this.results().slice(0, this.visibleCount()));
  protected readonly remaining = computed(() => this.results().length - this.visible().length);

  protected readonly countText = computed(() => {
    const total = this.results().length;
    return total === 1 ? '1 produto' : `${total} produtos`;
  });

  protected readonly breadcrumb = computed(() => [
    { label: 'Início', url: '/' },
    { label: this.view()?.title ?? 'Categoria' },
  ]);

  protected loadMore(): void {
    this.visibleCount.update((n) => n + PAGE_SIZE);
  }

  protected retry(): void {
    this.api.reload();
  }

  protected applyFilter(change: FilterChange): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { [change.key]: change.value },
      queryParamsHandling: 'merge',
    });
  }

  protected clearFilters(): void {
    const reset = Object.fromEntries(FILTER_KEYS.map((k) => [k, null]));
    void this.router.navigate([], { relativeTo: this.route, queryParams: reset, queryParamsHandling: 'merge' });
  }
}
