---
title: Changelog
description: Changes to each version of the project are documented here.
---

Cornerstone follows <a href="https://semver.org/" class="appearance-plain">Semantic Versioning</a>, and each release on this page follows the <a href="https://keepachangelog.com/" class="appearance-plain">Keep a Changelog</a> convention. Additionally, both [components](/components) and features carry a status badge that tells you what to expect from their API.

<table>
  <thead>
    <tr>
      <th>Status</th>
      <th>What to Expect</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><cs-badge variant="brand" pill><cs-icon name="check" slot="start"></cs-icon>Stable</cs-badge></td>
      <td>A settled API you can build on. Breaking changes land only in major releases, and anything deprecated stays available through the next major version. Safe for production.</td>
    </tr>
    <tr>
      <td><cs-badge variant="warning" appearance="filled" pill><cs-icon name="science" slot="start"></cs-icon>Experimental</cs-badge></td>
      <td>Still taking shape. The API can change in any minor release, so it's ideal for prototyping — but risky for production code you can't easily update.</td>
    </tr>
  </tbody>
</table>

## Unreleased

:::added

- Added `--icon-scale` to `<cs-icon>`, which scales the artwork inside the canvas without moving the canvas. It defaults to `1.2` — Material Symbols pads each icon into a 24dp box with a 20dp live area, and 24 ÷ 20 cancels that, so icons keep the optical size Font Awesome's ink-cropped artwork had. It inherits, so an ancestor can retune every icon beneath it; set it to `1` for the native size
- Added a `brands` icon library for the logos Material Symbols does not draw — `github`, `discord`, `bluesky`, `mastodon`, `threads`, `x-twitter`, `angular`, `react`, `svelte`, `vuejs` and `font-awesome`. The SVGs come from Simple Icons (CC0-1.0) and are inlined, so they resolve with no network request
- Added a `weight` property to `<cs-icon>`, exposing Material Symbols' 100–700 stroke-weight axis. It defaults to `400`, the weight Cru's brand guidelines specify; values in between snap to the nearest published weight. The inlined `system` library is baked at the same weight so component chrome matches
- Added `sideEffects: true` to `package.json`, recording that component registration, translations and stylesheets are all side-effectful and must never be tree-shaken
- Added a `bundled/` export subpath, so the bundled build is reachable rather than shipped-but-unimportable
- Added `LICENSE.md` and `NOTICE` to the published package

:::

:::fixed

- Fixed `<cs-dialog>` and `<cs-drawer>` nudging their siblings when opened. The host stayed in normal flow while open, so wherever it sat in a flex or grid container it counted as an item and contributed a gap — in the docs' header that shifted the search button 12px to the left for as long as the dialog was open. The host is now out of flow, which it can be because the visible panel is a native `<dialog>` in the top layer. It keeps a full-viewport width rather than collapsing, since `RenderedWatcher` and the panel's own `max-width` both resolve against that box
- Fixed a long navigation losing its bottom padding in `<cs-page>`. `[part~='navigation']` was `height: 100%`, which pinned it to the scroll container's visible height, so a navigation taller than the viewport overflowed that box rather than growing it — and padding on a box that does not grow renders at the box edge, mid-scroll. The top padding showed and the bottom one did not, leaving the last link flush against the bottom of the scroller. It is now `min-height: 100%`, so a short navigation still fills the column and a long one grows
- Fixed slotted-content spacing collapsing under a page's universal margin reset. A slotted element belongs to the outer tree, so a normal document declaration beats the component's own `::slotted()` rule whatever the specificity — any `* { margin: 0 }`, such as Starlight's or Tailwind's Preflight, silently removed the gap. 22 declarations across `<cs-badge>`, `<cs-breadcrumb-item>`, `<cs-button>`, `<cs-dialog>`, `<cs-drawer>`, `<cs-input>`, `<cs-option>`, `<cs-select>`, `<cs-tab>`, `<cs-tab-group>` and `<cs-tree-item>` now defend themselves the way `<cs-callout>` already did
- Fixed `jsdelivr` pointing at the unbundled build, which cannot load in a browser because its dependencies stay as bare specifiers
- Fixed `npm run create`, whose template imported a base class module that does not exist — every scaffolded component was broken
- Fixed `verify:skills`, which had been failing since the monorepo was collapsed
- Fixed `.prettierignore`, whose every pattern was `packages/**/*/…` and so matched nothing — `dist`, `_site` and the tsconfigs were silently unignored, and 60 source files had gone unformatted since the rename
- Removed duplicate `marked` and `@lit/react` entries from `devDependencies`, where `marked` also disagreed with the `dependencies` range
- Fixed five custom properties that named tokens no theme defines, so every style depending on them silently did nothing
  - `<cs-input>`, `<cs-known-date>` and native file inputs, textareas and selects now size their value text with the control rather than at the browser's default
  - `<cs-page>`'s skip link is rounded again
  - `<cs-dialog>` and `<cs-drawer>` space their footer buttons again
