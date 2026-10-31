import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';
import { CheckoutStore } from './checkout-store';
import type { CheckoutStep } from './models';
import { OrderService } from './order-service';

/**
 * Guard funcional por etapa: se a etapa ainda não pode ser acessada,
 * redireciona para a etapa válida mais próxima (ex.: sem endereço → entrega).
 */
export function checkoutStepGuard(step: CheckoutStep): CanActivateFn {
  return () => {
    const store = inject(CheckoutStore);
    if (store.canProceedTo(step)) return true;
    return inject(Router).createUrlTree(['/checkout', store.nearestAllowed(step)]);
  };
}

/** Confirmação só existe para pedido salvo nesta sessão. */
export const orderExistsGuard: CanActivateFn = (route) => {
  const id = route.paramMap.get('orderId') ?? '';
  return inject(OrderService).get(id) ? true : inject(Router).createUrlTree(['/checkout', 'carrinho']);
};
