import { Service, inject } from '@angular/core';
import { StorageService } from '@merch/shared/util';
import type { Order } from './models';
import { FAILING_CEP } from './rules';

const STORAGE_KEY = 'merch.orders.v1';
export const ORDER_LATENCY_MS = 800;
const ID_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const isOrderMap = (v: unknown): v is Record<string, Order> => typeof v === 'object' && v !== null && !Array.isArray(v);

export class OrderFailedError extends Error {
  constructor() {
    super('Não foi possível confirmar o pedido. Tente novamente em instantes.');
    this.name = 'OrderFailedError';
  }
}

/**
 * "Backend" FAKE de pedidos: latência simulada, id MS-XXXXXX e resumo salvo em
 * sessionStorage. O CEP 99999-999 sempre falha (demonstração de erro).
 * Nenhum dado de pagamento existe aqui.
 */
@Service({ autoProvided: false })
export class OrderService {
  private readonly storage = inject(StorageService);

  async place(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    await new Promise((resolve) => setTimeout(resolve, ORDER_LATENCY_MS));
    if (order.shipping.cep === FAILING_CEP) {
      throw new OrderFailedError();
    }
    const placed: Order = { ...order, id: this.newId(), createdAt: new Date().toISOString() };
    this.storage.session.set(STORAGE_KEY, { ...this.all(), [placed.id]: placed });
    return placed;
  }

  get(id: string): Order | undefined {
    return this.all()[id];
  }

  private all(): Record<string, Order> {
    return this.storage.session.get(STORAGE_KEY, isOrderMap) ?? {};
  }

  private newId(): string {
    let suffix = '';
    for (let i = 0; i < 6; i++) suffix += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
    return `MS-${suffix}`;
  }
}
