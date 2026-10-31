import { TestBed } from '@angular/core/testing';
import { ASSETS_BASE_URL, assetUrl, resolveAssetUrl } from './asset-url';

describe('resolveAssetUrl', () => {
  const doc = 'http://localhost:4200/';

  it('usa document.baseURI quando a base é vazia', () => {
    expect(resolveAssetUrl('catalog/products.json', '', doc)).toBe('http://localhost:4200/catalog/products.json');
  });

  it('resolve contra a base do domínio (outra origem, fase 2)', () => {
    expect(resolveAssetUrl('catalog/images/a.svg', 'https://catalog.example.com/', doc)).toBe(
      'https://catalog.example.com/catalog/images/a.svg',
    );
  });

  it('aceita base sem barra final e base relativa', () => {
    expect(resolveAssetUrl('a.svg', 'https://cdn.example.com/mfe', doc)).toBe('https://cdn.example.com/mfe/a.svg');
    expect(resolveAssetUrl('a.svg', 'static/', 'http://localhost:4200/loja/')).toBe(
      'http://localhost:4200/loja/static/a.svg',
    );
  });

  it('ignora barra inicial para não fixar caminho absoluto', () => {
    expect(resolveAssetUrl('/catalog/a.svg', 'https://cdn.example.com/', doc)).toBe('https://cdn.example.com/catalog/a.svg');
  });

  it('mantém URLs já absolutas', () => {
    expect(resolveAssetUrl('https://x.example.com/a.svg', '', doc)).toBe('https://x.example.com/a.svg');
    expect(resolveAssetUrl('data:image/svg+xml,abc', '', doc)).toBe('data:image/svg+xml,abc');
  });
});

describe('assetUrl', () => {
  it('lê ASSETS_BASE_URL do injector', () => {
    TestBed.configureTestingModule({ providers: [{ provide: ASSETS_BASE_URL, useValue: 'https://cdn.example.com/' }] });
    const url = TestBed.runInInjectionContext(() => assetUrl('x.json'));
    expect(url).toBe('https://cdn.example.com/x.json');
  });
});
