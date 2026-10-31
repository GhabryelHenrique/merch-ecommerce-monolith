import { Menu, MenuBar, MenuItem } from '@angular/aria/menu';
import { Component, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Icon } from '@merch/shared/ui';
import { filter } from 'rxjs';
import { MAIN_MENU, type MenuLink, menuUrl } from '../../navigation/menu';

/**
 * Menu de categorias (desktop) com `@angular/aria`: menubar + painéis de submenu
 * (padrão APG "navigation menubar"). Teclado: ←/→ navegam, ↓/Enter/Espaço abrem
 * o painel, ↑/↓ percorrem os links, Esc fecha e devolve o foco ao item do topo.
 */
@Component({
  selector: 'merch-mega-menu',
  imports: [MenuBar, Menu, MenuItem, RouterLink, Icon],
  templateUrl: './mega-menu.html',
  styleUrl: './mega-menu.scss',
})
export class MegaMenu {
  private readonly router = inject(Router);
  private readonly bar = viewChild.required(MenuBar);

  protected readonly sections = MAIN_MENU;
  protected readonly url = menuUrl;

  constructor() {
    // Fecha ao navegar (inclusive por clique com mouse em um link do painel).
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.bar().close());
  }

  /** Ativação por teclado (Enter/Espaço) emite `itemSelected` com a URL do item. */
  protected navigate(url: string | undefined): void {
    if (url) void this.router.navigateByUrl(url);
  }

  protected trackLink(link: MenuLink): string {
    return menuUrl(link);
  }
}
