import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon, ToastService } from '@merch/shared/ui';

/** Renderiza a fila do `ToastService`. Região viva sempre presente para o anúncio funcionar. */
@Component({
  selector: 'merch-toast-host',
  imports: [RouterLink, Icon],
  template: `
    <div class="region" role="status" aria-live="polite" aria-atomic="false">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class.toast--error]="toast.tone === 'error'">
          <merch-icon [name]="toast.tone === 'error' ? 'alert' : 'check'" [size]="20" />
          <p class="message">{{ toast.message }}</p>
          @if (toast.action; as action) {
            <a class="action" [routerLink]="action.url" (click)="dismiss(toast.id)">{{ action.label }}</a>
          }
          <button type="button" class="close" aria-label="Fechar aviso" (click)="dismiss(toast.id)">
            <merch-icon name="close" [size]="18" />
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast-host.scss',
})
export class ToastHost {
  private readonly service = inject(ToastService);
  protected readonly toasts = this.service.toasts;

  protected dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
