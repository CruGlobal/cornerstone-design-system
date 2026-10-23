---
'@cruglobal/cornerstone-components': patch
---

Fixed: the `cs-visually-hidden` utility anchors its box at the container's top-left, so a hidden element after a full-height block, such as the toast live region, no longer adds a 1px scrollbar.
