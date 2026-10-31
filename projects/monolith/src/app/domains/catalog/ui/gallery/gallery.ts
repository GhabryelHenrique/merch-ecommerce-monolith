import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, computed, input, model, viewChildren } from '@angular/core';
import type { ProductImage } from '../../data/models';

/**
 * Galeria com miniaturas. Teclado: Tab chega às miniaturas; ←/→, Home e End trocam a
 * imagem e movem o foco. A imagem principal é recriada a cada troca (`@for` com track
 * por src), já que o `ngSrc` do NgOptimizedImage não deve mudar depois de inicializado.
 */
@Component({
  selector: 'merch-gallery',
  imports: [NgOptimizedImage],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery {
  readonly images = input.required<readonly ProductImage[]>();
  readonly activeIndex = model(0);

  private readonly thumbs = viewChildren<ElementRef<HTMLButtonElement>>('thumb');

  protected readonly safeIndex = computed(() => Math.min(Math.max(this.activeIndex(), 0), this.images().length - 1));
  protected readonly current = computed(() => [this.images()[this.safeIndex()]]);

  protected select(index: number): void {
    this.activeIndex.set(index);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const last = this.images().length - 1;
    const moves: Record<string, number> = {
      ArrowRight: this.safeIndex() === last ? 0 : this.safeIndex() + 1,
      ArrowLeft: this.safeIndex() === 0 ? last : this.safeIndex() - 1,
      Home: 0,
      End: last,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    this.activeIndex.set(next);
    this.thumbs()[next]?.nativeElement.focus();
  }
}
