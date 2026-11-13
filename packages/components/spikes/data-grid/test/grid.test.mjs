/**
 * Browser tests for the cs-data-grid spike: must-haves 1, 2 and 4, the active-row check, and the checks that
 * measure the scroll helpers, lookup cells, layout and theming. 3,000 rows unless a test says otherwise.
 *
 * Run from `packages/components`: `node --test spikes/data-grid/test/`
 */
import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import {
  announcements,
  clearAnnouncements,
  focusCell,
  focused,
  focusedAccessibleNode,
  frames,
  launch,
  openGrid,
} from './helpers.mjs';

const COLUMNS = 10;
let env;

before(async () => {
  env = await launch();
});

after(async () => {
  await env.close();
});

describe('1. Tab moves cell to cell, wraps, and leaves', () => {
  it('Tab into the grid lands on the active cell, then walks a row and wraps to the next', async () => {
    const page = await openGrid(env);
    await page.focus('[data-action="rtl"]');
    await page.keyboard.press('Tab'); // the "Skip past grid" link
    assert.equal((await focused(page)).text, 'Skip past grid');
    await page.keyboard.press('Tab');
    assert.deepEqual([(await focused(page)).row, (await focused(page)).col], ['0', '0']);

    for (let column = 1; column < COLUMNS; column++) {
      await page.keyboard.press('Tab');
      const now = await focused(page);
      assert.deepEqual([now.row, now.col], ['0', String(column)]);
    }
    await page.keyboard.press('Tab');
    const wrapped = await focused(page);
    assert.deepEqual([wrapped.row, wrapped.col], ['1', '0'], 'Tab after the last cell of row 1 wraps to row 2');

    await page.keyboard.press('Shift+Tab');
    const back = await focused(page);
    assert.deepEqual([back.row, back.col], ['0', String(COLUMNS - 1)], 'Shift+Tab wraps back up');

    const tabbable = await page.evaluate(
      () => document.querySelector('cs-data-grid').shadowRoot.querySelectorAll('[role="grid"] [tabindex="0"]').length,
    );
    assert.equal(tabbable, 1, 'exactly one tabindex="0" in the grid (roving focus)');
    assert.deepEqual(page.pageErrors, []);
    await page.close();
  });

  it('Tab on the last cell leaves the grid, even when the last row was not in the virtual window', async () => {
    const page = await openGrid(env);
    await focusCell(page, 2999, 'status');
    // Scroll back to the top, so row 3000 is drawn only because it is the active row.
    await page.evaluate(
      () => (document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="grid"]').scrollTop = 0),
    );
    await frames(page, 3);
    const drawn = await page.evaluate(() =>
      [...document.querySelector('cs-data-grid').shadowRoot.querySelectorAll('[role="row"]')].map((row) =>
        row.getAttribute('aria-rowindex'),
      ),
    );
    assert.ok(drawn.includes('3001') && !drawn.includes('3000'), `row 3000 is drawn alone: ${drawn.slice(-3)}`);
    await focusCell(page, 2999, 'status');
    await page.evaluate(
      () => (document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="grid"]').scrollTop = 0),
    );
    await frames(page, 3);
    await page.keyboard.press('Tab');
    const after = await focused(page);
    assert.equal(after.inGrid, false);
    assert.equal(after.id, 'submit', 'focus moved to the Submit button after the grid');
    await page.close();
  });

  it('Shift+Tab on the first cell leaves the grid backwards', async () => {
    const page = await openGrid(env);
    await focusCell(page, 0, 'line');
    await page.keyboard.press('Shift+Tab');
    const now = await focused(page);
    assert.equal(now.text, 'Skip past grid', 'lands on the skip link, which sits before the grid element');
    await page.keyboard.press('Shift+Tab');
    assert.equal((await focused(page)).inGrid, false);
    await page.close();
  });

  it('Tab while editing commits and moves on; Alt+End and the skip link leave mid-grid', async () => {
    const page = await openGrid(env);
    await focusCell(page, 4, 'amount');
    await page.keyboard.type('25.5');
    await page.keyboard.press('Tab');
    const now = await focused(page);
    assert.deepEqual([now.row, now.col, now.role], ['4', '4', 'gridcell'], 'next cell, in navigation mode');
    const text = await page.evaluate(() =>
      document
        .querySelector('cs-data-grid')
        .shadowRoot.querySelector('[data-row="4"][data-col="3"]')
        .textContent.trim(),
    );
    assert.equal(text, '25.50');

    await page.keyboard.press('Alt+End');
    assert.equal((await focused(page)).id, 'submit');

    await focusCell(page, 100, 'memo');
    await page.evaluate(() =>
      document.querySelector('cs-data-grid').shadowRoot.querySelector('.data-grid__skip').click(),
    );
    assert.equal((await focused(page)).id, 'submit');
    await page.close();
  });
});

