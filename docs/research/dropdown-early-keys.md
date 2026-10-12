# Keys pressed while `cs-dropdown` is still opening

**Status:** research only. No component code changed on this branch. Three probe test files were added.
**Date:** 2026-10-12
**Branch:** `research/dropdown-early-keys`, from `origin/main` at `27dd176`
**Engines:** Chromium, Firefox and WebKit through Playwright, in both render modes (client-only, and
server-rendered then hydrated). Numbers for today's behaviour are from the final run of the committed probes;
numbers for the fix sketch are from the patched run.
**Files inspected:** `packages/components/src/components/dropdown/dropdown.ts`, `dropdown.styles.ts`,
`dropdown-item/dropdown-item.ts`, `dropdown-item.styles.ts`, `popup/popup.styles.ts`, `internal/animate.ts`,
`styles/themes/default.css` and `cru.css`, and the show paths of `select`, `time-input`, `popover`, `dialog`,
`drawer`, `color-picker`, `tree`, `tree-item`, `details`, `accordion-item`, `tooltip` and `toast-item`.

**What this establishes, and what it does not.** Everything below comes from reading code and from sending
real key presses in three browser engines. No screen reader was run, and no one who relies on assistive
technology tested anything. Where this note says what a screen reader would likely say, that is a prediction
to check, not a result.

## Short answer

Yes. Keys pressed during the show animation are lost, and some of them do the wrong thing.

- When the menu opens, focus stays on the trigger until the show animation ends. The animation is 75ms, not
  150ms: `--show-duration` defaults to `--cs-transition-fast`, which both shipped themes set to 75ms
  (`styles/themes/default.css:343`, `cru.css:352`). Focus waited 76 to 101ms in every engine.
- ArrowDown, ArrowUp, End and type-to-select in that window move focus, and then the end of the animation
  puts focus back on the first item. The key is undone.
- Enter, Space and Escape in that window close the menu and leave focus on the page body. Enter and Space
  select nothing.
- In Firefox, Tab in that window also leaves focus on the page body.
- Reduced motion makes no difference. The dropdown does not honour `prefers-reduced-motion`, so the window is
  the same length.
- When the second key came as fast as a script or a macro sends one (2 to 11ms after the first), it was
  honoured **0 times in 108**. With a small fix, **108 times in 108**.

**Ruling: a defect.** It fails 2.4.3 Focus Order. It fails the timing clause of 2.1.1 Keyboard, which is a
judgment call explained below. It departs from the APG menu button pattern. It does not fail 4.1.2, 3.2.1 or
3.2.2 on this evidence. It also shows that the accessibility page's floor claim, "`prefers-reduced-motion`
respected", is not true for `cs-dropdown`.

## The code path

Paths are under `packages/components/src/`.

1. A click on the trigger opens the menu: `handleTriggerClick` toggles `open` (`dropdown.ts:535-537`). Enter
   and Space on a button fire a click, so a keyboard open takes the same path. Nothing handles ArrowDown on a
   closed trigger, so ArrowDown does not open the menu. Measured: it never opened, in any engine or mode.
2. `updated()` sees `open` change and calls `showMenu()` (`dropdown.ts:116-138`).
3. `showMenu()` makes the popup active (`:258`), sets `aria-expanded` on the trigger (`:262`, `:763-764`) and
   adds the document-level `keydown`, `pointerdown` and `mousemove` listeners (`:263-265`). Keys are handled
   from this moment.
4. It then waits for the show animation: `await animateWithClass(this.menu, 'show')` (`:269`).
   `animateWithClass` resolves on `animationend` or `animationcancel` (`internal/animate.ts:24-35`).
5. Only then does it mark the first item active and focus it (`:271-275`) and fire `cs-after-show` (`:277`).
   Nothing checks that the menu is still open.

While the menu animates, `handleDocumentKeyDown` (`dropdown.ts:310-476`) runs with focus still on the trigger:

