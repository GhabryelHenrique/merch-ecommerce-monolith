import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Breadcrumb } from './breadcrumb';

describe('Breadcrumb', () => {
  it('renderiza links e marca o último item como página atual', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Breadcrumb);
    fixture.componentRef.setInput('items', [
      { label: 'Início', url: '/' },
      { label: 'Vestuário', url: '/c/vestuario' },
      { label: 'Camiseta Clássica' },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Trilha de navegação');
    const links = el.querySelectorAll('a');
    expect(links).toHaveLength(2);
    expect(links[1].getAttribute('href')).toBe('/c/vestuario');
    expect(el.querySelector('[aria-current="page"]')?.textContent).toBe('Camiseta Clássica');
  });
});
