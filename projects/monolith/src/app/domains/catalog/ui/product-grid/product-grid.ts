import { Component, input } from '@angular/core';
import type { Product } from '../../data/models';
import { ProductCard } from '../product-card/product-card';

/** Grade responsiva de produtos. As primeiras `priorityCount` imagens recebem `priority`. */
@Component({
  selector: 'merch-product-grid',
  imports: [ProductCard],
  template: `
    <ul role="list" class="grid">
      @for (product of products(); track product.id; let i = $index) {
        <li><merch-product-card [product]="product" [priority]="i < priorityCount()" /></li>
      }
    </ul>
  `,
  styleUrl: './product-grid.scss',
})
export class ProductGrid {
  readonly products = input.required<readonly Product[]>();
  readonly priorityCount = input(0);
}
