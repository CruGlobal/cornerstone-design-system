# An avatar as the trigger for a cs-dropdown

Research for [#173](https://github.com/CruGlobal/cornerstone-design-system/issues/173), "Decide how an avatar can
be the trigger for a cs-dropdown". It also covers the badge half of the same rule
([#217](https://github.com/CruGlobal/cornerstone-design-system/issues/217), UIUX-141) and notes what it means for
[#174](https://github.com/CruGlobal/cornerstone-design-system/issues/174).

Researched on 2026-10-09 against `main` at `8a301fb` (`@cruglobal/cornerstone-components` 0.6.2). Repo paths
below are relative to the repo root, with line numbers at that commit.

**How the claims were checked.** The source was read first. Then the library was built in this worktree and
each pattern was rendered in Chromium, Firefox and WebKit with Playwright. The probe measured the
`icon-button` state, box sizes, the accessible name, the Tab order and the keyboard path. Every measured number
below was the same in all three engines. Names were read two ways: Playwright's own accessible-name code (all
three engines) and Chromium's real accessibility tree. Server output was checked by rendering a button with
`@lit-labs/ssr` in Node. The probe scripts were throwaway and are not committed.

## Short answer

Change a component: `cs-button`. Let its icon-button check accept a lone `<cs-avatar>` the way it accepts a
lone `<cs-icon>`, and let it ignore `<cs-badge>`. That one rule fixes both #173 and #217. The avatar's `label`
already becomes the button's name, and the keyboard path already works. Only the button's shape is wrong
today. Details are in the [Recommendation](#recommendation).

## What happens today

### A bare avatar as the trigger does not work for keyboard users

- `cs-dropdown` opens only when the trigger slot gets a click: `@click=${this.handleTriggerClick}` on the
  `trigger` slot (`packages/components/src/components/dropdown/dropdown.ts:786-789`, `535-537`). It adds no key
  handling to the trigger while the menu is closed. Its document `keydown` listener is attached only in
  `showMenu()` (`dropdown.ts:263`).
- `cs-avatar` renders no focusable element. Its inner element is an `<img>`, a `<div>` or a `<slot>` with
  `role="img"` (`packages/components/src/components/avatar/avatar.ts:75-103`).
- Measured: the bare avatar has `tabIndex` -1 and Tab skips it in all three engines. A mouse click opens the
  menu. Nothing on the keyboard does.
- `cs-dropdown` also writes `aria-haspopup="menu"` and `aria-expanded` onto any trigger that is not a
  `cs-button` (`dropdown.ts:751-764`). Measured: both attributes land on the `<cs-avatar>` host, which has no
  role. They mean nothing there.
- The slot's own docs say the trigger should be "a `<cs-button>` or `<button>`" (`dropdown.ts:45`).

This matches Flightdeck's first finding. See the message of commit `73506620` in
`~/CruGlobal/flightdeck-cornerstone-port`.

### An avatar inside a cs-button works, but keeps the padded shape

Flightdeck's commit `30f9a625` used this markup (`app/views/shared/_user_menu.html.erb`):

```html
<cs-button slot="trigger" appearance="plain" pill>
  <cs-avatar image="..." initials="..." label="Account menu" style="--size: 2em"></cs-avatar>
</cs-button>
```

Measured with the same markup:

| What | Result |
| --- | --- |
| Keyboard | Tab reaches the inner `<button>`. Enter opens the menu and moves focus to the first item. Escape closes it and returns focus to the `cs-button`. |
| ARIA | `aria-haspopup="menu"` on the inner button, and `aria-expanded` flips from `false` to `true`. |
| Accessible name | "Account menu" in all three engines and in Chromium's tree. |
| `icon-button` state | Not set. |
| Button box | 59.6 x 43 px: 16 px padding on each side of the avatar. |
| Avatar box | 25.6 x 25.6 px, not the 32 px that `2em` suggests. See [The avatar's size](#the-avatars-size). |

So the behavior is right and the shape is wrong. Commit `73506620` then swapped the avatar for an
`account_circle` icon button "matching the other header icon buttons (43x43)", and the profile photo went with
it. The issue's comment names the padding as the reason the wrapped version was dropped.

### Why the button keeps its padded shape: the icon-button check

`handleLabelSlotChange()` (`packages/components/src/components/button/button.ts:198-239`) reads only the
default slot. It sets the `icon-button` custom state when:

- at least one slotted element is a `cs-icon`,
- no slotted element is anything else (`button.ts:216-219`), and
- no text node holds more than whitespace (`button.ts:220-226`).

A `cs-avatar` counts as "anything else", so the state stays off.

What the state changes (`packages/components/src/components/button/button.styles.ts`):

- `.button.is-icon-button` sets `width: var(--cs-form-control-height)` and `aspect-ratio: 1`, plus
  `outline-offset: 2px` (`243-247`). It does not remove the padding. The button is square only because the
  host styles make every box `border-box` (`packages/components/src/styles/component/host.styles.ts:4-12`), so
  the padding sits inside the fixed width. Two tests depend on this: `native-styles.test.ts:46-68` and
  `details.test.ts:228-247`.
- With `with-caret`, the width goes back to auto with a minimum of the control height (`250-254`).
- `.is-icon-button .label` becomes a centered flex box (`280-283`).

`--cs-form-control-height` is `round(2 x 0.75em + 1em x 1.2, 1px)`
(`packages/components/src/styles/themes/cru.css:384-389`, `267`). That is 43 px at `size="m"` and 54 px at
`size="l"`, both measured. With 1 em of inline padding (`cru.css:385`), the content box of a 43 px icon button
is only 11 px wide. A larger graphic overflows it, centered, because the button and the label both center
their content (`button.styles.ts:24-26`, `280-283`).

The state's JSDoc says the same thing in words: "Applied when the button contains only a `<cs-icon>` with no
other content" (`button.ts:44`). So does the Button page (`packages/docs/src/content/docs/components/button.md:125`).

### The badge case (#217) is the same rule

- The button pins a `cs-badge` to its top corner from any slot. It uses `position: absolute`, so the badge
  takes no space (`button.styles.ts:340-351`; `:has(cs-badge)` gives the host `position: relative`, `11-20`).
- The check still counts a badge in the default slot as "anything else". Measured: icon plus badge in the
  default slot gives a 54 x 43 button with no `icon-button` state. Moving the badge to `slot="end"` gives
  43 x 43 with the state, which is what the Button page now tells people to do (`button.md:141-154`, from #192).
- Upstream history explains it. Web Awesome's first version of the check counted only text, so a badge was
  ignored. PR [shoelace-style/webawesome#1590](https://github.com/shoelace-style/webawesome/pull/1590) fixed
  [#1475](https://github.com/shoelace-style/webawesome/issues/1475): a `<span>` next to an icon wrongly made
  the button square. The fix counts every non-icon element, and that is what started catching the badge.

So the rule has two sides with one cause: the check asks "is every element a `cs-icon`?" when the layout
question is "is everything that takes up space a graphic?"

### How the button gets its accessible name

Measured, with the same results in Playwright's name code (all three engines) and in Chromium's tree:

| Markup inside `<cs-button>` | Button's name |
| --- | --- |
| `<cs-avatar initials="JD" label="Account menu">` | "Account menu" |
| `<cs-avatar image="..." label="Account menu">` | "Account menu" |
| `<cs-avatar initials="JD">` (no label) | none, and no console warning |
| `<cs-avatar image="..." label="Jane Doe">` | "Jane Doe" |
| `<cs-button aria-label="Account menu">` around `<cs-avatar label="Jane Doe">` | "Jane Doe". The host's `aria-label` lands on a generic element and never reaches the inner button. |

What this shows:

- The avatar's `label` becomes the button's name. The avatar puts it on its `role="img"` element as
  `aria-label` (`avatar.ts:82-83`, `91`, `96`), and a button takes its name from its content
  ([WAI-ARIA 1.2, button](https://www.w3.org/TR/wai-aria-1.2/#button)). This is the same path the icon button
  uses: the `cs-icon`'s `label` names the button (`button.test.ts:323-333`).
- The visible initials never reach the name. With no label, the button has no name at all.
- `cs-button` has no `label` attribute, and `aria-label` on the host does not name it. ARIA forbids naming a
  generic element ([WAI-ARIA 1.2, roles that cannot be named](https://www.w3.org/TR/wai-aria-1.2/#generic)).
  So today the slotted graphic's `label` is the only way to name an icon-only `cs-button`.
- The unlabelled warning (`button.ts:233-238`) runs only when the `icon-button` state is on. An avatar never
  turns it on, so an unnamed avatar button is silent today.
- The Avatar page tells authors to describe the picture ("Avatar of a gray tabby kitten looking down",
  `packages/docs/src/content/docs/components/avatar.md:21`, `33`). Inside a button that guidance gives the
  wrong name. The W3C images tutorial says an image inside a button is a functional image, and its text "should
  convey the action that will be initiated ... rather than a description of the image"
  ([W3C WAI, Functional Images](https://www.w3.org/WAI/tutorials/images/functional/)).

### The avatar's size

- `cs-avatar` sets `--size: 3rem` on `:host` (`packages/components/src/components/avatar/avatar.styles.ts:5`).
  That is 48 px, bigger than the 43 px button at `size="m"`. Because it is `rem`, it does not grow or shrink
  with the button's `size`.
- **`--size` in `em` does not give the size you ask for.** The host uses `width: var(--size)`, and also
  `font-size: calc(var(--size) * 0.4)` (`avatar.styles.ts:11-15`). The `em` in `width` is measured against the
  avatar's own font size, which is already 0.4 x `--size`. So `--size: 2em` comes out at 2 x 0.8 = 1.6 em.
  Measured: 25.6 px at a 16 px font size, in all three engines. `--size: 2rem` gives 32 px as expected.
- Under [#182](https://github.com/CruGlobal/cornerstone-design-system/issues/182), `--size` becomes
  `--cs-avatar-size`, read with a fallback, with nothing set on `:host` (work tracked as UIUX-197). That rename
  touches the same lines.

### Server rendering

The `icon-button` state is set only inside a `slotchange` handler (`button.ts:198-231`, `315`). Lit does not run
event handlers on the server (`packages/docs/src/content/docs/resources/contributing.md:401`). Checked:
server-rendering `<cs-button><cs-icon label="Account menu"></cs-icon></cs-button>` gives
`<button part="button" class=" button " ...>` with no `is-icon-button` class. So every server-rendered icon
button paints padded and becomes square when it hydrates. This is true today for plain icons, not only avatars.

### A CSS-only workaround works today

```css
.avatar-trigger::part(button) {
  padding: 0;
  width: var(--cs-form-control-height);
  aspect-ratio: 1;
}
```

Measured: 43 x 43 at `size="m"` and 54 x 54 at `size="l"`, with the name unchanged. It does not set the
`icon-button` state, so it misses the state's `outline-offset: 2px`, and nothing that checks
`:state(icon-button)` sees it. It also leaves the avatar's size to the app.

### What already exists in the docs

- The Dropdown page uses only text `cs-button` triggers (`packages/docs/src/content/docs/components/dropdown.md:20`
  and every example after it). It has no icon-button trigger and no avatar trigger.
- The Avatar page has no example of an avatar in a button or a menu (`avatar.md`).
- No docs page, pattern or example in `packages/docs/src` shows an account menu (searched for `account_circle`,
  "account menu", "user menu" and "profile menu").

## How other systems do it

### Web Awesome (upstream)

- `wa-button` on `next` (`e99dc5e`, 2026-10-01) has the same check as Cornerstone, apart from the label test noted below. Only
  `wa-icon` counts, and every other element turns the state off
  ([button.ts](https://github.com/shoelace-style/webawesome/blob/e99dc5e26ae63410bd481aa8a686a61ff7158ccd/packages/webawesome/src/components/button/button.ts#L215-L253)).
  The only change since Cornerstone's fork point (`63f2b66`, recorded in `packages/components/NOTICE`) is an
  added `aria-busy`. Upstream still has the `label !== undefined` check, which Cornerstone fixed
  (`packages/docs/src/content/docs/resources/changelog.md:111`).
- The icon-button styles also match: fixed width, `aspect-ratio: 1`, `outline-offset: 2px`, and the badge
  pinned with `position: absolute`
  ([button.styles.ts](https://github.com/shoelace-style/webawesome/blob/e99dc5e26ae63410bd481aa8a686a61ff7158ccd/packages/webawesome/src/components/button/button.styles.ts#L243-L254)).
- Detection replaced a separate `<wa-icon-button>`. The proposal was "We should be able to do that with slot
  detection", and the button "could throw a warning in the console if they forget a label"
  ([#164](https://github.com/shoelace-style/webawesome/issues/164), built in
  [#1030](https://github.com/shoelace-style/webawesome/pull/1030)).
- The upstream Avatar, Button and Dropdown docs have no avatar-trigger example, and no upstream issue
  discusses one (searched "avatar dropdown", "avatar button", "icon button badge").

### Shoelace (Web Awesome's predecessor)

- Icon buttons are a separate component. `sl-icon-button` takes a `label` and puts it on its own button as
  `aria-label`, so the name lives on the control, not the image
  ([icon-button.component.ts](https://github.com/shoelace-style/shoelace/blob/25bd8ec776609670a932f21390be59a495df497d/src/components/icon-button/icon-button.component.ts#L54-L57), line 115).
  It shows an icon only, not an avatar.
- `sl-dropdown` looks for "the first tabbable element in the trigger slot" and writes `aria-haspopup` and
  `aria-expanded` there
  ([dropdown.component.ts](https://github.com/shoelace-style/shoelace/blob/25bd8ec776609670a932f21390be59a495df497d/src/components/dropdown/dropdown.component.ts#L300-L330)).
  A bare `sl-avatar` is not tabbable, so Shoelace has the same gap as Cornerstone.

### GitHub Primer

- `IconButton` is a separate component, and its types require `aria-label` or `aria-labelledby` on the button
  itself
  ([Button/types.ts](https://github.com/primer/react/blob/7f5303d803986887187d86dcebaeda22a4dc6823/packages/react/src/Button/types.ts#L16-L18),
  [`IconButtonProps`](https://github.com/primer/react/blob/7f5303d803986887187d86dcebaeda22a4dc6823/packages/react/src/Button/types.ts#L99-L111)).
- Instead of a slotted badge, `IconButton` has a built-in `notificationIndicator`, and "Consumers are
  responsible for communicating the indicator's meaning through an accessible label or description" (same
  file, lines 101-105).
- For an avatar that does something, Primer's Avatar docs say to "provide alt text that helps convey the
  function", for example `@kittenuser profile` rather than `@kittenuser`
  ([Primer Avatar, Accessibility](https://primer.style/view-components/components/beta/avatar)). That is
  written for a link, and it names both the person and the function.

### Material UI (MUI)

- MUI's own "Account menu" demo puts an `<Avatar>` with initials inside an `<IconButton>`, sets
  `aria-haspopup` and `aria-expanded` on the button, and wraps it in `<Tooltip title="Account settings">`
  ([AccountMenu.tsx](https://github.com/mui/material-ui/blob/41c9cb4030274f3bde585d136949f447674e728b/docs/data/material/components/menus/AccountMenu.tsx#L29-L40)).
- The tooltip's title becomes the button's `aria-label` (`describeChild` is false by default), so the button
  is named "Account settings", not by the initials
  ([Tooltip.js](https://github.com/mui/material-ui/blob/41c9cb4030274f3bde585d136949f447674e728b/packages/mui-material/src/Tooltip/Tooltip.js#L523-L528)).
- `IconButton` accepts any child. Its shape comes from padding (8 px, or 5 px when small) and
  `border-radius: 50%`, not from checking what it contains
  ([IconButton.js](https://github.com/mui/material-ui/blob/41c9cb4030274f3bde585d136949f447674e728b/packages/mui-material/src/IconButton/IconButton.js#L55-L57)).

### What they agree on

1. The trigger is a real button. Nobody makes the avatar itself focusable. This matches the WAI-ARIA menu
   button pattern: "The element that opens the menu has role button"
   ([APG, Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)).
2. The button's name describes the action ("Account settings", `@kittenuser profile`), not just the picture.
3. Primer, MUI and Shoelace choose the icon-button shape explicitly, with a separate component. Web Awesome,
   and so Cornerstone, choose it by checking the content. Cornerstone already documents and ships the checking
   approach (`button.md:125`), and the shipped agent skill teaches it.

## Recommendation

**Change a component: `cs-button`.** No new attribute, slot, part or property.

1. **One detection rule for both cases.** A button is an icon button when its default slot holds at least one
   graphic, holds nothing but graphics and badges, and holds no text. The graphics are `cs-icon` and
   `cs-avatar`. A `cs-badge` counts neither way, because the button pins it to the corner from any slot and it
   takes no space (`button.styles.ts:340-351`). Keep the graphic list closed and in one named place in
   `button.ts`, so Web Awesome #1475's case (a `<span>` next to an icon) still renders as a normal button. Today's
   rule also lets several icons count, and this rule keeps that.
2. **Naming stays the same mechanism.** The graphic's `label` names the button. That is already true for both
   graphics in all three engines (see [the name table](#how-the-button-gets-its-accessible-name)). Extend the
   unlabelled warning to check `label` on whichever graphic is slotted, and reword it so it names both
   elements.
3. **The button sizes a slotted avatar.** When the state is on, the button gives a slotted `cs-avatar` a
   default size that fits inside the square and grows with `size`, instead of the avatar's fixed 48 px. The
   app can still override it through the avatar's own size property. The exact ratio is a design decision
   and is not settled here. As a starting point, 0.75 x `--cs-form-control-height` is 32 px at `size="m"`,
   the same as the avatar in MUI's demo (`AccountMenu.tsx:38`) and one of the size steps in
   [Primer's Avatar](https://primer.style/view-components/components/beta/avatar). Whatever ratio is chosen
   becomes a load-bearing value measured against `--cs-form-control-height`. **This depends on the avatar
   `em` fix** (prerequisite 2 below), because a size built from `--cs-form-control-height` is in `em`.
4. **JSDoc and docs.**
   - `@cssstate icon-button` (`button.ts:44`) becomes: applied when the default slot holds only a `<cs-icon>` or
     `<cs-avatar>` and no text, with badges ignored. This regenerates the manifest, the React wrapper, the docs
     API table and the agent skill.
   - The Button page's "Icon Button" section (`button.md:123-139`) gets an avatar example and the new rule.
   - The badge section's sentence that a badge in the default slot breaks the shape (`button.md:143`) becomes
     false. Keep `slot="end"` as an allowed choice, but stop calling it required.
   - The Dropdown page gets an "account menu" example: a `plain`, `pill` `cs-button` trigger holding a
     `cs-avatar` whose `label` names the action.
   - The Avatar page gets a short note: inside a button, `label` names what the button does, not who is in the
     picture.
   - The docs pages are Anna's to write. The words about naming wait for the accessibility ruling below.
5. **Changeset.** `minor`, led with `Changed:`. `cs-button` is `@status stable` (`button.ts:22`), and this
   widens when a documented state applies, so a default-slot badge button and an avatar button change shape.
   Before 1.0.0 the repo makes breaking-shaped changes in a minor ([#182](https://github.com/CruGlobal/cornerstone-design-system/issues/182)
   resolution, point 5). It changes existing API rather than adding to it, which the map ranks higher before
   1.0.0.

**Prerequisites and side findings, each its own ticket and pull request** (one PR per component, and a bug found
along the way gets its own):

1. **`cs-button`: the `icon-button` state is missing from server-rendered markup** (see
   [Server rendering](#server-rendering)). Server-rendered icon buttons change width when they hydrate. This
   is not caused by this change and does not block it.
2. **`cs-avatar`: `--size` in `em` resolves against the avatar's own font size** (see
   [The avatar's size](#the-avatars-size)). One fix is to move `font-size: calc(var(--size) * 0.4)` off `:host`
   onto the inner initials and icon elements, so `width` and the text both measure `em` against the parent.
   The `0.4` value is load-bearing for initials and the default icon. Fold it into or line it up with UIUX-197,
   which rewrites the same declaration. This blocks recommendation point 3.
3. **`cs-dropdown`: ARIA on a trigger that is not a button.** `syncAriaAttributes()` writes `aria-haspopup` and
   `aria-expanded` onto any non-`cs-button` trigger (`dropdown.ts:751-764`). A console warning when the trigger
   is neither a `cs-button` nor a `<button>` would have pointed Flightdeck at the fix. Optional.

**Until the change ships**, the [CSS-only workaround](#a-css-only-workaround-works-today) gives Flightdeck a
square avatar button today, with the correct name and keyboard path. It should stay a local workaround, not go
on the docs site, because the docs compile into the shipped agent skill and this workaround is meant to be
removed.

## Rejected options

- **Make `cs-avatar` focusable, or give it a button mode.** `cs-avatar` is a Media component
  (`avatar.md:3`). A button mode would rebuild what `cs-button` already does: focus ring, disabled, loading and
  the dropdown's ARIA. The menu button pattern wants an element with role `button`
  ([APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)), and the accessibility page says native
  elements come before ARIA (`packages/docs/src/content/docs/resources/accessibility.md:50-51`). No system
  surveyed does this.
- **Make `cs-dropdown` turn any trigger into a button** (add `tabindex`, `role="button"` and Enter and Space
  handling). That is Shoelace's "first tabbable element" idea pushed further, and it rebuilds a native button
  with ARIA. Same reason as above.
- **An opt-in attribute that forces the icon-button layout.** It would be a second way to reach the same state
  (`docs/standards/architecture.md`, "Pattern consistency"). It lets a text label be forced into a square. It
  only fixes the badge case for people who know to set it. And it is a pure addition, which the map ranks
  below changing existing API before 1.0.0. Its one real strength, being present in server-rendered markup,
  belongs to prerequisite 1 and can be solved there without a second public switch.
- **Document the CSS workaround as the supported answer.** It works, but every app would re-solve it, it
  misses the state's focus-ring offset, `:state(icon-button)` never matches, and the avatar's size is left to
  each app. It also does nothing for #217.
- **Say avatar triggers are not supported.** The product need is real (Flightdeck lost the profile photo for
  this reason), MUI ships the same pattern as its account menu demo, and Cornerstone is one small rule change
  away from it.
- **Accept any single element as a graphic.** That reopens Web Awesome #1475: a lone `<span>Save</span>` would
  turn square. A closed list keeps the check predictable.
- **Name the button through `aria-label` on `cs-button`.** It does not work today, as measured above. Adding a
  naming attribute to `cs-button` is a separate question (see question 2 below), and the avatar path already
  works without it.

## Open questions for the accessibility reviewer

These are for the accessibility review. Each one names what the code does today, so the ruling can be checked
against it.

1. **The name's wording.** Should an avatar trigger be named only for the action ("Account menu"), or for the
   action and the person ("Account menu, Jane Doe")? MUI uses the action ("Account settings"). Primer's
   avatar-link guidance uses both (`@kittenuser profile`). Flightdeck shows the person's name and email as the
   first line inside the menu, so the person can be learned after the menu opens.
2. **Where the name lives.** Today an icon-only `cs-button` can be named only through the slotted graphic's
   `label`. The host's `aria-label` lands on a generic element and does not reach the inner button (measured).
   Is "name the button through the avatar's `label`" acceptable as the documented pattern? Or should
   `cs-button` gain its own way to be named, as `sl-icon-button` and Primer's `IconButton` do? That would be a
   separate ticket.
3. **Label in Name (WCAG 2.5.3).** With initials, the button shows "JD" and is named "Account menu". The
   initials never reach the name (measured). Do the initials count as a visible label for 2.5.3, or are they
   content that identifies the person?
4. **A visible name.** Should the documented pattern pair the trigger with a `cs-tooltip` that shows the name,
   as MUI's demo does? It would let sighted keyboard users and voice-control users learn what to call the
   button.
5. **Focus ring on a photo trigger.** The ring is drawn on the button box. With `pill` that is a circle around
   the avatar, offset 2 px by a `px` literal in the icon-button state (`button.styles.ts:244`). Elsewhere the
   offset is the 1 px token (`cru.css:316`). The ring sits on the header background, not on the photo, so the
   "single-tone focus indicator" known gap applies (`accessibility.md:73`). Is that acceptable for this
   pattern, or must it wait for the two-tone indicator? Is the 2 px offset right for an avatar that nearly
   fills the button?
6. **The unlabelled warning.** Under the new rule, an avatar button with no `label` will warn in the console,
   the same as an unlabelled icon button. Today it is silent and has no name (measured). Is a console warning
   enough, or should the accessibility tests also assert the name for both graphics?
7. **A badge on the avatar trigger.** If an app adds an unread count to the account menu, does the #218 ruling
   carry over unchanged: count in the avatar's `label`, badge `aria-hidden="true"`? Note that #223, which
   stops `cs-badge` being a live region, is still open. `badge.ts:49` still renders `role="status"` on `main`.
8. **An avatar with no label outside a button.** `cs-avatar` renders `role="img"` with `aria-label=""` when
   `label` is empty (`avatar.ts:82-83`, `91`, `96`). Should an unlabelled avatar be treated as decorative and
   left out of the tree? This is outside #173, but the new docs note about `label` will raise it.

Facts the review can lean on: the target is 43 x 43 px at `size="m"` and 54 x 54 px at `size="l"` (measured).
At `size="xs"` the formula gives 32 px. All are above the 24 px minimum of WCAG 2.5.8. The keyboard path
(Enter opens and focuses the first item, Escape closes and returns focus) already works in all three engines
with the wrapped avatar.

## Facts later tickets depend on

**The rule and its readers**

- The check is `handleLabelSlotChange()` at `button.ts:198-239`. It reads only the default slot, runs only on
  `slotchange` (`button.ts:315`), and writes both the `isIconButton` state, which drives the `is-icon-button`
  class (`button.ts:297`), and the `icon-button` custom state (`button.ts:231`).
- Code that reads the state: `button.styles.ts:243-254` and `280-283`; `native-styles.test.ts:60` and
  `details.test.ts:240`, both measuring width = height = control height; the JSDoc at `button.ts:44`; and the
  docs sentences at `button.md:125` and `button.md:143`.
- `button.test.ts` has no test of the state itself. Its block at `283-334` tests only the
  warning and the name, and only with the client fixture (`fixtures[0]`, lines 288 and 324). A change to the
  rule needs new tests for the state, with an icon, an avatar, an icon plus a badge, and an icon plus a span.
- `outline-offset: 2px` in the icon-button state (`button.styles.ts:244`) is a `px` literal inherited from
  upstream. `time-input.styles.ts:77` and `143` use the same literal, with no link between them.

**Sizes**

- `--cs-form-control-height` is 43 px at `m` and 54 px at `l` (measured), from `cru.css:384-389`.
  The same token exists in `default.css:375-380`.
- An icon button's content box is about 11 px wide at `m`, because the 1 em padding stays (`cru.css:385`). A
  graphic wider than that overflows, centered. Any sizing rule for a slotted avatar has to account for this.
- `cs-avatar`'s `--size` defaults to `3rem` (48 px) on `:host` (`avatar.styles.ts:5`), and `em` values
  resolve against the avatar's own font size (`avatar.styles.ts:11-15`), so `2em` gives 1.6 em (measured).
- Under #182, new custom properties are named `--cs-<component>-<property>`, read with a fallback, and never
  set on `:host`. `--size` becomes `--cs-avatar-size` (UIUX-197). Note that
  `packages/docs/src/content/docs/resources/contributing.md:277-301` still describes the old convention
  (unprefixed, set on `:host`) until UIUX-197 rewrites it.

**Dropdown**

- `getTrigger()` returns the first light-DOM descendant matching `[slot="trigger"]` (`dropdown.ts:231-234`). It
  opens only on a click event from the trigger slot (`dropdown.ts:535-537`, `786-789`); Enter and Space on a
  real button fire that click. ARIA goes on a `cs-button`'s inner `[part~="button"]`, or on the
  slotted element itself (`dropdown.ts:742-767`). Escape and selection return focus with `trigger.focus()`
  (`dropdown.ts:313-321`, `722-739`), which `cs-button` forwards to its inner button (`button.ts:276-278`).

**Constraints this puts on #174 (icon above the label)**

- The check must keep reading only the default slot. A stacked button keeps its graphic in a named slot
  (`start`, or a new `top`) and its label in the default slot, so it is never an icon button. If #174 changes
  which slot holds the graphic, it must not teach the check to read that slot.
- If #174 needs to know what counts as a graphic (for spacing, for example), it should use the same closed
  list (`cs-icon`, `cs-avatar`) from the same place in `button.ts`, not a second list.
- A badge must stay pinned and uncounted in a stacked layout. The pin rule matches every slot
  (`button.styles.ts:340-351`).
- `.button` fixes `height: var(--cs-form-control-height)` (`button.styles.ts:41`), and the icon-button state
  fixes the width to the same token with `aspect-ratio: 1` (`243-247`). A stacked layout has to relax the
  height without fighting the icon-button rule.
- The `start` and `end` parts are on `<slot>` elements styled `display: flex` (`button.ts:314-316`,
  `button.styles.ts:268-274`). The contributing guide says never to put a part on a slot
  (`contributing.md:353`). A stacked layout that styles these parts inherits that exception.

**Evidence outside this repo**

- Flightdeck: `git -C ~/CruGlobal/flightdeck-cornerstone-port show 30f9a625 73506620`. The first commit's test
  asserted the avatar's `label` named the button. The second commit's message gives the bare-avatar reason. The
  issue comment on #173 gives the padding reason.
- Web Awesome `next` at `e99dc5e` has the same check as Cornerstone. Upstream's badge regression dates from PR
  #1590 (merged 2025-10-15).
