import { Component, computed, input, model } from '@angular/core';
import type { Product } from '../../data/models';
import { isColorAvailable, isSizeAvailable } from '../../data/variant';

/**
 * Cor e tamanho como grupos de rádio nativos (setas do teclado de graça).
 * Opção sem estoque fica DESABILITADA e anunciada como esgotada — nunca escondida.
 */
@Component({
  selector: 'merch-variant-picker',
  templateUrl: './variant-picker.html',
  styleUrl: './variant-picker.scss',
})
export class VariantPicker {
  readonly product = input.required<Product>();
  readonly color = model<string | undefined>(undefined);
  readonly size = model<string | undefined>(undefined);

  protected readonly colors = computed(() =>
    (this.product().options.colors ?? []).map((c) => ({
      ...c,
      available: isColorAvailable(this.product(), c.slug),
    })),
  );

  protected readonly sizes = computed(() =>
    (this.product().options.sizes ?? []).map((s) => ({
      value: s,
      available: isSizeAvailable(this.product(), s, this.color()),
    })),
  );

  protected readonly colorLabel = computed(() => this.colors().find((c) => c.slug === this.color())?.label);

  protected pickColor(slug: string): void {
    this.color.set(slug);
    // Tamanho escolhido que não existe na nova cor é descartado.
    const size = this.size();
    if (size && !isSizeAvailable(this.product(), size, slug)) this.size.set(undefined);
  }
}
