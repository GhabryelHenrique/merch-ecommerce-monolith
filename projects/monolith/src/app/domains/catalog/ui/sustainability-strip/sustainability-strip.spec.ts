import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SustainabilityStrip } from './sustainability-strip';

describe('SustainabilityStrip', () => {
  it('mostra título, texto e CTA para a Linha Eco', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(SustainabilityStrip);
    fixture.componentRef.setInput('content', {
      title: 'Feito para durar',
      text: 'Algodão reciclado',
      ctaLabel: 'Conhecer a Linha Eco',
      ctaUrl: '/c/todos?colecao=eco',
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h2')?.textContent).toBe('Feito para durar');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/c/todos?colecao=eco');
  });
});
