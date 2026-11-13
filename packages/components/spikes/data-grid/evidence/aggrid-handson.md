# AG Grid Community 36.3.0, hands-on check (Nov 12)

Setup: ag-grid-community@36.3.0 UMD from jsdelivr, AllCommunityModule, themeQuartz.withParams with var(--cs-*) values,
grid created inside a custom element's open shadow root (themeStyleContainer: shadowRoot), 5,000 rows, `id` pinned left,
4 editable columns. Real keystrokes in Chromium (built-in browser). Test page: `aggrid-handson.html` in this folder (serve it over http; loads AG Grid from jsdelivr).

| Check | Result |
|---|---|
| Renders and themes inside a shadow root | Pass. Theme CSS injected into the shadow root. |
| Page CSS clash (`input { border: 3px solid red !important }` on the page) | No leak into the shadowed grid. |
| Editor keeps focus and text while scrolled away | Pass. Edited row 0, scrolled to row ~1,894. Input still connected and focused, typed " more" while away, value kept. Row 0 stayed in the DOM. |
| Commit on Tab | Pass. Tab committed "Donor 1Typed mid scroll more" and opened the next cell's editor. |
| Tab at row end (not editing) | Wraps to the next row's first cell, which is the read-only pinned `id`. Needs `tabToNextCell` to skip read-only cells. |
| Tab at the very last cell | Focus leaves the grid to the next page element. |
| Shift+Tab back in, after scrolling the grid to the top | Lands on the last focused cell (4999:note) and scrolls it into view. |
| aria-rowcount | 5001 (rows + header row). |
| cellEditingStarted / Stopped events | Fire for each cell (usable for our own edit-mode messages if wanted). |
