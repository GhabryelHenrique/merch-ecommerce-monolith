import { makeProduct } from './testing';
import {
  availableStock,
  findVariant,
  imageForColor,
  initialSelection,
  isColorAvailable,
  isSizeAvailable,
  variantLabel,
} from './variant';

const tee = makeProduct({
  name: 'Camiseta',
  images: [
    { src: 'catalog/images/camiseta-preto.svg', alt: 'preta', width: 800, height: 800 },
    { src: 'catalog/images/camiseta-azul.svg', alt: 'azul', width: 800, height: 800 },
  ],
  options: {
    colors: [
      { slug: 'preto', label: 'Preto', hex: '#000' },
      { slug: 'azul', label: 'Azul', hex: '#00f' },
    ],
    sizes: ['P', 'M'],
  },
  variants: [
    { sku: 'PRETO-P', color: 'preto', size: 'P', stock: 0 },
    { sku: 'PRETO-M', color: 'preto', size: 'M', stock: 0 },
    { sku: 'AZUL-P', color: 'azul', size: 'P', stock: 3 },
    { sku: 'AZUL-M', color: 'azul', size: 'M', stock: 0 },
  ],
});

const mug = makeProduct({ options: {}, variants: [{ sku: 'MUG', stock: 7 }] });

describe('seleção de variante', () => {
  it('só encontra variante quando todas as opções foram escolhidas', () => {
    expect(findVariant(tee, { color: 'azul' })).toBeUndefined();
    expect(findVariant(tee, { size: 'P' })).toBeUndefined();
    expect(findVariant(tee, { color: 'azul', size: 'P' })?.sku).toBe('AZUL-P');
  });

  it('produto sem opções tem variante única', () => {
    expect(findVariant(mug, {})?.sku).toBe('MUG');
    expect(availableStock(mug, {})).toBe(7);
  });

  it('estoque disponível da variante escolhida', () => {
    expect(availableStock(tee, { color: 'azul', size: 'P' })).toBe(3);
    expect(availableStock(tee, { color: 'azul', size: 'M' })).toBe(0);
    expect(availableStock(tee, { color: 'azul' })).toBe(0);
  });

  it('disponibilidade de cor e de tamanho por cor', () => {
    expect(isColorAvailable(tee, 'preto')).toBe(false);
    expect(isColorAvailable(tee, 'azul')).toBe(true);
    expect(isSizeAvailable(tee, 'M', 'azul')).toBe(false);
    expect(isSizeAvailable(tee, 'P', 'azul')).toBe(true);
    expect(isSizeAvailable(tee, 'P')).toBe(true);
  });

  it('seleção inicial escolhe a primeira cor com estoque', () => {
    expect(initialSelection(tee)).toEqual({ color: 'azul' });
    expect(initialSelection(mug)).toEqual({ color: undefined });
  });

  it('rótulo da variante e imagem da cor', () => {
    expect(variantLabel(tee, { color: 'azul', size: 'P' })).toBe('Azul · Tam. P');
    expect(variantLabel(mug, {})).toBeUndefined();
    expect(imageForColor(tee, 'azul').alt).toBe('azul');
    expect(imageForColor(tee, 'verde').alt).toBe('preta');
    expect(imageForColor(tee).alt).toBe('preta');
  });
});
