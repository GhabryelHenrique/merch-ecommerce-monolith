import { TestBed } from '@angular/core/testing';
import { providePtBr, readText } from '../../data/testing';
import { OrderSummary } from './order-summary';

describe('OrderSummary', () => {
  const render = (inputs: Record<string, unknown>) => {
    TestBed.configureTestingModule({ providers: [providePtBr()] });
    const fixture = TestBed.createComponent(OrderSummary);
    fixture.componentRef.setInput('itemCount', 2);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return readText(fixture.nativeElement as HTMLElement);
  };

  it('frete "calculado na entrega" antes do endereço; sem linha de desconto', () => {
    const text = render({ subtotalInCents: 20_000, totalInCents: 20_000 });
    expect(text).toContain('Subtotal (2 itens) R$ 200,00');
    expect(text).toContain('Frete Calculado na entrega');
    expect(text).not.toContain('Desconto');
    expect(text).toContain('Total R$ 200,00');
  });

  it('mostra desconto do cupom, frete grátis e total', () => {
    const text = render({ subtotalInCents: 30_000, discountInCents: 3_000, coupon: 'WORKSHOP10', shippingInCents: 0, totalInCents: 27_000 });
    expect(text).toContain('Desconto (WORKSHOP10) −R$ 30,00');
    expect(text).toContain('Frete Grátis');
    expect(text).toContain('Total R$ 270,00');
  });

  it('frete com valor', () => {
    expect(render({ subtotalInCents: 10_000, shippingInCents: 1_990, totalInCents: 11_990 })).toContain('Frete R$ 19,90');
  });
});
