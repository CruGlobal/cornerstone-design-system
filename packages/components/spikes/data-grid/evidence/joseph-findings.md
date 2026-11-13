# UIUX-340 / #359: cs-data-grid spike findings

Author: Joseph. Date: 2026-11-12.
Commit: `9a15ed8ba59c65bf31042d88498def72e188d70d` on `claude/vibrant-shamir-391253` (not pushed, no PR, no changeset).
Code: `packages/components/spikes/data-grid/` (README there has the run steps and the key map).

## Short answer

A Cornerstone-built grid is workable. In one spike day all six must-haves work in Chromium. The two litgrid
mistakes are avoided by design, not by patching:

- **Real focus only.** Roving `tabindex`, never `aria-activedescendant` for cells. The only `aria-activedescendant`
  is inside the lookup combobox, which is the normal combobox pattern (Esther agrees, section 2 of her criteria).
- **The active row is never recycled.** The rows drawn are the virtual window plus the active row, kept sorted, and
  rendered with a keyed `repeat`. Because the list is always in order, Lit never has to move or rebuild the active
  row's DOM while the window slides past it. An open editor keeps the same `<input>` element, focus, text and caret
  through a scroll thousands of rows away and back.

Nothing found argues against "build". The real build still has a lot of work (estimate below: 8 to 10 weeks,
nearer 10 with the cross-engine and screen-reader work). The biggest open risks are untested engines (Firefox and
WebKit were not installed here), IME input with type-to-edit, and the human screen-reader session.

## How it was built

- `CornerstoneElement` base, `static css` with `@layer cs-component`, the shared `sizeStyles` and
  `visuallyHiddenStyles`, `customElement` from `src/internal/custom-element.ts`.
- Component properties `--cs-data-grid-row-height`, `-height`, `-border-color`, `-background`,
  `-header-background`, each read with a token fallback. Only `--_` aliases on `:host`. No `--ref-*`, `--sys-*`
  or `--cmp-*`. Row height defaults to `var(--cs-form-control-height)`, so the editor fits the row and `size`
  rescales everything (column widths are in `em`).
- `handleX` names, `event` params, events as classes (`CsCellCommitEvent`, `CsLayoutChangeEvent`,
  `CsBatchSubmitEvent`) in `spikes/data-grid/events/`.
- Reused: `announce` (`live-announcer.ts`), `registerDismissible`/`isTopDismissible` (`dismissible-stack.ts`) for
  the lookup list's Escape, `scrollIntoView` (`scroll.ts`, measured, see below). `GridKeyboardController` is a
  `ReactiveController` with the same split as `SegmentedFieldController`: the controller owns which key does what
  and the RTL swap; the host plugs in data, focus and validation through a config object, and handles its own keys
  first (the lookup list) before calling the controller.
- `active-elements.ts` turned out not to be needed inside the component: focus stays in one shadow root, so
  `shadowRoot.activeElement` and `focusin` are enough. The tests use the same walk it does.
- Lint: ESLint and Prettier cover `spikes/` and pass. `tsc` passes with a spike `tsconfig.json`. ast-grep scan is
  clean. The build, CEM, `test:properties` and the package `files` list only look at `src/`, so the spike stays out.

## Must-haves

