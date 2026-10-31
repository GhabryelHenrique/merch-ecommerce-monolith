import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  imports: [Button],
  template: `
    <button merch-button [variant]="variant()" [loading]="loading()" [disabled]="disabled()">Comprar</button>
    <a merch-button variant="secondary" href="/carrinho">Ver carrinho</a>
  `,
})
class Host {
  readonly variant = signal<'primary' | 'ghost'>('primary');
  readonly loading = signal(false);
  readonly disabled = signal(false);
}

describe('Button', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, button: el.querySelector('button') as HTMLButtonElement, link: el.querySelector('a') as HTMLAnchorElement };
  };

  it('mantém a semântica nativa e aplica a variante', () => {
    const { fixture, button, link } = setup();
    expect(button.classList).toContain('btn--primary');
    expect(link.classList).toContain('btn--secondary');
    expect(link.getAttribute('href')).toBe('/carrinho');
    fixture.componentInstance.variant.set('ghost');
    fixture.detectChanges();
    expect(button.classList).toContain('btn--ghost');
  });

  it('loading desabilita, marca aria-busy e anuncia o carregamento', () => {
    const { fixture, button } = setup();
    expect(button.disabled).toBe(false);
    fixture.componentInstance.loading.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('Carregando');
    expect(button.textContent).toContain('Comprar');
  });

  it('disabled desabilita o botão', () => {
    const { fixture, button } = setup();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });
});
