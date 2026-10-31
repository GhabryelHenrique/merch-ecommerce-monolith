import { DOCUMENT, InjectionToken, inject } from '@angular/core';

/**
 * Base de onde os assets de um domínio são servidos. Cada domínio fornece a sua
 * nos `providers` da própria rota. Vazio = mesma origem do documento (`document.baseURI`).
 * Na fase 2 o remote roda em outra origem e só este valor muda.
 */
export const ASSETS_BASE_URL = new InjectionToken<string>('ASSETS_BASE_URL', {
  factory: () => '',
});

/**
 * Resolve `path` contra a base do domínio e devolve SEMPRE uma URL absoluta.
 * Barras iniciais são ignoradas de propósito: um caminho "absoluto" fixo (`/catalog/…`)
 * quebraria quando o domínio rodar em outra origem. URLs já absolutas passam intactas.
 */
export function resolveAssetUrl(path: string, base: string, documentBaseUri: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path)) {
    return path;
  }
  const root = new URL(base || '.', documentBaseUri).href;
  const normalizedRoot = root.endsWith('/') ? root : `${root}/`;
  return new URL(path.replace(/^\/+/, ''), normalizedRoot).href;
}

/** Captura base e documento no contexto de injeção e devolve um resolvedor reutilizável. */
export function injectAssetUrl(): (path: string) => string {
  const base = inject(ASSETS_BASE_URL);
  const document = inject(DOCUMENT);
  return (path) => resolveAssetUrl(path, base, document.baseURI);
}

/** Atalho para uso direto em contexto de injeção (campos de classe, factories). */
export function assetUrl(path: string): string {
  return injectAssetUrl()(path);
}
