/**
 * Copies the library's bundled build into the site's public directory, so pages load
 * `/dist/cornerstone.loader.js` and `/dist/styles/*` exactly as a browser consumer would.
 *
 * This mirrors what the Eleventy site does at scripts/docs.js:143. It is a copy rather than a
 * symlink because Astro's public/ handling does not follow symlinks reliably, and rather than a
 * `file:..` dependency because that symlinks the repo root back into its own subdirectory.
 */
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
// The components package is a sibling in the workspace, not the parent directory.
const bundledDir = join(dirname(siteDir), 'components', 'dist', 'bundled');
const target = join(siteDir, 'public', 'dist');

if (!existsSync(bundledDir)) {
  console.error(
    `Cannot find the library's bundled build at ${bundledDir}. Run \`npm run build --workspace @cruglobal/cornerstone-components\` first.`,
  );
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
cpSync(bundledDir, target, { recursive: true });
