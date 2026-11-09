---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-tooltip` stays open when its `cs-hide` event is cancelled, so `open` matches what is on screen and the next `hide()` works, and moving an open tooltip in the DOM no longer replays its `cs-hide` and `cs-show` events.
