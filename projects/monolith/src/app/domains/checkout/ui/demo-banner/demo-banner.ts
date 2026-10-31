import { Component } from '@angular/core';
import { Icon } from '@merch/shared/ui';

/** Aviso fixo do checkout: nada é cobrado e nenhum dado de pagamento é pedido. */
@Component({
  selector: 'merch-demo-banner',
  imports: [Icon],
  template: `
    <p class="banner" role="note">
      <merch-icon name="lock" [size]="20" />
      <span><strong>Ambiente de demonstração:</strong> nenhum pagamento é processado.</span>
    </p>
  `,
  styles: `
    .banner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border: var(--border-width) solid var(--color-warning);
      border-radius: var(--radius-md);
      background: var(--color-warning-soft);
      color: var(--color-warning);
      font-size: var(--font-size-sm);
    }
  `,
})
export class DemoBanner {}
