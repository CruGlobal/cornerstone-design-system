/**
 * Cru's house style is Prettier's defaults plus `singleQuote` — the same config in mpdx-react,
 * give-web and cornerstone-design-system. This follows it, with one deliberate exception.
 *
 * `printWidth: 120` rather than the default 80. A Lit property declaration carries a decorator,
 * a name, a union type and a default on a single line:
 *
 *   @property({ reflect: true }) variant: 'neutral' | 'brand' | 'success' | 'warning' | 'danger' = 'neutral';
 *
 * At 80 columns that becomes six lines. Across src it adds ~12% more lines, almost all of them in
 * the property blocks that are each component's public API — the most-read code in the library.
 *
 * Import order is not Prettier's job here: `import-x/order` in eslint.config.js owns it, which is
 * how mpdx-react and cornerstone-design-system do it too.
 *
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 120,
  singleQuote: true,
};

export default config;
