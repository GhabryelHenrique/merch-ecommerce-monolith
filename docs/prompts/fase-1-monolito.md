<!--
COMO USAR
1. Copie o kit para a raiz de uma pasta vazia (o futuro repositório).
2. Use Claude Code >= 2.1.277, que lê AGENTS.md nativamente (inclusive os aninhados).
   Não crie CLAUDE.md: com ele presente, o AGENTS.md deixa de ser lido por padrão.
3. Rode `claude` na raiz, aprove o servidor MCP `angular-cli` e digite `/fase-1` (ou cole este arquivo).
4. Dica para o palco: comece em Plan Mode (Shift+Tab) para o público ver o plano antes do código.
Windows: no .mcp.json use "command": "cmd" e "args": ["/c", "npx", "-y", "@angular/cli@22.2", "mcp"].
-->

# Fase 1 — Monólito Angular componentizado (Merch Store)

Você vai conduzir comigo, ao vivo, a fase 1 do workshop descrito no `AGENTS.md`: um monólito Angular bem componentizado, inspirado na estrutura da Google Merch Shop (your.merch.google), com home de destaques, catálogo, preços, página de produto, carrinho e checkout fake.

O público vai acompanhar o que você faz. Trabalhe em etapas pequenas, explique cada decisão em 2–3 linhas e mantenha o repositório sempre verde.

## Antes de começar

1. Leia o `AGENTS.md` da raiz e os modelos em `docs/agents/`.
2. Verifique se o servidor MCP `angular-cli` está conectado e liste as ferramentas dele. Se não estiver, pare e me diga o que fazer.
3. Chame `get_best_practices` e me mostre, em até 8 itens, as regras que mais vão influenciar este projeto.
4. Monte o plano das etapas abaixo na sua lista de tarefas e aguarde meu "ok".

## Como trabalhar

- Uma etapa por vez. Ao final de cada uma, cumpra a Definition of Done do `AGENTS.md` (lint + testes + build + verificação no dev server + commit + tag), mostre um resumo de até 5 linhas e **aguarde meu "ok"**. Se eu disser "siga direto", continue até a próxima falha ou até o fim.
- Antes de usar qualquer API sobre a qual tenha dúvida na versão instalada, consulte `search_documentation`.
- Gere artefatos com `ng generate` (não interativo) sempre que existir schematic.
- Se a mesma falha acontecer duas vezes, pare e me apresente as opções em vez de insistir.

## Referência visual e de conteúdo

Você pode abrir your.merch.google com WebFetch para estudar a estrutura, mas **não copie imagens, logos, nomes de marca nem textos**. Reproduza a anatomia:

- faixa promocional no topo ("Cadastre-se e ganhe 10% de desconto");
- header com logo em texto, mega menu de categorias (Novidades, Vestuário, Bolsas & Acessórios, Lifestyle, Coleções, Presentes, Promoções), busca e carrinho com contador;
- home com hero de campanha e CTA, carrossel "Populares", banner de coleção sazonal, três cards de coleção e faixa "sustentabilidade";
- grade de produtos (imagem, nome, preço), página de produto, carrinho e checkout;
- footer com contato, links institucionais e newsletter (fake).

Nome da loja: "Merch Store" (lido do `config.json`).

---

## Etapa 0 — Pré-checagem (sem commit)

1. `node -v`, `npm -v`, `git --version`. Confira na documentação se o Node é suportado pela versão alvo do Angular.
2. `npm view @angular-architects/native-federation version` → `ANGULAR_TARGET` = mesma major.minor (hoje, 22.2). Se for diferente de 22.2, atualize `.mcp.json`, `.claude/settings.json` e `AGENTS.md` e me peça para reiniciar a sessão.
3. Se a pasta não for um repositório git, rode `git init`.
4. Mostre o `ANGULAR_TARGET` e aguarde.

## Etapa 1 — Workspace e fundações · tag `f1-e1-workspace`

