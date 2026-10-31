/**
 * Snapshot autossuficiente de um item no carrinho. Quem lê o carrinho nunca
 * precisa buscar o produto — é isso que permite ao checkout não conhecer o catálogo.
 *
 * CONTRATO ESTÁVEL entre shell, catálogo e checkout (futuros micro frontends).
 * Mudança aqui é breaking change: só com aprovação explícita.
 */
export interface CartItem {
  readonly sku: string;
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  /** URL absoluta (resolvida por `assetUrl` no domínio de origem). */
  readonly imageUrl: string;
  readonly unitPriceInCents: number;
  readonly variantLabel?: string;
  readonly maxQuantity: number;
  readonly quantity: number;
}

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isNonNegativeInt = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;

/** Valida um item vindo de fora (storage de outra versão, outra aba, dado corrompido). */
export function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    isNonEmptyString(v['sku']) &&
    isNonEmptyString(v['productId']) &&
    isNonEmptyString(v['slug']) &&
    isNonEmptyString(v['name']) &&
    isNonEmptyString(v['imageUrl']) &&
    isNonNegativeInt(v['unitPriceInCents']) &&
    (v['variantLabel'] === undefined || typeof v['variantLabel'] === 'string') &&
    isNonNegativeInt(v['maxQuantity']) &&
    Number.isInteger(v['quantity']) &&
    (v['quantity'] as number) > 0
  );
}