- Fixed a `<cs-dropdown>` submenu closing while the pointer was still inside it. The 100 ms grace period that lets the pointer travel diagonally from the parent item into the submenu re-checked hover state from values captured *before* the delay, and entering that branch already proved both were false — so the re-check always passed and the submenu closed regardless. Hover is now read inside the timeout
- Fixed the icon-button accessibility warning never firing. `<cs-button>` asked whether the slotted `<cs-icon>`'s `label` was `undefined`, but `label` defaults to `''` and so never is; it now asks for a non-empty string, so an icon-only button with no accessible name warns as intended
  - The three the warning found are fixed: the page-layout example in the design skill, and the search and theme-picker buttons in the documentation site's header, which carried an `aria-label` on `<cs-button>` that never reached the inner `<button>` and so left both with no accessible name

:::

:::changed

- `author` is now `Cru Global`, naming the organisation rather than one of its peer brands
- `<cs-slider>` now replaces a non-numeric `value` with the midpoint of `min` and `max`, matching `<input type="range">`; it previously became `NaN`

:::

:::removed

- Removed 17 event classes that no component dispatched — every one an orphan of a Pro component, left registered in `GlobalEventHandlersEventMap` and exported as public API. `<cs-data-grid>`'s thirteen (`cs-cell-click`, `cs-cell-contextmenu`, `cs-column-move`, `cs-column-pin`, `cs-column-resize`, `cs-column-visibility-change`, `cs-data-error`, `cs-data-request`, `cs-filter-change`, `cs-row-collapse`, `cs-row-expand`, `cs-row-select`, `cs-sort-change`), plus `cs-focus-day` and `cs-view-change`, `cs-video-change`, and `cs-create`

- Removed the Pro tier throughout: the `free`/`pro` split in the skill verifier and agent-file generator, the Pro components, themes and palettes named in the shipped skills, and the purchase and support links to channels Cru does not run
  - The skills had claimed `<cs-toast>` and `<cs-toast-item>` were Pro-only, telling agents not to use two components this library ships
- Removed dead scripts and files: `VERSIONS.txt`, `scripts/update-root-version.js`, `vercel.sh`, the `publish-alpha-cdn` and `start:alpha` scripts, and the unused `__WEBAWESOME_VERSION__` build token
- Removed the `Fonticons, Inc.` copyright banner from every built file, replacing it with a Cornerstone notice pointing at `LICENSE.md` and `NOTICE`
- Removed the deprecated `base` CSS part and the `label` alias, finishing the migration to component-named parts
  - `base` is gone from the 29 components that still rendered it — style the part named after the component instead (`button`, `details`, `input-wrapper`)
  - `<cs-button-group>` and `<cs-tab-panel>` carried `base` on a `<slot>`, which parts don't belong on, and now expose none — style the host element
  - Renamed the 15 forwarded names that embedded it: `close-button__base` → `close-button__button`, `base__popup` → `tooltip__popup`, and so on
  - Dropped three forwards pointing at parts their child never exposed: `<cs-select>`'s `tag__base`, and `<cs-page>`'s `drawer__overlay` and `drawer__panel`
  - The `label` alias is gone from the six form controls that also exposed `form-control-label`

:::

:::breaking

- **The default icon library is now Material Symbols, not Font Awesome.** Every icon name changes, and Material Symbols names are snake_case: `xmark` is `close`, `chevron-down` is `keyboard_arrow_down`, `gear` is `settings`, `ellipsis` is `more_horiz`. A name that does not exist renders nothing rather than a fallback glyph, so audit names rather than assuming they carried over
  - `family` now selects the style — `sharp` (the default), `outlined` or `rounded` — in place of Font Awesome's `classic`/`brands`/`duotone`/`sharp-duotone`
  - `variant` now selects the cut — `regular` (the default) or `fill` — in place of `thin`/`light`/`regular`/`solid`. The stroke weight moved to the new `weight` property
  - Brand logos moved from `family="brands"` to `library="brands"`
