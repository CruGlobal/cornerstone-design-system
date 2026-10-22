---
title: Accessibility
description: What Cornerstone Components targets, how each claim is checked, and which gaps are known.
contrast: |
  # Every ratio and colour the Known gaps table prints, checked against the shipped themes by
  # scripts/check-contrast.js, which says what each column means. A [label] names the table row whose first cell
  # it is. Each line that prints a value backs one printed copy of it in that row, so pairs that share one copy
  # share one line. Change a number here and in the prose together.
  #
  # theme | scheme | foreground                      | background                  | printed  | precision
  [Single-tone focus indicator]
  cru     | light  | --cs-color-focus                | --cs-color-surface-default  | 1.47:1   | 2dp
  cru     | light  | --cs-color-focus                | --cs-color-surface-lowered  | 1.28:1   | 2dp
  default | light  | --cs-color-focus                | --cs-color-surface-default  | 2.9951:1 | 4dp
  default | light  | --cs-color-focus                | --cs-color-surface-lowered  | 2.67:1   | 2dp
  fl      | dark   | --cs-color-focus                | --cs-color-surface-default  | 2.94:1   | 2dp
  fl      | dark   | --cs-color-focus                | --cs-color-surface-raised   | 2.36:1   | 2dp
  fl      | light  | --cs-color-focus                | --cs-color-surface-default  | 6.37:1   | 2dp
  cru     | dark   | --cs-color-focus                | --cs-color-surface-default  | 12.73:1  | 2dp
  default | dark   | --cs-color-focus                | --cs-color-surface-default  | 6.25:1   | 2dp
  cru, fl | both   | --cs-color-focus                | --cs-color-brand-fill-loud  | 1.00:1   | 2dp
  default | both   | --cs-color-focus                | --cs-color-brand-fill-loud  | 1.53:1   | 2dp
  default | light  | --cs-color-focus in .cs-invalid | --cs-color-surface-default  | 3.0140:1 | 4dp
  default | light  | --cs-color-focus in .cs-valid   | --cs-color-surface-default  | 3.0012:1 | 4dp
  default | light  | --cs-color-focus in .cs-invalid | --cs-color-surface-lowered  | 2.69:1   | 2dp
  default | light  | --cs-color-focus in .cs-valid   | --cs-color-surface-lowered  | 2.68:1   | 2dp
  default | dark   | --cs-color-focus in .cs-{invalid,valid} | --cs-color-surface-default | 2.66:1 | 2dp
  default | dark   | --cs-color-focus in .cs-{invalid,valid} | --cs-color-surface-raised  | 2.39:1 | 2dp
  default | dark   | --cs-color-focus in .cs-{invalid,valid} | --cs-color-surface-lowered | 2.81:1 | 2dp
  cru     | light  | --cs-color-focus                | -                           | #ffd000  |
  default | light  | --cs-color-focus                | -                           | #3e96ff  |
  fl      | both   | --cs-color-focus                | -                           | #006c5b  |
  #
  # Passes the prose states without printing a number.
  cru, default | dark | --cs-color-focus                | --cs-color-surface-{raised,lowered}         | at least 3:1 |
  cru, fl      | both | --cs-color-focus in .cs-invalid | --cs-color-surface-{default,raised,lowered} | at least 3:1 |
  cru, fl      | both | --cs-color-focus in .cs-valid   | --cs-color-surface-{default,raised,lowered} | at least 3:1 |
  fl           | light | --cs-color-focus               | --cs-color-surface-{raised,lowered}         | at least 3:1 |
  fl           | dark  | --cs-color-focus               | --cs-color-surface-lowered                  | at least 3:1 |
  #
  # Controls that draw the shared --cs-focus-ring keep the theme's ring when marked. The ring is computed on the
  # themed root, so a class lower down cannot re-point its colour. The 1.47:1 line backs the cs-checkbox sentence;
  # the colour lines back "keeps the theme's ring" and print nothing.
  cru     | light  | --cs-focus-ring in .cs-invalid  | --cs-color-surface-default  | 1.47:1   | 2dp
  default | both   | --cs-focus-ring in .cs-invalid  | -                           | is #3e96ff |
  default | both   | --cs-focus-ring in .cs-valid    | -                           | is #3e96ff |
  cru     | both   | --cs-focus-ring in .cs-invalid  | -                           | is #ffd000 |
  cru     | both   | --cs-focus-ring in .cs-valid    | -                           | is #ffd000 |
  fl      | both   | --cs-focus-ring in .cs-invalid  | -                           | is #006c5b |
  fl      | both   | --cs-focus-ring in .cs-valid    | -                           | is #006c5b |

  [A state shown by fill alone vanishes in forced colors]
  all     | both   | --cs-color-{neutral,brand,success,warning,danger,information,highlight}-fill-normal | --cs-color-surface-default | 1.25:1 to 1.48:1 | 2dp
