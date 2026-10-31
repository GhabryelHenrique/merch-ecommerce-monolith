import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { StorageService } from '@merch/shared/util';
import { OrderService } from '../data/order-service';
import { address, cartItem, providePtBr, readText } from '../data/testing';
import { ConfirmationPage } from './confirmation-page';

describe('ConfirmationPage', () => {
  it('mostra número do pedido, resumo e link para continuar comprando', () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), OrderService, providePtBr()] });
    TestBed.inject(StorageService).session.set('merch.orders.v1', {
      'MS-ABC234': {
        id: 'MS-ABC234',
        createdAt: '2026-10-31T12:00:00Z',
        items: [{ ...cartItem(), quantity: 2 }],
        shipping: address(),
        shippingOption: { id: 'expresso', label: 'Expresso', priceInCents: 3_490, days: 2 },
        paymentMethod: 'pix',
        coupon: null,
        subtotalInCents: 20_000,
        discountInCents: 0,
        shippingInCents: 3_490,
        totalInCents: 23_490,
      },
    });
    const fixture = TestBed.createComponent(ConfirmationPage);
    fixture.componentRef.setInput('orderId', 'MS-ABC234');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const text = readText(el);
    expect(el.querySelector('h1')?.textContent).toBe('Pedido confirmado!');
    expect(text).toContain('MS-ABC234');
    expect(text).toContain('Total R$ 234,90');
    expect(text).toContain('Pix');
    expect(el.querySelector('a[href="/"]')).not.toBeNull();
  });
});
