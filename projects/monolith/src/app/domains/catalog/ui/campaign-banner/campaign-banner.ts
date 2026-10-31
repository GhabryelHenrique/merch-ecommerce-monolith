import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@merch/shared/ui';
import { toRouterLink } from '../../data/link';
import type { Banner } from '../../data/models';

/**
 * Banner de campanha: texto em HTML (acessível) sobre ilustração decorativa.
 * `hero` = primeira dobra: título h1 e imagem com `priority`.
 */
@Component({
  selector: 'merch-campaign-banner',
  imports: [NgOptimizedImage, RouterLink, Button],
  templateUrl: './campaign-banner.html',
  styleUrl: './campaign-banner.scss',
  host: { '[class.banner--hero]': 'hero()' },
})
export class CampaignBanner {
  readonly banner = input.required<Banner>();
  readonly hero = input(false);
  readonly headingId = input.required<string>();

  protected readonly cta = computed(() => toRouterLink(this.banner().ctaUrl));
}
