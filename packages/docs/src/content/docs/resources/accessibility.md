---
title: Accessibility
description: What Cornerstone Components targets, how each claim is checked, and which gaps are known.
---

Cornerstone Components targets **WCAG 2.2 Level AA**. This page states what that means in practice, how each
claim is verified, and what is knowingly not done yet. Accessibility here is a property of how a component is
built, not a pass applied afterwards.

Two things this page does not claim. It does not claim your application is accessible. Accessible building blocks
are necessary but not enough, and page structure, reading order, headings and landmarks belong to the application.
And it does not claim a screen reader was run or that anyone with a disability has tested a component. Verification
has two halves: the code-level checks below, and a person using real assistive technology. Neither is complete. The
automated checks run, but no component has a record of its hand review, and the second half has not begun.

## The floor every component is held to

- Reachable and operable by keyboard alone, with no trap (2.1.1, 2.1.2)
- Correct name, role and value exposed to the accessibility tree (4.1.2)
- A visible focus indicator on every focusable element the component owns (2.4.7)
- No state signalled by colour alone (1.4.1)
- 3:1 for non-text elements identifying the component or one of its states (1.4.11); 4.5:1 for text (1.4.3)
- `prefers-reduced-motion` respected
- No change of context on focus or on input that the user did not ask for (3.2.1, 3.2.2)

A component that cannot meet one of these ships with the gap named below and a reason, rather than with the gap
unmentioned.

## How it is verified

