import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { makeProduct, provideFakeProductApi, providePtBr } from '../data/testing';
import { SearchPage } from './search-page';

describe('SearchPage', () => {
  const setup = async (url: string) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'busca', component: SearchPage }], withComponentInputBinding()),
        provideFakeProductApi({
          products: [
            makeProduct({ id: '1', slug: 'moletom', name: 'Moletom Aurora' }),
            makeProduct({ id: '2', slug: 'caneca', name: 'Caneca' }),
          ],
        }),
        providePtBr(),
        { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  };

  it('mostra resultados do termo da URL', async () => {
    const el = await setup('/busca?q=aurora');
    expect(el.querySelector('h1')?.textContent).toBe('Resultados para “aurora”');
    expect(el.querySelector('[role="status"]')?.textContent).toBe('1 resultado');
    expect(el.querySelector('h3 a')?.textContent?.trim()).toBe('Moletom Aurora');
  });

  it('estado vazio sugere categorias', async () => {
    const el = await setup('/busca?q=inexistente');
    expect(el.textContent).toContain('Nenhum produto encontrado');
    const links = Array.from(el.querySelectorAll('.chips a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/c/novidades', '/c/vestuario', '/c/lifestyle', '/c/promocoes']);
  });

  it('sem termo convida a buscar', async () => {
    const el = await setup('/busca');
    expect(el.querySelector('h1')?.textContent).toBe('Buscar produtos');
  });
});
