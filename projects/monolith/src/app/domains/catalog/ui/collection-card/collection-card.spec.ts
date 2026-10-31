import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CollectionCard } from './collection-card';

describe('CollectionCard', () => {
  it('linka para o catálogo filtrado pela coleção e usa o token de cor do tema', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src }],
    });
    const fixture = TestBed.createComponent(CollectionCard);
    fixture.componentRef.setInput('collection', {
      slug: 'eco',
      name: 'Linha Eco',
      tagline: 'Reciclados',
      description: '',
      theme: 'campaign-3',
      image: { src: 'catalog/images/colecao-eco.svg', alt: '', width: 800, height: 600 },
    });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h3 a')?.getAttribute('href')).toBe('/c/todos?colecao=eco');
    expect((el.querySelector('.card') as HTMLElement).style.background).toBe('var(--color-campaign-3)');
  });
});
