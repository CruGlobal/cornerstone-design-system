# Can `cs-tree-item` and `cs-dropdown-item` be links?

- **Ticket:** [#179](https://github.com/CruGlobal/cornerstone-design-system/issues/179), on map
  [#224](https://github.com/CruGlobal/cornerstone-design-system/issues/224) (every Flightdeck port gap answered before
  1.0.0).
- **Researched:** 2026-10-09 by Joseph (component APIs), against `main` at `fe140b8`.
- **Status:** recommendation. Waiting on accessibility review by Esther, and on
  [#230](https://github.com/CruGlobal/cornerstone-design-system/issues/230) for `aria-current`.
- **Harness:** [`item-links/harness.test.ts`](item-links/harness.test.ts), 24 tests run on Chromium, Firefox and
  WebKit, giving the 34 numbered checks in evidence B. Every behavior claim that cites a check number comes from it.
  How to re-run it is in the file's header.

## The question

Neither item can be a link today. So Flightdeck's port could not use `cs-tree` as a navigation tree, and every
dropdown item that goes somewhere needs a JavaScript handler. That handler loses middle-click, open in a new tab, and
the link's address preview in the status bar.

The ticket names three shapes:

1. An `href` (plus `target`, `rel`, `download`) that renders an inner `<a>`, the way `cs-button` does.
2. A slotted `<a>`, documented as the pattern.
3. No for `cs-tree`, with a navigation pattern to use instead, and `href` for dropdown items only.

Research found a fourth: Web Awesome added `href` to `wa-dropdown-item` in 3.12.0, after our 3.11.0 fork, with a
hidden link and a synthetic click.

## Recommendation

| Component | Answer | Bump | Before 1.0.0? |
| --- | --- | --- | --- |
| `cs-dropdown-item` | **Yes.** Add `href`, `target`, `rel` and `download`. A link item renders a real `<a href role="menuitem">` in its shadow root, and that `<a>` takes focus. The host drops its role. | minor (additive) | No. It can land after. |
| `cs-tree-item` | **No.** A tree here is a selection widget. Navigation with nested groups uses disclosure navigation: `<nav>`, `cs-details` with a text summary, and plain `<a>` links with `aria-current="page"`. | patch (docs only) | No. |
| Slotted `<a>` in either item | **Unsupported.** Document it as such on both pages. | patch (docs only) | No. |
| `aria-current` | No new property from this ticket. A link item needs #230's rule to get `aria-current` from the host to the inner `<a>`. | #230's call | #230's call |

For `cs-dropdown-item`, this is the shape APG, Primer, Material Web, Angular Material and React Aria all use:
`role="menuitem"` on the `<a>` itself (evidence C and E). It is the only shape tested that gives back all four things the ticket says are lost
(evidence B).

## Recommended API in detail

### `cs-dropdown-item`

New properties, with the same names, types and wording as `cs-button`
(`packages/components/src/components/button/button.ts:108-118`):

| Property | Type | Notes |
| --- | --- | --- |
| `href` | `string` | When set, the item is a link. Reflects, like `cs-button`'s. |
| `target` | `'_blank' \| '_parent' \| '_self' \| '_top'` | Only used with `href`. |
| `rel` | `string` | Only used with `href`. No default, matching `cs-button`. (`cs-breadcrumb-item` defaults to `noreferrer noopener` at `breadcrumb-item.ts:45`, which is a separate inconsistency.) |
| `download` | `string` | Only used with `href`. |

New surface that comes with it: a `link` part on the `<a>`, and a `link` custom state (`:state(link)`), matching
`cs-button`'s state (`button.ts:45`) and upstream's.

How a link item behaves:

1. **`href` is ignored when the item has a submenu or `type="checkbox"`.** A submenu item opens its submenu, which is
   upstream's rule too. A checkbox item toggles. One item does one thing. Upstream does not exclude checkbox items, so
   there a checkbox item with `href` would both toggle and navigate.
2. **The role moves to the `<a>`.** The host has no role, and the `<a>` carries `role="menuitem"`. A link item is still
   announced as a menu item, not a link. The JSDoc and the docs page say to write labels that make the destination
   clear, as upstream's docs do.
3. **Enter is the native link's.** The browser follows the link, honoring Cmd, Ctrl and Shift. The native click then
   bubbles to the menu's click handler, which fires `cs-select` and closes the menu.
4. **`cs-select` still fires and can be cancelled.** Calling `preventDefault()` on it cancels the navigation along with
   the close, by cancelling the click that is still being dispatched. Apps that route their own way keep that option.
5. **Space** activates the item by calling `click()` on the `<a>`, so a link item matches every other item. A native
   link ignores Space, and APG lists Space as optional on a menu item. This is open question 2.
6. **Disabled** removes `href` from the rendered `<a>` and sets `aria-disabled`, so middle-click cannot open a disabled
   item. `cs-pagination` already does this (`pagination.ts:363`). `cs-button` keeps `href` when disabled
   (`button.ts:304, 309`), which is also inconsistent.

Implementation notes for the Jira task. All of these are internal, with no public surface:

- `dropdown.ts:457-459` calls `preventDefault()` on Enter at the document level. The harness shows this blocks a
  focused link in all three engines (check 24). Link items must be exempt.
- The host currently carries everything that belongs to the menu item: `role` (`dropdown-item.ts:133-141`), the roving
  `tabindex` (`:108, :115`), `aria-disabled` (`:128-131`), and `aria-posinset`/`aria-setsize`, which the dropdown
  writes (`dropdown.ts:526-527`). For a link item all of them belong on the `<a>`.
- Focus: give the item a `focus()` override that targets the `<a>`, as `cs-button` does (`button.ts:276-278`). The
  harness prototype used `delegatesFocus`, and it worked. But `delegatesFocus` applies to the whole class, and a
  submenu item's first focusable shadow element is the submenu container, which has `tabindex="-1"`
  (`dropdown-item.ts:326-334`). `dropdown.ts`'s `activeElements()` lookup already walks into shadow roots, so it still
  finds the item while its `<a>` has focus.
- Styles: the host's flex layout and padding (`dropdown-item.styles.ts:4-13`) and its focus ring
  (`:host(:focus-visible)`, `:29-31`) move to the `<a>` for link items. The `<a>` also needs `color: inherit` and no
  underline. Firefox's axe run flags `color-contrast` when page link color reaches a menu (check 6).
- With Turbo: Turbo 8.0.23 finds the clicked link through `event.composedPath()[0]`, walking out of shadow roots
  (`@hotwired/turbo/dist/turbo.es2017-esm.js:412-418, 1675-1678`), and listens for the bubbling click on the
  document. A native click from the inner `<a>` is composed and bubbles, so Turbo Drive should take it as a visit.
  That comes from reading the code, not from a test.

### `cs-tree` and `cs-tree-item`

No API change. Documentation changes (Anna's):

- On the Tree page, say a tree is for picking things in a hierarchy (files, categories), not for site navigation, and
  link to the navigation pattern below. Both tree pages are filed under `category: Navigation` (`tree.md:3`,
  `tree-item.md:3`), which invites the use the port tried. Whether to move them is Anna's call.
- Say not to slot links into tree items (evidence B, checks 9-14).

The pattern to point to is disclosure navigation, which APG recommends for "typical site navigation with expandable
groups of links" (evidence C):

```html
<nav slot="navigation" aria-label="Projects">
  <cs-details appearance="plain" summary="Project one" open>
    <a href="/p/1/overview" aria-current="page">Overview</a>
    <a href="/p/1/work">Work items</a>
  </cs-details>
</nav>
```

One condition, proved by the harness (checks 33-34): **the summary names the group and holds no link or button.**
`cs-details` renders its summary as `<summary role="button">` (`details.ts:300-306`), so a link or button inside it is
a nested interactive control. axe flags `nested-interactive` in all three engines. When a group's name must also be a
link, APG's "Disclosure Navigation Menu with Top-Level Links" puts "a top-level link and an associated disclosure
button" side by side. `cs-details` cannot express that today (open question 6).

If `href` on `cs-tree-item` is ever asked for again, for a file browser that navigates, it is additive and can come
later. The harness sets three limits on it:

- The role has to stay on the host. Moving `treeitem` to an inner `<a>` makes WebKit drop the tree completely (check
  25).
- With the role on the host, the link sits inside the tree item, and Enter needs JavaScript to follow it (checks 17-19).
- It needs a mode with no selection. APG's navigation tree has no `aria-selected`, but `cs-tree-item` writes
  `aria-selected` on every item (`tree-item.ts:268-272`), and `selection` has no "none" value (`tree.ts:89`).

## Current page (`aria-current`) and the dependency on #230

- **Today**, Flightdeck writes `aria-current="true"` on the `cs-dropdown-item` host in its workspace switcher
  (`flightdeck-cornerstone-port/app/views/shared/_workspace_switcher_item.html.erb`). That works because the host *is*
  the menu item.
- **With the recommended shape**, a link item's menu item is the inner `<a>`. An `aria-current` on the host would no
  longer be on the element that owns the role. This is the same split #230 describes for `cs-button`.
- **What #179 needs from #230:** a rule that moves `aria-current` from the host to the inner `<a>` on link items, keeps
  the token value as it is (`page` for a nav menu, `true` for a switcher), and leaves it on the host for other items,
  where the host is still the menu item. If #230 picks component properties instead of forwarding, the property has to
  take the token, not a boolean.
- If #230 lands on "no" or "wait for the platform", link items would have no way to mark the current page. Then the
  choice is a `current` property here, or upstream's shape (rejected below), which keeps the role on the host.
- **A state, not just a color:** Flightdeck shows the current item in bold through its own CSS on `[aria-current]`.
  Whether the component should style current items itself is a follow-up, not decided here.
- **For #230's survey:** the library already disagrees with itself. `cs-breadcrumb` writes `aria-current` on the
  `cs-breadcrumb-item` host (`breadcrumb.ts:72-76`). `cs-pagination` writes it on the inner `<a>`
  (`pagination.ts:364`).
- **Tree:** nothing is needed. The disclosure pattern puts `aria-current="page"` on a plain `<a>`, and no component is
  involved.

## Evidence

### A. Our code today

- **Both items keep role and focus on the host.** `cs-dropdown-item` sets `role="menuitem"` or `menuitemcheckbox` on
  itself (`dropdown-item.ts:133-141`) and is the roving focus target (`:108, :115`). `cs-tree-item` reflects
  `role="treeitem"` and `tabindex` on itself (`tree-item.ts:116-123`). Neither uses `delegatesFocus`.
- **`cs-button` is the opposite.** Its host has no role and `delegatesFocus: true` (`button.ts:50`). The inner `<a>` or
  `<button>` is both focused and role-bearing (`:286-313`). So "do it the way `cs-button` does" means moving the role
  inward. Adding an `<a>` inside a host that keeps its role is a different shape.
- **The dropdown owns Enter and click.** Enter on an item is cancelled at the document level and turned into
  `makeSelection` (`dropdown.ts:457-475`). A click goes through `handleMenuClick` (`:494-513`). `makeSelection` fires
  `cs-select` and closes unless the event is cancelled (`:722-739`).
- **The tree owns Enter and click as selection.** Enter on an item calls `selectItem` (`tree.ts:308-312`), and a click
  does the same (`:317-338`). Since the fork, Enter is let through when focus is inside an item, "e.g. on a link or a
  button slotted into the item" (`:257-262`). That is upstream's fix (Web Awesome #2673).
- **The tree is always a selection widget.** `selection` is `'single' | 'multiple' | 'leaf' | 'leaf-multiple'`, with no
  none (`tree.ts:89`). Every item writes `aria-selected` (`tree-item.ts:268-272`).
- **The library's navigation guidance already uses plain links.** `cs-page`'s navigation slot example is a `<nav>` of
  plain `<a>` and `cs-button href` (`page.md:208-229`).

### B. Harness results

The rows use these names for the shapes:

- **Today:** a real `cs-dropdown-item` or `cs-tree-item` with an `<a>` slotted in.
- **A1:** the host keeps the role and focus, and the inner `<a>` has `tabindex="-1"`. This is Carbon's shape.
- **A2:** the host has no role, and the inner `<a role="menuitem">` (or `treeitem`) takes focus. This is the
  recommendation, and APG's, Primer's, Material's and React Aria's shape.
- **U:** upstream Web Awesome 3.12.0+. The host keeps the role and focus. An empty `<a aria-hidden="true">` is clicked
  synthetically, copying modifier keys.

"Navigated in place" means the test page's (or test frame's) URL changed. "No" for a modifier combo means the browser
took its modifier path (new tab or window). The harness can see that the page stayed put, but not the new tab.

| # | Check | Chromium | Firefox | WebKit |
| --- | --- | --- | --- | --- |
| | **Today: `<a>` slotted into `cs-dropdown-item`** | | | |
| 1 | Enter on the focused item follows the link | no | no | no |
| 2 | Enter fires `cs-select` and closes | yes | yes | yes |
| 3 | Clicking the link follows it, and the menu selects and closes | yes | yes | yes |
| 4 | Accessible name of that menu item | "Slotted link" | "Slotted link" | **none** |
| 5 | Accessibility tree | menuitem > link | menuitem > link | menuitem > link |
| 6 | axe violations | none | `color-contrast` | none |
| 7 | Focus after Tab from the open menu | next control | **`body`** | `body`* |
| 8 | Control: same, with plain items only | next control | next control | `body`* |
| | **Today: `<a>` slotted into `cs-tree-item`** | | | |
| 9 | Enter on the focused item follows the link | no (selects) | no (selects) | no (selects) |
| 10 | Tab from the focused item lands on its link | yes | yes | no* |
| 11 | Tab stops through a three-item tree | item 1, link 1 | item 1, link 1 | item 1* |
| 12 | After ArrowDown to item 2, Tab reaches link 2 | yes | yes | no* |
| 13 | Option+Tab from the item reaches the link | n/a | n/a | yes |
| 14 | Clicking the link follows it and also selects the item | yes | yes | yes |
| 15 | Accessibility tree | treeitem > link | treeitem > link | treeitem > link |
| 16 | axe violations | none | none | none |
| | **Prototypes** | | | |
| 17 | A1 menu: accessibility tree | menuitem "..." > link | menuitem "..." > link | menuitem (**unnamed**) > link |
| 18 | A1 menu: Enter follows the link only through a JS `click()` | yes | yes | yes |
| 19 | A1 tree: accessibility tree | treeitem "..." > link | treeitem "..." > link | treeitem "..." > link |
| 20 | A2 menu: accessibility tree | menuitem "...", no nested link | same | same |
| 21 | A2 in `cs-dropdown`'s topology (`role="menu"` in a shadow root, items slotted) | menuitem "..." | menuitem "..." | menuitem "..." |
| 22 | A2: `host.focus()` lands on the inner `<a>` | yes | yes | yes |
| 23 | A2: plain Enter follows the link natively | yes | yes | yes |
| 24 | A2: Enter cancelled at the document, as `dropdown.ts:457-459` does, blocks the link | yes | yes | yes |
| 25 | A2 tree parent (inner `<a role="treeitem">`, group beside it) | child beside parent, not under it | same | **no tree**: plain links |
| 26 | Same, with `aria-owns` from the link to the group | child under parent | child under parent | **no tree**: plain links |
| | **Native link behavior: U vs A2** | | | |
| 27 | An `<a href>` under the pointer at the item's center: U | no | no | no |
| 28 | Same, for A2 and for today's slotted link | yes | yes | yes |
| 29 | Plain Enter navigates in place (U and A2) | yes | yes | yes |
| 30 | Cmd+Enter navigates in place: U / A2 | no / no | no / no | **yes** / no |
| 31 | Shift+Enter navigates in place: U / A2 | no / no | no / no | **yes** / no |
| 32 | Ctrl+Enter navigates in place: U / A2 (not a new-tab key on macOS) | yes / yes | no / no | yes / yes |
| | **The navigation alternative** | | | |
| 33 | `cs-details` with a text summary and links inside: axe | none | none | none |
| 34 | `cs-details` with a link and a button in the summary (Flightdeck's rows): axe | `nested-interactive` | `nested-interactive` | `nested-interactive` |

\* WebKit's Tab skips links and buttons under default macOS settings. Option+Tab reaches them (check 13). So in
Safari as shipped, a link slotted into a tree item can only be reached with Option+Tab.

What the table shows:

- **Slotted links fail in both components.** In a menu, Enter never follows the link (1). WebKit leaves the menu item
  with no name (4). Firefox loses focus to `body` on Tab (7 vs control 8). In a tree, Enter selects instead of
  navigating (9). The link is a second, hidden Tab stop that only the item holding the roving `tabindex` exposes
  (10-12). A click both selects and navigates (14).
- **A1 nests a link inside the menu item** in every engine, and WebKit loses the item's name (17).
- **A2 gives a clean menu item in every engine**, including inside `cs-dropdown`'s slot topology (20-21). Enter and its
  modifier keys behave as on any link (23, 30-31).
- **U loses the pointer affordances.** No link is under the pointer (27), so middle-click, the link context menu and the
  hover preview have nothing to act on. That part is inferred: browser chrome is outside what a page test can see.
  WebKit also ignores U's copied modifier keys (30-31), as upstream's own docs say.
- **A2 breaks trees in WebKit** (25-26). A tree item cannot move its role inward.
- **axe is not the referee here.** It passed every menu and tree shape. Its `nested-interactive` rule only runs on
  children-presentational roles, and `menuitem` and `treeitem` are not among them (axe-core 4.13.0 bundled here,
  `nestedInteractiveMatches`, the same as 4.14.0's
  [`nested-interactive-matches.js`](https://github.com/dequelabs/axe-core/blob/e797173108eadfa4355fe06af331791734e1757f/lib/rules/nested-interactive-matches.js#L4-L11)).
  The harness used the accessibility tree instead (Playwright 1.52.0's `page.accessibility.snapshot`).

### C. Specs and APG

- **`<a href>` may be a menu item or a tree item.** ARIA in HTML, `a` with `href`: "Roles: button, checkbox, menuitem,
  menuitemcheckbox, menuitemradio, option, radio, switch, tab or treeitem"
  ([html-aria #el-a](https://www.w3.org/TR/html-aria/#el-a)). axe's own table agrees.
- **A menu item should not contain interactive content.** ARIA in HTML's (non-normative) allowed-descendants table
  says `menuitem` takes "Phrasing content, but with no interactive content descendants, and no descendants with a
  `tabindex` attribute specified." `treeitem` takes "Phrasing content" with no such ban
  ([html-aria #allowed-descendants-of-aria-roles](https://www.w3.org/TR/html-aria/#allowed-descendants-of-aria-roles)).
  So the slotted and A1 shapes do not conform for menus, even though axe passes them.
- **Neither role is children-presentational in ARIA 1.2.** `menuitemcheckbox` is
  ([WAI-ARIA 1.2 #menuitem](https://www.w3.org/TR/wai-aria-1.2/#menuitem),
  [#treeitem](https://www.w3.org/TR/wai-aria-1.2/#treeitem)).
- **`aria-current` is global**, and the spec names navigation trees: "aria-current="page" can be used in a navigation
  tree to indicate which page is currently displayed, while aria-selected="true" indicates which page will be
  displayed if the user activates the treeitem"
  ([#aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current)).
- **APG puts the role on the `<a>`.** The Navigation Menu Button example uses
  `<li role="none"><a role="menuitem" href="...">`, because "The menu items are made from HTML links, so they maintain
  their HTML link behaviors. That is, activating a menuitem loads the link target, and the browser's link context menu
  and associated actions are available"
  ([menu-button-links](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/#aboutthisexample)).
  The Navigation Menubar does the same, with `aria-current="page"` on the `a`
  ([menubar-navigation](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-navigation/)).
- **Menu keyboard model:** Enter "activates the item and closes the menu", and Space is "(Optional)"
  ([menubar pattern #keyboardinteraction](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboardinteraction)).
- **APG's navigation tree has no selection.** Its Navigation Treeview uses
  `<a role="treeitem" href="#home" aria-current="page">` with no `aria-selected`. Enter or Space "activate the link"
  ([treeview-navigation](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/)). The
  pattern page says "If the tree contains nodes that are not selectable, neither aria-selected nor aria-checked is
  present on those nodes" ([treeview #keyboardinteraction](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/#keyboardinteraction)).
- **APG warns against both widgets for site navigation.** The tree and menubar navigation examples both say the role
  "requires implementation of complex functionality that is not needed for typical site navigation ... A pattern more
  suited for typical site navigation with expandable groups of links is the disclosure pattern"
  ([treeview-navigation #aboutthisexample](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/#aboutthisexample)).
  The [Disclosure Navigation Menu with Top-Level Links](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation-hybrid/)
  shows "a top-level link and an associated disclosure button".
- **What a screen reader should say.** The ARIA-AT plan for APG's links menu button asserts "Role of the focused item,
  'menu item', is conveyed", and nothing about "link"
  ([aria-at assertions.csv](https://github.com/w3c/aria-at/blob/01923da5f533dda74c9f33a68ee20e112069c6de/tests/apg/menu-button-navigation/data/assertions.csv)).
  Its published results were not read.

### D. Web Awesome upstream and Shoelace

- **3.11.0, our fork point:** neither item supports links
  ([dropdown-item.ts](https://github.com/shoelace-style/webawesome/blob/v3.11.0/packages/webawesome/src/components/dropdown-item/dropdown-item.ts#L136-L143),
  [tree-item.ts](https://github.com/shoelace-style/webawesome/blob/v3.11.0/packages/webawesome/src/components/tree-item/tree-item.ts#L116-L122)).
- **3.12.0 added `href`, `target`, `rel` and `download` to `wa-dropdown-item`**
  ([PR #2733](https://github.com/shoelace-style/webawesome/pull/2733)). It is still there in 3.14.0, the latest.
  - The host stays the menu item. An empty `<a tabindex="-1" aria-hidden="true">` is clicked by `navigate()`, copying
    the source event's modifier keys
    ([v3.14.0 dropdown-item.ts L277-305, L343-356](https://github.com/shoelace-style/webawesome/blob/v3.14.0/packages/webawesome/src/components/dropdown-item/dropdown-item.ts#L277-L305)).
  - `navigate()` runs after `wa-select` unless the event is cancelled
    ([dropdown.ts L705-727](https://github.com/shoelace-style/webawesome/blob/v3.14.0/packages/webawesome/src/components/dropdown/dropdown.ts#L705-L727)).
  - Their docs: "Safari is the exception, as it ignores modifier keys on synthetic clicks", and "Link items aren't
    announced as links"
    ([dropdown.md L155-190](https://github.com/shoelace-style/webawesome/blob/v3.14.0/packages/webawesome/docs/docs/components/dropdown.md#L155-L190)).
  - The maintainer's reasoning was that the host has the role and focus, so "the `<a>` can't be nested inside either,
    as it won't be detected by screen readers"
    ([discussion #1291](https://github.com/shoelace-style/webawesome/discussions/1291#discussioncomment-14047527)).
    U follows from keeping the role on the host. A2 removes that premise.
- **Tree items:** no link API in any release. Slotted links work as of
  [#2673](https://github.com/shoelace-style/webawesome/issues/2673), which is our `tree.ts:257-262`. A request for
  full-row tree links has no maintainer reply
  ([discussion #1553](https://github.com/shoelace-style/webawesome/discussions/1553)).
- **Shoelace** never added `href` to `sl-menu-item` or `sl-tree-item`. Its maintainer called menus "system" menus,
  suggested "using `<nav>` and `<a>` for navigation" ([#292](https://github.com/shoelace-style/shoelace/issues/292#issuecomment-751730264)),
  and called links wrapped around menu items "incorrect (interactive inside an interactive)"
  ([#1351](https://github.com/shoelace-style/shoelace/issues/1351#issuecomment-1563168257)).

### E. Other systems

| System | Menu item as link | Tree item as link | Current page |
| --- | --- | --- | --- |
| Primer React 38.40.1 | `ActionList.LinkItem` inside an `ActionMenu` renders `<li role="none"><a role="menuitem">` ([Item.tsx L149-160, L279-287](https://github.com/primer/react/blob/8e7062bb6dc7caa81e48abd6e5c73b197977ee07/packages/react/src/ActionList/Item.tsx#L149-L160)) | `TreeView.Item as="a"` renders `<a role="treeitem">`, with no `href` prop ([PR #7897](https://github.com/primer/react/pull/7897)) | `NavList` passes `aria-current` to the `<a>`. `TreeView.Item current` sets `aria-current="true"`. |
| Material Web 2.5.0 | `href` and `target` switch the inner element to `<a role="menuitem">`, with `delegatesFocus` ([menu-item.ts](https://github.com/material-components/material-web/blob/b4de401eb665ec63474f39319a4ba8f2145974cc/menu/internal/menuitem/menu-item.ts#L128-L161)) | no tree | none found |
| Angular Material 22.2.2 | `<a mat-menu-item>` gets `role="menuitem"` on the `<a>` ([menu-item.ts](https://github.com/angular/components/blob/09bce199d1bee99e61b2f65c1cbf9649c234de6c/src/material/menu/menu-item.ts#L31-L60)) | no tree | none found |
| React Aria Components 1.22.0 | `href` renders `<a role="menuitem">`: "Links with real DOM focus activate on Enter natively" ([useMenuItem.ts L323-335](https://github.com/adobe/react-spectrum/blob/1abc52dd5ad238143f168912963ff3ad932547a4/packages/react-aria/src/menu/useMenuItem.ts#L323-L335)) | `href` on a `treegrid` row, navigated by JavaScript ([Tree.mdx](https://github.com/adobe/react-spectrum/blob/1abc52dd5ad238143f168912963ff3ad932547a4/packages/dev/s2-docs/pages/react-aria/Tree.mdx#L190-L227)) | none found |
| Carbon web components | Host `role="menuitem"` with an inner `<a tabindex="-1">`, the A1 shape ([overflow-menu-item.ts](https://github.com/carbon-design-system/carbon/blob/47ab67155b185d56bf147b33cd9536e479ab0203/packages/web-components/src/components/overflow-menu/overflow-menu-item.ts#L66-L96)) | not checked | not checked |
| Web Awesome 3.14.0 | U, as above | none | none |

Primer's guidance is the plainest statement of the tree answer. From
[nav-list.mdx](https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/components/nav-list.mdx#L144):
"Do not replace your NavList with a tree view to support a deeply nested navigation structure. A tree view is never an
accessible replacement for navigation." From
[tree-view.mdx](https://github.com/primer/design/blob/87f799f202ec95df15c99f473c9c0c803da8e6b3/content/components/tree-view.mdx#L143):
"Nodes may not contain any other interactive elements besides the chevron."

### F. Flightdeck's port

- **Dropdown:** every item that goes somewhere carries `data-href`, and a Stimulus controller calls `Turbo.visit` on
  `cs-select` (`app/javascript/controllers/menu_actions_controller.js`). This is the handler the ticket describes. It
  is also where `cs-select` plus `preventDefault()` keeps working after `href` lands.
- **Tree:** the port did not build a tree. Each project is a `cs-details` disclosure with plain links inside, each link
  marked `aria-current="page"` (`app/views/shared/_project_nav.html.erb`, `_project_nav_tree.html.erb`,
  `app/helpers/sidebar_helper.rb`). That is the disclosure pattern this document recommends. But its rows put a link
  and a favorite button inside the summary, which fails `nested-interactive` (check 34). That bug is in Flightdeck, not
  in Cornerstone.

## Shapes rejected, and why

- **Slotted `<a>`, in either item.** The menu fails on Enter, its name in WebKit, and focus in Firefox. The tree fails
  on Enter and on Tab reach, and a click does two things (B: 1-15). The menu case also breaks ARIA in HTML's
  descendant rule (C).
- **A1: role on the host, inner `<a tabindex="-1">`** (Carbon). It exposes a link nested inside the menu item in every
  engine, WebKit loses the item's name (B: 17), it breaks ARIA in HTML's descendant rule for menus (C), and Enter needs
  JavaScript (B: 18).
- **U: upstream's hidden link.** This was the closest call, and it is the fallback if A2 is blocked.
  - In its favor: it is the smallest change. It keeps the role on the host, so a host `aria-current` keeps working with
    no #230 dependency. It also matches upstream, which makes later merges easier.
  - Against it: it fixes only one of the four losses the ticket names (the JavaScript handler). With no link under the
    pointer there is no middle-click, no link context menu and no hover preview (B: 27). Cmd- and Shift-clicks open in
    the same tab in Safari (B: 30-31). And by reading Turbo's code, its `composed: false`, non-bubbling synthetic click
    never reaches Turbo's document listener, so a Turbo app gets a full page load instead of a visit. That last point
    was not tested.
- **`href` on `cs-tree-item`, role moved to an inner `<a>`.** WebKit drops the tree completely (B: 25-26).
- **`href` on `cs-tree-item`, role kept on the host.** It works in every engine (B: 19), but it nests a link in each
  item, needs JavaScript for Enter, and fights a selection model that has no "none". APG and Primer both steer site
  navigation away from trees (C, E), and Flightdeck did not need it (F). It stays possible as a later, additive change.

## Bump level and 1.0.0

- **`cs-dropdown-item` link API:** adds four properties, one part and one custom state to a `stable` component.
  Nothing existing changes, since items without `href` render exactly as today. That is **minor**, and it can land
  after 1.0.0. Per `docs/standards/api-surface.md`, it ranks below anything that renames or changes existing surface.
- **Docs** (the tree is not navigation, slotted links are unsupported, the disclosure pattern and its summary
  condition): **patch**. The pages compile into the shipped `cornerstone` skill, so they take a real changeset.
- **Nothing in this ticket needs to land before 1.0.0.** The one coupling is #230. If its rule changes how a host
  `aria-current` behaves on `cs-dropdown-item`, that bump is #230's.

## Open questions for accessibility review (Esther)

1. **Announcement.** Link items are announced as "menu item", not "link". ARIA-AT expects that, and APG and every
   system above accept it. Is a label convention enough? Should `target="_blank"` or `download` add hidden text such as
   "opens in a new tab"?
2. **Space on a link item.** The recommendation is that Space calls `click()` on the `<a>`, for parity with other
   items. Native links ignore Space, and APG lists Space as optional. Agree?
3. **Focus ring on the `<a>`.** The ring moves from `:host(:focus-visible)` to the inner `<a>`. It needs the same 3:1
   check (2.4.7, 1.4.11) on the menu surface.
4. **Disabled link items.** The recommendation drops `href` and sets `aria-disabled` on the `<a>`, as
   `cs-pagination` does. `cs-button` keeps `href`. Should one rule cover both?
5. **A visible current-item state.** If link items can be current, does Cornerstone owe a non-color signal for it
   (the accessibility floor: no state by color alone), or is that left to apps?
6. **A group name that is also a link.** APG's answer is a link plus a separate disclosure button. `cs-details` cannot
   do that, because its whole summary is the button. Is that a documented composition, a `cs-details` change, or out
   of scope? Flightdeck's sidebar needs an answer either way, since its current rows fail `nested-interactive`.
7. **Real assistive technology.** None of this has been checked with a screen reader (the "Screen reader verification"
   known gap in `resources/accessibility.md`). The checks most worth a person's time: VoiceOver and NVDA on an
   `<a role="menuitem">` inside a shadow root, and whether `aria-current` on a menu item is spoken.

## Not verified

- Middle-click, the link context menu and the status-bar preview were not exercised directly. They live in browser
  chrome a page test cannot reach. Checks 27-28 show whether a link is under the pointer, which is what they act on.
- For modifier keys, the harness shows the page did not navigate in place, not that a new tab opened.
- Turbo Drive behavior for both A2 and U comes from reading Turbo 8.0.23's source, not from a run.
- The prototypes are minimal stand-ins, not the components. A2 in the real `cs-dropdown` still has to be built and
  run through the full suite in both render modes. The harness ran client-side only.
