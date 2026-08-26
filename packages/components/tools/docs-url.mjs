#!/usr/bin/env node
/**
 * Re-points the per-component `@documentation` JSDoc links at a documentation host.
 *
 *   node tools/docs-url.mjs --dry
 *   node tools/docs-url.mjs
 *
 * The documentation host is expected to move — any markdown-capable host is a candidate — so this
 * exists to keep that a one-command change rather than 68 edits. Change DOCS_BASE here and in
 * `custom-elements-manifest.js`, then re-run.
 *
 * These literals cannot simply be deleted: the manifest's `documentation` customTag reads the JSDoc tag
 * to set a field on the declaration in `custom-elements.json`, while `referencesTemplate` separately
 * derives IDE references from the tag name. They feed different consumers, so dropping the tags would
 * silently remove the manifest field. Collapsing them into the constant requires the analysis step to
 * derive the field when the tag is absent — build-config work, tracked separately.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');
const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const DOCS_BASE = 'https://cruglobal.github.io/cornerstone-components/components';

// Bases previously used, migrated to DOCS_BASE. Replacing the *base* rather than the whole URL is what
// lets one rule cover both shapes: a JSDoc tag ending in a literal component name, and the base class's
// runtime message ending in a `${this.localName}` expression. Idempotent — DOCS_BASE is not in the list.
const OLD_BASES = ['https://cornerstone.com/docs/components', 'https://webawesome.com/docs/components'];

// src/react is generated output and gitignored; it is rebuilt from these sources, so sweeping it would
// be editing a build artifact that the next build overwrites anyway.
const SKIP = /\/src\/react\//;

async function sources(dir, out = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await sources(full, out);
    } else if (entry.name.endsWith('.ts') && !SKIP.test(full)) {
      out.push(full);
    }
  }
  return out;
}

let changed = 0;
let already = 0;

for (const file of await sources(join(ROOT, 'src'))) {
  const before = readFileSync(file, 'utf8');
  let after = before;
  for (const old of OLD_BASES) {
    after = after.split(old).join(DOCS_BASE);
  }
  if (after !== before) {
    changed++;
    if (!DRY) {
      writeFileSync(file, after);
    }
  } else if (before.includes(DOCS_BASE)) {
    already++;
  }
}

console.log(`${DRY ? 'DRY RUN — nothing written' : 'APPLIED'}`);
console.log(`  base:            ${DOCS_BASE}`);
console.log(`  files ${DRY ? 'to change' : 'changed'}:   ${changed}`);
console.log(`  already correct: ${already}`);
