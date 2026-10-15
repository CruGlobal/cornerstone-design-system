/**
 * Runs axe on every Inspiration library Screen, as a whole document, against the built site.
 *
 * The Inspiration library promises that every entry is checked for accessibility automatically, with no
 * person reviewing each one. Nothing else can keep that promise for a Screen:
 *
 *   - The component suite runs axe only on its own fixtures, mounted into the test runner's `<body>`. A
 *     Screen is a document, and the rules that judge a document (`html-has-lang`, `document-title`,
 *     `landmark-one-main`, `page-has-heading-one`, `region`) cannot fire on a fragment.
 *   - `check-components` reads Screen source and knows only whether each `cs-*` tag ships. It cannot see
 *     what the page renders.
 *
 * #149 settled the mechanism: a docs-package check, run after `build`, that opens each Screen **state file**
 * as a full page and runs axe on it. #144 puts Screens at `public/assets/examples/inspiration/screens/`, one
 * file per state (`<name>.html`, `<name>.<state>.html`), so every `.html` file there is one axe run.
 *
 * **Why Playwright serves the site rather than a static server.** The site deploys under a base path taken
 * from `homepage` (`build-tools/site-url.js`). This answers every request under that exact address from
 * `dist/`, so a Screen loads at the URL it will have in production and every relative or base-prefixed
 * asset reference resolves the way it will there. A path the build did not produce is a 404, as it would be
 * on Pages. Requests to any other origin go to the network untouched.
 *
 * **Why only Chromium.** axe evaluates the DOM and computed styles, which do not differ by engine in ways
 * axe's rules depend on, and one engine keeps the docs CI job to a single browser download. Engine coverage
 * of component behaviour is the component suite's job.
 *
 * **Readiness.** axe is run only once every `cs-*` element is defined, the loader has removed `cs-cloak`
 * (which holds the page at opacity 0 and would skew `color-contrast`), and every Lit element has finished
 * its update. A Screen that never gets there fails: axe on a half-rendered page is not a result.
 *
 * `--screens <dir>` reads the Screens from another directory, served at the same address. It exists so
 * `check-a11y.test.js` can prove the check fails on a known violation without a broken Screen ever being
 * built into the site.
 *
 * Run after `npm run build`. Exits non-zero listing every violation by file, rule, impact and selector.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { chromium } from 'playwright';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(siteDir, 'dist');

/** Where Screens live, relative to the site root. `public/` is copied to the root of `dist/`. */
const SCREENS_PATH = join('assets', 'examples', 'inspiration', 'screens');

/** WCAG 2.2 A and AA, which is the target `resources/accessibility.md` states for the library. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** How long a Screen gets to define its components and finish rendering. */
const READY_TIMEOUT = 10_000;

const CONTENT_TYPES = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.map': 'application/json',
  '.mjs': 'text/javascript',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const flag = process.argv.indexOf('--screens');
const screensOverride = flag === -1 ? null : process.argv[flag + 1];

if (flag !== -1 && !screensOverride) {
  console.error('\n--screens needs a directory.\n');
  process.exit(1);
}

if (!existsSync(join(distDir, 'index.html'))) {
  console.error(`\nNo built site at ${relative(siteDir, distDir)}/. Run \`npm run build\` first.\n`);
  process.exit(1);
}

const screensDir = screensOverride ? resolve(screensOverride) : join(distDir, SCREENS_PATH);

/**
 * Labels a file the way `check-components` does: the source path from the site root, which for a built
 * Screen is its path under `public/` rather than `dist/`. An override outside the site keeps its full path.
 */
function label(path) {
  if (!screensOverride) {
    return join('public', SCREENS_PATH, relative(screensDir, path));
  }

  const fromSite = relative(siteDir, path);

  return fromSite.startsWith('..') ? path : fromSite;
}

function htmlFiles(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  const out = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...htmlFiles(path));
    } else if (extname(entry.name) === '.html') {
      out.push(path);
    }
  }

  return out.sort();
}

const screens = htmlFiles(screensDir);

if (screens.length === 0) {
  console.log(`\nNo Screens under ${label(screensDir)}/ yet, so there was nothing to run axe on.\n`);
  process.exit(0);
}

