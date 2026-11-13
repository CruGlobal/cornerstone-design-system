# UIUX-340 spike finding: build `cs-data-grid` or adopt AG Grid Community

Answers decision #359. Spike run Nov 12, 2026. Prototype is in this folder (throwaway, not shipped).
Detailed evidence is in `evidence/`.

## Short answer

Both options can meet the must-haves. The spike removed the two big risks of building: an editor that loses its
focus and text on scroll, and Tab wrapping across thousands of virtual rows. Both work and are tested. AG Grid
Community also passes those two in a hands-on test, so it is a real option, not a fallback in name only.

**Recommendation: build `cs-data-grid`**, about 9.5 weeks for one developer. Keep AG Grid Community as the
fallback, about 5 weeks, if the date matters more than owning the component. The reasons are below.

## Must-haves, side by side

"Proto" is our prototype. "AG Grid" is Community 36.3.0 (MIT), from its docs, its source and a hands-on test in
Chromium inside a shadow root with 5,000 rows.

| Must-have | Proto | AG Grid Community |
|---|---|---|
| Tab moves cell to cell, wraps rows, leaves after the last cell | **Pass.** Tested both ends, incl. a last row drawn only because it is active. | **Pass.** Default behavior, seen hands-on. Wraps onto read-only cells unless `tabToNextCell` skips them. |
| Edited cell keeps focus and text while the grid scrolls | **Pass.** Same input, focus, text and caret kept after a jump to row ~2,500 and back. Breaking the fix makes 8 of 27 tests fail. | **Pass.** Hands-on: scrolled ~1,900 rows away, kept typing, value kept and committed. |
| Lookup cells filter as you type | **Pass (spike level).** Combobox in the top layer, Escape closes list then cancels edit. Axe flags the "No matches" text as critical (a merge blocker, small fix). | **Partial.** Filtering editor (Rich Select) is Enterprise. We would write the same combobox as a custom editor. |
| Screen readers hear the cell and edit start / stop | **Partial.** Carried by real focus moving into the input and back, checked in Chromium's accessibility tree. No one has listened with a screen reader. | **Partial.** Good grid roles. Edit start / stop not announced. Its own docs list screen reader problems under row virtualization. No WCAG claim. |
| Themed from Cornerstone tokens, no clashes | **Pass in Chromium.** Light, dark, FamilyLife. Text contrast passes in all four combinations. | **Pass.** `themeQuartz.withParams` takes `var(--cs-*)`. A hostile page `input` rule did not leak into the shadow root. |
| Pinned columns, column order, save / restore layouts | **Pass.** Sticky pins keep one row in reading order. `layout` JSON getter / setter repairs stale layouts. | **Pass.** `pinned`, column state and grid state APIs are all Community. |

## The extra checks

- **Shared `scrollIntoView`** (`src/internal/scroll.ts`) scrolls instantly and works in RTL, but leaves the
  focused cell fully hidden under the sticky header (44px of a 43px cell) and pinned columns (177px of 176px), and
  can stop a cell behind the scrollbar. The spike's `scroll-cell-into-view.ts` adds insets and gets 0px hidden in
  LTR and RTL. Moving that into `scroll.ts` is its own small PR.
- **Announcer** stays quiet across 50 moves and edits. It speaks for a validation error, a failed save and a
  failed submit (assertive), and a successful submit (polite). Pass.
- **Active row stays drawn** after scrolling 5,000 rows away. Shift+Tab back in lands on the same cell. Pass.
  AG Grid does the same.
- **Performance:** 5k and 10k rows render in 14 to 15ms (34 to 58ms at 4x CPU slowdown), no scroll frame over
  33ms, about 24 rows in the DOM, about 3MB heap.

## Accessibility review (Esther, during the spike)

Nothing blocks choosing to build. Two defects block merging a real build, because both fail axe and the
"keyboard reachable" line of the accessibility floor (D-1 and L5 in `evidence/esther-review.md`):

