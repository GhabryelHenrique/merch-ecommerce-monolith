import { Service, computed, inject, signal } from '@angular/core';
import { CartStore } from '@merch/shared/cart';
import { StorageService } from '@merch/shared/util';
import type { CheckoutStep, PaymentMethod, ShippingAddress, ShippingOptionId } from './models';
import { discountFor, isValidCoupon, normalizeCoupon, shippingOptionsFor } from './rules';

const STORAGE_KEY = 'merch.checkout.v1';

interface PersistedCheckout {
  shipping: ShippingAddress | null;
  shippingOption: ShippingOptionId | null;
  paymentMethod: PaymentMethod | null;
  coupon: string | null;
}

const EMPTY: PersistedCheckout = { shipping: null, shippingOption: null, paymentMethod: null, coupon: null };
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

/**
 * Estado do checkout. Escopo do DOMÍNIO (providers da rota /checkout), não `root`.
 * Lê o carrinho só pela API pública do `CartStore`. Persiste em sessionStorage
 * para sobreviver a um F5 no meio do fluxo.
 */
@Service({ autoProvided: false })
export class CheckoutStore {
  private readonly cart = inject(CartStore);
  private readonly storage = inject(StorageService);
  private readonly restored = { ...EMPTY, ...this.storage.session.get(STORAGE_KEY, isObject) } as PersistedCheckout;

  readonly shipping = signal<ShippingAddress | null>(this.restored.shipping);
  readonly shippingOption = signal<ShippingOptionId | null>(this.restored.shippingOption);
  readonly paymentMethod = signal<PaymentMethod | null>(this.restored.paymentMethod);
  readonly coupon = signal<string | null>(this.restored.coupon);

  readonly items = this.cart.items;
  readonly count = this.cart.count;
  readonly subtotalInCents = this.cart.subtotalInCents;
  readonly discountInCents = computed(() => discountFor(this.subtotalInCents(), this.coupon()));

  readonly shippingOptions = computed(() => {
    const address = this.shipping();
    return address ? shippingOptionsFor(address.cep, this.subtotalInCents()) : [];
  });
  readonly selectedShippingOption = computed(
    () => this.shippingOptions().find((o) => o.id === this.shippingOption()) ?? null,
  );
  /** `null` = ainda não calculado (sem endereço/opção). */
  readonly shippingInCents = computed(() => this.selectedShippingOption()?.priceInCents ?? null);
  readonly totalInCents = computed(
    () => this.subtotalInCents() - this.discountInCents() + (this.shippingInCents() ?? 0),
  );

  private readonly cartReady = computed(() => this.cart.count() > 0);
  private readonly shippingReady = computed(() => this.cartReady() && !!this.shipping() && !!this.selectedShippingOption());
  private readonly paymentReady = computed(() => this.shippingReady() && !!this.paymentMethod());

  canProceedTo(step: CheckoutStep): boolean {
    switch (step) {
      case 'carrinho':
        return true;
      case 'entrega':
        return this.cartReady();
      case 'pagamento':
        return this.shippingReady();
      case 'revisao':
        return this.paymentReady();
    }
  }

  /** Etapa válida mais avançada até `target` (usada pelos guards para redirecionar). */
  nearestAllowed(target: CheckoutStep): CheckoutStep {
    const order: CheckoutStep[] = ['carrinho', 'entrega', 'pagamento', 'revisao'];
    const allowed = order.slice(0, order.indexOf(target) + 1).filter((s) => this.canProceedTo(s));
    return allowed[allowed.length - 1] ?? 'carrinho';
  }

  /** Aplica o cupom; devolve `false` (e não altera nada) se for inválido. */
  applyCoupon(code: string): boolean {
    if (!isValidCoupon(code)) return false;
    this.coupon.set(normalizeCoupon(code));
    this.persist();
    return true;
  }

  removeCoupon(): void {
    this.coupon.set(null);
    this.persist();
  }

  saveShipping(address: ShippingAddress, option: ShippingOptionId): void {
    this.shipping.set(address);
    this.shippingOption.set(option);
    this.persist();
  }

  selectPayment(method: PaymentMethod): void {
    this.paymentMethod.set(method);
    this.persist();
  }

  /** Depois do pedido confirmado. */
  reset(): void {
    this.shipping.set(null);
    this.shippingOption.set(null);
    this.paymentMethod.set(null);
    this.coupon.set(null);
    this.storage.session.remove(STORAGE_KEY);
  }

  private persist(): void {
    const state: PersistedCheckout = {
      shipping: this.shipping(),
      shippingOption: this.shippingOption(),
      paymentMethod: this.paymentMethod(),
      coupon: this.coupon(),
    };
    this.storage.session.set(STORAGE_KEY, state);
  }
}
