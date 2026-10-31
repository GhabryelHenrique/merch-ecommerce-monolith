import { AccordionContent, AccordionGroup, AccordionPanel, AccordionTrigger } from '@angular/aria/accordion';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Icon } from '@merch/shared/ui';
import { filter } from 'rxjs';
import { MAIN_MENU, type MenuLink, menuUrl } from '../../navigation/menu';

/**
 * Menu mobile: botão "Menu" abre um `<dialog>` modal (drawer).
 * `showModal()` dá foco preso, Esc e fundo inerte nativamente; ao fechar,
 * o foco volta explicitamente para o botão que abriu.
 */
@Component({
  selector: 'merch-mobile-menu',
  imports: [RouterLink, Icon, AccordionGroup, AccordionTrigger, AccordionPanel, AccordionContent],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.scss',
})
export class MobileMenu {
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly opener = viewChild.required<ElementRef<HTMLButtonElement>>('opener');

  protected readonly sections = MAIN_MENU;
  protected readonly isOpen = signal(false);
  /** Fechamento causado por navegação: o foco vai para o <main> (App), não para o botão. */
  private closingForNavigation = false;

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.closingForNavigation = this.dialog().nativeElement.open;
        this.close();
      });
  }

  protected open(): void {
    this.dialog().nativeElement.showModal();
    this.isOpen.set(true);
  }

  protected close(): void {
    const dialog = this.dialog().nativeElement;
    if (dialog.open) dialog.close();
  }

  /** Disparado pelo `close` nativo (botão, Esc ou navegação). */
  protected onClosed(): void {
    this.isOpen.set(false);
    if (!this.closingForNavigation) this.opener().nativeElement.focus();
    this.closingForNavigation = false;
  }

  /** Clique no backdrop (fora do conteúdo) fecha. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  protected trackLink(link: MenuLink): string {
    return menuUrl(link);
  }
}
