import { Component } from '@angular/core';

const SIZE = 25;
/** Padrão determinístico (não é um QR válido): só ilustração. */
function cells(): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  const finder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= SIZE - 7 && y < 7) || (x < 7 && y >= SIZE - 7);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (finder(x, y)) continue;
      if ((x * 7 + y * 13 + x * y) % 5 < 2) out.push({ x, y });
    }
  }
  return out;
}

/** QR code ILUSTRATIVO em SVG inline (nenhum asset externo, nenhum pagamento). */
@Component({
  selector: 'merch-pix-qr',
  template: `
    <figure class="qr">
      <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" width="160" height="160" role="img" aria-label="QR code ilustrativo do Pix">
        <rect [attr.width]="size" [attr.height]="size" class="paper" />
        @for (f of finders; track $index) {
          <rect [attr.x]="f[0]" [attr.y]="f[1]" width="7" height="7" class="ink" />
          <rect [attr.x]="f[0] + 1" [attr.y]="f[1] + 1" width="5" height="5" class="paper" />
          <rect [attr.x]="f[0] + 2" [attr.y]="f[1] + 2" width="3" height="3" class="ink" />
        }
        @for (c of cells; track $index) {
          <rect [attr.x]="c.x" [attr.y]="c.y" width="1" height="1" class="ink" />
        }
      </svg>
      <figcaption>QR code ilustrativo — não pague.</figcaption>
    </figure>
  `,
  styles: `
    .qr {
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      margin: 0;
      padding: var(--space-4);
      border: var(--border-width) solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-bg);
    }
    .ink {
      fill: var(--color-text);
    }
    .paper {
      fill: var(--color-bg);
    }
    figcaption {
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `,
})
export class PixQr {
  protected readonly size = SIZE;
  protected readonly cells = cells();
  protected readonly finders: readonly [number, number][] = [
    [0, 0],
    [SIZE - 7, 0],
    [0, SIZE - 7],
  ];
}
