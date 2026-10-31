import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '@merch/shared/cart';
import { Badge, Breadcrumb, Button, EmptyState, Icon, Price, QuantityStepper, Skeleton, ToastService } from '@merch/shared/ui';
import { injectAssetUrl } from '@merch/shared/util';
import { isSoldOut, relatedProducts } from '../data/catalog-query';
import type { Product } from '../data/models';
import { ProductApi } from '../data/product-api';
import { findVariant, imageForColor, initialSelection, variantLabel } from '../data/variant';
import { Gallery } from '../ui/gallery/gallery';
import { ProductDetails } from '../ui/product-details/product-details';
import { ProductGrid } from '../ui/product-grid/product-grid';
import { VariantPicker } from '../ui/variant-picker/variant-picker';

const CART_URL = '/checkout/carrinho'; // contrato por URL com o checkout

@Component({
  selector: 'merch-product-page',
  imports: [
    RouterLink,
    Badge,
    Breadcrumb,
    Button,
    EmptyState,
    Icon,
    Price,
    QuantityStepper,
    Skeleton,
    Gallery,
    VariantPicker,
    ProductDetails,
    ProductGrid,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage {
  private readonly api = inject(ProductApi);
  private readonly cart = inject(CartStore);
  private readonly toasts = inject(ToastService);
  private readonly assetUrl = injectAssetUrl();

  readonly productSlug = input.required<string>();

  protected readonly product = computed(() => this.api.productBySlug(this.productSlug()));
  protected readonly loading = computed(() => this.api.products().length === 0 && !this.api.productsError());
  protected readonly collections = this.api.collections;

  // Seleção: reinicia quando o produto muda (navegar para um relacionado).
  protected readonly color = linkedSignal<string | undefined>(() => {
    const p = this.product();
    return p ? initialSelection(p).color : undefined;
  });
  protected readonly size = linkedSignal<Product | undefined, string | undefined>({
    source: this.product,
    computation: () => undefined,
  });

  protected readonly variant = computed(() => {
    const p = this.product();
    return p ? findVariant(p, { color: this.color(), size: this.size() }) : undefined;
  });
  protected readonly stock = computed(() => this.variant()?.stock ?? 0);
  protected readonly quantity = linkedSignal({ source: this.variant, computation: () => 1 });

  /** Galeria segue a cor escolhida. */
  protected readonly imageIndex = linkedSignal(() => {
    const p = this.product();
    if (!p) return 0;
    return p.images.indexOf(imageForColor(p, this.color()));
  });

  protected readonly soldOut = computed(() => {
    const p = this.product();
    return p ? isSoldOut(p) : false;
  });
  protected readonly isNew = computed(() => this.product()?.badges.includes('new') ?? false);
  protected readonly isBestseller = computed(() => this.product()?.badges.includes('bestseller') ?? false);
  protected readonly canAdd = computed(() => this.stock() > 0);
  protected readonly hint = computed(() => {
    const p = this.product();
    if (!p || this.canAdd()) return '';
    if (this.soldOut()) return 'Produto esgotado.';
    if ((p.options.colors?.length ?? 0) > 0 && !this.color()) return 'Selecione uma cor.';
    if ((p.options.sizes?.length ?? 0) > 0 && !this.size()) return 'Selecione um tamanho.';
    return 'Esta combinação está esgotada. Escolha outra cor ou tamanho.';
  });
  protected readonly stockText = computed(() => {
    const n = this.stock();
    if (!this.variant() || n === 0) return '';
    return n <= 3 ? `Últimas ${n} unidades` : 'Em estoque';
  });

  protected readonly breadcrumb = computed(() => {
    const p = this.product();
    const category = this.api.categories().find((c) => c.slug === p?.categorySlug);
    const sub = category?.subcategories.find((s) => s.slug === p?.subcategorySlug);
    return [
      { label: 'Início', url: '/' },
      ...(category ? [{ label: category.name, url: `/c/${category.slug}` }] : []),
      ...(category && sub ? [{ label: sub.name, url: `/c/${category.slug}?subcategoria=${sub.slug}` }] : []),
      { label: p?.name ?? '' },
    ];
  });

  protected readonly related = computed(() => {
    const p = this.product();
    return p ? relatedProducts(p, this.api.products(), 4) : [];
  });

  /** Único ponto de integração com o carrinho: snapshot autossuficiente via contrato. */
  protected addToCart(): void {
    const product = this.product();
    const variant = this.variant();
    if (!product || !variant || variant.stock <= 0) return;
    const selection = { color: this.color(), size: this.size() };

    this.cart.add(
      {
        sku: variant.sku,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: this.assetUrl(imageForColor(product, selection.color).src),
        unitPriceInCents: product.priceInCents,
        variantLabel: variantLabel(product, selection),
        maxQuantity: variant.stock,
      },
      this.quantity(),
    );
    this.toasts.show(`${product.name} adicionado ao carrinho.`, {
      action: { label: 'Ver carrinho', url: CART_URL },
    });
  }
}
