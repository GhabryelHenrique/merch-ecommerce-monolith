import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { Button, ToastService } from '@merch/shared/ui';

/** Newsletter FAKE: valida e confirma, mas não envia nada para lugar nenhum. */
@Component({
  selector: 'merch-newsletter-form',
  imports: [FormRoot, FormField, Button],
  templateUrl: './newsletter-form.html',
  styleUrl: './newsletter-form.scss',
})
export class NewsletterForm {
  private readonly toasts = inject(ToastService);

  protected readonly model = signal({ email: '' });
  protected readonly newsletter = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Informe seu e-mail.' });
      email(path.email, { message: 'Informe um e-mail válido, como nome@exemplo.com.' });
    },
    {
      submission: {
        action: async (f) => {
          this.toasts.show('Inscrição confirmada! Use o cupom WORKSHOP10 no carrinho. (Demonstração: nenhum e-mail é enviado.)');
          f().reset({ email: '' });
        },
      },
    },
  );

  protected readonly showError = computed(
    () => this.newsletter.email().touched() && this.newsletter.email().invalid(),
  );
  protected readonly errorMessage = computed(() => this.newsletter.email().errors()[0]?.message ?? '');
}
