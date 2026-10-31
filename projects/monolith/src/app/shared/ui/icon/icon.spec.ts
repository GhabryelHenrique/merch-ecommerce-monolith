import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  const render = (inputs: Record<string, unknown>) => {
    const fixture = TestBed.createComponent(Icon);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('svg') as SVGElement;
  };

  it('é decorativo por padrão', () => {
    const svg = render({ name: 'cart' });
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.querySelector('path')?.getAttribute('d')).toContain('M3 4h2');
  });

  it('com label vira imagem acessível', () => {
    const svg = render({ name: 'search', label: 'Buscar', size: 16 });
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Buscar');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
    expect(svg.getAttribute('width')).toBe('16');
  });
});