- It finds the current item from the `active` flag, because focus is not on an item (`:338-340`).
  `handleMenuSlotChange` marked the first item active when the items were slotted (`:525-528`). So ArrowDown
  picks the second item (`:355-363`) and focuses it (`:448-455`). Then step 5 runs and moves focus back to the
  first item.
- Enter and Space act only when focus is on an item (`:457`). It is not, so the handler does nothing, and the
  browser's own button behaviour clicks the trigger again. That toggles `open` off (`:535-537`).
- Escape closes the menu and focuses the trigger (`:313-322`), which is right. Then step 5 runs.
- When anything closes the menu during the show animation, `hideMenu()` removes the `show` class and adds
  `hide` (`:301-302`). Both classes use the same keyframes name, `show` (`dropdown.styles.ts:27-33`), so the
  browser keeps the running animation and changes its direction and length instead of cancelling it. One
  `animationend` then settles both promises. The show side runs first and focuses the first item inside a
  menu that is closing. The hide side then makes the popup inactive (`dropdown.ts:305`), the popup becomes
  `display: none` (`popup/popup.styles.ts:57-58`), and the browser drops focus to the page body.
- Tab calls `hideMenu()` directly (`dropdown.ts:419-421`) and `updated()` calls it again, so `cs-hide` fires
  twice. That happens after the animation too.

**Reduced motion.** Neither `dropdown.styles.ts` nor `dropdown-item.styles.ts` has a `prefers-reduced-motion`
rule, and no script checks it. The menu runs the same 75ms scale and fade.

**Submenus.** `openSubmenu()` has the same shape (`dropdown-item.ts:189-198`): animate, then focus the first
submenu item. The dropdown's own ArrowRight and Enter handlers already focus that item in a `setTimeout(0)`
(`dropdown.ts:373-379`, `:465-471`), which runs before the animation ends. So focus moves twice, and a key
pressed between the two is undone.

## How it was measured

Probe files, kept on this branch:

- `packages/components/src/components/dropdown/dropdown-early-keys.test.ts`
- `packages/components/src/components/time-input/time-input-early-keys.test.ts`
- `packages/components/src/components/select/select-early-keys.test.ts`

Method:

- **A window that holds still.** `--show-duration: 10s` on the host, then the key, then `Animation.finish()`
  to end the animation by hand.
- **A case cannot pass without measuring.** Every "during" case asserts the menu was still animating when the
  key was sent. Every control asserts the animation was over.
- **Openers:** Enter, Space and ArrowDown on the trigger, and a real mouse click.
- **Keys:** ArrowDown, ArrowUp, Home, End, Enter, Space, Escape, Tab, and "c" for type-to-select. The items
  are Apple, Banana, Cherry and Damson. An `<input>` after the dropdown is the Tab target, because WebKit on
  macOS does not Tab to a `<button>`.
- **Recorded:** where focus is, which item is active, whether the focused item is still drawn, whether
  `:focus-visible` matches, whether `cs-select` fired, whether the menu is open, and the order of events and
  focus moves.
- **At the shipped 75ms:** Enter alone, and Enter followed at once by ArrowDown, Enter or Escape. Three runs
  each, with and without emulated `prefers-reduced-motion: reduce`.
- **Runs:** single groups with `WTR_CONCURRENCY=1`. Every run had equal pass totals on the three engines
  (196 each for the final dropdown probe).

## Results

### Each key, pressed during the show animation

Enter, Space and click as openers gave identical results. The two render modes gave identical results in
every case. ArrowDown on the trigger never opened the menu. C, F and W are Chromium, Firefox and WebKit.

