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
 * on Pages, and so is any path on the same host outside the base path, such as `/dist/...` with the base left
 * out. Requests to any other origin go to the network untouched.
 *
 * **Why only Chromium.** axe evaluates the DOM and computed styles, which do not differ by engine in ways
 * axe's rules depend on, and one engine keeps the docs CI job to a single browser download. Engine coverage
 * of component behaviour is the component suite's job.
 *
 * **Which rules.** Every rule axe tags WCAG 2.2 A or AA, plus three it files under `best-practice`:
 * `landmark-one-main`, `page-has-heading-one` and `region`. Those three are the reason a Screen is checked as
 * a document at all, and the WCAG tags alone skip them, so a Screen with no `<main>` and no `<h1>` passed.
 * They are named by id rather than by adding the `best-practice` tag, which would bring in dozens of rules
 * nobody has decided a Screen must meet.
 *
 * **Light and dark.** Each state file is run twice, once per mode, in separate browser contexts. The dark
 * run emulates `prefers-color-scheme: dark` **and** puts `cs-dark` on `<html>`, because Cornerstone's
 * themes switch on that class, not on the media query: emulation alone would rerun the light page and call
 * it dark. The class is also how a team that copies a Screen into a dark app shows it dark.
 *
 * **The Screen as written, not as framed.** The check judges a Screen the way a team gets it when they copy
 * it: its own `<html>` classes stand. `cs-zoomable-frame` with `with-theme-sync` would overwrite a
 * `cs-light`, `cs-dark` or `cs-theme-*` there with the docs page's own, so a Screen framed that way could be
 * shown in a scheme or theme this check never ran. How the site frames Screens is #148's to settle; if it
 * uses theme sync, the sync is what should respect a Screen's own classes, not this check.
 *
 * **A pinned scheme is honoured.** Theme CSS applies `.cs-light` and `.cs-dark` on any element, so a class
 * lower in the tree beats the one on `<html>`: a Screen with `cs-light` on `<body>` would render light in the
 * dark run and pass it falsely. So after the switch the check reads the computed `color-scheme` of every
 * visible line of text: when all of it renders the other scheme because of a `cs-light` or `cs-dark` class,
 * the Screen is run in that scheme only, and the report says so. That holds wherever the class sits and
 * whatever else `<body>` holds. Smaller pinned regions, a page `cs-invert` flips, and any `cs-theme-<name>`
 * class are left as the author wrote them.
 *
 * **A state file fails** on any axe violation, on any response of 400 or above under the site's address (a
 * missing stylesheet or script still renders, just wrongly, and axe would judge the wrong page), and on any
 * uncaught page error. Requests count by when they start, and the network has to go quiet before axe runs,
 * so a file the dark switch asks for is checked even if it arrives after axe starts. axe's `incomplete` results are printed as "needs review" and never fail: they are
 * the checks axe could not decide, and only a person can.
 *
 * **Readiness.** axe is run only once every `cs-*` element is defined, no `cs-cloak` is still holding the
 * page at opacity 0 (which would skew `color-contrast`), and every Lit element has finished its update. The
 * cloak is judged by its effect, not by the class: it hides nothing once its contents are defined, and only
 * the loader removes the class. A Screen that never gets there fails: axe on a half-rendered page is not a result. **Known
 * limit:** both waits look only at `cs-*` elements in the page's own DOM, not at ones a component renders
 * inside its shadow root, so a nested component can be judged before it defines or mid-update. A
 * component the Screen's own markup uses that never defines does fail, with a message saying so.
 *
 * **Known limit: iframes.** axe runs in the Screen's own document only, so a page framed inside a Screen is
 * never audited. And navigations are not tracked, so an `<iframe>` whose `src` is missing is not reported
 * either. The files a framed page loads are tracked, so a missing image or stylesheet inside it still fails
 * the Screen. No Screen frames another page today.
 *
 * `--screens <dir>` reads the Screens from another directory, served at the same address. It exists so
 * `check-a11y.test.js` can prove the check fails for each reason without a broken Screen ever being built
 * into the site.
 *
 * Run after `npm run build`. Exits non-zero listing every failure by file, mode, rule, impact and selector.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOCS_BASE_PATH, DOCS_ORIGIN, DOCS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { globbySync } from 'globby';
