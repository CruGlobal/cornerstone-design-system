# UIUX-340 / #359: accessibility acceptance criteria for the data-grid spike

Author: Esther. Date: 2026-11-12. Status: written before the prototype exists
(`packages/components/spikes/data-grid/` was not there when I looked). Read against the prototype as it lands.

Target is WCAG 2.2 AA (`docs/standards/accessibility.md`). Each line is tagged with how it gets checked:

- **[test]** a browser test can assert it (web-test-runner, three engines).
- **[code]** a reviewer can confirm it by reading the code or the rendered DOM.
- **[human]** needs a person at a real screen reader. Nothing in this file claims that was done. The gap register
  already says no component has been checked by someone who relies on assistive technology; this grid would join
  that list.

---

## 1. Roles and structure

**Recommendation: `role="grid"`.** Not `treegrid`: there is no row hierarchy (no groups, no expand). Not a plain
`<table>` with inputs: a table of inputs gives the Tab model for free, but it has no navigation mode (cell focused,
not editing), so F2/Enter/Escape and arrow movement would have no home. If the spike ever drops navigation mode and
every cell is always an input, revisit `<table>` with native inputs, since it is native before ARIA.

Keeping `role="grid"` while Tab moves cell to cell is fine as long as **arrows also work** (section 3). Screen
readers switch to focus mode inside a grid and pass keys to the page, so Tab is ours to handle. What the role
promises is arrow movement; Tab wrapping is an addition, not a replacement.

- R1 [code] One element has `role="grid"` with an accessible name (from a visible label via `aria-labelledby`
  in the same shadow root, not from a property). Rows are `role="row"` inside `role="rowgroup"`; cells are
  `role="gridcell"`; header cells `role="columnheader"`.
- R2 [code] The host does not use `delegatesFocus` (standards: it collapses roving focus on a composite).
- R3 [test] Under virtualization: the grid carries `aria-rowcount` = total data rows + header rows (or `-1` only
  while the total is unknown). Every rendered row carries a 1-based `aria-rowindex`, header row = 1, so the first
  data row is 2. Indices are the logical row number, not the DOM position. Assert after scrolling to row ~1000
  that the rendered rows read e.g. 1001..1040, with no gaps or duplicates.
- R4 [test] If columns are virtualized or hidden, `aria-colcount` on the grid and `aria-colindex` on every cell and
  header, 1-based, logical. If all columns are always rendered, leave both off (not required, less to get wrong).
- R5 [code] Header association is structural: header cells are in a `role="row"` in the same grid, in the same
  column positions. No `headers` attribute or cross-shadow IDREF. One column per row is a `role="rowheader"` if
  there is a natural row label (donor name or batch line number), so a cell reads with its row context.
- R6 [code] Sortable headers carry `aria-sort` on the sorted column only; the sort control is a real button.
- R7 [test] **Pinned columns do not split a row.** Each logical row is one `role="row"` with all its cells in
  visual order. Pin with `position: sticky` and `inset-inline-start`, not a second DOM tree for the pinned part
  and not CSS grid placement or `order` (standards: focus order follows the DOM). Assert that the cells of a
  row, read in DOM order, match their `aria-colindex` order and their on-screen order.
- R8 [test] The row holding focus is never recycled or removed while scrolled out of view. A cell mid-edit keeps
  focus, caret position and typed text through a scroll of several thousand rows and back. (This is the one
  litgrid fails today.) Assert `document.activeElement` (through shadow roots) and the input value before and
  after.

## 2. What has focus, and how the mode change is heard

**Real (roving) focus only. No `aria-activedescendant` for cell movement.** The one allowed exception is inside a
lookup cell's combobox (section 4), where it points at listbox options and DOM focus stays on the input. That is
the combobox pattern, not the mixed model the litgrid review flagged.

**Navigation mode**

- F1 [test] The focused cell element itself has DOM focus and `tabindex="0"`; every other cell has `tabindex="-1"`.
  Exactly one `tabindex="0"` in the grid at any time.
- F2 [code] The cell's name is its content (value text). Read-only cells carry `aria-readonly="true"`; required
  cells carry `aria-required="true"`.
- F3 [test] Tabbing into the grid lands on a defined cell. Say which and test it: the first editable cell of the
  first row, or the last active cell. (For data entry, the last active cell is likely better.)

**Edit mode**

- F4 [test] F2 or Enter moves DOM focus into the cell's input. Typing a printable character in navigation mode
  starts editing with that character (decide, and test, since DSG types all day).
- F5 [code] The input's name is the column header plus the row label (`aria-labelledby="<header-id> <rowheader-id>"`,
  both in the same shadow root). Not just "edit text".
- F6 [test] Escape restores the original value and returns focus to the same cell. Enter commits and returns focus
  to the cell (or moves down; state which). Tab in edit mode commits and moves to the next cell (state whether the
  next cell opens in edit mode).
- F7 [test] An invalid value never holds focus hostage: either commit it marked invalid and let Tab move on, or keep
  focus but keep Escape working as the way out. Never both blocking Tab and blocking Escape.

