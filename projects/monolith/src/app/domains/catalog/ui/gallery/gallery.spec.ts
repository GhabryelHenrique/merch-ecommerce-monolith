import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Gallery } from './gallery';

const images = ['a', 'b', 'c'].map((n) => ({ src: `catalog/images/${n}.svg`, alt: `Imagem ${n}`, width: 800, height: 800 }));

describe('Gallery', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [{ provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src }] });
    const fixture = TestBed.createComponent(Gallery);
    fixture.componentRef.setInput('images', images);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    const main = () => el.querySelector('.main img') as HTMLImageElement;
    const thumbs = () => Array.from(el.querySelectorAll<HTMLButtonElement>('.thumb'));
    return { fixture, el, main, thumbs };
  };

  it('mostra a imagem ativa com alt descritivo e miniaturas rotuladas', () => {
    const { main, thumbs, el } = setup();
    expect(main().getAttribute('alt')).toBe('Imagem a');
    expect(thumbs()[1].getAttribute('aria-label')).toBe('Ver imagem 2 de 3: Imagem b');
    expect(thumbs()[0].getAttribute('aria-pressed')).toBe('true');
    el.remove();
  });

  it('troca a imagem ao clicar numa miniatura', () => {
    const { fixture, main, thumbs, el } = setup();
    thumbs()[2].click();
    fixture.detectChanges();
    expect(main().getAttribute('alt')).toBe('Imagem c');
    expect(fixture.componentInstance.activeIndex()).toBe(2);
    el.remove();
  });

  it('setas, Home e End navegam e movem o foco (com volta ao início)', () => {
    const { fixture, main, thumbs, el } = setup();
    const group = el.querySelector('.thumbs') as HTMLElement;
    const press = (key: string) => {
      group.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      fixture.detectChanges();
    };
    press('ArrowRight');
    expect(main().getAttribute('alt')).toBe('Imagem b');
    expect(document.activeElement).toBe(thumbs()[1]);
    press('End');
    expect(main().getAttribute('alt')).toBe('Imagem c');
    press('ArrowRight');
    expect(main().getAttribute('alt')).toBe('Imagem a');
    press('ArrowLeft');
    expect(main().getAttribute('alt')).toBe('Imagem c');
    expect(thumbs().map((t) => t.tabIndex)).toEqual([-1, -1, 0]);
    el.remove();
  });
});
