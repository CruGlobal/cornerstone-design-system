---
status: accepted
---

# Component custom properties are named after their component and read with a fallback

Web Awesome gave each component unprefixed custom properties (`--spacing`, `--size`, `--width`) and set
their defaults on `:host`, calling them "scoped to the component, not global." They are not scoped: custom
properties inherit, so a host's value flows into everything slotted inside it. Flightdeck's port hit this
when Tailwind v4's `--spacing` unit picked up `cs-card`'s value and `p-4` came out at 96px instead of 16px
(#182). So before 1.0.0, every component custom property is renamed, and components stop setting defaults
on their host.

## The rule

1. **Named after the component.** A component property is `--cs-<component>-<property>`, such as
   `--cs-card-spacing` or `--cs-dialog-width`. A component's child parts read their parent's name:
   `cs-carousel-item` reads `--cs-carousel-aspect-ratio`.
2. **A short list of shared properties keeps one name.** These do the same job on every component that reads
   them:

   | Shared property                                                | Read by                              |
   | -------------------------------------------------------------- | ------------------------------------ |
   | `--cs-show-duration`, `--cs-hide-duration`                     | components that animate in and out   |
   | `--cs-track-color`, `--cs-track-width`, `--cs-indicator-color` | progress bar, progress ring, spinner |
   | `--cs-checked-icon-color`, `--cs-checked-icon-scale`           | checkbox, radio                      |
   | `--cs-backdrop-filter`                                         | dialog, drawer                       |

   A name joins the list only if all three are true: it does the same job everywhere it appears, it is still
   right when it flows from a parent into a child component, and it does not start with a component's tag
   name (`--cs-divider-width` would read as `cs-divider`'s own).

3. **Read with a fallback, set nothing on the host.** A component reads
   `var(--cs-card-spacing, var(--cs-space-l))`, so a consumer can set the value on the page, a theme class, a
   section, or one element. This is how `--cs-tooltip-*` already worked.
4. **Each default is written in one place.** It goes in the component's fallback when one component reads it
   or each reader needs its own default (the durations: fast for dropdown, normal for drawer). It goes in the
   theme when several components share one value (`--cs-form-control-*`, `--cs-panel-*`). A theme sets a
   component property only to look different for a brand.
5. **Clean break.** Every rename ships in one minor release before 1.0.0, with no fallback to the old names.
6. **Checked, not just reviewed.** A test reads the custom elements manifest and fails on a property that
   breaks rule 1 or 2, or that gets a default on `:host`.

## Considered options

- **Keep `--spacing` and the Tailwind workaround.** Every Tailwind app would carry a build script forever,
  and the workaround cannot reach a card inside another component's shadow root.
- **Stop `--spacing` from inheriting with `@property`.** Browsers ignore `@property` inside shadow roots, and
  registering it page-wide would break Tailwind's own `--spacing`.
- **Keep defaults on `:host` with new names.** It fixes the clash but still blocks setting a value on a
  section, a theme class or `:root`, which every other theme value allows.
- **A bare `--cs-` prefix** (`--cs-spacing`, `--cs-size`). Same spelling across components with different
  jobs: `--width` is a dialog's width but a divider's line thickness.
- **Component names with no sharing at all.** Loses the sharing that does real work, such as one duration
  name across 11 components, and a dropdown's submenu following its dropdown's speed.
- **A fallback to the old names during a deprecation period.** In a Tailwind app, `var(--spacing)` as a
  fallback reads Tailwind's `0.25rem`, which is the bug being fixed.

## Consequences

- This overturns the rule inherited from Web Awesome in `contributing.md` and `customizing.md` ("do not use
  the `--cs-` prefix"; "scoped to the component, not global"), and the `--color` example in
  `docs/standards/api-surface.md`. Those are rewritten with the rename.
- A value set on an outer component reaches the same component nested inside it. Setting the property to
  `initial` on the inner one sends it back to its default.
- Script that reads one of these values with `getComputedStyle` (as `cs-details` does for its show duration)
  must apply the same fallback, since the host no longer sets one.
- Theme-set values are still reset inside a `cs-light`, `cs-dark` or `cs-invert` element (UIUX-195).
  Component properties are not affected, because the theme does not set them.
