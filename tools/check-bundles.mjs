#!/usr/bin/env node
/**
 * Prova que as fronteiras de código viraram fronteiras de bundle.
 *
 *   npm run build:stats   (ng build monolith --stats-json)
 *   node tools/check-bundles.mjs
 *
 * Lê o metafile do esbuild (dist/monolith/browser-stats.json), calcula o bundle INICIAL
 * (entry `main` + tudo importado estaticamente) e falha se algum arquivo de
 * `src/app/domains/` estiver nele. Depois lista os chunks lazy por área.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const stats = JSON.parse(readFileSync(join('dist', 'monolith', 'browser-stats.json'), 'utf8'));
const outputs = stats.outputs;
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;
const isJs = (file) => file.endsWith('.js');

const mainFile = Object.keys(outputs).find((f) => isJs(f) && outputs[f].entryPoint?.endsWith('src/main.ts'));
if (!mainFile) throw new Error('entry main não encontrado no browser-stats.json');

// Fecho transitivo dos imports estáticos a partir do main = bundle inicial.
const initial = new Set();
const visit = (file) => {
  if (initial.has(file)) return;
  initial.add(file);
  for (const imp of outputs[file]?.imports ?? []) {
    if (imp.kind === 'import-statement' && outputs[imp.path]) visit(imp.path);
  }
};
visit(mainFile);

const areaOf = (input) => {
  const m = input.match(/src\/app\/(domains\/[^/]+|core|shared\/[^/]+)\//);
  if (m) return m[1];
  if (input.includes('src/app/')) return 'app (raiz)';
  if (input.includes('node_modules/@angular/')) return '@angular/' + input.split('node_modules/@angular/')[1].split('/')[0];
  if (input.includes('node_modules/')) return 'outras libs';
  return 'outros';
};

const describe = (file) => {
  const areas = new Map();
  for (const [input, info] of Object.entries(outputs[file].inputs ?? {})) {
    const area = areaOf(input);
    areas.set(area, (areas.get(area) ?? 0) + info.bytesInOutput);
  }
  return [...areas.entries()].sort((a, b) => b[1] - a[1]);
};

let initialBytes = 0;
const leaks = [];
console.log('BUNDLE INICIAL');
for (const file of initial) {
  initialBytes += outputs[file].bytes;
  for (const input of Object.keys(outputs[file].inputs ?? {})) {
    if (input.includes('src/app/domains/')) leaks.push(`${input} → ${file}`);
  }
  console.log(`  ${file.padEnd(28)} ${kb(outputs[file].bytes).padStart(10)}  ${describe(file).slice(0, 4).map(([a, b]) => `${a} ${kb(b)}`).join(', ')}`);
}
console.log(`  total: ${kb(initialBytes)}\n`);

console.log('CHUNKS LAZY COM CÓDIGO DE DOMÍNIO');
const lazy = Object.keys(outputs).filter((f) => isJs(f) && !initial.has(f));
for (const domain of ['domains/catalog', 'domains/checkout']) {
  const chunks = lazy.filter((f) => Object.keys(outputs[f].inputs ?? {}).some((i) => i.includes(`src/app/${domain}/`)));
  const total = chunks.reduce((n, f) => n + outputs[f].bytes, 0);
  console.log(`  ${domain}: ${chunks.length} chunks, ${kb(total)}`);
  const mixed = chunks.filter((f) =>
    Object.keys(outputs[f].inputs ?? {}).some((i) => /src\/app\/domains\//.test(i) && !i.includes(`src/app/${domain}/`)),
  );
  if (mixed.length) leaks.push(`chunk(s) misturando domínios: ${mixed.join(', ')}`);
}

if (leaks.length) {
  console.error('\n✘ Fronteira violada:\n  ' + leaks.join('\n  '));
  process.exit(1);
}
console.log('\n✔ catalog e checkout estão em chunks lazy separados; nada deles no bundle inicial.');
