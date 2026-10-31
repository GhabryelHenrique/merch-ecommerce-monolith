import { Component, inject } from '@angular/core';
import { CartStore } from '@merch/shared/cart';
import { Badge, Breadcrumb, Button, EmptyState, Price, QuantityStepper, Skeleton } from '@merch/shared/ui';
import { ProductApi } from '../data/product-api';

@Component({
  selector: 'merch-home-page',
  imports: [Badge, Breadcrumb, Button, EmptyState, Price, QuantityStepper, Skeleton],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  protected readonly api = inject(ProductApi);
  protected readonly cart = inject(CartStore);
}
