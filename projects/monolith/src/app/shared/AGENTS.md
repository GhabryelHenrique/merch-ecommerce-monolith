# shared/ — código compartilhado (futuras bibliotecas)

Na fase 2, cada subpasta vira uma biblioteca do workspace (`ng g library`) **mantendo o mesmo alias** `@merch/shared/*`, e o Native Federation passa a compartilhá-la entre shell e remotes. Escreva pensando nisso.

## Subáreas
| Pasta | Alias | Conteúdo |
|---|---|---|
| `ui/` | `@merch/shared/ui` | Design system: `Button`, `Price`, `Badge`, `QuantityStepper`, `Skeleton`, `EmptyState`, `Breadcrumb`, `Icon`, `ToastService` |
| `cart/` | `@merch/shared/cart` | `CartStore` e `CartItem` — o único estado global da aplicação |
| `util/` | `@merch/shared/util` | `APP_CONFIG`, `StorageService`, `ASSETS_BASE_URL` + `assetUrl()` |

Cada subpasta tem um `index.ts` que é a API pública. O que não está no `index.ts` é privado.

## Regras
- Não importa `@merch/core` nem domínios.
- Só entra aqui o que duas ou mais áreas usam. Na dúvida, deixe no domínio.
- `ui/`: componentes de apresentação — dados por `input()`, eventos por `output()`/`model()`. Sem `HttpClient` e sem services de domínio (`RouterLink` é permitido).
- Sem estado em variáveis de módulo (`let cache = …` no topo do arquivo). Estado vive em services.
- Sem efeitos colaterais na importação.

## `util/`
- `StorageService`: `local` e `session`, com fallback em memória quando o storage não estiver disponível; leitura tolerante a JSON inválido.
- `ASSETS_BASE_URL` (token) + `assetUrl(path)`: **sempre retorna URL absoluta**, resolvida contra a base do domínio (ou `document.baseURI` quando a base for vazia). Cada domínio fornece sua base nos `providers` da própria rota.

## `CartStore` — contrato estável
Usado por três áreas (header, catálogo e checkout). Na fase 2 será o principal ponto de integração entre micro frontends, então a API pública é um contrato:

```ts
// leitura (signals)
items: Signal<readonly CartItem[]>
count: Signal<number>              // soma das quantidades
subtotalInCents: Signal<number>
// escrita
add(item: Omit<CartItem, 'quantity'>, quantity?: number): void  // mesma sku → soma, limitada a maxQuantity
updateQuantity(sku: string, quantity: number): void             // 0 remove
remove(sku: string): void
clear(): void
```

`CartItem` é um **snapshot autossuficiente**: `sku`, `productId`, `slug`, `name`, `imageUrl` (absoluta), `unitPriceInCents`, `variantLabel?`, `maxQuantity`, `quantity`. Quem lê o carrinho nunca precisa buscar o produto.

- Persistência via `StorageService` na chave versionada `merch.cart.v1`; dados inválidos são descartados sem quebrar a aplicação.
- Sincroniza entre abas (evento `storage`).
- Mudar o contrato é breaking change: só com aprovação explícita.
- Testes obrigatórios: adicionar, mesclar mesma sku, limite de estoque, atualizar, remover, limpar, persistir/restaurar e dado corrompido no storage.

## Regras do `Price`
- Entradas em centavos: `priceInCents`, `compareAtPriceInCents?`, `showInstallments?`.
- Promoção quando `compareAtPriceInCents > priceInCents`: "de" riscado, "por" em destaque e selo `-X%` (arredondado para baixo).
- Parcelamento: "em até Nx de R$ Y sem juros", com N = o maior número de parcelas, até 10, em que cada parcela fique ≥ R$ 20,00. Não exibir se N < 2.
- Formatação com `CurrencyPipe` (pt-BR, BRL). Texto completo para leitores de tela (ex.: "Preço promocional R$ 89,90, antes R$ 129,90").

## Design tokens
Componentes usam só tokens (`var(--…)`) definidos em `src/styles/`. Nunca fixe cor, raio ou espaçamento no componente.
