import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { type Request } from 'express';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { beginRender, markServerReady, runtimeConfigFromEnv } from './server-telemetry';

const browserDistFolder = join(import.meta.dirname, '../browser');
const port = process.env['PORT'] || '8080';

/** Só quando este módulo sobe o próprio servidor (Cloud Run, `npm run serve:ssr`). No `ng serve`, quem escuta é o CLI. */
let listening = false;

const app = express();
app.disable('x-powered-by');

/**
 * O Cloud Run termina o TLS no front-end do Google e repassa `X-Forwarded-Proto`.
 * Só esse cabeçalho é confiável aqui — host vem do próprio request.
 */
const angularApp = new AngularNodeAppEngine({ trustProxyHeaders: ['x-forwarded-proto'] });

const publicOriginOf = (req: Request): string => {
  const forwarded = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  return `${forwarded || req.protocol}://${req.get('host') ?? `localhost:${port}`}`;
};

/** CSP da fase 1 (imagens do site oficial liberadas). `scriptHashes` autoriza só os scripts inline daquela página. */
const contentSecurityPolicy = (scriptHashes: readonly string[] = []): string =>
  [
    ["script-src 'self'", ...scriptHashes.map((hash) => `'${hash}'`)].join(' '),
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://your.merch.google",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');

/**
 * O SSR com event replay emite scripts inline (contrato do jsaction). Em vez de
 * `'unsafe-inline'`, cada resposta HTML leva o hash exato dos scripts que contém.
 * Blocos `application/json` (TransferState) não executam e ficam de fora.
 */
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
const inlineScriptHashes = (html: string): string[] =>
  [...html.matchAll(INLINE_SCRIPT)]
    .filter(([, attrs = '']) => !/type=["']?application\/(?:ld\+)?json/i.test(attrs))
    .map(([, , body = '']) => `sha256-${createHash('sha256').update(body).digest('base64')}`);

// Mesmos cabeçalhos de segurança do nginx da fase 1.
app.use((_req, res, next) => {
  res.set({
    'Content-Security-Policy': contentSecurityPolicy(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  });
  next();
});

/** Config de runtime gerada das variáveis de ambiente: muda com nova revisão, sem rebuild. */
app.get('/config.json', (_req, res, next) => {
  const config = runtimeConfigFromEnv();
  if (!config) {
    next();
    return;
  }
  // Cache curto e público: com no-cache o Angular não leva a resposta no transfer cache e o
  // navegador pediria a config de novo depois do SSR.
  res.set('Cache-Control', 'public, max-age=60').json(config);
});

/** Arquivos com hash no nome são imutáveis; o resto (JSON do catálogo, SVGs) cacheia pouco. */
const HASHED = /[-.][A-Z0-9]{8,}\.(?:js|css)$/i;
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      res.setHeader(
        'Cache-Control',
        HASHED.test(filePath) ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
      );
    },
  }),
);

/**
 * Render por request com telemetria: cada página leva instância, nº do request, cold
 * start e o tempo real de render (placeholder trocado depois que o HTML fica pronto).
 */
app.use((req, res, next) => {
  const publicOrigin = publicOriginOf(req);
  const loopbackOrigin = listening ? `http://127.0.0.1:${port}` : publicOrigin;
  const render = beginRender(req.path, publicOrigin, loopbackOrigin, port);
  res.on('close', () => render.release());

  angularApp
    .handle(req, render.context)
    .then(async (response) => {
      if (!response) {
        render.release();
        next();
        return;
      }
      if (!response.headers.get('content-type')?.includes('text/html')) {
        await writeResponseToNodeResponse(response, res);
        return;
      }
      const { html, renderMs } = render.finish(await response.text());
      const headers = new Headers(response.headers);
      headers.delete('content-length');
      headers.set('Cache-Control', 'no-store');
      headers.set('Server-Timing', `render;dur=${renderMs}`);
      headers.set('Content-Security-Policy', contentSecurityPolicy(inlineScriptHashes(html)));
      await writeResponseToNodeResponse(
        new Response(html, { status: response.status, statusText: response.statusText, headers }),
        res,
      );
    })
    .catch(next);
});

/**
 * Sobe o servidor quando este módulo é o ponto de entrada (container / `npm run serve:ssr`).
 * No Cloud Run, `PORT` vem da plataforma (8080).
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  app.listen(Number(port), (error) => {
    if (error) {
      throw error;
    }
    listening = true;
    const boot = markServerReady();
    console.log(
      JSON.stringify({
        severity: 'INFO',
        message: `Servidor SSR pronto na porta ${port} em ${boot.totalMs}ms (Node ${boot.nodeMs}ms + app ${boot.serverMs}ms)`,
        boot,
        revision: process.env['K_REVISION'] ?? null,
      }),
    );
  });
}

/** Handler usado pelo Angular CLI (dev server e build). */
export const reqHandler = createNodeRequestHandler(app);
