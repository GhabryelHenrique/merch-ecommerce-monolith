import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { CheckoutStore } from '../data/checkout-store';
import { cartItem, providePtBr } from '../data/testing';
import { ShippingStep } from './shipping-step';

describe('ShippingStep', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const setup = async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), CheckoutStore, providePtBr()] });
    TestBed.inject(CartStore).add(cartItem(), 1);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ShippingStep);
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    fixture.detectChanges();
    await fixture.whenStable();

    const type = (id: string, value: string) => {
      const input = el.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
      input.value = value;
      // Como no navegador: select dispara input e change; campos de texto, input.
      input.dispatchEvent(new Event('input'));
      if (input.tagName === 'SELECT') input.dispatchEvent(new Event('change'));
      input.dispatchEvent(new Event('blur'));
    };
    const submit = async () => {
      (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit', { cancelable: true }));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const fillValid = (cep = '01310100') => {
      type('nome', 'Ana Souza');
      type('email', 'ana@exemplo.com');
      type('cep', cep);
      type('rua', 'Avenida Paulista');
      type('numero', '1000');
      type('bairro', 'Bela Vista');
      type('cidade', 'São Paulo');
      type('uf', 'SP');
      fixture.detectChanges();
    };
    return { fixture, el, type, submit, fillValid, navigate, store: TestBed.inject(CheckoutStore) };
  };

  it('todo campo tem label', async () => {
    const { el } = await setup();
    for (const control of Array.from(el.querySelectorAll('input:not([type="radio"]), select'))) {
      expect(el.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    }
    el.remove();
  });

  it('valida ao sair do campo, com mensagem ligada por aria-describedby', async () => {
    const { fixture, el, type } = await setup();
    type('email', 'nao-e-email');
    fixture.detectChanges();
    const email = el.querySelector('#email') as HTMLInputElement;
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toBe('email-erro');
    expect(el.querySelector('#email-erro')?.textContent).toContain('e-mail válido');
    el.remove();
  });

  it('ao enviar inválido mostra os erros e foca o primeiro campo inválido', async () => {
    const { el, submit, navigate } = await setup();
    await submit();
    expect(el.querySelectorAll('.error').length).toBeGreaterThanOrEqual(8);
    expect(document.activeElement?.id).toBe('nome');
    expect(navigate).not.toHaveBeenCalled();
    el.remove();
  });

  it('CEP inválido é recusado; CEP válido mostra as opções de frete', async () => {
    const { fixture, el, type } = await setup();
    type('cep', '123');
    fixture.detectChanges();
    expect(el.querySelector('#cep-erro')?.textContent).toContain('00000-000');
    expect(el.querySelectorAll('input[name="frete"]')).toHaveLength(0);
    type('cep', '01310-100');
    fixture.detectChanges();
    expect(Array.from(el.querySelectorAll('.option')).map((o) => o.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Econômico — até 6 dias úteis R$ 19,90',
      'Expresso — até 2 dias úteis R$ 34,90',
    ]);
    el.remove();
  });

  it('exige uma opção de entrega; depois salva endereço normalizado e segue para o pagamento', async () => {
    const { fixture, el, submit, fillValid, navigate, store } = await setup();
    fillValid();
    await submit();
    expect(el.querySelector('#frete-erro')?.textContent).toContain('Escolha uma opção');
    expect(navigate).not.toHaveBeenCalled();

    (el.querySelector('input[name="frete"][value="expresso"]') as HTMLInputElement).click();
    fixture.detectChanges();
    await submit();
    expect(store.shipping()?.cep).toBe('01310-100');
    expect(store.shippingOption()).toBe('expresso');
    expect(navigate).toHaveBeenCalledWith(['/checkout', 'pagamento']);
    el.remove();
  });
});
