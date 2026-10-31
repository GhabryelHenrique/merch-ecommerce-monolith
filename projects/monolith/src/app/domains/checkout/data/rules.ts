import type { PaymentMethod, ShippingOption } from './models';

// Regras FAKE e determinísticas da demonstração (domains/checkout/AGENTS.md).

export const COUPON_CODE = 'WORKSHOP10';
export const COUPON_PERCENT = 10;
export const FREE_ECONOMY_ABOVE_IN_CENTS = 29_900;
/** CEP que simula falha ao fechar o pedido (demonstração de tratamento de erro). */
export const FAILING_CEP = '99999-999';

export const normalizeCoupon = (code: string): string => code.trim().toUpperCase();
export const isValidCoupon = (code: string): boolean => normalizeCoupon(code) === COUPON_CODE;

export function discountFor(subtotalInCents: number, coupon: string | null): number {
  return coupon && isValidCoupon(coupon) ? Math.round((subtotalInCents * COUPON_PERCENT) / 100) : 0;
}

/** Aceita "01310100" ou "01310-100"; devolve "01310-100" ou `undefined` se inválido. */
export function normalizeCep(value: string): string | undefined {
  const digits = value.replace(/\D/g, '');
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : undefined;
}

/** Tabela local por primeiro dígito do CEP (região). */
const SHIPPING_TABLE: Record<string, { economy: [number, number]; express: [number, number] }> = {
  '0': { economy: [1_990, 6], express: [3_490, 2] },
  '1': { economy: [1_990, 6], express: [3_490, 2] },
  '2': { economy: [2_190, 7], express: [3_790, 3] },
  '3': { economy: [2_190, 7], express: [3_790, 3] },
  '4': { economy: [2_490, 9], express: [4_490, 4] },
  '5': { economy: [2_490, 9], express: [4_490, 4] },
  '6': { economy: [2_790, 10], express: [4_990, 5] },
  '7': { economy: [2_290, 8], express: [3_990, 3] },
  '8': { economy: [2_090, 7], express: [3_690, 3] },
  '9': { economy: [2_390, 8], express: [4_190, 4] },
};

/** Opções de frete para o CEP. Econômico grátis acima de R$ 299,00 (subtotal). */
export function shippingOptionsFor(cep: string, subtotalInCents: number): ShippingOption[] {
  const normalized = normalizeCep(cep);
  if (!normalized) return [];
  const row = SHIPPING_TABLE[normalized[0]];
  const freeEconomy = subtotalInCents > FREE_ECONOMY_ABOVE_IN_CENTS;
  return [
    { id: 'economico', label: 'Econômico', priceInCents: freeEconomy ? 0 : row.economy[0], days: row.economy[1] },
    { id: 'expresso', label: 'Expresso', priceInCents: row.express[0], days: row.express[1] },
  ];
}

export const PAYMENT_METHODS: readonly { id: PaymentMethod; label: string; description: string }[] = [
  { id: 'pix', label: 'Pix', description: 'Aprovação imediata. O QR code é ilustrativo.' },
  { id: 'boleto', label: 'Boleto', description: 'Vencimento em 3 dias úteis. Nenhum boleto é emitido.' },
  {
    id: 'cartao-teste',
    label: 'Cartão de teste',
    description: 'Simula um cartão aprovado. Nenhum dado de cartão é solicitado.',
  },
];

export const paymentLabel = (id: PaymentMethod | null): string =>
  PAYMENT_METHODS.find((m) => m.id === id)?.label ?? '';

export const BRAZILIAN_STATES: readonly string[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];
