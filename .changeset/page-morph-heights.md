---
'@cruglobal/cornerstone-components': patch
---

Fixed: `<cs-page>` now puts back its measured slot heights, such as `--header-height`, when a DOM morph (Turbo 8, idiomorph, Alpine) resets its `style` attribute.