| # | Must-have | Status | Evidence |
| - | --- | --- | --- |
| 1 | Tab cell to cell, wraps rows, leaves after the last cell; Shift+Tab mirrors | **Pass** | `grid.test.mjs` "1. Tab moves..." (4 tests): Tab in lands on the active cell; walks 10 columns and wraps to row 2; Shift+Tab wraps back; exactly one `tabindex="0"`; Tab on the last cell of row 3,000 leaves to the Submit button even when that row is drawn only because it is active (window at the top); Shift+Tab on the first cell leaves backwards; Tab while editing commits and moves on. |
| 2 | Editing cell keeps focus and typed text while scrolling, editor row not recycled | **Pass** | "2. An open editor survives..." : 40 wheel notches plus a scrollbar-style jump to row ~2,500 and back. Same `<input>` object, still `isConnected`, still focused, text and caret position kept; window rows read 2400+ contiguous with the editing row (`aria-rowindex` 7) first in DOM order. Shown failing first: with the active row left out of the drawn list, 8 of 27 tests fail, this one included. |
| 3 | Lookup cells filter as you type | **Pass** (spike level) | "3. Lookup cells..." : `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` move with Down; DOM focus never leaves the input; list is in the top layer (`popover`), so the grid cannot clip it; first Escape closes and keeps text, second cancels and restores; "No matches" text; typing a prefix then Tab commits the first match. 400 designations, filter by code prefix then code or name. Gaps for a real build listed below. |
| 4 | Screen readers announce the cell and edit start / stop | **Partial** | Done by focus, not the announcer. Chromium's accessibility tree (CDP) shows: cell = `gridcell` "47.00"; after Enter, `textbox` "Amount 2" with description "Editing. Enter saves, Escape cancels."; after Escape, `gridcell` "47.00" again; read-only cells expose readonly. No announcement over 50 mixed moves plus an edit and commit. Partial only because no person has listened with NVDA, JAWS or VoiceOver (Esther F10, E5). The input name reads "Amount 2" because the row header is just the line number; "Amount, line 2" needs a better row header name. |
| 5 | Themed from tokens, no clashes, light, dark, a brand | **Pass** (Chromium) | "5. Themed..." reads computed styles. Light: cell white, text rgb(29,29,29), header rgb(240,239,238), focus rgb(255,208,0), Inter. `.cs-dark`: cell rgb(18,18,18), text rgb(240,239,238), header dark. FamilyLife: focus rgb(0,108,91), Akkurat. Screenshots of dark + lookup open and FamilyLife + RTL + error looked right. No page styles leak in (shadow DOM). Contrast pairs were not computed (see Esther K6). |
| 6 | Pinned columns, column order, save and restore layouts | **Pass** | "6. Pinned columns..." : `layout` getter / setter round-trips JSON (`{version, order, pinned, widths}`); `moveColumn`, `pinColumn`; a stale layout with unknown keys and a bad width is repaired, not thrown. Pinned cells stay in their row, in DOM order, with `position: sticky` + `inset-inline-start`; after scrolling to the far end the first pinned cell sits at the start edge. In RTL each next cell sits further left and pins go to the right edge. Demo toolbar saves to and restores from localStorage. No column resize UI yet (widths only through the JSON). |

## Extra checks

### scrollIntoView (shared helper in `src/internal/scroll.ts`)

Measured by `grid.test.mjs` "scrollIntoView with...": focus a cell, press ArrowUp past the top, ArrowDown past the
bottom, ArrowLeft back to the first unpinned column. Numbers are pixels of the 43px-high, 176px-wide cell that end
up covered.

| Helper | Dir | Under sticky header | Past visible bottom | Under pinned columns |
| --- | --- | --- | --- | --- |
| shared `scrollIntoView` | LTR | 44 (fully hidden) | 2 | 177 (fully hidden) |
| shared `scrollIntoView` | RTL | 44 (fully hidden) | 2 | 178 (fully hidden) |
| spike `scrollCellIntoView` | LTR | 0 | 0 | 0 |
| spike `scrollCellIntoView` | RTL | 0 | 0 | 0 |

- **Instant:** yes, the shared helper takes `'auto'`.
- **RTL:** works. Its `offset + scrollLeft` maths happens to stay consistent with negative RTL `scrollLeft`.
- **Falls short on:** (1) no way to reserve the sticky header or pinned columns, so it scrolls the cell exactly to
  the edge, under them (fails WCAG 2.4.11 for a grid); (2) it measures with `offsetHeight` / `offsetWidth`, which
  include borders and scrollbars, so a cell can stop behind the horizontal scrollbar. Headless Chromium has overlay
  scrollbars so this showed as 2px (the border); with classic 15px scrollbars (Windows) expect about 17px; (3) it
  calls `scrollTo` twice for 'both', which with 'smooth' can cancel one axis (not tested).
- **What it would need:** an optional `insets` argument (`blockStart`, `inlineStart`, maybe the end sides), measure
  the visible box with `clientWidth` / `clientHeight` / `clientLeft`, and one `scrollBy` with a physical delta, which
  makes RTL free. That is `spikes/data-grid/scroll-cell-into-view.ts`, about 40 lines. Callers today:
  `otp-input.ts`, `tab-group.ts` (two calls) and `select.ts` (two calls). Adding `insets` is additive; switching
  `offsetHeight` to `clientHeight` changes what those callers get, so it is load-bearing and needs each one checked.
  That change would be its own PR to `src/internal/scroll.ts` with a test.

### Announcer only for errors, failed saves and submits: **Pass**

Tests watch the light-DOM live region (`role="log"`). 50 moves plus edit start, stop and commit: zero
announcements. Bad amount + Enter + Tab: one assertive "Row 3, Amount: Enter an amount greater than 0, with up to 2
decimals." (repeat attempts on the same text are not re-announced). Save failure: assertive "Row 10 not saved:
Amount 13 is blocked by the test server." Submit with a half-filled row: one assertive "Batch not submitted. 1 row
has errors. First: row 2961, Amount." and focus moves to that cell. Submit after fixing: one polite "Batch
submitted. 2951 rows." Saving and saved are shown in the row's Status cell and never announced.

### Active row stays drawn while scrolled away: **Pass**

