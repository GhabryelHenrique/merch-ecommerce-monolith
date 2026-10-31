import { RenderMode, type ServerRoute } from '@angular/ssr';

/**
 * Palestra de SSR: toda página do catálogo é renderizada por request (sem cache nem
 * prerender), para a barra de telemetria mostrar instância, cold start e tempo reais.
 * O checkout depende do carrinho no localStorage e não tem valor de SEO: fica no navegador.
 */
export const serverRoutes: ServerRoute[] = [
  { path: 'checkout', renderMode: RenderMode.Client },
  { path: 'checkout/**', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server },
];
