import { PlatformLocation } from '@angular/common';
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

/**
 * `document.baseURI` no navegador. No SSR o DOM do servidor (domino) não implementa
 * `baseURI` e lança `NotYetImplemented`; aí a base sai do `PlatformLocation`, que no
 * servidor conhece a URL do request.
 */
function documentBaseUri(document: Document, location: PlatformLocation): string {
  try {
    if (document.baseURI) {
      return document.baseURI;
    }
  } catch {
    // segue para o PlatformLocation
  }
  return new URL(location.getBaseHrefFromDOM() || '/', location.href).href;
}

/** Captura base e documento no contexto de injeção e devolve um resolvedor reutilizável. */
export function injectAssetUrl(): (path: string) => string {
  const base = inject(ASSETS_BASE_URL);
  const document = inject(DOCUMENT);
  const location = inject(PlatformLocation);
  return (path) => resolveAssetUrl(path, base, documentBaseUri(document, location));
}

/** Atalho para uso direto em contexto de injeção (campos de classe, factories). */
export function assetUrl(path: string): string {
  return injectAssetUrl()(path);
}
