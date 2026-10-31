import { Component, computed, inject } from '@angular/core';
import { Skeleton } from '@merch/shared/ui';
import { popularProducts } from '../data/catalog-query';
import { ProductApi } from '../data/product-api';
import { CampaignBanner } from '../ui/campaign-banner/campaign-banner';
import { CollectionCard } from '../ui/collection-card/collection-card';
import { ProductCarousel } from '../ui/product-carousel/product-carousel';
import { SustainabilityStrip } from '../ui/sustainability-strip/sustainability-strip';

/** Coleção que já é a campanha do hero não se repete nos cards. */
const HERO_COLLECTION = 'holiday-2026';

@Component({
  selector: 'merch-home-page',
  imports: [CampaignBanner, ProductCarousel, CollectionCard, SustainabilityStrip, Skeleton],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  private readonly api = inject(ProductApi);

  protected readonly banners = this.api.banners;
  protected readonly popular = computed(() => popularProducts(this.api.products(), 8));
  protected readonly collections = computed(() =>
    this.api
      .collections()
      .filter((c) => c.slug !== HERO_COLLECTION)
      .slice(0, 3),
  );
}