import { chromium } from 'playwright';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(siteDir, 'dist');

/** Where Screens live, relative to the site root. `public/` is copied to the root of `dist/`. */
const SCREENS_PATH = join('assets', 'examples', 'inspiration', 'screens');

/** WCAG 2.2 A and AA, which is the target `resources/accessibility.md` states for the library. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** The document rules axe tags `best-practice` and the WCAG tags skip. See the header for why by id. */
const DOCUMENT_RULES = ['landmark-one-main', 'page-has-heading-one', 'region'];

/** Each state file runs once per mode. `dark` is the class Cornerstone's themes switch on. */
const MODES = [
  { name: 'light', colorScheme: /** @type {const} */ ('light'), className: null },
  { name: 'dark', colorScheme: /** @type {const} */ ('dark'), className: 'cs-dark' },
];

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

const isDirectory = (path) => {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
};

/**
 * Every `.html` file under `dir`. `onlyFiles: false` keeps a link that points at nothing, which `globby` would
 * otherwise drop without a word: listed, it fails as a Screen that does not load, rather than going unchecked.
 */
const htmlFiles = (dir) =>
  existsSync(dir)
    ? globbySync('**/*.html', { cwd: dir, absolute: true, onlyFiles: false })
        .filter((path) => !isDirectory(path))
        .sort()
    : [];

const screens = htmlFiles(screensDir);

if (screens.length === 0) {
  console.log(`\nNo Screens under ${label(screensDir)}/ yet, so there was nothing to run axe on.\n`);
  process.exit(0);
}

/**
 * Answers a request to the docs host from disk, or with a 404 for a path the build did not make. A path outside
 * the site's base path is a 404 too: on Pages it belongs to some other site, or to none.
 */
function fileFor(url) {
  const { pathname } = new URL(url);

  if (!pathname.startsWith(`${DOCS_BASE_PATH}/`)) {
    return null;
  }

  let path;

  // A stray `%` (`50%.png`) is not a valid escape, and a static host answers it with a 404, not an error.
  try {
    path = decodeURIComponent(pathname.slice(DOCS_BASE_PATH.length));
  } catch {
    return null;
  }

  const screensUrlPath = `/${SCREENS_PATH.split(sep).join('/')}/`;
  const [root, rest] = path.startsWith(screensUrlPath)
    ? [screensDir, path.slice(screensUrlPath.length)]
    : [distDir, path];
  const file = join(root, rest, rest === '' || rest.endsWith('/') ? 'index.html' : '');

  // A `..` that climbs out of the served directory is a 404 here, as it would be on any static host. The
  // separator keeps a sibling folder whose name starts the same (`dist-old/` beside `dist/`) out too.
  if (!file.startsWith(`${root}${sep}`) || !existsSync(file) || !statSync(file).isFile()) {
    return null;
  }

  return file;
}

const urlFor = (screen) => `${DOCS_URL}/${SCREENS_PATH.split(sep).join('/')}/${relative(screensDir, screen)}`;

const axePath = createRequire(import.meta.url).resolve('axe-core');
const axeSource = readFileSync(axePath, 'utf-8');
const axeVersion = JSON.parse(readFileSync(join(dirname(axePath), 'package.json'), 'utf-8')).version;

/**
 * Turns axe's nodes into report lines: the selector, and axe's own first message for that node when it has
 * one. A target into a shadow root is one selector per root crossed. The message is what makes a contrast
 * finding actionable, since it names the two colours axe resolved.
 */
const targetsOf = (nodes) =>
  nodes.map(({ target, message }) => {
    const selector = target.map((part) => (Array.isArray(part) ? part.join(' >>> ') : part)).join(' >>> ');

    return message ? `${selector}\n              ${message}` : selector;
  });

/** How long the network must stay quiet before a page counts as settled. Playwright's `networkidle` uses the same. */
const QUIET_MS = 500;

