import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeDurations } from './test-durations.js';

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
