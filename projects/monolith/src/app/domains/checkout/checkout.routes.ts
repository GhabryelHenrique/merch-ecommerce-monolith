import type { Routes } from '@angular/router';
import { checkoutStepGuard, orderExistsGuard } from './data/checkout-guards';
import { CheckoutStore } from './data/checkout-store';
import { OrderService } from './data/order-service';

const titled = (text: string) => `${text} · Merch Store`;

/**
 * Montado em /checkout. A rota pai fornece o estado do DOMÍNIO (escopo da rota,
 * não `root`): o remote mfe-checkout leva seus providers junto na fase 2.
 */
export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    providers: [CheckoutStore, OrderService],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'carrinho' },
      {
        path: 'carrinho',
        title: titled('Carrinho'),
        loadComponent: () => import('./cart/cart-page').then((m) => m.CartPage),
      },
      {
        path: 'entrega',
        title: titled('Entrega'),
        canActivate: [checkoutStepGuard('entrega')],
        loadComponent: () => import('./shipping/shipping-step').then((m) => m.ShippingStep),
      },
      {
        path: 'pagamento',
        title: titled('Pagamento'),
        canActivate: [checkoutStepGuard('pagamento')],
        loadComponent: () => import('./payment/payment-step').then((m) => m.PaymentStep),
      },
      {
        path: 'revisao',
        title: titled('Revisão do pedido'),
        canActivate: [checkoutStepGuard('revisao')],
        loadComponent: () => import('./review/review-step').then((m) => m.ReviewStep),
      },
      {
        path: 'confirmacao/:orderId',
        title: titled('Pedido confirmado'),
        canActivate: [orderExistsGuard],
        loadComponent: () => import('./confirmation/confirmation-page').then((m) => m.ConfirmationPage),
      },
    ],
  },
];
