import { IMAGE_LOADER } from '@angular/common';
import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Banners } from '../data/models';
import { makeProduct, provideFakeProductApi } from '../data/testing';
import { HomePage } from './home-page';

const image = { src: 'catalog/images/x.svg', alt: '', width: 1600, height: 900 };
const banners: Banners = {
  hero: { eyebrow: 'Nova', title: 'Aurora chegou', subtitle: '', ctaLabel: 'Ver', ctaUrl: '/c/todos', image },
  seasonal: { eyebrow: 'Presentes', title: 'Presentes que todo mundo usa', subtitle: '', ctaLabel: 'Ver', ctaUrl: '/c/presentes', image },
  sustainability: { title: 'Feito para durar', text: '', ctaLabel: 'Eco', ctaUrl: '/c/todos?colecao=eco' },
};

describe('HomePage', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        provideFakeProductApi({
          banners,
          products: Array.from({ length: 10 }, (_, i) => makeProduct({ id: String(i), popularity: i })),
          collections: ['aurora', 'essenciais', 'dev', 'eco'].map((slug) => ({
            slug,
            name: `Coleção ${slug}`,
            tagline: '',
            description: '',
            theme: 'campaign-1',
            image: { ...image, width: 800, height: 600 },
          })),
        }),
        { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src },
      ],
    });
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return fixture;
  };

  it('hero acima da dobra com h1 e imagem prioritária', () => {
    const el = setup().nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toBe('Aurora chegou');
    expect(el.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
  });

  it('abaixo da dobra: skeletons até a viewport; depois populares, sazonal, 3 coleções e sustentabilidade', async () => {
    const fixture = setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('merch-skeleton')).toHaveLength(4);

    for (const block of await fixture.getDeferBlocks()) await block.render(DeferBlockState.Complete);
    fixture.detectChanges();

    expect(el.querySelector('#populares-titulo')?.textContent).toBe('Populares');
    expect(el.querySelectorAll('merch-product-carousel merch-product-card')).toHaveLength(8);
    expect(el.querySelector('#sazonal-titulo')?.textContent).toContain('Presentes');
    expect(el.querySelectorAll('merch-collection-card')).toHaveLength(3);
    expect(el.textContent).not.toContain('Coleção aurora');
    expect(el.querySelector('#sustentabilidade-titulo')).not.toBeNull();
  });
});
