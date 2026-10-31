import { TestBed } from '@angular/core/testing';
import { makeProduct } from '../../data/testing';
import { VariantPicker } from './variant-picker';

const product = makeProduct({
  options: {
    colors: [
      { slug: 'preto', label: 'Preto', hex: '#000000' },
      { slug: 'azul', label: 'Azul', hex: '#0000ff' },
    ],
    sizes: ['P', 'M'],
  },
  variants: [
    { sku: 'PRETO-P', color: 'preto', size: 'P', stock: 0 },
    { sku: 'PRETO-M', color: 'preto', size: 'M', stock: 0 },
    { sku: 'AZUL-P', color: 'azul', size: 'P', stock: 2 },
    { sku: 'AZUL-M', color: 'azul', size: 'M', stock: 0 },
  ],
});

describe('VariantPicker', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(VariantPicker);
    fixture.componentRef.setInput('product', product);
    fixture.componentRef.setInput('color', 'azul');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const radio = (name: string, value: string) =>
      el.querySelector(`input[name="${name}"][value="${value}"]`) as HTMLInputElement;
    return { fixture, el, radio };
  };

  it('agrupa cor e tamanho em fieldsets com legenda', () => {
    const { el } = setup();
    expect(Array.from(el.querySelectorAll('legend')).map((l) => l.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      'Cor: Azul',
      'Tamanho: selecione',
    ]);
  });

  it('opções sem estoque ficam desabilitadas e anunciadas, não escondidas', () => {
    const { el, radio } = setup();
    expect(radio('cor', 'preto').disabled).toBe(true);
    expect(radio('cor', 'azul').disabled).toBe(false);
    expect(radio('tamanho', 'M').disabled).toBe(true);
    expect(radio('tamanho', 'P').disabled).toBe(false);
    expect(el.textContent).toContain('Preto (esgotado)');
    expect(el.textContent).toContain('M (esgotado)');
  });

  it('escolher tamanho atualiza o model', () => {
    const { fixture, radio } = setup();
    radio('tamanho', 'P').click();
    expect(fixture.componentInstance.size()).toBe('P');
  });
});
