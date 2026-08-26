/**
 * Guards the one layout assumption base-path resolution makes.
 *
 * `src/utilities/base-path.ts` derives the package root as `new URL('../', import.meta.url)`, which is only
 * correct while the module holding that code sits exactly one level below the package root. Both builds
 * satisfy that because `scripts/build.js` sets `chunkNames: 'chunks/[name].[hash]'`, so every emitted chunk
 * lands in `chunks/`. That is a build-config detail rather than a contract, and if it ever changes the
 * failure is a silent 404 per component — the exact class of bug this resolution replaced.
 *
 * So: find the chunk that actually contains the resolution code, in each build, and assert its depth.
 *
 * Usage:
 *   node scripts/check-base-path.js
 *
 * Exits non-zero if either build's layout would break resolution.
 */
import { readFileSync } from 'node:fs';
import { dirname, relative, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { globbySync } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// The marker is the resolution expression itself, so this cannot drift from what it guards.
const MARKER = 'new URL("../", import.meta.url)';

const errors = [];

for (const build of ['bundled', 'unbundled']) {
  const buildRoot = `${root}/dist/${build}`;
  const files = globbySync(`${buildRoot}/**/*.js`);

  if (files.length === 0) {
    errors.push(`dist/${build}/ has no JS files — run \`npm run build\` first.`);
    continue;
  }

  const holders = files.filter((file) => readFileSync(file, 'utf-8').includes(MARKER));

  if (holders.length === 0) {
    errors.push(
      `dist/${build}/: no file contains \`${MARKER}\`. Either base-path resolution changed shape, in which ` +
        `case update this check, or it was dropped, in which case components no longer resolve.`,
    );
    continue;
  }

  for (const holder of holders) {
    const depth = relative(buildRoot, holder).split(sep).length - 1;
    if (depth !== 1) {
      errors.push(
        `dist/${build}/${relative(buildRoot, holder)} is ${depth} level(s) below the package root, not 1. ` +
          `\`new URL('../', import.meta.url)\` therefore resolves to the wrong place and every autoloaded ` +
          `component will 404. Check \`chunkNames\` in scripts/build.js.`,
      );
    }
  }

  console.log(`✅ ${build}: resolution code sits 1 level below the root, in ${holders.length} file(s)`);
}

if (errors.length > 0) {
  console.error(`\nFound ${errors.length} base-path layout problem(s):`);
  for (const error of errors) {
    console.error(`  ✗ ${error}`);
  }
  process.exit(1);
}

console.log('\nPASSED: base-path resolution can find the package root in both builds.');
