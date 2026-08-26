/**
 * Checks that every custom property the built site references is actually defined somewhere.
 *
 * CSS fails silently on an undefined custom property. `var(--nope)` with no fallback makes its whole
 * declaration invalid at computed-value time, so the declaration is dropped: no error, no console
 * warning, and a page that still lays out and still looks finished. That is the worst failure mode a
 * documentation site can have, because the page reads as complete while demonstrating nothing.
 *
 * It is not hypothetical. Two rounds of it shipped here:
 *
 *   - `--layout-example-*`, six variables whose only definition was the Eleventy stylesheet this site
 *     does not load. Eleven published pages styled their demo boxes through them, so every layout
 *     utility page rendered a large, perfectly empty rectangle where the example should be.
 *   - `--cs-color-{red,blue,indigo}-*` on seven more files. The theming sweep pointed `cornerstone.css`
 *     at `themes/cru.css`, which defines none of those three hues. One of the casualties was an example
 *     literally named `.redcrumbs`, which was not red.
 *
 * Both survived a prose pass and a truth pass, because both of those read source. `code-highlighter.css`
 * had even diagnosed the cause in a comment and fixed its own file; nothing swept the rest of the site.
 * This is that sweep, run every build.
 *
 * Method, and why it reads `dist/`: the question is not "is this token defined in the repo" — `indigo`
 * is, in `palettes/default.css`, which the site never loads. The question is "does it resolve for a
 * reader", so the corpus is what the browser actually receives: every stylesheet in `dist/`, every
 * `<style>` block, and every inline `style` attribute.
 *
 * **Definitions are gathered from everything; references are judged only where this site is the author.**
 * That asymmetry is the whole design. A token this site uses has to resolve against the full cascade the
 * browser assembles, library included — but the library's and Starlight's own stylesheets are not ours to
 * answer for, and they legitimately reference properties this check cannot see: `--cs-scroll-lock-size` is
 * written by `internal/scroll.ts` at runtime, `--_button-vertical-indent` and `--scroll-margin-top` are
 * declared inside a shadow root, and Starlight's `print.css` still reaches for the `--sl-*` variables whose
 * defining stylesheets this site deliberately stubs out. Judging those would be nineteen findings of which
 * seventeen are somebody else's, and a check that cries wolf gets switched off.
 *
 * Four things are deliberately not failures:
 *
 *   - `var(--x, fallback)`. A reference with a fallback is safe by construction, so only bare `var(--x)`
 *     counts. Nesting is handled: in `var(--a, var(--b))`, `--a` is safe and `--b` is checked.
 *   - A component's own `@cssproperty`. Those are defined inside a shadow root, which no amount of
 *     reading the page's CSS will show, so they are taken from the manifest.
 *   - Anything inside `<pre>`. Highlighted example source is a copy of markup that also renders live, so
 *     scanning it would double-count; and a plain ```css fence is illustrative, not applied.
 *   - Anything referenced only by the library or by Starlight, per the paragraph above.
 *
 * Run after `npm run build`. Exits non-zero listing every unresolved reference and where it is used.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS_BASE_PATH as BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(siteDir, 'dist');
const manifestPath = join(siteDir, 'public', 'dist', 'custom-elements.json');

/**
 * Properties registered at runtime rather than declared in CSS, so no stylesheet defines them.
 *
 * `--cs-length-resolver` is `CSS.registerProperty`'d by `cs-page` to convert a non-pixel
 * `mobile-breakpoint` (page.ts:36-44). It is written and read entirely from script.
 */
const RUNTIME_REGISTERED = new Set(['--cs-length-resolver']);

function walk(dir) {
  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...walk(path));
    } else if (['.css', '.html'].includes(extname(entry.name))) {
      out.push(path);
    }
  }

  return out;
}

const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * A page with its displayed source removed.
 *
 * Load-bearing in both directions. `native.md` documents `<link rel="stylesheet"
 * href="/dist/styles/themes/default.css">` as a snippet; read literally, that made the whole reference
 * theme — and every hue in `palettes/default.css` — look reachable, which silently masked the dead-hue
 * bug this check exists to find. Example source is prose about CSS, not CSS.
 */
const withoutDisplayedSource = (html) => html.replace(/<pre\b[\s\S]*?<\/pre>/gi, '').replace(/<!--[\s\S]*?-->/g, '');

/**
 * The CSS a browser would actually apply from one file.
 *
 * For a stylesheet that is the whole file. For a page it is the `<style>` blocks and the inline `style`
 * attributes, with `<pre>` removed first so highlighted source does not read as applied CSS.
 */
function applicableCss(path) {
  const source = readFileSync(path, 'utf-8');

  if (extname(path) === '.css') {
    return stripCssComments(source);
  }

  const html = withoutDisplayedSource(source);
  const blocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  const inline = [...html.matchAll(/\sstyle="([^"]*)"/gi)].map((match) => match[1].replace(/&quot;/g, '"'));

  return stripCssComments([...blocks, ...inline].join('\n'));
}

