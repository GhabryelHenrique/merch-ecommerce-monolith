import type { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    providers: [],
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
