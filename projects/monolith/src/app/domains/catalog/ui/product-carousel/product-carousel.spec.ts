import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { makeProduct } from '../../data/testing';
import { ProductCarousel } from './product-carousel';

describe('ProductCarousel', () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src }],
    });
    const fixture = TestBed.createComponent(ProductCarousel);
    fixture.componentRef.setInput('heading', 'Populares');
    fixture.componentRef.setInput('headingId', 'populares');
    fixture.componentRef.setInput('products', [1, 2, 3, 4, 5].map((i) => makeProduct({ id: String(i) })));
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, track: el.querySelector('.track') as HTMLElement };
  };

  it('é uma região rotulada pelo título com um card por produto', () => {
    const { el } = setup();
    expect(el.querySelector('section')?.getAttribute('aria-labelledby')).toBe('populares');
    expect(el.querySelector('#populares')?.textContent).toBe('Populares');
    expect(el.querySelectorAll('merch-product-card')).toHaveLength(5);
  });

  it('botões anterior/próximo rolam a faixa e refletem os limites', () => {
    const { fixture, el, track } = setup();
    const [prev, next] = Array.from(el.querySelectorAll('button'));
    expect(prev.disabled).toBe(true);
    expect(next.getAttribute('aria-label')).toBe('Rolar populares para frente');

    track.scrollBy = vi.fn();
    next.click();
    expect(track.scrollBy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));

    Object.defineProperties(track, {
      scrollLeft: { value: 500, configurable: true },
      clientWidth: { value: 500, configurable: true },
      scrollWidth: { value: 1000, configurable: true },
    });
    track.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(prev.disabled).toBe(false);
    expect(next.disabled).toBe(true);
  });
});
