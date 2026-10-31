import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InfoPage } from './info-page';

describe('InfoPage', () => {
  const render = (topico: string) => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(InfoPage);
    fixture.componentRef.setInput('topico', topico);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('mostra o tópico pedido na rota', () => {
    expect(render('trocas').querySelector('h1')?.textContent).toBe('Trocas e devoluções');
  });

  it('tópico desconhecido mostra "não encontrada"', () => {
    expect(render('xyz').querySelector('h1')?.textContent).toBe('Página não encontrada');
  });
});
