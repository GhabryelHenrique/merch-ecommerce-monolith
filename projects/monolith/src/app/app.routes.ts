import type { Routes } from '@angular/router';
import { InfoPage, NotFound } from '@merch/core';

/**
 * Ordem obrigatória (core/AGENTS.md): checkout, catálogo, `**`.
 * Domínios só por import() dinâmico: na fase 2 estes `loadChildren` viram `loadRemoteModule(...)`.
 * `ajuda/:topico` é conteúdo institucional do próprio shell (antes do catch-all do catálogo).
 */
export const routes: Routes = [
  {
    path: 'checkout',
    loadChildren: () => import('@merch/checkout').then((m) => m.CHECKOUT_ROUTES),
  },
  { path: 'ajuda/:topico', component: InfoPage, title: 'Ajuda · Merch Store' },
  {
    path: '',
    loadChildren: () => import('@merch/catalog').then((m) => m.CATALOG_ROUTES),
  },
  { path: '**', component: NotFound, title: 'Página não encontrada · Merch Store' },
];