1. Crie o workspace **na pasta atual**, sem aplicação inicial e sem arquivos de IA (já temos os nossos), algo como `npx -y @angular/cli@<ANGULAR_TARGET> new merch-store --directory . --create-application=false --ai-config=none --skip-git --defaults`. Confirme as flags com `--help` antes. Se o CLI recusar a pasta, gere numa pasta temporária e mova o conteúdo, preservando `AGENTS.md`, `.mcp.json`, `.claude/` e `docs/`.
2. Gere a aplicação `monolith`: roteamento, SCSS, sem SSR, prefixo `merch`, Vitest, zoneless. Confirme com `list_projects`.
3. Troque `^` por `~` nas dependências `@angular/*` e rode `npm install`.
4. Crie a estrutura de pastas do `AGENTS.md` e instale as regras por área (depois leia cada uma):
   - `docs/agents/core.AGENTS.md` → `projects/monolith/src/app/core/AGENTS.md`
   - `docs/agents/shared.AGENTS.md` → `projects/monolith/src/app/shared/AGENTS.md`
   - `docs/agents/catalog.AGENTS.md` → `projects/monolith/src/app/domains/catalog/AGENTS.md`
   - `docs/agents/checkout.AGENTS.md` → `projects/monolith/src/app/domains/checkout/AGENTS.md`
5. Configure os aliases `@merch/*` (tabela do `AGENTS.md`) apontando para `index.ts` iniciais.
6. `ng add angular-eslint --skip-confirmation` e regras de fronteira com `no-restricted-imports` por pasta. Atenção: no flat config, o bloco mais específico substitui a regra inteira, então combine os padrões em cada bloco. **Prove** que funciona: crie temporariamente um import de `@merch/checkout` dentro do catálogo, rode o lint, mostre o erro e desfaça.
7. `app.config.ts`: router com `withComponentInputBinding()`, `withInMemoryScrolling(...)` e `withViewTransitions()`; `provideHttpClient(withFetch())`; `LOCALE_ID` pt-BR com `registerLocaleData`; `DEFAULT_CURRENCY_CODE` BRL; listeners globais de erro; config de runtime lida de `/config.json` por `provideAppInitializer` e exposta em `APP_CONFIG`.
8. `src/styles/`: reset + design tokens (cores, tipografia com stack de sistema, espaçamentos, raios, sombras, breakpoints).
9. Scripts npm do `AGENTS.md` (`start`, `build`, `test` sem watch, `lint`; `e2e` pode ficar como placeholder até a etapa 8).
10. Rotas iniciais conforme `core/AGENTS.md`, com uma página placeholder em cada domínio. Build verde e app rodando.

## Etapa 2 — Dados mock e assets · tag `f1-e2-dados`

1. Em `public/catalog/`: `categories.json` (4 categorias, ≥ 10 subcategorias), `collections.json` (4 coleções), `banners.json` (hero + banner sazonal) e `products.json` (~30 produtos na interface `Product` de `domains/catalog/AGENTS.md`). Distribuição: ≥ 6 em promoção, 8 populares, 6 novidades, alguns com variantes esgotadas e 2 totalmente esgotados. Nomes, descrições e coleções fictícios, em pt-BR.
2. Imagens: SVGs próprios e leves (silhueta do produto na cor da variante, 800×800) em `public/catalog/images/`; hero e banners também em SVG. Gere tudo com um script em `tools/` para poder recriar.
3. `ProductApi` com `httpResource` e funções puras de filtro, ordenação, busca e relacionados em `domains/catalog/data/`, com testes.
4. `ASSETS_BASE_URL` e `IMAGE_LOADER` nos `providers` da rota pai do catálogo.

## Etapa 3 — Design system e carrinho (`shared`) · tag `f1-e3-shared`

1. `shared/util`: `APP_CONFIG`, `StorageService`, `ASSETS_BASE_URL` e `assetUrl()`, conforme `shared/AGENTS.md`.
2. `shared/ui`: `Button` (primary, secondary, ghost, loading), `Price`, `Badge`, `QuantityStepper` (`model()`), `Skeleton`, `EmptyState`, `Breadcrumb`, `Icon` (SVG inline, conjunto mínimo) e `ToastService`.
3. `shared/cart`: `CartStore` e `CartItem` exatamente no contrato do `shared/AGENTS.md`, com a bateria de testes listada lá.

## Etapa 4 — Shell (`core`) · tag `f1-e4-shell`

