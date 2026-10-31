import { HTTP_TRANSFER_CACHE_ORIGIN_MAP, type HttpInterceptorFn } from '@angular/common/http';
import { REQUEST_CONTEXT, type Provider, inject } from '@angular/core';
import { type MerchRequestContext, isMerchRequestContext } from '../telemetry/telemetry';

const ABSOLUTE_URL = /^[a-z][a-z\d+.-]*:/i;

function requestContext(): MerchRequestContext | null {
  const context: unknown = inject(REQUEST_CONTEXT, { optional: true });
  return isMerchRequestContext(context) && context.loopbackOrigin !== context.publicOrigin ? context : null;
}

/** URL do próprio site (relativa ou com o host público) → mesma URL na origem local da instância. */
export function toLoopbackUrl(url: string, context: Pick<MerchRequestContext, 'publicOrigin' | 'loopbackOrigin'>): string | null {
  const resolved = new URL(url, `${context.publicOrigin}/`);
  if (ABSOLUTE_URL.test(url) && resolved.host !== new URL(context.publicOrigin).host) {
    return null;
  }
  return `${context.loopbackOrigin}${resolved.pathname}${resolved.search}`;
}

/**
 * Durante o SSR, `config.json` e os JSON do catálogo são pedidos à própria instância
 * (`http://127.0.0.1:PORT`) em vez da URL pública: no Cloud Run, sair pela URL pública
 * custaria latência e o request poderia cair em OUTRA instância — talvez fria.
 * No navegador não há `REQUEST_CONTEXT` e o interceptor não faz nada.
 */
export const ssrLoopbackInterceptor: HttpInterceptorFn = (req, next) => {
  const context = requestContext();
  const url = context ? toLoopbackUrl(req.url, context) : null;
  return next(url ? req.clone({ url }) : req);
};

/**
 * Só no servidor: diz ao transfer cache que a origem local equivale à pública, para o
 * navegador reaproveitar as respostas do SSR em vez de pedir tudo de novo.
 */
export function provideSsrTransferCacheOriginMap(): Provider {
  return {
    provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
    useFactory: (): Record<string, string> => {
      const context = requestContext();
      return context ? { [context.loopbackOrigin]: context.publicOrigin } : {};
    },
  };
}
