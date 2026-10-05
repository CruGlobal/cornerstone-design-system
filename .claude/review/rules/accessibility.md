# Accessibility — Focus Areas

Cornerstone Components targets WCAG 2.2 AA. `packages/docs/src/content/docs/resources/accessibility.md`
states the target, the floor every component meets, how each claim is verified, and the known gaps; keep
that page true rather than restating it. This is the lane most likely to block a component pull request.
Be a gate on the defect, not on the person: every blocking finding arrives with what would make it pass.

**Trigger this review when the diff touches** `packages/components/src/components/**`,
`packages/components/src/styles/**`, `packages/components/src/internal/**`, `packages/tokens/tokens/sys/**`,
`packages/tokens/tokens/cmp/**`, or any line carrying `aria-`, `role=`, `tabindex`, `:focus`,
`delegatesFocus`, `prefers-reduced-motion`, `live-announcer`, `to.be.accessible`, `ssr-client-hydrated`,
`outline`, `disabled` or a colour value.

---

**The floor every component meets** (from the accessibility page; verify it, do not restate it)

Keyboard reachable and operable with no trap (2.1.1, 2.1.2); correct name, role and value (4.1.2); a
visible focus indicator on every focusable element the component owns (2.4.7); no state by colour alone
(1.4.1); 3:1 for non-text elements identifying the component or a state (1.4.11) and 4.5:1 for text
(1.4.3); `prefers-reduced-motion` respected; no change of context on focus or input the user did not ask
for (3.2.1, 3.2.2).

**Native before ARIA**

`<button>`, `<a href>`, `<input>`, `<dialog>` and `<details>` before a `role`. Look for: a `div` with
`role="button"` and `tabindex`; a `role` added to repair a semantic a native element would have given; an
`aria-*` that restates what the element already exposes.

**Shadow DOM changes three things; check each**

- An `aria-labelledby`, `aria-controls` or `aria-describedby` IDREF resolves only inside its own shadow
  root. Look for a reference across the boundary, which silently resolves to nothing.
- `label` and `hint` are slots with the attribute as fallback. The accessible name comes from the rendered
  element (`aria-labelledby="label"`), never from `this.label`; a slotted label leaves the property empty.
- `delegatesFocus` is for a host that is a single control (`cs-button`, `cs-input`). On a composite with
  roving focus it collapses the focus model; `cs-radio-group` and `cs-color-picker` are the recorded
  exceptions under review, not precedents.

**Focus**

Order follows the flattened DOM; no focusable element is repositioned with `order`, `row-reverse` or grid
placement. Anything that closes or removes itself names its focus-restoration target. A disabled item in a
keyboard-navigable set is skipped, never focused. Look for: `outline: none` without a replacement indicator;
a focus ring drawn with `box-shadow` alone (`outline` and `border` are the forced-colors groundwork); a new
overlay that does not register with `dismissible-stack`, so Escape closes every open overlay at once.

**Contrast is a resolved pair on a named surface**

A ratio is a property of two resolved values on one surface, never of a token, and the same name resolves
differently per brand (`.cs-theme-cru`, FamilyLife) and per scheme (`.cs-light`, `.cs-dark`). Composite
alpha before computing. Text in a disabled control is excused by 1.4.3, and disabled must still not rest on
colour alone. For a fix, prefer a narrow new token over retargeting a widely aliased one, and scope it to
the criterion that motivated it: a value that clears the 3:1 non-text floor does not clear 4.5:1 for text.
Look for: a PR body that states one ratio for a token; a change to a `_sys` colour or a theme file with no
ratios per mode; a status, outline or indicator token whose value resolves to the same `_ref` as the
surface it sits on.

**State, motion, announcements**

Every colour-signalled state (selected, invalid, active tab, checked) also has a non-colour signal.
Animated show and hide respects `prefers-reduced-motion` (the animation registry does; a bespoke keyframe
may not). Changes the user did not cause are announced through `live-announcer` at a moment that is
useful. Never change a control's label and its state signal in the same moment.

**What the tests prove, and what they do not**

- 59 of 70 components assert `to.be.accessible()` on three engines in both render modes; the eleven that do
  not are utilities rendering nothing interactive, by decision. A new interactive component without the
  assertion is a blocker.
- **A test that returns early under the SSR fixture passes while asserting nothing** (`cs-callout`,
  UIUX-119). Flag any new one; it is the exact gap this lane exists to catch.
- axe covers the rendered DOM only: a popup, dialog or menu must be opened before the assertion. A green
  suite is a floor, not a conformance statement; say which half a finding rests on (established from code
  and computation, or needing a human at real assistive technology), and never word a finding so it reads
  as a screen-reader or disabled-user test having been run.

**Target size**

24×24 CSS px (2.5.8) is met only at `l` and `xl` for `cs-checkbox`, `cs-radio` and `cs-switch`; stacked
usage passes through the spacing exception. A new control below 24px at `m` adds to a known gap and says
so.

---

### Accessibility Checklist

- Name, role and value correct, and the name comes from the rendered label: Yes/No/N/A
- Keyboard path complete, focus visible, no trap, restoration target named: Yes/No/N/A
- Every state has a non-colour signal: Yes/No/N/A
- Contrast stated as resolved pairs per brand × scheme, alpha composited: Yes/No/N/A
- Reduced motion respected; announcements timed usefully: Yes/No/N/A
- axe assertion present per fixture type and per variant, with no SSR early return: Yes/No/N/A
- The accessibility page's floor and known-gaps table still true after this change: Yes/No/N/A

---

## Mined from merged PR history

Rules derived from 46 merged PRs (#49–#169). Each carries the PRs it came from.

- **State-bearing tokens ship with their ratios.** A `_cmp` or `_sys` token named `indicator`, `border*`,
  `outline*` or `*-outline` that marks active, selected, checked or disabled ships with its computed
  contrast against its own surface in each of the four `sys/*.json` modes, in the PR description, with 3:1
  as the floor (1.4.11). A border claimed decorative says so in the token's `$description`, so the exemption
  travels with the token and lapses visibly when a selected state is added. The tabs active indicator
  shipped at 1.46:1 behind "0 errors, 0 warnings"; a designer caught it in review.
  <!-- evidence: PR #50, #53, #54 -->
