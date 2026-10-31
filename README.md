# Merch Store — monólito Angular (fase 1)

Loja de merch de demonstração (produtos do catálogo público da Google Merch Shop, fotos oficiais referenciadas por URL) do workshop **"Do monólito aos Micro Frontends em produção: Native Federation + Cloud Run"**.
Esta é a **fase 1**: um monólito Angular 22 bem componentizado, com fronteiras de domínio explícitas
(`core` → shell, `domains/catalog`, `domains/checkout`, `shared/*`), pronto para ser fatiado na fase 2.

Home com destaques, catálogo por categoria com filtros na URL, busca, página de produto com variantes,
carrinho, checkout fake em etapas e confirmação. Tudo em pt-BR, preços em centavos/BRL, WCAG 2.2 AA,
sem nenhuma requisição externa em runtime.

## Pré-requisitos

| Ferramenta | Versão |
|---|---|
| Node.js | LTS ativa ou de manutenção (testado com **24.16**) |
| npm | 11+ |
| Angular CLI | **22.2.x** (vem do `package.json`; não precisa instalar global) |
| Docker | opcional, para rodar o container |

Primeira vez:

```bash
npm ci
npx playwright install chromium   # só para os testes e2e
```

## Scripts

| Script | O que faz |
|---|---|
| `npm start` | dev server em http://localhost:4200 |
| `npm run build` | build de produção em `dist/monolith/browser` |
| `npm test` | testes unitários (Vitest), sem watch |
| `npm run lint` | ESLint, incluindo as **regras de fronteira** entre áreas |
| `npm run e2e` | Playwright (Chromium desktop + celular) com axe; usa `BASE_URL` (padrão `http://localhost:4200`, sobe o dev server se preciso) |
| `npm run check:bundles` | build com stats e prova de que `catalog`/`checkout` estão em chunks lazy, fora do bundle inicial |
| `node tools/generate-catalog.mjs` | regera os dados mock e os SVGs de `public/catalog/` |
| `node tools/screenshot.mjs <url> <png> [w] [h] [--full] [--scroll]` | screenshot rápido + erros de console |

## Estrutura

```text
projects/monolith/
├── Dockerfile · nginx.conf · docker-entrypoint.d/   # container para Cloud Run
├── public/
│   ├── config.json              # config de runtime (no container: gerada por env vars)
│   └── catalog/                 # dados mock + imagens SVG do domínio catalog
└── src/
    ├── styles/                  # reset + design tokens (únicos estilos globais)
    └── app/
        ├── app.ts · app.config.ts · app.routes.ts
        ├── core/                # → SHELL na fase 2 (layout, menu, config, foco, 404)
        ├── shared/
        │   ├── ui/              # design system (@merch/shared/ui)
        │   ├── cart/            # CartStore — único estado global (@merch/shared/cart)
        │   └── util/            # APP_CONFIG, StorageService, assetUrl (@merch/shared/util)
        └── domains/
            ├── catalog/         # → remote mfe-catalog (@merch/catalog)
            └── checkout/        # → remote mfe-checkout (@merch/checkout)
e2e/                             # Playwright: jornada completa + axe (teste de paridade)
tools/                           # gerador de catálogo, screenshot, verificação de bundles
docs/                            # arquitetura, deploy e modelos de AGENTS.md
```

Cada área tem um `AGENTS.md` com suas regras. Arquitetura completa, contratos e mapa de extração:
[`docs/arquitetura-fase-1.md`](docs/arquitetura-fase-1.md).

**Fronteiras** (aplicadas pelo ESLint — lint vermelho é violação de arquitetura):
domínio não importa domínio; `shared` não importa `core` nem domínios; `core` só carrega domínios por
`import()` dinâmico em `app.routes.ts`; entre áreas só pelos aliases `@merch/*`.

## Rodar local

```bash
npm start
# http://localhost:4200
```

Roteiro rápido: cupom **`WORKSHOP10`** (10%); CEP **`99999-999`** simula falha ao confirmar o pedido;
frete Econômico grátis acima de R$ 299,00. Nenhum dado de cartão é pedido.

> **OneDrive/Windows:** se o dev server não perceber arquivos ou pastas **novas** (ex.: depois de rodar o
> gerador de catálogo), reinicie o `npm start`. É limitação do watcher em pastas sincronizadas.

## Rodar em container

```bash
docker build -f projects/monolith/Dockerfile -t merch-monolith:f1 .
docker run --rm -p 8080:8080 -e STORE_NAME="Merch Store" -e APP_ENVIRONMENT=local-docker merch-monolith:f1
# http://localhost:8080

BASE_URL=http://localhost:8080 npm run e2e   # mesma suíte, agora contra o nginx
```

O `config.json` é gerado no start a partir de variáveis de ambiente (`STORE_NAME`, `APP_ENVIRONMENT`,
`PROMO_*`, `CONTACT_*`): muda configuração sem rebuild. Publicação no Artifact Registry e no Cloud Run:
[`docs/deploy-cloud-run.md`](docs/deploy-cloud-run.md) (documentado, não executado).

## Qualidade (estado da fase 1)

- 181 testes unitários (Vitest) e 18 cenários e2e (Playwright, desktop + celular).
- axe sem violações `serious`/`critical` em home, categoria, produto, carrinho e entrega.
- `catalog` e `checkout` em chunks lazy separados; bundle inicial ~406 kB (~110 kB transferidos).
- Dependências de runtime: apenas `@angular/*`, `rxjs` e `tslib`.

## Tags

`f1-e1-workspace` · `f1-e2-dados` · `f1-e3-shared` · `f1-e4-shell` · `f1-e5-catalogo` · `f1-e6-produto` ·
`f1-e7-checkout` · `f1-e8-qualidade` · `f1-e9-container` · `f1-final`