/**
 * Finds a colour scheme the Screen pins for its whole page, by what it rendered rather than by its markup's
 * shape: if every visible line of text has the same computed `color-scheme`, that is not the mode being run,
 * and the nearest `cs-light` or `cs-dark` above it sets it, the page is pinned. The themes set
 * `color-scheme` on both classes, so this finds a pin at any depth and with any siblings.
 *
 * Mixed schemes are a smaller pinned region (a dark band) and part of the design, so they are left alone. So is
 * a page `cs-invert` flips: it renders the other scheme in both modes, and both are what a reader sees.
 */
function findPinnedScheme(modeName) {
  const ignored = new Set(['script', 'style', 'template', 'noscript']);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const holders = new Set();

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node.parentElement;

    if (node.textContent.trim() && el && !ignored.has(el.localName) && el.checkVisibility()) {
      holders.add(el);
    }
  }

  const elements = holders.size > 0 ? [...holders] : [document.body];
  const schemes = new Set(elements.map((el) => getComputedStyle(el).colorScheme));
  const [scheme] = schemes;

  if (schemes.size !== 1 || scheme === modeName || (scheme !== 'light' && scheme !== 'dark')) {
    return null;
  }

  const pin = elements[0].closest('.cs-light, .cs-dark');

  return pin?.classList.contains(`cs-${scheme}`) ? { scheme, by: `<${pin.localName} class="${pin.className}">` } : null;
}

/**
 * Says why the page is not ready for axe yet, or returns null when it is. Runs in the page.
 *
 * `cs-cloak` is judged by what it does, not by whether it is still there: only the loader removes the class,
 * and the cloak hides nothing once every element inside it is defined, so a Screen that loads its components
 * another way and keeps the class renders normally. While it does hide the page it holds it at opacity 0,
 * which would skew `color-contrast`.
 */
function whyNotReady() {
  const undefinedEl = [...document.querySelectorAll('*')].find(
    (el) => el.localName.startsWith('cs-') && !customElements.get(el.localName),
  );

  if (undefinedEl) {
    return `its <${undefinedEl.localName}> did not define`;
  }

  const cloaked = [...document.querySelectorAll('.cs-cloak')].find((el) => getComputedStyle(el).opacity === '0');

  return cloaked ? `cs-cloak still hid its <${cloaked.localName}>` : null;
}

/**
 * Loads one state file in one mode and runs axe on it.
 *
 * Returns what fails it (`problems`: violations, failed requests, page errors), what axe could not decide
 * (`reviews`). A pinned Screen is judged only in the scheme it pins, so a run in the other one comes back
 * `skipped`, carrying the pin it found. Every item carries its mode.
 */
