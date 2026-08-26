import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { asset } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { visit } from 'unist-util-visit';
import { palettes as paletteList, themes, tints } from '../themer.js';

/**
 * The Color Palettes and Built-in Themes pages, generated from the themer data.
 *
 * Both pages are lists of what the library ships, so neither is written by hand: `docs/_data/themer.js`
 * already names every theme, its palette, its brand colour and its description, and the palette pages need
 * the hue and tint scales it defines. Adding a palette there puts it on the page, in the picker and in the
 * install instructions at once — which is the same bargain the component reference makes with the CEM.
 *
 * That data file still lives under the Eleventy site because the Eleventy site still reads it as a `_data`
 * module. It is plain ESM with named exports and nothing Eleventy-specific in it, so both sites import the
 * same copy rather than keeping two. It moves beside `build-tools/component-api.js` when Eleventy is retired.
 *
 * Five leaf directives, so the pages keep their prose in markdown and only mark where the generated part
 * goes:
 *
 *   ::color-palette     the brand palette's swatch grid
 *   ::color-scales      a swatch grid for named scales; `scales` names them, for the variant grids
 *   ::core-colors       every hue's core colour, key step and on colour
 *   ::variant-colors    every variant's core colour, on colour and default hue
 *   ::variant-matrix    the fill/border/on × quiet/normal/loud matrix, one column per variant
 *   ::palette-install   the brand palette's install instructions
 *   ::theme-preview     the brand theme, in light and dark, either side of a comparison slider
 *   ::theme-install     the brand theme's install instructions
 *
 * Three things the Eleventy pages did are deliberately not carried across:
 *
 *   - **The Pro upsell callouts and the Pro badges.** Every theme and palette in this fork is `isPro:
 *     false`, so each of those branches was already dead code, and the callouts advertised a subscription
 *     and a Theme Builder that this package does not have.
 *   - **The "Hosted Projects" install tab.** It described settings screens in a workspace product.
 *   - **The "CDN" install tab.** It was built by a `cdnUrl` shortcode that does not exist in this fork, and
 *     this fork publishes no CDN — the Installation page documents npm only. npm and self-hosted are the
 *     two ways that are actually true here.
 */

// The components package, which owns the stylesheets this plugin reads. Named rather than counted
// in `dirname` calls: it is a sibling package in the workspace, not an ancestor of this file.
const repoRoot = join(dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url))))), 'components');
const paletteDir = join(repoRoot, 'src', 'styles', 'color', 'palettes');
const variantDir = join(repoRoot, 'src', 'styles', 'color', 'variants');
const themeDir = join(repoRoot, 'src', 'styles', 'themes');

const stripExtension = (filename) => filename.replace(/\.css$/, '');
const slugOf = (name) => name.toLowerCase();
const escape = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * What a palette stylesheet actually defines, read from the stylesheet rather than assumed.
 *
 * The Cru palette is not shaped like the ones it was forked alongside, and both differences matter here:
 *
 *   - **Its hue names.** The others define the ten hues upstream documents — red through gray. Cru's is
 *     generated from Cru's brand colours and names nineteen of its own (lemon, rose, ruby, vermilion, cerise,
 *     sky, turquoise, navy, mint, moss, olive-drab, graphite, …), so a grid built from a hard-coded ten-hue
 *     list showed it almost entirely wrong.
 *   - **Whether it is selectable.** The others scope their values to a `.cs-palette-*` class. `cru.css` puts
 *     its values on `:where(:root), :host` and defines no class at all — it is the palette the library
 *     applies, not one you turn on — which is also what makes it the one this page documents.
 */
