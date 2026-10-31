# AGENTS.md — Merch Store · Workshop "Do monólito aos Micro Frontends"

Instruções para agentes de código (Claude Code, Codex, Gemini CLI, Cursor, Copilot). Vale para o repositório inteiro.

Algumas pastas têm um `AGENTS.md` próprio (`core/`, `shared/`, `domains/catalog/`, `domains/checkout/`; os modelos ficam em `docs/agents/` e são instalados na etapa 1 da fase 1). **Antes de criar ou editar arquivos numa pasta, leia o `AGENTS.md` mais próximo dela.** Ele complementa este arquivo e, em caso de conflito, vale o mais específico.

---

## 1. Contexto

Workshop ao vivo: **"Do monólito ao Micro Frontends em produção: Native Federation + Cloud Run"**.

A aplicação é uma loja de merch inspirada na *estrutura* da Google Merch Shop (your.merch.google): home com destaques, catálogo por categoria, preços e promoções, página de produto, carrinho e checkout fake.

| Fase | Entrega | Status |
|---|---|---|
| 1 | Monólito Angular componentizado, com fronteiras de domínio explícitas | **atual** |
| 2 | Shell + `mfe-catalog` + `mfe-checkout` com Native Federation | próxima |
| 3 | Cada app como serviço no Cloud Run + deploy canário de um remote sem rebuild do shell | próxima |

Princípio: **toda decisão da fase 1 deve baratear as fases 2 e 3.** Quando houver duas formas corretas de fazer algo no monólito, escolha a que facilita a extração e registre o motivo no commit.

## 2. Stack e versões

- Angular **22.2.x** em todo o workspace (CLI, framework e servidor MCP). A major.minor do Angular deve ser a mesma do `@angular-architects/native-federation` mais recente, porque o adapter acompanha a versão do Angular. Dependências `@angular/*` com `~`, nunca `^`.
- Standalone, signals, zoneless, `httpResource`, Signal Forms e `@angular/aria` (estáveis no v22 — confirme a API com o MCP antes de usar).
- SCSS + CSS custom properties (design tokens). Sem Tailwind, sem Angular Material, sem NgRx.
- Vitest (unit), Playwright + axe (e2e), angular-eslint.
- **Apenas CSR — sem SSR.**
- Produção: container nginx na porta 8080 (Cloud Run).

Dependências de runtime permitidas: `@angular/*`, `rxjs`, `tslib`. Qualquer outra precisa de aprovação, porque na fase 2 toda dependência vira dependência compartilhada entre shell e remotes.

## 3. Angular CLI MCP (`angular-cli`) — fonte da verdade

O servidor está configurado em `.mcp.json`. Protocolo:

1. **Antes de escrever ou alterar código Angular** na sessão: `get_best_practices` (com o caminho do workspace). Siga o guia. Se este arquivo conflitar com ele, o guia vence; avise o conflito.
2. **Qualquer dúvida de nome, assinatura ou status de API na versão instalada** (Signal Forms, `httpResource`, Aria, router, `@defer`…): `search_documentation` antes de usar. Não invente API.
3. Depois de criar ou alterar projetos do workspace: `list_projects`.
4. Build, test, lint e e2e: `run_target` (ou o script npm equivalente).
5. Validar UI: `devserver_start` → `devserver_wait_for_build` → verificar → `devserver_stop`.
6. Se uma ferramenta citada aqui não existir na versão do servidor, liste as disponíveis e use a equivalente.

## 4. Comandos

| Script | O que faz |
|---|---|
| `npm start` | `ng serve monolith` em http://localhost:4200 |
| `npm run build` | build de produção do `monolith` |
| `npm test` | testes unitários (Vitest), sem watch |
| `npm run lint` | ESLint, incluindo as regras de fronteira |
| `npm run e2e` | Playwright (usa `BASE_URL`, padrão `http://localhost:4200`) |

Comandos do CLI sempre **não interativos**: `--defaults`/`--interactive=false`, `ng add … --skip-confirmation`, `NG_CLI_ANALYTICS=false`. Um prompt interativo trava a sessão do agente.

## 5. Estrutura

```text
projects/monolith/
├── public/
│   ├── config.json              # config de runtime (muda sem rebuild)
│   ├── catalog/                 # dados mock + imagens do domínio catalog
│   └── checkout/                # assets do domínio checkout (se houver)
└── src/
    ├── styles/                  # reset + design tokens (únicos estilos globais)
    └── app/
        ├── app.ts · app.config.ts · app.routes.ts
        ├── core/                # → vira o SHELL na fase 2
        ├── shared/
        │   ├── ui/              # design system (componentes de apresentação)
        │   ├── cart/            # estado compartilhado do carrinho (contrato)
        │   └── util/            # config, storage, assets
        └── domains/
            ├── catalog/         # → vira o remote mfe-catalog
            └── checkout/        # → vira o remote mfe-checkout
```

Aliases no `tsconfig.json` da raiz (`paths` sem `baseUrl`):

| Alias | Aponta para |
|---|---|
| `@merch/core` | `core/index.ts` |
| `@merch/shared/ui` | `shared/ui/index.ts` |
| `@merch/shared/cart` | `shared/cart/index.ts` |
| `@merch/shared/util` | `shared/util/index.ts` |
| `@merch/catalog` | `domains/catalog/index.ts` |
| `@merch/checkout` | `domains/checkout/index.ts` |

Na fase 2, cada `shared/*` vira biblioteca do workspace **com o mesmo alias** — os imports não mudam.

