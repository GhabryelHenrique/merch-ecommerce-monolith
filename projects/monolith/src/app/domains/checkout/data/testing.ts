import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { DEFAULT_CURRENCY_CODE, LOCALE_ID } from '@angular/core';
import type { CartItem } from '@merch/shared/cart';
import type { ShippingAddress } from './models';

/** Helpers de teste do domínio checkout. */
export const cartItem = (overrides: Partial<CartItem> = {}): Omit<CartItem, 'quantity'> => ({
  sku: 'MS-001-AZUL-M',
  productId: '001',
  slug: 'camiseta-classica',
  name: 'Camiseta Clássica',
  imageUrl: 'http://localhost/catalog/images/camiseta-classica-azul.svg',
  unitPriceInCents: 10_000,
  variantLabel: 'Azul · Tam. M',
  maxQuantity: 5,
  ...overrides,
});

export const address = (overrides: Partial<ShippingAddress> = {}): ShippingAddress => ({
  name: 'Ana Souza',
  email: 'ana@exemplo.com',
  cep: '01310-100',
  street: 'Avenida Paulista',
  number: '1000',
  complement: '',
  district: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  ...overrides,
});

export function providePtBr() {
  registerLocaleData(localePt);
  return [
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'BRL' },
  ];
}

/** Texto visível com espaço entre nós (dt/dd e spans adjacentes não "grudam"). */
export function readText(el: Element): string {
  const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const parts: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent?.replace(/\s+/g, ' ').trim();
    if (text) parts.push(text);
  }
  return parts.join(' ');
}
