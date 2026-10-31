import AxeBuilder from '@axe-core/playwright';
import { type Page, expect, test as base } from '@playwright/test';

/**
 * Diagnóstico que o router só emite em modo dev (ngDevMode) quando o NAVEGADOR aborta
 * uma view transition (ex.: viewport muda na emulação de celular). A navegação segue normal
 * e o build de produção não registra nada — por isso não conta como erro.
 */
const DEV_ONLY_NOISE = /Transition was aborted because of invalid state/;

/**
 * Fixture comum: falha o teste se houver erro no console, exceção na página
 * ou requisição para outro host (critério de aceite: nada externo em runtime).
 */
export const test = base.extend<{ guard: void }>({
  guard: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const origin = new URL(baseURL ?? 'http://localhost:4200').origin;
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !DEV_ONLY_NOISE.test(msg.text())) problems.push(`console: ${msg.text()}`);
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      page.on('request', (req) => {
        const url = req.url();
        if (!url.startsWith('data:') && new URL(url).origin !== origin) problems.push(`externa: ${url}`);
      });
      await use();
      expect(problems, 'erros de console, exceções ou requisições externas').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Rola até o fim para disparar os `@defer (on viewport)`. */
export async function scrollThrough(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 400) {
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(80);
  }
}

/** Violações axe `serious`/`critical` (WCAG 2.2 AA). */
export async function seriousA11yViolations(page: Page): Promise<string[]> {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  return result.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `[${v.impact}] ${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

/** Abre uma categoria pelo menu: menubar no desktop, drawer no celular. */
export async function openCategoryFromMenu(page: Page, section: string): Promise<void> {
  if (isMobile(page)) {
    await page.getByRole('button', { name: 'Menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Menu' });
    await drawer.getByRole('button', { name: section }).click();
    await drawer.getByRole('link', { name: `Ver tudo em ${section}` }).click();
  } else {
    await page.getByRole('menubar').getByRole('menuitem', { name: section }).click();
    await page.getByRole('menuitem', { name: `Ver tudo em ${section}` }).click();
  }
}

/** Adiciona um produto simples (sem tamanho) ao carrinho pela UI. */
export async function addBottleToCart(page: Page): Promise<void> {
  await page.goto('/p/garrafa-termica-500-ml');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByRole('link', { name: /^Carrinho, 1 item/ })).toBeVisible();
}

export async function fillShipping(page: Page, cep = '01310-100'): Promise<void> {
  await page.getByLabel('Nome completo').fill('Ana Souza');
  await page.getByLabel('E-mail', { exact: true }).fill('ana@exemplo.com');
  await page.getByLabel('CEP').fill(cep);
  await page.getByLabel('Rua').fill('Avenida Paulista');
  await page.getByLabel('Número').fill('1000');
  await page.getByLabel('Bairro').fill('Bela Vista');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByLabel('UF').selectOption('SP');
}
