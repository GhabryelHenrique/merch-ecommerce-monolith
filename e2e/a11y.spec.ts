import { addBottleToCart, expect, scrollThrough, seriousA11yViolations, test } from './support';

test.describe('Acessibilidade (axe, sem violações serious/critical)', () => {
  test('home', async ({ page }) => {
    await page.goto('/');
    await scrollThrough(page);
    await expect(page.getByRole('heading', { name: 'Coleções' })).toBeVisible();
    expect(await seriousA11yViolations(page)).toEqual([]);
  });

  test('categoria', async ({ page }) => {
    await page.goto('/c/vestuario?ordem=menor-preco');
    await expect(page.getByRole('heading', { level: 1, name: 'Vestuário' })).toBeVisible();
    expect(await seriousA11yViolations(page)).toEqual([]);
  });

  test('produto', async ({ page }) => {
    await page.goto('/p/camiseta-google-g');
    await expect(page.getByRole('heading', { level: 1, name: 'Camiseta Google G' })).toBeVisible();
    await scrollThrough(page);
    expect(await seriousA11yViolations(page)).toEqual([]);
  });

  test('carrinho', async ({ page }) => {
    await addBottleToCart(page);
    await page.goto('/checkout/carrinho');
    await expect(page.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeVisible();
    expect(await seriousA11yViolations(page)).toEqual([]);
  });

  test('entrega (com erros de validação visíveis)', async ({ page }) => {
    await addBottleToCart(page);
    await page.goto('/checkout/entrega');
    await page.getByRole('button', { name: 'Continuar para o pagamento' }).click();
    await expect(page.getByLabel('Nome completo')).toBeFocused();
    expect(await seriousA11yViolations(page)).toEqual([]);
  });
});
