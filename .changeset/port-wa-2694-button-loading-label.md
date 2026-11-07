---
'@cruglobal/cornerstone-components': patch
---

Fixed: a loading `cs-button` keeps its label in the accessibility tree and sets `aria-busy`; the label is hidden with `opacity` rather than `visibility`, so slotted content is no longer hidden from assistive technology.
