---
"@cruglobal/cornerstone-design-system": minor
---

Add `_cmp.toast` — 28 component tokens for the new Toast component.

- **Structure:** `padding/{left-right,top-bottom}`, `gap/{horizontal,actions}`, `radius/default`.
- **`neutral`** style: an inverted surface (`surface`, `text`, `action`) with status carried by `accent-*` and `icon-*` per status, rather than by the surface colour.
- **`status`** style: `surface-*`, `text-*`, `icon-*` for `info`, `success`, `warning`, `danger`.

Two token choices are contrast-driven rather than aesthetic:

- `neutral/accent-*` aliases the new `<status>-on-inverse` tokens. On an inverted surface `<status>/default` fails 3:1 in the dark modes (as low as 1.78:1), while `<status>-container` inverts correctly but is only chroma 13–20, leaving the four statuses visually indistinguishable.
- `neutral/action` aliases `inverse-on-surface`, **not** `inverse-primary`, because `inverse-primary` measures only 3.94:1 against `inverse-surface` in `cru-dark`. The action affordance therefore has to come from weight and underline rather than colour.

Elevation reuses the existing `elevation/3` effect style; no shadow token was added.

Verified across all four modes: minimum 4.79:1, zero unbound values.