describe('2. An open editor survives scrolling thousands of rows', () => {
  it('keeps the same input element, focus, typed text and caret through wheel and scrollbar scrolling', async () => {
    const page = await openGrid(env);
    await focusCell(page, 5, 'memo');
    await page.keyboard.press('F2');
    await page.keyboard.type('half typed note');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await page.evaluate(() => {
      window.editorRef = document.querySelector('cs-data-grid').shadowRoot.querySelector('.cell__editor');
    });

    // Wheel: 40 notches over the grid.
    const box = await page.locator('cs-data-grid').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    for (let notch = 0; notch < 40; notch++) {
      await page.mouse.wheel(0, 2000);
    }
    await frames(page, 4);
    // Scrollbar-style jump to row ~2500, then back to the top.
    const states = [];
    for (const target of [2500 * 43, 0]) {
      await page.evaluate((top) => {
        document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="grid"]').scrollTop = top;
      }, target);
      await frames(page, 4);
      states.push(
        await page.evaluate(() => {
          const root = document.querySelector('cs-data-grid').shadowRoot;
          const editor = root.querySelector('.cell__editor');
          const indices = [...root.querySelectorAll('.data-grid__body [role="row"]')].map((row) =>
            Number(row.getAttribute('aria-rowindex')),
          );
          return {
            same: editor === window.editorRef,
            focused: root.activeElement === window.editorRef,
            value: window.editorRef.value,
            caret: window.editorRef.selectionStart,
            connected: window.editorRef.isConnected,
            first: indices[1] ?? indices[0],
            last: indices.at(-1),
            indices,
          };
        }),
      );
    }

    const far = states[0];
    assert.ok(far.first > 2000, `window moved far away (rows ${far.first}..${far.last})`);
    for (const state of states) {
      assert.equal(state.same, true, 'same input element');
      assert.equal(state.connected, true);
      assert.equal(state.focused, true, 'input still has focus');
      assert.equal(state.value, 'half typed note');
      assert.equal(state.caret, 'half typed note'.length - 2, 'caret position kept');
    }
    // aria-rowindex is logical and contiguous apart from the kept active row (Esther R3).
    const body = far.indices.filter((index) => index !== 7);
    for (let i = 1; i < body.length; i++) {
      assert.equal(body[i], body[i - 1] + 1, 'no gaps or duplicates');
    }
    assert.equal(far.indices[0], 7, 'the editing row (row 6, aria-rowindex 7) is still drawn, first in DOM order');

    await page.keyboard.press('Enter');
    const now = await focused(page);
    assert.deepEqual([now.row, now.col, now.text], ['5', '8', 'half typed note']);
    await page.close();
  });
});

