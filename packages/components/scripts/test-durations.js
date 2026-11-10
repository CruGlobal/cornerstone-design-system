/**
 * Records how long each test file takes, for `test-selection.js` to deal CI's shards by.
 *
 * `npm run test:durations` runs the suite with this reporter added, and the reporter rewrites
 * `test-durations.json` when the run ends. A file's number is the wall-clock seconds one browser spends on
 * it, from the page opening to the session finishing, averaged over the engines that ran it. Summing each
 * test's own duration would miss the page load and the `before` hooks, which is most of a small file's cost.
 *
 * The numbers are relative. A developer machine and a CI runner disagree about how many seconds a file
 * takes and agree about which files are heavy, and the deal only needs the second.
 *
 * One thing the numbers carry that is not the file's own cost: an engine's first files also wait for that
 * browser to launch, and so do the files that start after a browser had to be launched again.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, sep } from 'node:path';
import { SESSION_STATUS } from '@web/test-runner';

/**
 * Seconds per file, averaged across the sessions that ran it, laid over what was known before.
 *
 * Keeping `previous` means a run of one group refreshes that group's files and leaves the rest alone.
 *
 * @param {{ file: string, ms: number }[]} samples One per browser session.
 * @param {Record<string, number>} [previous] The map as it stood.
 * @returns {Record<string, number>} Sorted by file, to one decimal place.
 */
export function mergeDurations(samples, previous = {}) {
  const byFile = new Map();
  for (const { file, ms } of samples) {
    byFile.set(file, [...(byFile.get(file) ?? []), ms]);
  }

  const merged = { ...previous };
  for (const [file, times] of byFile) {
    const meanSeconds = times.reduce((sum, ms) => sum + ms, 0) / times.length / 1000;
    merged[file] = Math.round(meanSeconds * 10) / 10;
  }

  return Object.fromEntries(Object.entries(merged).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

/**
 * A web-test-runner reporter that writes the measured durations to `path` after each run.
 *
 * @param {object} options
 * @param {string} options.path Where `test-durations.json` lives.
 * @param {(message: string) => void} [options.warn] Told when a run's numbers should not be trusted.
 */
export function durationsReporter({ path, warn = (message) => console.warn(message) }) {
  // `console.warn` is looked up when the warning is made, not when the config loads: the runner swaps
  // `console` for one that draws above its progress bar, and a line written past it is erased on redraw.
  const started = new Map();
  const samples = [];
  let rootDir = '';
  /** The path `test-durations.json` keys a test file by. */
  const key = (testFile) => relative(rootDir, testFile).split(sep).join('/');
  const isRunning = (session) =>
    session.status !== SESSION_STATUS.SCHEDULED && session.status !== SESSION_STATUS.FINISHED;

  return {
    start({ sessions, config }) {
      rootDir = config.rootDir;
      // The runner starts its first batch of sessions before it starts the reporters, so those pages are
      // already opening and their status change has been missed. Their clock starts now, or their files
      // would be timed without the page load every other file is charged for.
      for (const session of sessions.all()) {
        if (isRunning(session)) {
          started.set(session.id, Date.now());
        }
      }

      sessions.on('session-status-updated', (session) => {
        if (isRunning(session) && !started.has(session.id)) {
          started.set(session.id, Date.now());
        }
        // A session that failed still took its time, and a shard has to budget for it either way.
        if (session.status === SESSION_STATUS.FINISHED && started.has(session.id)) {
          samples.push({ file: key(session.testFile), ms: Date.now() - started.get(session.id) });
          started.delete(session.id);
        }
      });
    },

    onTestRunFinished({ sessions = [] } = {}) {
      // A timeout or a browser that would not start inflates a file's number. The time is still written,
      // since a shard has to budget for a file that fails, but it is not one to commit.
      const failed = [
        ...new Set(sessions.filter((session) => !session.passed).map((session) => key(session.testFile))),
      ];
      if (failed.length > 0) {
        warn(
          `test-durations: ${failed.length} file(s) did not pass, so their timings may be inflated. ` +
            `Run them again before committing ${path}:\n${failed.map((file) => `  ${file}`).join('\n')}`,
        );
      }

      const previous = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
      writeFileSync(path, JSON.stringify(mergeDurations(samples, previous), null, 2) + '\n');
      samples.length = 0;
    },
  };
}
