---
"@cruglobal/cornerstone-design-system": patch
---

Fix `cru-dark` font families for body, label and button text.

`_sys.string.font-family.{body,label,button}` aliased `_ref.string.font-family.cru.brand.sans-primary` (Sora, the display face) instead of `sans-secondary` (Inter). `cru-light` had the correct values, so only dark mode was affected — meaning published `cru-dark` rendered all body copy, form labels and button text in a display typeface.

Figma had the correct values throughout; the repo had drifted.
