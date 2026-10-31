import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MegaMenu } from './mega-menu';

describe('MegaMenu', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MegaMenu);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  };

  it('renderiza menubar com as 7 seções (padrão APG com li role=none)', () => {
    const { el } = setup();
    const bar = el.querySelector('[role="menubar"]') as HTMLElement;
    const items = Array.from(bar.querySelectorAll(':scope > li > [role="menuitem"]')).map((i) => i.textContent?.trim());
    expect(items).toEqual([
      'Novidades',
      'Vestuário',
      'Bolsas & Acessórios',
      'Lifestyle',
      'Coleções',
      'Presentes',
      'Promoções',
    ]);
    expect(bar.querySelectorAll(':scope > li[role="none"]')).toHaveLength(7);
    expect(el.querySelectorAll('[role="menu"]')).toHaveLength(5);
  });

  it('seções com submenu anunciam popup recolhido', () => {
    const { el } = setup();
    const vestuario = Array.from(el.querySelectorAll('[role="menuitem"]')).find((i) =>
      i.textContent?.includes('Vestuário'),
    ) as HTMLElement;
    expect(vestuario.getAttribute('aria-haspopup')).toBe('true');
    expect(vestuario.getAttribute('aria-expanded')).toBe('false');
  });

  it('links de topo apontam para URLs do catálogo', () => {
    const { el } = setup();
    expect(el.querySelector('a[role="menuitem"]')?.getAttribute('href')).toBe('/c/novidades');
  });

  it('navega pela URL do item selecionado (teclado)', () => {
    const { fixture } = setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    (fixture.componentInstance as unknown as { navigate(url: string): void }).navigate('/c/vestuario?subcategoria=camisetas');
    expect(navigate).toHaveBeenCalledWith('/c/vestuario?subcategoria=camisetas');
  });
});
