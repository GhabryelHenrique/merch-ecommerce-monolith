import { TestBed } from '@angular/core/testing';
import { CartStore } from '@merch/shared/cart';
import { CheckoutStore } from '../../data/checkout-store';
import { cartItem } from '../../data/testing';
import { CouponForm } from './coupon-form';

describe('CouponForm', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const setup = () => {
    TestBed.configureTestingModule({ providers: [CheckoutStore] });
    TestBed.inject(CartStore).add(cartItem());
    const fixture = TestBed.createComponent(CouponForm);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const submit = async (code: string) => {
      const input = el.querySelector('#cupom') as HTMLInputElement;
      input.value = code;
      input.dispatchEvent(new Event('input'));
      (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { fixture, el, submit, store: TestBed.inject(CheckoutStore) };
  };

  it('código inválido mostra erro ligado ao campo', async () => {
    const { el, submit, store } = setup();
    await submit('ERRADO');
    const input = el.querySelector('#cupom') as HTMLInputElement;
    expect(el.querySelector('#cupom-erro')?.textContent).toContain('Cupom inválido');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('cupom-erro');
    expect(store.coupon()).toBeNull();
  });

  it('WORKSHOP10 aplica o desconto e permite remover', async () => {
    const { el, fixture, submit, store } = setup();
    await submit('workshop10');
    expect(store.coupon()).toBe('WORKSHOP10');
    expect(el.textContent).toContain('Cupom WORKSHOP10 aplicado');
    (el.querySelector('button.link') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(store.coupon()).toBeNull();
    expect(el.querySelector('#cupom')).not.toBeNull();
  });
});
