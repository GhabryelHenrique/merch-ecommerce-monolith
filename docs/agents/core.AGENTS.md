# core/ — casca da aplicação (futuro SHELL)

Na fase 2, esta pasta — junto com `app.ts`, `app.config.ts` e `app.routes.ts` — vira o projeto `shell`. Tudo aqui precisa funcionar sem saber como os domínios são implementados.

## Responsabilidades
- Bootstrap e providers globais (`app.config.ts`): router, HttpClient, locale, config de runtime, tratamento global de erros.
- Config de runtime: carregar `/config.json` no startup (`provideAppInitializer`) e expor pelo token `APP_CONFIG` de `@merch/shared/util`. Nada de `environment.ts` para valores que mudam por ambiente.
- Layout: `PromoBar`, `Header` (logo, `MegaMenu`, `SearchBox`, `CartBadge`), `Footer`, `ToastHost`, skip link.
- Navegação: árvore de menu **estática** em `core/navigation/` (categorias e subcategorias como links para URLs do catálogo).
- `NotFound` (rota `**`).

## Não pertence ao core
Regras de produto, preço, estoque, lógica de carrinho e checkout. O header só **lê** `cart.count()`; nunca manipula itens.

## Imports
- Pode: `@merch/shared/*`, `@angular/*`.
- Não pode: `@merch/catalog`, `@merch/checkout` — exceto em `app.routes.ts`, e apenas via `import()` dinâmico.

## Rotas (`app.routes.ts`)
Ordem obrigatória:
1. `{ path: 'checkout', loadChildren: () => import('@merch/checkout').then(m => m.CHECKOUT_ROUTES) }`
2. `{ path: '', loadChildren: () => import('@merch/catalog').then(m => m.CATALOG_ROUTES) }`
3. `{ path: '**', component: NotFound }`

Router com `withComponentInputBinding()`, `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })` e `withViewTransitions()` (confirme com `search_documentation`).

## Integrações por contrato
- Busca: `SearchBox` navega para `/busca?q=<termo>`. Não conhece o catálogo.
- Carrinho: `CartBadge` usa `CartStore.count()` e linka para `/checkout/carrinho`.
- Toasts: `ToastHost` renderiza o que estiver em `ToastService` (`@merch/shared/ui`).
- Foco: após cada navegação, mover o foco para `<main>` (acessibilidade e anúncio de troca de página).

## MegaMenu
- Desktop: menubar com submenus (`@angular/aria`), abre por teclado e mouse, fecha com Esc e ao navegar.
- Mobile: botão "Menu" abre drawer com accordion de categorias; foco preso no drawer enquanto aberto e devolvido ao botão ao fechar.

## Pensando na fase 2
- O shell não pode ter `import` estático de nada que estará em um remote. Se precisar de algo em comum, o lugar é `shared`.
- `config.json` é o precursor do `federation.manifest.json`: ambos são lidos em runtime, e é isso que permite trocar a versão de um remote sem rebuild do shell. Mantenha `index.html` e `config.json` sem cache.
- Estilos globais (reset + tokens) moram no shell. Remotes não trazem CSS global.
- `registerLocaleData(pt)` é feito aqui; na fase 2 cada remote também vai precisar garantir o locale.
