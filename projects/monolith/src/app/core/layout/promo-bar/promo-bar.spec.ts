import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG, DEFAULT_APP_CONFIG } from '@merch/shared/util';
import { PromoBar } from './promo-bar';

const config = (message: string) => ({
  ...DEFAULT_APP_CONFIG,
  promo: { message, linkLabel: 'Cadastrar', linkUrl: '#newsletter' },
});

describe('PromoBar', () => {
  beforeEach(() => localStorage.clear());

  const render = (message = 'Ganhe 10%') => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: APP_CONFIG, useValue: config(message) }],
    });
    const fixture = TestBed.createComponent(PromoBar);
    fixture.detectChanges();
    return fixture;
  };

  it('mostra a mensagem do config.json com link', () => {
    const el = render().nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ganhe 10%');
    expect(el.querySelector('a')?.getAttribute('href')).toContain('#newsletter');
  });

  it('é dispensável e lembra da escolha', () => {
    const fixture = render();
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('aside')).toBeNull();

    TestBed.resetTestingModule();
    expect((render().nativeElement as HTMLElement).querySelector('aside')).toBeNull();
  });

  it('reaparece quando a promoção muda', () => {
    const fixture = render('Promo A');
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('button')?.click();
    TestBed.resetTestingModule();
    expect((render('Promo B').nativeElement as HTMLElement).textContent).toContain('Promo B');
  });
});
