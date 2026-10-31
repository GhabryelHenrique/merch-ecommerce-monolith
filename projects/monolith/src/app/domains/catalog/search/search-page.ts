import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button, EmptyState } from '@merch/shared/ui';
import { searchProducts } from '../data/catalog-query';
import { ProductApi } from '../data/product-api';
import { CatalogState } from '../ui/catalog-state/catalog-state';
import { ProductGrid } from '../ui/product-grid/product-grid';

/** Busca por `?q=` — contrato por URL com a caixa de busca do shell. */
@Component({
  selector: 'merch-search-page',
  imports: [RouterLink, Button, EmptyState, ProductGrid, CatalogState],
  templateUrl: './search-page.html',
  styleUrl: './search-page.scss',
})
export class SearchPage {
  private readonly api = inject(ProductApi);
  readonly q = input<string>();

  protected readonly term = computed(() => this.q()?.trim() ?? '');
  protected readonly loading = computed(() => this.api.products().length === 0 && !this.api.productsError());
  protected readonly error = this.api.productsError;
  protected readonly results = computed(() => searchProducts(this.api.products(), this.term(), this.api.categories()));
  protected readonly suggestions = this.api.categories;

  protected readonly countText = computed(() => {
    const n = this.results().length;
    return n === 1 ? '1 resultado' : `${n} resultados`;
  });

  protected retry(): void {
    this.api.reload();
  }
}
