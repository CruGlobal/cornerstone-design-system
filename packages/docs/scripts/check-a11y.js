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
 * **Which rules.** Every rule axe tags WCAG 2.2 A or AA, plus three it files under `best-practice`:
 * `landmark-one-main`, `page-has-heading-one` and `region`. Those three are the reason a Screen is checked as
 * a document at all, and the WCAG tags alone skip them, so a Screen with no `<main>` and no `<h1>` passed.
 * They are named by id rather than by adding the `best-practice` tag, which would bring in dozens of rules
 * nobody has decided a Screen must meet.
 *
 * **One `region` workaround.** axe-core 4.13 cannot recognise a skip link that lives in a shadow root, so it
 * reports `cs-page`'s "Skip to content" link as content outside a landmark on every Screen that uses
 * `cs-page`. `findComposedSkipLinks` sets aside only a reported link that is in-page, lands on an element in
 * the document, and is the first link on the page in flat-tree order, and the report prints each one. The
 * rule stays on and nothing is matched by selector. It comes out when the gap-register entry in
 * `resources/accessibility.md` closes.
 *
 * **Light and dark.** Each state file is run twice, once per mode, in separate browser contexts. The dark
 * run emulates `prefers-color-scheme: dark` **and** puts `cs-dark` on `<html>`, because Cornerstone's
 * themes switch on that class, not on the media query: emulation alone would rerun the light page and call
 * it dark. The class is how a Screen is shown dark on the site too, since `cs-zoomable-frame` copies the
 * page's `cs-dark` onto the framed document.
 *
 * **A pinned scheme is honoured.** Theme CSS applies `.cs-light` and `.cs-dark` on any element, so a class
 * lower in the tree beats the one on `<html>`: a Screen with `cs-light` on `<body>` would render light in the
 * dark run and pass it falsely. A Screen that pins a scheme on `<html>`, `<body>` or the one wrapper `<body>`
 * holds is run in that scheme only, and the report says so. Smaller pinned regions and any
 * `cs-theme-<name>` class are left as the author wrote them.
 *
 * **A state file fails** on any axe violation, on any response of 400 or above under the site's address (a
 * missing stylesheet or script still renders, just wrongly, and axe would judge the wrong page), and on any
 * uncaught page error. Requests count by when they start, and the network has to go quiet before axe runs,
 * so a file the dark switch asks for is checked even if it arrives after axe starts. axe's `incomplete` results are printed as "needs review" and never fail: they are
 * the checks axe could not decide, and only a person can.
 *
 * **Readiness.** axe is run only once every `cs-*` element is defined, the loader has removed `cs-cloak`
 * (which holds the page at opacity 0 and would skew `color-contrast`), and every Lit element has finished
 * its update. A Screen that never gets there fails: axe on a half-rendered page is not a result. **Known
 * limit:** both waits look only at `cs-*` elements in the page's own DOM, not at ones a component renders
 * inside its shadow root, so a nested component can be judged before it defines or mid-update. A
 * component the Screen's own markup uses that never defines does fail, with a message saying so.
 *
 * `--screens <dir>` reads the Screens from another directory, served at the same address. It exists so
 * `check-a11y.test.js` can prove the check fails for each reason without a broken Screen ever being built
 * into the site.
 *
 * Run after `npm run build`. Exits non-zero listing every failure by file, mode, rule, impact and selector.
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
 * Finds a colour scheme the Screen pins for its whole page: `cs-light` or `cs-dark` on `<html>`, on `<body>`,
 * or on the one element `<body>` wraps everything in. The innermost wins, as it does in the cascade. A
 * smaller region (a dark band, `cs-invert`) is part of the design and is left alone.
 */
function findPinnedScheme() {
  const ignored = new Set(['script', 'style', 'template', 'noscript', 'link', 'meta']);
  const wrappers = [...document.body.children].filter((el) => !ignored.has(el.localName));
  const candidates = [document.documentElement, document.body, ...(wrappers.length === 1 ? wrappers : [])];
  let pinned = null;

  for (const el of candidates) {
    const scheme = el.classList.contains('cs-dark') ? 'dark' : el.classList.contains('cs-light') ? 'light' : null;

    if (scheme) {
      pinned = { scheme, by: `<${el.localName} class="${el.className}">` };
    }
  }

  return pinned;
}

