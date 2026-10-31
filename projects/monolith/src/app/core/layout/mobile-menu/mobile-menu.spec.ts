import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MobileMenu } from './mobile-menu';

describe('MobileMenu', () => {
  const setup = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MobileMenu);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector('dialog') as HTMLDialogElement;
    // jsdom não implementa showModal/close: simulamos o comportamento nativo.
    dialog.showModal = function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
    dialog.close = function (this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    };
    return { fixture, el, dialog, opener: el.querySelector('.opener') as HTMLButtonElement };
  };

  it('abre o drawer e indica estado expandido', () => {
    const { fixture, dialog, opener } = setup();
    expect(opener.getAttribute('aria-expanded')).toBe('false');
    opener.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(true);
    expect(opener.getAttribute('aria-expanded')).toBe('true');
  });

  it('fecha pelo botão e devolve o foco ao botão Menu', () => {
    const { fixture, el, dialog, opener } = setup();
    document.body.appendChild(el);
    opener.click();
    el.querySelector<HTMLButtonElement>('[aria-label="Fechar menu"]')?.click();
    fixture.detectChanges();
    expect(dialog.open).toBe(false);
    expect(document.activeElement).toBe(opener);
    el.remove();
  });

  it('tem accordion de categorias com gatilhos acessíveis', () => {
    const { el } = setup();
    const triggers = el.querySelectorAll('h3 button');
    expect(triggers).toHaveLength(5);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('false');
  });
});