- **No tab stop while editing (D-1).** The editor has `tabindex="-1"` and no cell holds `0`, so if focus leaves
  mid-edit, Tab cannot get back into a cell. Axe reports `scrollable-region-focusable` in edit mode. One-line fix.
  Confirmed.
- **"No matches" inside the lookup list (L5).** The text is a plain `div` inside `role="listbox"`, which axe rates
  critical.

Also short of the criteria, all ordinary build work: Delete on a filled required cell marks it invalid while it
still shows the value (D-2), the failed-save reason only in a tooltip (E2), a weak row label like "Amount 2" (F5), the
grid label from an attribute instead of a slot (R1), and Alt+End as a placeholder exit key that does nothing while
editing and misses `cs-*` hosts when looking for the next focus target. The focus ring inherits the existing
contrast gap (1.47:1 on Cru light, worse on the active-row tint), which hits AG Grid themed with our tokens the same
way. If the grid ships before that gap closes, the known gaps record must name it.

For AG Grid, the hands-on test shows behavior, not accessibility. Its live region would sit inside our shadow root,
the JAWS plus Firefox case our announcer exists to avoid. Each app adopting it would repeat these checks, and our
test suite and conformance record would never see them.

## Keys compared with jqGrid and Siebel

Full table in `evidence/aggrid-jqgrid.md`. The proposed map and AG Grid's defaults almost match. Where DSG muscle
memory will clash:

- Tab now wraps to the next row. jqGrid cell edit stops at the row end.
- jqGrid skips read-only cells on Tab. We have not decided whether to.
- F2 opens a pick list in Siebel but starts an edit in ours. Enter drills into a record in Siebel but edits in ours.
- Escape in jqGrid row edit and Siebel undoes the whole row, not one cell.
- Typing on a focused cell now overwrites it.
- The grid must not swallow Siebel's Ctrl shortcuts (Ctrl+S, Ctrl+N, Ctrl+D).

Watching a DSG user is the only way to know which jqGrid options their Siebel setup turns on.

## Why build

1. **The risks it was going to carry are gone.** Focus survival and Tab wrapping work and are tested.
2. **Accessibility lives in one place.** A `cs-*` grid goes through our axe suite, Esther's review and the
   conformance record once. AG Grid's goes through each app, and its own docs admit gaps under virtualization.
3. **AG Grid's free tier has a ceiling DSG may hit.** The filtering lookup, multi-cell paste and range selection
   are Enterprise. We would write the lookup either way.
4. **It fits Cornerstone.** Tokens, events, RTL and brands work the way every other `cs-*` component does. AG Grid
   adds about 300KB+ gzipped and a second theming system, and its majors ship breaking changes we would track.

**Why AG Grid could still win:** it is about 4 weeks sooner, and its core behaviors are already proven by a big
user base. If DSG needs the grid before a 10-week build lands, adopt it behind a thin wrapper.

## Effort

**Build, about 9.5 weeks (8 to 10):** API and scaffold 1, keyboard and editing hardening (IME, paste, undo,
read-only skipping, add-row) 1.5, virtualization hardening 1, lookup cell 1, columns (resize, hide) 1, validation
and save contract 1, `scroll.ts` insets 0.5, accessibility to the floor incl. a human screen reader session 1.5,
Firefox, WebKit, DSG hardware and docs 1. Breakdown in `evidence/joseph-findings.md`.

**AG Grid, about 5 weeks (4 to 6):** a Lit wrapper and module setup 1, token theme for every brand and scheme 1,
custom combobox lookup editor 1, keyboard preset (skip read-only, exit key, edit-state names) 0.5, accessibility
pass incl. a screen reader session and the shadow-root live region 1, docs 0.5. Plus ongoing upgrade work.
#359 guessed about 2 months; the hands-on test found less work than expected.

## What the spike did not cover

Firefox and WebKit (not installed here), IME input, forced colors, the `default` theme, and any real screen reader.
Those are in both estimates.