| Key | After the animation (control) | During the animation, today | Engines | During, with the fix sketch |
| --- | --- | --- | --- | --- |
| ArrowDown | Focus on Banana | Focus on Banana, then back to Apple when the animation ends | C F W | Banana |
| ArrowUp | Damson | Damson, then back to Apple | C F W | Damson |
| End | Damson | Damson, then back to Apple | C F W | Damson |
| Type "c" | Cherry | Cherry, then back to Apple | C F W | Cherry |
| Home | Apple | Apple (the reset happens to agree) | C F W | Apple |
| Enter | `cs-select` for Apple, menu closes, focus on trigger | No `cs-select`. The trigger is clicked again, so the menu closes. Focus goes to Apple inside the closing menu, then to the page body | C F W | Same as control |
| Space | Same as Enter | Same as Enter | C F W | Same as control |
| Escape | Menu closes, focus on trigger | Menu closes. Focus goes to the trigger, then Apple, then the page body | C F W | Same as control |
| Tab | Menu closes, focus on the next field | C and W: same as control. F: Tab lands on Apple while the menu is still drawn, the menu hides, focus on the page body | F only | Same as control |

Also, when a key closes the menu during the animation, `cs-after-show` fires after `cs-hide`, and for Tab
after `cs-after-hide`.

### At the shipped 75ms

| Engine | Focus waited after Enter | Same, with reduced motion | Fast second key honoured, today | With the fix sketch |
| --- | --- | --- | --- | --- |
| Chromium | 84-101ms | 85-99ms | 0 of 36 | 36 of 36, focus waited 1ms |
| Firefox | 76-91ms | 76-91ms | 0 of 36 | 36 of 36, focus waited 0-3ms |
| WebKit | 79-101ms | 83-100ms | 0 of 36 | 36 of 36, focus waited 1-2ms |

The test harness sends the second key 2 to 11ms after the first. That is faster than a person types. It is
about as fast as speech-input commands, switch-access software and keyboard macros send a key sequence. A
person pressing Enter and then ArrowDown about 100ms apart lands inside or at the edge of the window on this
machine. On a slower device, or while the page is busy, the window is longer, because the end of the
animation is reported by an event that waits for the main thread. A slow device was not measured.

### Submenu

ArrowDown during the submenu's show animation moved focus to Lemon, then back to Grape when the animation
ended, on all three engines. After the animation, Lemon stays. With the fix sketch, Lemon stays in both cases.
This ran client-only; see adjacent finding D for why.

## Other components

| Component | Moves focus after its show animation? | Measured | What an early key does |
| --- | --- | --- | --- |
| `cs-dropdown` submenu (`dropdown-item.ts:189-198`) | Yes | Yes | Undone (above) |
| `cs-time-input` (`time-input.ts:396-402`) | Yes. Alt+ArrowDown or the expand button set `moveFocusToColumnOnShow` (`:704`, `:757`), and focus moves into the first column only after the show animation | Yes | ArrowDown and ArrowUp still reach the hour segment, which is a spinbutton, so they step the hour the other way. ArrowDown during the window gives 09:30, after it gives 11:30. Same in all engines and both modes. At the shipped 75ms the window was 78-100ms and a fast second key went the wrong way in all 18 runs. Its reduced-motion rule (`time-input.styles.ts:307-310`) shrinks the window to one frame (5-16ms), not to zero: the fast second key still went the wrong way in Chromium and WebKit (12 of 12), but not in Firefox (0 of 6), where it arrived after that frame |
| `cs-select` (`select.ts:916-958`) | No. Its key handler is attached before the animation and acts on `currentOption`, which is set before it | Yes, as the control | ArrowDown and End during the animation work. But see adjacent finding C: a one-frame version of the same defect |
| `cs-popover` (`popover.ts:210-225`) | No. Focus moves in a `requestAnimationFrame` before the animation, and a guard covers "closed during the show animation" | No | Not expected |
| `cs-dialog`, `cs-drawer` (`dialog.ts:242-251`, `drawer.ts:252-261`) | No. Focus moves in a `requestAnimationFrame` before the animation | No | Not expected. See finding C for a possible one-frame case |
| `cs-color-picker` (`color-picker.ts:1147-1157`) | No. Listeners attach before the animation, and nothing moves focus on show | No | Not expected |
| `cs-tree`, `cs-tree-item`, `cs-details`, `cs-accordion-item` | No. Focus targets come from state (`expanded`), not from the animation | No | Not expected |
| `cs-tooltip`, `cs-toast-item`, `cs-copy-button` | No focus moves | No | Not applicable |