describe('4. Screen readers hear the cell, and edit start and stop, through focus', () => {
  it('names the focused cell and the input, and the announcer stays quiet for moves and edits', async () => {
    const page = await openGrid(env);
    await focusCell(page, 1, 'amount');
    await clearAnnouncements(page);

    const cell = await focusedAccessibleNode(page);
    assert.equal(cell.role, 'gridcell');
    assert.equal(cell.name, '47.00');

    await page.keyboard.press('Enter');
    const input = await focusedAccessibleNode(page);
    assert.equal(input.role, 'textbox');
    assert.equal(input.name, 'Amount 2', 'column header plus row header (Esther F5)');
    assert.equal(input.description, 'Editing. Enter saves, Escape cancels.');

    await page.keyboard.press('Escape');
    const backOnCell = await focusedAccessibleNode(page);
    assert.equal(backOnCell.role, 'gridcell');
    assert.equal(backOnCell.name, '47.00');

    const readonly = await (async () => {
      await page.keyboard.press('ArrowLeft');
      return focusedAccessibleNode(page);
    })();
    assert.equal(readonly.readonly, true, 'read-only cells say so');

    // 50 moves of every kind, plus an edit that commits: no announcements.
    const keys = [
      'ArrowDown',
      'ArrowRight',
      'Tab',
      'ArrowUp',
      'Shift+Tab',
      'PageDown',
      'ArrowLeft',
      'Home',
      'End',
      'PageUp',
    ];
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press(keys[i % keys.length]);
    }
    await focusCell(page, 3, 'memo');
    await page.keyboard.type('ok');
    await page.keyboard.press('Enter');
    await frames(page, 2);
    assert.deepEqual(await announcements(page), [], 'no announce() on moves, edit start, edit stop or commit');
    await page.close();
  });

  it('announces a validation error once, assertively, and keeps focus in the input with Escape as the way out', async () => {
    const page = await openGrid(env);
    await focusCell(page, 2, 'amount');
    await clearAnnouncements(page);
    await page.keyboard.type('abc');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const said = await announcements(page);
    assert.equal(said.length, 1, 'announced once for the same bad value');
    assert.equal(said[0].politeness, 'assertive');
    assert.match(said[0].text, /Row 3, Amount: Enter an amount/);

    const input = await focusedAccessibleNode(page);
    assert.equal(input.role, 'textbox', 'focus stayed in the input');
    assert.equal(input.invalid, 'true');
    assert.match(input.description, /Enter an amount greater than 0/);

    await page.keyboard.press('Escape');
    const cell = await focusedAccessibleNode(page);
    assert.equal(cell.role, 'gridcell');
    assert.equal(cell.name, '84.00', 'Escape restored the original value');
    assert.notEqual(cell.invalid, 'true', 'no longer invalid');
    await page.close();
  });

  it('announces a failed save and a failed or successful submit, and nothing else', async () => {
    const page = await openGrid(env);
    await focusCell(page, 9, 'amount');
    await clearAnnouncements(page);
    await page.keyboard.type('13');
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.announcements.length > 0);
    let said = await announcements(page);
    assert.equal(said[0].politeness, 'assertive');
    assert.match(said[0].text, /^Row 10 not saved: Amount 13 is blocked/);

    // Fix it, then put a donor in a blank row with no amount or designation, and submit.
    await page.keyboard.type('14');
    await page.keyboard.press('Enter');
    await focusCell(page, 2960, 'donor');
    await page.keyboard.type('123456');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    await clearAnnouncements(page);
    await page.click('#submit');
    said = await announcements(page);
    assert.equal(said.length, 1);
    assert.equal(said[0].politeness, 'assertive');
    assert.match(said[0].text, /Batch not submitted\. 1 row has errors\. First: row 2961, Amount\./);
    const now = await focused(page);
    assert.deepEqual([now.row, now.col], ['2960', '3'], 'focus moved to the first error cell');

    await page.keyboard.press('Escape'); // nothing to cancel; still on the cell
    await page.keyboard.type('50');
    await page.keyboard.press('Tab');
    await page.keyboard.type('2000137');
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);
    await clearAnnouncements(page);
    await page.click('#submit');
    said = await announcements(page);
    assert.equal(said.length, 1);
    assert.equal(said[0].politeness, 'polite');
    assert.match(said[0].text, /^Batch submitted\. 2951 rows\./);
    await page.close();
  });
});

