import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { Button } from '@merch/shared/ui';
import { CheckoutStore } from '../../data/checkout-store';

/** Cupom com Signal Forms. Código inválido → erro no próprio campo. */
@Component({
  selector: 'merch-coupon-form',
  imports: [FormRoot, FormField, Button],
  template: `
    @if (store.coupon(); as applied) {
      <p class="applied" role="status">
        <span>Cupom <strong>{{ applied }}</strong> aplicado.</span>
        <button type="button" class="link" (click)="store.removeCoupon()">Remover cupom</button>
      </p>
    } @else {
      <form [formRoot]="couponForm" class="form">
        <label for="cupom" class="label">Cupom de desconto</label>
        <div class="row">
          <input
            id="cupom"
            autocomplete="off"
            autocapitalize="characters"
            [formField]="couponForm.code"
            [attr.aria-invalid]="!!error()"
            [attr.aria-describedby]="error() ? 'cupom-erro' : null"
            (input)="rejected.set(false)"
          />
          <button merch-button variant="secondary" type="submit">Aplicar</button>
        </div>
        @if (error(); as message) {
          <p id="cupom-erro" class="error">{{ message }}</p>
        }
      </form>
    }
  `,
  styleUrl: './coupon-form.scss',
})
export class CouponForm {
  protected readonly store = inject(CheckoutStore);
  protected readonly rejected = signal(false);

  private readonly model = signal({ code: '' });
  protected readonly couponForm = form(
    this.model,
    (path) => required(path.code, { message: 'Informe o código do cupom.' }),
    {
      submission: {
        action: async (f) => {
          const ok = this.store.applyCoupon(this.model().code);
          this.rejected.set(!ok);
          if (ok) f().reset({ code: '' });
        },
      },
    },
  );

  protected readonly error = computed(() => {
    if (this.rejected()) return 'Cupom inválido. Confira o código e tente de novo.';
    const field = this.couponForm.code();
    return field.touched() && field.invalid() ? (field.errors()[0]?.message ?? '') : '';
  });
}
