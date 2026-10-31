import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';

@Component({
  imports: [Badge],
  template: `<merch-badge tone="sale">-20%</merch-badge><merch-badge>Padrão</merch-badge>`,
})
class Host {}

describe('Badge', () => {
  it('projeta o texto e aplica o tom', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const [sale, neutral] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('merch-badge'));
    expect(sale.textContent).toBe('-20%');
    expect(sale.classList).toContain('badge--sale');
    expect(neutral.classList).toContain('badge--neutral');
  });
});
