/**
 * Fails if the built documentation site references an asset at the domain root.
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
 * Usage:
 *   node scripts/check-asset-paths.js
 *
 * Exits non-zero if any built page requests an asset outside the base.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DOCS_BASE_PATH } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { globbySync } from 'globby';
import { getDocsDir } from './utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);
const builtDir = join(getDocsDir(), 'dist');

if (!DOCS_BASE_PATH) {
  console.log('PASSED: the site is served from a domain root, so a root-absolute asset path is correct.');
  process.exit(0);
}

const pages = globbySync(`${builtDir}/**/*.html`);

if (pages.length === 0) {
  console.error(
    `No built pages under ${relative(root, builtDir)}. Run \`npm run build --workspace cornerstone-docs-site\` first.`,
  );
  process.exit(1);
}

/**
 * A root-absolute reference to something this site serves out of `public/`. Deliberately narrow: `/dist/`
 * and `/scripts/` are ours, whereas `//cdn…`, `https://…` and `/` on its own are not this check's business.
 */
const ROOT_ABSOLUTE = /(?:href|src|poster)\s*=\s*["'](\/(?:dist|scripts|assets|patterns)\/[^"']*)["']/g;

/**
 * Displayed source is not a request. A page that documents `<script src="/dist/cornerstone.loader.js">` in a
 * fenced block renders it as text inside `<pre>`, and flagging that is a false positive — `ssr.md` shows
 * exactly that, in a diff, on purpose. Strip code blocks before scanning.
 */
const stripCodeBlocks = (html) => html.replace(/<pre\b[\s\S]*?<\/pre>/g, '');

const findings = [];

for (const page of pages) {
  const html = stripCodeBlocks(readFileSync(page, 'utf-8'));
  for (const match of html.matchAll(ROOT_ABSOLUTE)) {
    // Anything already under the base is correct; this only wants the ones that skipped it.
    if (match[1].startsWith(`${DOCS_BASE_PATH}/`)) {
      continue;
    }
    findings.push(`${relative(builtDir, page)}  ${match[1]}`);
  }
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

console.log(`PASSED: ${pages.length} built page(s), every asset reference inside \`${DOCS_BASE_PATH}\`.`);
