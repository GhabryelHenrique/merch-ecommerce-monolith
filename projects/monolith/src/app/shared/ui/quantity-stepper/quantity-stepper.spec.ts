import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { QuantityStepper } from './quantity-stepper';

@Component({
  imports: [QuantityStepper],
  template: `<merch-quantity-stepper [(value)]="qty" [max]="max()" />`,
})
class Host {
  readonly qty = signal(1);
  readonly max = signal(3);
}

describe('QuantityStepper', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const [minus, plus] = Array.from(el.querySelectorAll('button'));
    const input = el.querySelector('input') as HTMLInputElement;
    return { fixture, el, minus, plus, input };
  };

  it('incrementa e decrementa com two-way binding', () => {
    const { fixture, plus, minus } = setup();
    plus.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.qty()).toBe(2);
    minus.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.qty()).toBe(1);
  });

  it('desabilita os botões nos limites e avisa o máximo', () => {
    const { fixture, plus, minus, el } = setup();
    expect(minus.disabled).toBe(true);
    plus.click();
    plus.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.qty()).toBe(3);
    expect(plus.disabled).toBe(true);
    expect(el.querySelector('.hint')?.textContent).toContain('Máximo disponível: 3');
  });

  it('limita o valor digitado entre min e max', () => {
    const { fixture, input } = setup();
    input.value = '50';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(fixture.componentInstance.qty()).toBe(3);
    input.value = '-2';
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.qty()).toBe(1);
    input.value = 'abc';
    input.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.qty()).toBe(1);
  });

  it('tem nomes acessíveis', () => {
    const { minus, plus, input } = setup();
    expect(minus.getAttribute('aria-label')).toBe('Diminuir quantidade');
    expect(plus.getAttribute('aria-label')).toBe('Aumentar quantidade');
    expect(input.getAttribute('aria-label')).toBe('Quantidade');
  });
});
