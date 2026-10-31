import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { Icon } from '@merch/shared/ui';
import type { Product } from '../../data/models';
import { ProductCard } from '../product-card/product-card';

/**
 * Carrossel com CSS scroll-snap + botões anterior/próximo (sem biblioteca).
 * A lista continua navegável por Tab; os botões só rolam a faixa.
 */
@Component({
  selector: 'merch-product-carousel',
  imports: [ProductCard, Icon],
  templateUrl: './product-carousel.html',
  styleUrl: './product-carousel.scss',
})
export class ProductCarousel {
  readonly heading = input.required<string>();
  readonly headingId = input.required<string>();
  readonly products = input.required<readonly Product[]>();

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  protected readonly atStart = signal(true);
  protected readonly atEnd = signal(false);

  protected scroll(direction: 1 | -1): void {
    const el = this.track().nativeElement;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: 'smooth' });
  }

  protected onScroll(): void {
    const el = this.track().nativeElement;
    this.atStart.set(el.scrollLeft <= 1);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }
}
