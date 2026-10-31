import { Component, input, output } from '@angular/core';
import { PRICE_RANGES, SORT_OPTIONS, type SortOption } from '../../data/catalog-query';
import type { Collection, Subcategory } from '../../data/models';

/** Mudança de um filtro. `null` remove o query param. */
export interface FilterChange {
  key: 'subcategoria' | 'colecao' | 'preco' | 'promocao' | 'ordem';
  value: string | null;
}

/**
 * Filtros e ordenação do catálogo. Componente "burro": recebe o estado (vindo da URL)
 * e emite mudanças; a página é quem escreve na URL.
 */
@Component({
  selector: 'merch-filter-bar',
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.scss',
})
export class FilterBar {
  readonly subcategories = input<readonly Subcategory[]>([]);
  readonly collections = input<readonly Collection[]>([]);
  readonly subcategory = input<string>();
  readonly collection = input<string>();
  readonly price = input<string>();
  readonly onSale = input(false);
  readonly sort = input<SortOption>('relevancia');
  readonly hasActiveFilters = input(false);

  readonly changed = output<FilterChange>();
  readonly cleared = output<void>();

  protected readonly priceRanges = PRICE_RANGES;
  protected readonly sortOptions = SORT_OPTIONS;

  protected select(key: FilterChange['key'], event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.changed.emit({ key, value: value || null });
  }

  protected toggleSale(event: Event): void {
    this.changed.emit({ key: 'promocao', value: (event.target as HTMLInputElement).checked ? '1' : null });
  }
}
