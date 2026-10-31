import { CurrencyPipe } from '@angular/common';
import { Component, ElementRef, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FormField, FormRoot, email, form, pattern, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { Button } from '@merch/shared/ui';
import { CheckoutStore } from '../data/checkout-store';
import type { ShippingAddress, ShippingOptionId } from '../data/models';
import { BRAZILIAN_STATES, normalizeCep, shippingOptionsFor } from '../data/rules';
import { CheckoutLayout } from '../ui/checkout-layout/checkout-layout';

type AddressModel = Omit<ShippingAddress, 'cep'> & { cep: string };

/** Estrutura mínima de um campo de Signal Forms usada para montar mensagens. */
type FieldLike = () => { touched(): boolean; invalid(): boolean; errors(): readonly { message?: string }[] };

const EMPTY: AddressModel = {
  name: '',
  email: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
};

/**
 * Entrega com Signal Forms. Validação ao sair do campo (touched) e no envio;
 * mensagens ligadas por `aria-describedby`; foco no primeiro campo inválido ao enviar.
 * Sem lib de máscara: o CEP aceita com ou sem hífen e é normalizado ao salvar.
 */
@Component({
  selector: 'merch-shipping-step',
  imports: [CurrencyPipe, FormRoot, FormField, Button, CheckoutLayout],
  templateUrl: './shipping-step.html',
  styleUrl: './shipping-step.scss',
})
export class ShippingStep {
  private readonly store = inject(CheckoutStore);
  private readonly router = inject(Router);
  /** `viewChild` devolve o primeiro rádio de frete (todos têm a mesma ref). */
  private readonly firstOption = viewChild<ElementRef<HTMLInputElement>>('firstOption');

  protected readonly states = BRAZILIAN_STATES;
  protected readonly model = signal<AddressModel>(this.store.shipping() ?? EMPTY);

  protected readonly address = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Informe o nome completo.' });
      required(path.email, { message: 'Informe o e-mail.' });
      email(path.email, { message: 'Informe um e-mail válido, como nome@exemplo.com.' });
      required(path.cep, { message: 'Informe o CEP.' });
      pattern(path.cep, /^\d{5}-?\d{3}$/, { message: 'Informe o CEP no formato 00000-000.' });
      required(path.street, { message: 'Informe a rua.' });
      required(path.number, { message: 'Informe o número.' });
      required(path.district, { message: 'Informe o bairro.' });
      required(path.city, { message: 'Informe a cidade.' });
      required(path.state, { message: 'Selecione a UF.' });
    },
    {
      submission: {
        action: async () => this.save(),
        onInvalid: (f) => f().errorSummary()[0]?.fieldTree().focusBoundControl(),
      },
    },
  );

  // Opções de frete reagem ao CEP digitado (quando válido).
  protected readonly options = computed(() => shippingOptionsFor(this.model().cep, this.store.subtotalInCents()));
  protected readonly option = linkedSignal<ShippingOptionId | null>(() => this.store.shippingOption());
  protected readonly optionError = signal(false);

  protected readonly errors = computed(() => {
    const f = this.address;
    return {
      name: this.message(f.name),
      email: this.message(f.email),
      cep: this.message(f.cep),
      street: this.message(f.street),
      number: this.message(f.number),
      district: this.message(f.district),
      city: this.message(f.city),
      state: this.message(f.state),
    };
  });

  protected chooseOption(id: ShippingOptionId): void {
    this.option.set(id);
    this.optionError.set(false);
  }

  private message(field: FieldLike): string {
    const state = field();
    return state.touched() && state.invalid() ? (state.errors()[0]?.message ?? '') : '';
  }

  private async save(): Promise<void> {
    const chosen = this.options().find((o) => o.id === this.option());
    if (!chosen) {
      this.optionError.set(true);
      this.firstOption()?.nativeElement.focus();
      return;
    }
    const value = this.model();
    const cep = normalizeCep(value.cep) ?? value.cep;
    this.store.saveShipping({ ...value, cep, name: value.name.trim(), email: value.email.trim() }, chosen.id);
    await this.router.navigate(['/checkout', 'pagamento']);
  }
}