**How start and stop of editing are conveyed: by focus, not the announcer.** Moving focus from the cell to the
input makes the screen reader speak the input's role and name, which is "editing started". Moving focus back
makes it speak the cell and its new value, which is "editing stopped". This works in every screen reader without
timing, does not compete with the next keystroke, and keeps the announcer for errors as the brief wants.

- F8 [code] No `announce()` call on cell move, edit start, edit stop or successful commit.
- F9 [code] Do not change a cell's name and its state signal in the same moment (standards rule), and do not put
  the mode into `aria-description` on the cell (it gets re-read on every move and becomes noise).
- F10 [human] Confirm with NVDA + Firefox, JAWS + Chrome and VoiceOver + Safari that edit start and stop are heard.
  This is a human-session item and must be recorded as not done until a person does it.

## 3. The Tab-wraps model against WCAG 2.2

**Verdict: acceptable, with mitigations.** WCAG does not require the ARIA grid keyboard pattern; it requires that
everything works from the keyboard and that nothing traps focus. The model meets that if the exits below hold.

- K1 [test] 2.1.1: every cell, header control and row action is reachable and operable by keyboard. Arrows move
  one cell (no wrap at row ends), Home/End go to row start/end, Ctrl+Home/End to the first/last cell, Page Up/Down
  move a page. Arrows reach read-only cells even if Tab skips them.
- K2 [test] 2.1.2 no trap: Tab on the last cell of the last row leaves the grid to the next focusable thing on the
  page. Shift+Tab on the first cell leaves backward. Assert both, including when the last row is not rendered when
  Tab starts (virtualization).
- K3 [test] **A way out mid-grid.** With thousands of rows, "Tab until the end" is not a trap on paper, but it is
  in practice. Provide both:
  - a "Skip past grid" link before the grid (visible on focus) that moves focus to the element after it, and
  - one documented key in navigation mode that leaves the grid forward (pick one and check it against jqGrid and
    against screen-reader keys; do not use Ctrl+Tab, which the browser owns, or Escape if the grid can sit in a
    dialog, since Escape belongs to `dismissible-stack` there).
- K4 [code] Key help: the keys are written in the component docs, and a short visible hint near the grid is tied
  to it with `aria-describedby` (same shadow root) so it is heard once on entry, not on every cell.
- K5 [test] 2.4.3 focus order: Tab order matches reading order: left to right then next row in LTR, right to left
  in RTL, pinned columns in their logical place (pinned-start cells first). Comes for free if R7 holds.
- K6 [test] 2.4.7 focus visible: the focused cell and the focused input both show an `outline` ring (not
  `box-shadow` alone; forced colors), drawn inset or with room so cell overflow and neighbour cells do not clip
  it. Contrast of the ring is a resolved pair per theme (`cru`, `fl`, `default`) and scheme, against the cell
  background in each row state (default, active row, invalid row), alpha composited. **Note:** the shared focus
  colour is already in the Known gaps table ("Single-tone focus indicator", e.g. 1.47:1 on `cru` light), so the
  grid inherits that gap until it closes. Name it, do not re-solve it inside the grid.
- K7 [test] 2.4.11 focus not obscured: after any move (Tab, arrows, Page Up, edit commit), the focused cell's box is
  not entirely covered by the sticky header or the pinned columns. Scrolling uses the shared `scroll.ts` helper
  with an offset equal to header height and pinned width. Assert with `getBoundingClientRect` overlap, scrolled to
  the top edge and to the start edge.
- K8 [code] 3.2.1 / 3.2.2: focus on a cell changes nothing. Commit and row save do not move focus or change page.
  If a row auto-saves on leaving it, that is documented, and failures are reported (section 5), not silent.
- K9 [test] Reduced motion: no smooth scroll under `prefers-reduced-motion: reduce`.
- K10 [code] 2.5.7 dragging: column resize and reorder (saved layouts) each have a keyboard and single-pointer
  alternative (menu or buttons). 2.5.8: row action buttons are at least 24x24 CSS px or meet the spacing exception.
- Reflow (1.4.10) does not apply: data tables are an allowed exception for two-way scrolling.

## 4. Lookup cells (combobox inside a cell)

- L1 [code] In edit mode the input has `role="combobox"`, `aria-expanded`, `aria-controls` pointing to a
  `role="listbox"` in the same shadow root, and `aria-autocomplete="list"`. The highlighted option is shown with
  `aria-activedescendant` on the input; DOM focus never leaves the input while the list is open.
- L2 [test] Typing filters the list. Down opens or moves, Up moves, Enter picks the highlighted option and commits
  the cell, Tab commits the highlighted or typed value (state which) and moves on.
- L3 [test] Escape order: first Escape closes the list and keeps the typed text; second Escape cancels the edit and
  returns focus to the cell. The popup registers with `dismissible-stack`.
- L4 [test] The listbox is not clipped by the grid's overflow and not hidden under the sticky header (top layer or
  popover). Highlighted option is not shown by colour alone.
