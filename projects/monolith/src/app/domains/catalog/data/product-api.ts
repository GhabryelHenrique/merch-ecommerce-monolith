import { httpResource } from '@angular/common/http';
import { Service, computed } from '@angular/core';
import { injectAssetUrl } from '@merch/shared/util';
import type { Banners, Category, Collection, Product } from './models';

/**
 * Fonte de dados do catálogo (mock em `public/catalog/`).
 *
 * Escopo do domínio: fornecido nos `providers` da rota pai do catálogo
 * (`autoProvided: false`), não em `root`. Os JSON são carregados uma vez por
 * sessão do domínio e compartilhados entre home, categoria, busca e produto.
 */
@Service({ autoProvided: false })
export class ProductApi {
  private readonly url = injectAssetUrl();

  readonly productsResource = httpResource<Product[]>(() => this.url('catalog/products.json'));
  readonly categoriesResource = httpResource<Category[]>(() => this.url('catalog/categories.json'));
  readonly collectionsResource = httpResource<Collection[]>(() => this.url('catalog/collections.json'));
  readonly bannersResource = httpResource<Banners>(() => this.url('catalog/banners.json'));

  /** Leituras seguras: nunca lançam em estado de erro (guardadas por `hasValue()`). */
  readonly products = computed<readonly Product[]>(() =>
    this.productsResource.hasValue() ? this.productsResource.value() : [],
  );
  readonly categories = computed<readonly Category[]>(() =>
    this.categoriesResource.hasValue() ? this.categoriesResource.value() : [],
  );
  readonly collections = computed<readonly Collection[]>(() =>
    this.collectionsResource.hasValue() ? this.collectionsResource.value() : [],
  );
  readonly banners = computed<Banners | undefined>(() =>
    this.bannersResource.hasValue() ? this.bannersResource.value() : undefined,
  );

  readonly productsLoading = computed(() => this.productsResource.isLoading());
  readonly productsError = computed(() => this.productsResource.error() !== undefined);

  /** Mapa slug → produto, para lookup O(1) na página de produto. */
  private readonly bySlug = computed(() => new Map(this.products().map((p) => [p.slug, p])));

  productBySlug(slug: string): Product | undefined {
    return this.bySlug().get(slug);
  }

  /** Recarrega tudo (ação "Tentar novamente" após erro). */
  reload(): void {
    this.productsResource.reload();
    this.categoriesResource.reload();
    this.collectionsResource.reload();
    this.bannersResource.reload();
  }
}