/** Answers a request under the site's address from disk, or with a 404 for a path the build did not make. */
function fileFor(url) {
  const path = decodeURIComponent(new URL(url).pathname.slice(new URL(DOCS_URL).pathname.length));
  const screensUrlPath = `/${SCREENS_PATH.split(sep).join('/')}/`;
  const [root, rest] = path.startsWith(screensUrlPath)
    ? [screensDir, path.slice(screensUrlPath.length)]
    : [distDir, path];
  const file = join(root, rest, rest === '' || rest.endsWith('/') ? 'index.html' : '');

  // A `..` that climbs out of the served directory is a 404 here, as it would be on any static host.
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    return null;
  }

  return file;
}

const urlFor = (screen) => `${DOCS_URL}/${SCREENS_PATH.split(sep).join('/')}/${relative(screensDir, screen)}`;

const axeSource = readFileSync(createRequire(import.meta.url).resolve('axe-core'), 'utf-8');
const browser = await chromium.launch();
const failures = new Map();
let violationCount = 0;

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });

  await context.route(
    (url) => url.href.startsWith(`${DOCS_URL}/`),
    (route) => {
      const file = fileFor(route.request().url());

      return file
        ? route.fulfill({
            body: readFileSync(file),
            contentType: CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
          })
        : route.fulfill({ status: 404, body: 'Not found' });
    },
  );

  for (const screen of screens) {
    const page = await context.newPage();
    const problems = [];

    try {
      const response = await page.goto(urlFor(screen), { waitUntil: 'load' });

      if (!response?.ok()) {
        throw new Error(`loading it returned ${response?.status() ?? 'no response'}`);
      }

      await page
        .waitForFunction(
          () =>
            document.querySelectorAll('.cs-cloak').length === 0 &&
            [...document.querySelectorAll('*')].every(
              (el) => !el.localName.startsWith('cs-') || customElements.get(el.localName),
            ),
          undefined,
          { timeout: READY_TIMEOUT },
        )
        .catch(() => {
          throw new Error(
            `its components did not all define within ${READY_TIMEOUT / 1000}s, so axe would judge a half-rendered page`,
          );
        });

      await page.evaluate(() =>
        Promise.all(
          [...document.querySelectorAll('*')]
            .filter((el) => el.localName.startsWith('cs-'))
            .map((el) => /** @type {any} */ (el).updateComplete),
        ),
      );

      await page.addScriptTag({ content: axeSource });

      const violations = await page.evaluate(async (tags) => {
        const results = await /** @type {any} */ (window).axe.run(document, {
          runOnly: { type: 'tag', values: tags },
        });

        return results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          // A target into a shadow root is an array of selectors, one per root crossed.
          targets: violation.nodes.map((node) =>
            node.target.map((part) => (Array.isArray(part) ? part.join(' >>> ') : part)).join(' >>> '),
          ),
        }));
      }, WCAG_TAGS);

      problems.push(...violations);
    } catch (error) {
      problems.push({ id: 'check-a11y', impact: 'error', help: error.message, targets: [] });
    } finally {
      await page.close();
    }

    if (problems.length > 0) {
      failures.set(label(screen), problems);
      violationCount += problems.length;
    }
  }
} finally {
  await browser.close();
}

if (failures.size === 0) {
  console.log(
    `\n${screens.length} Screen state file${screens.length === 1 ? '' : 's'} checked with axe ` +
      `(${WCAG_TAGS.join(', ')}), no violations.\n`,
  );
  process.exit(0);
}

console.error(
  `\n${violationCount} accessibility violation${violationCount === 1 ? '' : 's'} in ${failures.size} of ` +
    `${screens.length} Screen state file${screens.length === 1 ? '' : 's'}:\n`,
);

for (const [path, problems] of failures) {
  console.error(`  ${path}`);

  for (const { id, impact, help, targets } of problems) {
    console.error(`      ${id} (${impact}): ${help}`);

    for (const target of targets) {
      console.error(`          ${target}`);
    }
  }

  console.error('');
}

console.error('Every Inspiration Screen must pass axe against WCAG 2.2 A and AA before it ships.\n');
process.exit(1);
