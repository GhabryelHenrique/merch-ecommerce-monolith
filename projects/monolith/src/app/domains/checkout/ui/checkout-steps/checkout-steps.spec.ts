import { TestBed } from '@angular/core/testing';
import { CheckoutSteps } from './checkout-steps';

describe('CheckoutSteps', () => {
  it('lista ordenada com aria-current="step" na etapa atual e anteriores concluídas', () => {
    const fixture = TestBed.createComponent(CheckoutSteps);
    fixture.componentRef.setInput('current', 'pagamento');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = Array.from(el.querySelectorAll('ol > li'));
    expect(items).toHaveLength(4);
    expect(items.map((i) => i.getAttribute('aria-current'))).toEqual([null, null, 'step', null]);
    expect(items[0].textContent).toContain('(concluída)');
    expect(items[2].textContent).toContain('Pagamento');
  });
});
