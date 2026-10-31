import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '@merch/shared/ui';
import { APP_CONFIG, StorageService } from '@merch/shared/util';

const DISMISSED_KEY = 'merch.promo.dismissed.v1';
const isString = (v: unknown): v is string => typeof v === 'string';

/**
 * Faixa promocional do topo. Dispensável: guarda a MENSAGEM dispensada,
 * então uma promoção nova (outro texto no config.json) volta a aparecer.
 */
@Component({
  selector: 'merch-promo-bar',
  imports: [RouterLink, Icon],
  templateUrl: './promo-bar.html',
  styleUrl: './promo-bar.scss',
})
export class PromoBar {
  private readonly storage = inject(StorageService);
  protected readonly promo = inject(APP_CONFIG).promo;

  private readonly dismissedMessage = signal(this.storage.local.get(DISMISSED_KEY, isString));

  protected readonly visible = computed(
    () => this.promo.message.length > 0 && this.dismissedMessage() !== this.promo.message,
  );
  /** `#newsletter` → link para o fragmento na página atual. */
  protected readonly fragment = this.promo.linkUrl.startsWith('#') ? this.promo.linkUrl.slice(1) : undefined;

  protected dismiss(): void {
    this.storage.local.set(DISMISSED_KEY, this.promo.message);
    this.dismissedMessage.set(this.promo.message);
  }
}
