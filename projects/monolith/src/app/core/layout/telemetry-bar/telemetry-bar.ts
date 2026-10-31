import { Component, afterNextRender, computed, inject } from '@angular/core';
import { formatDuration } from '../../telemetry/telemetry';
import { TelemetryStore } from '../../telemetry/telemetry-store';

/**
 * Barra de telemetria da palestra de SSR no Cloud Run: mostra quem renderizou a
 * página (servidor ou navegador), em quanto tempo, em qual instância e se foi
 * o cold start dela.
 */
@Component({
  selector: 'merch-telemetry-bar',
  templateUrl: './telemetry-bar.html',
  styleUrl: './telemetry-bar.scss',
})
export class TelemetryBar {
  private readonly store = inject(TelemetryStore);

  protected readonly telemetry = this.store.telemetry;
  protected readonly renderOrigin = this.store.renderOrigin;
  protected readonly hydrated = this.store.hydrated;

  protected readonly renderedAtLabel = computed(() => {
    const iso = this.telemetry()?.renderedAt;
    if (!iso) {
      return '--:--:--';
    }
    const date = new Date(iso);
    const pad = (value: number, digits = 2) => String(value).padStart(digits, '0');
    return (
      `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
      `.${pad(date.getMilliseconds(), 3)}`
    );
  });

  /**
   * O que esta instância pagou para subir. Aparece em todo request, inclusive nos
   * quentes: no reload, a mesma instância mostra o mesmo custo de boot ao lado de um
   * render muitas vezes menor.
   */
  protected readonly bootLabel = computed(() => formatDuration(this.store.boot().totalMs));
  protected readonly showBoot = computed(() => this.store.boot().totalMs > 0);

  protected readonly uptimeLabel = computed(() => {
    const totalSeconds = Math.floor((this.telemetry()?.uptimeMs ?? 0) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
  });

  constructor() {
    // Só roda no navegador: prova de que a hidratação assumiu e de que os valores
    // vieram do TransferState, não de um novo request.
    afterNextRender(() => this.store.markHydrated());
  }
}
