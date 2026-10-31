import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';

describe('ToastService', () => {
  afterEach(() => vi.useRealTimers());

  it('publica e remove toasts', () => {
    const toasts = TestBed.inject(ToastService);
    const id = toasts.show('Adicionado ao carrinho', { action: { label: 'Ver carrinho', url: '/checkout/carrinho' } });
    expect(toasts.toasts()).toEqual([
      { id, message: 'Adicionado ao carrinho', tone: 'success', action: { label: 'Ver carrinho', url: '/checkout/carrinho' } },
    ]);
    toasts.dismiss(id);
    expect(toasts.toasts()).toEqual([]);
  });

  it('some sozinho após a duração', () => {
    vi.useFakeTimers();
    const toasts = TestBed.inject(ToastService);
    toasts.show('Oi', { duration: 1000 });
    toasts.show('Fica', { duration: 0 });
    vi.advanceTimersByTime(1000);
    expect(toasts.toasts().map((t) => t.message)).toEqual(['Fica']);
  });

  it('mantém no máximo três', () => {
    const toasts = TestBed.inject(ToastService);
    ['a', 'b', 'c', 'd'].forEach((m) => toasts.show(m, { duration: 0 }));
    expect(toasts.toasts().map((t) => t.message)).toEqual(['b', 'c', 'd']);
  });
});
