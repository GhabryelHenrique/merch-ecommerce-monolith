import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_CONFIG, DEFAULT_APP_CONFIG } from '@merch/shared/util';
import { Header } from './header';

describe('Header', () => {
  it('usa o nome da loja do config e reúne menu, busca e carrinho', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: APP_CONFIG, useValue: { ...DEFAULT_APP_CONFIG, storeName: 'Loja X' } }],
    });
    const fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logo = el.querySelector('a.logo') as HTMLAnchorElement;
    expect(logo.querySelector('.logo-text')?.textContent).toBe('Loja X');
    expect(logo.querySelector('.visually-hidden')?.textContent).toBe(', página inicial');
    expect(logo.querySelector('.logo-mark')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('[role="menubar"]')).not.toBeNull();
    expect(el.querySelectorAll('form[role="search"]')).toHaveLength(2);
    expect(el.querySelector('a[href="/checkout/carrinho"]')).not.toBeNull();
  });
});
