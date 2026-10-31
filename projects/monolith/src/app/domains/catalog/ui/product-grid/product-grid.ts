import { Component, input } from '@angular/core';
import type { Product } from '../../data/models';
import { ProductCard } from '../product-card/product-card';

/**
 * Grade responsiva de produtos. As primeiras `priorityCount` imagens recebem `priority`.
 * O `@if` recria o card quando ele cruza a fronteira de prioridade (ex.: após filtrar):
 * o NgOptimizedImage não aceita mudar `priority` depois de inicializado (NG02953).
 */
@Component({
  selector: 'merch-product-grid',
  imports: [ProductCard],
  template: `
    <ul role="list" class="grid">
      @for (product of products(); track product.id; let i = $index) {
        <li>
          @if (i < priorityCount()) {
            <merch-product-card [product]="product" [priority]="true" />
          } @else {
            <merch-product-card [product]="product" />
          }
        </li>
      }
    </ul>
  `,
  styleUrl: './product-grid.scss',
})
export class ProductGrid {
  readonly products = input.required<readonly Product[]>();
  readonly priorityCount = input(0);
}
