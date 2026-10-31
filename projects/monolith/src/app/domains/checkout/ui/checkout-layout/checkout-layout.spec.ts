import { TestBed } from '@angular/core/testing';
import { CheckoutStore } from '../../data/checkout-store';
import { providePtBr } from '../../data/testing';
import { CheckoutLayout } from './checkout-layout';

describe('CheckoutLayout', () => {
  it('reúne etapas, título, aviso de demonstração e resumo', () => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [CheckoutStore, providePtBr()] });
    const fixture = TestBed.createComponent(CheckoutLayout);
    fixture.componentRef.setInput('step', 'entrega');
    fixture.componentRef.setInput('heading', 'Entrega');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toBe('Entrega');
    expect(el.querySelector('[aria-current="step"]')?.textContent).toContain('Entrega');
    expect(el.querySelector('[role="note"]')).not.toBeNull();
    expect(el.querySelector('#resumo-titulo')).not.toBeNull();
  });
});