**Automated.** Every component with an interactive surface runs [axe](https://github.com/dequelabs/axe-core) in
its test suite, across Chromium, Firefox and WebKit, in both client-rendered and server-rendered-then-hydrated
modes. 59 of the 70 components carry an axe assertion. The 11 that do not are utilities that render no
interactive surface — `cs-format-bytes`, `cs-format-date`, `cs-format-number`, `cs-relative-time`, `cs-include`,
`cs-markdown`, `cs-animation`, `cs-zoomable-frame`, `cs-intersection-observer`, `cs-mutation-observer` and
`cs-resize-observer` — where an axe run tests nothing. That exemption is a decision, not an omission.

**A green suite is a floor, not a conformance statement.** axe catches a minority of WCAG failures. It cannot
tell you a keyboard path is sensible, that a focus indicator is visible against your page, or that an
announcement arrives at a useful moment.

**By hand, per component.** What axe cannot see needs a review by hand against this checklist: the accessibility
tree (roles, names and their sources, states, and every ARIA reference with both endpoints), the tab path in order
including through slotted content, the keyboard bindings for the component's archetype, computed contrast for every
text and non-text state pair with resolved values in every shipped theme, reduced-motion behaviour, and the focus
restoration target for anything that closes or removes itself. No component has a recorded review against it yet
(see [Known gaps](#known-gaps)).

## Construction rules that produce it

**Native elements before ARIA.** `<button>`, `<a href>`, `<input>`, `<dialog>` and `<details>` come before a
`role`. ARIA adds semantics HTML lacks; it does not rebuild controls HTML already has.

**Three native behaviours do not cross a shadow boundary** and are arranged for explicitly: form participation
(`formAssociated` plus `ElementInternals.setFormValue()`), `<label for>` (the component renders the label in the
same shadow root as the input), and radio grouping by `name` (the group owner renders the inputs).

**ARIA references cannot cross a shadow root.** An `aria-labelledby` or `aria-controls` IDREF resolves only
within its own tree, so a composite widget keeps the referring and referenced nodes in one shadow root.

**`delegatesFocus` is for components whose host is a single interactive control** — a button, a text field. It
is not for composites, where it collapses a deliberate focus model into "whatever is focusable first" and makes
`:focus` match the host while focus is actually inside.

**Focus order follows the flattened tree.** The shadow root's DOM order *is* the focus order, so it matches the
visual order, and no focusable element is repositioned with `order`, `row-reverse` or grid placement (2.4.3,
1.3.2).

## Known gaps

| Gap | Detail | Revisit when |
| --- | --- | --- |
| Target size below 24px at three sizes | 2.5.8 asks for 24×24 CSS px. The click target for `cs-checkbox`, `cs-radio` and `cs-switch` is the full label, which is wide enough, but only as tall as the control: 15px at `xs`, 18px at `s`, 20px at `m`, and 24px is met only at `l` and `xl`. Stacked usage passes through 2.5.8's spacing exception — measured centre-to-centre spacing is 32–44px — so a checkbox list conforms while a lone toggle at the default size does not. | The control size ramp is reconciled with the design system's, which pins its smallest control at exactly 24px |
| Single-tone focus indicator | The indicator is one colour, `--cs-color-focus`, drawn 3px wide, and it does not reach the 3:1 that 1.4.11 asks for on every surface it lands on. In light mode, Cru's `#ffd000` is 1.47:1 on white and 1.28:1 on the lowered surface, and the default theme's `#3e96ff` is 2.9951:1 on white (thresholds do not round up) and 2.67:1 on the lowered surface. FamilyLife's `#006c5b` passes in light mode (6.37:1 on white) and fails in dark mode: 2.94:1 on the default surface and 2.36:1 on the raised one. Cru and the default theme pass in dark mode on the default, raised and lowered surfaces (12.73:1 and 6.25:1 on the default surface). On a `brand-fill-loud` surface the ring is 1:1 in Cru and FamilyLife, because it is the same colour as the fill, and 1.53:1 in the default theme, in both modes. Cru's light-mode value is a deliberate brand trade, recorded in `packages/components/tools/palette.mjs`. No such record exists for the other failing pairs. No single colour can promise 3:1 against every background, such as an image or a colour from outside Cornerstone. A two-tone indicator that carries its own contrast is the fix, and it needs a second focus colour that does not exist at any token layer yet. | UIUX-123 lands |
| `delegatesFocus` on two composites | `cs-radio-group` and `cs-color-picker` both set `delegatesFocus` and both manage roving focus across children, which the rule above says they should not. | Reviewed per component |
| Forced colors | Not tested in a real high-contrast environment, and no conformance is claimed. Indicators are drawn with `outline` and `border` rather than `box-shadow` alone, which is the groundwork. | Tested against a real high-contrast environment |
| A state shown by fill alone vanishes in forced colors | In Chromium's forced-colors emulation, all five `cs-button` appearances look the same: the fill is dropped and each button gets the same system-colour border and text. So a state shown only by a change of appearance disappears, such as marking the current page by switching one button from `plain` to `filled`. A fill is colour alone (1.4.1), and outside forced colors that change is only 1.25:1 to 1.47:1 against the page in every shipped theme, under the 3:1 of 1.4.11. This was emulated in a test browser, not seen in a real high-contrast setup. | UIUX-213 gives `cs-button` a current state that is not shown by colour alone |
| Per-component hand review unrecorded | The hand review described under "How it is verified" has no written record for any component: nothing says what was checked, by whom, when, or what was found. So the parts only that review covers, such as the tab path through slotted content, the keyboard bindings for each archetype and the focus restoration target, have no evidence behind them yet. The automated checks and the measurements in this table are the evidence that exists. | UIUX-121 lands |
| Screen reader verification | No component has been verified against a screen reader by a person who relies on one. | Assistive-technology testing is arranged |
| One WebKit keyboard divergence | `cs-otp-input` does not advance focus out of the field on Tab in WebKit. Its field is a visually hidden real `<input>` reached through `delegatesFocus`, and WebKit's sequential focus does not leave that combination. Chromium and Firefox behave correctly. | WebKit's behaviour changes |
| One WebKit scroll divergence | `cs-carousel` with `loop` ends on the wrong slide in WebKit when paging backwards from the first slide. | The carousel's clone-and-jump approach is revisited |
| One WebKit name divergence | WebKit leaves out the space between a `cs-button`'s text and a `cs-badge` inside it, so a button reading "Requests" with a "30" badge is named "Requests30". Chromium and Firefox name it "Requests 30". A native `<button>` with a badge, or a `cs-button` with a plain `<span>`, keeps the space in WebKit, so the cause is in how the two components combine. | The cause is found and fixed |
| Tooltip text on a `cs-button` is not in its name or description | `cs-tooltip` adds its ID to `aria-labelledby` on the element it is attached to. On a `cs-button` that element is the host, and an ID reference cannot cross into the shadow root where the real `<button>` is, so the tooltip text is in neither the button's accessible name nor its description. | UIUX-212 lands |
| `cs-callout` variants unchecked under SSR | The axe test that renders each `cs-callout` variant returns early under the server-rendered-then-hydrated fixture, so in that mode it passes without checking anything. The axe test on default properties still runs in both modes. Until this closes, the claim above that axe runs in both render modes does not hold for callout variants. | UIUX-119 lands |
| axe cannot see ARIA on a `<slot>` | axe builds its own flattened tree and leaves `<slot>` elements out, so a role or name written on a `<slot>` is never checked, and the component's axe test passes without seeing it. Two components do this. `cs-button-group` puts `role="group"` and `aria-label` on a `<slot>`, and `cs-avatar` puts `role="img"` and `aria-label` on the `<slot>` that holds its default icon. Chromium and Firefox give both an empty name, so the group's `label`, and the `label` of an avatar showing its default icon, do nothing there. WebKit names both. | UIUX-204 (`cs-button-group`) and UIUX-202 (`cs-avatar`) land |

## Reporting something

Accessibility problems are bugs, and the most useful ones name the component, the assistive technology or
browser, and what you expected to happen. Open an issue on the
[repository](https://github.com/CruGlobal/cornerstone-design-system/issues).
