import { Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/** Seletor de quantidade com `model()` — uso: `<merch-quantity-stepper [(value)]="qty" [max]="estoque" />`. */
@Component({
  selector: 'merch-quantity-stepper',
  imports: [Icon],
  template: `
    <div class="stepper" role="group" [attr.aria-label]="label()">
      <button
        type="button"
        class="step"
        [disabled]="disabled() || value() <= min()"
        [attr.aria-label]="decreaseLabel()"
        (click)="set(value() - 1)"
      >
        <merch-icon name="minus" [size]="18" />
      </button>
      <input
        type="number"
        inputmode="numeric"
        [min]="min()"
        [max]="max()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-label]="label()"
        (change)="onInput($event)"
      />
      <button
        type="button"
        class="step"
        [disabled]="disabled() || value() >= max()"
        [attr.aria-label]="increaseLabel()"
        (click)="set(value() + 1)"
      >
        <merch-icon name="plus" [size]="18" />
      </button>
    </div>
    @if (atLimit()) {
      <p class="hint" aria-live="polite">Máximo disponível: {{ max() }}</p>
    }
  `,
  styleUrl: './quantity-stepper.scss',
})
export class QuantityStepper {
  readonly value = model(1);
  readonly min = input(1);
  readonly max = input(99);
  readonly label = input('Quantidade');
  readonly disabled = input(false);

  protected readonly decreaseLabel = computed(() => `Diminuir ${this.label().toLowerCase()}`);
  protected readonly increaseLabel = computed(() => `Aumentar ${this.label().toLowerCase()}`);
  protected readonly atLimit = computed(() => this.max() > this.min() && this.value() >= this.max());

  protected set(next: number): void {
    const clamped = Math.min(Math.max(Math.round(next) || this.min(), this.min()), this.max());
    this.value.set(clamped);
  }

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.set(Number(input.value));
    input.value = String(this.value());
  }
}
