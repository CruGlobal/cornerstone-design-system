/**
 * Cornerstone Components' lint rules.
 *
 * Modelled on cornerstone-design-system's config, extended with typescript-eslint's
 * `recommended` set because this repo is 441 TypeScript files rather than a handful of
 * build scripts. Rule choices follow the DPS JavaScript Standards doc where it speaks.
 *
 * Upstream had removed ESLint before the fork point but left a lint-staged rule calling it,
 * so nothing has linted this code. Expect the occasional inherited pattern.
 */
import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/**',
      'src/react/**', // generated
      // The documentation site is Eleventy and is being replaced by Astro + Starlight
      // (see .scratch/cornerstone-fork/issues/13-astro-starlight-port.md). Scoped out for
      // the same reason cspell is: linting code that is about to be deleted buys nothing.
      // The port brings its own source under the lint.
      // The Astro site's own source IS linted — that is the promise above. Only its build output
      // and generated types are not: `dist/**` above is root-relative and does not reach them.
      'docs-site/dist/**',
      'docs-site/.astro/**',
      // The copied library build, not the site's own source. `docs-site/public/**` used to be
      // ignored wholesale, which also swept up the five hand-written scripts under
      // `public/scripts/` — 820 lines the promise above says are linted.
      'docs-site/public/dist/**',
      'docs-site/public/assets/**',
      'docs-site/public/patterns/**',
      'node_modules/**',
      '**/*.d.ts',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  importX.flatConfigs.recommended,

  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      'import-x/resolver': { node: { extensions: ['.js', '.ts'] } },
    },
    rules: {
      curly: 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],

      // The DPS standards doc says "always use triple equals". This is the one recorded
      // exception. `x == null` is true for null and undefined and nothing else — it is the
      // single case where the loose form is type-safe, and TypeScript narrows it correctly,
      // which is the doc's own stated reason for requiring `===`. 51 of the 52 sites in src
      // are this idiom.
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      'import-x/no-duplicates': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      // Group order is the DPS doc's, with `sibling` added as mpdx-react does — but without
      // the doc's trailing `type` group. That group sorts every `import type` to the end
      // regardless of where it comes from, which pulls `import type { PropertyValues } from
      // 'lit'` below local `./x.styles.js` imports. It produced 32 complaints across 22 files
      // that the rule could not autofix, and fixing them by hand would separate type imports
      // from the value imports of the same module for no readability gain. Type imports sort
      // with their source group instead.
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
          alphabetize: { order: 'asc' },
          'newlines-between': 'never',
        },
      ],
      // NodeNext ESM means relative imports carry a `.js` extension that no file has, and
      // bare specifiers resolve through `exports`. Neither is something the resolver can
      // follow, and tsc already checks both.
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
      // Fires on legitimate default imports whose package also exports the same name
      // (`Eleventy`, `importX`). No defect behind it.
      'import-x/no-named-as-default': 'off',
    },
  },

  {
    // Build scripts and one-off tools are CLIs. Printing is what they are for.
    files: ['scripts/**/*.js', 'docs-site/scripts/**/*.js', 'tools/**/*.mjs', '*.js'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    // Chai reads as an unused expression by design: `expect(el.expanded).to.be.false;`.
    // 1,281 of these, none of them a defect.
    files: ['**/*.test.ts', 'src/internal/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': 'off',
      // Tests deliberately reach past the public type surface to assert internals and to
      // feed components the wrong thing on purpose. 17 of the 26 `any`s were here; it stays
      // an error in src.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Type-aware rules. Scoped to `src/**/*.ts`: the only linted TypeScript outside it is
  // `docs-site/src/content.config.ts`, which no tsconfig includes, and a type-aware block that
  // matches it fails to parse. Costs ~2.5s on a gate whose build and test steps are minutes.
  ...tseslint.configs.recommendedTypeCheckedOnly.map((config) => ({
    ...config,
    files: ['src/**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  })),

  {
    files: ['src/**/*.ts'],
    rules: {
      // Lit calls a template event listener with the host as `this`, so `@click=${this.handleClick}`
      // is correct by construction. 159 of the 167 reports were exactly that.
      '@typescript-eslint/unbound-method': 'off',

      // Warnings, not errors, for one pass. 282 findings survive the exemptions below; 55 were
      // autofixed. The rest are a bounded backlog, and failing the gate on them would only invite
      // blanket disable comments. Walk them down, then promote to `error`.
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/no-base-to-string': 'warn',
      '@typescript-eslint/no-duplicate-type-constituents': 'warn',
      '@typescript-eslint/no-redundant-type-constituents': 'warn',
      '@typescript-eslint/restrict-template-expressions': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
    },
  },

  {
    // `@open-wc/semantic-dom-diff` augments `Chai.Equal` to return `Promise<Assertion>`
    // (chai-dom-diff-plugin.d.ts:32-35), so every `expect(x).to.equal(y)` in the suite reads as a
    // floating promise — 1,844 of them. Two escapes were tried and neither works: a declaration
    // merge under `src/` loses to the plugin's overloads, and the rule's own
    // `allowForKnownSafeCalls`/`allowForKnownSafePromises` never match, because the expression's
    // type is a plain `lib.es5` Promise rather than anything traceable to the package. The only
    // remaining levers are this exemption or patching the dependency; patching a `.d.ts` to recover
    // 34 real findings is not worth carrying across every bump.
    //
    // The unsafe-* rules are off here for the same reason `no-explicit-any` already is: tests reach
    // past the public type surface on purpose. 225 of the 226 `no-unsafe-call` reports were in three
    // test files.
    files: ['**/*.test.ts', 'src/internal/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
];
