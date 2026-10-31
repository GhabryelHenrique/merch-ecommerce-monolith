/**
 * Árvore de menu ESTÁTICA do shell. Só conhece URLs do catálogo (contrato por URL),
 * nunca o código do domínio. Na fase 2 continua no shell sem mudanças.
 */
export interface MenuLink {
  readonly label: string;
  readonly path: string;
  readonly query?: Readonly<Record<string, string>>;
}

export interface MenuSection extends MenuLink {
  readonly children?: readonly MenuLink[];
}

const sub = (category: string, slug: string, label: string): MenuLink => ({
  label,
  path: `/c/${category}`,
  query: { subcategoria: slug },
});

const collection = (slug: string, label: string): MenuLink => ({
  label,
  path: '/c/todos',
  query: { colecao: slug },
});

export const MAIN_MENU: readonly MenuSection[] = [
  { label: 'Novidades', path: '/c/novidades' },
  {
    label: 'Vestuário',
    path: '/c/vestuario',
    children: [
      sub('vestuario', 'camisetas', 'Camisetas'),
      sub('vestuario', 'moletons', 'Moletons'),
      sub('vestuario', 'jaquetas', 'Jaquetas'),
      sub('vestuario', 'bones-gorros', 'Bonés e gorros'),
      sub('vestuario', 'infantil', 'Infantil'),
    ],
  },
  {
    label: 'Bolsas & Acessórios',
    path: '/c/bolsas-acessorios',
    children: [
      sub('bolsas-acessorios', 'mochilas', 'Mochilas'),
      sub('bolsas-acessorios', 'bolsas-sacolas', 'Bolsas e sacolas'),
      sub('bolsas-acessorios', 'chaveiros-pins', 'Chaveiros e pins'),
    ],
  },
  {
    label: 'Lifestyle',
    path: '/c/lifestyle',
    children: [
      sub('lifestyle', 'garrafas-canecas', 'Garrafas e canecas'),
      sub('lifestyle', 'escritorio', 'Escritório'),
      sub('lifestyle', 'casa', 'Casa'),
    ],
  },
  {
    label: 'Coleções',
    path: '/c/todos',
    children: [
      collection('holiday-2026', 'Holiday 2026'),
      collection('google-g', 'Google G'),
      collection('chrome-dino', 'Chrome Dino'),
      collection('g-bike', 'G Bike'),
      collection('sustentavel', 'Sustentável'),
    ],
  },
  {
    label: 'Presentes',
    path: '/c/presentes',
    children: [sub('presentes', 'colecionaveis', 'Colecionáveis'), sub('presentes', 'brinquedos', 'Brinquedos')],
  },
  { label: 'Promoções', path: '/c/promocoes' },
];

export const FOOTER_LINKS: readonly MenuLink[] = [
  { label: 'Sobre a loja', path: '/ajuda/sobre' },
  { label: 'Entregas', path: '/ajuda/entregas' },
  { label: 'Trocas e devoluções', path: '/ajuda/trocas' },
  { label: 'Privacidade', path: '/ajuda/privacidade' },
];

/** URL serializada (`/c/x?subcategoria=y`) — usada como `value` dos itens de menu. */
export function menuUrl(link: MenuLink): string {
  const query = new URLSearchParams(link.query ?? {}).toString();
  return query ? `${link.path}?${query}` : link.path;
}
