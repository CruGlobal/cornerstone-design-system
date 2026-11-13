# UIUX-340 spike: AG Grid Community vs our must-haves, and jqGrid / Siebel keys

Checked 2026-11-12. AG Grid version checked: **36.3.0** (`npm view ag-grid-community version` returned 36.3.0, license MIT; every docs page fetched showed 36.3.0). Source code was read on the `latest` branch of github.com/ag-grid/ag-grid. Nothing was installed or run.

Legend: **pass** = works in Community with config. **partial** = works but needs custom code or has a gap. **fail** = cannot be done. **Ent-only** = needs the paid Enterprise edition.

## Part 1. AG Grid Community against the must-haves

### Summary

| # | Must-have | Verdict | How |
|---|---|---|---|
| 1 | Tab cell to cell, wrap rows, leave grid after last cell | **pass** | This is the default. Optional `tabToNextCell` to tune it. |
| 2 | Edited cell keeps focus and text while grid scrolls | **pass** (needs a test) | Grid keeps editing and focused rows in the DOM when they scroll out. |
| 3 | Lookup cells filter as you type | **partial** (Community) / Ent-only built-in | `agSelectCellEditor` is a native `<select>`, no filtering. Rich Select (filter as you type) is Enterprise. We would write a custom editor (our own combobox). |
| 4 | Screen reader announces the cell and edit start/stop | **partial** | Good ARIA grid roles and counts. Edit start/stop is not announced by the grid. Known gaps with virtualization and state changes. |
| 5 | Themed from our tokens, no style clashes | **pass** (with care) | Theming API (`themeQuartz.withParams`) takes `var(--cs-...)` values. Shadow DOM supported. Page CSS can still reach the grid if it lives in light DOM. |
| 6 | Pinned columns, column order, save/restore layouts | **pass** | `pinned`, `getColumnState`/`applyColumnState`, `initialState`/`getState`, all Community modules. |

### 1. Tab moves cell to cell, wraps, leaves the grid. **pass**