## Ruling

### WCAG 2.2 AA

- **2.4.3 Focus Order (A): fails.** After Escape, Enter or Space in the window, focus ends on the page body in
  all three engines, and after Tab in Firefox. The user loses their place and has to start again from the
  top of the page. Focus is also moved back to the first item after the user moved it somewhere else. The
  library's own rule says anything that closes names its focus-restoration target
  (`docs/standards/accessibility.md`, Focus), and for a menu that target is the trigger.
- **2.1.1 Keyboard (A): fails on its timing clause, as a judgment call.** 2.1.1 asks that everything work
  "without requiring specific timings for individual keystrokes". The dropdown works only if the next key
  waits until about 100ms after the menu opens, and longer on a slow device. A person who waits can use it,
  which is why some auditors would file this under 2.4.3 alone. I count it under 2.1.1 as well, because the
  people that clause protects include users of speech input, switch access and macros, whose tools send key
  sequences faster than a person types and cannot choose to wait.
- **4.1.2 Name, Role, Value (A): not failed on this evidence.** At every moment measured, the trigger exposed
  `aria-haspopup="menu"` and an `aria-expanded` that matched the menu, and the items kept `role="menuitem"`.
  axe with the menu open found no violations on any engine (the suite's own axe test runs with the menu
  closed; see finding E). One cleanup: the open menu carries `aria-expanded="false"` (`dropdown.ts:766`).
  ARIA 1.2 does not list `aria-expanded` for `role="menu"`, axe accepts it, and the trigger already carries
  the state, so it should go.
- **3.2.1 On Focus (A): not failed.** Focus arriving somewhere does not start a change. The late focus move
  is started by the end of an animation.
- **3.2.2 On Input (A): not the operative criterion.** The jump back to the first item is a focus change the
  user did not ask for at that moment, but it is the delayed effect of their own open action, so it is
  recorded under 2.4.3. It does run against the library floor's wider wording, "no change of context on
  focus or on input that the user did not ask for".

### APG menu button pattern

- **Enter and Space:** "Opens the menu and places focus on the first menu item." The menu opens at once, but
  focus arrives 76 to 101ms later, and keys in between are undone. Departs.
- **Escape (menu pattern):** close the menu and return focus to the element the menu was opened from. In the
  window, focus ends on the page body. Departs.
- **Down Arrow on the button:** optional in the pattern, and not implemented here. Not a defect.

### The library's own floor

`packages/docs/src/content/docs/resources/accessibility.md` lists "`prefers-reduced-motion` respected" as
part of the floor every component meets. Measured: false for `cs-dropdown`. Finding A has the wider picture.

## Recommended fix

What it should do:

1. **Move focus when the menu opens, and let the animation play on.** In `showMenu()`, wait for the popup to
   render as active (`await this.popup.updateComplete`), then mark and focus the first item, then start the
   animation. The wait matters: until the popup renders, the item is still `display: none` and `focus()` does
   nothing.
2. **After the animation, return early if the menu closed meanwhile,** before `cs-after-show`. This is the
   existing convention: `select.ts:940-943` and `popover.ts:222-225` carry the same guard with the same
   comment.
3. **In `openSubmenu()`, do not move focus after the animation** if the submenu closed or focus is already
   inside it.
4. **Honour reduced motion with the existing convention,** `time-input.styles.ts:307-310`: set
   `--show-duration` and `--hide-duration` to `0ms` on `:host` under `prefers-reduced-motion: reduce`.

Optional, not needed for the fix: give the hide animation its own keyframes name (`dropdown.styles.ts:27-33`),
so a hide that interrupts a show cancels it instead of retiming it in place. And stop the Tab path calling
`hideMenu()` twice (`dropdown.ts:419-421`).

### The sketch that was tried