/** Every `--name:` declaration, which is what defines a custom property. */
function definitionsIn(css) {
  return [...css.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]);
}

/**
 * Every custom property referenced by a bare `var()` — no fallback.
 *
 * Hand-scanned rather than regexed because `var()` nests: `var(--a, var(--b))` gives `--a` a fallback
 * and leaves `--b` bare, and a regex cannot tell the difference between that comma and the one inside a
 * nested call.
 */
function bareReferencesIn(css) {
  const found = [];
  const pattern = /var\(\s*(--[\w-]+)/g;
  let match;

  while ((match = pattern.exec(css)) !== null) {
    let depth = 1;
    let index = pattern.lastIndex;
    let hasFallback = false;

    while (index < css.length && depth > 0) {
      const char = css[index];

      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      } else if (char === ',' && depth === 1) {
        hasFallback = true;
        break;
      }

      index += 1;
    }

    if (!hasFallback) {
      found.push(match[1]);
    }
  }

  return found;
}

/** The properties components define inside their own shadow roots, from the manifest. */
function manifestProperties() {
  if (!existsSync(manifestPath)) {
    throw new Error(`custom-elements.json not found at ${manifestPath} — run the library build first.`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

  return (manifest.modules ?? []).flatMap((module) =>
    (module.declarations ?? []).flatMap((declaration) =>
      (declaration.cssProperties ?? []).map((property) => property.name),
    ),
  );
}

if (!existsSync(distDir)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/**
 * The stylesheets one page loads, followed transitively through `@import`.
 *
 * Emphatically **not** every `.css` under `dist/`, and emphatically **per page**. `link-library.js` copies
 * the library's whole build into `public/dist`, so `color/palettes/default.css` ships on the site and
 * defines all of `indigo` — while `cornerstone.css` imports only `themes/cru.css`, which defines none of
 * it. And `/examples/themes/showcase` legitimately links that default palette, so treating definitions as
 * one global pool lets its hues leak to the other 118 pages. Either mistake waves through the exact bug
 * this exists to catch, so each page is resolved against its own cascade.
 */
function reachableFrom(html, cache) {
  const queue = [];

  for (const [, href] of withoutDisplayedSource(html).matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/gi)) {
    if (href.startsWith('/')) {
      // The site is served under a base path, so an href carries it and `dist/` does not. Joining the two
      // as-is resolves to `dist/<base>/dist/...`, which exists nowhere: every page then has no reachable
      // stylesheet, every page is skipped, and this check reports success having read nothing. It did
      // exactly that when the base was introduced.
      const withoutBase = BASE_PATH && href.startsWith(`${BASE_PATH}/`) ? href.slice(BASE_PATH.length) : href;
      queue.push(join(distDir, withoutBase));
    }
  }

  const seen = new Set();

  while (queue.length > 0) {
    const path = queue.shift();

    if (seen.has(path) || !existsSync(path)) {
      continue;
    }

    seen.add(path);

    if (!cache.has(path)) {
      cache.set(path, stripCssComments(readFileSync(path, 'utf-8')));
    }

    for (const [, spec] of cache.get(path).matchAll(/@import\s+url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
      queue.push(spec.startsWith('/') ? join(distDir, spec) : join(dirname(path), spec));
    }
  }

  return seen;
}

/**
 * The site's own stylesheets, read from source.
 *
 * Vite bundles them into `_astro/` alongside Starlight's, where the two can no longer be told apart — so
 * their references are attributed here instead, judged against the cascade every page shares.
 */
const ownStylesheets = readdirSync(join(siteDir, 'src', 'styles'), { withFileTypes: true })
  .filter((entry) => entry.isFile() && extname(entry.name) === '.css')
  .map((entry) => join(siteDir, 'src', 'styles', entry.name));

/**
 * Pages this site authors.
 *
 * `dist/dist/**` is the library's copied build and `dist/assets/**` are standalone example documents with
 * their own cascade; neither is a page of this site.
 */
const pages = walk(distDir).filter((path) => {
  const rel = relative(distDir, path);

  return extname(path) === '.html' && !rel.startsWith('dist/') && !rel.startsWith('assets/');
});

/**
 * Draft pages, checked from source because they are checked nowhere else.
 *
 * Starlight drops a `draft: true` page from the production build, so it never reaches `dist/` and every
 * check that reads built output stops looking at it. A defect can then sit in a draft indefinitely and be
 * inherited by whoever publishes it — which is exactly what happened to `popup.md`, whose dead
 * `<cs-combobox>` went unnoticed for the whole time the page was gated.
 *
 * A draft cannot be resolved against its own cascade, since it has no built page to read `<link>` tags
 * from. It is resolved against the union of what every real page loads instead, which is correct because a
 * draft will load the same stylesheets the day it ships.
 */
function draftSources() {
  const dir = join(siteDir, 'src', 'content', 'docs');
  const out = [];

  const walkMd = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);

      if (entry.isDirectory()) {
        walkMd(path);
      } else if (extname(entry.name) === '.md') {
        const text = readFileSync(path, 'utf-8');
        const frontMatter = /^---\n([\s\S]*?)\n---/.exec(text);

        // The whole block, not a fixed prefix: a long `description` can push `draft` past any cutoff.
        if (frontMatter && /^draft: *true/m.test(frontMatter[1])) {
          out.push([path, stripCssComments(cssFromMarkdown(text))]);
        }
      }
    }
  };

  walkMd(dir);

  return out;
}

