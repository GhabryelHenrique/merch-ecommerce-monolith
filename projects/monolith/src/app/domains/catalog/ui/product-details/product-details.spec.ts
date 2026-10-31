import { TestBed } from '@angular/core/testing';
import { makeProduct } from '../../data/testing';
import { ProductDetails } from './product-details';

describe('ProductDetails', () => {
  const setup = () => {
    const fixture = TestBed.createComponent(ProductDetails);
    fixture.componentRef.setInput('product', makeProduct({ description: 'Algodão macio', collectionSlugs: ['eco'] }));
    fixture.componentRef.setInput('collections', [
      { slug: 'eco', name: 'Linha Eco', tagline: '', description: '', theme: '', image: { src: '', alt: '', width: 1, height: 1 } },
    ]);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('descrição começa aberta; demais seções fechadas', () => {
    const { el } = setup();
    const triggers = Array.from(el.querySelectorAll('button'));
    expect(triggers.map((t) => t.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false']);
    expect(el.textContent).toContain('Algodão macio');
  });

  it('abre uma seção ao clicar (accordion acessível)', () => {
    const { fixture, el } = setup();
    const specs = el.querySelectorAll('button')[1];
    specs.click();
    fixture.detectChanges();
    expect(specs.getAttribute('aria-expanded')).toBe('true');
    expect(el.textContent).toContain('Linha Eco');
    const panel = el.querySelector(`#${specs.getAttribute('aria-controls')}`);
    expect(panel?.getAttribute('role')).toBe('region');
  });
});
