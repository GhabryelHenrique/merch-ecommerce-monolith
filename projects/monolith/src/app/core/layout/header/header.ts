import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_CONFIG } from '@merch/shared/util';
import { CartBadge } from '../cart-badge/cart-badge';
import { MegaMenu } from '../mega-menu/mega-menu';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { SearchBox } from '../search-box/search-box';

@Component({
  selector: 'merch-header',
  imports: [RouterLink, MegaMenu, MobileMenu, SearchBox, CartBadge],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly storeName = inject(APP_CONFIG).storeName;
}
