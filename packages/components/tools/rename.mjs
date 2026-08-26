#!/usr/bin/env node
/**
 * Renames the Web Awesome namespace to Cornerstone. **Already applied; retained as documentation.**
 *
 * This was written to be re-run against each upstream release. That purpose is spent: upstream is a hard
 * fork with the remote severed, so there is no incoming code to reapply it to. It is kept because the rule
 * set is the only complete record of what was renamed and why, and because it stays useful if Cornerstone
 * ever vendors namespaced code again. It remains idempotent, so running it changes nothing.
 *
 *   node tools/rename.mjs --dry     report what would change, touch nothing
 *   node tools/rename.mjs           apply, then report any residue
 *
 * Four of the rules below cost a debugging cycle each to find, and each broke at runtime while looking
 * clean in the diff — that is the reasoning worth preserving:
 *
 *   - the script excludes itself, or its own rule literals get rewritten and every rule silently no-ops
 *   - path renames are derived from the tree, never enumerated, or new upstream files are missed
 *   - the prefix pattern must not require a letter after the hyphen, or bare constants like `/^wa-/` are
 *     skipped while the tags around them are renamed, and prefix-stripping code stops stripping
 *   - `wa` must also match uppercase (`'WA-DROPDOWN'`, since tagName is uppercase) and camelCase
 *     (`dataset.waAnimation`, the DOM's form of `data-wa-animation`), or one attribute splits in two
 *
 * Residue reporting is the safety property that matters, and it must mirror the rules exactly: it once
 * reported zero while 131 occurrences remained, because it shared the blind spot of the rule it audited.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

/**
 * Ordered, anchored rules. Order is load-bearing: the longest, most specific pattern must run before
 * any prefix of it, or the general rule eats the specific one's left-hand side.
 *
 * Every pattern is anchored. Web Awesome ships translations containing words that begin with the
 * letters `wa` — `waarde` and `wachtwoord` (nl), `waktu` (id) — plus ordinary English `wait`/`waits`.
 * An unanchored /wa/ would corrupt all of them, so `wa` is only ever matched as `wa-` at a token
 * boundary, as `--wa-`, or as `Wa` immediately followed by an uppercase letter.
 */
const RULES = [
  // Package specifier, before the bare product word it contains.
  ['package specifier', /@awesome\.me\/webawesome/g, '@cruglobal/cornerstone-components'],

  // CSS custom properties, before the bare tag prefix (`--wa-` contains `wa-`).
  ['css custom property', /--wa-/g, '--cs-'],

  // Product word, in each casing it actually appears in.
  ['product word (lower)', /webawesome/g, 'cornerstone'],
  ['product word (Pascal)', /WebAwesome/g, 'Cornerstone'],
  ['product word (spaced)', /Web Awesome/g, 'Cornerstone'],

  // Tag names, CSS classes, cascade layers, event names, data attributes — and bare prefix constants
  // such as the `/^wa-/` that `scripts/make-all.js` uses to derive a directory from a tag name. Those
  // constants are the reason this pattern must NOT require a letter after the hyphen: requiring one
  // leaves the prefix string untouched while every tag around it is renamed, so prefix-stripping code
  // silently stops stripping and the build asks for `components/cs-toast/cs-toast.js`.
  //
  // The left anchor is what keeps this safe. `wa-` is only matched at a token boundary, so `waarde`,
  // `wachtwoord`, `waktu` and `wait` are untouched (no hyphen), and so is `Iowa-based` (letter to the
  // left). The trailing hyphen alone excludes every word form; the lookahead was never what protected
  // them.
  ['tag / class / layer / event / prefix', /(^|[^A-Za-z0-9_])wa-/g, '$1cs-'],

  // Exported class names: `Wa` only when followed by an uppercase letter (`WaButton`, never `Wait`).
  ['class name', /\bWa(?=[A-Z])/g, 'Cs'],

  // Uppercase tag names. `Element.tagName` returns uppercase, so DOM code compares against string
  // literals like `'WA-DROPDOWN'`. Case-sensitive rules miss these entirely, and the result is a
  // comparison that can no longer be true: the branch silently takes its else path.
  ['uppercase tag name', /(^|[^A-Za-z0-9_])WA-/g, '$1CS-'],

  // camelCase identifiers: lowercase `wa` followed by an uppercase letter. This is the `dataset`
  // form of a dashed attribute — the DOM maps `data-wa-animation` to `dataset.waAnimation` — so
  // renaming only the dashed form splits a single attribute in two: the stylesheet matches
  // `[data-cs-animation]` while the script keeps writing `data-wa-animation`, and the rule never
  // applies. Safe because no English word is `wa` followed by a capital, and `\b` anchors the left.
  ['camelCase identifier', /\bwa(?=[A-Z])/g, 'cs'],
];

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'dist-cdn',
  '.cache',
  'coverage',
  '.vercel',
  // Documentation *about* the rename. These name `wa-`, `Web Awesome`, `WA-DROPDOWN` and
  // `dataset.waAnimation` deliberately, as the record of what was renamed and why — so a run would
  // rewrite the only explanation of its own behaviour. `tools` holds nothing but meta-tooling.
  '.scratch',
  'tools',
]);
const TEXT_EXT = /\.(ts|js|mjs|cjs|css|json|md|html|njk|yml|yaml|txt|svg)$/;
// Lock files restate the registry, not our source. Renaming inside them corrupts integrity hashes.
// This script is skipped because its own rule literals are the strings it searches for: left in, a
// run rewrites `wa-` to `cs-` inside its own patterns and silently turns every rule into a no-op,
// destroying the one property that matters — that it can be re-run against the next upstream release.
const SELF = basename(new URL(import.meta.url).pathname);
// LICENSE.md is listed defensively rather than because a rule currently matches it: it is upstream's
// notice, which the MIT grant requires be preserved verbatim, so it must never be a rewrite target.
// CONTEXT.md is the glossary, where "Web Awesome" is a defined term.
const SKIP_FILES = new Set(['package-lock.json', 'npm-shrinkwrap.json', 'yarn.lock', 'LICENSE.md', 'CONTEXT.md', SELF]);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      await walk(join(dir, entry.name), out);
    } else if (TEXT_EXT.test(entry.name) && !SKIP_FILES.has(entry.name)) {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

const files = await walk(ROOT);
const tally = new Map(RULES.map(([label]) => [label, 0]));
let filesChanged = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const [label, pattern, replacement] of RULES) {
    const hits = after.match(pattern);
    if (hits) {
      tally.set(label, tally.get(label) + hits.length);
      after = after.replace(pattern, replacement);
    }
  }
  if (after !== before) {
    filesChanged++;
    if (!DRY) {
      writeFileSync(file, after);
    }
  }
}

