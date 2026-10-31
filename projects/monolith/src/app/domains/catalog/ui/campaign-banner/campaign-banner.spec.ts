import { IMAGE_LOADER } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { Banner } from '../../data/models';
import { CampaignBanner } from './campaign-banner';

const banner: Banner = {
  eyebrow: 'Nova coleção',
  title: 'Aurora chegou',
  subtitle: 'Edição limitada',
  ctaLabel: 'Conhecer',
  ctaUrl: '/c/todos?colecao=aurora',
  image: { src: 'catalog/images/banner-hero.svg', alt: '', width: 1600, height: 900 },
};

describe('CampaignBanner', () => {
  const render = (hero: boolean) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IMAGE_LOADER, useValue: (c: { src: string }) => c.src }],
    });
    const fixture = TestBed.createComponent(CampaignBanner);
    fixture.componentRef.setInput('banner', banner);
    fixture.componentRef.setInput('hero', hero);
    fixture.componentRef.setInput('headingId', 'hero');
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('hero: h1, imagem prioritária e CTA com query params', () => {
    const el = render(true);
    expect(el.querySelector('h1')?.textContent).toBe('Aurora chegou');
    expect(el.querySelector('img')?.getAttribute('fetchpriority')).toBe('high');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/c/todos?colecao=aurora');
  });

  it('banner comum usa h2 e imagem lazy', () => {
    const el = render(false);
    expect(el.querySelector('h1')).toBeNull();
    expect(el.querySelector('h2')?.textContent).toBe('Aurora chegou');
    expect(el.querySelector('img')?.getAttribute('loading')).toBe('lazy');
  });
});
