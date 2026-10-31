// Modelos do domínio checkout. Nada aqui conhece o catálogo: o carrinho chega como CartItem.
import type { CartItem } from '@merch/shared/cart';

export interface ShippingAddress {
  name: string;
  email: string;
  cep: string; // normalizado: 00000-000
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string; // UF
}

export type ShippingOptionId = 'economico' | 'expresso';

export interface ShippingOption {
  id: ShippingOptionId;
  label: string;
  priceInCents: number;
  days: number;
}

export type PaymentMethod = 'pix' | 'boleto' | 'cartao-teste';

export type CheckoutStep = 'carrinho' | 'entrega' | 'pagamento' | 'revisao';

export const CHECKOUT_STEPS: readonly { id: CheckoutStep; label: string }[] = [
  { id: 'carrinho', label: 'Carrinho' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'pagamento', label: 'Pagamento' },
  { id: 'revisao', label: 'Revisão' },
];

export interface Order {
  id: string;
  createdAt: string;
  items: readonly CartItem[];
  shipping: ShippingAddress;
  shippingOption: ShippingOption;
  paymentMethod: PaymentMethod;
  coupon: string | null;
  subtotalInCents: number;
  discountInCents: number;
  shippingInCents: number;
  totalInCents: number;
}
