---
'@cruglobal/cornerstone-components': patch
---

Fixed: Calling `openSubmenu()` or `closeSubmenu()` on `<cs-dropdown-item>` runs the transition once, so a submenu closed that way animates instead of vanishing.