/**
 * Finds the `region` results that are a skip link axe misjudged because it sits in a shadow root, as the one
 * `cs-page` renders does. Runs in the page, on the elements axe reported, and returns `{ [index]: href }`.
 *
 * axe-core exempts a skip link from `region`, but decides "skip link" by asking whether the page's first
 * other link follows it in document position. Across a shadow boundary that comparison answers
 * "disconnected", so a skip link in a shadow root is never one, however it behaves. This makes the same
 * judgement in flat-tree order, the order the page renders and tabs in, and exempts a result only when all
 * of these hold:
 *
 *   - the reported element is itself an `<a>` whose `href` is an in-page `#fragment`;
 *   - that fragment names an element in the document, where fragment navigation looks;
 *   - it comes before every other link on the page, counting links in every open shadow root.
 *
 * Anything else axe reported stays a failure, including a wrapper that holds a skip link and more. The
 * report prints each exemption, and the gap register in `resources/accessibility.md` says when this goes.
 */
function findComposedSkipLinks() {
  const elements = /** @type {any} */ (window).__regionElements ?? [];
  const links = [];

  // A host's shadow tree stands in place of its children, and a slot's assigned nodes in place of its
  // fallback, so links come out in the order the page renders them.
  const walk = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }

    if ((node.localName === 'a' || node.localName === 'area') && node.hasAttribute('href')) {
      links.push(node);
    }

    const assigned = node.localName === 'slot' ? node.assignedNodes() : [];
    const children = node.shadowRoot?.childNodes ?? (assigned.length > 0 ? assigned : node.childNodes);

    for (const child of children) {
      walk(child);
    }
  };

  walk(document.documentElement);

  const exempt = {};

  elements.forEach((element, index) => {
    const href = element?.localName === 'a' ? element.getAttribute('href') : null;

    if (!href?.startsWith('#') || href.length < 2) {
      return;
    }

    let id;

    try {
      id = decodeURIComponent(href.slice(1));
    } catch {
      return;
    }

    if (document.getElementById(id) && links[0] === element) {
      exempt[index] = href;
    }
  });

  return exempt;
}

/**
 * Loads one state file in one mode and runs axe on it.
 *
 * Returns what fails it (`problems`: violations, failed requests, page errors), what axe could not decide
 * (`reviews`), the `region` results set aside as shadow-DOM skip links (`exemptions`, see
 * `findComposedSkipLinks`), and the scheme the Screen pins, if any. A pinned Screen is judged only in that
 * scheme, so a run in the other one comes back `skipped`. Every item carries its mode.
 */