- L5 [code] "No matches" is visible in the listbox as text. Whether it is also announced is a decision for the
  brief: it is not an error, so by the brief's rule the announcer stays quiet. My view: leave it quiet; the empty
  list plus `aria-expanded` is enough to start, and a human session (F10) tells us if it is not.
- L6 [code] A value that must come from the list but does not is an invalid cell (section 5), not a silently
  dropped value.

## 5. Errors and row status

- E1 [code] An invalid cell has `aria-invalid="true"` on the gridcell and on its input when editing, an error
  message tied by `aria-describedby` (same shadow root), and a non-colour signal (icon plus text, or text).
- E2 [code] Each row has a status cell with text (Saved, Saving, Not saved, Error) and an icon. Status is never
  colour alone; the active row is never shown by colour alone.
- E3 [code] Announcer use, per the convention that content injected after an action asserts:
  - failed save of a row: `announce(..., 'assertive')`, naming the row ("Row 214 not saved: ...").
  - validation error on commit: `announce(..., 'assertive')` once, short; the description on the cell (E1) carries
    it after that.
  - submit: failure assertive, with a count ("3 rows have errors"), and focus goes to the first error cell or an
    error summary. Success polite.
  - nothing else. No announcements for moves, edit start/stop, saving, or saved.
- E4 [test] Test the announcer calls by spying on `announce` for each case above, and assert no call on 50 cell
  moves.
- E5 [human] Whether an assertive error interrupts at a useful moment during fast Tab entry. Record as not done.

## 6. RTL

- T1 [test] With `dir="rtl"` on an ancestor: Tab order still follows logical order (which runs right to left on
  screen). ArrowRight moves to the previous logical column, ArrowLeft to the next. Home/End stay logical.
- T2 [test] Pinned-start columns pin to the right edge (`inset-inline-start`), header and cells line up, and K7
  still holds with the pinned block on the right. The scroll helper handles RTL `scrollLeft` (negative in current
  engines).
- T3 [code] `aria-colindex` stays logical, not visual.

## 7. Tests the real component would ship (not required of a throwaway spike)

- axe `to.be.accessible()` in both fixture types (client and SSR-hydrated), with no SSR early return, run three
  times: navigation mode, edit mode, and a lookup open. axe sees only the DOM that is open.
- `a11ySnapshot` pins the cell name and the input name in both fixture types.
- An RTL fixture and a virtualized fixture of at least 5000 rows.

---

## AG Grid Community: what it gives and what an app must check itself

From the AG Grid docs (v36.3 accessibility and keyboard-navigation pages, read 2026-11-12) plus what is not in them:

- Roles: `grid` (or `treegrid` with grouping, tree data or master/detail), with `aria-rowcount`, `aria-rowindex`,
  `aria-colcount` and `aria-colindex`. Real DOM focus on cells, as far as the docs' code shows.
- Virtualization: the docs themselves say counts and indices can be unreliable with row and column virtualization,
  and suggest pagination or turning virtualization off, plus `ensureDomOrder: true` (animations off) so DOM order
  matches visual order. Turning off row virtualization at thousands of rows costs speed, so that tradeoff lands on
  the app.
- Keyboard: Tab moves cell to cell into the next row. `tabToNextCell` can change that; returning `false` hands Tab
  back to the browser, which is how an app would build a mid-grid exit. What Tab does at the very last cell by
  default is not stated; it must be tested.
- Editing: F2 or Enter starts, Escape cancels. Popup editors render in a separate DOM tree.
- Known limits they list: a state change on a focused cell may not be announced until focus moves away and back;
  grouped column headers can be read wrongly. Tested with JAWS and VoiceOver only. No WCAG conformance claim.
- RTL exists as a separate feature (`enableRtl`, from memory, not re-checked).
- Some keyboard features in their examples (clipboard, range select, column menu) import Enterprise modules.

**What each consuming app would own** (none of it covered by Cornerstone's axe floor or gap register, because it is
not a `cs-*` component):

- Configuring the Tab-wraps model and the exit keys (K2, K3) through `tabToNextCell` and testing them.
- The virtualization settings and the honesty of row counts (R3).
- Every custom cell editor, including the lookup combobox (section 4), which AG Grid does not supply in Community.
- Focus ring and state colours in the Cornerstone theme, as resolved pairs per brand and scheme (K6).
- Sticky header and pinned column obscuring (K7), error and row-status text (section 5), announcer use.
- Its own screen-reader checks, since AG Grid tells apps to test and pick a screen reader to recommend.

That ownership split is an accessibility cost of the adopt path: the same review repeats in every app, and nothing
in this repo would record it.

---

## Points where the brief and repo rules touch

No conflict found. Three things to keep in view:

1. Brief wants edit start/stop heard, and the announcer limited to errors. Both are met by focus moves (section 2).
2. Standards forbid moving focus order with CSS grid placement or `order`. That rules out the common pinned-column
   trick of a separate container (R7).
3. The cell focus ring inherits the open "Single-tone focus indicator" gap. If the grid ships before it closes, the
   gap register row should name `cs-data-grid`.
