import { addBottleToCart, expect, fillShipping, openCategoryFromMenu, test } from './support';

test.describe('Jornada de compra', () => {
  test('home → categoria → filtro → produto → variante → carrinho → cupom → entrega → pagamento → revisão → confirmação', async ({
    page,
  }) => {
    // Home
    await page.goto('/');
    await expect(page).toHaveTitle(/Merch Store/);
    await expect(page.getByRole('heading', { level: 1, name: 'Aurora chegou' })).toBeVisible();

    // Categoria pelo menu
    await openCategoryFromMenu(page, 'Vestuário');
    await expect(page).toHaveURL(/\/c\/vestuario$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Vestuário' })).toBeVisible();

    // Filtro (estado na URL)
    await page.getByLabel('Tipo').selectOption({ label: 'Camisetas' });
    await expect(page).toHaveURL(/subcategoria=camisetas/);
    await expect(page.getByRole('main').getByRole('status')).toHaveText('4 produtos');

    // Produto
    await page.getByRole('link', { name: 'Camiseta Clássica' }).click();
    await expect(page).toHaveURL(/\/p\/camiseta-classica$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Camiseta Clássica' })).toBeVisible();
    const add = page.getByRole('button', { name: 'Adicionar ao carrinho' });
    await expect(add).toBeDisabled();

    // Variante: cor + tamanho
    await page.getByRole('radio', { name: 'Azul' }).check();
    await page.getByRole('radio', { name: 'M', exact: true }).check();
    await expect(add).toBeEnabled();
    await page.getByRole('button', { name: 'Aumentar quantidade' }).click();

    // Adicionar → contador e toast com link para o carrinho
    await add.click();
    await expect(page.getByRole('link', { name: 'Carrinho, 2 itens' })).toBeVisible();
    await page.getByRole('link', { name: 'Ver carrinho' }).click();

    // Carrinho + cupom
    await expect(page).toHaveURL(/\/checkout\/carrinho$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeVisible();
    await page.getByLabel('Cupom de desconto').fill('WORKSHOP10');
    await page.getByRole('button', { name: 'Aplicar' }).click();
    await expect(page.getByText('Cupom WORKSHOP10 aplicado.')).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: '−R$' })).toHaveText(/−R\$\s15,98/);
    await page.getByRole('link', { name: 'Continuar', exact: true }).click();

    // Entrega
    await expect(page).toHaveURL(/\/checkout\/entrega$/);
    await fillShipping(page);
    await page.getByRole('radio', { name: /Econômico/ }).check();
    await page.getByRole('button', { name: 'Continuar para o pagamento' }).click();

    // Pagamento (sem campos de cartão)
    await expect(page).toHaveURL(/\/checkout\/pagamento$/);
    await expect(page.getByRole('main').getByRole('textbox')).toHaveCount(0); // nenhum campo de cartão
    await page.getByRole('radio', { name: /Pix/ }).check();
    await expect(page.getByRole('img', { name: 'QR code ilustrativo do Pix' })).toBeVisible();
    await page.getByRole('button', { name: 'Revisar pedido' }).click();

    // Revisão → confirmação
    await expect(page).toHaveURL(/\/checkout\/revisao$/);
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();
    await expect(page).toHaveURL(/\/checkout\/confirmacao\/MS-[A-Z0-9]{6}$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Pedido confirmado!' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Carrinho, vazio' })).toBeVisible();
  });

  test('CEP 99999-999 simula falha e permite tentar de novo', async ({ page }) => {
    await addBottleToCart(page);
    await page.goto('/checkout/entrega');
    await fillShipping(page, '99999-999');
    await page.getByRole('radio', { name: /Expresso/ }).check();
    await page.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await page.getByRole('radio', { name: /Boleto/ }).check();
    await page.getByRole('button', { name: 'Revisar pedido' }).click();
    await page.getByRole('button', { name: 'Confirmar pedido' }).click();

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Pedido não confirmado');
    await expect(alert).toBeFocused();
    await expect(alert.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    await expect(page.getByRole('link', { name: /^Carrinho, 1 item/ })).toBeVisible();
  });

  test('guards levam para a etapa válida mais próxima', async ({ page }) => {
    await page.goto('/checkout/revisao');
    await expect(page).toHaveURL(/\/checkout\/carrinho$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Seu carrinho está vazio' })).toBeVisible();
  });

  test('produto inexistente e rota desconhecida', async ({ page }) => {
    await page.goto('/p/nao-existe');
    await expect(page.getByRole('heading', { level: 1, name: 'Produto não encontrado' })).toBeVisible();
    await page.goto('/qualquer/coisa');
    await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
  });
});