describe('The active row stays drawn while scrolled away', () => {
  it('Shift+Tab back into the grid after scrolling 5,000 rows away lands on the same cell', async () => {
    const page = await openGrid(env, '?rows=10000');
    await focusCell(page, 10, 'designation');
    await page.keyboard.press('Alt+End');
    assert.equal((await focused(page)).id, 'submit');
    await page.evaluate(
      () => (document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="grid"]').scrollTop = 5000 * 43),
    );
    await frames(page, 4);
    const drawn = await page.evaluate(() =>
      [...document.querySelector('cs-data-grid').shadowRoot.querySelectorAll('.data-grid__body [role="row"]')].map(
        (row) => row.getAttribute('aria-rowindex'),
      ),
    );
    assert.equal(drawn[0], '12', 'row 11 (aria-rowindex 12) is still drawn');
    assert.ok(Number(drawn[1]) > 4000);

    await page.keyboard.press('Shift+Tab');
    const now = await focused(page);
    assert.deepEqual([now.row, now.col, now.inGrid], ['10', '4', true]);
    await page.close();
  });
});

describe('scrollIntoView with a sticky header, pinned columns and RTL', () => {
  async function measure(page) {
    return page.evaluate(() => {
      const root = document.querySelector('cs-data-grid').shadowRoot;
      const scroller = root.querySelector('[role="grid"]');
      let cell = root.activeElement;
      cell = cell.closest('[data-row]');
      const c = cell.getBoundingClientRect();
      const s = scroller.getBoundingClientRect();
      const head = root.querySelector('.data-grid__head').getBoundingClientRect();
      const pinned = [...root.querySelectorAll('.data-grid__head .cell--pinned')].map((el) =>
        el.getBoundingClientRect(),
      );
      const rtl = getComputedStyle(scroller).direction === 'rtl';
      const pinnedEdge = rtl ? Math.min(...pinned.map((r) => r.left)) : Math.max(...pinned.map((r) => r.right));
      const visibleBottom = s.top + scroller.clientTop + scroller.clientHeight;
      return {
        underHeader: Math.max(0, head.bottom - c.top),
        underPinned: rtl ? Math.max(0, c.right - pinnedEdge) : Math.max(0, pinnedEdge - c.left),
        belowScrollbar: Math.max(0, c.bottom - visibleBottom),
        height: c.height,
        width: c.width,
      };
    });
  }

  for (const strategy of ['cornerstone', 'inset']) {
    for (const dir of ['ltr', 'rtl']) {
      it(`${strategy} helper, ${dir}`, async (t) => {
        const page = await openGrid(env, `?rows=3000&scroll=${strategy}&dir=${dir}`);
        // Up: put row 50 in the middle, then ArrowUp past the top edge.
        await focusCell(page, 50, 'amount');
        for (let i = 0; i < 25; i++) {
          await page.keyboard.press('ArrowUp');
        }
        const up = await measure(page);
        // Down: ArrowDown past the bottom edge.
        for (let i = 0; i < 40; i++) {
          await page.keyboard.press('ArrowDown');
        }
        const down = await measure(page);
        // Inline: go to the far end, then back to the first unpinned column.
        await focusCell(page, 60, 'memo');
        await page.keyboard.press('End');
        await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
        await focusCell(page, 60, 'memo');
        const forward = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        for (let i = 0; i < 6; i++) {
          await page.keyboard.press(forward);
        }
        const start = await measure(page);
        const result = {
          strategy,
          dir,
          up: up.underHeader,
          down: down.belowScrollbar,
          start: start.underPinned,
          cellHeight: up.height,
          cellWidth: start.width,
        };
        t.diagnostic(JSON.stringify(result));
        if (strategy === 'inset') {
          assert.equal(up.underHeader, 0, 'not under the sticky header');
          assert.equal(down.belowScrollbar, 0, 'not behind the horizontal scrollbar');
          assert.equal(start.underPinned, 0, 'not under the pinned columns');
        }
        await page.close();
      });
    }
  }
});

