/**
 * Fails if the built documentation site references an asset at the domain root, or names a local asset the build
 * does not contain.
 *
 * The site is served under a base path — GitHub Pages gives a project site `/<repo>/` — and Astro serves
 * `public/` under that base, not at the root. So `href="/dist/cornerstone.loader.js"` is a 404 in production
 * and works only on a developer's machine at a domain root.
 *
 * The failure is silent in the way that matters: the page still renders, the components still appear
 * (unregistered custom elements render their children), and only the behaviour is missing. Nothing logs a
 * word. `check-tokens.js` will not catch it either, since an unreachable stylesheet contributes no
 * properties to check.
 *
 * This reads the built output rather than the sources, because that is where the question is settled: a
 * source file may legitimately write a bare path and pass it through `asset()`, and only the emitted HTML
 * shows what the browser will actually request.
 *
 * A path inside the base can still name nothing. The QR code page asked for three logos from the Web Awesome fork,
 * one of them a file the `wa-` to `cs-` rename invented and two whose files were removed with upstream's branding.
 * Each was a 404 and an example that drew no image, while this check passed because every path carried the base.
 * So every in-base reference that ends in a file extension must also exist in the build.
 *
 * Usage:
 *   node scripts/check-asset-paths.js
 *
 * Exits non-zero if any built page requests an asset outside the base, or one that was not built.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DOCS_BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { globbySync } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const builtDir = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist');

if (!DOCS_BASE_PATH) {
  console.log('PASSED: the site is served from a domain root, so a root-absolute asset path is correct.');
  process.exit(0);
}

const pages = globbySync(`${builtDir}/**/*.html`);

/**
 * The site's own scripts, which this check could not see. `public/` files are copied verbatim, so no
 * build step substitutes a base into them — and `site-search.js` loaded its index from
 * `/pagefind/pagefind.js`, which 404s under a base path. The failure was worse than a broken link: the
 * `catch` around the import treated a missing index as "no index exists" and told the reader search was
 * only available in a production build, on the production build.
 */
const scripts = globbySync(`${builtDir}/scripts/**/*.js`);

if (pages.length === 0) {
  console.error(`No built pages under ${relative(root, builtDir)}. Run \`npm run build\` first.`);
  process.exit(1);
}

/**
 * Any root-absolute reference the browser will request from this origin — an asset under `public/`, or a
 * link to another page of this site. `//cdn…` and `https://…` belong to someone else and are excluded by
 * requiring a single leading slash.
 *
 * This was once narrowed to `/dist/`, `/scripts/`, `/assets/` and `/patterns/`, on the reasoning that only
 * `public/` directories were "ours". That missed navigation entirely: the subheader, the search dialog and
 * every authored `[link](/usage/#events)` emitted a root-absolute href, and the first deploy 404'd on all
 * of them while this check passed. A link off the base is the same bug as an asset off the base.
 *
 * `image` is `cs-qr-code`'s center image, which the browser fetches like any `src`.
 */
const ROOT_ABSOLUTE = /(?:href|src|poster|image)\s*=\s*["'](\/(?!\/)[^"']*)["']/g;

/** A path that names a file rather than a route: its last segment has an extension. */
const NAMES_A_FILE = /\/[^/]+\.[a-z0-9]+$/i;

/**
 * Navigation that does not go through `href`. The theme dropdown carries its destination in `value=`
 * and assigns `window.location.href` from it — a root-absolute path there 404s exactly like an anchor
 * would, and the attribute-name check above cannot see it. Narrow on purpose: `value` holds all sorts
 * of things, so only a value that looks like one of this site's own routes counts.
 */
const ROOT_ABSOLUTE_VALUE =
  /value\s*=\s*["'](\/(?!\/)(?:components|tokens|utilities|themes|resources|ai|usage|frameworks)[^"']*)["']/g;

/**
 * Displayed source is not a request. A page that documents `<script src="/dist/cornerstone.loader.js">` in a
 * fenced block renders it as text inside `<pre>`, and flagging that is a false positive — `ssr.md` shows
 * exactly that, in a diff, on purpose. Strip code blocks before scanning.
 */
const stripCodeBlocks = (html) => html.replace(/<pre\b[\s\S]*?<\/pre>/g, '');

const findings = [];
const missing = [];

/** A quoted path that looks like one of this site's own routes or asset directories. */
const ROOT_ABSOLUTE_IN_JS =
  /["'`](\/(?!\/)(?:pagefind|dist|assets|scripts|patterns|components|tokens|utilities|themes|resources|ai)[^"'`]*)["'`]/g;

/**
 * Comments are prose, not requests — and these files document the paths they fetch. Stripping them is the
 * same idea as stripping `<pre>` from a page: a path being *described* is not a path being requested.
 */
const stripComments = (js) => js.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

for (const script of scripts) {
  const js = stripComments(readFileSync(script, 'utf-8'));
  for (const match of js.matchAll(ROOT_ABSOLUTE_IN_JS)) {
    if (match[1].startsWith(`${DOCS_BASE_PATH}/`)) {
      continue;
    }
    findings.push(`${relative(builtDir, script)}  ${match[1]}`);
  }
}

for (const page of pages) {
  const html = stripCodeBlocks(readFileSync(page, 'utf-8'));
  for (const match of [...html.matchAll(ROOT_ABSOLUTE), ...html.matchAll(ROOT_ABSOLUTE_VALUE)]) {
    // Anything already under the base is in the right place, but a file it names still has to exist.
    if (match[1].startsWith(`${DOCS_BASE_PATH}/`)) {
      const path = decodeURIComponent(match[1].slice(DOCS_BASE_PATH.length).split(/[?#]/)[0]);
      if (NAMES_A_FILE.test(path) && !existsSync(join(builtDir, path))) {
        missing.push(`${relative(builtDir, page)}  ${match[1]}`);
      }
      continue;
    }
    findings.push(`${relative(builtDir, page)}  ${match[1]}`);
  }
}

if (missing.length > 0) {
  console.error(`Found ${missing.length} reference(s) to a local asset the build does not contain:\n`);
  for (const finding of [...new Set(missing)].slice(0, 25)) {
    console.error(`  ✗ ${finding}`);
  }
  console.error(
    `\nEach is a 404 that still renders a page. Add the file under \`public/\`, or point at one that exists.\n`,
  );
}

if (findings.length > 0) {
  const shown = findings.slice(0, 25);
  console.error(`Found ${findings.length} asset reference(s) outside the base \`${DOCS_BASE_PATH}\`:\n`);
  for (const finding of shown) {
    console.error(`  ✗ ${finding}`);
  }
  if (findings.length > shown.length) {
    console.error(`  … and ${findings.length - shown.length} more`);
  }
  console.error(
    `\nThese resolve on a developer's machine at a domain root and 404 in production, with no error in the\n` +
      `console. Route the path through \`asset()\` from \`build-tools/site-url.js\`.`,
  );
  process.exit(1);
}

if (missing.length > 0) {
  process.exit(1);
}

console.log(
  `PASSED: ${pages.length} built page(s) and ${scripts.length} script(s), every asset and link inside \`${DOCS_BASE_PATH}\`, and every file they name was built.`,
);
