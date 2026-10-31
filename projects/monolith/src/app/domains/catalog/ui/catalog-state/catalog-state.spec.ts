import { TestBed } from '@angular/core/testing';
import { CatalogState } from './catalog-state';

describe('CatalogState', () => {
  it('carregando: skeletons com status anunciado', () => {
    const fixture = TestBed.createComponent(CatalogState);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Carregando');
    expect(el.querySelectorAll('merch-skeleton').length).toBeGreaterThan(0);
  });

  it('erro: mensagem e "Tentar novamente"', () => {
    const fixture = TestBed.createComponent(CatalogState);
    fixture.componentRef.setInput('error', true);
    let retried = false;
    fixture.componentInstance.retry.subscribe(() => (retried = true));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toContain('Não foi possível carregar');
    el.querySelector('button')?.click();
    expect(retried).toBe(true);
  });
});