describe('3. Lookup cells filter as you type', () => {
  it('filters, highlights, closes on the first Escape, cancels on the second, commits on Tab', async () => {
    const page = await openGrid(env);
    await focusCell(page, 3, 'designation');
    await page.keyboard.type('staff');
    const open = await page.evaluate(() => {
      const root = document.querySelector('cs-data-grid').shadowRoot;
      const input = root.querySelector('.cell__editor');
      const list = root.querySelector('[role="listbox"]');
      return {
        role: input.getAttribute('role'),
        expanded: input.getAttribute('aria-expanded'),
        active: input.getAttribute('aria-activedescendant'),
        topLayer: list.matches(':popover-open'),
        options: [...list.querySelectorAll('[role="option"]')].map((o) => o.textContent.replace(/\s+/g, ' ').trim()),
      };
    });
    assert.equal(open.role, 'combobox');
    assert.equal(open.expanded, 'true');
    assert.equal(open.active, 'lookup-option-0');
    assert.equal(open.topLayer, true, 'listbox is in the top layer, so the grid cannot clip it');
    assert.ok(open.options.length > 0 && open.options.every((text) => /staff support/i.test(text)), open.options[0]);

    await page.keyboard.press('ArrowDown');
    assert.equal(
      await page.evaluate(() =>
        document
          .querySelector('cs-data-grid')
          .shadowRoot.querySelector('.cell__editor')
          .getAttribute('aria-activedescendant'),
      ),
      'lookup-option-1',
    );
    assert.equal((await focused(page)).tag, 'input', 'DOM focus never left the input');

    await page.keyboard.press('Escape');
    const closed = await focused(page);
    assert.equal(closed.tag, 'input', 'first Escape keeps editing');
    assert.equal(closed.value, 'staff', 'and keeps the typed text');

    await page.keyboard.press('Escape');
    const cancelled = await focused(page);
    assert.equal(cancelled.role, 'gridcell');
    assert.equal(cancelled.text, '2000411 Family Life 1', 'second Escape restored the value');

    await page.keyboard.type('zzzz');
    const empty = await page.evaluate(
      () => document.querySelector('cs-data-grid').shadowRoot.querySelector('.lookup__empty')?.textContent,
    );
    assert.equal(empty, 'No matches');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');

    await page.keyboard.type('20001');
    await page.keyboard.press('Tab');
    const committed = await page.evaluate(() =>
      document
        .querySelector('cs-data-grid')
        .shadowRoot.querySelector('[data-row="3"][data-col="4"]')
        .textContent.trim(),
    );
    assert.equal(committed, '2000137 Staff Support 1', 'Tab took the first match for the typed prefix');
    assert.equal((await focused(page)).col, '5');
    await page.close();
  });
});

