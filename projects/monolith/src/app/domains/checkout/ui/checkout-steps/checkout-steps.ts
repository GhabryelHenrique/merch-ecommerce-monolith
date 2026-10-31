import { Component, computed, input } from '@angular/core';
import { Icon } from '@merch/shared/ui';
import { CHECKOUT_STEPS, type CheckoutStep } from '../../data/models';

/** Indicador de etapas: lista ordenada com `aria-current="step"` na etapa atual. */
@Component({
  selector: 'merch-checkout-steps',
  imports: [Icon],
  template: `
    <nav aria-label="Etapas do checkout">
      <ol class="steps">
        @for (step of steps(); track step.id; let i = $index) {
          <li
            class="step"
            [class.step--done]="step.done"
            [class.step--current]="step.current"
            [attr.aria-current]="step.current ? 'step' : null"
          >
            <span class="marker" aria-hidden="true">
              @if (step.done) {
                <merch-icon name="check" [size]="16" />
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="label">{{ step.label }}</span>
            @if (step.done) {
              <span class="visually-hidden">(concluída)</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './checkout-steps.scss',
})
export class CheckoutSteps {
  readonly current = input.required<CheckoutStep>();

  protected readonly steps = computed(() => {
    const currentIndex = CHECKOUT_STEPS.findIndex((s) => s.id === this.current());
    return CHECKOUT_STEPS.map((s, i) => ({ ...s, done: i < currentIndex, current: i === currentIndex }));
  });
}
