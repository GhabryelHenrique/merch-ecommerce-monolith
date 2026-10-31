import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('explica o erro e oferece caminho de volta para a home', async () => {
    TestBed.configureTestingModule({ imports: [NotFound], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h1')?.textContent).toContain('Página não encontrada');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
