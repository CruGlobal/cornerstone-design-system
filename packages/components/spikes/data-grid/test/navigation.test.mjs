/** Unit tests for the pure grid maths in `grid-navigation.ts`, compiled on the fly with esbuild. */
import assert from 'node:assert/strict';
import { dirname, resolve } from 'node:path';
import { before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const here = dirname(fileURLToPath(import.meta.url));
let nav;

before(async () => {
  const result = await esbuild.build({
    entryPoints: [resolve(here, '../grid-navigation.ts')],
    bundle: true,
    format: 'esm',
    write: false,
  });
  nav = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
});

const shape = { rowCount: 3, columnCount: 4 };

describe('getTabTarget', () => {
  it('moves along a row, wraps forward and back, and returns null at both ends', () => {
    assert.deepEqual(nav.getTabTarget({ row: 0, column: 1 }, 1, shape), {
      row: 0,
      column: 2,
    });
    assert.deepEqual(nav.getTabTarget({ row: 0, column: 3 }, 1, shape), {
      row: 1,
      column: 0,
    });
    assert.deepEqual(nav.getTabTarget({ row: 1, column: 0 }, -1, shape), {
      row: 0,
      column: 3,
    });
    assert.equal(nav.getTabTarget({ row: 2, column: 3 }, 1, shape), null);
    assert.equal(nav.getTabTarget({ row: 0, column: 0 }, -1, shape), null);
  });

  it('returns null for an empty grid', () => {
    assert.equal(
      nav.getTabTarget({ row: 0, column: 0 }, 1, {
        rowCount: 0,
        columnCount: 4,
      }),
      null,
    );
  });
});

describe('getArrowTarget', () => {
  const move = (key, extra = {}) =>
    nav.getArrowTarget({ row: 1, column: 1 }, { key, ctrlKey: false, rtl: false, pageSize: 10, ...extra }, shape);

  it('moves one cell, clamps at the edges and does not wrap', () => {
    assert.deepEqual(move('ArrowRight'), { row: 1, column: 2 });
    assert.deepEqual(move('ArrowDown'), { row: 2, column: 1 });
    assert.deepEqual(
      nav.getArrowTarget({ row: 1, column: 3 }, { key: 'ArrowRight', ctrlKey: false, rtl: false, pageSize: 1 }, shape),
      {
        row: 1,
        column: 3,
      },
    );
  });

  it('swaps Left and Right in RTL and keeps Home and End logical', () => {
    assert.deepEqual(move('ArrowRight', { rtl: true }), { row: 1, column: 0 });
    assert.deepEqual(move('ArrowLeft', { rtl: true }), { row: 1, column: 2 });
    assert.deepEqual(move('Home', { rtl: true }), { row: 1, column: 0 });
  });

  it('handles Ctrl+Home, Ctrl+End and paging, and ignores other keys', () => {
    assert.deepEqual(move('Home', { ctrlKey: true }), { row: 0, column: 0 });
    assert.deepEqual(move('End', { ctrlKey: true }), { row: 2, column: 3 });
    assert.deepEqual(move('PageDown'), { row: 2, column: 1 });
    assert.equal(move('a'), null);
  });
});

describe('getVirtualWindow and getRenderedRows', () => {
  it('windows around the scroll position with overscan, clamped to the data', () => {
    const window = nav.getVirtualWindow({
      scrollTop: 4000,
      viewportHeight: 400,
      rowHeight: 40,
      rowCount: 10000,
      overscan: 5,
    });
    assert.deepEqual(window, { start: 95, end: 115 });
    assert.deepEqual(
      nav.getVirtualWindow({
        scrollTop: 0,
        viewportHeight: 400,
        rowHeight: 40,
        rowCount: 0,
        overscan: 5,
      }),
      {
        start: 0,
        end: 0,
      },
    );
  });

  it('always includes the active row, in ascending order, with no duplicate', () => {
    assert.deepEqual(nav.getRenderedRows({ start: 10, end: 13 }, 2, 100), [2, 10, 11, 12]);
    assert.deepEqual(nav.getRenderedRows({ start: 10, end: 13 }, 11, 100), [10, 11, 12]);
    assert.deepEqual(nav.getRenderedRows({ start: 10, end: 13 }, 50, 100), [10, 11, 12, 50]);
    assert.deepEqual(nav.getRenderedRows({ start: 0, end: 0 }, 0, 0), []);
  });
});

describe('filterOptions', () => {
  const options = [
    { value: '2000137', label: 'Staff Support 1' },
    { value: '1200000', label: 'Campus 20001' },
    { value: '3000000', label: 'Global Aid' },
  ];

  it('puts code prefix matches first, then contains matches on code or name', () => {
    assert.deepEqual(
      nav.filterOptions(options, '20001').map((option) => option.value),
      ['2000137', '1200000'],
    );
    assert.deepEqual(
      nav.filterOptions(options, 'aid').map((option) => option.value),
      ['3000000'],
    );
    assert.equal(nav.filterOptions(options, 'zzz').length, 0);
    assert.equal(nav.filterOptions(options, '  ').length, 3);
  });
});

describe('layout helpers', () => {
  const columns = [{ key: 'a', width: 4 }, { key: 'b' }, { key: 'c', width: 6 }];

  it('normalizes a saved layout: drops unknown keys, appends new columns, pinned first, bad widths fall back', () => {
    const layout = nav.normalizeLayout(
      {
        order: ['c', 'x', 'c', 'a'],
        pinned: ['a', 'x'],
        widths: { a: 0, c: 9 },
      },
      columns,
    );
    assert.deepEqual(layout, {
      version: 1,
      order: ['a', 'c', 'b'],
      pinned: ['a'],
      widths: { a: 4, b: 8, c: 9 },
    });
    assert.deepEqual(nav.normalizeLayout(null, columns).order, ['a', 'b', 'c']);
  });

  it('moves a column only inside its own block, and pins or unpins it', () => {
    const base = nav.normalizeLayout({ pinned: ['a'] }, columns);
    assert.deepEqual(nav.moveColumn(base, 'c', -1).order, ['a', 'c', 'b']);
    assert.equal(nav.moveColumn(base, 'b', -1), base, 'cannot cross into the pinned block');
    assert.deepEqual(nav.setPinned(base, 'c', true), {
      ...base,
      order: ['a', 'c', 'b'],
      pinned: ['a', 'c'],
    });
    assert.deepEqual(nav.setPinned(base, 'a', false).pinned, []);
  });
});
