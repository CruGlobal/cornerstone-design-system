import { readFileSync } from 'fs';
import * as os from 'os';
import * as process from 'process';
import { litSsrPlugin } from '@lit-labs/testing/web-test-runner-ssr-plugin.js';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { globbySync } from 'globby';
import { getAllComponents } from './scripts/shared.js';

// Get a list of all Cornerstone component imports for the test runner
const metadata = JSON.parse(readFileSync('./dist/unbundled/custom-elements.json'), 'utf8');
const serverComponents = [];
const componentImports = [];
getAllComponents(metadata).forEach((component) => {
  if (!component.tagName) {
    return;
  }

  const name = component.tagName.replace(/^cs-/, '');

  serverComponents.push(`/dist/unbundled/components/${name}/${name}.js`);
  componentImports.push(`/dist/bundled/components/${name}/${name}.js`);
});

// Setting `concurrency` on the launcher is what makes each browser stable, but it also makes
// `--concurrency` a no-op: @web/test-runner resolves `browser.concurrency ?? config.concurrency`
// (test-runner-core/dist/runner/TestScheduler.js), so the launcher value always wins and the CLI
// flag is never read. `WTR_CONCURRENCY` is therefore the only working override.
//
// The number leaves headroom deliberately. `floor(cores / 3)` per engine across three engines hands
// every core to a test page, with nothing left for the runner, its dev server, the three browser
// parent processes or the OS — and a developer machine is never idle: a running Chrome is ~28
// processes by itself. Pages then get starved past the mocha timeout and fail in cascades that read
// exactly like a mass regression.
//
// Measured on this 12-core machine, both configurations pass on a quiet machine at the same wall
// clock (265s at 4 per engine, 272s at 3), so the headroom is free. What it buys is tolerance: the
// runs that failed 55-60 tests were all competing with something, and every failure was a timeout
// rather than an assertion.
//
// `WTR_CONCURRENCY=1` remains the fallback for a genuinely busy machine.
const cores = os.availableParallelism?.() ?? os.cpus.length;
const override = Number(process.env.WTR_CONCURRENCY);
const RESERVED_CORES = 3; // runner + dev server, three browser parents, and the OS
const ENGINES = 3;
const concurrency =
  Number.isFinite(override) && override > 0 ? override : Math.max(Math.floor((cores - RESERVED_CORES) / ENGINES), 1);

// All three engines run everywhere, CI included. WebKit used to be excluded when `CI === 'true'`, which
// meant CI reported green on a suite that was red on a developer's machine — four of the five inherited
// baseline failures were WebKit-only. Those are now fixed or skipped with a recorded reason, so the
// exclusion has nothing left to hide and the gate means the same thing in both places.
const browsers = [
  playwrightLauncher({ product: 'chromium', concurrency }),
  playwrightLauncher({ product: 'firefox', concurrency }),
  playwrightLauncher({ product: 'webkit', concurrency }),
];

/**
 * One slice of the suite, for CI. `WTR_SHARD=2/4` runs the second quarter of the test files.
 *
 * The suite is ~28 minutes on a GitHub runner and almost all of that is serial: `concurrency` resolves to
 * 1 on a 4-core runner, so each engine works through 76 files one page at a time, and the three engines
 * already run in parallel with each other. Splitting *by engine* would therefore buy almost nothing —
 * the only axis with real parallelism left in it is the file list.
 *
 * Round-robin over the sorted list rather than contiguous chunks: test files vary widely in cost (the
 * `tree` and `select` suites dwarf `spinner`), and contiguous slices put neighbours — which are usually
 * related and similarly expensive — on the same runner.
 *
 * Unset, every file runs, so a developer's `npm test` is unchanged.
 */
const shard = process.env.WTR_SHARD;
const allTests = 'src/**/*.test.ts';
let files = allTests;

if (shard) {
  const [index, total] = shard.split('/').map(Number);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index < 1 || total < 1 || index > total) {
    throw new Error(`WTR_SHARD must look like "2/4"; got "${shard}"`);
  }
  files = globbySync(allTests)
    .sort()
    .filter((_, position) => position % total === index - 1);

  if (files.length === 0) {
    throw new Error(`WTR_SHARD=${shard} selected no test files.`);
  }
}

