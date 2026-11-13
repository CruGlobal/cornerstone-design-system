# UIUX-340 / #359: accessibility review of the data-grid spike

Reviewer: Esther. Date: 2026-11-12. Reviewed: commit `9a15ed8`, `packages/components/spikes/data-grid/`, against
`esther-criteria.md`. Also reviewed: `joseph-findings.md` and `aggrid-handson.md`.

## What I did, and what I did not

- I read `data-grid.ts`, `grid-keyboard-controller.ts`, `grid-navigation.ts`, `scroll-cell-into-view.ts`,
  `data-grid.styles.ts` and the test list.
- I ran Joseph's suite: `node --test spikes/data-grid/test/*.test.mjs`, which gave 27 pass and 0 fail (Chromium).
- I wrote my own probe, outside the repo, and ran it in Chromium against the same demo. It does three things:
  - reads Chromium's accessibility tree,
  - runs axe-core (WCAG 2.0 to 2.2 A/AA plus best-practice) in four states: navigation, editing, lookup open, and
    lookup with no matches, plus the error state,
  - computes contrast pairs per brand and scheme, with each colour composited through a canvas first.

  The probe is at
  `/private/tmp/claude-502/-Users-joannacatanus-Cornerstone-cornerstone-design-system--claude-worktrees-vibrant-shamir-391253/bba34eaf-f54e-4f1d-a08e-17e6292fca77/scratchpad/esther/probe.mjs`.
- **Not done by me:**
  - Firefox and WebKit (not installed here).
  - The opt-in `default` theme (the demo has no switch for it).
  - Forced colours.
  - IME input.
  - Any screen reader session. Nobody has listened to this grid with NVDA, JAWS or VoiceOver, and nobody who relies
    on assistive technology has used it. Every "met" below rests on code, the Chromium tree and computation.

## Two defects Joseph's summary does not mention

**D-1. While a cell is being edited, nothing in the grid is in the tab order. Severity: blocker for the build, quick
to fix.** `renderCell` sets the cell to `tabindex="-1"` when `isEditing`, and `renderEditor` gives the input
`tabindex="-1"`. Focus is normally in the input, so the keyboard path works. But if focus leaves while an invalid
draft is open, the grid has no tab stop. `handleFocusOut` keeps that draft open on purpose. Focus can leave through a
pointer click outside, or a screen reader moving focus.

Evidence from the probe:

| Check | Result |
| --- | --- |
| Type `abc` in Amount, Tab (rejected, stays), click Submit | `[tabindex="0"]` count in the grid is 0 |
| Then Shift+Tab from Submit | Focus lands on the `role="grid"` scroller itself, not a cell |
| Same setup, focus moved out by script | count is 0 |
| axe in edit mode, lookup open, error state | `scrollable-region-focusable` (serious) on `.data-grid__scroller` every time |

Chromium only rescues this because it makes a scroller with no focusable content focusable. WebKit does not do that
as far as I know (not checked here), so there the grid may be skipped entirely.

What would make it pass: give the editor `tabindex="0"` while editing, or keep the active cell at `tabindex="0"`. Then
assert in a test that the grid has exactly one tab stop in every mode, and that axe is clean in edit mode.

**D-2. Delete on a filled required cell marks the cell invalid while it still shows a valid value. Severity: ordinary
fix.** `clearCell` sets up a fake edit and calls `commitEdit`. That writes the "required" error to `cellErrors`.
`clearCell` then drops the edit without removing the error.

Probe on row 1, Amount `10.00`, after pressing Delete:

- The cell still reads `10.00`.
- It now has `aria-invalid="true"` and the description "Amount is required."
- The status cell reads "Error".
- An assertive announcement was made.

A screen reader user hears a valid number described as missing. What would make it pass: a refused clear leaves no
error state behind. Announce the refusal if you want to, but do not mark the cell.

## Criteria, item by item

Key: **Met**, **Partly met**, **Not met**, **N/A**. Evidence is mine unless it says "Joseph's test".

### Roles and structure

