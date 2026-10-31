import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ASSETS_BASE_URL } from '@merch/shared/util';
import { ProductApi } from './product-api';
import { makeProduct } from './testing';

describe('ProductApi', () => {
  let api: ProductApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ProductApi,
        { provide: ASSETS_BASE_URL, useValue: 'https://catalog.example.com/' },
      ],
    });
    api = TestBed.inject(ProductApi);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
  });

  afterEach(() => http.verify({ ignoreCancelled: true }));

  it('busca os JSON do domínio a partir de ASSETS_BASE_URL', async () => {
    const products = [makeProduct({ slug: 'a' }), makeProduct({ id: '2', slug: 'b' })];
    http.expectOne('https://catalog.example.com/catalog/products.json').flush(products);
    http.expectOne('https://catalog.example.com/catalog/categories.json').flush([]);
    http.expectOne('https://catalog.example.com/catalog/collections.json').flush([]);
    http.expectOne('https://catalog.example.com/catalog/banners.json').flush({});
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.products()).toHaveLength(2);
    expect(api.productBySlug('b')?.id).toBe('2');
    expect(api.productBySlug('nao-existe')).toBeUndefined();
  });

  it('expõe lista vazia e flag de erro quando a requisição falha', async () => {
    http
      .expectOne('https://catalog.example.com/catalog/products.json')
      .flush('erro', { status: 500, statusText: 'Server Error' });
    http.match(() => true).forEach((r) => r.flush([]));
    await TestBed.inject(ApplicationRef).whenStable();

    expect(api.products()).toEqual([]);
    expect(api.productsError()).toBe(true);
  });
});
