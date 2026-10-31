/**
 * Telemetria da instância Node (só servidor). Um processo = uma instância do Cloud Run:
 * tudo que fica no escopo do módulo vive enquanto a instância estiver quente.
 */
import { randomBytes } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import {
  type BootReport,
  EMPTY_BOOT,
  type MerchRequestContext,
  RENDER_MS_PLACEHOLDER,
} from './app/core/telemetry/telemetry';

/** Muda a cada processo novo: duas abas com ids diferentes = duas instâncias. */
const instanceId = randomBytes(3).toString('hex');
const startedAt = Date.now() - Math.round(performance.now());

let boot: BootReport = EMPTY_BOOT;
let renders = 0;
let inFlight = 0;
let peakInFlight = 0;

/** Chamado quando o servidor passa a escutar a porta: fecha a conta do boot. */
export function markServerReady(): BootReport {
  const nodeMs = Math.round(performance.nodeTiming.bootstrapComplete);
  const totalMs = Math.round(performance.now());
  boot = { nodeMs, serverMs: totalMs - nodeMs, totalMs };
  return boot;
}

const platform = (): string => {
  const service = process.env['K_SERVICE'];
  const runtime = `Node ${process.versions.node}`;
  return service ? `Cloud Run · ${service} · ${runtime}` : `local · ${runtime}`;
};

export interface RenderTracker {
  readonly context: MerchRequestContext;
  /** Troca o placeholder pelo tempo real e registra a linha de log. */
  finish(html: string): { html: string; renderMs: number };
  /** Libera o contador de requests em andamento (chamado no `close` da resposta). */
  release(): void;
}

export function beginRender(path: string, publicOrigin: string, loopbackOrigin: string, port: string): RenderTracker {
  const started = performance.now();
  renders += 1;
  inFlight += 1;
  peakInFlight = Math.max(peakInFlight, inFlight);
  const requestNumber = renders;
  const coldStart = requestNumber === 1;
  let released = false;

  const context: MerchRequestContext = {
    publicOrigin,
    loopbackOrigin,
    telemetry: {
      instanceId,
      requestNumber,
      coldStart,
      renderedAt: new Date().toISOString(),
      renderMs: RENDER_MS_PLACEHOLDER,
      uptimeMs: Date.now() - startedAt,
      inFlight,
      peakInFlight,
      port,
      revision: process.env['K_REVISION'] ?? null,
      platform: platform(),
      boot,
    },
  };

  return {
    context,
    finish(html) {
      const renderMs = Math.round(performance.now() - started);
      // No TransferState o placeholder é string JSON (com aspas): vira número.
      const out = html
        .replaceAll(`"${RENDER_MS_PLACEHOLDER}"`, String(renderMs))
        .replaceAll(RENDER_MS_PLACEHOLDER, String(renderMs));
      log({ path, renderMs, requestNumber, coldStart });
      return { html: out, renderMs };
    },
    release() {
      if (!released) {
        released = true;
        inFlight -= 1;
      }
    },
  };
}

/** Uma linha JSON por render: o Cloud Logging indexa os campos (filtro `jsonPayload.coldStart=true`). */
function log(entry: { path: string; renderMs: number; requestNumber: number; coldStart: boolean }): void {
  const label = entry.coldStart ? 'COLD START' : 'warm';
  console.log(
    JSON.stringify({
      severity: 'INFO',
      message: `SSR ${entry.path} ${entry.renderMs}ms [${label}] instância ${instanceId} #${entry.requestNumber}`,
      instanceId,
      revision: process.env['K_REVISION'] ?? null,
      ...entry,
      bootMs: boot.totalMs,
    }),
  );
}

/** `config.json` a partir de variáveis de ambiente (substitui o script do nginx). */
export function runtimeConfigFromEnv(): Record<string, unknown> | null {
  const env = process.env;
  if (!env['STORE_NAME'] && !env['APP_ENVIRONMENT']) {
    return null;
  }
  return {
    storeName: env['STORE_NAME'] ?? 'Merch Store',
    environment: env['APP_ENVIRONMENT'] ?? 'production',
    promo: {
      message: env['PROMO_MESSAGE'] ?? '',
      linkLabel: env['PROMO_LINK_LABEL'] ?? '',
      linkUrl: env['PROMO_LINK_URL'] ?? '/',
    },
    contact: {
      email: env['CONTACT_EMAIL'] ?? '',
      phone: env['CONTACT_PHONE'] ?? '',
      hours: env['CONTACT_HOURS'] ?? '',
    },
  };
}
