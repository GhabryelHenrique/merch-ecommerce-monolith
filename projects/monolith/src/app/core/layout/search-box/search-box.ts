import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '@merch/shared/ui';

/** Busca do header: só navega para `/busca?q=` — não conhece o catálogo. */
@Component({
  selector: 'merch-search-box',
  imports: [Icon],
  template: `
    <form role="search" class="search" (submit)="submit($event)">
      <label class="visually-hidden" [for]="inputId()">Buscar produtos</label>
      <input
        type="search"
        [id]="inputId()"
        name="q"
        placeholder="Buscar produtos"
        autocomplete="off"
        enterkeyhint="search"
        [value]="term()"
        (input)="onInput($event)"
      />
      <button type="submit" class="submit" aria-label="Buscar">
        <merch-icon name="search" [size]="20" />
      </button>
    </form>
  `,
  styleUrl: './search-box.scss',
})
export class SearchBox {
  private readonly router = inject(Router);
  /** Header desktop e drawer mobile têm instâncias próprias. */
  readonly inputId = input('busca');
  protected readonly term = signal('');

  protected onInput(event: Event): void {
    this.term.set((event.target as HTMLInputElement).value);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const q = this.term().trim();
    if (!q) return;
    void this.router.navigate(['/busca'], { queryParams: { q } });
  }
}
