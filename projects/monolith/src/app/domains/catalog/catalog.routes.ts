import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import type { Routes } from '@angular/router';
import { ASSETS_BASE_URL, injectAssetUrl } from '@merch/shared/util';
import { ProductApi } from './data/product-api';

/**
 * Rota pai `''` com os providers do domínio: o catálogo é autossuficiente
 * quando virar o remote `mfe-catalog` (fase 2).
 */
export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    providers: [
      ProductApi,
      // Monólito: mesma origem do shell. Fase 2: a origem do remote mfe-catalog.
      { provide: ASSETS_BASE_URL, useValue: '' },
      {
        provide: IMAGE_LOADER,
        useFactory: () => {
          const resolve = injectAssetUrl();
          return (config: ImageLoaderConfig) => resolve(config.src);
        },
      },
    ],
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Merch Store',
        loadComponent: () => import('./home/home-page').then((m) => m.HomePage),
      },
    ],
  },
];
