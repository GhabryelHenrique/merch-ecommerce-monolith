import { Component, computed, input } from '@angular/core';

/** Conjunto mínimo de ícones próprios (traço 24×24). Sem biblioteca de ícones. */
const ICONS = {
  cart: 'M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 7H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm9 3-4.3-4.3',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-down': 'M5 9l7 7 7-7',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 12.5l4.5 4.5L19 7',
  'arrow-right': 'M5 12h14m-6-6 6 6-6 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-5v-5m0-3h.01',
  alert: 'M12 3 2 20h20L12 3zm0 6v5m0 3h.01',
  leaf: 'M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7',
  truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  gift: 'M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7C10 3 6 4 7.5 6.5 8.5 8 12 7 12 7zm0 0c2-4 6-3 4.5-.5C15.5 8 12 7 12 7z',
  refresh: 'M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7',
  lock: 'M6 11h12v9H6zM8 11V8a4 4 0 0 1 8 0v3',
} as const;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'merch-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styleUrl: './icon.scss',
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input(24);
  /** Sem label o ícone é decorativo (aria-hidden). Com label vira `role="img"`. */
  readonly label = input<string>();

  protected readonly path = computed(() => ICONS[this.name()]);
}
