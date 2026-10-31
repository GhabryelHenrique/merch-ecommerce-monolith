import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';

@Component({ template: '<h1>Página A</h1>' })
class PageA {}
@Component({ template: '<h1>Página B</h1>' })
class PageB {}

describe('App (shell)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: PageA },
          { path: 'b', component: PageB },
        ]),
      ],
    });
  });

  it('renderiza skip link, header, main e footer', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.skip-link')?.textContent).toContain('Pular para o conteúdo');
    expect(el.querySelector('header')).not.toBeNull();
    expect(el.querySelector('main#conteudo')?.getAttribute('tabindex')).toBe('-1');
    expect(el.querySelector('footer')).not.toBeNull();
  });

  it('skip link move o foco para o <main>', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    (el.querySelector('.skip-link') as HTMLAnchorElement).click();
    expect(document.activeElement?.id).toBe('conteudo');
    el.remove();
  });

  it('move o foco para o <main> ao trocar de página, mas não na carga inicial', async () => {
    const harness = await RouterTestingHarness.create();
    const fixture = TestBed.createComponent(App);
    const el = fixture.nativeElement as HTMLElement;
    document.body.appendChild(el);
    await harness.navigateByUrl('/');
    await fixture.whenStable();
    expect(document.activeElement?.id).not.toBe('conteudo');

    await harness.navigateByUrl('/b');
    await fixture.whenStable();
    expect(document.activeElement?.id).toBe('conteudo');
    el.remove();
  });
});