describe('6. Pinned columns, column order and layouts', () => {
  it('round-trips layout JSON and keeps each row one row in visual order', async () => {
    const page = await openGrid(env);
    const result = await page.evaluate(async () => {
      const grid = document.querySelector('cs-data-grid');
      const root = grid.shadowRoot;
      const headers = () => [...root.querySelectorAll('[role="columnheader"]')].map((el) => el.textContent.trim());
      const initial = grid.layout;
      grid.moveColumn('memo', -1);
      grid.pinColumn('amount', true);
      await grid.updateComplete;
      const saved = JSON.stringify(grid.layout);
      grid.layout = { pinned: [] };
      await grid.updateComplete;
      const reset = headers();
      grid.layout = JSON.parse(saved);
      await grid.updateComplete;
      const restored = headers();
      grid.layout = {
        order: ['nope', 'memo'],
        pinned: ['ghost'],
        widths: { memo: -4 },
      };
      await grid.updateComplete;
      const tolerant = grid.layout;
      grid.layout = JSON.parse(saved);
      await grid.updateComplete;
      const scroller = root.querySelector('[role="grid"]');
      scroller.scrollLeft = 10000;
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const row = root.querySelector('[role="row"][aria-rowindex="3"]');
      const cells = [...row.children].map((cell) => ({
        x: cell.getBoundingClientRect().left,
        pinned: cell.classList.contains('cell--pinned'),
      }));
      const scrollerLeft = scroller.getBoundingClientRect().left + scroller.clientLeft;
      return {
        initial,
        saved: JSON.parse(saved),
        reset,
        restored,
        tolerant,
        cells,
        scrollerLeft,
      };
    });
    assert.deepEqual(result.initial.pinned, ['line', 'donor']);
    assert.deepEqual(result.saved.pinned, ['line', 'donor', 'amount']);
    assert.deepEqual(result.restored.slice(0, 3), ['Line', 'Donor ID', 'Amount']);
    assert.equal(
      result.restored.indexOf('Memo'),
      result.restored.indexOf('Gift date') - 1,
      'Memo moved before Gift date',
    );
    assert.equal(result.reset[0], 'Line');
    assert.deepEqual(
      result.tolerant.order.slice(0, 2),
      ['memo', 'line'],
      'unknown keys dropped, missing columns appended',
    );
    assert.equal(result.tolerant.widths.memo, 14, 'bad width falls back');
    // Pinned cells stuck to the start edge after scrolling to the far end; DOM order is still visual order.
    assert.ok(Math.abs(result.cells[0].x - result.scrollerLeft) < 1, 'first pinned cell sits at the start edge');
    for (let i = 1; i < 3; i++) {
      assert.ok(result.cells[i].x > result.cells[i - 1].x, 'pinned cells in DOM order on screen');
    }
    await page.close();
  });

  it('pins to the right edge in RTL and keeps DOM order equal to logical order', async () => {
    const page = await openGrid(env, '?rows=3000&dir=rtl');
    const cells = await page.evaluate(() => {
      const row = document.querySelector('cs-data-grid').shadowRoot.querySelector('[role="row"][aria-rowindex="2"]');
      return [...row.children].map((cell) => cell.getBoundingClientRect().right);
    });
    for (let i = 1; i < cells.length; i++) {
      assert.ok(cells[i] < cells[i - 1], 'each next cell sits further left');
    }
    await focusCell(page, 0, 'amount');
    await page.keyboard.press('ArrowLeft');
    assert.equal((await focused(page)).col, '4', 'ArrowLeft moves to the next logical column in RTL');
    await page.close();
  });
});

describe('5. Themed from tokens: light, dark and a second brand', () => {
  it('cell, header and focus colours follow the theme classes', async (t) => {
    const page = await openGrid(env);
    await focusCell(page, 0, 'amount');
    const read = () =>
      page.evaluate(() => {
        const root = document.querySelector('cs-data-grid').shadowRoot;
        const style = (selector, property) => getComputedStyle(root.querySelector(selector))[property];
        return {
          cell: style('[data-row="1"][data-col="3"]', 'backgroundColor'),
          text: style('[data-row="1"][data-col="3"]', 'color'),
          header: style('.cell--header', 'backgroundColor'),
          focus: style('.cell:focus', 'outlineColor'),
          font: style('[data-row="1"][data-col="3"]', 'fontFamily'),
        };
      });
    const light = await read();
    await page.evaluate(() => document.documentElement.classList.add('cs-dark'));
    const dark = await read();
    await page.evaluate(() => {
      document.documentElement.classList.remove('cs-dark');
      document.querySelector('#fl-theme').disabled = false;
    });
    await frames(page, 2);
    const fl = await read();
    t.diagnostic(JSON.stringify({ light, dark, fl }));
    assert.notEqual(light.cell, dark.cell);
    assert.notEqual(light.header, dark.header);
    assert.notEqual(light.text, dark.text);
    assert.notEqual(light.focus, fl.focus, 'brand changes the focus colour');
    assert.notEqual(light.font, fl.font, 'brand changes the body font');
    await page.close();
  });
});
