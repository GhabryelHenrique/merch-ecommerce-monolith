import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { Component, computed, input } from '@angular/core';
import { Icon } from '@merch/shared/ui';
import type { Collection, Product } from '../../data/models';

/** Detalhes do produto em accordion (`@angular/aria`): descrição, especificações e entrega. */
@Component({
  selector: 'merch-product-details',
  imports: [AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent, Icon],
  templateUrl: './product-details.html',
  styleUrl: './product-details.scss',
})
export class ProductDetails {
  readonly product = input.required<Product>();
  readonly collections = input<readonly Collection[]>([]);

  protected readonly collectionNames = computed(() =>
    this.product()
      .collectionSlugs.map((slug) => this.collections().find((c) => c.slug === slug)?.name ?? slug)
      .join(', '),
  );
}