---

Cornerstone Components targets **WCAG 2.2 Level AA**. This page states what that means in practice, how each
claim is verified, and what is knowingly not done yet. Accessibility here is a property of how a component is
built, not a pass applied afterwards.

Two things this page does not claim. It does not claim your application is accessible. Accessible building blocks
are necessary but not enough, and page structure, reading order, headings and landmarks belong to the application.
And it does not claim a screen reader was run or that anyone with a disability has tested a component. Verification
has two halves: the code-level checks below, and a person using real assistive technology. Neither is complete. The
automated checks run, but no component has a record of its hand review, and nothing is recorded for the second half.

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
| Single-tone focus indicator | The indicator is one colour, `--cs-color-focus`, drawn 3px wide, and on some surfaces it falls short of the 3:1 that 1.4.11 asks for. In light mode, Cru's `#ffd000` is 1.47:1 on white and 1.28:1 on the lowered surface, and the default theme's `#3e96ff` is 2.9951:1 on white (thresholds do not round up) and 2.67:1 on the lowered surface. In dark mode, FamilyLife's `#006c5b` is 2.94:1 on the default surface and 2.36:1 on the raised one. It passes for FamilyLife in light mode (6.37:1 on white), and for Cru and the default theme in dark mode on the default, raised and lowered surfaces (12.73:1 and 6.25:1 on the default surface). On a `brand-fill-loud` surface the ring is 1.00:1 in Cru and FamilyLife, because it is the same colour as the fill, and 1.53:1 in the default theme, in both modes. Marking a control `.cs-invalid` or `.cs-valid` changes its ring to the danger or success border colour only on these controls: `cs-input`, `cs-textarea`, `cs-select`, `cs-number-input`, `cs-time-input`, `cs-known-date`, `cs-otp-input`, and native text inputs, `<textarea>` and `<select>`. In Cru and FamilyLife that colour passes on the default, raised and lowered surfaces. In the default theme it passes only on white (3.0140:1 and 3.0012:1): it is 2.69:1 and 2.68:1 on the light lowered surface, and in dark mode it is 2.66:1 on the default surface, 2.39:1 on the raised one and 2.81:1 on the lowered one. Every other control keeps the theme's ring when marked, including `cs-checkbox`, `cs-radio`, `cs-switch`, `cs-slider`, `cs-color-picker`, `cs-rating`, `cs-button` and the native checkbox, radio, range, colour input and button, so the pairs above apply to it unchanged: a Cru `cs-checkbox` marked `.cs-invalid` is still 1.47:1 on white in light mode. Two of these failures are recorded. Cru's light-mode ring is a brand trade, written down in `packages/components/tools/palette.mjs`. FamilyLife's dark-mode ring is a known exception in `packages/components/tools/brands/fl.json`, which plans its own fix: a generator change that picks a lighter brand step when the key falls short. The other failing pairs have no such record. No single colour can promise 3:1 against every background, such as an image or a colour from outside Cornerstone. A two-tone indicator that carries its own contrast would fix every pair at once, and it needs a second focus colour that does not exist at any token layer yet. | A two-tone focus indicator ships (UIUX-123) |
| A scoped focus colour reaches only some controls | Each theme builds `--cs-focus-ring` from `--cs-color-focus` on its root and scheme elements, so the colour is fixed there. Setting `--cs-color-focus` lower in the page, as `.cs-invalid`, `.cs-valid` and the subtree example on the [tokens page](/tokens) do, changes the ring only on `cs-input`, `cs-textarea`, `cs-select`, `cs-number-input`, `cs-time-input`, `cs-known-date`, `cs-otp-input`, and native text inputs, `<textarea>` and `<select>`. Components that draw the shared `--cs-focus-ring`, such as `cs-checkbox`, `cs-button` and `cs-tab`, keep the theme's ring. So an app cannot fix a failing focus pair on one surface, such as a `brand-fill-loud` band, by setting `--cs-color-focus` there alone. | Every component's focus ring follows `--cs-color-focus` wherever it is set (UIUX-253) |
| `delegatesFocus` on two composites | `cs-radio-group` and `cs-color-picker` both set `delegatesFocus` and both manage roving focus across children, which the rule above says they should not. | Reviewed per component |
| Forced colors | Not tested in a real high-contrast environment, and no conformance is claimed. Indicators are drawn with `outline` and `border` rather than `box-shadow` alone, which is the groundwork. | Tested against a real high-contrast environment |
| A state shown by fill alone vanishes in forced colors | In Chromium's forced-colors emulation, all five `cs-button` appearances look the same: the fill is dropped and each button gets the same system-colour border and text. So a state shown only by a change of appearance disappears, such as marking the current page by switching one button from `plain` to `filled`. A fill is colour alone (1.4.1), and outside forced colors that change is only 1.25:1 to 1.48:1 against the page, for every variant in every shipped theme, under the 3:1 of 1.4.11. This was emulated in a test browser, not seen in a real high-contrast setup. | `cs-button` gets a current state that is not shown by colour alone (UIUX-213) |
| Per-component hand review unrecorded | The hand review described under "How it is verified" has no written record for any component: nothing says what was checked, by whom, when, or what was found. So the parts only that review covers, such as the tab path through slotted content, the keyboard bindings for each archetype and the focus restoration target, have no evidence behind them yet. The automated checks and the measurements in this table are the evidence that exists. | The per-component review is recorded (UIUX-121) |
| Screen reader verification | No component has a recorded screen reader test, either by the team or by a person who relies on a screen reader. | Screen reader testing is arranged and its results recorded |
| One WebKit keyboard divergence | `cs-otp-input` does not advance focus out of the field on Tab in WebKit. Its field is a visually hidden real `<input>` reached through `delegatesFocus`, and WebKit's sequential focus does not leave that combination. Chromium and Firefox behave correctly. | WebKit's behaviour changes |
| One WebKit scroll divergence | `cs-carousel` with `loop` ends on the wrong slide in WebKit when paging backwards from the first slide. | The carousel's clone-and-jump approach is revisited |
| One WebKit name divergence | WebKit leaves out the space between a `cs-button`'s text and a `cs-badge` inside it, so a button reading "Requests" with a "30" badge is named "Requests30". Chromium and Firefox name it "Requests 30". A native `<button>` with a badge, or a `cs-button` with a plain `<span>`, keeps the space in WebKit, so the cause is in how the two components combine. | The cause is found and fixed |
| Tooltip text does not reach a `cs-*` control | `cs-tooltip` adds its ID to `aria-labelledby` on the element its `for` points to. On a `cs-*` component that element is the host, which has no role, so the label is ignored there and never reaches the real control inside. Copying the attribute onto that control would not help either, because an ID reference cannot cross into a shadow root. In Chromium, Firefox and WebKit, the tooltip text is in neither the name nor the description of `cs-button`, `cs-input`, `cs-checkbox`, `cs-switch`, `cs-select` or `cs-avatar`, whether the tooltip is open or closed. So a `cs-button` whose only label is its tooltip has no accessible name at all, which fails 4.1.2. On a native element the reference does work, but it replaces the visible name instead of adding a description, and only while the tooltip is open: a `<button>` reading "Save" is named by its tooltip text when the tooltip is open and "Save" when it is closed. | `cs-tooltip` describes the real control instead of labelling the host (UIUX-212) |
| `cs-callout` variants unchecked under SSR | The axe test that renders each `cs-callout` variant returns early under the server-rendered-then-hydrated fixture, so in that mode it passes without checking anything. The axe test on default properties still runs in both modes. Until this closes, the claim above that axe runs in both render modes does not hold for callout variants. | The variant test checks each variant under SSR (UIUX-119) |
| axe cannot see ARIA on a `<slot>` | axe builds its own flattened tree and leaves `<slot>` elements out, so a role or name written on a `<slot>` is never checked, and the component's axe test passes without seeing it. Two components do this. `cs-button-group` puts `role="group"` and `aria-label` on a `<slot>`, and `cs-avatar` puts `role="img"` and `aria-label` on the `<slot>` that holds its default icon. Chromium and Firefox give both an empty name, so the group's `label`, and the `label` of an avatar showing its default icon, do nothing there. WebKit names both. | `cs-button-group` (UIUX-204) and `cs-avatar` (UIUX-202) put their role and name on a real element |

## Reporting something

Accessibility problems are bugs, and the most useful ones name the component, the assistive technology or
browser, and what you expected to happen. Open an issue on the
[repository](https://github.com/CruGlobal/cornerstone-design-system/issues).