## 6. Fronteiras — a regra mais importante do repositório

1. **Domínio não importa domínio.** `catalog` e `checkout` se comunicam só por URL (rotas e query params) ou pelo contrato `@merch/shared/cart`.
2. `shared` não importa `core` nem `domains`.
3. `core` não importa domínios, com uma exceção: `app.routes.ts` carrega cada domínio por `import()` dinâmico.
4. Entre áreas, use sempre o alias público. Nada de caminho relativo atravessando áreas, nada de import profundo (`@merch/shared/ui/button/...`).
5. O `index.ts` de cada domínio exporta **só as rotas** (`CATALOG_ROUTES`, `CHECKOUT_ROUTES`). Na fase 2, esse arquivo vira o `exposes` do remote.
6. Algo só sobe para `shared` quando duas ou mais áreas usam. Modelos de domínio (ex.: `Product`) ficam no domínio.
7. Dados mock e assets pertencem ao domínio dono (`public/<dominio>/`) e são resolvidos por `assetUrl()` com a base do domínio, nunca por caminho absoluto fixo no template. Na fase 2 o remote roda em outra origem.
8. Estado global só em `shared/cart`. Estado de um domínio fica no domínio, de preferência nos `providers` da rota dele.

O ESLint (`no-restricted-imports`) aplica as regras 1 a 4. Lint vermelho é violação de arquitetura, não detalhe de estilo.

## 7. Padrões Angular (resumo; o MCP é a referência)

- Standalone por padrão; não declare `standalone: true`. Sem NgModules.
- `input()`, `output()`, `model()`, `viewChild()`… em vez de decorators. Objeto `host: {}` em vez de `@HostBinding`/`@HostListener`.
- Estado com `signal`, derivado com `computed`; `effect`/`linkedSignal` só quando necessário. Atualize com `set`/`update`.
- Change detection `OnPush` (explícito ou padrão, conforme o guia da versão).
- Control flow nativo (`@if`, `@for` com `track`, `@switch`, `@defer`). Sem `*ngIf`/`*ngFor`, sem `ngClass`/`ngStyle` (use `[class.x]` e `[style.x]`).
- `inject()` em vez de injeção por construtor. `providedIn: 'root'` só para o que é realmente global.
- Dados HTTP com `httpResource`. Observables no template via `async` ou `toSignal`; `subscribe` manual só com `takeUntilDestroyed`.
- Formulários com Signal Forms.
- Rotas lazy, guards e resolvers funcionais, `withComponentInputBinding()` (params e query params chegam como `input()`).
- Imagens com `NgOptimizedImage` (`priority` só no que está acima da dobra).
- Templates simples: lógica em `computed`, não no template.
- Nomes de arquivos e classes no padrão que o CLI atual gera (`product-card.ts`, classe `ProductCard`). Use `ng generate` sempre que houver schematic.
- TypeScript estrito; sem `any` (use `unknown` + narrowing).
- `window`, `document` e `localStorage` só através de services/tokens de `@merch/shared/util`.

## 8. UI, conteúdo e acessibilidade

- Visual limpo inspirado na loja de referência: muito branco, tipografia grande, cards com cantos arredondados, CTAs em pílula. Mobile-first.
- Estilos globais só em `src/styles/` (reset + tokens). O resto é estilo de componente, encapsulado. Componentes usam tokens (`var(--color-…)`), nunca valores soltos.
- Interface em **pt-BR**; código em inglês; mensagens de commit em pt-BR.
- `LOCALE_ID` `pt-BR`, moeda BRL. Preços sempre em **centavos inteiros** (`priceInCents`); formatação só na exibição.
- Assets próprios (SVGs gerados no repositório). Não use logos, fotos, nomes de marca ou textos da Google. Nenhuma requisição a hosts externos em runtime — inclusive fontes (use stack de sistema).
- WCAG 2.2 AA: HTML semântico, label em todo campo, foco visível, navegação completa por teclado, `alt` descritivo, contraste AA, skip link e foco movido para o conteúdo principal ao navegar. Menu, accordion e tabs com `@angular/aria`.

## 9. Testes

- Unit (Vitest): toda lógica de stores, services e funções puras, e todo componente com comportamento. Teste comportamento, não implementação.
- E2E (Playwright): jornada de compra completa + axe nas páginas principais, sem violações `serious`/`critical`. **Esta suíte é o teste de paridade das fases 2 e 3**: seletores por papel e rótulo (`getByRole`, `getByLabel`), nunca por classe CSS, e base configurável por `BASE_URL`.

## 10. Git e Definition of Done

Uma etapa só termina quando:

1. `npm run lint`, `npm test` e `npm run build` estão verdes (sem novos avisos de budget);
2. a funcionalidade foi verificada no dev server;
3. existe commit em Conventional Commits (descrição em pt-BR) e a tag da etapa;
4. você apresentou um resumo curto, incluindo qualquer desvio destas regras e o motivo.

Não rode `git push`, `gcloud`, `docker push` nem nada que publique ou gaste recursos sem pedido explícito.

## 11. Não faça

NgModules · `standalone: true` explícito · `@Input`/`@Output`/`@HostBinding`/`@HostListener` · `*ngIf`/`*ngFor`/`ngClass`/`ngStyle` · `any` · SSR · Angular Material, Tailwind, NgRx, libs de carrossel, ícones ou máscara · fontes, imagens ou APIs externas em runtime · coleta de dados reais de pagamento · import entre domínios · atualizar versões sem pedido.