"The active row stays drawn..." on 10,000 rows: active cell row 11, Alt+End out of the grid, scroll 5,000 rows
away, the row (`aria-rowindex` 12) is still first in the DOM, and Shift+Tab from the next button lands back on the
same cell. Also shown failing first (see must-have 2).

### Performance

`test/perf.mjs`, headless Chromium, Apple silicon laptop, 1280x800, grid 70vh. Indicative, not a lab measurement.

| CPU | Rows | First render | Scroll frames (400px per frame, 300 frames) | Jump to random row, update | Arrow key per press | JS heap after GC | Rows in DOM |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1x | 5,000 | 15 ms | median 16.7, p95 16.8, max 16.8 ms; 0 over 33 ms | median 3.8, p95 5.4 ms | 1.3 ms | 2.8 MB | 24 |
| 1x | 10,000 | 14 ms | same; 0 over 33 ms | median 3.9, p95 5.1 ms | 1.3 ms | 3.4 MB | 24 |
| 4x slower | 5,000 | 34 ms | same; 0 over 33 ms | median 16.8, p95 25.7 ms | 6.0 ms | 2.6 MB | 24 |
| 4x slower | 10,000 | 58 ms | same; 0 over 33 ms | median 15.5, p95 21.6 ms | 7.2 ms | 3.0 MB | 24 |

Render cost does not grow with row count (only about 24 rows, 490 elements are ever drawn); memory grows only with
the row data. Headless frame timing is paced, so "0 frames over 33 ms" means no stalls, not proof of smoothness on a
DSG workstation. A real check on DSG hardware with 10,000 rows is still needed.

## Esther's criteria, item by item

Pass means met in the spike (with a test where she asked for [test]); gap means a real build must do it.

- **R1** Pass: `role="grid"` named by `aria-labelledby` to a visible label in the same shadow root. Gap: the label
  comes from a `label` attribute; a real build needs the label slot with attribute fallback.
- **R2** Pass: no `delegatesFocus`. **R3** Pass (tested): `aria-rowcount` = rows + 1, header = 1, logical,
  contiguous after scrolling. **R4** Pass: all columns always drawn, so `aria-colcount` / `aria-colindex` left off.
  **R5** Pass: header row in the same grid; Line column is `rowheader`. **R6** N/A: no sorting in the spike.
- **R7** Pass (tested): one row element, cells in DOM order equal visual order, pinning by sticky. **R8** Pass (tested).
- **F1** Pass (tested). **F2** Pass: name is content; `aria-readonly`, `aria-required`. **F3** Pass (tested): Tab in
  lands on the last active cell. **F4** Pass (tested): F2 / Enter / type-to-edit. **F5** Pass: input
  `aria-labelledby="col-<key> rowhead-<n>"`. **F6** Pass (tested): Escape restores, Enter commits and stays, Tab
  commits and moves to the next cell in navigation mode. **F7** Pass (tested): invalid keeps focus, Escape always
  works. **F8** Pass (tested). **F9** Pass: no mode text on the cell. **F10** Not done (human).
- **K1** Pass for cells (tested); no header controls or row actions exist yet. **K2** Pass (tested, including the
  undrawn last row). **K3** Pass (tested): "Skip past grid" link, visible on focus, plus Alt+End. Alt+End is a
  placeholder still to check against jqGrid and screen-reader keys; the "next focusable" search only sees light-DOM
  elements, so a `cs-*` control after the grid is found by its host only if the host is tabbable.
  **K4** Partial: visible hint tied with `aria-describedby` on the grid; no docs page.
  **K5** Pass (tested in LTR and RTL). **K6** Partial: `outline` rings on the cell and the editor, inset so they are
  not clipped; contrast pairs not computed; inherits the "single-tone focus indicator" known gap (Cru light focus is
  rgb(255,208,0) on white). **K7** Pass with the spike helper (tested), fails with the shared helper (table above).
  **K8** Pass: focus and commit change nothing else; saves are per cell on commit. **K9** Pass by construction
  (always instant scroll), not tested. **K10** Partial: reorder and pin are buttons (no drag); no resize yet.
- **L1, L2, L5, L6** Pass. **L3** Pass (tested) and registers with `dismissible-stack`. **L4** Pass: top layer;
  highlight has a ">" marker and an outline, not colour alone.
- **E1** Pass: `aria-invalid` on cell and input, message by `aria-describedby`, "!" icon plus text bubble on the
  active cell, "Error" text in the Status cell. **E2** Partial: Status cell shows text plus a glyph (Saved, Saving,
  Not saved, Error); the active row has a tint plus a bar on its row header. **E3** Pass (tested). **E4** Pass
  (tested by watching the live region, not a sinon spy). **E5** Not done (human).
- **T1, T2** Pass (tested). **T3** N/A.
- **Section 7** (axe in both fixture types and three engines, `a11ySnapshot`, RTL and 5,000-row fixtures under
  web-test-runner) not done; it belongs to the real build.