/**
 * Files and directories whose own names carry the namespace.
 *
 * Derived from the tree, never enumerated. A hand-written list misses whatever upstream adds between
 * releases, and the resulting breakage does not look like a rename bug: the content rules rewrite the
 * *import* to the new name while the file it points at keeps the old one, so the build dies on a
 * module-not-found for a path that never existed.
 *
 * Only text files the content rules already touch, plus directories, are renamed here. Anything else
 * carrying the namespace is reported for a human decision instead — upstream's logo and avatar images
 * are trademark rather than MIT-licensed source, so the answer for those is deletion, not renaming.
 */
const renameBasename = (name) =>
  name
    .replace(/WebAwesome/g, 'Cornerstone')
    .replace(/webawesome/gi, 'cornerstone')
    .replace(/^wa-/, 'cs-');

async function collectPaths(dir, renames = [], review = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        continue;
      }
      await collectPaths(full, renames, review);
    }
    const renamed = renameBasename(entry.name);
    if (renamed === entry.name) {
      continue;
    }
    if (entry.isDirectory() || TEXT_EXT.test(entry.name)) {
      renames.push([full, join(dir, renamed)]);
    } else {
      review.push(full.slice(ROOT.length + 1));
    }
  }
  return { renames, review };
}

const { renames: pathRenames, review: pathReview } = await collectPaths(ROOT);
// Deepest first, so renaming a file cannot be invalidated by its directory moving out from under it.
pathRenames.sort((a, b) => b[0].split('/').length - a[0].split('/').length);

const pathsDone = [];
for (const [src, dest] of pathRenames) {
  if (!existsSync(src) || existsSync(dest)) {
    continue;
  } // already renamed, or the target is taken
  pathsDone.push(`${src.slice(ROOT.length + 1)}  ->  ${dest.slice(ROOT.length + 1)}`);
  if (!DRY) {
    renameSync(src, dest);
  }
}

console.log(`${DRY ? 'DRY RUN — nothing written' : 'APPLIED'}\n`);
console.log(`files scanned: ${files.length}`);
console.log(`files ${DRY ? 'that would change' : 'changed'}: ${filesChanged}\n`);
for (const [label, n] of tally) {
  console.log(`  ${String(n).padStart(6)}  ${label}`);
}
if (pathsDone.length) {
  console.log(`\npath renames ${DRY ? 'pending' : 'done'}:`);
  for (const line of pathsDone) {
    console.log(`  ${line}`);
  }
}
if (pathReview.length) {
  console.log(`\nnon-source files carrying the namespace — delete rather than rename (upstream branding):`);
  for (const line of pathReview) {
    console.log(`  ${line}`);
  }
}

// Residue: any `wa` identifier the rules did not claim. Expected to be empty after a real run,
// except for upstream's own name in attribution, which must survive for the MIT notice.
if (!DRY) {
  const residue = new Map();
  for (const file of await walk(ROOT)) {
    // Mirrors the rules above, including the relaxed prefix match — a residue check with a narrower
    // pattern than the rules it audits reports zero while the gap it cannot see is still in the tree.
    for (const m of readFileSync(file, 'utf8').matchAll(
      /--wa-[a-z0-9-]*|(?:^|[^A-Za-z0-9_])WA[-_][A-Za-z0-9_-]*|(?:^|[^A-Za-z0-9_])wa-[a-z0-9-]*|\bWa(?=[A-Z])[A-Za-z0-9]*|\bwa(?=[A-Z])[A-Za-z0-9]*|webawesome/g,
    )) {
      const key = m[0].trim();
      if (!residue.has(key)) {
        residue.set(key, []);
      }
      if (residue.get(key).length < 3) {
        residue.get(key).push(file.slice(ROOT.length + 1));
      }
    }
  }
  console.log(`\nresidue: ${residue.size} distinct identifier(s)`);
  for (const [key, where] of [...residue].slice(0, 25)) {
    console.log(`  ${key.padEnd(34)} ${where.join(', ')}`);
  }
  if (residue.size > 25) {
    console.log(`  … and ${residue.size - 25} more`);
  }
}
