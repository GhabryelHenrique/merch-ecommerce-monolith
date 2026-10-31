import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutStore } from '../data/checkout-store';
import { providePtBr } from '../data/testing';
import { PaymentStep } from './payment-step';

describe('PaymentStep', () => {
  const setup = () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([]), CheckoutStore, providePtBr()] });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(PaymentStep);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const submit = () => {
      (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
      fixture.detectChanges();
    };
    return { fixture, el, submit, navigate, store: TestBed.inject(CheckoutStore) };
  };

  it('não existe NENHUM campo de cartão — só a escolha da forma de pagamento', () => {
    const { el } = setup();
    expect(el.querySelectorAll('input:not([type="radio"])')).toHaveLength(0);
    expect(Array.from(el.querySelectorAll('input[name="pagamento"]')).map((i) => (i as HTMLInputElement).value)).toEqual([
      'pix',
      'boleto',
      'cartao-teste',
    ]);
    expect(el.textContent).toContain('Ambiente de demonstração: nenhum pagamento é processado');
  });

  it('exige escolha; Pix mostra QR ilustrativo; salva e segue para a revisão', () => {
    const { fixture, el, submit, navigate, store } = setup();
    submit();
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Escolha uma forma de pagamento');
    expect(navigate).not.toHaveBeenCalled();

    (el.querySelector('input[value="pix"]') as HTMLInputElement).click();
    fixture.detectChanges();
    expect(el.querySelector('merch-pix-qr svg')).not.toBeNull();
    submit();
    expect(store.paymentMethod()).toBe('pix');
    expect(navigate).toHaveBeenCalledWith(['/checkout', 'revisao']);
  });
});
