import { defineConfig, devices } from '@playwright/test';

/**
 * E2E = teste de PARIDADE das fases 2 e 3: a mesma suíte roda contra o monólito,
 * o shell com remotes e o Cloud Run, mudando só BASE_URL.
 *   BASE_URL=http://localhost:8080 npm run e2e
 */
const baseURL = process.env['BASE_URL'] ?? 'http://localhost:4200';
const external = Boolean(process.env['BASE_URL']);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  outputDir: 'test-results',
  use: {
    baseURL,
    locale: 'pt-BR',
    trace: 'retain-on-failure',
  },
  // Só Chromium: desktop e celular.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  // Sem BASE_URL: sobe (ou reaproveita) o dev server.
  webServer: external
    ? undefined
    : { command: 'npm start', url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
