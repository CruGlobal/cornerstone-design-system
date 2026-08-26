/**
 * Guards the claim `build-tools/site-url.js` makes: that the documentation address is written down once.
 *
 * That module derives every *generated* reference from `package.json`'s `homepage`, and the Plop template
 * derives a scaffolded component's `@documentation` tag the same way. But a JSDoc tag in an existing source
 * file is a literal — no module can reach it — so 136 of them went on naming a placeholder host long after
 * `homepage` had moved. They are not inert: `tsc` copies them into every `.d.ts`, the analyzer copies them
 * into the manifest, and the generators copy them into the agent files, which put the stale address in 287
 * shipped files.
 *
 * So the single-source-of-truth claim needs enforcing rather than asserting. This fails if any URL written
 * into `src/` disagrees with what the build derives.
 *
 * The address is not settled — GitHub Pages is still under consideration alongside a Cru-hosted domain — so
 * this also fixes. Change `homepage` in `package.json`, run `--fix`, and every literal follows in one step
 * instead of 143 edits. That is the whole point of having the constant.
 *
 * Usage:
 *   node scripts/check-docs-url.js          # report
 *   node scripts/check-docs-url.js --fix    # re-point every literal at the current homepage
 *
 * Exits non-zero on any disagreement, unless `--fix` resolved them all.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { DOCS_URL } from '@cruglobal/cornerstone-build-tools/site-url.js';
import { globbySync } from 'globby';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

/**
 * Two rules, kept separate because a broad "any URL mentioning cornerstone" match is wrong: it flags
 * third-party links that legitimately contain the word, including references to upstream's issue tracker.
 */
// 1. Every `@documentation` tag names this project's documentation, so it must derive from `homepage`.
const DOCUMENTATION_TAG = /@documentation\s+(\S+)/g;
// 2. No source file may carry a host this project has moved *off*. Derived rather than listed: a host is
//    only dead if it is not the one `homepage` currently names, or the list condemns the live URL the
//    moment the documentation moves to an address that was previously abandoned.
const ABANDONED_HOSTS = ['cruglobal.github.io', 'cornerstone.com', 'ka-f.cornerstone', 'ka-p.cornerstone'];
const DEAD_HOSTS = ABANDONED_HOSTS.filter((host) => !DOCS_URL.includes(host));

const fix = process.argv.includes('--fix');
const errors = [];
const fixes = [];
let checked = 0;

/** Everything that has ever been this project's documentation root, newest first. */
const KNOWN_ROOTS = [
  'https://cruglobal.github.io/cornerstone-components',
  'https://cornerstone.ustech.app',
  'https://cornerstone.com',
];

/**
 * Everything whose text reaches a consumer: component sources, the scaffolding template, the skill markdown
 * the agent files are compiled from, and the README npm renders. `site-url.js` and this file name the dead
 * hosts deliberately, so they are excluded rather than special-cased inside the loop.
 */
const files = globbySync(
  [
    `${root}/src/**/*.ts`,
    // `src/react/**` is generated from these sources, so it is excluded: fixing a JSDoc tag and rebuilding
    // is the repair, and flagging the output as well would report the same defect twice.
    `!${root}/src/react/**`,
    `${root}/scripts/plop/templates/**/*.hbs`,
    `${root}/scripts/agent-skill/**/*.md`,
    `${root}/scripts/design-skill/**/*.md`,
    `${root}/README.md`,
  ],
  {
    ignore: [`${root}/build-tools/site-url.js`, `${root}/scripts/check-docs-url.js`],
  },
);

for (const file of files) {
  const text = readFileSync(file, 'utf-8');
  const lineOf = (index) => text.slice(0, index).split('\n').length;

  for (const match of text.matchAll(DOCUMENTATION_TAG)) {
    const url = match[1];
    // The Plop template writes a Handlebars expression, which is the correct answer there.
    if (url.startsWith('{{')) {
      continue;
    }
    checked += 1;
    if (!url.startsWith(DOCS_URL)) {
      errors.push(`${relative(root, file)}:${lineOf(match.index)}  @documentation ${url}`);
    }
  }

  if (fix) {
    let fixed = text;
    for (const stale of KNOWN_ROOTS) {
      if (stale !== DOCS_URL) {
        fixed = fixed.split(stale).join(DOCS_URL);
      }
    }
    // Bare hosts too, for the prose that links without a scheme.
    for (const stale of KNOWN_ROOTS) {
      const bare = stale.replace('https://', '');
      if (!DOCS_URL.includes(bare)) {
        fixed = fixed.split(bare).join(DOCS_URL.replace('https://', ''));
      }
    }
    if (fixed !== text) {
      writeFileSync(file, fixed);
      fixes.push(relative(root, file));
    }
  }

  for (const host of DEAD_HOSTS) {
    let from = text.indexOf(host);
    while (from !== -1) {
      errors.push(`${relative(root, file)}:${lineOf(from)}  dead host \`${host}\``);
      from = text.indexOf(host, from + host.length);
    }
  }
}

if (fix && fixes.length > 0) {
  console.log(`Re-pointed ${fixes.length} file(s) at ${DOCS_URL}. Re-run without --fix to confirm.`);
  process.exit(0);
}

if (errors.length > 0) {
  console.error(
    `Found ${errors.length} documentation URL(s) that do not derive from \`package.json\`'s homepage ` +
      `(${DOCS_URL}):\n`,
  );
  for (const error of errors) {
    console.error(`  ✗ ${error}`);
  }
  console.error(
    `\nA JSDoc tag cannot import a constant, so these are literals by necessity — but they must agree with\n` +
      `\`build-tools/site-url.js\`, or the address stops being written down once. Re-point them, or if the\n` +
      `documentation has genuinely moved, change \`homepage\` and re-point these to match.`,
  );
  process.exit(1);
}

console.log(`PASSED: ${checked} @documentation tag(s) derive from ${DOCS_URL}, and no dead host appears in src/.`);