function readPalette(palette) {
  const slug = slugOf(palette.name);
  const css = readFileSync(join(paletteDir, palette.filename), 'utf-8');
  // The 95 step exists for every hue in every palette, so it is the cheapest way to enumerate the hues —
  // and a Set keeps the file's own order, which is the order the palette was generated in. The hue pattern
  // allows a hyphen: Cru names one `olive-drab`, and a letters-only pattern dropped that scale silently.
  const hues = [...new Set([...css.matchAll(/--cs-color-([a-z-]+)-95:/g)].map((match) => match[1]))];
  // `--cs-color-{hue}-key` names the step the bare `--cs-color-{hue}` token resolves to. Every palette
  // declares one per hue; in the Cru palette it is the step the generator wrote the brand colour into.
  const keys = Object.fromEntries(
    [...css.matchAll(/--cs-color-([a-z-]+)-key:\s*(\d+)/g)].map((match) => [match[1], match[2]]),
  );
  // Each step's literal value, so a swatch can name the colour it is as well as the token it comes from.
  const values = Object.fromEntries(
    [...css.matchAll(/--cs-color-([a-z-]+-\d{2}):\s*(#[0-9a-f]{3,8})/gi)].map((match) => [match[1], match[2]]),
  );

  return { ...palette, slug, hues, keys, values, scoped: css.includes(`.cs-palette-${slug}`) };
}

/** Every palette, with what its stylesheet defines. Exported so the page gate counts the same things. */
export const palettes = paletteList.map(readPalette);

/**
 * The palette this page documents: the one that applies at the document root rather than under a class.
 *
 * Only Cru's does that, and it is the only one worth a reference — the reference palette exists because
 * `themes/default.css` imports it, and a theme applies its own palette, so there is nothing for a reader to
 * choose between. The Awesome and Shoelace themes, and the two palettes they carried, are gone: the theming
 * decision ruled them products rather than capabilities.
 */
export const brandPalette = palettes.find((palette) => !palette.scoped) ?? palettes[0];

/**
 * The semantic variants, and which hue each is by default.
 *
 * Read from `color/variants/{brand}.css`, which is generated alongside the palette: each role's default block
 * carries both `:where(:root)` and the `.cs-{role}-{hue}` class for the hue it defaults to, so the selector
 * list names the default without anything having to be told.
 *
 * This fork has **eight** roles, not the five the ported page documented — Cru adds `highlight`,
 * `information` and `link` — and its defaults are its own: `brand` is yellow rather than blue, `warning` is
 * orange rather than yellow, `danger` is cerise rather than red. The page said otherwise and pointed at
 * `--cs-color-blue`, which this fork's palette does not define.
 *
 * `attention` records whether the role has the `fill`/`border`/`on` × `quiet`/`normal`/`loud` set that powers
 * `variant=""` on components. Seven do; `link` has a scale but no attention levels, so it is a colour role
 * rather than a component variant, and the matrix leaves it out.
 */
function readVariants() {
  const css = readFileSync(join(variantDir, brandPalette.filename), 'utf-8');
  const theme = readFileSync(join(themeDir, brandPalette.filename), 'utf-8');

  return [...css.matchAll(/\/\* ([a-z]+) — defaults to ([a-z-]+) \*\//g)].map((match) => ({
    name: match[1],
    hue: match[2],
    attention: theme.includes(`--cs-color-${match[1]}-fill-quiet:`),
  }));
}

export const variants = readVariants();

/**
 * The theme this page documents: the one that ships the brand palette.
 *
 * Only Default is left beside it, and the relationship has inverted since this was first written. The
 * theming sweep pointed `cornerstone.css` at `themes/cru.css`, so Cru's is the theme every consumer gets
 * and Default is the opt-in unbranded reference rather than the base every theme layers over.
 */
export const brandTheme =
  themes.find((theme) => stripExtension(theme.palette.filename) === brandPalette.slug) ?? themes[0];

/** `red` → `Red`, for a hue's label. */
const titleCase = (value) => value.replace(/^./, (character) => character.toUpperCase());

/**
 * One tint, as a copy button whose whole square is the trigger.
 *
 * `cs-copy-button` takes the trigger in its default slot, which is what makes the swatch itself copy the
 * token rather than sitting beside a copy icon. It also builds a tooltip for a slotted trigger, taking the
 * text from `copy-label` — so `copy-label` is doing three jobs at once: the tooltip, the button's accessible
 * name, and the announcement on copy. It therefore says what clicking gives you and what the colour is, which
 * is the part not already on screen. Naming the hue and step there, as this page first did, put a tooltip over
 * the swatch repeating the heading above it and the label below it.
 *
 * The copied value is the `var()` reference rather than the resolved colour, because that is what a reader
 * pastes into their own CSS.
 */
const swatch = (hue, tint, isKey, value) => {
  const token = `--cs-color-${hue}-${tint}`;
  // The emphasis is the library's own utilities rather than a rule of this site's.
  const emphasis = isKey ? 'cs-font-weight-bold' : 'cs-color-text-quiet';
  const label = [`var(${token})`, value, isKey && 'key step'].filter(Boolean).join(' · ');

  return (
    `<div class="cs-stack cs-gap-3xs" data-tint="${tint}">` +
    `<cs-copy-button class="palette-swatch" value="var(${token})" copy-label="${escape(label)}">` +
    `<button class="palette-swatch-button" style="background: var(${token})"></button>` +
    `</cs-copy-button>` +
    `<span class="palette-tint cs-font-size-xs cs-text-center ${emphasis}">${tint}` +
    `<span class="cs-visually-hidden" data-key-note${isKey ? '' : ' hidden'}>, the key step</span>` +
    `</span>` +
    `</div>`
  );
};

/** One hue: its name and token pattern over its full tint scale, with its key step marked. */
const scale = (hue, key, values = {}) =>
  `<div class="cs-stack cs-gap-xs" data-hue="${hue}">` +
  `<div class="cs-split">` +
  `<div class="cs-font-weight-semibold">${titleCase(hue)}</div>` +
  `<code class="cs-font-size-xs">--cs-color-${hue}-*</code>` +
  `</div>` +
  `<div class="palette-swatches cs-grid cs-gap-3xs">` +
  `${tints.map((tint) => swatch(hue, tint, tint === key, values[`${hue}-${tint}`])).join('')}</div>` +
  `</div>`;

/**
 * The swatch viewer. Marked `cs-not-prose` because it is a diagram rather than prose — without it the
 * prose scope adds its paragraph rhythm between every hue and every swatch.
 */
const viewer = (hues, keys = {}, values = {}) =>
  `<div class="palette-viewer cs-stack cs-gap-l cs-not-prose">` +
  `${hues.map((hue) => scale(hue, keys[hue], values)).join('')}</div>`;

/**
 * The design-token tables on the Color tokens page.
 *
 * Every one was a Nunjucks loop over a hard-coded list — the ten hues upstream ships and five of the eight
 * variants this fork defines — which is why the page could not be ported as markdown and sat as a draft. They
 * are generated from the same stylesheet reads as the palette grid, so the page lists what the library
 * actually defines: nineteen hues, eight variants, and Cru's own defaults.
 *
 * The markup matches the page's other tables: `cs-scroller` around `table.token-table.cs-hover-rows`, token
 * names in `.token-name`, previews in `.swatch`. Only the rows are generated.
 */
const table = (headings, rows, headingClass = '') =>
  `<cs-scroller><table class="token-table cs-hover-rows">` +
  `<thead><tr>${headings.map((heading) => `<th${headingClass}>${heading}</th>`).join('')}</tr></thead>` +
  `<tbody>${rows.join('')}</tbody>` +
  `</table></cs-scroller>`;

const tokenCell = (token) => `<td class="token-name"><code>--cs-color-${token}</code></td>`;

/** A core colour and its on colour, previewed as text on the fill. */
const corePreview = (name) =>
  `<td><div class="swatch" style="background-color: var(--cs-color-${name}); color: var(--cs-color-${name}-on)">Aa</div></td>`;

/** Every hue's core colour, key step and on colour. */
const coreColors = () =>
  table(
    ['Core Color', 'Key', 'On Color', 'Preview'],
    brandPalette.hues.map(
      (hue) => `<tr>${tokenCell(hue)}${tokenCell(`${hue}-key`)}${tokenCell(`${hue}-on`)}${corePreview(hue)}</tr>`,
    ),
  );

/** Every variant's core colour and on colour, and the hue it aliases. */
const variantColors = () =>
  table(
    ['Core Color', 'On Color', 'Default Hue', 'Preview'],
    variants.map(
      (variant) =>
        `<tr>${tokenCell(variant.name)}${tokenCell(`${variant.name}-on`)}` +
        `<td class="token-name"><code>${variant.hue}</code></td>${corePreview(variant.name)}</tr>`,
    ),
  );

/**
 * The `fill` / `border` / `on` × `quiet` / `normal` / `loud` matrix, one column per variant.
 *
 * Only the variants that define the set get a column — `link` has a scale but no attention levels, so a column
 * for it would be nine empty swatches.
 */
const variantMatrix = () => {
  const columns = variants.filter((variant) => variant.attention);
  const rows = [];

  for (const type of ['fill', 'border', 'on']) {
    for (const attention of ['quiet', 'normal', 'loud']) {
      const cells = columns.map((variant) =>
        type === 'border'
          ? `<td><div class="swatch" style="border-color: var(--cs-color-${variant.name}-border-${attention})"></div></td>`
          : `<td><div class="swatch" style="background-color: var(--cs-color-${variant.name}-fill-${attention}); ` +
            `color: var(--cs-color-${variant.name}-on-${attention})">${type === 'on' ? 'Aa' : ''}</div></td>`,
      );

      rows.push(
        `<tr id="token-color-${type}-${attention}">` +
          `<td class="token-name"><code>--cs-color-*-${type}-${attention}</code></td>${cells.join('')}</tr>`,
      );
    }
  }

  // The variant columns keep their names on one line. Seven columns is two more than the page it was ported
  // from had, and at that width `information` and `highlight` were breaking mid-word. `.token-name` is the
  // rule that already says "do not wrap a token", so the headings borrow it rather than adding a second.
  return table(
    ['Custom Property', ...columns.map((variant) => `<code>${variant.name}</code>`)],
    rows,
    ' class="token-name"',
  );
};

/**
 * The brand palette's swatch grid.
 *
 * There is no picker any more. The page documented four palettes because the page it was ported from did, but
 * three of them are not choices in this fork: each is imported by the theme that ships it, and only Cru's
 * applies at the document root. Documenting one palette also means the grid needs no class swapping, no key
 * map on the client, and no second grid for the hues Cru names differently — the markup is simply correct as
 * rendered.
 *
 * The stylesheet is linked from the page rather than the document head. It puts its values at the root, and
 * the site already loads it by way of `themes/cru.css`, so the link is what keeps the grid right if the site's
 * own theme ever changes.
 */
function colorPalette() {
  return (
    `<link rel="stylesheet" href="${asset(`/dist/styles/color/palettes/${brandPalette.filename}`)}" />` +
    `<div class="theming-preview">${viewer(brandPalette.hues, brandPalette.keys, brandPalette.values)}</div>`
  );
}

/**
 * The brand theme's before/after preview.
 *
 * There is no picker any more, for the reason there is no palette picker: the page documented four themes
 * because the page it was ported from did, and three of them are not choices in this fork. What is left is the
 * thing worth showing — the theme itself, in light and dark, either side of a comparison slider.
 *
 * Both frames are the same showcase page under two colour schemes, so the slider reads as one theme in two
 * schemes rather than as two themes. The theme, its palette and its brand colour go in the query string: the
 * showcase applies whatever it is given, which is what makes the preview right on first paint with no script.
 */
function themePreview() {
  const query =
    `theme=${stripExtension(brandTheme.filename)}&palette=${stripExtension(brandTheme.palette.filename)}` +
    `&color-brand=${brandTheme.colorBrand.color}`;

  const frame = (slot, extra = '') =>
    `<cs-zoomable-frame slot="${slot}" src="/examples/themes/showcase?${query}${extra}" zoom="0.65"` +
    ` without-controls without-interaction></cs-zoomable-frame>`;

  return (
    `<div class="theming-preview cs-stack cs-not-prose">` +
    `<header class="cs-stack cs-gap-2xs">` +
    `<div class="cs-heading-m">${escape(brandTheme.name)}</div>` +
    `<p class="cs-font-size-s cs-color-text-quiet">${escape(brandTheme.description)}</p>` +
    `</header>` +
    `<cs-comparison class="theme-comparison" position="80">` +
    `${frame('before', '&color-scheme=dark')}${frame('after')}` +
    `</cs-comparison>` +
    `</div>`
  );
}

/**
 * Install instructions for one palette or theme, as markdown lines.
 *
 * Markdown rather than HTML because the instructions are prose and fenced code, and a fence inside a raw
 * HTML block reaches the reader as literal backticks. Each tag sits on its own line with blank lines around
 * it so remark closes the HTML block and parses what follows — the same reason `remark-page-index` builds
 * markdown and hands it back to the parser.
 */
function instructions({ importPath, htmlClass, subject }) {
  // The Cru palette scopes nothing: importing it is the whole instruction, and telling a reader to add
  // `cs-palette-cru` would be telling them to add a class that matches no rule in the stylesheet.
  const applyClass = htmlClass
    ? ['Then apply the following class to the `<html>` element:', '', '```html', `<html class="${htmlClass}">`, '```']
    : [`Importing it is all that is needed — this ${subject} applies at the document root rather than under a class.`];

  return [
    // The tags run without blank lines between them on purpose. A line holding only a tag is passed
    // through as raw HTML, but `<cs-tab panel="npm">npm</cs-tab>` has content on it, so alone it parses as
    // a paragraph — and `cs-tab-group` then finds a `<p>` where it expects its tabs. Keeping the run in one
    // block hands the lot through untouched; only the panel bodies are left as markdown.
    '<cs-tab-group>',
    '<cs-tab panel="npm">npm</cs-tab>',
    '<cs-tab panel="self-hosted">Self-Hosted</cs-tab>',
    '<cs-tab-panel name="npm">',
    '',
    `After installing \`@cruglobal/cornerstone-components\`, import the ${subject}'s stylesheet:`,
    '',
    '```js',
    `import '@cruglobal/cornerstone-components/${importPath}';`,
    '```',
    '',
    ...applyClass,
    '',
    '</cs-tab-panel>',
    '<cs-tab-panel name="self-hosted">',
    '',
    `If you are self-hosting Cornerstone, include the ${subject}'s stylesheet from your server:`,
    '',
    '```html',
    `<link rel="stylesheet" href="${asset(`/dist/${importPath}`)}" />`,
    '```',
    '',
    ...applyClass,
    '',
    '</cs-tab-panel>',
    '</cs-tab-group>',
  ].join('\n');
}

/** The brand palette's install instructions. */
const paletteInstall = () =>
  instructions({
    importPath: `styles/color/palettes/${brandPalette.filename}`,
    htmlClass: brandPalette.scoped ? `cs-palette-${brandPalette.slug}` : null,
    subject: 'palette',
  });

/**
 * The brand theme's install instructions.
 *
 * A theme's class list is three classes, not one: the theme, the palette it ships with, and its brand colour.
 * Applying the theme alone leaves it on whatever palette is already loaded, which is the most common way a
 * theme comes out looking wrong.
 */
const themeInstall = () => {
  const name = stripExtension(brandTheme.filename);
  const palette = stripExtension(brandTheme.palette.filename);
  const css = readFileSync(join(themeDir, brandTheme.filename), 'utf-8');

  // Three classes or none, and which it is comes from the stylesheet rather than from an assumption. A
  // theme that leads its blocks with `:where(:root)` *is* the document's theme, and so are the palette and
  // variant sheets it imports — importing it is the whole instruction, which is the answer `instructions`
  // already gives the palette page.
  //
  // This hard-coded the trio, so `/themes` told every reader to add `cs-palette-cru` — a class `cru.css`
  // defines nowhere, since it puts its values on `:where(:root), :host`. That is the exact mistake the
  // comment in `instructions` warns against; `paletteInstall` passes its `scoped` flag and was right, and
  // only this caller bypassed the guard by building the string itself.
  const scoped = !css.includes(':where(:root)');

  return instructions({
    importPath: `styles/themes/${brandTheme.filename}`,
    htmlClass: scoped ? `cs-theme-${name} cs-palette-${palette} cs-brand-${brandTheme.colorBrand.color}` : null,
    subject: 'theme',
  });
};

/** Directives whose output is HTML, keyed by directive name. */
const HTML_DIRECTIVES = {
  'color-palette': colorPalette,
  'core-colors': coreColors,
  'variant-colors': variantColors,
  'variant-matrix': variantMatrix,
  'theme-preview': themePreview,
  // A grid for named scales rather than the palette's own: the Color tokens page uses it for the variant
  // scales, which are aliases and so have no entry in the palette stylesheet. With no `scales` it falls back to
  // the brand palette's hues and its key steps.
  'color-scales': (node) => {
    const scales = node.attributes?.scales;

    return scales
      ? viewer(scales.trim().split(/\s+/))
      : viewer(brandPalette.hues, brandPalette.keys, brandPalette.values);
  },
};

/** Directives whose output is markdown, keyed by directive name. */
const MARKDOWN_DIRECTIVES = {
  'palette-install': paletteInstall,
  'theme-install': themeInstall,
};

export function remarkTheming() {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const processor = this;

  return (tree) => {
    visit(tree, 'leafDirective', (node, index, parent) => {
      if (index === undefined) {
        return;
      }

      const html = HTML_DIRECTIVES[node.name];

      if (html) {
        parent.children.splice(index, 1, { type: 'html', value: html(node) });
        return index + 1;
      }

      const markdown = MARKDOWN_DIRECTIVES[node.name];

      if (markdown) {
        const children = processor.parse(markdown()).children;
        parent.children.splice(index, 1, ...children);
        return index + children.length;
      }
    });
  };
}
