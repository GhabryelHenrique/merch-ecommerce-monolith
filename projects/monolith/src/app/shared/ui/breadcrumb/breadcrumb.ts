import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  /** Sem URL = página atual. */
  url?: string;
}

@Component({
  selector: 'merch-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav aria-label="Trilha de navegação">
      <ol role="list">
        @for (item of items(); track $index; let last = $last) {
          <li>
            @if (item.url && !last) {
              <a [routerLink]="item.url">{{ item.label }}</a>
            } @else {
              <span aria-current="page">{{ item.label }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  readonly items = input.required<readonly BreadcrumbItem[]>();
}
