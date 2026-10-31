# domains/catalog — catálogo (futuro remote `mfe-catalog`)

Dono de tudo que é "navegar e escolher produto": home com destaques, listagem por categoria, busca e página de produto.

## Rotas (`catalog.routes.ts`, exportadas como `CATALOG_ROUTES` pelo `index.ts`)
| Path | Página | Notas |
|---|---|---|
| `''` | `HomePage` | destaques |
| `c/:categorySlug` | `CategoryPage` | filtros e ordenação em query params |
| `busca` | `SearchPage` | `?q=` |
| `p/:productSlug` | `ProductPage` | `title` via resolver; slug inexistente → estado "produto não encontrado" com link para a home |

As páginas ficam sob uma rota pai `path: ''` com os `providers` do domínio (`ProductApi`, `ASSETS_BASE_URL`, `IMAGE_LOADER`). Assim o domínio é autossuficiente quando virar remote.

## Organização
```text
domains/catalog/
├── index.ts               # export { CATALOG_ROUTES } — só isso
├── catalog.routes.ts
├── data/                  # modelos, ProductApi, funções puras (filtro, ordenação, busca, relacionados)
├── ui/                    # componentes só do catálogo (ProductCard, ProductGrid, FilterBar, Gallery, VariantPicker…)
└── home/ category/ search/ product/   # páginas
```

## Dados
- Mock em `public/catalog/`: `products.json`, `categories.json`, `collections.json`, `banners.json`; imagens SVG em `public/catalog/images/`.
- `ProductApi` lê com `httpResource` a partir de `assetUrl('catalog/…')`. Nunca caminho absoluto fixo.
- Filtros, ordenação, busca e relacionados são **funções puras** em `data/`, consumidas por `computed` e testadas isoladamente.
- O modelo `Product` pertence a este domínio (não vai para `shared`):

```ts
interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  subcategorySlug: string;
  collectionSlugs: string[];
  priceInCents: number;
  compareAtPriceInCents?: number;
  images: { src: string; alt: string; width: number; height: number }[];
  options: { colors?: { slug: string; label: string; hex: string }[]; sizes?: string[] };
  variants: { sku: string; color?: string; size?: string; stock: number }[];
  badges: ('new' | 'bestseller' | 'sale')[];
  featured: boolean;
  popularity: number;
  createdAt: string; // ISO 8601
}
```

## Telas
- **Home**: hero de campanha (imagem com `priority`), carrossel "Populares" (CSS scroll-snap + botões anterior/próximo, sem lib), banner de coleção sazonal, três cards de coleção e faixa "sustentabilidade". Tudo abaixo da dobra em `@defer (on viewport)` com `Skeleton` como placeholder.
- **Categoria**: título, contagem de resultados, filtros (subcategoria, coleção, faixa de preço, só promoções), ordenação (relevância, menor preço, maior preço, novidades) e "Carregar mais". Estado na **URL** (query params lidos como `input()`), para links compartilháveis e voltar/avançar funcionando.
- **Busca**: mesmo grid; estado vazio com sugestões de categorias.
- **Produto**: breadcrumb, galeria com miniaturas operável por teclado, nome, `Price`, badges, cor (swatches com nome acessível) e tamanho, estoque por variante (indisponível fica desabilitado, não escondido), `QuantityStepper` limitado ao estoque, "Adicionar ao carrinho" habilitado só com variante válida, detalhes em accordion (`@angular/aria`) e "Você também pode gostar" em `@defer`.

## Integração com o resto
- Adicionar ao carrinho: **somente** `CartStore.add(snapshot)` de `@merch/shared/cart` (com `imageUrl` absoluta via `assetUrl`), seguido de toast com link para `/checkout/carrinho`.
- Nunca importa nada de `@merch/checkout`. Links para o checkout são strings de URL.
- Não depende do `core`: a busca do header chega aqui só por `/busca?q=`.

## Testes mínimos
Funções de filtro, ordenação, busca e relacionados; seleção de variante e estoque disponível; `ProductCard`; comportamento do botão "Adicionar ao carrinho".

## Pensando nas fases 2 e 3
- O remote vai rodar em outra origem: por isso dados e imagens passam por `ASSETS_BASE_URL`/`IMAGE_LOADER` definidos nas rotas do domínio.
- Bom candidato ao canário da fase 3 (ex.: novo layout de card ou de preço). Mantenha o visual do card isolado em `ui/product-card` para a mudança ser pequena e visível.