The diff below (abridged) was applied locally, built and measured, then reverted. It is not on this branch and it is
not the fix. It is here so whoever takes the fix starts from something measured.

```diff
--- a/packages/components/src/components/dropdown/dropdown.ts
+++ b/packages/components/src/components/dropdown/dropdown.ts
@@ -266,14 +266,23 @@ export default class CsDropdown extends CornerstoneElement {

     // In case its still trying to hide, remove the class to cancel the hide animation.
     this.menu.classList.remove('hide');
-    await animateWithClass(this.menu, 'show'); // Animate the menu div

+    // Focus moves when the menu opens, not when its animation ends. The popup must render as active first, or
+    // the item is still display: none and focus() does nothing.
+    await this.popup.updateComplete;
     const items = this.getItems();
     if (items.length > 0) {
       items.forEach((item, index) => (item.active = index === 0));
       items[0].focus({ preventScroll: true });
     }

+    await animateWithClass(this.menu, 'show'); // Animate the menu div
+
+    // Closed during the show animation: the hide that closed it owns the final state.
+    if (!this.open) {
+      return;
+    }
+
     this.dispatchEvent(new CsAfterShowEvent());
   }
--- a/packages/components/src/components/dropdown-item/dropdown-item.ts
+++ b/packages/components/src/components/dropdown-item/dropdown-item.ts
@@ -188,9 +188,13 @@ export default class CsDropdownItem extends CornerstoneElement {
     // Animate the submenu
     await animateWithClass(submenu, 'show');

-    // Set focus to the first submenu item
+    // Set focus to the first submenu item, unless the submenu closed during the animation or the user has
+    // already moved within it.
     setTimeout(() => {
       const items = this.getSubmenuItems();
+      if (!this.submenuOpen || items.some((item) => item.matches(':focus'))) {
+        return;
+      }
       if (items.length > 0) {
--- a/packages/components/src/components/dropdown/dropdown.styles.ts
+++ b/packages/components/src/components/dropdown/dropdown.styles.ts
@@ -84,6 +84,13 @@ export default css`
     transform-origin: left bottom;
   }