`PromoBar` (dispensável, lembrada em storage), `Header` com `MegaMenu`, `SearchBox` e `CartBadge`, `Footer`, `ToastHost`, `NotFound`, skip link e foco no `<main>` após navegar — tudo conforme `core/AGENTS.md`. Menu a partir de dados estáticos em `core/navigation/`. Verifique no dev server em largura de desktop e de celular.

## Etapa 5 — Catálogo: home, categoria e busca · tag `f1-e5-catalogo`

Conforme `domains/catalog/AGENTS.md`. Pontos de atenção: estado de filtros e ordenação na URL, lido como `input()`; lista derivada por `computed`; `@defer (on viewport)` com skeleton abaixo da dobra; `priority` só no hero e na primeira linha do grid; `title` em cada rota.

## Etapa 6 — Página de produto · tag `f1-e6-produto`

Conforme `domains/catalog/AGENTS.md`. Adicionar ao carrinho atualiza o contador do header na hora e mostra toast com link para o carrinho. Produto inexistente mostra o estado de "não encontrado".

## Etapa 7 — Carrinho e checkout fake · tag `f1-e7-checkout`

Conforme `domains/checkout/AGENTS.md`: carrinho com cupom, entrega com Signal Forms, frete fake, pagamento sem dados de cartão, revisão, falha simulada com CEP `99999-999`, confirmação e carrinho limpo.

## Etapa 8 — Qualidade · tag `f1-e8-qualidade`

1. Complete os testes unitários mínimos listados nos `AGENTS.md` de cada área.
2. Playwright (só Chromium) com `BASE_URL`: jornada completa (home → categoria → filtro → produto → variante → adicionar → carrinho → cupom → entrega → pagamento → revisão → confirmação) e axe em home, categoria, produto, carrinho e entrega, sem violações `serious`/`critical`.
3. Auditoria: chame `get_best_practices` de novo, compare com o código e corrija os desvios. Mostre a lista do que foi corrigido.
4. Build de produção: mostre o tamanho do bundle inicial e dos chunks lazy e confirme que `catalog` e `checkout` estão em chunks separados, fora do bundle inicial. É a prova de que as fronteiras do código viraram fronteiras de bundle.

## Etapa 9 — Container para Cloud Run · tag `f1-e9-container`

1. `projects/monolith/Dockerfile` multi-stage (contexto = raiz do workspace; Node LTS para o build, `nginx:alpine` para servir), `projects/monolith/nginx.conf` e `.dockerignore`.
2. nginx: porta 8080; fallback SPA para `index.html`; gzip; `index.html` e `config.json` com `Cache-Control: no-cache`; arquivos com hash no nome com `public, max-age=31536000, immutable`; demais assets com cache curto; cabeçalhos básicos de segurança.
3. `config.json` gerado no start do container a partir de variáveis de ambiente (script em `/docker-entrypoint.d/`), para mudar configuração sem rebuild.
4. Se o Docker estiver disponível: build, run em `localhost:8080` e e2e com `BASE_URL=http://localhost:8080`.
5. Documente, **sem executar**, os comandos de publicação: Artifact Registry e `gcloud run deploy merch-monolith --image … --region southamerica-east1 --port 8080 --allow-unauthenticated`.

## Etapa 10 — Documentação · tag `f1-final`

1. `README.md`: pré-requisitos, scripts, estrutura e como rodar local e em container.
2. `docs/arquitetura-fase-1.md`: diagrama Mermaid das áreas e das dependências permitidas; tabela rota → domínio; contrato do `CartStore`; mapa de extração (`core` → shell, `domains/catalog` → `mfe-catalog`, `domains/checkout` → `mfe-checkout`, `shared/*` → bibliotecas); acoplamentos que a fase 2 vai enfrentar (estado do carrinho, assets em outra origem, estilos globais, locale em cada app, dependências compartilhadas) e como cada um já foi mitigado.

## Critérios de aceite da fase 1

- Jornada completa funciona sem erros no console, em desktop e celular.
- `lint` (incluindo fronteiras), `test`, `e2e` e `build` verdes.
- `catalog` e `checkout` em chunks lazy separados; nada deles no bundle inicial.
- Zero violações axe `serious`/`critical`.
- Nenhuma requisição a hosts externos em runtime.
- Dependências de runtime: apenas `@angular/*`, `rxjs` e `tslib`.