## Key map (final)

Also in `spikes/data-grid/README.md`.

Navigation mode: Tab / Shift+Tab next / previous cell, wrapping rows, leaving past the ends. Arrows one cell, no
wrap, Left and Right swapped in RTL. Home / End row start / end. Ctrl+Home / Ctrl+End first / last cell. Page Up /
Page Down one screen. Enter or F2 edit, keeping the value. Any printable character edits, replacing the value.
Delete / Backspace clear (validated). Alt+End leave the grid forward. Double click edits. "Skip past grid" link
before the grid.

Edit mode: Enter commit and stay on the cell. Escape cancel and restore. Tab / Shift+Tab commit and move (invalid
keeps focus). Arrows, Home, End move the caret.

Lookup cells: typing filters; Down / Up (or Alt+Down) open and move; Enter / Tab commit the exact match, else the
highlighted option; Escape closes the list first, then cancels.

## What a real build still needs, with an estimate

One developer, weeks:

| Work | Weeks |
| --- | --- |
| API design and scaffold in `src/components/data-grid/` via `npm run create`: column and row model, label slot, JSDoc for the manifest, events in `src/events/`, SSR guards, React wrapper check | 1 |
| Keyboard and editing hardening: IME and dead keys with type-to-edit, paste (single and multi-cell), undo, mouse edge cases, whether Tab should skip read-only cells (jqGrid comparison), add-row at the end for quick entry | 1.5 |
| Virtualization hardening: rows added or removed while scrolled, scroll anchoring, sort and filter, resize | 1 |
| Lookup cell: real positioning (flip near the viewport bottom, likely `cs-popup`), async sources, large lists | 1 |
| Columns: resize by keyboard and pointer, hide and show, layout API final shape | 1 |
| Validation, row status and save contract: async save per row or per cell, dirty tracking, error summary, submit | 1 |
| `scrollIntoView` insets change to `src/internal/scroll.ts` (own PR, checks select, tab-group, otp-input) | 0.5 |
| Accessibility to the floor with Esther: axe x 3 engines x CSR/SSR, `a11ySnapshot`, RTL and 5,000-row fixtures, forced colors, contrast pairs per brand and scheme, human screen-reader session | 1.5 |
| Firefox and WebKit pass (not run in the spike), performance on DSG hardware, docs page with Anna | 1 |
| **Total** | **about 9.5** |

So 8 to 10 weeks, nearer 10, which matches the range in #359.

## Borrowed from litgrid

Source: https://github.com/tipolox/litgrid, MIT, commit `2ab7ee2b952f3e3c664b288ecad5912fc0739ad6`, cloned into
the scratchpad only, never built, installed or run.

- `getVirtualWindow` in `grid-navigation.ts`, adapted from `createVirtualizer().getState()`
  (`packages/grid-renderer/src/virtualization/createVirtualizer.ts`).
- `getTabTarget` in `grid-navigation.ts`, adapted from `DataGrid.getTabNavigationCell()`
  (`packages/grid-web/src/components/DataGrid.ts`).
- The F2 / Escape hand-off between cell and input follows litgrid's behaviour, written fresh in
  `grid-keyboard-controller.ts` (which points at the notice).

The file header in `grid-navigation.ts` names both and the copyright; `LICENSE-litgrid` sits next to it. Not taken:
litgrid's row reuse (the bug) and its mixed `aria-activedescendant` focus.

## Conflicts and things to flag

- **No conflict between the brief and the repo rules** that I had to pick a side on. Esther found none either.
- **Changeset gate, if this ever becomes a PR.** The brief keeps the spike out of the changeset gate, and it is out
  of the package. But CI's `Changeset present` job would still ask a PR touching `packages/components/` for a
  changeset, and root `CLAUDE.md` names only Dependabot and lockfile-only PRs as exceptions. A spike that changes no
  shipped output fits neither. If the spike is ever pushed, someone should decide whether it takes a patch changeset
  or the gate gets a spike exception (that is a change to `packages/build-tools/changeset-gate.js`, not mine to make
  alone). Nothing was pushed, so nothing is blocked today.
- **Lint covers `spikes/`.** ESLint and Prettier run over the whole package, so the spike had to pass them (it does).
  Fine, but worth knowing if another spike lands there.
- **Only Chromium ran.** Playwright's Firefox and WebKit are not installed on this machine, and the CDP
  accessibility tree used for must-have 4 is Chromium-only. Sticky cells inside absolutely placed rows and the
  `popover` listbox are the parts most worth checking in Safari.
- **Load-bearing literal to watch:** row height is `var(--cs-form-control-height)` because the editor is a bare input
  filling the row. If a real build swaps in `cs-input`, its own height must still match, or rows jump on edit.
