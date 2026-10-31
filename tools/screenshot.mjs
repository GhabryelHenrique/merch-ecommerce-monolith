#!/usr/bin/env node
/**
 * Screenshot rápido de uma página (Chromium headless do Playwright) + erros do console.
 *
 *   node tools/screenshot.mjs <url> <arquivo.png> [largura=1280] [altura=900] [--full]
 *
 * Usado para verificar a UI no dev server sem abrir um navegador.
 */
import { chromium } from '@playwright/test';

const [url, out, width = '1280', height = '900', ...flags] = process.argv.slice(2);
if (!url || !out) {
  console.error('uso: node tools/screenshot.mjs <url> <arquivo.png> [largura] [altura] [--full]');
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } });
const problems = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`));
page.on('request', (req) => {
  const host = new URL(req.url()).hostname;
  if (!['localhost', '127.0.0.1'].includes(host) && !req.url().startsWith('data:')) {
    problems.push(`[external-request] ${req.url()}`);
  }
});

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: flags.includes('--full') });
console.log(`título: ${await page.title()}`);
console.log(problems.length ? problems.join('\n') : 'console: sem erros/avisos');
await browser.close();
