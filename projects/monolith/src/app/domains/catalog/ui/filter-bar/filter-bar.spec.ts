import { TestBed } from '@angular/core/testing';
import { FilterBar, type FilterChange } from './filter-bar';

describe('FilterBar', () => {
  const setup = (inputs: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(FilterBar);
    fixture.componentRef.setInput('subcategories', [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'moletons', name: 'Moletons' },
    ]);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    const changes: FilterChange[] = [];
    fixture.componentInstance.changed.subscribe((c) => changes.push(c));
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, changes };
  };

  it('reflete o estado recebido (vindo da URL)', () => {
    const { el } = setup({ subcategory: 'moletons', sort: 'menor-preco', onSale: true });
    expect((el.querySelector('#filtro-subcategoria') as HTMLSelectElement).value).toBe('moletons');
    expect((el.querySelector('#filtro-ordem') as HTMLSelectElement).value).toBe('menor-preco');
    expect((el.querySelector('#filtro-promocao') as HTMLInputElement).checked).toBe(true);
  });

  it('emite mudanças; vazio vira null (remove o query param)', () => {
    const { el, changes } = setup();
    const sub = el.querySelector('#filtro-subcategoria') as HTMLSelectElement;
    sub.value = 'camisetas';
    sub.dispatchEvent(new Event('change'));
    sub.value = '';
    sub.dispatchEvent(new Event('change'));
    const sale = el.querySelector('#filtro-promocao') as HTMLInputElement;
    sale.click();
    expect(changes).toEqual([
      { key: 'subcategoria', value: 'camisetas' },
      { key: 'subcategoria', value: null },
      { key: 'promocao', value: '1' },
    ]);
  });

  it('todo controle tem label', () => {
    const { el } = setup();
    for (const control of Array.from(el.querySelectorAll('select, input'))) {
      expect(el.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    }
  });

  it('"Limpar filtros" só aparece com filtro ativo', () => {
    expect(setup().el.querySelector('.clear')).toBeNull();
    TestBed.resetTestingModule();
    const { el, fixture } = setup({ hasActiveFilters: true });
    let cleared = false;
    fixture.componentInstance.cleared.subscribe(() => (cleared = true));
    (el.querySelector('.clear') as HTMLButtonElement).click();
    expect(cleared).toBe(true);
  });
});
