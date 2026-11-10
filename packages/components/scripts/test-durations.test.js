import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { SESSION_STATUS } from '@web/test-runner';
import { durationsReporter, mergeDurations } from './test-durations.js';

describe('mergeDurations', () => {
  it('averages a file across the engines that ran it, in seconds to one decimal place', () => {
    const samples = [
      { file: 'src/a.test.ts', ms: 1000 },
      { file: 'src/a.test.ts', ms: 2000 },
      { file: 'src/a.test.ts', ms: 3100 },
    ];

    assert.deepEqual(mergeDurations(samples), { 'src/a.test.ts': 2 });
  });

  it('keeps a file this run did not reach, and replaces one it did', () => {
    const previous = { 'src/a.test.ts': 9, 'src/b.test.ts': 4 };

    assert.deepEqual(mergeDurations([{ file: 'src/a.test.ts', ms: 1500 }], previous), {
      'src/a.test.ts': 1.5,
      'src/b.test.ts': 4,
    });
  });

  it('writes the files in sorted order, so a refresh diffs line by line', () => {
    const samples = [
      { file: 'src/b.test.ts', ms: 1000 },
      { file: 'src/a.test.ts', ms: 1000 },
    ];

    assert.deepEqual(Object.keys(mergeDurations(samples, { 'src/c.test.ts': 1 })), [
      'src/a.test.ts',
      'src/b.test.ts',
      'src/c.test.ts',
    ]);
  });

  it('returns the map unchanged when nothing ran', () => {
    assert.deepEqual(mergeDurations([], { 'src/a.test.ts': 3 }), { 'src/a.test.ts': 3 });
  });
});

describe('durationsReporter', () => {
  const rootDir = join(tmpdir(), 'a-project');

  /** The part of web-test-runner's session manager the reporter uses. */
  class FakeSessions extends EventEmitter {
    #sessions = new Map();

    all() {
      return this.#sessions.values();
    }

    /** Moves a session to `status`, announcing it unless the reporter is not listening yet. */
    set(id, file, status, { passed = true, silent = false } = {}) {
      const session = { id, testFile: join(rootDir, file), status, passed };
      this.#sessions.set(id, session);
      if (!silent) {
        this.emit('session-status-updated', session);
      }
      return session;
    }
  }

  /** A reporter writing to a throwaway file, with the clock under the test's control. */
  const setUp = (t) => {
    const dir = mkdtempSync(join(tmpdir(), 'durations-'));
    t.after(() => rmSync(dir, { recursive: true, force: true }));
    t.mock.timers.enable({ apis: ['Date'], now: 0 });

    const path = join(dir, 'test-durations.json');
    const warnings = [];
    const reporter = durationsReporter({ path, warn: (message) => warnings.push(message) });
    return {
      path,
      warnings,
      reporter,
      sessions: new FakeSessions(),
      read: () => JSON.parse(readFileSync(path, 'utf8')),
    };
  };

  it('times a session from its first running status to its finish, keyed by the path under rootDir', (t) => {
    const { reporter, sessions, read } = setUp(t);
    reporter.start({ sessions, config: { rootDir } });

    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING);
    t.mock.timers.tick(1000);
    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.TEST_STARTED);
    t.mock.timers.tick(1500);
    const finished = sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED);
    reporter.onTestRunFinished({ sessions: [finished] });

    assert.deepEqual(read(), { 'src/a.test.ts': 2.5 });
  });

  it('starts the clock for a session that was already running before the reporter started', (t) => {
    const { reporter, sessions, read } = setUp(t);
    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING, { silent: true });
    reporter.start({ sessions, config: { rootDir } });

    t.mock.timers.tick(3000);
    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.TEST_STARTED);
    t.mock.timers.tick(1000);
    const finished = sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED);
    reporter.onTestRunFinished({ sessions: [finished] });

    assert.deepEqual(read(), { 'src/a.test.ts': 4 });
  });

  it('still records a session that failed, and warns that its file needs another run', (t) => {
    const { reporter, sessions, read, warnings } = setUp(t);
    reporter.start({ sessions, config: { rootDir } });

    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING);
    sessions.set('2', 'src/b.test.ts', SESSION_STATUS.INITIALIZING);
    t.mock.timers.tick(2000);
    const passed = sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED);
    const failed = sessions.set('2', 'src/b.test.ts', SESSION_STATUS.FINISHED, { passed: false });
    reporter.onTestRunFinished({ sessions: [passed, failed] });

    assert.deepEqual(read(), { 'src/a.test.ts': 2, 'src/b.test.ts': 2 });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /1 file\(s\) did not pass/);
    assert.match(warnings[0], /b\.test\.ts/);
    assert.doesNotMatch(warnings[0], /a\.test\.ts/);
  });

  it('says nothing when every session passed', (t) => {
    const { reporter, sessions, warnings } = setUp(t);
    reporter.start({ sessions, config: { rootDir } });

    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING);
    reporter.onTestRunFinished({ sessions: [sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED)] });

    assert.deepEqual(warnings, []);
  });

  it('starts a second run from no samples, so a watch-mode rerun does not average in the first', (t) => {
    const { reporter, sessions, read } = setUp(t);
    reporter.start({ sessions, config: { rootDir } });

    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING);
    t.mock.timers.tick(1000);
    reporter.onTestRunFinished({ sessions: [sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED)] });

    sessions.set('1', 'src/a.test.ts', SESSION_STATUS.INITIALIZING);
    t.mock.timers.tick(3000);
    reporter.onTestRunFinished({ sessions: [sessions.set('1', 'src/a.test.ts', SESSION_STATUS.FINISHED)] });

    assert.deepEqual(read(), { 'src/a.test.ts': 3 });
  });
});
