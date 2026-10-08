/**
 * Fails unless every package that takes `@astrojs/markdown-remark` as a peer finds the copy this site installs.
 * A second copy breaks the build in a nested checkout and drops text from pages elsewhere; see UIUX-134.
 *
 * Usage:
 *   node scripts/check-markdown-remark.js
 */
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import process from 'node:process';
import { docsDir, repoDir } from '@cruglobal/cornerstone-build-tools/workspace.js';

const PACKAGE = '@astrojs/markdown-remark';

const siteDir = docsDir();
const workspaceDir = repoDir();

/** The nearest `node_modules/<name>` at or above `fromDir`, as Node and Vite resolve it, or null. */
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

function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
}

function describeLocation(dir) {
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
    failures.push(`${name} finds ${describeLocation(copy)}`);
  }
}

if (failures.length > 0) {
  console.log(`FAILED: the site uses ${describeLocation(siteCopy)}, but:`);
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
  `PASSED: ${checked} package(s) that take ${PACKAGE} as a peer find the site's copy at ${describeLocation(siteCopy)}.`,
);
