/**
 * The brands this site can show itself in, and the `<head>` markup that applies the reader's pick before first
 * paint.
 *
 * The header menu offers each brand theme in `themer.js`. Picking one other than the default loads that theme's
 * stylesheets after `cornerstone.css`, and picking the default removes them, which is how a consumer switches
 * too: the stylesheet you load picks the theme. No class does it. Palettes and role defaults sit on
 * `:where(:root)` with no class, so switching by class would blend the brands (#248 asks how a class could
 * scope one).
 *
 * Node-only, because the default brand is read from `cornerstone.css` on disk and the stylesheet addresses come
 * from `build-tools/site-url.js`. Both resolve their paths from `import.meta.url`, which breaks once Vite
 * bundles a component, so this is imported by `astro.config.mjs`, the remark plugins and the checks, never by
 * a component. The header menu reads the same data at runtime from the config element below.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { asset } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { componentsDir } from '@cruglobal/cornerstone-build-tools/workspace.js';
import { brandThemes, themeStylesheets } from './themer.js';

/**
 * Where the pick is stored. Its own key, beside Starlight's `starlight-theme`, which keeps meaning the colour
 * scheme. Namespaced because every project site on the `github.io` origin shares one localStorage.
 */
const STORAGE_KEY = 'cornerstone-docs-brand';

/** The element the pre-paint script and the header menu both read the brand table from. */
const CONFIG_ID = 'docs-brands';

const slugOf = (theme) => theme.filename.replace(/\.css$/, '');

/**
 * The theme `cornerstone.css` imports: the brand a page shows with nothing else loaded. Read from the stylesheet
 * rather than assumed, so the menu's default follows the library's.
 */
const defaultSlug = /@import\s+url\(\s*['"]?themes\/([a-z-]+)\.css/.exec(
  readFileSync(join(componentsDir(), 'src', 'styles', 'cornerstone.css'), 'utf-8').replace(/\/\*[\s\S]*?\*\//g, ''),
)?.[1];

/**
 * Every brand, in `themer.js` order. `stylesheets` is what the site adds after `cornerstone.css` to show that
 * brand, from `themeStylesheets()`: nothing for the default, which `cornerstone.css` already carries.
 */
export const brands = brandThemes.map((theme) => {
  const slug = slugOf(theme);
  const isDefault = slug === defaultSlug;

  return {
    slug,
    name: theme.name,
    theme,
    isDefault,
    stylesheets: isDefault ? [] : Object.values(themeStylesheets(theme)).map((file) => asset(`/dist/styles/${file}`)),
  };
});

export const defaultBrand = brands.find((brand) => brand.isDefault);

if (!defaultBrand) {
  throw new Error(`cornerstone.css imports themes/${defaultSlug}.css, which is not a brand theme in themer.js.`);
}

/** The brand table, as JSON for the page: the storage key, the default, and each brand's stylesheets. */
const config = JSON.stringify({
  storageKey: STORAGE_KEY,
  default: defaultBrand.slug,
  stylesheets: Object.fromEntries(brands.map((brand) => [brand.slug, brand.stylesheets])),
});

/**
 * The pre-paint read, the brand's twin of the scheme read in `ThemeProvider.astro`.
 *
 * It stamps `data-brand` on `<html>` and writes the brand's stylesheets into the parser's stream, so they are
 * parser-inserted and hold first paint the way a link in the markup does. An appended link need not, and the
 * page could paint Cru's colours first. It sits straight after the `cornerstone.css` link, so the brand's
 * stylesheets land after it and win the tie on `:where(:root)`, as the theming page tells a consumer to load
 * them. Only a brand the build listed is honoured; anything else in storage falls back to the default.
 */
const prePaint = `
(() => {
  const config = JSON.parse(document.getElementById('${CONFIG_ID}').textContent);
  const stored = typeof localStorage !== 'undefined' && localStorage.getItem(config.storageKey);
  const brand = stored && Object.hasOwn(config.stylesheets, stored) ? stored : config.default;

  document.documentElement.dataset.brand = brand;

  for (const href of config.stylesheets[brand]) {
    document.write('<link rel="stylesheet" href="' + href + '" data-brand-stylesheet />');
  }
})();
`;

/**
 * Shows each brand's version of a page block only while that brand is picked.
 *
 * `data-brand` on `<html>` is a docs-only switch for content, and themes nothing: a block built once per brand
 * carries `data-brand-only="<slug>"`, and this hides every version but the picked one. The default brand's rule
 * keys off `data-brand` being set to something else, so without script the default's blocks show and the rest
 * stay hidden. Unlayered, so it beats the `display` a layout utility gives the same element.
 *
 * The second rule is for the switch in the header menu, which runs inside a view transition to hold the old
 * frame while the new brand's stylesheets load (see `ThemeSelect.astro`). The hold is what keeps the switch
 * whole, so a reader who asks for less motion keeps it and loses only the crossfade. No other view transition
 * on the site runs under that setting: `view-transitions.js` skips them.
 */
const css =
  brands
    .map(({ slug, isDefault }) =>
      isDefault
        ? `html[data-brand]:not([data-brand='${slug}']) [data-brand-only='${slug}']`
        : `html:not([data-brand='${slug}']) [data-brand-only='${slug}']`,
    )
    .join(',\n') +
  ' {\n  display: none;\n}\n' +
  '@media (prefers-reduced-motion: reduce) {\n' +
  '  ::view-transition-old(root),\n  ::view-transition-new(root) {\n    animation: none;\n  }\n}';

/** The three `<head>` entries, in order, to place straight after the `cornerstone.css` link. */
export const brandHead = [
  { tag: 'script', attrs: { type: 'application/json', id: CONFIG_ID }, content: config },
  { tag: 'script', content: prePaint },
  { tag: 'style', content: css },
];

/**
 * Splits built HTML into what every brand shows and the blocks one brand shows, for the checks.
 *
 * A block is an element carrying `data-brand-only`, up to its matching close tag. The blocks are generated by
 * `remark-theming.js` or written into a page as single elements, so counting one tag name's opens and closes
 * finds the end without a parser.
 */
export function brandBlocks(html) {
  const opening = /<([a-z][a-z0-9-]*)(?=[\s>])[^>]*\sdata-brand-only="([a-z-]+)"[^>]*>/gi;
  const blocks = [];
  let shared = '';
  let from = 0;
  let match;

  while ((match = opening.exec(html)) !== null) {
    const [tag, name, slug] = match;
    const tags = new RegExp(`<${name}(?=[\\s>/])|</${name}>`, 'gi');
    let depth = 1;
    let end = html.length;
    let found;

    tags.lastIndex = match.index + tag.length;

    while (depth > 0 && (found = tags.exec(html)) !== null) {
      depth += found[0].startsWith('</') ? -1 : 1;
      end = found.index + found[0].length;
    }

    shared += html.slice(from, match.index);
    blocks.push({ slug, html: html.slice(match.index, end) });
    from = end;
    opening.lastIndex = end;
  }

  return { shared: shared + html.slice(from), blocks };
}