| # | Status | Evidence |
| - | --- | --- |
| R1 | Partly met | The tree shows grid "Quick entry batch 4471" with description = the key hint, so the name comes from a rendered element in the same shadow root. Gap: the text comes from the `label` attribute, not a slot, and an empty `label` gives an unnamed grid. Ordinary build work. |
| R2 | Met | No `delegatesFocus`. |
| R3 | Met | `aria-rowcount` = rows + 1 and `aria-rowindex` = index + 2 in code. Joseph's tests check that indices stay logical and contiguous after scrolling. |
| R4 | Met | All columns are always drawn, so `aria-colcount` and `aria-colindex` are rightly left off. Revisit if columns get virtualized or hidden. |
| R5 | Partly met | Header row sits in the same grid, and Line is the `rowheader`. The structure is right, but the row label is weak (see F5). |
| R6 | N/A | No sorting yet. Headers must become reachable and use `aria-sort` when it lands. |
| R7 | Met | One `role="row"` per row, `position: sticky` with `inset-inline-start`, no grid placement or `order`. Joseph's tests cover LTR and RTL. |
| R8 | Met | `getRenderedRows` always keeps the active row, sorted. Joseph's test keeps the same `<input>`, focus, text and caret through a 2,500-row jump. |

### Focus and mode change

| # | Status | Evidence |
| - | --- | --- |
| F1 | **Partly met** | One `tabindex="0"` in navigation mode, yes. In edit mode there are zero, so D-1 applies. |
| F2 | Met | Tree: gridcell "47.00". Read-only cells expose readonly, and the failed status cell reads "Not saved". |
| F3 | Met | Joseph's test: Tab in lands on the last active cell. |
| F4 | Met | Enter, F2 and typing all start editing. Dead keys and IME are untested (Joseph flags it). |
| F5 | Partly met | Input name is "Amount 2", and the lookup's is "Designation 2". It is computed from header + row header, which is correct, but "2" alone is a poor row label. Use "Line 2" as the row header text, or a donor-based row header. |
| F6 | Met | Escape restores and refocuses the cell (tree goes back to gridcell "47.00"). Enter commits and stays. Tab commits and moves. |
| F7 | Met inside the grid | An invalid value keeps focus and Escape always cancels. The way out works, but see D-1 for what happens when focus leaves another way. |
| F8 | Met | Joseph's test: no announcement over 50 moves plus edit and commit. |
| F9 | Met | No mode text on the cell. The edit cue is the input's description "Editing. Enter saves, Escape cancels.", which is heard once when editing starts. That is the focus-based approach I asked for. |
| F10 | Not done | Needs a person at a screen reader. |

### Keyboard and WCAG 2.2

| # | Status | Evidence |
| - | --- | --- |
| K1 | Met for cells | Arrows, Home/End, Ctrl+Home/End and Page Up/Down work. There are no header controls or row actions yet. |
| K2 | Met | Joseph's tests: Tab past the last cell leaves the grid, including an undrawn last row, and Shift+Tab before the first cell leaves backward. |
| K3 | Partly met | "Skip past grid" is visible on focus (99x26 px). Alt+End works in navigation mode. See the Alt+End notes below. |
| K4 | Partly met | Visible hint, tied as the grid's description. No docs page yet. |
| K5 | Met | DOM order equals visual order in LTR and RTL. |
| K6 | **Not met (inherited gap)** | `outline`-based rings, inset, so forced colours have something to draw. Contrast table below: the ring fails 3:1 on Cru light and FamilyLife dark, and the active-row tint makes it worse. |
| K7 | Met with the spike helper | Joseph's measurements: 0 px covered with `scrollCellIntoView`, but fully hidden with the shared `scrollIntoView`. A real build needs the `insets` change to `src/internal/scroll.ts`. |
| K8 | Met | Focus and commit change nothing else. |
| K9 | Met by construction | Always `'auto'` scroll, no animation. Not tested with `expectNoMotion`; there is nothing to test yet. |
| K10 | Partly met | Reorder and pin are buttons, so there is no drag. No resize yet; when it comes it needs a keyboard and single-pointer path. |

**Alt+End as the mid-grid exit key.** Acceptable as a placeholder, with four conditions:

1. Alt+End does nothing in edit mode (probe: focus stays in the input). Either handle it there too (commit or cancel,
   then leave), or document "Escape first".
2. Mac laptop keyboards have no End key, so it becomes Fn+Option+Right. That is hard to find, so the skip link must
   stay.
