---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-tooltip` stays open when its `cs-hide` event is cancelled, so `open` matches what is on screen and the next `hide()` works.

Fixed: moving an open `cs-tooltip` in the DOM keeps Escape working and no longer replays its `cs-hide` and `cs-show` events.
