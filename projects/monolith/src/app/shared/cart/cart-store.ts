import { DestroyRef, Service, computed, inject, signal } from '@angular/core';
import { StorageService } from '@merch/shared/util';
import { type CartItem, isCartItem } from './cart-item';

/** Chave versionada: mudar o formato do snapshot = nova versão da chave. */
export const CART_STORAGE_KEY = 'merch.cart.v1';

const isUnknownArray = (v: unknown): v is unknown[] => Array.isArray(v);

/**
 * Único estado global da aplicação. API pública = contrato (ver shared/AGENTS.md).
 * Escrita só pelos métodos abaixo; leitura por signals somente-leitura.
 */
@Service()
export class CartStore {
  private readonly storage = inject(StorageService);
  private readonly state = signal<readonly CartItem[]>(this.restore());

  // leitura
  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.state().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotalInCents = computed(() =>
    this.state().reduce((sum, item) => sum + item.unitPriceInCents * item.quantity, 0),
  );

  constructor() {
    // Sincroniza entre abas: outra aba gravou → relê o storage.
    const stop = this.storage.onExternalChange(CART_STORAGE_KEY, () => this.state.set(this.restore()));
    inject(DestroyRef).onDestroy(stop);
  }

  // escrita
  /** Mesma sku → soma as quantidades, sempre limitada a `maxQuantity`. */
  add(item: Omit<CartItem, 'quantity'>, quantity = 1): void {
    const toAdd = Math.floor(quantity);
    if (toAdd <= 0 || item.maxQuantity <= 0) return;

    this.commit((items) => {
      const existing = items.find((i) => i.sku === item.sku);
      if (!existing) {
        return [...items, { ...item, quantity: Math.min(toAdd, item.maxQuantity) }];
      }
      // Snapshot mais recente vence (preço/estoque atualizados), quantidade acumula.
      const merged: CartItem = { ...item, quantity: Math.min(existing.quantity + toAdd, item.maxQuantity) };
      return items.map((i) => (i.sku === item.sku ? merged : i));
    });
  }

  /** Quantidade 0 (ou menor) remove o item. */
  updateQuantity(sku: string, quantity: number): void {
    const next = Math.floor(quantity);
    if (next <= 0) {
      this.remove(sku);
      return;
    }
    this.commit((items) =>
      items.map((i) => (i.sku === sku ? { ...i, quantity: Math.min(next, i.maxQuantity) } : i)),
    );
  }

  remove(sku: string): void {
    this.commit((items) => items.filter((i) => i.sku !== sku));
  }

  clear(): void {
    this.commit(() => []);
  }

  private commit(update: (items: readonly CartItem[]) => readonly CartItem[]): void {
    this.state.update(update);
    this.storage.local.set(CART_STORAGE_KEY, this.state());
  }

  /** Itens inválidos são descartados individualmente; nada quebra a aplicação. */
  private restore(): readonly CartItem[] {
    const raw = this.storage.local.get(CART_STORAGE_KEY, isUnknownArray) ?? [];
    return raw.filter(isCartItem).map((i) => ({ ...i, quantity: Math.min(i.quantity, i.maxQuantity) }));
  }
}
