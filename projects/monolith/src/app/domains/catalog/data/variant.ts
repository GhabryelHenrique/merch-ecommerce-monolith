import type { Product, ProductImage, ProductVariant } from './models';

// Funções puras de seleção de variante e estoque.

export interface VariantSelection {
  color?: string;
  size?: string;
}

const hasColors = (p: Product) => (p.options.colors?.length ?? 0) > 0;
const hasSizes = (p: Product) => (p.options.sizes?.length ?? 0) > 0;

/** Variante exata da seleção — só existe quando todas as opções do produto foram escolhidas. */
export function findVariant(product: Product, selection: VariantSelection): ProductVariant | undefined {
  if (hasColors(product) && !selection.color) return undefined;
  if (hasSizes(product) && !selection.size) return undefined;
  return product.variants.find(
    (v) =>
      (!hasColors(product) || v.color === selection.color) && (!hasSizes(product) || v.size === selection.size),
  );
}

export function isColorAvailable(product: Product, color: string): boolean {
  return product.variants.some((v) => v.color === color && v.stock > 0);
}

/** Tamanho disponível para a cor escolhida (ou em qualquer cor, se nenhuma foi escolhida). */
export function isSizeAvailable(product: Product, size: string, color?: string): boolean {
  return product.variants.some((v) => v.size === size && (!color || v.color === color) && v.stock > 0);
}

export function availableStock(product: Product, selection: VariantSelection): number {
  return findVariant(product, selection)?.stock ?? 0;
}

/** Seleção inicial: primeira cor com estoque (tamanho fica para o cliente escolher). */
export function initialSelection(product: Product): VariantSelection {
  const color = product.options.colors?.find((c) => isColorAvailable(product, c.slug))?.slug;
  return { color: color ?? product.options.colors?.[0]?.slug };
}

/** "Azul · M" — texto da variante para o snapshot do carrinho. */
export function variantLabel(product: Product, selection: VariantSelection): string | undefined {
  const color = product.options.colors?.find((c) => c.slug === selection.color)?.label;
  const parts = [color, selection.size ? `Tam. ${selection.size}` : undefined].filter(Boolean);
  return parts.length ? parts.join(' · ') : undefined;
}

/** Imagem principal da cor (convenção do gerador: `<slug>-<cor>.svg`). */
export function imageForColor(product: Product, color?: string): ProductImage {
  return (color && product.images.find((img) => img.src.endsWith(`-${color}.svg`))) || product.images[0];
}
