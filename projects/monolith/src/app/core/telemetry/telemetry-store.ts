import {
  REQUEST_CONTEXT,
  Service,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { EMPTY_BOOT, type RenderTelemetry, isMerchRequestContext, isRenderTelemetry } from './telemetry';

const TELEMETRY_KEY = makeStateKey<RenderTelemetry>('merch.telemetry');

export type RenderOrigin = 'SSR' | 'CSR';

/**
 * Telemetria da renderização da página atual.
 *
 * No servidor lê `REQUEST_CONTEXT` (preenchido pelo `server.ts`) e grava no
 * TransferState; no navegador lê o TransferState. Sem dado nenhum, a página foi
 * montada só no navegador (rota `RenderMode.Client` ou build sem servidor).
 */
@Service()
export class TelemetryStore {
  private readonly transferState = inject(TransferState);
  private readonly requestContext = inject(REQUEST_CONTEXT, { optional: true });

  private readonly state = signal<RenderTelemetry | null>(this.restore());
  private readonly hydratedState = signal(false);

  readonly telemetry = this.state.asReadonly();
  readonly hydrated = this.hydratedState.asReadonly();
  readonly renderOrigin = computed<RenderOrigin>(() => (this.state() ? 'SSR' : 'CSR'));
  readonly boot = computed(() => this.state()?.boot ?? EMPTY_BOOT);

  /** Chamado só no navegador, depois da hidratação. */
  markHydrated(): void {
    if (this.state()) {
      this.hydratedState.set(true);
    }
  }

  private restore(): RenderTelemetry | null {
    if (isMerchRequestContext(this.requestContext)) {
      this.transferState.set(TELEMETRY_KEY, this.requestContext.telemetry);
      return this.requestContext.telemetry;
    }
    const transferred: unknown = this.transferState.get(TELEMETRY_KEY, null);
    return isRenderTelemetry(transferred) ? transferred : null;
  }
}
