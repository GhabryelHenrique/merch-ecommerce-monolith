# domains/checkout — carrinho e checkout fake (futuro remote `mfe-checkout`)

Dono de tudo que acontece depois que o produto foi escolhido: carrinho, entrega, pagamento fake, revisão e confirmação.

## Rotas (montadas em `/checkout`; exportadas como `CHECKOUT_ROUTES`)
| Path | Página | Guard |
|---|---|---|
| `''` | redirect → `carrinho` | — |
| `carrinho` | `CartPage` | — |
| `entrega` | `ShippingStep` | carrinho não vazio |
| `pagamento` | `PaymentStep` | carrinho não vazio + entrega válida |
| `revisao` | `ReviewStep` | etapas anteriores válidas |
| `confirmacao/:orderId` | `ConfirmationPage` | pedido existe na sessão |

Guards funcionais (`CanActivateFn`) que redirecionam para a etapa válida mais próxima. A rota pai fornece `CheckoutStore` e `OrderService` em `providers` — escopo do domínio, não `root`.

## `CheckoutStore`
Signals: `shipping` (endereço), `shippingOption`, `paymentMethod`, `coupon`. Computed: `subtotalInCents` (vindo do `CartStore`), `discountInCents`, `shippingInCents`, `totalInCents`, `canProceedTo(step)`. Persistência leve em `sessionStorage` (via `StorageService`) para sobreviver a um F5.

## Regras fake (determinísticas, para a demo)
- **Cupom** `WORKSHOP10`: 10% sobre o subtotal. Outros códigos → erro no próprio campo.
- **Frete** pelo primeiro dígito do CEP (tabela local): "Econômico" e "Expresso", cada um com preço e prazo. Econômico grátis acima de R$ 299,00.
- **Pagamento**: Pix (QR code ilustrativo em SVG inline), Boleto e "Cartão de teste". **Não existem campos de cartão.** Banner fixo: "Ambiente de demonstração: nenhum pagamento é processado".
- **OrderService** fake: latência de ~800 ms, id `MS-` + 6 caracteres, resumo do pedido salvo em `sessionStorage`. O CEP `99999-999` simula falha, para demonstrar tratamento de erro (mensagem + "Tentar novamente").
- Pedido confirmado → `CartStore.clear()` e navegação para `confirmacao/:orderId`.

## Formulário de entrega
Signal Forms (confirme a API com `search_documentation`). Campos: nome, e-mail, CEP (`00000-000`), rua, número, complemento (opcional), bairro, cidade e UF (select). Validação ao sair do campo e no envio; mensagens ligadas ao campo por `aria-describedby`; foco no primeiro campo inválido ao enviar. Sem libs de máscara.

## Carrinho (`CartPage`)
Linhas com imagem, nome (link para `/p/:slug`), variante, `Price`, `QuantityStepper` (até `maxQuantity`) e remover; campo de cupom; resumo (subtotal, desconto, frete "calculado na entrega", total); CTA "Continuar". Vazio → `EmptyState` com link para `/`.

Indicador de etapas acessível: lista ordenada com `aria-current="step"` na etapa atual.

## Integração com o resto
- Lê e altera o carrinho **somente** via `@merch/shared/cart`.
- Nunca importa `@merch/catalog`: tudo que precisa do produto está no snapshot `CartItem`. Links para produto são URLs.
- Não define `IMAGE_LOADER`: as imagens do carrinho usam a `imageUrl` absoluta do snapshot.

## Testes mínimos
`CheckoutStore` (cupom, frete, totais, `canProceedTo`), guards, validações do formulário e `OrderService` (sucesso e falha).

## Pensando nas fases 2 e 3
- Este domínio consome um estado criado por outro (o catálogo adiciona, o checkout lê). Se o contrato do `CartStore` vazar detalhes internos, a extração quebra — use só a API pública.
- Nenhum asset por caminho absoluto: o QR code é SVG inline.
