import { Component, input, output } from '@angular/core';
import { Button, EmptyState, Skeleton } from '@merch/shared/ui';

/** Estados de carregamento (grade de skeletons) e de erro (com "Tentar novamente"). */
@Component({
  selector: 'merch-catalog-state',
  imports: [Button, EmptyState, Skeleton],
  template: `
    @if (error()) {
      <merch-empty-state
        heading="Não foi possível carregar os produtos"
        description="Verifique sua conexão e tente de novo."
        icon="alert"
      >
        <button merch-button type="button" (click)="retry.emit()">Tentar novamente</button>
      </merch-empty-state>
    } @else {
      <div class="grid" aria-busy="true">
        <span class="visually-hidden" role="status">Carregando produtos…</span>
        @for (i of placeholders; track i) {
          <div class="card">
            <merch-skeleton aspectRatio="1 / 1" />
            <merch-skeleton shape="text" width="80%" />
            <merch-skeleton shape="text" width="40%" />
          </div>
        }
      </div>
    }
  `,
  styleUrl: './catalog-state.scss',
})
export class CatalogState {
  readonly error = input(false);
  readonly retry = output<void>();
  protected readonly placeholders = [1, 2, 3, 4, 5, 6, 7, 8];
}