3. It has not been checked against JAWS, NVDA or VoiceOver keys. That is part of the human session.
4. `focusAfterGrid` searches the light DOM only. A `cs-*` control after the grid is skipped unless its host is
   tabbable, and a grid inside another component's shadow root finds nothing at all.

### Lookup cells

| # | Status | Evidence |
| - | --- | --- |
| L1 | Met | Tree: combobox "Designation 2". `aria-expanded`, `aria-controls`, `aria-autocomplete` and option `aria-activedescendant` all live in one shadow root, and DOM focus stays in the input. |
| L2, L3 | Met | Joseph's tests. Uses `dismissible-stack`, and the first Escape is stopped before the grid's own handler. |
| L4 | Met | Top-layer `popover`. The highlight uses a ">" marker and an outline, not colour alone. |
| L5 | **Not met** | axe **critical** `aria-required-children` on `#lookup-list`: the "No matches" text is a plain `div` inside `role="listbox"`. Fix: put the "No matches" text outside the listbox (for example a sibling linked by `aria-describedby` on the combobox), or hide the empty listbox and set `aria-expanded="false"`. |
| L6 | Met | "Pick a designation from the list." error. |

### Errors and row status

| # | Status | Evidence |
| - | --- | --- |
| E1 | Met | Tree on the invalid editor: description "Editing. Enter saves, Escape cancels. Use the date format YYYY-MM-DD.", invalid=true. The cell carries the same through `aria-describedby`, and the "!" glyph is not colour alone. D-2 is a wrong use of this, not a missing one. |
| E2 | Partly met | Status text plus a glyph. But the reason a save failed lives only in a `title` on the status cell, which a keyboard user cannot reach after the announcement fades. Tree: gridcell "Not saved", no description. Fix: tie the reason with `aria-describedby`, and show it like the cell error message. |
| E3 | Met | One assertive message for validation, save failure and submit failure. Polite for submit success. Nothing else. |
| E4 | Met | Joseph watched the live region rather than spying on `announce`. That is equivalent for the spike. |
| E5 | Not done | Human. |

### RTL

| # | Status | Evidence |
| - | --- | --- |
| T1, T2 | Met | Joseph's tests: arrows swap, pinned columns go to the right edge, and K7 holds in RTL with the spike helper. The row bar flips with `:dir(rtl)`. |
| T3 | N/A | No `aria-colindex`. |

### Section 7 (tests a shipped component would carry)

Not done, by design. My axe run above is a stand-in, not that suite.

## Contrast: resolved pairs, Chromium, composited

Surface for the ring and outlines: the cell background, and the active-row tint (`color-mix` of `brand-fill-quiet`
60% over the cell). Thresholds: 4.5:1 for text (1.4.3), 3:1 for non-text (1.4.11).

| Pair | Cru light | Cru dark | FL light | FL dark |
| --- | --- | --- | --- | --- |
| Body text on cell | 16.86 | 16.31 | 15.01 | 16.59 |
| Body text on active-row tint | 15.77 | 15.26 | 14.05 | 15.60 |
| Read-only (quiet) text on active-row tint | 6.90 | 5.84 | 6.56 | 5.86 |
| Header text on header | 14.68 | 17.24 | 13.29 | 17.53 |
| **Focus ring on cell** | **1.47** | 12.73 | 6.37 | **2.94** |
| **Focus ring on active-row tint** (where the focused cell actually sits) | **1.38** | 11.91 | 5.96 | **2.76** |
| Dashed "active cell" outline on tint | 4.31 | 3.80 | 4.31 | 3.82 |
| **Active-row bar (`brand-border-loud`) on tint** | **1.38** | 11.91 | 5.96 | **2.76** |
| Invalid border (`danger-border-loud`) on cell | 5.20 | 3.60 | 4.60 | 4.07 |
| Error glyph (`danger-on-quiet`) on tint | 6.56 | 5.86 | 6.59 | 5.89 |
| Selected option text on `brand-fill-normal` | 7.58 | 5.81 | 7.65 | 5.84 |
| Error bubble text on `danger-fill-loud` | 5.20 | 5.20 | 8.55 | 8.55 |
| Skip link text on page | 4.61 | 6.18 | 4.58 | 7.13 |
| Cell gridline (`surface-border`) on cell | 1.25 | 1.46 | 1.25 | 1.46 |

