# cs-data-grid spike (UIUX-340)

A throwaway prototype for decision [#359](https://github.com/CruGlobal/cornerstone-design-system/issues/359): build
`cs-data-grid` ourselves, or adopt AG Grid Community. It is **not** a shipped component. It lives outside `src/`, so
it is not in the build, the Custom Elements Manifest, the package, the docs or the changeset gate. ESLint and
Prettier do cover it, and it passes both.

## Run it

From `packages/components`, after `npm install` at the repo root:

```sh
node spikes/data-grid/serve.mjs              # demo at http://127.0.0.1:8710/
node --test spikes/data-grid/test/*.test.mjs # 27 tests: pure maths plus browser tests in Chromium
node spikes/data-grid/test/perf.mjs          # rough numbers at 5,000 and 10,000 rows
```

`serve.mjs` bundles in memory with esbuild and writes nothing to `dist/`, so it can run beside `npm start`. The
browser tests use Playwright's Chromium (`npx playwright install chromium` if it is missing).

Demo query options: `?rows=10000`, `?dir=rtl`, `?scroll=cornerstone` (use the shared `scrollIntoView` instead of the
spike's inset version, to see where it falls short). Toolbar buttons toggle dark, the FamilyLife theme and RTL, move
and pin columns, and save or restore the layout. A save fails when an amount is 13, to try the failed-save path.

## Files

| File                          | What it is                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `data-grid.ts`                | The `cs-data-grid` element: rendering, focus, editing, lookup cells, layout, save and submit.               |
| `grid-keyboard-controller.ts` | Which key does what, modelled on `src/internal/segmented-field/segmented-field-controller.ts`.              |
| `grid-navigation.ts`          | Pure maths: virtual window, rows to render, Tab and arrow targets, lookup filter, layout JSON. Unit tested. |
| `scroll-cell-into-view.ts`    | What `src/internal/scroll.ts`'s `scrollIntoView` would need for a grid (header and pinned insets, RTL).     |
| `events/*.ts`                 | `cs-cell-commit`, `cs-layout-change`, `cs-batch-submit`, one class per file as in `src/events/`.            |
| `sample-data.ts`, `demo.ts`   | Made-up donation rows and the demo page wiring.                                                             |
| `LICENSE-litgrid`             | litgrid's MIT notice, for the two functions adapted in `grid-navigation.ts`.                                |

## Key map

Navigation mode (a cell has focus):

| Key                             | Does                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Tab / Shift+Tab                 | Next / previous cell, wrapping to the next / previous row. Leaves the grid past the ends. |
| Arrow keys                      | One cell, no wrap. Left and Right swap in RTL.                                            |
| Home / End                      | First / last cell in the row.                                                             |
| Ctrl+Home / Ctrl+End            | First / last cell in the grid.                                                            |
| Page Up / Page Down             | One screen of rows up / down.                                                             |
| Enter or F2                     | Start editing, keeping the value, caret at the end.                                       |
| Any printable character         | Start editing, replacing the value with that character.                                   |
| Delete / Backspace              | Clear the cell (validated like any commit; a required cell refuses).                      |
| Alt+End                         | Leave the grid forward, to the next focusable thing on the page.                          |
| Double click                    | Start editing.                                                                            |
| "Skip past grid" link (Tab to it before the grid) | Same as Alt+End.                                                        |

Edit mode (the cell's input has focus):

| Key             | Does                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Enter           | Commit and return focus to the same cell (does not move down).                                         |
| Escape          | Cancel, restore the old value, return focus to the cell.                                               |
| Tab / Shift+Tab | Commit and move to the next / previous cell in navigation mode. An invalid value keeps focus in place. |
| Arrows, Home, End | Move the caret inside the input.                                                                     |

Lookup cells (combobox) add:

| Key                   | Does                                                                                |
| --------------------- | ----------------------------------------------------------------------------------- |
| Typing                | Filters the list; codes that start with the text first, then code or name matches. |
| Down / Up             | Open the list, move the highlight. Alt+Down also opens.                             |
| Enter / Tab           | Commit the exact match, else the highlighted option (the first match when typing).  |
| Escape (list open)    | Close the list, keep the text.                                                      |
| Escape (list closed)  | Cancel the edit.                                                                    |

Alt+End is a placeholder for the mid-grid exit key. It still needs checking against jqGrid's keys and against
screen reader shortcuts.
