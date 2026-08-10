---
"@cruglobal/cornerstone-design-system": minor
---

Add 28 new `_sys.color` tokens across all four modes.

**Status roles** — these complete the status families so components no longer have to reach for a neighbouring token:

- `on-{information,success,warning,danger}-container` — foreground for content sitting on a `*-container` surface.
- `{information,success,warning,danger}-outline` — border for a tinted container.
- `{information,success,warning,danger}-on-inverse` — status colour for use **on an inverted surface** (`inverse-surface`). Needed because `<status>/default` inverts the wrong way there and drops below 3:1 in the dark modes, while `<status>-container` inverts correctly but is too low-chroma to distinguish hues. Each value is the most chromatic ramp step that still clears 4.5:1 against that mode's `inverse-surface`.
- `success.on-pressed`, `warning.on-pressed` — foreground for the pressed state.

**Structural roles** introduced by the surface restructure (see the accompanying major changeset for the tokens they replace):

- `action-surface.{default,hover,pressed,selected}` — interactive surface states.
- `surface-bright`, `surface-dim`, `surface-variant`, `background` — flattened surface roles.
- `inverse-surface`, `inverse-surface-dim`, `inverse-on-surface`, `inverse-on-surface-variant`.
- `disabled.default` — single disabled colour replacing the per-family variants.
- `outline.dark`.
