/**
 * Answers one question about a line of code, a comment, or a whole file: is it upstream's, or the fork's?
 *
 * The fork keeps Web Awesome's full history, and `NOTICE` records the fork point, so the question is
 * decidable rather than a matter of recollection. Anything present at the fork point is upstream's;
 * anything introduced after it is the fork's own work, and the commit that added it is reported.
 *
 * The search runs against the whole fork-point tree, never against a path. Paths moved when the monorepo
 * collapsed to a single package at root, so asking `git show <fork-point>:src/components/...` finds nothing
 * and scores every line as fork work — a false negative that reads exactly like a real answer.
 *
 * Usage:
 *   node scripts/check-provenance.js "some code or comment text" ["more text" ...]
 *   node scripts/check-provenance.js --file src/components/callout/callout.styles.ts
 *
 * `--file` reports every comment in the file, which is what an audit of inherited-versus-added commentary
 * wants. Exits non-zero only on a bad invocation; a FORK verdict is an answer, not a failure.
 */
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = dirname(__dirname);

// The fork point, per NOTICE. Fixed — upstream is severed, so this never advances.
const FORK_POINT = '63f2b66ddc48f0d66574d2e9c2076dbf60fb8fb5';
// Where the component sources lived at the fork point, before the monorepo collapsed to root.
const UPSTREAM_SRC = 'packages/webawesome/src';

// A single-line `//` comment, or one line of a block comment. Captures the prose, not the markers.
const COMMENT_LINE = /^\s*(?:\/\/|\/\*+|\*+\/|\*)\s?(.*?)\s*(?:\*\/)?$/;

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
}

/** True if `needle` appears anywhere in the fork-point tree's component sources. */
function isUpstream(needle) {
  try {
    git(['grep', '-qF', needle, FORK_POINT, '--', UPSTREAM_SRC]);
    return true;
  } catch {
    return false;
  }
}

/** The oldest commit after the fork point that introduced `needle`, or null if it can't be pinned. */
function introducedBy(needle) {
  try {
    const log = git(['log', '--oneline', '--reverse', '-S', needle, `${FORK_POINT}..HEAD`]);
    return log.split('\n').find(Boolean) ?? null;
  } catch {
    return null;
  }
}

function verdict(needle) {
  if (isUpstream(needle)) {
    return { origin: 'UPSTREAM', commit: null };
  }
  return { origin: 'FORK', commit: introducedBy(needle) };
}

/** Every distinct comment line in a file, long enough to be searchable. */
async function commentsIn(path) {
  const text = await readFile(path, 'utf8');
  const seen = new Set();
  for (const line of text.split('\n')) {
    const prose = line.match(COMMENT_LINE)?.[1];
    // Very short fragments match everywhere and tell you nothing.
    if (prose && prose.length >= 12) {
      seen.add(prose);
    }
  }
  return [...seen];
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/check-provenance.js "text" ... | --file <path>');
  process.exit(1);
}

let needles;
if (args[0] === '--file') {
  const path = args[1];
  if (!path) {
    console.error('--file needs a path.');
    process.exit(1);
  }
  needles = await commentsIn(path);
  console.log(`${needles.length} comment line(s) in ${path}\n`);
} else {
  needles = args;
}

const width = Math.min(64, Math.max(...needles.map((n) => n.length)));
let upstream = 0;
let fork = 0;

for (const needle of needles) {
  const { origin, commit } = verdict(needle);
  if (origin === 'UPSTREAM') {
    upstream++;
  } else {
    fork++;
  }
  const label = needle.length > width ? `${needle.slice(0, width - 1)}…` : needle.padEnd(width);
  console.log(`${label}  ${origin}${commit ? `  ${commit}` : ''}`);
}

if (needles.length > 1) {
  console.log(`\n${upstream} upstream, ${fork} added by the fork.`);
}