+  @media (prefers-reduced-motion: reduce) {
+    :host {
+      --show-duration: 0ms;
+      --hide-duration: 0ms;
+    }
+  }
+
   @keyframes show {
```

With the sketch:

- Every "during" case matched its control, on all three engines and in both render modes (last column of
  the first table).
- Focus waited 0 to 3ms after Enter instead of 76 to 101ms, and fast second keys were honoured 108 of 108.
- The submenu kept the user's place.
- The existing suites passed: `dropdown` 66 per engine, `dropdown-item` 60 per engine.
- `:focus-visible` on the focused item matched in the same cases as without it (finding I).
- When the menu closed during the show animation, `cs-after-show` no longer fired.

### What it must not break

- **The focus ring.** The item draws its ring and highlight on `:host(:focus-visible)`
  (`dropdown-item.styles.ts:29-33`). Moving focus earlier did not change which cases matched. The ring now
  fades and scales in with the menu, which is fine.
- **`aria-activedescendant`.** The dropdown does not use it. It moves real focus with a roving `tabindex`
  (`dropdown-item.ts:113-117`), so there is nothing to keep in step. `cs-time-input`'s columns do use it
  (`time-input.ts:1243`), so a fix there must keep it pointing at the selected option when focus moves into
  a column earlier.
- **Reduced motion.** Step 4 removes the motion, and step 1 removes the wait whether or not motion is reduced.
  In the sketch I did not separately confirm that the `0ms` rule took effect for the dropdown, because the
  probe's animation flag cannot tell a zero-length animation from a 75ms one. The same rule is measured
  working in `cs-time-input`.
- **The item scale-in.** Focus lands while the menu is at opacity 0 and 90% scale. `preventScroll: true` stays,
  so the page does not jump while the popup is still being placed.
- **`cs-after-show`.** It now means "shown, and still open". Consumers can see that change, so the fix takes a
  `Fixed:` changeset that says so.
- **Tests.** The comment PR #235 adds to `dropdown.test.ts`, "The first item is activated and focused when the
  show animation ends, not when open flips", becomes false and should change in the same pull request. The
  probe's "during" cases, turned into assertions that each one matches its control, are the regression
  tests, in both render modes.

## What a screen reader would likely say

Not run. These are predictions for a human session to confirm.

- **During the window.** Focus is still on the trigger, whose state just changed to expanded. A screen reader
  would likely say the button again with its new state, for example "Fruit, expanded, menu button", and
  nothing about the items.
- **ArrowDown in the window.** Focus goes to Banana and, within 100ms, back to Apple. "Banana" is likely cut
  off by "Apple, 1 of 4". The user hears Apple and may think the key did nothing. Their next ArrowDown lands
  on Banana, not Cherry.
- **Enter, Space or Escape in the window.** Focus goes briefly to Apple in a menu that is closing, then to the
  page body. A screen reader might say "Apple" or nothing, then the page or document name or nothing. Either
  way the user loses their place.
- **NVDA and JAWS in browse mode.** Arrow keys during the window may never reach the page. The screen reader
  uses them to move its own reading cursor until focus lands on a menu item and it switches to focus mode.
  With these readers, early keys may be eaten by the reader rather than undone by the component, which a
  code-level probe cannot see.

To check with a real screen reader (NVDA and JAWS on Windows, VoiceOver on macOS), before and after the fix:

1. What is announced on open, and whether the first item is announced once.
2. Whether NVDA and JAWS switch to focus mode on Enter at the trigger or only when focus reaches an item, and
   so whether early arrow keys reach the page at all.
3. What is announced when Escape is pressed right after opening, today: silence, the page title, or something
   else.
4. Whether any reader calls the open menu "collapsed", from its `aria-expanded="false"`.
5. The `cs-time-input` focus loss on Escape from a column in Chrome (finding B).

Beyond the reader: a session with someone who uses speech input or switch access would show whether their
tools send keys inside this window in practice. The gap register's "Screen reader verification" entry stays
true until that happens.

## Adjacent findings

Found on the way and outside the question. Recorded so they are not lost. None was fixed here.

- **A. Most animated components do not honour reduced motion.** Measured for `cs-dropdown`: under emulated
  `prefers-reduced-motion: reduce` the menu still animated and focus still waited 76 to 100ms. By code reading
  only, 11 of the 14 components that animate show or hide have no reduced-motion rule in CSS and no
  `prefersReducedMotion()` check: `accordion-item`, `color-picker`, `details`, `dialog`, `drawer`, `dropdown`,
  `dropdown-item`, `popover`, `select`, `tooltip`, `tree-item`. Only `copy-button`, `time-input` and
  `toast-item` have one. The accessibility page claims it as part of the floor. And
  `docs/standards/accessibility.md` says "the animation registry does" respect it, but there is no animation
  registry in `packages/components/src`.
- **B. `cs-time-input` loses focus on Escape or Enter from a column, in Chromium.** No timing is involved; it
  happens in the control. `?active=${this.open}` (`time-input.ts:1054`) hides the popup on the same update that
  starts the hide. Chromium moves focus off the hidden column to the page body before the restore at
  `:413-418` runs, so the restore finds nothing to move. Firefox and WebKit still report the column as
  focused, so the restore works there. No existing test covers Escape from a column.
- **C. `cs-select` has a one-frame version of the same defect.** On open it focuses the current option inside a
  `requestAnimationFrame` (`select.ts:933-936`, which reaches `option.focus()` at `:726`) with no open check.
  When Enter or Escape beat that first frame, the listbox closed, the frame then focused an option inside it,
  and focus fell to the page body. In the final run the key beat the first frame 15 times (Chromium 8 of 8,
  WebKit 7 of 8, Firefox 0 of 8), and focus was lost all 15 times. It was never lost when the key came after
  that frame. An earlier run caught it in Firefox too (3 of 4 cases where the key beat the frame). `cs-dialog` and `cs-drawer` focus
  inside a `requestAnimationFrame` the same way (`dialog.ts:242-249`, `drawer.ts:252-259`). Not measured.
- **D. A `cs-dropdown-item` with a submenu fails hydration.** Under the server-rendered-then-hydrated fixture
  it throws "Hydration value mismatch: Unexpected TemplateResult rendered to part" on all three engines. No
  test renders a submenu under that fixture. The existing submenu tests use `fixtures[0]`
  (`dropdown.test.ts:574`) without saying why. Likely cause, not verified: `hasSubmenu` changes before
  hydration finishes, so the client renders submenu parts the server left empty.
- **E. The dropdown's axe test never sees the menu.** `dropdown.test.ts:15-22` asserts with the menu closed,
  where the popup is `display: none` and axe skips it. With the menu open, axe found no violations, so the gap
  hides nothing today. The test should still open the menu, as `docs/standards/testing.md` asks.
- **F. Event order.** When a key closes the menu during the show animation, `cs-after-show` fires after
  `cs-hide`, and for Tab after `cs-after-hide`. Step 2 of the fix removes it.
- **G. `openDropdowns` keeps removed dropdowns.** `disconnectedCallback` (`dropdown.ts:96-109`) does not delete
  the element from the module-level set (`:26`), so opening any later dropdown fires `cs-hide` and
  `cs-after-hide` on a removed one. Not an accessibility issue.
- **H. Tab fires `cs-hide` twice,** because `handleDocumentKeyDown` calls `hideMenu()` (`dropdown.ts:419-421`)
  and `updated()` calls it again.
- **I. WebKit `:focus-visible`.** In Playwright's WebKit, the item focused after opening with Enter did not
  match `:focus-visible` in 18 or 19 of 52 keyboard-opened cases, almost the same set with and without the fix
  sketch. The item draws its ring and highlight only on `:focus-visible`, so in those cases nothing shows
  which item has focus. The probe reached the trigger with a script `focus()` rather than Tab, which may be
  the cause. Check in Safari with a trigger reached by Tab before calling it a 2.4.7 failure.

## Proposed gap register entries

The register belongs in the change that opens or closes a gap, so this branch does not edit
`packages/docs/src/content/docs/resources/accessibility.md`. If the dropdown fix does not ship promptly,
these rows are ready for whichever change records the gaps:

| Gap | Detail | Revisit when |
| --- | --- | --- |
| `cs-dropdown` drops keys while opening | Focus reaches the first item only when the 75ms show animation ends. ArrowDown, ArrowUp, End and type-to-select pressed before then are undone. Enter, Space and Escape close the menu and leave focus on the page body, and Tab does too in Firefox. Fails 2.4.3. Submenus and `cs-time-input` share the pattern. | Focus moves when the menu opens |
| Reduced motion not honoured by most animated components | 11 of 14 components that animate show or hide have no `prefers-reduced-motion` handling: `accordion-item`, `color-picker`, `details`, `dialog`, `drawer`, `dropdown`, `dropdown-item`, `popover`, `select`, `tooltip`, `tree-item`. The floor item above is not yet true for them. | Each has a reduced-motion rule, or the floor names the exception |

## How to rerun

From `packages/components`, after `npm run build`:

```sh
WTR_CONCURRENCY=1 npx web-test-runner --group dropdown-early-keys
WTR_CONCURRENCY=1 npx web-test-runner --group time-input-early-keys
WTR_CONCURRENCY=1 npx web-test-runner --group select-early-keys
```

Each writes one JSON file per engine to `packages/components/.probe-results/<group>/`, which is not committed.
Each takes about a minute, serially. The probes pass whatever they observe. They fail only when a case did not
land where it claims, inside the animation or after it.

These files match `src/**/*.test.ts`, so a full `npm test` on this branch runs them too and writes those result
files. They are research probes and should not merge as they are. The fix should carry their "during" cases
into `dropdown.test.ts` as assertions instead.
