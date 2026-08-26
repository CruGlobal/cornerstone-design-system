import { rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Deletes the Pagefind UI bundles nothing loads.
 *
 * The Pagefind binary emits its own default UI alongside the search index, and Starlight does not use any of it:
 * `Search.astro` imports `@pagefind/default-ui`'s stylesheet into its own bundle and loads only
 * `/pagefind/pagefind.js` at runtime. Verified against a build — of everything under `dist/pagefind/`, only
 * `pagefind.js` is referenced by anything outside that directory.
 *
 * `pagefind-modular-ui.*` is deliberately NOT pruned. It is one of the two candidate routes for replacing
 * Starlight's search without pulling 22KB of CSS into the page, so it stays until that decision is made.
 *
 * Runs as `postbuild`, because the files are build output — the binary re-emits them every time.
 */
const ORPHANED = [
  'pagefind-ui.css',
  'pagefind-ui.js',
  'pagefind-component-ui.css',
  'pagefind-component-ui.js',
  'pagefind-highlight.js',
];

const pagefindDir = join(dirname(dirname(fileURLToPath(import.meta.url))), 'dist', 'pagefind');

let removed = 0;
let bytes = 0;

for (const name of ORPHANED) {
  const path = join(pagefindDir, name);

  try {
    bytes += (await stat(path)).size;
    await rm(path);
    removed += 1;
  } catch (error) {
    // A missing file is the expected state on a second run, or if Pagefind stops emitting it.
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

console.log(`Pruned ${removed} unreferenced Pagefind asset(s), ${(bytes / 1024).toFixed(0)} KB.`);
