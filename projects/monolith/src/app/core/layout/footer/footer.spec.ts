import { DeferBlockBehavior, DeferBlockState, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG, DEFAULT_APP_CONFIG } from '@merch/shared/util';
import { Footer } from './footer';

describe('Footer', () => {
  it('mostra contato do config, links institucionais e newsletter (adiada)', async () => {
    TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      providers: [
        provideRouter([]),
        {
          provide: APP_CONFIG,
          useValue: { ...DEFAULT_APP_CONFIG, contact: { email: 'oi@loja.example', phone: '(11) 4000-0000', hours: '9h às 18h' } },
        },
      ],
    });
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="mailto:oi@loja.example"]')).not.toBeNull();
    expect(el.querySelector('a[href="tel:+551140000000"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ajuda/trocas"]')?.textContent).toContain('Trocas');
    expect(el.querySelector('#newsletter input[type="email"]')).toBeNull();
    const [newsletter] = await fixture.getDeferBlocks();
    await newsletter.render(DeferBlockState.Complete);
    expect(el.querySelector('#newsletter input[type="email"]')).not.toBeNull();
  });
});