async function checkState(context, screen, mode) {
  const page = await context.newPage();
  const problems = [];
  const reviews = [];
  const loadErrors = [];
  const tracked = new Set();
  const pending = new Set();
  let lastRequestAt = Date.now();
  let pinned = null;

  // Requests are tracked by when they **start**, and their responses checked whenever they arrive, so a
  // font, a lazy image or a stylesheet the `cs-dark` switch asks for is checked even if it lands after
  // axe starts. Tracking stays on through axe because axe's CSSOM preload is off: that preload re-fetches
  // the page's stylesheets and resolves their relative `@import`s against the document rather than the
  // sheet, so its requests would 404 on every Screen that loads `cornerstone.css`. The Screen's own
  // navigation is reported by `goto` below.
  page.on('request', (request) => {
    if (new URL(request.url()).origin === DOCS_ORIGIN && !request.isNavigationRequest()) {
      tracked.add(request);
      pending.add(request);
      lastRequestAt = Date.now();
    }
  });
  const answered = new Set();

  page.on('response', (response) => {
    answered.add(response.request());

    if (tracked.has(response.request()) && response.status() >= 400) {
      loadErrors.push(`${response.url()} returned ${response.status()}`);
    }
  });
  page.on('requestfinished', (request) => pending.delete(request));
  // Chromium also aborts a stylesheet that came back 404, so a failure after a response is already reported.
  // A request the page cancels itself (`net::ERR_ABORTED`: a dropped stale fetch, a swapped image `src`) is
  // the page working as written, not a missing file, so it does not fail the Screen.
  page.on('requestfailed', (request) => {
    pending.delete(request);

    const reason = request.failure()?.errorText ?? 'no reason given';

    if (tracked.has(request) && !answered.has(request) && reason !== 'net::ERR_ABORTED') {
      loadErrors.push(`${request.url()} failed: ${reason}`);
    }
  });
  page.on('pageerror', (error) => loadErrors.push(`the page threw: ${error.message}`));

  /** Waits until nothing tracked is in flight and nothing new has started for `QUIET_MS`. */
  async function settle() {
    const deadline = Date.now() + READY_TIMEOUT;

    while (Date.now() < deadline && (pending.size > 0 || Date.now() - lastRequestAt < QUIET_MS)) {
      await page.waitForTimeout(100);
    }
  }

  try {
    const response = await page.goto(urlFor(screen), { waitUntil: 'load' });

    if (!response?.ok()) {
      throw new Error(`loading it returned ${response?.status() ?? 'no response'}`);
    }

    const readyBy = Date.now() + READY_TIMEOUT;
    let notReady = await page.evaluate(whyNotReady);

    while (notReady && Date.now() < readyBy) {
      await page.waitForTimeout(100);
      notReady = await page.evaluate(whyNotReady);
    }

    if (notReady) {
      throw new Error(`${notReady} within ${READY_TIMEOUT / 1000}s, so axe would judge a half-rendered page`);
    }

    await page.evaluate(async (className) => {
      const html = document.documentElement;

      // A scheme the author put on `<html>` is kept, rather than set beside one it would override.
      if (className && !html.classList.contains('cs-light') && !html.classList.contains('cs-dark')) {
        html.classList.add(className);
      }

      await Promise.all(
        [...document.querySelectorAll('*')]
          .filter((el) => el.localName.startsWith('cs-'))
          .map((el) => /** @type {any} */ (el).updateComplete),
      );

      // Two frames, so the styles a class change triggers are applied before axe reads them.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }, mode.className);

    // The quiet window starts over at the switch, so files it asks for get the full `QUIET_MS` to start,
    // however long ago the load's own requests went quiet.
    lastRequestAt = Date.now();
    await settle();

    // Judged on the page axe is about to see, so a pin a late stylesheet sets is found too.
    pinned = await page.evaluate(findPinnedScheme, mode.name);

    if (pinned) {
      return { problems: [], reviews: [], pinned, skipped: true };
    }

    await page.addScriptTag({ content: axeSource });

    const results = await page.evaluate(
      async ({ tags, rules }) => {
        const { violations, incomplete } = await /** @type {any} */ (window).axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          rules: Object.fromEntries(rules.map((id) => [id, { enabled: true }])),
          // No CSSOM preload: none of the rules we run need it, and it re-fetches stylesheets in a way that
          // 404s on relative `@import`s. See the request tracking above.
          preload: { assets: ['media'] },
        });
        const plain = (result) => ({
          id: result.id,
          impact: result.impact,
          help: result.help,
          nodes: result.nodes.map((node) => ({
            target: node.target,
            message: [...node.any, ...node.all, ...node.none].find((check) => check.message)?.message ?? null,
          })),
        });

        return { violations: violations.map(plain), incomplete: incomplete.map(plain) };
      },
      { tags: WCAG_TAGS, rules: DOCUMENT_RULES },
    );

    for (const { id, impact, help, nodes } of results.violations) {
      problems.push({ mode: mode.name, id, impact, help, targets: targetsOf(nodes) });
    }

    for (const { id, help, nodes } of results.incomplete) {
      reviews.push({ mode: mode.name, id, help, targets: targetsOf(nodes) });
    }

    // Anything the Screen started, before or during axe, and is still loading gets the rest of the time budget,
    // so its response is checked. None can hang: every tracked request is answered at once, from disk or 404.
    await settle();
  } catch (error) {
    problems.push({ mode: mode.name, id: 'check-a11y', impact: 'error', help: error.message, targets: [] });
  } finally {
    await page.close();
  }

  // A missing stylesheet or script still renders a page, just not the one the author wrote.
  for (const message of loadErrors) {
    problems.push({ mode: mode.name, id: 'check-a11y', impact: 'error', help: message, targets: [] });
  }

  return { problems, reviews, pinned, skipped: false };
}

