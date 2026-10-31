import { TestBed } from '@angular/core/testing';
import { ToastService } from '@merch/shared/ui';
import { NewsletterForm } from './newsletter-form';

describe('NewsletterForm', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(NewsletterForm);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      el,
      input: el.querySelector('input') as HTMLInputElement,
      form: el.querySelector('form') as HTMLFormElement,
      toasts: TestBed.inject(ToastService),
    };
  };

  it('mostra erro ligado ao campo ao enviar inválido', async () => {
    const { fixture, el, input, form, toasts } = setup();
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('newsletter-erro');
    expect(el.querySelector('#newsletter-erro')?.textContent).toContain('Informe seu e-mail');
    expect(toasts.toasts()).toEqual([]);
  });

  it('confirma com toast quando o e-mail é válido', async () => {
    const { fixture, input, form, toasts } = setup();
    input.value = 'ana@exemplo.com';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    expect(toasts.toasts()[0]?.message).toContain('Inscrição confirmada');
  });
});
