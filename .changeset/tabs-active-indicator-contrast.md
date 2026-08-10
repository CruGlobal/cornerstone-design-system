---
"@cruglobal/cornerstone-design-system": minor
---

Add `_sys.color.primary-strong` and repoint `_cmp.tabs`'s active-tab indicator to it, fixing a WCAG 1.4.11 contrast failure: the indicator's prior color (`primary.default`, brand yellow) sat at 1.46:1 against `action-surface.default` in `cru-light` — well under the 3:1 required for a color-only state indicator. `primary-strong` darkens to `yellow.700` (3.94:1) in `cru-light` only; `cru-dark`, `fl-light`, and `fl-dark` already clear 3:1 with their existing `primary.default` value, so `primary-strong` aliases to the same value there.
