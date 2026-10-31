import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  it('renderiza a região principal', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const main = (fixture.nativeElement as HTMLElement).querySelector('main');
    expect(main?.id).toBe('conteudo');
  });
});
