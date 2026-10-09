# How `cs-*` controls take ARIA set on the host

**Status:** research only. Nothing implemented. Resolves the research half of
[#230](https://github.com/CruGlobal/cornerstone-design-system/issues/230), on map
[#224](https://github.com/CruGlobal/cornerstone-design-system/issues/224).
**Date:** 2026-10-09
**Repo state read:** `origin/main` at `fe140b8`. Repo paths below are relative to the repo root;
`packages/components/src/components/` is shortened to `components/`.
**Related:** [#179](https://github.com/CruGlobal/cornerstone-design-system/issues/179) (tree and dropdown items
as links, which shares `aria-current`), [#173](https://github.com/CruGlobal/cornerstone-design-system/issues/173)
and [#174](https://github.com/CruGlobal/cornerstone-design-system/issues/174) (where the gaps were found).

---

## Short answer

**One rule for the whole library: the element that owns a control's role gets its ARIA from the component,
never from attributes left on a wrapper host. Host ARIA is not forwarded.**

1. **Where the host owns the role** (`cs-tab`, `cs-option`, `cs-radio`, `cs-dropdown-item`, `cs-tree-item` and
   others, see the [inventory](#2-inventory-where-each-components-role-lives)), ARIA on the host is ARIA on
   the role. That already works and does not change.
2. **Where the host wraps the element that owns the role** (`cs-button`, `cs-breadcrumb-item`, the form
   controls):
   - **The name comes from content:** the default slot, a slotted `cs-icon` or `cs-avatar` `label`, or
     visually hidden text in the slot. Form controls keep their `label`. No `label` property on `cs-button`.
   - **A state an app has to set becomes a property** rendered onto the role element, named after the ARIA
     state without `aria-`. One is needed now: **`current`**, on `cs-button` and `cs-breadcrumb-item`. Others
     only when a real need shows up, each one additive.
   - **Library components wire each other through the role element, not the host.** `cs-tooltip`,
     `cs-dropdown` and `cs-breadcrumb` hand their ARIA to the control through a small internal contract. The
     control applies it to its role element, using ARIA element reflection for references. Nothing reaches
     into another component's shadow root, and nothing is written on the host.
   - **ARIA left on a wrapper host warns.** The control logs a console warning that names what to use
     instead, the same way `cs-button` already warns about an unlabelled icon button
     (`components/button/button.ts:233-238`).
3. **Revisit when the platform can delegate attributes set on a host.** Reference Target cannot (it only
   redirects references pointing at a host), and the proposal that could, WICG/webcomponents#917, is dormant.

**Why not forward?** Both ways of forwarding were prototyped and measured in all three engines and both
render modes.

- **Forward and keep** puts the name on the inner control and on the wrapper too, in every engine (P1 keep).
  Material Web shipped exactly this and then made a breaking release to undo it, titled "aria-labels
  announcing twice with 'group'". Web Awesome's maintainers refused it for the same reason.
- **Forward and strip** fixes the wrapper but loses every later change: a removed label, a cleared
  `aria-current` and a retargeted tooltip all stay stuck on the control (P1, P3, P7 strip). Ionic's own code
  says the same. It also deletes attributes apps can see, which fights DOM patchers like Turbo (#215).

**`current` is a property**, so it renders on the server, never doubles up, and survives every change (P5,
P6). **The tooltip, wired straight to the role element**, names or describes the control and leaves the
wrapper clean (E15).

**What 1.0.0 locks:** `cs-tooltip`'s ARIA output (name or description), and not adding forwarding or
properties that would later have to come out. `current` itself is additive and can land in any minor.
[Bump levels](#9-cost-on-the-public-api) are in section 9.

The rest of this file is the evidence.

---

## 1. What happens today

All measured in Chromium, Firefox and WebKit, in both render modes ([section 4](#4-measured-behaviour-per-engine-and-render-mode)).

- **`aria-label` on a `cs-button` host names the wrapper, never the button.** The inner `<button>` keeps
  the name from its content ("Settings", from the slotted icon's `label`). The host is exposed as a named
  container: `generic "Account menu"` in Chromium, `text container "Account menu"` in Firefox,
  `group "Account menu"` in WebKit (E1). The issue's "stray group in WebKit" is real, and the other two
  engines do the same thing under other role names.
- **`cs-tooltip` never reaches a `cs-button`.** It adds its own id to the anchor's `aria-labelledby`
  (`components/tooltip/tooltip.ts:232-241`, called at `344`), which is the `cs-button` host. The button is
  named "Save" with the tooltip closed and still "Save" with it open, in every engine (E3).
- **`cs-tooltip`'s text is also missing while it is closed, even on a native button** (E4). Its host is
  visible and its shadow body is `hidden` (`tooltip.ts:154`). A visible referenced node with hidden content
  lends no text (E14).
- **`aria-current` on the host never reaches the inner `<a>`.** `button.ts:288-313` renders no
  `aria-current`, and the attribute stays on the host (E5). ARIA states belong to the element that carries
  them ([section 6.4](#64-wai-aria-rules)).
- **The library makes the same mistake itself.** `cs-breadcrumb` marks its last item with
  `item.setAttribute('aria-current', 'page')` (`components/breadcrumb/breadcrumb.ts:73`), on the
  `cs-breadcrumb-item` host. The item's inner `<a>` never gets it (E9).
- **`cs-dropdown` reaches inside instead.** It finds `cs-button`'s inner `[part~="button"]` through its shadow
  root and sets `aria-haspopup` and `aria-expanded` there (`components/dropdown/dropdown.ts:743-767`, the
  reach-in at `754`). That works only for `cs-button`. Upstream does the same.
- **axe passes all of it** (E12). ARIA on a custom-element host is not flagged, so the library's
  `to.be.accessible()` assertions cannot catch this class of defect. Only the accessibility tree can.

---

## 2. Inventory: where each component's role lives

Read from each component's `render()` and `connectedCallback`. Status is each class's `@status`.

### The host owns the role: host ARIA already lands correctly

| Component | Status | Where the role is set |
| --- | --- | --- |
| `cs-tab` | stable | `role` property reflected to the host, `'tab'` (`components/tab/tab.ts:51`) |
| `cs-option` | stable | `setAttribute('role', 'option')` (`components/option/option.ts:101`) |
| `cs-radio` | stable | `setAttribute('role', 'radio')` (`components/radio/radio.ts:72`) |
| `cs-dropdown-item` | stable | `menuitem` or `menuitemcheckbox` on the host (`components/dropdown-item/dropdown-item.ts:135`, `138`); roving `tabindex` on the host (`115`) |
| `cs-tree-item` | stable | `treeitem` on the host (`components/tree-item/tree-item.ts:117`, `122`); `aria-selected`, `aria-expanded`, `aria-disabled` on the host (`245-279`) |
| `cs-tree` | stable | `tree` on the host (`components/tree/tree.ts:124`) |
| `cs-rating` | stable | `role` property `'slider'` (`components/rating/rating.ts:50`); `label` becomes host `aria-label` (`61`, `111-115`) |
| `cs-icon` | stable | `img` plus `aria-label` from `label` on the host (`components/icon/icon.ts:275-280`) |
| `cs-divider` | stable | `separator` (`components/divider/divider.ts:29`) |
| `cs-carousel`, `cs-carousel-item` | experimental | `region` with a localized `aria-label`, and `group`, on the host (`components/carousel/carousel.ts:119-120`, `components/carousel-item/carousel-item.ts:23`) |

### The host wraps one control: the rule applies

The host has no role. Focus goes to the inner element (`delegatesFocus` where marked).

| Component | Status | Role-owning element | What the rule asks of it |
| --- | --- | --- | --- |
| `cs-button` | stable | `<button role="button">`, or `<a>` with `href` (`button.ts:285-325`); `delegatesFocus` (`50`) | `current`; accept tooltip and dropdown wiring through the contract; warn on host ARIA. `title` is already forwarded (`66`, `301`), an inherited exception. |
| `cs-breadcrumb-item` | stable | `<a>` with `href`, else `<button>`, else a `<div>` around a slotted dropdown (`components/breadcrumb-item/breadcrumb-item.ts:80-112`) | `current`, which `cs-breadcrumb` then sets instead of host `aria-current` |
| `cs-copy-button` | stable | inner `<button>` (`components/copy-button/copy-button.ts:391`), named by its own copy and feedback terms (`396`) | contract and warning only |
| `cs-input`, `cs-textarea`, `cs-number-input` | stable | `<input>` or `<textarea>`, named by an in-shadow `<label for>` and described by `hint` (`components/input/input.ts:378-388`, `418`; `textarea.ts:452`, `472`; `number-input.ts:361`, `380`); `delegatesFocus` on input and number-input | contract (a tooltip appends to the internal `hint` reference) and warning |
| `cs-checkbox`, `cs-switch` | stable | `<input>` (`checkbox.ts:246`, `258`; `switch.ts:232-244`); `delegatesFocus` | same |
| `cs-select` | stable | `role="combobox"` element named by `label`, described by `hint` (`components/select/select.ts:1096-1099`) | same |
| `cs-slider` | stable | one or two `role="slider"` thumbs (`components/slider/slider.ts:964`, `987`, `1031-1044`) | same; with two thumbs, the contract has to say which thumb |
| `cs-color-picker` | stable | trigger `<button>`, or the inline `role="application"` (`components/color-picker/color-picker.ts:1207`, `1281`); `delegatesFocus` | same |
| `cs-details` | stable | `<summary role="button">` (`components/details/details.ts:300-302`) | same |
| `cs-animated-image` | stable | `role="button"` play control with its own `aria-label` (`components/animated-image/animated-image.ts:125-127`) | same |
| `cs-time-input`, `cs-otp-input`, `cs-known-date` | experimental | inner inputs and groups (`delegatesFocus`) | same; UIUX-125 owns their API |
| `cs-accordion-item` | experimental | inner `<button>` (`components/accordion-item/accordion-item.ts:205`) | same; UIUX-125 |

### Container, landmark or dialog with its role inside: naming only

The host is not a control, but the element that owns the role, and so the name, is inside. Most already take
a `label`, which is the API. Host `aria-label` on these warns too.

| Component | Status | Role-owning element | Naming API today |
| --- | --- | --- | --- |
| `cs-radio-group`, `cs-checkbox-group` | stable | `role="radiogroup"` / `role="group"` named by the in-shadow label (`radio-group.ts:370-372`, `checkbox-group.ts:128`) | `label` (visible) |
| `cs-button-group` | stable | `role="group"` with `aria-label=${label}` (`button-group.ts:69-70`) | `label`; the name sits on a `<slot>` (UIUX-204) |
| `cs-breadcrumb`, `cs-pagination` | stable, experimental | `<nav aria-label>` (`breadcrumb.ts:90`, `pagination.ts:455`) | `label` |
| `cs-dialog`, `cs-drawer`, `cs-popover` | stable | `<dialog>` (`dialog.ts:264-266`, `drawer.ts:274-276`, `popover.ts:324`) | `label` on dialog and drawer |
| `cs-dropdown` | stable | `role="menu"` (`dropdown.ts:795`) | none |
| `cs-tab-group` | stable | `role="tablist"` (`tab-group.ts:435`) | none |
| `cs-scroller` | stable | `role="region"` with a localized name (`scroller.ts:132-133`) | none |
| `cs-avatar`, `cs-qr-code`, `cs-progress-bar`, `cs-progress-ring`, `cs-spinner` | stable | inner `role="img"` or `role="progressbar"` (`avatar.ts:82-96`, `qr-code.ts:109-110`, `progress-bar.ts:68-71`, `progress-ring.ts:69-71`, `spinner.ts:31-32`) | `label`, except the spinner |
| `cs-split-panel`, `cs-comparison` | stable | a focusable handle, `role="separator"` / `role="scrollbar"`, inside a layout container (`split-panel.ts:335-339`, `comparison.ts:137`) | none; host ARIA would describe the container, not the handle, so out of scope |

### Nothing to forward

Formatters, observers, layout and utility components (`cs-format-*`, `cs-relative-time`, `cs-*-observer`,
`cs-include`, `cs-animation`, `cs-popup`, `cs-skeleton`, `cs-card`, `cs-callout`, `cs-tag`, `cs-toast`,
`cs-tooltip`, `cs-page`, `cs-markdown`, `cs-random-content`, `cs-zoomable-frame`, `cs-badge`, `cs-tab-panel`,
`cs-accordion`). Where they have roles, the component sets them and an app has nothing to name.

---

## 3. The rule in detail

### Names

Content names the control, as on a native `<button>`. The ways that already work, measured or documented:

- Text in the default slot.
- A slotted `cs-icon` or `cs-avatar` with `label` (#173, #218; E1 shows the icon's label naming the button).
- Visually hidden text in the slot, for a name that needs more than the visible text:
  `<cs-button>Edit<span class="cs-visually-hidden"> invoice 42</span></cs-button>`. The visible text comes
  first, so 2.5.3 Label in Name holds.
- Form controls: `label` or the `label` slot. A visually hidden slotted label covers a field with no visible
  label.

No `label` property on `cs-button`. Upstream Web Awesome reached the same answer (section 5.1). If a real need
for a name that differs from content shows up, `label` is the additive answer, as Shoelace's
`sl-icon-button` and Spectrum's gen2 `accessible-label` have it.

### States an app sets: properties

- **`current`** on `cs-button` and `cs-breadcrumb-item`: the `aria-current` token
  (`page`, `step`, `location`, `date`, `time`, `true`), rendered onto the role element in `render()`. Server
  output carries it before hydration (P6). Unset means no attribute.
- **Named for the ARIA state, without `aria-`.** `current`, not `isCurrent` or `active`. The contributing
  guide has no rule for this yet; the standards entry that records this decision should add it.
- **Added on evidence only.** `expanded` and `pressed` are plausible for app-built disclosures and toggles.
  Neither has a known consumer yet. Each would be its own additive minor.

### Library wiring: an internal contract

- Each wrapped control implements one internal interface (marked `@internal`, kept out of the manifest),
  through which another Cornerstone component can add or remove a **relationship** (a labelling or
  describing element) or set a **state** (`aria-expanded`, `aria-haspopup`) on its role element.
- The control keeps those values and reapplies them in `updated()`. `cs-button` swaps `<button>` for `<a>`
  when `href` changes, so anything set once on the old element would be lost.
- Relationships use ARIA element reflection (`ariaLabelledByElements`, `ariaDescribedByElements`). A
  shadow-tree element may reference elements in its host's tree, measured in all three engines (E8, E15) and
  shipped in every supported browser (section 6.2).
- Setting a reflection property empties the matching content attribute (E8). A form control that already
  points `aria-describedby` at its own `hint` has to include that element in the same array.
- **Users:** `cs-tooltip` (instead of writing `aria-labelledby` on the anchor host), `cs-dropdown` (instead of
  `trigger.shadowRoot.querySelector('[part~="button"]')`), and `cs-breadcrumb` (sets `current` on its last
  item). A plain element, such as a native `<button>` trigger, keeps today's path: the attribute goes on
  the element itself.

### The warning

- A wrapping control warns once, when its host carries `aria-label`, `aria-labelledby`, `aria-describedby`,
  `aria-description`, `aria-current`, `aria-expanded`, `aria-pressed`, `aria-haspopup` or `aria-controls`.
- The message names the replacement: content or a slotted label, `current`, or `cs-tooltip`.
- `aria-hidden` and the live-region attributes do not warn, because they mean the same thing on the wrapper.
- It lands after the library's own writers move to the contract. Until then `cs-tooltip` and `cs-breadcrumb`
  would set it off.

### Known limits

- **Tooltip and other wiring wait for hydration.** The server cannot express a reference across a shadow
  boundary, so a server-rendered page has `current` but not the tooltip relationship until the components
  upgrade (P6, E15).
- **An app's own tooltip library, or any third-party code that writes ARIA on a `cs-*` host, gets the
  warning, not support.** That is the price of not forwarding.

---

## 4. Measured behaviour per engine and render mode

### Method

- **Tests.** Throwaway tests on this branch only: `packages/components/src/components/button/host-aria.test.ts`
  and `reference-target.test.ts`.
- **Reading the accessibility tree.** A research runner config,
  `packages/components/web-test-runner.research.config.js`, adds an `ax-node` command. It reads **each
  engine's own accessibility tree** through Playwright's `page.accessibility.snapshot()`: Chromium over CDP,
  Firefox and WebKit over Playwright's protocols. A Chromium-only command also reads the raw CDP node.
- **Engines.** Playwright 1.52.0's builds: **Chromium 136.0.7103.25, Firefox 137.0, WebKit 18.4.** These are
  older than today's stable releases. Everything measured here already works in them.
- **Both render modes.** Every case runs under `clientFixture` (client-rendered) and `hydratedFixture`
  (server-rendered with Lit SSR, then hydrated), both from `packages/components/src/internal/test/fixture.ts`.
  P6 also reads the **server output before hydration**, with `ssrFixture(..., { hydrate: false })`.
- **Prototypes.** Two throwaway prototypes, built into `dist/` like real components so the server can render
  them. Both are `cs-button` with forwarding added
  (`packages/components/src/components/proto-keep-button/`, `proto-strip-button/`).
  - `cs-proto-keep-button`: forwards and keeps the attribute on the host. Strings are rendered in the
    template; references go through element reflection. It also has `label` and `current` properties, for the
    property shape.
  - `cs-proto-strip-button`: forwards, then strips the attribute from the host after each client update. This
    is Ionic's shape.
- **Every observation is asserted**, per engine where engines differ. The final run:
  - **56 of 56 passed on each engine** for the `host-aria` group.
  - **1 of 1 on each engine** for `reference-target`.
  - 1 of 1 on Chromium with experimental web platform features on.
- **Instrument limits.**
  - WebKit's snapshot never reports a description, even for a native `<button aria-describedby>` (E11), so
    WebKit descriptions are unmeasured here.
  - No engine's snapshot reports `aria-current`, and neither does Chromium's CDP tree, even for a native
    `<a aria-current="page">` (E5's control). `aria-current` is measured as the DOM attribute on the element
    that owns the role.

### Results

**Every case gave the same result in the client-rendered and the server-rendered-then-hydrated modes**, so
the table shows one value per engine.

| Case | What | Chromium | Firefox | WebKit |
| --- | --- | --- | --- | --- |
| E1 | host `aria-label`: wrapper | generic "Account menu" | text container "Account menu" | group "Account menu" |
| E1 | host `aria-label`: inner button | button "Settings" | button "Settings" | button "Settings" |
| E2 | plus `internals.role = 'none'` | generic "Account menu" | text container "Account menu" | group "Account menu" |
| E13 | plus a `role="presentation"` attribute | generic "Account menu" | text container "Account menu" | group "Account menu" |
| E10 | plain `cs-button`, no ARIA: wrapper | generic "" | text container "" | group "" |
| E7 | `internals.ariaLabel`: wrapper / button | generic "Via internals" / button "Save" | text container "Via internals" / button "Save" | group "Via internals" / button "Save" |
| E3 | `cs-tooltip` on `cs-button`: closed / open | "Save" / "Save" | "Save" / "Save" | "Save" / "Save" |
| E4 | `cs-tooltip` on a native button: closed / open | "Save" / "Save your work" | same | same |
| E14 | labelled by a hidden node / by a visible node whose child is hidden | "Save your work" / "Save" | same | same |
| E15 | `cs-tooltip` wired onto the role element by reflection, as a name: closed / open / tooltip host hidden | "Settings" / "Account menu" / "Account menu" | same | same |
| E15 | the same, as a description: closed / open / tooltip host hidden | none / "This cannot be undone" / "This cannot be undone" | same | not reported |
| E15 | wrapper while wired | generic "" | text container "" | group "" |
| E5 | `aria-current` on an `href` host: on the inner `<a>` | absent | absent | absent |
| E9 | `cs-breadcrumb`'s last item: on the inner `<a>` | absent | absent | absent |
| E6 | host `aria-describedby`: wrapper / button description | "This cannot be undone." / none | same | not reported |
| E8 | inner button's `ariaLabelledByElements` / `ariaDescribedByElements` set to light-DOM nodes: name / description | "Account menu" / "Opens your account settings." | same | "Account menu" / not reported |
| E12 | axe, host `aria-label` | pass | pass | pass |
| P1 keep | wrapper / button | generic "Account menu" / button "Account menu" | text container "Account menu" / button "Account menu" | group "Account menu" / button "Account menu" |
| P1 keep | button after the app removes `aria-label` | "Settings" | "Settings" | "Settings" |
| P2 keep | tooltip closed / open / tooltip removed | "Save" / "Save your work" / "Save" | same | same |
| P7 keep | button after the tooltip is retargeted away | "Save" | "Save" | "Save" |
| P3 keep | inner `aria-current` after the app removes it | removed | removed | removed |
| P4 keep | wrapper / button description | "This cannot be undone." / "This cannot be undone." | same | not reported |
| P1 strip | wrapper / button | generic "" / button "Account menu" | text container "" / button "Account menu" | group "" / button "Account menu" |
| P1 strip | button after the app removes `aria-label` | **"Account menu" (stale)** | **stale** | **stale** |
| P2 strip | tooltip closed / open / tooltip removed | "Save" / "Save your work" / "Save" | same | same |
| P7 strip | button after the tooltip is retargeted away | **"Save your work" (stale)** | **stale** | **stale** |
| P3 strip | inner `aria-current` after the app removes it | **"page" (stale)** | **stale** | **stale** |
| P4 strip | wrapper / button description | none / "This cannot be undone." | same | not reported |
| P5 | `label="Home page" current="page"` properties: wrapper / inner link | generic "" / link "Home page", `aria-current="page"` | text container "" / same | group "" / same |
| P6 | server output before hydration | inner `<a>` has `aria-label` and `aria-current` from both forwarded attributes and properties; no reference attribute | same | same |
| R1 | Reference Target present (unflagged) | no | no | no |
| R1 | flagged Chromium 136: `<label for>` pointing at the host / host `aria-labelledby` / host `aria-label`, on the inner input | "Email" / "" / "" | n/a | n/a |

What the table shows:

- **Forwarding works mechanically in every engine and both modes,** for strings (P1, P3, P6) and for
  references through element reflection (E8, P2, P4).
- **Keeping the attribute on the host doubles it on the wrapper.**
  - The wrapper is named (P1 keep) and, in Chromium and Firefox, described (P4 keep).
  - No host role suppresses that. `none` and `presentation` lose to ARIA's conflict resolution in all three
    engines (E2, E13).
  - This is the shape Material Web found announced twice (section 5.2).
- **Stripping fixes the wrapper and breaks every later change.**
  - Once the attribute is gone from the host, the app's `removeAttribute` is a no-op, so no callback fires and
    the inner element keeps the old value (P1, P3).
  - `cs-tooltip`'s clean-up reads the host attribute, finds nothing, and leaves the button labelled by a
    tooltip that now belongs to another element (P7).
  - Removing the tooltip element only looked clean because element reflection ignores disconnected elements
    (P2).
- **Properties and direct wiring leave the wrapper clean** (P5, E15) and survive change, because the
  component owns the value.
- **`cs-tooltip` needs its own fix for the closed state.** Its text counts only while open (E4, E15), because
  its host is visible and its body is hidden. A tooltip host that is itself hidden while closed would lend
  its text, as name or description, in every engine (E15, E14).
- **`ElementInternals` names the wrapper, not the control** (E7), as the spec says it should (section 6.1).
- **Reference Target does not touch attributes on the host** (R1, flagged Chromium). It does what it is for:
  `<label for>` pointing at the host reached the inner input.
- **WebKit always exposes the `cs-button` host as a group**, even with no ARIA at all (E10).

---

## 5. What Web Awesome and other libraries do

Sources read on 2026-10-09 at the commits linked.

### 5.1 Web Awesome upstream

- **Fork point.** `packages/components/NOTICE` records upstream `next` at `63f2b66` (2026-08-11): v3.11.0 plus
  19 commits. Latest release v3.14.0 (2026-09-24); `next` at `e99dc5e` (2026-10-01).
- **`wa-button` forwards nothing but `title`**, at the fork and on `next`
  ([button.ts L300-L347 @ 63f2b66](https://github.com/shoelace-style/webawesome/blob/63f2b66ddc48f0d66574d2e9c2076dbf60fb8fb5/packages/webawesome/src/components/button/button.ts#L300-L347)).
  - It has no `label` property.
  - The only change since the fork is `aria-busy` from PR #2694, the loading fix tracked here as UIUX-203.
- **Its maintainers refused host `aria-label` forwarding.** PR #2345, "Add support for aria-label to
  wa-button", was closed unmerged on 2026-05-01.
  - Konnor Rogers: "This is generally _not_ the way to do this. Instead, we should look at supporting
    cross-root aria... the aria-label gets read twice."
  - Cory LaViska: "For icon buttons, the label is read from the icon itself... We don't map ARIA attributes by
    convention, and this will cause two labels to display in the AOM."
- **The stated policy** is from a review on PR #1723, rejecting reference properties on `wa-dialog`
  ([r2494272331](https://github.com/shoelace-style/webawesome/pull/1723#discussion_r2494272331)): "This is
  not a pattern we use in the library. All labels and descriptions are abstracted into `label` and
  `description` properties, oftentimes with corresponding slots for HTML content."
- **`wa-tooltip` still writes its id into the anchor host's `aria-labelledby`.** The code and the "once we have
  cross-root aria, we can revisit" comment are unchanged from the fork through `next`.
- **`wa-dropdown` reaches into the trigger's shadow root** for `aria-haspopup` and `aria-expanded`
  ([dropdown.ts L742-L767 @ e99dc5e](https://github.com/shoelace-style/webawesome/blob/e99dc5e26ae63410bd481aa8a686a61ff7158ccd/packages/webawesome/src/components/dropdown/dropdown.ts#L742-L767)),
  the same reach-in Cornerstone inherited.
- **Related, still open upstream:**
  - Issue #2863: `wa-button-group`'s `label` sits on a `<slot>`.
  - PR #2924 (2026-10-08) moves it to `internals.role` and `internals.ariaLabel` on the host. That is the same
    defect as UIUX-204.
- **Shoelace 2** (v2.20.1): `sl-icon-button` has a `label` property, rendered as `aria-label` on its inner
  button or link
  ([icon-button.component.ts L115](https://github.com/shoelace-style/shoelace/blob/v2.20.1/src/components/icon-button/icon-button.component.ts#L115)).
  `sl-button` forwards only `title`.

### 5.2 Other libraries

**Material Web** (2.5.0, `main` at `47adb65`)

- **v1 forwarded and kept**, with `role="presentation"` on the host
  ([v1.5.1 delegate.ts L11-L58](https://github.com/material-components/material-web/blob/v1.5.1/internal/aria/delegate.ts#L11-L58)).
- **v2.0.0 (2024-07-25) replaced that** in commit `5df9410e`, "fix!: aria-labels announcing twice with 'group'
  on components".
  - Host `aria-*` now moves into `data-aria-*`, and `getAttribute`/`removeAttribute` and the ARIA reflection
    properties are overridden so later changes still work
    ([delegate.ts L81-L194 @ 47adb65](https://github.com/material-components/material-web/blob/47adb655bd7a88c4d62e8faac2873084eed555dc/internal/aria/delegate.ts#L81-L194)).
  - It was a breaking change: `querySelector('[aria-label=...]')` stopped matching, and they ship an
    `ariaSelector()` migration helper.
  - Reference attributes are documented as unsupported.
  - Under Lit SSR it does nothing, and moves the attributes on hydration.

**Ionic** (`main` at `6b5afec`)

- **Copy and strip.** `inheritAttributes` copies each host attribute, then removes it
  ([helpers.ts L105-L119](https://github.com/ionic-team/ionic-framework/blob/6b5afec5b8d2a8df79c014120b5be5b4fbb2a2cb/core/src/utils/helpers.ts#L105-L119)).
- **Later changes are recent and partial.** `ion-button` picked them up only in September 2026 (PR #31264,
  v9.0.5), through a `MutationObserver`.
- **Its own caveat** (`attribute-controller.ts` L14-L20): "a value written after load sits on the host as well
  as on the element it is applied to... an attribute from the initial markup can never be removed, only
  overwritten." That is P1 and P3 strip.
- **References are copied as strings**, and are known not to resolve (issue #28287).

**FAST Foundation 2.x**

- **Mirrors without stripping.** `DelegatesARIAButton` binds 21 attributes, references included, from host to
  inner `<button>`
  ([button.ts L262-L289](https://github.com/microsoft/fast/blob/fd9068b94e4aa8d2282f0cce613f58436fae955d/packages/web-components/fast-foundation/src/button/button.ts#L262-L289)).
- That is the keep shape, with references copied as strings.

**The host is the control** (no split, so nothing to forward):

- **Fluent UI web components v3** sets `elementInternals.role = 'button'` and has no inner `<button>`
  ([button.base.ts L255-L258](https://github.com/microsoft/fluentui/blob/6e52576d457f0ca13225ea2712e0db7bd1c27e28/packages/web-components/src/button/button.base.ts#L255-L258)).
  Its link variant uses `role = 'link'` with an `inert` proxy `<a>`.
- **Spectrum Web Components 1st-gen** puts `role` and `tabindex` on the host
  ([ButtonBase.ts L205-L224](https://github.com/adobe/spectrum-web-components/blob/be922808ae0dc5eb4cded7541c12265254a31b2d/1st-gen/packages/button/src/ButtonBase.ts#L205-L224)).
- **Lion** puts `role="button"` on the host
  ([LionButton.js L135-L140](https://github.com/ing-bank/lion/blob/30fe86cbd429c68b4bc84f519e8a93275d3dddf2/packages/ui/components/button/src/LionButton.js#L135-L140))
  and keeps form inputs in light DOM.

**Spectrum Web Components gen2** (2.0.0-beta.4)

- **Moved back to an inner native `<button>` with a property**, `accessible-label`, "forwarded to the internal
  `<button>` element as `aria-label`" (`gen2/packages/core/components/button/Button.base.ts` L63-L67 at
  `be92280`).
- Its migration notes say the host "must not take `role="button"`", and they defer cross-boundary
  `aria-labelledby`/`aria-describedby`.

**What the comparison says:**

- The two Lit libraries with an inner native element that tried keep (Material v1, FAST) are the evidence
  against it; Material reversed it.
- The two that strip (Material v2, Ionic) both document the cost.
- The two newest designs closest to Cornerstone (Web Awesome's 2026 refusal and Spectrum's gen2 rewrite) chose
  properties and slotted labels.
- **None of these libraries uses element reflection for references.** Cornerstone would be first, inside its
  own components only.

---

## 6. The platform

### 6.1 `ElementInternals` sets the host's own semantics

- `internals.role` "Sets or retrieves the default ARIA role for internals's target element, which will be used
  unless the page author overrides it" and the same holds for each `aria*` property
  ([HTML source L80358-L80367 @ 877d614](https://github.com/whatwg/html/blob/877d6146487f15b15bc8dd0e3c625063a37b456a/source#L80358-L80367)).
- The target element is the custom element itself, the host. Measured: `internals.ariaLabel` named the
  wrapper and left the button alone (E7).
- An author's attribute overrides the internals default, so internals cannot hide or replace an app's host
  ARIA either (E2).

### 6.2 ARIA element reflection reaches outward, and ships everywhere

- **The rule.** The HTML spec returns an explicitly set element only "If reflectedTarget's explicitly set
  attr-element is a descendant of any of element's shadow-including ancestors"
  ([source L9147-L9151](https://github.com/whatwg/html/blob/877d6146487f15b15bc8dd0e3c625063a37b456a/source#L9147-L9151)).
  - So an element inside a shadow root may reference its own tree or any tree above it, up to the document.
  - It may not reference into another component's shadow root.
  - MDN says the same in its reflected-attributes guide: references "can target elements in the same scope or a
    parent scope. Elements in nested scopes are not accessible."
- **A side effect.** Setting the property also sets the content attribute to `""` (setter, L9194-L9201),
  measured in E8.
- **Shipped** (browser-compat-data, cross-checked with chromestatus):
  - Safari 16.4 (2023-03-27).
  - Chrome 135 (2025-04-01).
  - Firefox 136 (2025-03-04).
  - This covers `ariaLabelledByElements`, `ariaDescribedByElements`, `ariaControlsElements`,
    `ariaDetailsElements` and `ariaActiveDescendantElement`. All are inside Cornerstone's "latest two major
    versions" policy (`packages/docs/src/content/docs/resources/browser-support.md`).
- **Not serializable.** The server cannot write such a reference into declarative shadow DOM. The Reference
  Target explainer lists "a serializable way to create references from elements in shadow DOM to elements in
  light DOM" as a non-goal.

### 6.3 Reference Target (cross-root ARIA)

- **What it does.** It redirects a reference that points **at** a host to an element inside the host. That
  covers `for`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `popovertarget`, `commandfor` and
  other reference attributes.
- **What it does not do.** Its explainer's non-goals include: "Allow attributes on the host to be 'forwarded'
  to the enclosed element. For example, to allow `role` or `aria-label` on the host to be applied to the
  enclosed element"
  (`WICG/webcomponents` `proposals/reference-target-explainer.md` L236-L237 at `21c29a63`).
  - Measured in flagged Chromium: `<label for>` reached the inner input, while host `aria-label` and host
    `aria-labelledby` did not (R1).
  - Every gap in this issue is an attribute **on** a host. The tooltip's `aria-labelledby` is one too.
- **Status on 2026-10-09:**
  - **Spec:** WHATWG HTML [#10995](https://github.com/whatwg/html/pull/10995) and DOM
    [#1353](https://github.com/whatwg/dom/pull/1353) are open.
  - **Chromium:** shipped by default in **Chrome 152 (stable 2026-08-25)**, after an origin trial in M133-M135.
  - **Firefox:** positive standards position
    ([mozilla/standards-positions#1035](https://github.com/mozilla/standards-positions/issues/1035)). Behind
    `dom.shadowdom.referenceTarget.enabled` since Firefox 144; meta bug 1952585 is open.
  - **WebKit:** no position
    ([WebKit/standards-positions#356](https://github.com/WebKit/standards-positions/issues/356)).
    Implemented, but the preference defaults off.
  - **Interop:** not selected for Interop 2025 (#792) or Interop 2026 (#1011). An Interop 2027 proposal
    (#1333) is open.
- **For Cornerstone** it is the future answer to `<label for="a-cs-input">` and to pointing `aria-controls` at
  a `cs-*` host. It is not an answer to this issue.
- **The proposal that would be,** an ARIA delegation API on the shadow root or on internals
  ([WICG/webcomponents#917](https://github.com/WICG/webcomponents/issues/917)), has had no activity since
  2024-08-17.

### 6.4 WAI-ARIA rules

- **An autonomous custom element with no `role` is `generic`** (HTML-AAM, autonomous custom elements).
- **`aria-label` and `aria-labelledby` are prohibited on `generic`**
  ([WAI-ARIA 1.2, generic](https://www.w3.org/TR/wai-aria-1.2/#generic);
  [roles which cannot be named](https://www.w3.org/TR/wai-aria-1.2/#namefromprohibited)).
  "Authors MUST NOT specify a prohibited state or property"
  ([§5.2.5](https://www.w3.org/TR/wai-aria-1.2/#prohibitedattributes)). So host `aria-label` on `cs-button` is
  an authoring error under ARIA, and engines still expose it on the wrapper (E1).
- **States do not pass to descendants.** "States and properties are inherited from superclass roles in the
  Roles Model, not from ancestor elements in the DOM tree"
  ([§5.2.4](https://www.w3.org/TR/wai-aria-1.2/#inheritedattributes)). `aria-current` on the wrapper marks the
  wrapper, not the link.

---

## 7. How the rule applies to `cs-tree-item` and `cs-dropdown-item`

Both own their role on the host today (inventory). An app's `aria-current="page"`, `aria-label` or
`aria-describedby` on either host already lands on the `treeitem` or `menuitem`. Whatever
[#179](https://github.com/CruGlobal/cornerstone-design-system/issues/179) picks, the rule holds:

- **`href` with the role kept on the host** (the item navigates; its host stays the `treeitem` or
  `menuitem`):
  - Host ARIA keeps working, and nothing warns.
  - For one API across the library, the item should also take **`current`** with its `href`. On these
    components it simply sets the host's own `aria-current`.
  - #179 owns adding it.
- **The role moved onto an inner `<a>`** (the APG navigation-tree shape, `<a role="treeitem" href>`):
  - The host becomes a wrapper exactly like `cs-button`. It takes `current`, the internal contract and the
    warning.
  - Everything the components and their parents set on the host today moves inside: `role`, roving
    `tabindex`, `aria-selected`, `aria-expanded`, `aria-checked`, `aria-disabled`
    (`dropdown-item.ts:115-139`, `tree-item.ts:117-122`, `245-279`).
  - So does every lookup by host role (`tree.ts:424`, `tree-item.ts:80`).
  - That is a large change and a reason for #179 to keep the role on the host, but this rule does not decide
    it.
- **Either way, apps write the same markup:** `<cs-tree-item href="/x" current="page">`. Because `current` is
  the API, #179 can move the role later without breaking apps. Host `aria-current` would break the day the
  role moved inside.

---

## 8. Shapes weighed

- **Forward a fixed set and keep it on the host** (Material v1, FAST). Rejected.
  - The wrapper takes the same name and description as the control in every engine (P1, P4 keep), and no host
    role can stop that (E2, E13).
  - Material reported it announced twice and broke its API to undo it. Web Awesome refused it for the same
    reason.
- **Forward a fixed set and strip it from the host** (Ionic, Material v2). Rejected; the runner-up if the
  accessibility review wants app-written ARIA to work.
  - **Every later change is lost** unless the DOM methods are overridden as Material does (P1, P3, P7 strip).
  - **It removes attributes apps can see.**
    - `cs-button[aria-label="Close"]` stops matching, in app code and in end-to-end tests.
    - A DOM patcher that morphs by comparing the element's real attribute list will disagree with the
      component about what is there. Turbo (#215) and WordPress-delivered pages are Cornerstone's next
      consumers. Not tested here.
    - After 1.0.0 it would be a major change. Material needed one.
  - **References still need element reflection on top.**
- **Component properties (`label`, `current`).**
  - **Taken for states, starting with `current`.** It renders in both modes and before hydration (P5, P6),
    leaves the wrapper clean, and survives change.
  - **Not taken for names.** Content already names the control, and upstream's `label` policy is about
    components with no content to name them.
- **Wait for the platform.** Reference Target redirects references **to** a host and never forwards attributes
  set **on** one (explainer non-goal, measured in R1). The proposal that would forward them is dormant. Waiting
  answers a different question.
- **Say no and document the slotted label.** Taken for names. The slotted `cs-icon` or `cs-avatar` `label`
  names an icon-only button and keeps working. On its own it does nothing for `aria-current`, descriptions or
  the tooltip, which is why the rule adds `current` and the contract.
- **Make the host the control** (Fluent v3, Spectrum 1st-gen, Lion). Rejected.
  - A host with `role="link"` is not a link: no middle-click, no open in new tab, no status-bar preview. That
    is exactly what #179 is trying to add.
  - It would rewrite every part and the focus model of a stable component.
- **A host role to hide the wrapper** (`internals.role = 'none'` or a `role="presentation"` attribute).
  Measured to change nothing once an ARIA attribute is present (E2, E13).

---

## 9. Cost on the public API

`docs/standards/api-surface.md` puts the attributes, properties and behaviour of a `@status stable` component
on the public surface. Cornerstone is at `0.7.0` (`packages/components/package.json`). One PR per component;
a bug found along the way gets its own.

| Change | Before 1.0.0 | After 1.0.0 | Bump | Category |
| --- | --- | --- | --- | --- |
| `current` on `cs-button` (unblocks the nav example held in UIUX-210) | additive | additive | minor | `Added:` |
| `current` on `cs-breadcrumb-item` | additive | additive | minor | `Added:` |
| `cs-breadcrumb` sets `current` on its last item, so the link is marked | fix | fix | patch | `Fixed:` |
| The internal contract, with `cs-tooltip` wiring onto the control's role element | no public surface | no public surface | patch | `Fixed:` |
| `cs-dropdown` uses the contract instead of reaching into `cs-button` | no public surface | no public surface | patch | `Changed:` |
| `cs-tooltip` text present while closed (hide its host when closed) | fix | fix | patch | `Fixed:` |
| `cs-tooltip` describes rather than names, if the review agrees | cheap | a behaviour change on a stable component | minor | `Changed:` |
| The warning for ARIA on a wrapper host, after the library's own writers move | behaviour, no surface | same | patch | `Added:` |
| Docs: the accessibility page's cross-root line, the tooltip page's claim, the Button nav example | | | patch | `Fixed:` |
| `current` on `cs-dropdown-item`, `cs-tree-item` with #179's link API | additive | additive | minor (with #179) | `Added:` |
| Rejected: forward and keep | additive | additive | minor | |
| Rejected: forward and strip | behaviour change | breaking | major after 1.0.0 | |
| Not now: `label` on `cs-button` | additive | additive | minor | |

What 1.0.0 locks: **`cs-tooltip`'s ARIA output**, and **not adding forwarding or properties that would have to
come out later**. Everything recommended here can otherwise land in a minor or a patch, before or after
1.0.0.

---

## 10. Found along the way

Each is its own ticket or PR.

- **`cs-breadcrumb` sets `aria-current` on the item host** (`breadcrumb.ts:73`), which never reaches the inner
  `<a>` (E9). The last item without `href` also renders a `<button>` that does nothing
  (`breadcrumb-item.ts:96-101`), so the current page is announced as a button.
- **`cs-tooltip`'s text is missing whenever it is closed** (E4, E15), including the moment focus arrives,
  since it opens after `showDelay` (150 ms, `tooltip.ts:82`).
- **`cs-tooltip` replaces the anchor's name.** It uses `aria-labelledby`; the comment at
  `tooltip.ts:338-342` says so and defers the question "once we have cross-root aria". On a button with
  visible text, a tooltip whose text does not start with the visible label fails 2.5.3 Label in Name.
- **The docs overclaim.**
  - The tooltip page says Cornerstone "wires up positioning and accessibility for you"
    (`packages/docs/src/content/docs/components/tooltip.md:22`).
  - The accessibility page says "ARIA references cannot cross a shadow root"
    (`packages/docs/src/content/docs/resources/accessibility.md:57-58`). That is still true of the
    attributes, but element reflection now crosses outward (E8).
  - Both pages are Anna's.
- **axe cannot see any of this** (E12, P1). Tests for the work have to read the accessibility tree on all three
  engines. That is what #223's snapshot plugin (UIUX-193) adds; the research config here does it in about
  forty lines and could seed it.
- **Upstream has two fixes Cornerstone has not taken:** PR #2694 (loading keeps the label, UIUX-203) and PR
  #2924 (button-group label off the `<slot>`, UIUX-204).

---

## 11. Open questions for the accessibility reviewer

Each names what the code does, measured, so a ruling can be checked against it. None of it has been tried
with a screen reader, and the accessibility page's gap table says no component has been
("Screen reader verification").

1. **No forwarding: is a warning enough?**
   - The rule declines host ARIA on a wrapper control and warns. So an app's `aria-label` on `cs-button`, or a
     third-party tooltip library, still fails, only no longer silently.
   - The alternative is Material's strip-and-virtualize, where app ARIA works and the wrapper stays clean,
     at the cost in section 8.
   - The double announcement under forward-and-keep comes from Material's and Web Awesome's reports, not from
     a screen reader run here. What is measured here is the wrapper exposure (P1, P4 keep).
   - This is the deciding question.
2. **Names from content only.** Is content plus the slotted `label` plus visually hidden text enough for
   `cs-button`, or does it need a `label` property for names that differ from the content?
3. **`current`.**
   - Which tokens should it accept?
   - What visible signal goes with it? #174 found plain-to-filled is 1.25 to 1.47:1 and gone in forced colours.
4. **`cs-tooltip`: name or description?**
   - Today it names the anchor (`aria-labelledby`), which replaces visible text.
   - The APG tooltip pattern describes. For an icon-only button the tooltip text is usually the name.
   - Should `cs-tooltip` describe by default, and should an icon-only button keep its slotted label as its
     name?
5. **`cs-tooltip` while closed.** Hiding the tooltip host while closed makes its text available at the moment
   focus arrives (E15). Is text that is exposed but not yet shown acceptable here, as it is for a hidden
   description?
6. **Before hydration.** A server-rendered page carries `current` but not the tooltip wiring until the
   components upgrade (P6). Acceptable?
7. **Form fields with no visible label.** The rule's answer is a visually hidden slotted `label`, not host
   `aria-label`. Agreed?
8. **WebKit's wrapper group.** WebKit exposes every `cs-button` host as an unnamed `group`, with or without
   ARIA (E10). Does VoiceOver announce it? If it does, that is a separate defect.

---

## 12. Rerunning

From `packages/components` on this branch, after `SKIP_SLOW_STEPS=true npm run build`:

```sh
WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js --group host-aria
WTR_CONCURRENCY=1 npx web-test-runner --config web-test-runner.research.config.js --group reference-target
npx web-test-runner --config web-test-runner.reftarget.config.js --group reference-target   # flagged Chromium
```

Each observation is also logged as a `HOSTARIA {json}` line in the browser logs.