async function checkState(context, screen, mode) {
  const page = await context.newPage();
  const problems = [];
  const reviews = [];
  const exemptions = [];
  const loadErrors = [];
  const tracked = new Set();
  const pending = new Set();
  let recording = true;
  let lastRequestAt = Date.now();
  let pinned = null;

  // Requests are tracked by when they **start**, and their responses checked whenever they arrive, so a
  // font, a lazy image or a stylesheet the `cs-dark` switch asks for is checked even if it lands after
  // axe starts. Tracking stops before axe is injected: axe preloads the page's stylesheets itself and
  // resolves their relative `@import`s against the document rather than the sheet, so its requests 404 on
  // every Screen that loads `cornerstone.css`. Those are axe's misses, not the Screen's. The Screen's own
  // navigation is reported by `goto` below.
  page.on('request', (request) => {
    if (recording && request.url().startsWith(`${DOCS_URL}/`) && !request.isNavigationRequest()) {
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
  page.on('requestfailed', (request) => {
    pending.delete(request);

    if (tracked.has(request) && !answered.has(request)) {
      loadErrors.push(`${request.url()} failed: ${request.failure()?.errorText ?? 'no reason given'}`);
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

    pinned = await page.evaluate(findPinnedScheme);

    if (pinned && pinned.scheme !== mode.name) {
      return { problems: [], reviews: [], exemptions: [], pinned, skipped: true };
    }

    await page.evaluate(
      async (className) => {
        if (className) {
          document.documentElement.classList.add(className);
        }

        await Promise.all(
          [...document.querySelectorAll('*')]
            .filter((el) => el.localName.startsWith('cs-'))
            .map((el) => /** @type {any} */ (el).updateComplete),
        );

        // Two frames, so the styles a class change triggers are applied before axe reads them.
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      },
      pinned ? null : mode.className,
    );

    await settle();
    recording = false;
    await page.addScriptTag({ content: axeSource });

    const results = await page.evaluate(
      async ({ tags, rules }) => {
        const { violations, incomplete } = await /** @type {any} */ (window).axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          rules: Object.fromEntries(rules.map((id) => [id, { enabled: true }])),
          elementRef: true,
        });

        // Kept on the page for `findComposedSkipLinks`, which judges the elements themselves.
        /** @type {any} */ (window).__regionElements =
          violations.find((result) => result.id === 'region')?.nodes.map((node) => node.element) ?? [];
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

    const skipLinks = await page.evaluate(findComposedSkipLinks);

    for (const { id, impact, help, nodes } of results.violations) {
      const kept = id === 'region' ? nodes.filter((_, index) => !(index in skipLinks)) : nodes;

      if (kept.length > 0) {
        problems.push({ mode: mode.name, id, impact, help, targets: targetsOf(kept) });
      }

      if (id === 'region') {
        for (const [index, href] of Object.entries(skipLinks)) {
          exemptions.push({ mode: mode.name, target: targetsOf([{ ...nodes[index], message: null }])[0], href });
        }
      }
    }

    for (const { id, help, nodes } of results.incomplete) {
      reviews.push({ mode: mode.name, id, help, targets: targetsOf(nodes) });
    }

    // Anything the Screen started before the cutoff and is still loading gets the rest of the time budget.
    await settle();

    for (const request of pending) {
      loadErrors.push(`${request.url()} never finished loading`);
    }
  } catch (error) {
    problems.push({ mode: mode.name, id: 'check-a11y', impact: 'error', help: error.message, targets: [] });
  } finally {
    await page.close();
  }

  // A missing stylesheet or script still renders a page, just not the one the author wrote.
  for (const message of loadErrors) {
    problems.push({ mode: mode.name, id: 'check-a11y', impact: 'error', help: message, targets: [] });
  }

  return { problems, reviews, exemptions, pinned, skipped: false };
}

const browser = await chromium.launch();
const results = new Map(
  screens.map((screen) => [screen, { problems: [], reviews: [], exemptions: [], pinned: null, runs: 0 }]),
);

try {
  for (const mode of MODES) {
    const context = await browser.newContext({ colorScheme: mode.colorScheme, reducedMotion: 'reduce' });

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
      const { problems, reviews, exemptions, pinned, skipped } = await checkState(context, screen, mode);
      const result = results.get(screen);

      result.problems.push(...problems);
      result.reviews.push(...reviews);
      result.exemptions.push(...exemptions);
      result.pinned ??= pinned;
      result.runs += skipped ? 0 : 1;
    }

    await context.close();
  }
} finally {
  await browser.close();
}

const all = [...results.values()];
const total = (key, mode = null) =>
  all.reduce((sum, result) => sum + result[key].filter((item) => !mode || item.mode === mode).length, 0);
const byMode = (key) => MODES.map(({ name }) => `${total(key, name)} ${name}`).join(', ');
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const problemCount = total('problems');
const reviewCount = total('reviews');
const exemptionCount = total('exemptions');
const runCount = all.reduce((sum, { runs }) => sum + runs, 0);
const pinnedCount = all.filter(({ pinned }) => pinned).length;
const failing = all.filter(({ problems }) => problems.length > 0).length;
const out = problemCount === 0 ? console.log : console.error;

out('');

for (const [screen, { problems, reviews, exemptions, pinned }] of results) {
  if (problems.length === 0 && reviews.length === 0 && exemptions.length === 0 && !pinned) {
    continue;
  }

  out(`  ${label(screen)}`);

  if (pinned) {
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

  for (const { mode, target, href } of exemptions) {
    out(`      [${mode}] region exempted: a shadow-DOM skip link to ${href}, first link on the page`);
    out(`          ${target}`);
  }

  out('');
}

const scope =
  `${plural(screens.length, 'Screen state file')} checked with axe ${axeVersion} in ` +
  `${MODES.map(({ name }) => name).join(' and ')}, ${plural(runCount, 'run')}` +
  `${pinnedCount ? ` (${pinnedCount} pinned to one scheme)` : ''} ` +
  `(${WCAG_TAGS.join(', ')}, plus ${DOCUMENT_RULES.join(', ')})`;
const reviews =
  `${reviewCount} needs review (${byMode('reviews')}), which never fails the check` +
  (exemptionCount
    ? `; ${plural(exemptionCount, 'region result')} exempted as a shadow-DOM skip link (${byMode('exemptions')})`
    : '');

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
