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

/** A web-test-runner reporter that writes the measured durations to `path` after each run. */
export function durationsReporter({ path }) {
  const started = new Map();
  const samples = [];

  return {
    start({ sessions, config }) {
      sessions.on('session-status-updated', (session) => {
        // The first sessions can be initializing before this listener exists, so a session's clock starts
        // at whichever running status is seen first.
        const running = session.status !== SESSION_STATUS.SCHEDULED && session.status !== SESSION_STATUS.FINISHED;
        if (running && !started.has(session.id)) {
          started.set(session.id, Date.now());
        }
        // A session that failed still took its time, and a shard has to budget for it either way.
        if (session.status === SESSION_STATUS.FINISHED && started.has(session.id)) {
          const file = relative(config.rootDir, session.testFile).split(sep).join('/');
          samples.push({ file, ms: Date.now() - started.get(session.id) });
          started.delete(session.id);
        }
      });
    },

    onTestRunFinished() {
      const previous = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
      writeFileSync(path, JSON.stringify(mergeDurations(samples, previous), null, 2) + '\n');
      samples.length = 0;
    },
  };
}
