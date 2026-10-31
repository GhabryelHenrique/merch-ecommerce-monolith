import type { Routes } from '@angular/router';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    providers: [],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'carrinho' },
      {
        path: 'carrinho',
        title: 'Carrinho · Merch Store',
        loadComponent: () => import('./cart/cart-page').then((m) => m.CartPage),
      },
    ],
  },
];
