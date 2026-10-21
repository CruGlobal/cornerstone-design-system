---
title: Accessibility
description: What Cornerstone Components conforms to, how that conformance is obtained, and which gaps are known.
---

Cornerstone Components targets **WCAG 2.2 Level AA**. This page states what that means in practice, how each
claim is verified, and what is knowingly not done yet. Accessibility here is a property of how a component is
built, not a pass applied afterwards.

Two things this page does not claim. It does not claim your application is accessible — accessible building
blocks are necessary and not sufficient, and page structure, reading order, headings and landmarks belong to the
application. And it does not claim a screen reader was run or that anyone with a disability has tested a
component. Verification closes in two halves: the code-level half below, and a human at real assistive
technology. Only the first half is done.

## The floor every component meets

- Reachable and operable by keyboard alone, with no trap (2.1.1, 2.1.2)
- Correct name, role and value exposed to the accessibility tree (4.1.2)
- A visible focus indicator on every focusable element the component owns (2.4.7)
- No state signalled by colour alone (1.4.1)
- 3:1 for non-text elements identifying the component or one of its states (1.4.11); 4.5:1 for text (1.4.3)
- Show and hide animations finish at once when the user prefers reduced motion, even if the page sets
  `--cs-show-duration` or `--cs-hide-duration`; the motion that still runs is listed under Known gaps
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

**By hand, per component.** What axe cannot see is reviewed against a written checklist: the accessibility tree
(roles, names and their sources, states, and every ARIA reference with both endpoints), the tab path in order
including through slotted content, the keyboard bindings for the component's archetype, computed contrast for
every text and non-text state pair with resolved values in every shipped theme, reduced-motion behaviour, and
the focus restoration target for anything that closes or removes itself.

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
| Focus indicator contrast | The indicator is one tone, `--cs-color-focus`. Against the surface a component sits on, it falls below 1.4.11's 3:1 in three of the six brand and scheme pairs: Cru light 1.47:1, FamilyLife dark 2.94:1 (2.35:1 on a raised surface such as a dialog), and Default light 2.995:1. It passes in Cru dark, FamilyLife light and Default dark. Because it is one tone, against an arbitrary page background (an image, a filled parent, a colour from outside Cornerstone) 1.4.11 cannot be guaranteed in any theme. A two-tone indicator carrying its own internal contrast fixes that, and it needs a second focus colour that does not exist at any token layer yet. | `--cs-color-focus` reaches 3:1 on its surfaces in every theme, and a focus-contrast token is authored |
| State and status marks below 3:1 | The floor above claims 3:1 for the marks that show a state (1.4.11). Measured against the surface each sits on, these fall short: a checked `cs-radio`'s dot and border, 1.47:1 in Cru light and 2.94:1 in FamilyLife dark (a native radio reads the same colour); the indicator of `cs-spinner` and `cs-progress-ring`, 1.47:1 in Cru light and 2.94:1 in FamilyLife dark; and `cs-toast-item`'s countdown ring, under 3:1 in 8 of the 36 brand, scheme and variant pairs, lowest 1.47:1 (Cru light, brand). | Narrow tokens for these marks are authored per brand and scheme |
| Motion that ignores reduced motion | These still move when the user prefers reduced motion: the 250ms `pulse` that `cs-dialog` and `cs-drawer` play when a close is refused; small control transitions (the expand icon turning in `cs-details`, `cs-tree-item` and `cs-select`, the `cs-switch` thumb sliding, `cs-rating`'s hover scale, `cs-color-picker`'s handle scale and copy pulse); and the loading animations of `cs-spinner`, `cs-skeleton` and an indeterminate `cs-progress-bar`. | Each gets a reduced-motion rule, or a recorded decision says why it keeps moving |
| `cs-badge` attention never stops | `attention="pulse"` and `attention="bounce"` loop forever, with no way to pause them and no reduced-motion rule. 2.2.2 asks that motion which starts on its own, lasts more than 5 seconds and sits beside other content can be paused, stopped or hidden. | The animation ends on its own within 5 seconds, or a way to stop it ships |
| `delegatesFocus` on two composites | `cs-radio-group` and `cs-color-picker` both set `delegatesFocus` and both manage roving focus across children, which the rule above says they should not. | Reviewed per component |
| Forced colors | Not tested in a real high-contrast environment, and no conformance is claimed. Indicators are drawn with `outline` and `border` rather than `box-shadow` alone, which is the groundwork. In Chromium's forced-colors emulation, a `cs-skeleton` with `effect="sheen"` draws nothing, because forced colors drops its gradient. | Tested against a real high-contrast environment |
| Screen reader verification | No component has been verified against a screen reader by a person who relies on one. | Assistive-technology testing is arranged |
| One WebKit keyboard divergence | `cs-otp-input` does not advance focus out of the field on Tab in WebKit. Its field is a visually hidden real `<input>` reached through `delegatesFocus`, and WebKit's sequential focus does not leave that combination. Chromium and Firefox behave correctly. | WebKit's behaviour changes |
| One WebKit scroll divergence | `cs-carousel` with `loop` ends on the wrong slide in WebKit when paging backwards from the first slide. | The carousel's clone-and-jump approach is revisited |
| One WebKit name divergence | WebKit leaves out the space between a `cs-button`'s text and a `cs-badge` inside it, so a button reading "Requests" with a "30" badge is named "Requests30". Chromium and Firefox name it "Requests 30". A native `<button>` with a badge, or a `cs-button` with a plain `<span>`, keeps the space in WebKit, so the cause is in how the two components combine. | The cause is found and fixed |
| `cs-callout` variants unchecked under SSR | The axe test that renders each `cs-callout` variant returns early under the server-rendered-then-hydrated fixture, so in that mode it passes without checking anything. The axe test on default properties still runs in both modes. Until this closes, the claim above that axe runs in both render modes does not hold for callout variants. | UIUX-119 lands |

## Reporting something

Accessibility problems are bugs, and the most useful ones name the component, the assistive technology or
browser, and what you expected to happen. Open an issue on the
[repository](https://github.com/CruGlobal/cornerstone-design-system/issues).
