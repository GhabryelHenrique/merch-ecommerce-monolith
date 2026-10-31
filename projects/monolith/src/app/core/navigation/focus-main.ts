import { type ElementRef, Injector, type Signal, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const pathOf = (url: string) => url.split(/[?#]/)[0];

/**
 * Após cada navegação para OUTRA página, move o foco para o `<main>` (anúncio da troca
 * de página para leitores de tela e teclado recomeçando do conteúdo).
 * Não mexe no foco quando só query params/fragmento mudam (ex.: filtros do catálogo),
 * nem na carga inicial. Deve ser chamado em contexto de injeção.
 */
export function focusMainOnNavigation(main: Signal<ElementRef<HTMLElement>>): void {
  const injector = inject(Injector);
  let previousPath: string | undefined;

  inject(Router)
    .events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntilDestroyed(),
    )
    .subscribe((event) => {
      const path = pathOf(event.urlAfterRedirects);
      const changed = previousPath !== undefined && previousPath !== path;
      previousPath = path;
      if (!changed) return;
      afterNextRender(() => main().nativeElement.focus({ preventScroll: true }), { injector });
    });
}
