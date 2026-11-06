---
'@cruglobal/cornerstone-components': patch
---

Fixed: `cs-dropdown` no longer pulls focus back to its first item when its opening animation ends. Arrow keys pressed while it opens, a focused input inside the menu, native `autofocus`, and focus moved elsewhere by a `cs-show` handler are all kept, and Enter selects the item that actually has focus.
