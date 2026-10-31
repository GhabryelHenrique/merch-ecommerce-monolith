import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EmptyState } from './empty-state';

@Component({
  imports: [EmptyState],
  template: `
    <merch-empty-state heading="Seu carrinho está vazio" description="Que tal ver as novidades?">
      <a href="/">Ir para a loja</a>
    </merch-empty-state>
  `,
})
class Host {}

describe('EmptyState', () => {
  it('mostra título, descrição e ações projetadas', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toBe('Seu carrinho está vazio');
    expect(el.querySelector('p')?.textContent).toContain('novidades');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
