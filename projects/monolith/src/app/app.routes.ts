import type { Routes } from '@angular/router';
import { NotFound } from '@merch/core';

/**
 * Ordem obrigatória (core/AGENTS.md). Domínios só por import() dinâmico:
 * na fase 2 estes `loadChildren` viram `loadRemoteModule(...)`.
 */
export const routes: Routes = [
  {
    path: 'checkout',
    loadChildren: () => import('@merch/checkout').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: '',
    loadChildren: () => import('@merch/catalog').then((m) => m.CATALOG_ROUTES),
  },
  { path: '**', component: NotFound, title: 'Página não encontrada · Merch Store' },
];
