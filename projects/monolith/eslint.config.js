// @ts-check
const { defineConfig } = require('eslint/config');
const rootConfig = require('../../eslint.config.js');

/*
 * Fronteiras de arquitetura (AGENTS.md §6).
 *
 * No flat config, o bloco mais específico SUBSTITUI a regra `no-restricted-imports`
 * inteira — por isso cada bloco é montado com `restrict(...)`, que sempre inclui as
 * regras comuns (sem import profundo) e acrescenta as da área.
 *
 * `no-restricted-imports` só analisa imports estáticos. O `import()` dinâmico de
 * `app.routes.ts` (lazy loading dos domínios) é a exceção permitida pela regra 3.
 */

/** Regra 4: só a API pública (`index.ts`) de cada área. */
const DEEP_IMPORTS = {
  group: ['@merch/core/**', '@merch/shared/*/**', '@merch/catalog/**', '@merch/checkout/**'],
  message: 'Use apenas o alias público da área (index.ts). Import profundo quebra a extração da fase 2.',
};

/** Alias proibido para a área. */
const forbid = (alias, message) => ({ group: [alias], message });

/** Regra 4: nada de caminho relativo atravessando áreas. */
const relativeInto = (...areas) => ({
  regex: `^(\\./|(\\.\\./)+)(${areas.join('|')})(/|$)`,
  message: 'Não atravesse áreas por caminho relativo: use o alias @merch/*.',
});

const DOMAIN_TO_DOMAIN = 'Domínio não importa domínio: comunique-se por URL ou por @merch/shared/cart.';
const NO_CORE = 'Só o shell (core) conhece o core. Use @merch/shared/* ou URLs.';

const restrict = (...patterns) => ['error', { patterns: [DEEP_IMPORTS, ...patterns] }];

module.exports = defineConfig([
  ...rootConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': ['error', { type: 'attribute', prefix: 'merch', style: 'camelCase' }],
      '@angular-eslint/component-selector': ['error', { type: 'element', prefix: 'merch', style: 'kebab-case' }],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-imports': restrict(),
    },
  },
  // Shell: app.* + core/ — regra 3 (sem import estático de domínio).
  {
    files: ['**/src/app/*.ts', '**/src/app/core/**/*.ts'],
    rules: {
      'no-restricted-imports': restrict(
        forbid('@merch/catalog', 'O shell só carrega domínios por import() dinâmico em app.routes.ts.'),
        forbid('@merch/checkout', 'O shell só carrega domínios por import() dinâmico em app.routes.ts.'),
        relativeInto('core', 'shared', 'domains', 'catalog', 'checkout'),
      ),
    },
  },
  // Regra 2: shared não importa core nem domínios.
  {
    files: ['**/src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': restrict(
        forbid('@merch/core', 'shared não importa core.'),
        forbid('@merch/catalog', 'shared não importa domínios.'),
        forbid('@merch/checkout', 'shared não importa domínios.'),
        relativeInto('core', 'domains', 'catalog', 'checkout', 'ui', 'cart', 'util'),
      ),
    },
  },
  // Regra 1: domínio não importa domínio (nem o core).
  {
    files: ['**/src/app/domains/catalog/**/*.ts'],
    rules: {
      'no-restricted-imports': restrict(
        forbid('@merch/checkout', DOMAIN_TO_DOMAIN),
        forbid('@merch/catalog', 'Dentro do domínio use caminho relativo; o alias é só para quem está fora.'),
        forbid('@merch/core', NO_CORE),
        relativeInto('core', 'shared', 'checkout', 'domains'),
      ),
    },
  },
  {
    files: ['**/src/app/domains/checkout/**/*.ts'],
    rules: {
      'no-restricted-imports': restrict(
        forbid('@merch/catalog', DOMAIN_TO_DOMAIN),
        forbid('@merch/checkout', 'Dentro do domínio use caminho relativo; o alias é só para quem está fora.'),
        forbid('@merch/core', NO_CORE),
        relativeInto('core', 'shared', 'catalog', 'domains'),
      ),
    },
  },
]);