export default {
  rootDir: '.',
  files, // "default" group — every test file, or this run's shard of them
  concurrentBrowsers: 3,
  nodeResolve: true,
  testFramework: {
    config: {
      // 3000 was tight for the SSR fixtures, which server-render and then hydrate before a test
      // body runs. Raising it costs nothing on a passing test and removes the class of failure
      // where a slow machine reads as a broken component.
      timeout: 5000,
      // Insurance, not the fix — the headroom above is the fix. This absorbs residual starvation on
      // hardware this config cannot see, such as CI or a smaller machine, without hiding a real
      // failure, which fails on the retry too. If a test ever needs more than one retry to pass, that
      // is a bug to chase rather than a number to raise.
      retries: 1,
      // fails the whole test suite on first failure rather than letting the whole test suite run.
      bail: process.env['FAIL_FAST'] === 'true',
    },
  },
  middleware: [
    // When using relative CSS imports, we need to rewrite the paths so the test runner can find them.
    function rewriteCssUrls(context, next) {
      if (context.url.endsWith('.css')) {
        // Okay, this is all fucked up. WTR doesn't seem to like how we use `@import`.
        if (context.url.startsWith('/base.css')) {
          context.url = '/dist/bundled/styles/color/palettes/base.css';
        }

        if (context.url.startsWith('/layers.css')) {
          context.url = '/dist/bundled/styles/layers.css';
        }

        if (context.url.startsWith('/variants')) {
          context.url = '/dist/bundled/styles/color' + context.url;
        }

        if (context.url.startsWith('/color/variants.css')) {
          context.url = '/dist/bundled/styles' + context.url;
        }

        if (context.url.startsWith('/color/palettes')) {
          context.url = '/dist/bundled/styles' + context.url;
        }

        // console.log(context)
        // console.log({ context, before, after: context.url })
      }
      return next();
    },
  ],
  plugins: [
    esbuildPlugin({
      ts: true,
      target: 'es2020',
    }),
    litSsrPlugin(),
  ],
  browsers,
  testRunnerHtml: (testFramework) => `
    <!DOCTYPE html>
    <html lang="en-US">
      <head>
        <link rel="stylesheet" href="/dist/bundled/styles/themes/default.css">
        <script>

          window.process = {env: { NODE_ENV: "production" }}
          const g = globalThis;
          g.litIssuedWarnings ??= new Set();
          g.litIssuedWarnings.add(
            'Lit is in dev mode. Not recommended for production! See https://lit.dev/msg/dev-mode for more information.'
          );
          // This is related to SSR. I'm not sure how to fix this other than using the unbundled "/dist", but for some reason, that breaks singleton patterns when using esbuild plugin with Web Test Runner.
          g.litIssuedWarnings.add(
            'Multiple versions of Lit loaded. Loading multiple versions is not recommended. See https://lit.dev/msg/multiple-versions for more information.'
          )

          window.serverComponents = [
            ${serverComponents.map((str) => `"${str}"`).join(',\n')}
          ]

          window.clientComponents = [
            ${componentImports.map((str) => `"${str}"`).join(',\n')}
          ]

          window.CSR_ONLY = ${process.env['CSR_ONLY'] === 'true'}
          window.SSR_ONLY = ${process.env['SSR_ONLY'] === 'true'}
        </script>

        <script type="module">
          ;(async () => {
            await import("/dist/bundled/utilities/ssr-hydration.js")
            await Promise.allSettled(window.clientComponents.map(str => import(str)));
          })()
        </script>
        <script type="module" src="${testFramework}"></script>
      </head>
      <body>
      </body>
    </html>
  `,
  // Create a named group for every test file to enable running single tests. If a test file is `split-panel.test.ts`
  // then you can run `npm run test -- --group split-panel` to run only that component's tests.
  groups: globbySync('src/**/*.test.ts').map((path) => {
    const groupName = path.match(/^.*\/(?<fileName>.*)\.test\.ts/).groups.fileName;
    return {
      name: groupName,
      files: path,
    };
  }),
};
