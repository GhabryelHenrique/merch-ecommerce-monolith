import { toRouterLink } from './link';

describe('toRouterLink', () => {
  it('separa caminho e query params', () => {
    expect(toRouterLink('/c/todos?colecao=eco&preco=ate-100')).toEqual({
      path: '/c/todos',
      query: { colecao: 'eco', preco: 'ate-100' },
    });
    expect(toRouterLink('/c/presentes')).toEqual({ path: '/c/presentes', query: {} });
    expect(toRouterLink('')).toEqual({ path: '/', query: {} });
  });
});