const browser = await chromium.launch();
const results = new Map(
  screens.map((screen) => [screen, { problems: [], reviews: [], pinned: null, runs: 0, skips: [] }]),
);

try {
  for (const mode of MODES) {
    const context = await browser.newContext({ colorScheme: mode.colorScheme, reducedMotion: 'reduce' });

    await context.route(
      // The whole docs host, not just the site, so a path that leaves out the base path is a 404 here too
      // rather than a request to the live site that nothing checks.
      (url) => url.origin === DOCS_ORIGIN,
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
      const { problems, reviews, pinned, skipped } = await checkState(context, screen, mode);
      const result = results.get(screen);

      result.problems.push(...problems);
      result.reviews.push(...reviews);
      result.pinned ??= pinned;
      result.runs += skipped ? 0 : 1;

      if (skipped) {
        result.skips.push({ mode: mode.name, pinned });
      }
    }

    await context.close();
  }
} finally {
  await browser.close();
}

// A Screen that looks pinned in every mode was never checked at all, and passing it would hide that.
for (const result of results.values()) {
  if (result.runs === 0) {
    for (const { mode, pinned } of result.skips) {
      result.problems.push({
        mode,
        id: 'check-a11y',
        impact: 'error',
        help: `skipped in every mode, so axe never ran on it: this run rendered ${pinned.scheme}, set by ${pinned.by}`,
        targets: [],
      });
    }
  }
}

const all = [...results.values()];
const total = (key, mode = null) =>
  all.reduce((sum, result) => sum + result[key].filter((item) => !mode || item.mode === mode).length, 0);
const byMode = (key) => MODES.map(({ name }) => `${total(key, name)} ${name}`).join(', ');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const problemCount = total('problems');
const reviewCount = total('reviews');
const runCount = all.reduce((sum, { runs }) => sum + runs, 0);
const pinnedCount = all.filter(({ pinned, runs }) => pinned && runs > 0).length;
const failing = all.filter(({ problems }) => problems.length > 0).length;
const out = problemCount === 0 ? console.log : console.error;

out('');

for (const [screen, { problems, reviews, pinned, runs }] of results) {
  if (problems.length === 0 && reviews.length === 0 && !pinned) {
    continue;
  }

  out(`  ${label(screen)}`);

  if (pinned && runs > 0) {
    out(`      pinned to ${pinned.scheme} by ${pinned.by}, so only the ${pinned.scheme} run was made`);
  }

  for (const { mode, id, impact, help, targets } of problems) {
    out(`      [${mode}] ${id} (${impact}): ${help}`);
    targets.forEach((target) => out(`          ${target}`));
  }

  for (const { mode, id, help, targets } of reviews) {
    out(`      [${mode}] needs review: ${id}: ${help}`);
    targets.forEach((target) => out(`          ${target}`));
  }

  out('');
}

const scope =
  `${plural(screens.length, 'Screen state file')} checked with axe ${axeVersion} in ` +
  `${MODES.map(({ name }) => name).join(' and ')}, ${plural(runCount, 'run')}` +
  `${pinnedCount ? ` (${pinnedCount} pinned to one scheme)` : ''} ` +
  `(${WCAG_TAGS.join(', ')}, plus ${DOCUMENT_RULES.join(', ')})`;
const reviews = `${reviewCount} needs review (${byMode('reviews')}), which never fails the check`;

if (problemCount === 0) {
  out(`${scope}: no violations; ${reviews}.\n`);
  process.exit(0);
}

out(
  `${scope}: ${plural(problemCount, 'failure')} (${byMode('problems')}) in ${failing} of ` +
    `${plural(screens.length, 'file')}; ${reviews}.\n`,
);
out('Every Inspiration Screen must pass axe against WCAG 2.2 A and AA, in light and dark, before it ships.\n');
process.exit(1);
