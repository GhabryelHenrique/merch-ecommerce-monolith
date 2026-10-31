/**
 * Contrato de telemetria entre o servidor Node (`src/server.ts`) e o app.
 *
 * Arquivo sem Angular de propósito: o servidor importa os mesmos tipos e o mesmo
 * placeholder, então os dois lados não divergem.
 */

/**
 * O tempo de render só é conhecido depois que o HTML fica pronto. O app escreve este
 * placeholder (no DOM e no TransferState) e o `server.ts` troca pelo valor real antes
 * de responder.
 */
export const RENDER_MS_PLACEHOLDER = '__MERCH_RENDER_MS__';

/** Quanto a instância pagou para subir — o custo do cold start. */
export interface BootReport {
  /** Do início do processo até o runtime do Node ficar pronto. */
  readonly nodeMs: number;
  /** Do runtime pronto até o servidor escutar a porta (imports, app engine, Express). */
  readonly serverMs: number;
  readonly totalMs: number;
}

/** Fotografia da instância no momento em que renderizou esta página. */
export interface RenderTelemetry {
  /** Id aleatório gerado quando o processo sobe: muda a cada nova instância. */
  readonly instanceId: string;
  /** Quantas páginas esta instância já renderizou (1 = primeira). */
  readonly requestNumber: number;
  /** Primeira página renderizada pela instância: ela pagou o boot e o primeiro render. */
  readonly coldStart: boolean;
  readonly renderedAt: string;
  /** Milissegundos; no servidor é o placeholder até o HTML ficar pronto. */
  readonly renderMs: number | string;
  readonly uptimeMs: number;
  readonly inFlight: number;
  readonly peakInFlight: number;
  readonly port: string;
  /** `K_REVISION` do Cloud Run (ausente fora dele). */
  readonly revision: string | null;
  readonly platform: string;
  readonly boot: BootReport;
}

/**
 * Valor de `REQUEST_CONTEXT` passado pelo `server.ts` a cada render.
 * As origens só existem no servidor e não vão para o TransferState.
 */
export interface MerchRequestContext {
  readonly telemetry: RenderTelemetry;
  /** Origem que o navegador usa (`https://…run.app`). */
  readonly publicOrigin: string;
  /** Origem local da própria instância (`http://127.0.0.1:PORT`) para o HttpClient do servidor. */
  readonly loopbackOrigin: string;
}

export const EMPTY_BOOT: BootReport = { nodeMs: 0, serverMs: 0, totalMs: 0 };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function isRenderTelemetry(value: unknown): value is RenderTelemetry {
  return (
    isRecord(value) &&
    typeof value['instanceId'] === 'string' &&
    typeof value['requestNumber'] === 'number' &&
    typeof value['coldStart'] === 'boolean' &&
    typeof value['renderedAt'] === 'string' &&
    isRecord(value['boot'])
  );
}

export function isMerchRequestContext(value: unknown): value is MerchRequestContext {
  return (
    isRecord(value) &&
    isRenderTelemetry(value['telemetry']) &&
    typeof value['publicOrigin'] === 'string' &&
    typeof value['loopbackOrigin'] === 'string'
  );
}

/** `840` → "840ms"; `1534` → "1,53s". */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }
  return `${(ms / 1000).toFixed(2).replace('.', ',')}s`;
}
