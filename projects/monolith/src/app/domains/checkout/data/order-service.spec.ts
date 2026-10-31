import { TestBed } from '@angular/core/testing';
import type { Order } from './models';
import { ORDER_LATENCY_MS, OrderFailedError, OrderService } from './order-service';
import { address, cartItem } from './testing';

const draft = (cep = '01310-100'): Omit<Order, 'id' | 'createdAt'> => ({
  items: [{ ...cartItem(), quantity: 1 }],
  shipping: address({ cep }),
  shippingOption: { id: 'economico', label: 'Econômico', priceInCents: 1_990, days: 6 },
  paymentMethod: 'pix',
  coupon: null,
  subtotalInCents: 10_000,
  discountInCents: 0,
  shippingInCents: 1_990,
  totalInCents: 11_990,
});

describe('OrderService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    TestBed.configureTestingModule({ providers: [OrderService] });
  });
  afterEach(() => vi.useRealTimers());

  it('confirma após a latência, gera id MS-XXXXXX e salva na sessão', async () => {
    const service = TestBed.inject(OrderService);
    let done = false;
    const promise = service.place(draft()).then((o) => ((done = true), o));
    await vi.advanceTimersByTimeAsync(ORDER_LATENCY_MS - 1);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const order = await promise;

    expect(order.id).toMatch(/^MS-[A-Z0-9]{6}$/);
    expect(service.get(order.id)?.totalInCents).toBe(11_990);
    expect(service.get('MS-NAOEXISTE')).toBeUndefined();
  });

  it('CEP 99999-999 simula falha', async () => {
    const service = TestBed.inject(OrderService);
    const promise = service.place(draft('99999-999'));
    const assertion = expect(promise).rejects.toBeInstanceOf(OrderFailedError);
    await vi.advanceTimersByTimeAsync(ORDER_LATENCY_MS);
    await assertion;
    expect(sessionStorage.getItem('merch.orders.v1')).toBeNull();
  });
});