- **Font Awesome kit codes are gone.** `setKitCode()`, `getKitCode()` and the `data-fa-kit-code` attribute are removed, along with the Pro and Pro+ icon families they unlocked. Material Symbols has no paid tier
- **Duotone support is gone.** `<cs-icon>`'s `swap-opacity` attribute and its `--primary-color`, `--primary-opacity`, `--secondary-color` and `--secondary-opacity` custom properties are removed. Material Symbols draws a single path, so there is no second layer to colour
- **`getIconFolder()` is replaced by `getIconStyle()`, `getIconWeight()` and `getIconFileName()`**, which map a family to its style folder, snap a weight to a published one, and apply the `-fill` suffix. Custom resolvers now also receive the weight as a fifth argument
- **`setIconPath()` expects a different layout.** Self-hosted icons are now read from `{path}/{weight}/{style}/{name}.svg`, mirroring the `@material-symbols/svg-{weight}` packages, rather than Font Awesome's `{path}/{folder}/{name}.svg`
- **Import specifiers no longer contain `dist`.** `@cruglobal/cornerstone-components/dist/components/button/button.js` is now `@cruglobal/cornerstone-components/components/button/button.js`. `dist` is a build directory, not public API
- **The two builds moved and were renamed for what they are.** `dist/` is now `dist/unbundled/` and `dist-cdn/` is now `dist/bundled/`; `dist` is only a container. A CDN is one way to fetch the bundled build, not a property of it
- **The version resets to `0.1.0`.** `3.11.0` was Web Awesome's number, inherited rather than chosen. `0.x` states plainly that the cross-cutting API policies still to land can change anything
- **Node 22 or newer is now required**, up from `>=14.17.0`. Node 14, 18 and 20 have all reached end of life
- **The long-form `size` values are gone.** `size="small"`, `"medium"` and `"large"` no longer work — use `s`, `m` and `l`. Upstream had already deprecated them with a runtime warning for Shoelace and Web Awesome 2.x users; this package has never been published, so there was nobody left to migrate. The `size` axis is now closed to `xs s m l xl` on all 21 components that expose it
- **`<cs-dropdown-item>` spells its neutral variant `neutral`.** `variant="default"` is now `variant="neutral"`, matching the five other components with a `variant`
- **`<cs-accordion>`'s four events are renamed** to `cs-accordion-expand`, `cs-accordion-after-expand`, `cs-accordion-collapse` and `cs-accordion-after-collapse`. They previously shared `cs-collapse` and `cs-expand` with `<cs-tree-item>` under incompatible contracts — cancelable and carrying `detail: { item }` on the accordion, neither on the tree item — and only the tree item's shape was registered, so `event.detail.item` was typed as non-existent
- **`<cs-pagination>`'s events follow the `after` convention** used by every other paired event in the library. The cancelable veto is now `cs-page-change` (was `cs-before-page-change`) and the completion event is `cs-after-page-change` (was `cs-page-change`)

:::

:::removed

  - The real event surface is 41 classes, not 58

:::

:::changed

- `cs-intersect` now bubbles. It was `bubbles: false` with `composed: true`, which cannot do anything — `composed` only matters for an event that propagates
- Cornerstone Components now states a conformance target of **WCAG 2.2 Level AA**, with the floor it meets, how each claim is verified, and a table of seven named gaps. The accessibility page previously named no standard at all
- Every component with an interactive surface now runs axe in its test suite, across all three engines and both render modes — 59 of 70 components, up from 46. The 11 exempt are utilities that render nothing interactive
- WebKit now runs in CI. It was excluded whenever `CI === 'true'`, so CI reported green on a suite that was red locally

:::

:::fixed

- Fixed `<cs-toast>` hanging off the side of narrow viewports at `top-center` and `bottom-center` placements. The host was a fixed `28rem` with no `max-width`, and centered placements offset it by half its own width, so on a 390px viewport 29px of the stack sat off-screen
- Fixed `<cs-carousel>`'s loop test, `<cs-toast>`'s stack-visibility test and `<cs-copy-button>`'s hover test, which were the inherited failures that turned out to be a coalesced `scrollend`, a race against teardown, and a too-short wait budget respectively

:::

:::fixed

- Fixed native table row headers (`<th scope="row">`) rendering at a smaller font size than the cells beside them, which knocked their text out of vertical alignment. The smaller type is now scoped to column headers
- Fixed the focus ring on `<cs-otp-input>` animating its width and offset, which re-ran the animation on every keystroke as the active segment advanced. It now fades in at a fixed size, matching `<cs-input>` and the other form controls

:::

:::changed

- Improved accessibility of `<cs-dropdown>` by adding `aria-posinset` and `aria-setsize` so supportive screen readers can correctly announce the number of dropdown items []

:::
