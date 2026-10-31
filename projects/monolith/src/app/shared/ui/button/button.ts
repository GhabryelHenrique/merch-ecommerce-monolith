import { Component, ElementRef, inject, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Botão do design system aplicado como atributo, preservando a semântica nativa:
 * `<button merch-button>` para ações e `<a merch-button routerLink>` para navegação.
 */
@Component({
  selector: 'button[merch-button], a[merch-button]',
  template: `
    @if (loading()) {
      <span class="spinner" aria-hidden="true"></span>
      <span class="visually-hidden">Carregando: </span>
    }
    <span class="content"><ng-content /></span>
  `,
  styleUrl: './button.scss',
  host: {
    class: 'btn',
    '[class.btn--primary]': "variant() === 'primary'",
    '[class.btn--secondary]': "variant() === 'secondary'",
    '[class.btn--ghost]': "variant() === 'ghost'",
    '[class.btn--sm]': "size() === 'sm'",
    '[class.btn--lg]': "size() === 'lg'",
    '[class.btn--block]': 'block()',
    '[class.btn--loading]': 'loading()',
    '[attr.aria-busy]': 'loading() || null',
    '[attr.disabled]': "isButton && (disabled() || loading()) ? '' : null",
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly block = input(false);
  /** Mostra spinner, anuncia "Carregando" e desabilita (em `<button>`). */
  readonly loading = input(false);
  readonly disabled = input(false);

  protected readonly isButton = (inject(ElementRef).nativeElement as HTMLElement).tagName === 'BUTTON';
}
