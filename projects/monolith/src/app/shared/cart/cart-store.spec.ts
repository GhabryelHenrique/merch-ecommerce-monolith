import { TestBed } from '@angular/core/testing';
import type { CartItem } from './cart-item';
import { CART_STORAGE_KEY, CartStore } from './cart-store';

const tee: Omit<CartItem, 'quantity'> = {
  sku: 'MS-001-AZUL-M',
  productId: '001',
  slug: 'camiseta-classica',
  name: 'Camiseta Clássica',
  imageUrl: 'http://localhost/catalog/images/camiseta-classica-azul.svg',
  unitPriceInCents: 7_990,
  variantLabel: 'Azul · Tam. M',
  maxQuantity: 5,
};
const mug: Omit<CartItem, 'quantity'> = {
  sku: 'MS-022-BRANCO',
  productId: '022',
  slug: 'caneca',
  name: 'Caneca',
  imageUrl: 'http://localhost/catalog/images/caneca.svg',
  unitPriceInCents: 5_990,
  maxQuantity: 10,
};

const stored = () => JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null') as unknown;

describe('CartStore', () => {
  beforeEach(() => localStorage.clear());

  const create = () => TestBed.inject(CartStore);

  it('começa vazio', () => {
    const cart = create();
    expect(cart.items()).toEqual([]);
    expect(cart.count()).toBe(0);
    expect(cart.subtotalInCents()).toBe(0);
  });

  it('adiciona itens e calcula contagem e subtotal', () => {
    const cart = create();
    cart.add(tee, 2);
    cart.add(mug);
    expect(cart.items()).toHaveLength(2);
    expect(cart.count()).toBe(3);
    expect(cart.subtotalInCents()).toBe(2 * 7_990 + 5_990);
  });

  it('mescla a mesma sku somando quantidades e mantém o snapshot mais recente', () => {
    const cart = create();
    cart.add(tee, 1);
    cart.add({ ...tee, unitPriceInCents: 6_990 }, 2);
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].quantity).toBe(3);
    expect(cart.items()[0].unitPriceInCents).toBe(6_990);
  });

  it('respeita o limite de estoque (maxQuantity)', () => {
    const cart = create();
    cart.add(tee, 4);
    cart.add(tee, 4);
    expect(cart.items()[0].quantity).toBe(5);
    cart.add({ ...mug, maxQuantity: 2 }, 9);
    expect(cart.items()[1].quantity).toBe(2);
  });

  it('ignora quantidades inválidas e itens sem estoque', () => {
    const cart = create();
    cart.add(tee, 0);
    cart.add(tee, -3);
    cart.add({ ...mug, maxQuantity: 0 });
    expect(cart.items()).toEqual([]);
  });

  it('atualiza a quantidade (limitada ao estoque) e remove com zero', () => {
    const cart = create();
    cart.add(tee, 1);
    cart.updateQuantity(tee.sku, 3);
    expect(cart.count()).toBe(3);
    cart.updateQuantity(tee.sku, 99);
    expect(cart.count()).toBe(5);
    cart.updateQuantity(tee.sku, 0);
    expect(cart.items()).toEqual([]);
  });

  it('remove um item específico', () => {
    const cart = create();
    cart.add(tee);
    cart.add(mug);
    cart.remove(tee.sku);
    expect(cart.items().map((i) => i.sku)).toEqual([mug.sku]);
  });

  it('limpa o carrinho', () => {
    const cart = create();
    cart.add(tee);
    cart.add(mug);
    cart.clear();
    expect(cart.items()).toEqual([]);
    expect(stored()).toEqual([]);
  });

  it('persiste na chave versionada e restaura em uma nova instância', () => {
    create().add(tee, 2);
    expect(stored()).toEqual([{ ...tee, quantity: 2 }]);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(CartStore);
    expect(restored.count()).toBe(2);
    expect(restored.items()[0].name).toBe('Camiseta Clássica');
  });

  it('descarta dados corrompidos no storage sem quebrar', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{isso não é json');
    expect(create().items()).toEqual([]);

    TestBed.resetTestingModule();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: 'formato antigo' }));
    expect(TestBed.inject(CartStore).items()).toEqual([]);

    TestBed.resetTestingModule();
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ ...tee, quantity: 1 }, { sku: 'sem-campos' }, { ...mug, quantity: -1 }, null]),
    );
    const cart = TestBed.inject(CartStore);
    expect(cart.items().map((i) => i.sku)).toEqual([tee.sku]);
  });

  it('sincroniza quando outra aba altera o carrinho', () => {
    const cart = create();
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ ...mug, quantity: 4 }]));
    window.dispatchEvent(new StorageEvent('storage', { key: CART_STORAGE_KEY }));
    expect(cart.count()).toBe(4);
  });
});
