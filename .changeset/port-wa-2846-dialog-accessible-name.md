---
'@cruglobal/cornerstone-components': minor
---

Fixed: `cs-dialog` and `cs-drawer` take their accessible name from the `label` attribute or slot only when one is present, and from the attribute through `aria-label` when `without-header` hides the heading. Adds `ssr-label`, the SSR hint for a slotted label, beside `ssr-footer`.