/** The applied CSS in a markdown source: its `<style>` blocks and inline `style` attributes. */
function cssFromMarkdown(text) {
  const body = withoutDisplayedSource(text.replace(/```[\s\S]*?```/g, ''));
  const blocks = [...body.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((match) => match[1]);
  const inline = [...body.matchAll(/\sstyle="([^"]*)"/gi)].map((match) => match[1]);

  return [...blocks, ...inline].join('\n');
}

const baseline = new Set([...RUNTIME_REGISTERED, ...manifestProperties()]);
const referenced = new Map();
const cssCache = new Map();
const checked = new Set();
const everyDefinition = new Set(baseline);
let pageCount = 0;
let draftCount = 0;

for (const path of pages) {
  const html = readFileSync(path, 'utf-8');
  const reachable = reachableFrom(html, cssCache);

  /*
   * A page that links no stylesheet at all is not a page this site styles.
   *
   * Astro's `redirect` entries build a stub with a `<title>`, a refresh `<meta>` and one link — no CSS.
   * The loop below treats `src/styles/*.css` as applying to every page, which is true of every real one,
   * so on those two stubs every token `docs.css` takes from the theme read as undefined: 61 findings, none
   * of them a defect, on pages that render no styling. Judged, they were the whole output of this check.
   */
  if (reachable.size === 0) {
    continue;
  }

  const own = applicableCss(path);
  const defined = new Set(baseline);

  for (const sheet of reachable) {
    for (const name of definitionsIn(cssCache.get(sheet))) {
      defined.add(name);
      everyDefinition.add(name);
    }
  }

  for (const name of definitionsIn(own)) {
    defined.add(name);
  }

  // The site's own stylesheets reach every page, so they both define and reference on every page.
  const sources = [[path, own]];

  for (const sheet of ownStylesheets) {
    if (!cssCache.has(sheet)) {
      cssCache.set(sheet, stripCssComments(readFileSync(sheet, 'utf-8')));
    }

    for (const name of definitionsIn(cssCache.get(sheet))) {
      defined.add(name);
    }

    sources.push([sheet, cssCache.get(sheet)]);
  }

  pageCount += 1;

  for (const [origin, css] of sources) {
    for (const name of bareReferencesIn(css)) {
      // Keyed by origin so a stylesheet shared by every page counts once, not 115 times.
      checked.add(`${origin}\u0000${name}`);

      if (defined.has(name)) {
        continue;
      }

      if (!referenced.has(name)) {
        referenced.set(name, new Set());
      }

      referenced.get(name).add(relative(siteDir, origin));
    }
  }
}

// Drafts, resolved against everything the real pages load.
for (const [path, css] of draftSources()) {
  draftCount += 1;

  for (const name of definitionsIn(css)) {
    everyDefinition.add(name);
  }

  for (const name of bareReferencesIn(css)) {
    checked.add(`${path}\u0000${name}`);

    if (everyDefinition.has(name)) {
      continue;
    }

    if (!referenced.has(name)) {
      referenced.set(name, new Set());
    }

    referenced.get(name).add(relative(siteDir, path));
  }
}

if (referenced.size === 0) {
  console.log(
    `\n${pageCount} pages and ${draftCount} draft${draftCount === 1 ? '' : 's'} checked, ` +
      `${checked.size} distinct custom-property references, all resolve.\n`,
  );
  process.exit(0);
}

console.error(
  `\n${referenced.size} custom ${referenced.size === 1 ? 'property' : 'properties'} referenced but never defined:\n`,
);

for (const [name, paths] of [...referenced].sort()) {
  const list = [...paths].sort();
  const shown = list.slice(0, 6);

  console.error(`  ${name}`);

  for (const path of shown) {
    console.error(`      ${path}`);
  }

  if (list.length > shown.length) {
    console.error(`      … and ${list.length - shown.length} more`);
  }

  console.error('');
}

console.error('Each of these drops its whole declaration silently. Define it, or give the var() a fallback.\n');
process.exit(1);
