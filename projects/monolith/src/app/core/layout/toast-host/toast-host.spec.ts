import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '@merch/shared/ui';
import { ToastHost } from './toast-host';

describe('ToastHost', () => {
  it('renderiza os toasts em região viva e permite fechar', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(ToastHost);
    const toasts = TestBed.inject(ToastService);
    toasts.show('Adicionado ao carrinho', { duration: 0, action: { label: 'Ver carrinho', url: '/checkout/carrinho' } });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');
    expect(el.textContent).toContain('Adicionado ao carrinho');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/checkout/carrinho');

    el.querySelector<HTMLButtonElement>('button[aria-label="Fechar aviso"]')?.click();
    fixture.detectChanges();
    expect(toasts.toasts()).toEqual([]);
    expect(el.textContent).not.toContain('Adicionado');
  });
});
