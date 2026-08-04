---
"@cruglobal/cornerstone-design-system": minor
---

Add `_cmp.alert` — 36 component tokens for the new Alert component, covering both styles across the four status types.

- **Structure:** `padding/{left-right,top-bottom}`, `gap/{horizontal,vertical,actions,content-actions}`, `radius/default`, `border/width`.
- **`filled`** (default style): `surface-*`, `text-*`, `icon-*` for `info`, `success`, `warning`, `danger`.
- **`subtle`**: the same three plus `border-*` per status.

Every token aliases `_sys` only. The subtle style's text and icon tokens alias `on-<status>-container` and its border aliases `<status>-outline`, so this depends on those `_sys` tokens being present.

Verified against WCAG AA in all four modes: minimum 4.79:1 for text and 3:1 for graphics, with zero unbound values. Two accessibility notes worth carrying into implementation:

- Action labels inside an Alert must not inherit `_cmp.button.*.ghost.color.text`, which is `#000000` and measures 4.09:1 on the filled surfaces. Bind them to `_cmp.alert.<style>.text-<status>` instead.
- `subtle/icon-*` deliberately aliases `on-<status>-container` rather than `<status>/default`; the latter measured 1.77:1 for success and 2.11:1 for warning against their own containers.
