---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-tooltip` stays open when its `cs-hide` event is cancelled, so `open` matches what is on screen and the next `hide()` works.
