import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { selectTestFiles } from './test-selection.js';

/** `count` file names that sort in a known order: `src/a00.test.ts`, `src/a01.test.ts`, … */
const names = (count) => Array.from({ length: count }, (_, i) => `src/a${String(i).padStart(2, '0')}.test.ts`);

/** Every shard of `total`, as an array of file lists. */
const shards = (total, input) =>
  Array.from({ length: total }, (_, i) => selectTestFiles({ ...input, shard: `${i + 1}/${total}` }));

const load = (files, weights) => files.reduce((sum, file) => sum + (weights[file] ?? 1), 0);

describe('selectTestFiles', () => {
  it('returns every file, sorted, when no shard is asked for', () => {
    assert.deepEqual(selectTestFiles({ all: ['src/b.test.ts', 'src/a.test.ts'] }), ['src/a.test.ts', 'src/b.test.ts']);
  });

  it('puts every file in exactly one shard', () => {
    const all = names(23);
    const weights = Object.fromEntries(all.map((file, i) => [file, (i * 7) % 11]));
    const dealt = shards(6, { all, weights }).flat();

    assert.deepEqual([...dealt].sort(), all);
  });

  it('keeps the shards within the heaviest file of each other', () => {
    const all = names(40);
    // A long tail, like the real suite: a few files cost fifty times what most do.
    const weights = Object.fromEntries(all.map((file, i) => [file, i < 4 ? 50 + i : 1 + (i % 5)]));
    const loads = shards(6, { all, weights }).map((files) => load(files, weights));

    assert.ok(Math.max(...loads) - Math.min(...loads) <= 53, `loads were ${loads.join(', ')}`);
  });

  it('balances what round robin over the sorted list does not', () => {
    // Heavy files at every fourth position: round robin deals all of them to shard 1 of 4.
    const all = names(16);
    const weights = Object.fromEntries(all.map((file, i) => [file, i % 4 === 0 ? 30 : 1]));
    const loads = shards(4, { all, weights }).map((files) => load(files, weights));

    assert.deepEqual(loads, [33, 33, 33, 33]);
  });

  it('weighs a file missing from the map as 1, and still runs it', () => {
    const all = ['src/known.test.ts', 'src/new-a.test.ts', 'src/new-b.test.ts'];
    const weights = { 'src/known.test.ts': 2 };

    assert.deepEqual(shards(2, { all, weights }), [['src/known.test.ts'], ['src/new-a.test.ts', 'src/new-b.test.ts']]);
  });

  it('deals round robin when there are no weights at all', () => {
    assert.deepEqual(shards(2, { all: names(5) }), [
      ['src/a00.test.ts', 'src/a02.test.ts', 'src/a04.test.ts'],
      ['src/a01.test.ts', 'src/a03.test.ts'],
    ]);
  });

  it('gives the same answer for the same inputs, whatever order the files arrive in', () => {
    const all = names(12);
    const weights = Object.fromEntries(all.map((file, i) => [file, (i * 5) % 7]));

    assert.deepEqual(
      selectTestFiles({ all: [...all].reverse(), weights, shard: '2/3' }),
      selectTestFiles({ all, weights, shard: '2/3' }),
    );
  });

  it('ignores a weight for a file that is not in the suite', () => {
    assert.deepEqual(selectTestFiles({ all: ['src/a.test.ts'], weights: { 'src/gone.test.ts': 99 }, shard: '1/1' }), [
      'src/a.test.ts',
    ]);
  });

  describe('refuses', () => {
    for (const shard of ['0/4', '5/4', '2', 'a/b', '1.5/4', '2/0', '/4', '1/4/2']) {
      it(`a shard written "${shard}"`, () => {
        assert.throws(() => selectTestFiles({ all: names(8), shard }), /WTR_SHARD must look like "2\/6"/);
      });
    }

    it('a selection with no files in it, which would otherwise pass by testing nothing', () => {
      assert.throws(() => selectTestFiles({ all: names(2), shard: '3/3' }), /selected no test files/);
      assert.throws(() => selectTestFiles({ all: [] }), /selected no test files/);
    });
  });
});
