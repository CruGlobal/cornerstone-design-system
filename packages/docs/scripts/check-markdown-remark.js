/**
 * Fails unless every package that takes `@astrojs/markdown-remark` as a peer finds the copy this site installs.
 *
 * The config builds its Markdown pipeline with `unified()` from that package. Astro and Starlight each look the
 * package up again from their own folder, as an optional peer, and both live in the workspace's root
 * `node_modules`. So the site's copy has to be installed there too. A dependabot bump (372f1db) moved it under
 * `packages/docs/node_modules`, where neither lookup can see it, and nothing failed. What happens instead depends
 * on the folders above the checkout:
 *
 * - Nothing above it, as in CI: Starlight warns that the processor is not supported and skips its Markdown
 *   transforms. One of them puts back text that `remark-directive` read as a directive, so "3:1" rendered as "3"
 *   followed by an empty `<div>`.
 * - Another checkout above it, as with a worktree in that checkout's `.claude/worktrees/`: the lookup finds the
 *   outer checkout's copy, which loads a second `prismjs`. Prism's plugins attach to the global `Prism`, so
 *   `highlight-code.js` loses its custom-class plugin and the config fails to load with "Cannot read properties
 *   of undefined (reading 'prefix')".
 *
 * Neither failure names its cause, so this runs before every build and every dev server start.
 *
 * Usage:
 *   node scripts/check-markdown-remark.js
 *
 * Exits non-zero if a package that takes it as a peer finds a different copy, or none.
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const PACKAGE = '@astrojs/markdown-remark';

const siteDir = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaceDir = dirname(dirname(siteDir));

/**
 * Finds a package the way Node and Vite do: the nearest `node_modules/<name>` at or above a directory.
 *
 * @param {string} name A package name.
 * @param {string} fromDir The directory the lookup starts in.
 * @returns {string | null} The package's real directory, or null when nothing above `fromDir` has it.
 */
function lookUp(name, fromDir) {
  for (let dir = fromDir; ; dir = dirname(dir)) {
    if (basename(dir) !== 'node_modules') {
      const candidate = join(dir, 'node_modules', name);
      if (existsSync(join(candidate, 'package.json'))) {
        return realpathSync(candidate);
      }
    }
    if (dirname(dir) === dir) {
      return null;
    }
  }
}

/** @param {string} dir A package directory. */
function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
}

/** @param {string | null} dir A package directory, or null for a lookup that found nothing. */
function describe(dir) {
  if (!dir) {
    return 'nothing';
  }
  return dir.startsWith(workspaceDir + sep) ? relative(workspaceDir, dir) : `${dir}, outside this checkout`;
}

const site = readManifest(siteDir);
const range = site.devDependencies?.[PACKAGE] ?? site.dependencies?.[PACKAGE];
const siteCopy = lookUp(PACKAGE, siteDir);

if (!siteCopy) {
  console.log(`FAILED: ${PACKAGE} is not installed. Run \`npm ci\` at the workspace root.`);
  process.exit(1);
}

// The packages to check are read from the site's own manifest rather than listed here: any dependency that
// declares the peer is one that will go looking for it.
const failures = [];
let checked = 0;

for (const name of Object.keys({ ...site.dependencies, ...site.devDependencies })) {
  const dir = name === PACKAGE ? null : lookUp(name, siteDir);
  if (!dir || !readManifest(dir).peerDependencies?.[PACKAGE]) {
    continue;
  }
  checked += 1;
  const copy = lookUp(PACKAGE, dir);
  if (copy !== siteCopy) {
    failures.push(`${name} finds ${describe(copy)}`);
  }
}

if (failures.length > 0) {
  console.log(`FAILED: the site uses ${describe(siteCopy)}, but:`);
  for (const failure of failures) {
    console.log(`  ${failure}`);
  }
  console.log('');
  const lock = JSON.parse(readFileSync(join(workspaceDir, 'package-lock.json'), 'utf8'));
  if (lock.packages?.[`node_modules/${PACKAGE}`]) {
    console.log('package-lock.json already installs it at the workspace root, so this install is out of date.');
    console.log('Run `npm ci` at the workspace root.');
  } else {
    console.log(`package-lock.json has to install ${PACKAGE} at node_modules/${PACKAGE}, not under packages/docs.`);
    console.log(
      `\`npm install -D ${PACKAGE}@${range} -w ${site.name}\` puts it back; keep the lockfile diff to this package.`,
    );
  }
  process.exit(1);
}

console.log(
  `PASSED: ${checked} package(s) that take ${PACKAGE} as a peer find the site's copy at ${describe(siteCopy)}.`,
);