- Default Tab behavior on cells: Tab moves right; at the last column it goes to the first column of the next row; Shift+Tab does the reverse. Source: `getNextTabbedCellForwards` sets `newColumn = displayedColumns[0]` and moves to the row below (https://github.com/ag-grid/ag-grid/blob/latest/packages/ag-grid-community/src/navigation/cellNavigationService.ts).
- At the last cell of the last row there is no next cell, so the grid does not call `preventDefault()` and the browser moves focus out of the grid. The code comment says: "only prevent default if we found a cell. so if user is on last cell and hits tab, then we default" (https://github.com/ag-grid/ag-grid/blob/latest/packages/ag-grid-community/src/navigation/navigationService.ts). Going backwards from the first cell moves focus into the header row, then out.
- Note: an older AG Grid docs page said focus "will not leave the grid". The current code does let it leave. Treat the old line as stale (search result, ag-grid.com/vue-grid/keyboard-navigation/).
- `tabToNextCell(params)` callback: return a cell position to move there, `true` to stay, or `false` to let the browser handle Tab (https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/). `tabToNextGridContainer` and `tabToNextHeader` also exist (same page).
- `suppressKeyboardEvent` on a column: return `true` and the grid ignores the key; the browser default still runs (same page).
- Tabbing into the grid focuses the first column header by default, not the first cell (same page). For data entry we would likely set `focusGridInnerElement` to go straight to a cell, or keep headers reachable for sort.
- Tab while editing: commits the edit and moves to the next **editable** cell, starting an edit there; non-editable cells are skipped (https://www.ag-grid.com/javascript-data-grid/cell-editing-start-stop/, and `findNextCellToFocusOn` in navigationService.ts). What happens when Tab is pressed while editing the last editable cell in the grid was not clear from the code; test it in the spike.

### 2. Edited cell keeps focus and text while the grid scrolls. **pass** (verify)

- Row virtualization is on by default: only visible rows plus a buffer of 10 rows above and below are rendered (`rowBuffer`). `suppressRowVirtualisation=true` renders all rows and ignores `rowBuffer` (https://www.ag-grid.com/javascript-data-grid/dom-virtualisation/). Column virtualization renders 200px either side; `suppressColumnVirtualisation` turns it off (same page).
- The docs do not say what happens to an editor that scrolls out. The source does: `doNotUnVirtualiseRow` keeps a row rendered if it has focus or is being edited, as long as it is still in the data (not filtered out or replaced). Code comment: "check that none of the rows to remove are editing or focused" (https://github.com/ag-grid/ag-grid/blob/latest/packages/ag-grid-community/src/rendering/rowRenderer.ts). So the live editor and its typed text should survive scrolling.
- `stopEditingWhenCellsLoseFocus` is off by default. When on, editing stops when focus leaves the cell or grid (https://www.ag-grid.com/javascript-data-grid/cell-editing-start-stop/). For DSG we probably want it on, so clicking a Save button outside the grid commits the last cell.
- Known issue found: a GitHub report that after 31.1.1, focus was lost on Tab after an edit; maintainers could not reproduce (https://github.com/ag-grid/ag-grid/issues/7792). Old and unconfirmed; no current open issue found for 36.x.
- Not checked: whether an editor in a column scrolled out sideways is also kept. Test it.

### 3. Lookup cells filter as you type. **partial** in Community; built-in answer is **Ent-only**

- `agSelectCellEditor` is Community (`SelectEditorModule`) but it is a native HTML `<select>`. The docs say the standard select "doesn't have an API that's rich enough to play properly with the grid", and Enter may or may not open it depending on browser (https://www.ag-grid.com/javascript-data-grid/provided-cell-editors-select/). No filter as you type.
- `agRichSelectCellEditor` has typing to search, search matching options and async filtering, but it is Enterprise (`RichSelectModule` from `ag-grid-enterprise`) (https://www.ag-grid.com/javascript-data-grid/provided-cell-editors-rich-select/, https://www.ag-grid.com/javascript-data-grid/modules/).
- Community path: write a custom cell editor (`CustomEditorModule`, Community). Interface: `init`, `getGui`, `getValue`, `afterGuiAttached` (set focus), `isPopup`, `isCancelBeforeStart`, `isCancelAfterEnd`. Arrow keys inside the editor need `event.stopPropagation()` or `suppressKeyboardEvent` so the grid does not move. Popups opened outside the editor need the `ag-custom-component-popup` class (https://www.ag-grid.com/javascript-data-grid/component-cell-editor/).
- So we would still build a filtering combobox ourselves and host it in the grid. Our own `cs-combobox` (if it exists or is planned) could be the editor's GUI.

### 4. Screen reader announcements. **partial**

- Roles: `grid` (or `treegrid` with grouping/tree), `row`, `gridcell`, `columnheader`; `aria-rowcount`, `aria-colcount`, `aria-rowindex`, `aria-colindex` (https://www.ag-grid.com/javascript-data-grid/accessibility/). Tested with JAWS and VoiceOver (same page). NVDA not listed.
- Virtualization caveat: screen readers expect all rows in the DOM. Docs suggest `ensureDomOrder`, turning virtualization off, or pagination (same page). With thousands of rows, turning off row virtualization costs memory and speed.
- Known limits in the docs: screen readers "may miss state changes on a focused cell"; workaround is moving focus away and back. Wrong column name in grouped headers (same page). That first one matters for edit start/stop.
- Live region: there is an `AriaAnnouncementService` that makes a `polite`, `aria-atomic` live region with a 200 ms debounce (https://github.com/ag-grid/ag-grid/blob/latest/packages/ag-stack/src/core/baseAriaAnnouncementService.ts). It is used for things like editor validation errors ("Cannot complete row edit...") (https://github.com/ag-grid/ag-grid/blob/latest/packages/ag-grid-community/src/edit/utils/validationAnnouncements.ts). It is not documented as a public API, and I found no docs saying edit start or stop is announced.
- When an edit starts, focus moves into the editor `<input>`, so a screen reader will read the input. An "editing" / "edit saved" / "edit cancelled" message would need our own live region, wired to `cellEditingStarted` / `cellEditingStopped` events.

### 5. Themed from our tokens with no clashes. **pass** (with care)

- Theming API (v33+): `themeQuartz.withParams({...})`. Every param accepts a plain CSS string, including `var(--myVar)`, so params can point at our `--cs-*` custom properties (https://www.ag-grid.com/javascript-data-grid/theming-parameters/). Params are backed by `--ag-*` properties (for example `columnBorder` is `--ag-column-border`), which can still be overridden in CSS (same page).
- Dark mode: `withParams(params, 'dark')` style modes, switched by `data-ag-theme-mode` on `html`/`body`, or on an ancestor with the `ag-theme-mode` class inside Shadow DOM (https://www.ag-grid.com/javascript-data-grid/theming-colors/). If our tokens already flip for dark mode, pointing params at `var(--cs-...)` may make this unnecessary.
- CSS injection: the grid writes its CSS into `document.head` by default; `themeStyleContainer` changes where. Inside Shadow DOM it defaults to the grid's root, but the docs recommend setting it so many grids share one copy. `themeCssLayer` puts grid CSS in a cascade layer so app styles can win (https://www.ag-grid.com/javascript-data-grid/theming/).
- Clashes: if the grid lives in the light DOM, page CSS (global `input`, `button`, `table` rules) can reach it. Inside a shadow root it is shielded from page CSS and its CSS does not leak out. Its CSS uses `.ag-*` class names, so in light DOM it is unlikely to hit our components.
- Legacy CSS themes (pre-v33 CSS files) are deprecated and will be removed (https://www.ag-grid.com/javascript-data-grid/theming-v32/). Do not use them.

### 6. Pinned columns, order, saving and restoring layouts. **pass**

- Pinning: `pinned: 'left' | 'right'`, `initialPinned`, `lockPinned` (https://www.ag-grid.com/javascript-data-grid/column-pinning/).
- Column state: `api.getColumnState()` / `api.applyColumnState({ state, applyOrder: true })` covers width, hide, sort, pinned and order (https://www.ag-grid.com/javascript-data-grid/column-state/). `ColumnApiModule` is Community.
- Grid state: `initialState`, `api.getState()`, `onStateUpdated` cover column order, pinning, sizing, visibility, sort, filter, focused cell, scroll and more (https://www.ag-grid.com/javascript-data-grid/grid-state/). `GridStateModule` is Community (https://www.ag-grid.com/javascript-data-grid/modules/).

### Other items

- **Edit keys:** Enter or F2 starts an edit. A printable key starts an edit with that character as the new content (replaces). Backspace starts and clears on Windows; on macOS set `enableCellEditingOnBackspace`. Enter commits. Escape cancels and drops the change. Tab commits and moves (https://www.ag-grid.com/javascript-data-grid/cell-editing-start-stop/). This matches the proposed cs-data-grid map almost exactly.
- **Enter options:** `enterNavigatesVertically` (Enter moves down when not editing) and `enterNavigatesVerticallyAfterEdit` (Enter moves down after commit) (same page). The second one gives a jqGrid "excel mode" feel if DSG wants it.
- **Arrows:** move one cell when not editing; nothing at the edge; Ctrl+Left/Right to row start/end; PageUp/PageDown by page; Home/End to first/last row; Up from row 1 goes into the header (https://www.ag-grid.com/javascript-data-grid/keyboard-navigation/).
- **RTL:** `enableRtl=true`; the RTL simple example uses only Community modules (https://www.ag-grid.com/javascript-data-grid/rtl/). Left/Right arrows are swapped in RTL in the source (cellNavigationService.ts link above).
- **Range selection and clipboard are Enterprise** (https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/, https://www.ag-grid.com/javascript-data-grid/modules/). So multi-cell copy/paste from Excel is not in Community. Worth flagging to DSG. Undo/redo of edits (`UndoRedoEditModule`) is Community (modules page).
- **Bundle size:** unpacked npm size of ag-grid-community 36.3.0 is about 21.9 MB (from `npm view`, includes all builds). AG Grid gives no gzip figure; v33 made one tree-shakable package and says registering only needed modules can make it up to 40% smaller, and that `AllCommunityModule` prevents tree shaking (https://www.ag-grid.com/blog/upgrading-to-ag-grid-33/, https://www.ag-grid.com/javascript-data-grid/modules/). Third-party sites list about 326 to 345 KB gzipped for the whole package, version unknown (https://devpick.pages.dev/pkg/ag-grid-community, https://depscope.dev/pkg/npm/ag-grid-community). Measure our own build in the spike.
- **License:** Community is MIT, free in production, no key (https://www.ag-grid.com/javascript-data-grid/community-vs-enterprise/).
- **Lit / web component:** there is no Lit wrapper; we would use the plain JavaScript API (`createGrid(element, options)`) inside a Lit component. Shadow DOM is supported for theming as above (https://www.ag-grid.com/javascript-data-grid/theming/). Not verified: focus tracking across the shadow boundary, popup editors inside a shadow root, and `aria-*` references. These are the main risks to test.

## Part 2. jqGrid and Siebel keys

Sources: Guriddo jqGrid source (github.com/tonytomov/jqGrid, `grid.celledit.js` and `grid.inlinedit.js`). free-jqgrid is a fork with similar edit code but I did not read its source line by line. Siebel: Oracle "Siebel Fundamentals for Open UI, Keyboard Navigation and Shortcuts" (https://docs.oracle.com/cd/F14158_13/books/FundOUI/keyboard-navigation-and-shortcuts.html).

Important unknown: how Siebel's own list applet JS layers on top of jqGrid. Siebel Open UI list applets use their own key handling for record-level shortcuts, so what DSG feels day to day is Siebel + jqGrid together. Watch a DSG user in the real app to confirm.

### jqGrid cell edit (`cellEdit: true`)
Source: https://github.com/tonytomov/jqGrid/blob/master/js/grid.celledit.js
- Enter (no Shift) saves the cell. In `excel` mode it also moves down one row.
- Escape restores the old value (`restoreCell`).
- Tab / Shift+Tab save and move to the next / previous **editable** cell in the same row (`nextCell` / `prevCell`).
- Row end: by default Tab at the last editable cell saves and **stops**; focus stays. Only with `editNextRowCell: true` does it wrap to the next row (and the search skips column 0 when it wraps).
- Arrows when not editing (GridNav): move the selected cell; Enter starts edit. RTL swaps Left/Right. In `excel` mode arrows also work while editing.

### jqGrid inline row edit (`editRow` with `keys: true`)
Source: https://github.com/tonytomov/jqGrid/blob/master/js/grid.inlinedit.js
- Enter saves the whole row (not in a textarea). Escape restores the whole row. `onEnter` / `onEscape` can override.
- Tab has no jqGrid handling; the browser moves between the row's inputs, and after the last input it leaves the row (to whatever is next in the page).
- `focusField` (default true) puts focus in the first editable field when edit starts.
- Arrows: no handling; they move the text cursor inside the input.

### Siebel Open UI list applet shortcuts (Oracle docs above)
- New record Ctrl+Alt+N (Ctrl+N in some versions; Chrome steals Ctrl+N, see https://support.oracle.com/knowledge/Siebel/1636321_1.html). Save Ctrl+S or Ctrl+Shift+S. Delete Ctrl+D. Copy record Ctrl+B. Undo record Esc.
- Next / previous record: Ctrl+Down / Ctrl+Up (also Alt+. / Alt+,).
- Enter drills down on the item in focus; on a header it sorts.
- **F2 opens a pick list, calendar or calculator for a field. F2 or Down Arrow opens a drop-down.**
- Tab moves between widgets: applet menu, buttons, headers, then the first column of the first row.
- No dedicated "Ctrl+E edit" shortcut is listed.

### Comparison table

| Action | jqGrid (cell edit) | jqGrid (inline row edit) | Siebel Open UI shortcut | AG Grid Community default | Proposed cs-data-grid key |
|---|---|---|---|---|---|
| Move to next cell | Tab, editable cells only, saves as it goes | Tab (browser), inputs in the row | Tab (between widgets) | Tab, all cells; while editing, next editable cell | Tab |
| Move to previous cell | Shift+Tab | Shift+Tab (browser) | Shift+Tab | Shift+Tab | Shift+Tab |
| Tab at end of row | Stops (wraps only with `editNextRowCell`) | Leaves the row | Not documented | Wraps to next row | Wraps to next row |
| Tab at last cell of grid | Stops, saves | Leaves the row | Not documented | Leaves the grid | Leaves the grid |
| Move with arrows (not editing) | Arrows move selection | None (text cursor) | Arrows move within a widget | Arrows; nothing at edge | Arrows |
| Start edit | Enter, or click | Row is already in edit | F2 opens pick list / calendar (not "edit") | Enter, F2, double-click | F2 or Enter |
| Type to start edit | Not by default | N/A (already editing) | Type in the field | Printable key starts edit, replaces content | Printable key, replaces content |
| Commit | Enter (excel mode: and move down) | Enter saves whole row | Ctrl+S saves record | Enter (focus stays; option to move down) | Enter |
| Cancel | Escape restores cell | Escape restores whole row | Esc = undo record | Escape drops change | Escape restores |
| Open lookup list | Native select | Native select | F2 or Down Arrow | Native select (Enter may not open it) | Not set yet (suggest Alt+Down, plus F2 clash note below) |
| Next / previous record | Up / Down | None | Ctrl+Down / Ctrl+Up | Up / Down | Up / Down when not editing |
| New record | None | None | Ctrl+Alt+N (Ctrl+N) | None | Not set (app level) |
| Save record | None | Enter | Ctrl+S | None | Not set (app level) |

### Where jqGrid / Siebel muscle memory clashes with the proposed map

1. **Tab wrapping.** In jqGrid cell edit, Tab stops at the row end by default (unless Siebel turns on `editNextRowCell`). In the proposed map it wraps to the next row. Users used to "Tab, Tab, stop, then click the next row" will now land in the next row. Likely a welcome change, but confirm what DSG sees today.
2. **Tab skips non-editable cells in jqGrid.** The proposed map does not say. AG Grid skips them only while editing. Decide: should Tab (not editing) land on read-only cells? For fast entry, skipping is what jqGrid users expect.
3. **F2 in Siebel opens the pick list / calendar.** In the proposed map F2 starts edit. For a lookup cell, F2 could do both (start edit and open the list) to keep Siebel habits. For a date cell, users may expect a calendar.
4. **Enter in Siebel drills down** (opens the record). In the proposed map Enter starts or commits an edit. A user pressing Enter to "open" will instead start editing.
5. **Escape in inline row edit undoes the whole row**, and Siebel Esc is "undo record". In the proposed map Escape restores only the current cell. A second Escape to undo the row is a possible add.
6. **Enter in jqGrid excel mode moves down after save.** The proposed map keeps focus on the cell. AG Grid's `enterNavigatesVerticallyAfterEdit` covers this if DSG wants it; for column-by-column entry of hundreds of rows it may be the bigger win.
7. **Typing to start edit** is new compared to jqGrid cell edit (needs Enter or click there). Low risk, but a stray key on a focused cell will now overwrite it; Escape must restore cleanly.
8. **Ctrl+S / Ctrl+Alt+N / Ctrl+Up / Ctrl+Down** are Siebel record shortcuts, not grid keys. If the host app keeps them, the grid must not swallow them. AG Grid uses Ctrl+Left/Right for row start/end, not Ctrl+Up/Down, so no clash there.

## Open questions for the spike
- Tab while editing the last editable cell in AG Grid: does focus leave the grid or stay? Test.
- Horizontal scroll with an open editor (column virtualization): editor kept? Test.
- Shadow root: focus, popup editor placement, `themeStyleContainer`. Test inside a Lit component.
- Real DSG behavior in Siebel today: is `editNextRowCell` or excel mode on? Watch a user.