Reading it:

- The ring failures match the existing "Single-tone focus indicator" row in Known gaps (1.47 and 2.94 are the
  numbers already there). The grid inherits them and does not cause them.
- **The grid makes them worse:** the active-row tint lowers the ring to 1.38 and 2.76. The fix belongs to the
  library-wide focus-indicator work, not to a grid-only value.
- The row bar uses `brand-border-loud`, which in Cru resolves to the same yellow as the focus colour. So it fails
  exactly where the ring fails. The bar is not the only signal for the active row: the dashed outline passes in all
  four, and the focused cell's ring is there too. So this is a note, not a blocker.
- Gridlines at 1.25 are fine as decoration. They do not identify a state, so 1.4.11 does not apply. Say so in the
  docs.
- Not computed: the `default` theme, the hover states, and the lookup option text on `surface-raised` in each scheme.
  axe left `color-contrast` "needs review" on 1 to 3 nodes, so a green axe run is not a contrast pass here.

## Blocking for the build option, or ordinary build work?

**Nothing here argues against building.** Every gap is something a real build fixes in the normal course of work:

- D-1, D-2, L5, E2, F5, R1 slot, focusAfterGrid shadow search, Alt+End in edit mode: ordinary fixes, small. D-1 and L5
  are blockers for any merge of a real `cs-data-grid`, since both fail axe and the floor's "keyboard reachable"
  line. They are not blockers to choosing "build".
- K6 focus-ring contrast: an existing library-wide gap. It hits AG Grid themed with our tokens just the same, so it
  does not tilt the choice. If the grid ships before that gap closes, the Known gaps row must name `cs-data-grid`,
  and its 1.38 / 2.76 tint pairs go in that row's `contrast` front matter.
- `scroll.ts` insets: needed for 2.4.11, own PR, as Joseph says.
- Screen reader session and cross-engine axe: needed under either option. Under "adopt" it is needed again in every
  app.

## AG Grid hands-on results, from an accessibility view

What the hands-on run supports, all in Chromium:

- The editor keeps focus and text while scrolled away.
- Tab commits and moves on.
- Tab leaves the grid at the last cell.
- Shift+Tab back in lands on the last focused cell.
- `aria-rowcount` = 5001.

So far that is level with the spike on K2, F3, R3 and R8.

What it did not check, all of which matter more than what it did:

- **No accessibility tree, no axe run.** We do not know the editor input's accessible name. If it is unnamed or named
  only by the cell, F5 fails. We also do not know whether `aria-rowindex` stays right under row virtualization; AG
  Grid's own docs warn it may not.
- **Editing tab stop:** whether AG Grid keeps a tabbable element while editing (the same failure as D-1) was not
  tried. Repeat my D-1 steps on it.
- **Live region inside a shadow root.** AG Grid's announcement service creates its own polite live region. With the
  grid inside a shadow root, that region would sit in the shadow root, which is the exact case `live-announcer.ts`
  exists to avoid: its own header says JAWS with Firefox ignores live regions there. AG Grid's validation messages
  could then go unheard. Untested. Check where the region lands, and plan to route errors through our announcer.
- **Mid-grid exit:** AG Grid has none by default. It needs `tabToNextCell` plus a skip link, built by us or by each
  app.
- **Tab into the grid:** it goes to the first column header by default, not a cell, which adds a stop for every entry
  into the grid.
- **Tab wrap lands on the read-only pinned `id`.** That is not an accessibility failure, but it slows every row and
  needs `tabToNextCell`.
- **2.4.11 with the pinned `id` column and sticky header:** not measured. Joseph's table is the method to use.
- **Lookup:** in Community it is a custom editor we write ourselves, so every lookup criterion (L1 to L6) is our code
  either way. AG Grid saves nothing there.
- **Contrast:** `themeQuartz.withParams` with `var(--cs-*)` gives the same token pairs, so the same K6 gap applies, and
  also AG Grid's own focus and selection colours, which we have not computed.
- **RTL (`enableRtl`):** not tried.

My read: the AG Grid hands-on shows it can do what we asked in Chromium. It does not yet show that it does it
accessibly, and some items are unknown rather than failed. With "adopt", these checks become per-app work that our
axe suite and gap register never see. With "build", they are work we do once, in one place, under the gate.
